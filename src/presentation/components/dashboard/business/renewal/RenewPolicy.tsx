import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { CheckCircle, DownloadSimple, Link, Info } from 'phosphor-react-native';
import {
  Badge,
  BottomSheet,
  Button,
  Modal,
  Toast,
  ToastGlobal,
  colors,
  spacing,
  typography,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';
import { ProposerDetailsStep, type ProposerData } from '../proposal/ProposerDetailsStep';
import { KycDetailsStep, type KycData } from '../proposal/KycDetailsStep';
import { PaymentStep, type PaymentData } from '../proposal/PaymentStep';
import { ShareQuoteModal } from '../motor/ShareQuoteModal';
import { ProceedStep } from './ProceedStep';
import { PolicyDetailsStep } from './PolicyDetailsStep';
import { RenewalAddOnsStep } from './RenewalAddOnsStep';
import { RenewalMemberStep } from './RenewalMemberStep';
import { RenewalNomineeStep } from './RenewalNomineeStep';
import { PreviousPolicyView } from './PreviousPolicyView';
import { RenewalSummary } from './RenewalSummary';
import { ConfirmChangesSheet, type ConfirmTarget } from './ConfirmChangesSheet';
import { RenewalPremiumCard } from './RenewalPremiumCard';
import { WizardStepper } from '../WizardStepper';
import { useBottomActionInset } from '../../../../hooks/useBottomActionInset';
import type { Renewal } from '../businessData';
import {
  ADDON_UNIT_PREMIUM,
  ELIGIBLE_ADDON_POLICIES,
  FLOATER_MAX_MEMBERS,
  INDIVIDUAL_MAX_MEMBERS,
  INITIAL_RENEWAL_MEMBERS,
  INITIAL_RENEWAL_MEMBERS_FLOATER,
  ORIGINAL_POLICY_PLAN,
  RELATIONSHIP_LABELS,
  RENEWAL_LOCKED_ADDON_IDS,
  STEP_LABELS,
  applyFloaterCap,
  buildInitialMemberData,
  buildInitialNomineeData,
  formatDobLabel,
  getExpiryInfo,
  type EditOption,
  type PaymentLinkMethod,
  type ProceedOption,
  type RenewalMemberData,
  type RenewalMemberEntry,
  type RenewalNomineeData,
  type RenewalPlanType,
  type RenewalStepKey,
  type SubPlanValue,
} from './renewalData';

interface RenewPolicyProps {
  record: Renewal;
  /**
   * `view` opens the read-only renewal summary first (the Renewals list "View
   * Policy" action); `flow` starts the edit wizard at the proceed/edit choice.
   */
  mode?: 'view' | 'flow';
  onClose: () => void;
  /**
   * Lends the host screen this wizard's step-back. The footer carries no Back
   * button — the screen's top bar is the only back control — so it has to walk
   * the steps here rather than dropping straight out of the flow.
   */
  onRegisterBack?: (handler: (() => void) | null) => void;
  /** Fired when the read-only view hands over to the edit flow, so the host can
   *  retitle the screen from "Policy Details" to "Renew Policy". */
  onRenewFlowStart?: () => void;
}

/**
 * Steps that show the premium card: the two that can change the figure (plan
 * and add-ons) plus the one that collects it. On the detail-capture steps —
 * proposer, member, nominee, previous policy, KYC — the premium can't move, so
 * repeating it there is noise.
 */
const PREMIUM_CARD_STEPS: RenewalStepKey[] = ['policy', 'addons', 'payment'];

const emptyProposer = (customerName: string): ProposerData => ({
  proposerName: customerName,
  proposerDOB: new Date('1985-09-12'),
  annualIncome: '1500000',
  contactNo: '8976345600',
  emailId: 'rakeshkumar@email.com',
  address: 'Flat no 005, Sobha Heights',
  pincode: '203104',
  city: 'New Delhi',
  area: 'Kailash',
  state: 'New Delhi',
  gender: 'male',
  nationality: 'indian',
  maritalStatus: 'married',
  occupation: 'salaried',
});

const emptyKyc: KycData = {
  pan: '',
  ckyc: '',
  aadhaar: '',
  phone: '',
  email: '',
  verified: false,
  kycMethod: '',
  kycDone: false,
  confirmMethod: '',
};

const emptyPayment: PaymentData = {
  mode: '',
  email: 'rakeshjain@gmail.com',
  receiptNumber: '',
  accountNumber: '',
  partyId: '',
  ifsc: '',
  branch: '',
  bank: '',
};

/**
 * Renew Policy — the mobile port of the web renewal flow.
 *
 * Three paths branch off the first step: Quick Renewal (send a payment link and
 * stop), Renewal and Migration (each with their own set of edit options, which
 * in turn decide which steps the wizard walks through).
 *
 * Mobile deviations from the web screen, all forced by the narrower viewport:
 *   • The sticky right-hand premium panel becomes the collapsible
 *     `RenewalPremiumCard`, shown only on the steps in `PREMIUM_CARD_STEPS`.
 *   • The 10-step stepper scrolls horizontally instead of compressing.
 *   • Web's three-button footer (Cancel / Back / Proceed) collapses to
 *     Back / Proceed — Back on the first step exits the flow, which is what
 *     web's Cancel did.
 *   • Modals are `BottomSheet`s, matching the rest of this app.
 */
export const RenewPolicy: React.FC<RenewPolicyProps> = ({ record, mode = 'flow', onClose, onRegisterBack, onRenewFlowStart }) => {
  // The renewal flow hides the bottom nav, so its footers are the screen's
  // bottom edge and have to clear the home indicator themselves.
  const footerPaddingBottom = useBottomActionInset();

  /* ---------------------------- flow position ---------------------------- */
  const [currentStep, setCurrentStep] = useState(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState(1);
  const [renewClicked, setRenewClicked] = useState(false);
  const isViewMode = mode === 'view' && !renewClicked;

  const [proceedOption, setProceedOption] = useState<ProceedOption | null>(null);
  const [editOption, setEditOption] = useState<EditOption | null>(null);
  const [paymentLinkMethod, setPaymentLinkMethod] = useState<PaymentLinkMethod | ''>('');

  /* ---------------------------- policy details --------------------------- */
  const [policyPlan, setPolicyPlan] = useState(ORIGINAL_POLICY_PLAN);
  const policyPlanChanged = policyPlan !== ORIGINAL_POLICY_PLAN;

  // The plan type comes from the policy being renewed — its product label
  // carries "Floater" / "Individual".
  const currentPolicyPlanType: RenewalPlanType = (record.product || '').toLowerCase().includes('floater')
    ? 'floater'
    : 'individual';
  const [planType, setPlanType] = useState<RenewalPlanType>(currentPolicyPlanType);
  const [startDate, setStartDate] = useState<Date | null>(new Date('2026-05-19'));
  const [endDate, setEndDate] = useState<Date | null>(new Date('2029-05-19'));
  const [tenure, setTenure] = useState('3');
  const [subPlan, setSubPlan] = useState<SubPlanValue | null>('gold');
  const [selectedEligible, setSelectedEligible] = useState<string[]>([]);

  /* -------------------------------- add-ons ------------------------------ */
  const [keepSameForAll, setKeepSameForAll] = useState(false);
  const [memberChoice, setMemberChoice] = useState<Record<string, 'yes' | 'no' | ''>>({});
  const [memberAddOns, setMemberAddOns] = useState<Record<string, string[]>>({});
  const [floaterAddOns, setFloaterAddOns] = useState<string[]>([]);

  /* ------------------------------- proposer ------------------------------ */
  const [proposer, setProposer] = useState<ProposerData>(() => emptyProposer(record.customer));
  const [showProposerBanner, setShowProposerBanner] = useState(true);

  /* -------------------------------- members ------------------------------ */
  const [renewalMembers, setRenewalMembers] = useState<RenewalMemberEntry[]>(() =>
    currentPolicyPlanType === 'floater' ? INITIAL_RENEWAL_MEMBERS_FLOATER : INITIAL_RENEWAL_MEMBERS,
  );
  const [memberData, setMemberData] = useState<Record<string, RenewalMemberData>>(buildInitialMemberData);
  const [showMemberBanner, setShowMemberBanner] = useState(true);
  const [memberLimitWarning, setMemberLimitWarning] = useState<RenewalPlanType | null>(null);
  const [showAddonsBanner, setShowAddonsBanner] = useState(true);
  const [addedMemberName, setAddedMemberName] = useState<string | null>(null);
  // Lets a step bring newly-revealed content into view (see ProceedStep).
  const scrollRef = useRef<ScrollView>(null);
  const newMemberIdRef = useRef(0);

  /* -------------------------------- nominee ------------------------------ */
  const [nomineeData, setNomineeData] = useState<Record<string, RenewalNomineeData>>(buildInitialNomineeData);
  const [nomineeKeepSameForAll, setNomineeKeepSameForAll] = useState(false);
  const [showNomineeBanner, setShowNomineeBanner] = useState(true);

  /* ---------------------------- kyc and payment -------------------------- */
  const [kyc, setKyc] = useState<KycData>(emptyKyc);
  const [payment, setPayment] = useState<PaymentData>(emptyPayment);

  /* --------------------------- sheets and toasts ------------------------- */
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);
  const [confirmPolicyOpen, setConfirmPolicyOpen] = useState(false);
  const [paymentLinkSentOpen, setPaymentLinkSentOpen] = useState(false);
  const [paymentLinkGeneratedOpen, setPaymentLinkGeneratedOpen] = useState(false);
  const [paymentSuccessOpen, setPaymentSuccessOpen] = useState(false);
  const [shareNoticeOpen, setShareNoticeOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const memberToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
      if (memberToastTimer.current) {
        clearTimeout(memberToastTimer.current);
      }
    },
    [],
  );

  const flashToast = (message: string) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    setToastMessage(message);
    toastTimer.current = setTimeout(() => setToastMessage(null), 3000);
  };

  /* --------------------------- derived member sets ----------------------- */
  const activeMembers = useMemo(() => renewalMembers.filter((m) => m.status !== 'removed'), [renewalMembers]);
  const removedMembers = useMemo(() => renewalMembers.filter((m) => m.status === 'removed'), [renewalMembers]);
  const newMembers = useMemo(() => renewalMembers.filter((m) => m.status === 'new'), [renewalMembers]);
  const activeOriginalMembers = useMemo(() => renewalMembers.filter((m) => m.status === 'active'), [renewalMembers]);

  const memberCap = planType === 'floater' ? FLOATER_MAX_MEMBERS : INDIVIDUAL_MAX_MEMBERS;
  const isMemberCapReached = activeMembers.length >= memberCap;

  /* ------------------------------ member edits --------------------------- */
  const removeMember = (id: string) => {
    setRenewalMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'removed' } : m)));
    setMemberLimitWarning(null);
  };

  const addBackMember = (id: string) =>
    setRenewalMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'active', autoRemoved: false } : m)),
    );

  // "Add New" inserts an empty, fully-editable draft directly below the proposer
  // (which always stays first). Its identity row stays visible until saved.
  const addNewMember = () => {
    const activeCount = renewalMembers.filter((m) => m.status !== 'removed').length;
    if (activeCount >= memberCap) {
      setMemberLimitWarning(planType);
      return;
    }
    setMemberLimitWarning(null);

    // Floater plans share one sum insured, so a new member inherits it.
    const inheritedSumInsured =
      planType === 'floater'
        ? renewalMembers
            .filter((m) => m.status !== 'removed')
            .map((m) => (memberData[m.id]?.sumInsured ?? '').trim())
            .find(Boolean) ?? ''
        : '';

    newMemberIdRef.current += 1;
    const id = `rm-new-${newMemberIdRef.current}`;
    setRenewalMembers((prev) => {
      const entry: RenewalMemberEntry = { id, label: 'New Member', type: 'New', dobLabel: '', status: 'new' };
      const proposerIndex = prev.findIndex((m) => m.type === 'Proposer');
      if (proposerIndex === -1) {
        return [entry, ...prev];
      }
      const next = [...prev];
      next.splice(proposerIndex + 1, 0, entry);
      return next;
    });
    setMemberData((prev) => ({
      ...prev,
      [id]: {
        name: '',
        relationship: '',
        dob: null,
        height: '',
        weight: '',
        sumInsured: inheritedSumInsured,
        hasPed: '',
      },
    }));
  };

  const saveNewMember = (id: string) => {
    const data = memberData[id];
    const name = (data?.name ?? '').trim();
    const relationship = data?.relationship ?? '';
    // Badge the chosen relationship; fall back to a capitalised raw value so it
    // is never left reading "New" once a relationship has been picked.
    const typeLabel =
      RELATIONSHIP_LABELS[relationship] ??
      (relationship ? relationship.charAt(0).toUpperCase() + relationship.slice(1) : 'New');

    setRenewalMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, label: name || 'New Member', type: typeLabel, dobLabel: formatDobLabel(data?.dob ?? null), saved: true }
          : m,
      ),
    );

    if (memberToastTimer.current) {
      clearTimeout(memberToastTimer.current);
    }
    setAddedMemberName(name || 'New member');
    memberToastTimer.current = setTimeout(() => setAddedMemberName(null), 4000);
  };

  const cancelNewMember = (id: string) => {
    setRenewalMembers((prev) => prev.filter((m) => m.id !== id));
    setMemberData((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Switching to floater auto-removes everyone past the 6th; switching back to
  // individual restores exactly those auto-removed members.
  const changePlanType = (value: RenewalPlanType) => {
    setPlanType(value);
    setMemberLimitWarning(null);
    setRenewalMembers((prev) =>
      value === 'floater'
        ? applyFloaterCap(prev)
        : prev.map((m) => (m.autoRemoved ? { ...m, status: 'active' as const, autoRemoved: false } : m)),
    );
  };

  const updateMemberData = (
    id: string,
    field: keyof RenewalMemberData,
    value: RenewalMemberData[keyof RenewalMemberData],
  ) => {
    // Floater plans drive every member's sum insured off the proposer's, so
    // editing the proposer's value mirrors it across all active members.
    const isProposerSumInsured =
      field === 'sumInsured' && planType === 'floater' && renewalMembers.find((m) => m.id === id)?.type === 'Proposer';
    if (isProposerSumInsured) {
      setMemberData((prev) => {
        const next = { ...prev };
        renewalMembers.forEach((m) => {
          if (m.status !== 'removed') {
            next[m.id] = { ...next[m.id], sumInsured: value as string };
          }
        });
        return next;
      });
      return;
    }
    // Answering "No" to PEDs clears any stored conditions in the same update, so
    // the card resets and the modal reopens empty.
    if (field === 'hasPed' && value === 'no') {
      setMemberData((prev) => ({
        ...prev,
        [id]: { ...prev[id], hasPed: 'no', peds: { selectedPeds: [], details: {}, customConditions: [] } },
      }));
      return;
    }
    setMemberData((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  /* ------------------------------ nominee edits -------------------------- */
  const updateNomineeData = (
    memberId: string,
    field: keyof RenewalNomineeData,
    value: RenewalNomineeData[keyof RenewalNomineeData],
  ) => {
    setNomineeData((prev) => {
      // While "keep same for all" is on, edits apply to every member's nominee.
      if (nomineeKeepSameForAll) {
        const next = { ...prev };
        activeMembers.forEach((m) => {
          next[m.id] = { ...prev[m.id], [field]: value };
        });
        return next;
      }
      return { ...prev, [memberId]: { ...prev[memberId], [field]: value } };
    });
  };

  // Turning "keep same for all" on copies the first member's nominee to all.
  const toggleNomineeKeepSame = (value: boolean) => {
    setNomineeKeepSameForAll(value);
    if (!value) {
      return;
    }
    setNomineeData((prev) => {
      const master = prev[activeMembers[0]?.id];
      if (!master) {
        return prev;
      }
      const synced = { ...prev };
      activeMembers.forEach((m) => {
        synced[m.id] = { ...master };
      });
      return synced;
    });
  };

  /* ------------------------------ add-on edits --------------------------- */
  // Renewals lock the mandatory add-ons carried over from the previous policy
  // across the member-details / add-ons / entire-policy flows. Migration keeps
  // every add-on selectable.
  const isLockedAddonFlow =
    proceedOption === 'renewal' &&
    (editOption === 'member-details' || editOption === 'addons-subplan' || editOption === 'entire-policy');
  const isAddonLocked = (addonId: string) => isLockedAddonFlow && RENEWAL_LOCKED_ADDON_IDS.includes(addonId);

  // Entering a locked-add-on flow drops any restricted add-on already picked, so
  // the badge counts and premium can't keep counting a now-mandatory line twice.
  useEffect(() => {
    if (!isLockedAddonFlow) {
      return;
    }
    setFloaterAddOns((prev) => prev.filter((id) => !RENEWAL_LOCKED_ADDON_IDS.includes(id)));
    setMemberAddOns((prev) => {
      const next: Record<string, string[]> = {};
      Object.entries(prev).forEach(([memberId, ids]) => {
        next[memberId] = ids.filter((id) => !RENEWAL_LOCKED_ADDON_IDS.includes(id));
      });
      return next;
    });
  }, [isLockedAddonFlow]);

  const toggleEligible = (id: string) =>
    setSelectedEligible((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleFloaterAddOn = (addonId: string) => {
    if (isAddonLocked(addonId)) {
      return;
    }
    setFloaterAddOns((prev) => (prev.includes(addonId) ? prev.filter((x) => x !== addonId) : [...prev, addonId]));
  };

  const toggleMemberAddOn = (memberId: string, addonId: string) => {
    if (isAddonLocked(addonId)) {
      return;
    }
    setMemberAddOns((prev) => {
      const current = prev[memberId] ?? [];
      const updated = current.includes(addonId) ? current.filter((x) => x !== addonId) : [...current, addonId];
      // While "same for all" is on, mirror the change to every member.
      if (keepSameForAll) {
        const next: Record<string, string[]> = { ...prev };
        activeMembers.forEach((m) => {
          next[m.id] = [...updated];
        });
        return next;
      }
      return { ...prev, [memberId]: updated };
    });
  };

  // "Keep Add-ons same for all": on enable, every member adopts the first
  // member's selection and yes/no answer so they all match.
  const toggleKeepSameForAll = () => {
    setKeepSameForAll((prev) => {
      const next = !prev;
      if (next) {
        setMemberAddOns((cur) => {
          const master = activeMembers[0] ? cur[activeMembers[0].id] ?? [] : [];
          const synced: Record<string, string[]> = { ...cur };
          activeMembers.forEach((m) => {
            synced[m.id] = [...master];
          });
          return synced;
        });
        setMemberChoice((cur) => {
          const master = activeMembers[0] ? cur[activeMembers[0].id] ?? '' : '';
          const synced: Record<string, 'yes' | 'no' | ''> = { ...cur };
          activeMembers.forEach((m) => {
            synced[m.id] = master;
          });
          return synced;
        });
      }
      return next;
    });
  };

  const handleMemberChoice = (memberId: string, value: 'yes' | 'no') => {
    setMemberChoice((prev) => {
      if (keepSameForAll) {
        const next: Record<string, 'yes' | 'no' | ''> = { ...prev };
        activeMembers.forEach((m) => {
          next[m.id] = value;
        });
        return next;
      }
      return { ...prev, [memberId]: value };
    });
    // Choosing "No" drops any previous selections so the badge count and premium
    // stop counting hidden add-ons.
    if (value === 'no') {
      setMemberAddOns((prev) => {
        const next: Record<string, string[]> = { ...prev };
        if (keepSameForAll) {
          activeMembers.forEach((m) => {
            next[m.id] = [];
          });
        } else {
          next[memberId] = [];
        }
        return next;
      });
    }
  };

  const addOnTotalCount =
    planType === 'floater'
      ? floaterAddOns.length
      : Object.values(memberAddOns).reduce((sum, ids) => sum + ids.length, 0);

  const selectedEligiblePolicies = ELIGIBLE_ADDON_POLICIES.filter((p) => selectedEligible.includes(p.id)).map((p) => ({
    title: p.title,
    premium: p.premium,
  }));

  /* -------------------------------- steps -------------------------------- */
  const stepKeys: RenewalStepKey[] = useMemo(() => {
    if (proceedOption === 'renewal') {
      switch (editOption) {
        case 'member-details':
          return ['preview', 'member', 'addons', 'nominee', 'summary', 'payment'];
        case 'nominee-details':
          return ['preview', 'nominee', 'summary', 'payment'];
        case 'proposer-details':
          return ['preview', 'proposer', 'summary', 'payment'];
        case 'addons-subplan':
          return ['preview', 'addons', 'summary', 'payment'];
        case 'entire-policy':
          return [
            'preview',
            'policy',
            'proposer',
            'member',
            'addons',
            'nominee',
            'previous-policy',
            'kyc',
            'summary',
            'payment',
          ];
        default:
          return ['preview', 'summary', 'payment'];
      }
    }
    // Migration (and the initial state before a path is chosen) keeps the
    // original flow: always policy details and add-ons, with the other steps
    // switched on by the chosen edit option.
    return [
      'preview',
      'policy',
      ...((editOption === 'proposer-details' || editOption === 'entire-policy' ? ['proposer'] : []) as RenewalStepKey[]),
      ...((editOption === 'member-details' || editOption === 'plan-type' || editOption === 'entire-policy'
        ? ['member']
        : []) as RenewalStepKey[]),
      'addons',
      ...((editOption === 'nominee-details' ||
      editOption === 'member-details' ||
      editOption === 'plan-type' ||
      editOption === 'entire-policy'
        ? ['nominee']
        : []) as RenewalStepKey[]),
      ...((editOption === 'entire-policy' ? ['previous-policy', 'kyc'] : []) as RenewalStepKey[]),
      'summary',
      'payment',
    ];
  }, [proceedOption, editOption]);

  const currentKey = stepKeys[currentStep - 1];
  const totalSteps = stepKeys.length;

  // Tracks the furthest step reached so the stepper can mark earlier steps
  // completed and allow navigating back to them.
  useEffect(() => {
    setMaxVisitedStep((prev) => Math.max(prev, currentStep));
  }, [currentStep]);

  const resetStepperProgress = () => {
    setCurrentStep(1);
    setMaxVisitedStep(1);
  };

  // The proceed/edit choice and the payment step sit outside the stepper.
  const stepperSteps = useMemo(
    () =>
      stepKeys
        .filter((key) => key !== 'preview' && key !== 'payment')
        .map((key) => ({ key, label: STEP_LABELS[key], actualStep: stepKeys.indexOf(key) + 1 })),
    [stepKeys],
  );

  // Single-step edit flows have nothing meaningful to show in a stepper.
  const showStepper =
    currentKey !== 'preview' &&
    currentKey !== 'payment' &&
    editOption !== 'policy-plan' &&
    editOption !== 'addons-subplan' &&
    !(proceedOption === 'renewal' && editOption === 'nominee-details') &&
    !(proceedOption === 'renewal' && editOption === 'proposer-details');

  /* ------------------------------ validation ----------------------------- */
  const isPreviewValid =
    proceedOption !== null && (proceedOption === 'quick' ? paymentLinkMethod !== '' : editOption !== null);

  const isPolicyValid = subPlan !== null;

  // Web only validated the proposer's row here; every member on the policy has
  // to be complete for the renewal to price, so all active members are checked.
  const isMemberValid = activeMembers.every((m) => {
    const data = memberData[m.id];
    return Boolean(data?.height && data?.weight && data?.sumInsured && data?.hasPed);
  });

  // A draft member still being filled in blocks Proceed — saving or cancelling
  // it re-enables the button.
  const hasUnsavedNewMember = renewalMembers.some((m) => m.status === 'new' && !m.saved);

  const isProposerValid = Boolean(
    proposer.proposerName.trim() &&
      proposer.proposerDOB &&
      /^\d+$/.test(proposer.annualIncome) &&
      /^\d{10}$/.test(proposer.contactNo) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(proposer.emailId) &&
      proposer.address.trim() &&
      /^\d{6}$/.test(proposer.pincode) &&
      proposer.area.trim() &&
      proposer.gender &&
      proposer.nationality &&
      proposer.maritalStatus &&
      proposer.occupation,
  );

  const isNomineeValid = activeMembers.every((m) => {
    const nominee = nomineeData[m.id];
    return Boolean(nominee?.name?.trim() && nominee?.relationship && nominee?.dob);
  });

  const isKycValid = kyc.kycDone && kyc.verified;

  const isPaymentValid = (() => {
    switch (payment.mode) {
      case 'online-link':
        return Boolean(payment.email.trim());
      case 'agent-float':
      case 'customer-float':
        return Boolean(payment.partyId.trim());
      case 'voucher':
        return Boolean(payment.receiptNumber.trim());
      case 'cheque':
        return Boolean(
          payment.receiptNumber.trim() &&
            payment.accountNumber.trim() &&
            payment.ifsc.trim() &&
            payment.branch.trim() &&
            payment.bank.trim(),
        );
      default:
        return false;
    }
  })();

  const isProceedDisabled =
    (currentKey === 'preview' && !isPreviewValid) ||
    (currentKey === 'policy' && !isPolicyValid) ||
    (currentKey === 'proposer' && !isProposerValid) ||
    (currentKey === 'member' && (!isMemberValid || hasUnsavedNewMember)) ||
    (currentKey === 'nominee' && !isNomineeValid) ||
    (currentKey === 'kyc' && !isKycValid) ||
    (currentKey === 'payment' && !isPaymentValid);

  /* ------------------------------ navigation ----------------------------- */
  const goNext = () => setCurrentStep((s) => Math.min(s + 1, totalSteps));

  const handleProceed = () => {
    // Quick Renewal never leaves the first step — it just sends the link.
    if (currentKey === 'preview' && proceedOption === 'quick') {
      if (paymentLinkMethod === 'link') {
        setPaymentLinkGeneratedOpen(true);
      } else if (paymentLinkMethod) {
        setPaymentLinkSentOpen(true);
      }
      return;
    }

    if (currentStep === totalSteps) {
      if (payment.mode === 'online-link') {
        setPaymentLinkSentOpen(true);
      } else if (isPaymentValid) {
        setPaymentSuccessOpen(true);
      }
      return;
    }

    // Leaving a dedicated single-section edit step asks for confirmation first.
    // Broader flows (entire-policy, plan-type) just advance.
    if (currentKey === 'proposer' && editOption === 'proposer-details') {
      setConfirmTarget('proposer');
      return;
    }
    if (currentKey === 'member') {
      // The dedicated member flow and the plan-type flow (which can drop members
      // when converting to floater) always confirm. Entire-policy confirms only
      // when the member list actually changed.
      const memberListChanged = newMembers.length > 0 || removedMembers.length > 0;
      if (
        editOption === 'member-details' ||
        editOption === 'plan-type' ||
        (editOption === 'entire-policy' && memberListChanged)
      ) {
        setConfirmTarget('member');
        return;
      }
    }
    if (currentKey === 'nominee' && editOption === 'nominee-details') {
      setConfirmTarget('nominee');
      return;
    }
    if (
      currentKey === 'summary' &&
      editOption === 'entire-policy' &&
      (proceedOption === 'renewal' || proceedOption === 'migration')
    ) {
      setConfirmPolicyOpen(true);
      return;
    }

    goNext();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      return;
    }
    resetStepperProgress();
    onClose();
  };

  // The wizard footer carries no Back button, so the screen's top bar borrows
  // this one. Held in a ref and registered once, so advancing a step doesn't
  // churn the host's handler. The read-only view registers nothing — its top
  // back should leave for the list, not walk steps the agent never entered.
  const backRef = useRef(handleBack);
  backRef.current = handleBack;

  useEffect(() => {
    if (isViewMode) {
      return;
    }
    onRegisterBack?.(() => backRef.current());
    return () => onRegisterBack?.(null);
  }, [isViewMode, onRegisterBack]);

  /** Shared by every "Issue another policy" action — resets and leaves the flow. */
  const handleIssueAnother = () => {
    setPaymentLinkSentOpen(false);
    setPaymentSuccessOpen(false);
    setPaymentLinkGeneratedOpen(false);
    setProceedOption(null);
    setEditOption(null);
    setPaymentLinkMethod('');
    resetStepperProgress();
    onClose();
  };

  /* -------------------------------- banners ------------------------------ */
  const addOnsBanner = (() => {
    if (!showAddonsBanner) {
      return null;
    }
    const close = () => setShowAddonsBanner(false);

    if (proceedOption === 'migration') {
      if (editOption === 'member-details') {
        return (
          <Toast
            variant="info"
            title="Member list updated."
            message="Please select add-ons for all members before proceeding, as previous ones may no longer apply."
            onClose={close}
          />
        );
      }
      if (editOption === 'plan-type') {
        return (
          <Toast
            variant="info"
            title="Please select add-ons again."
            message="The policy plan and plan type has changed, so previous add-ons may no longer apply."
            onClose={close}
          />
        );
      }
      return (
        <Toast
          variant="info"
          title="Select add-ons again."
          message="The policy plan has changed, so the previous add-ons may no longer apply."
          onClose={close}
        />
      );
    }

    if (proceedOption === 'renewal') {
      if (editOption === 'member-details') {
        return (
          <Toast
            variant="info"
            title="Member list updated."
            message="Please review and select add-ons for all members before proceeding. Mandatory add-ons from the previous policy cannot be removed."
            onClose={close}
          />
        );
      }
      if (editOption === 'addons-subplan' || editOption === 'entire-policy') {
        return (
          <Toast
            variant="info"
            title="Review and update add-ons."
            message="Mandatory add-ons from the previous policy cannot be removed."
            onClose={close}
          />
        );
      }
    }
    return null;
  })();

  const memberBanner = (() => {
    if (!showMemberBanner && !memberLimitWarning) {
      return null;
    }
    const planTypeChanged = planType !== currentPolicyPlanType;
    const planTypeChangeMessage =
      planType === 'individual'
        ? 'Plan type is changed from floater to individual. Individual plan can have a maximum of 30 members.'
        : 'Plan type is changed from individual to floater. Since floater plan can only have a maximum of 6 members, any extra members are automatically removed.';

    return (
      <View style={styles.bannerStack}>
        {showMemberBanner ? (
          planTypeChanged ? (
            <Toast
              variant="info"
              title="Policy plan and plan type has been changed."
              message={planTypeChangeMessage}
              onClose={() => setShowMemberBanner(false)}
            />
          ) : (
            <Toast
              variant="info"
              // Renewals drop the "Policy plan has been changed" title — nothing
              // about the plan changed, only the member list can.
              title={proceedOption === 'renewal' ? 'Update the member list' : 'Policy plan has been changed.'}
              message="You can add new members, or remove existing ones with the delete icon."
              onClose={() => setShowMemberBanner(false)}
            />
          )
        ) : null}
        {memberLimitWarning ? (
          <Toast
            variant="warning"
            title="Maximum member limit reached."
            message={
              memberLimitWarning === 'floater'
                ? 'Floater plan can only have a maximum of 6 members. Remove an existing member before adding a new one.'
                : 'Individual plan can only have a maximum of 30 members. Remove an existing member before adding a new one.'
            }
            onClose={() => setMemberLimitWarning(null)}
          />
        ) : null}
      </View>
    );
  })();

  const nomineeBanner = (() => {
    if (!showNomineeBanner || editOption === 'entire-policy') {
      return null;
    }
    const close = () => setShowNomineeBanner(false);

    if (editOption === 'member-details') {
      return (
        <Toast
          variant="info"
          title="Member list updated."
          message="Please review and fill nominee details for all members before proceeding."
          onClose={close}
        />
      );
    }
    if (editOption === 'plan-type') {
      return (
        <Toast
          variant="info"
          title={`Plan type changed to ${planType === 'floater' ? 'Floater' : 'Individual'}.`}
          message="Please check nominees for the selected members below."
          onClose={close}
        />
      );
    }
    if (editOption === 'nominee-details') {
      return (
        <Toast
          variant="info"
          title={proceedOption === 'renewal' ? 'Update nominee details' : 'Policy plan has been changed.'}
          message={
            proceedOption === 'renewal'
              ? "Update nominee details according to the customer's requirements to proceed."
              : 'Please update nominee details to proceed.'
          }
          onClose={close}
        />
      );
    }
    return null;
  })();

  const proposerBanner =
    showProposerBanner && policyPlanChanged ? (
      <Toast
        variant="info"
        title="Policy plan has been changed."
        message="Please edit proposer details to proceed. You can only edit certain details."
        onClose={() => setShowProposerBanner(false)}
      />
    ) : null;

  /* ----------------------------- step content ---------------------------- */
  const renderStep = () => {
    switch (currentKey) {
      case 'preview':
        return (
          <ProceedStep
            record={record}
            // Leave a little of the card above in frame, so it reads as the
            // page scrolling rather than jumping to a new screen.
            onRevealFollowUp={(y) =>
              scrollRef.current?.scrollTo({ y: Math.max(0, y - spacing.xl), animated: true })
            }
            proceedOption={proceedOption}
            onSelectProceed={(value) => {
              resetStepperProgress();
              setProceedOption(value);
              setEditOption(null);
              setPaymentLinkMethod('');
            }}
            editOption={editOption}
            onSelectEdit={(value) => {
              resetStepperProgress();
              setEditOption(value);
              // The plan-type flow starts from the policy's current type; the
              // agent switches it manually on the policy step.
              if (value === 'plan-type') {
                changePlanType(currentPolicyPlanType);
              }
            }}
            paymentLinkMethod={paymentLinkMethod}
            onSelectPaymentLink={setPaymentLinkMethod}
            onDownloadPolicy={() => flashToast('Policy is downloaded!')}
          />
        );

      case 'policy': {
        // Renewal + entire-policy keeps only dates and tenure here.
        const hidePlanFields = proceedOption === 'renewal' && editOption === 'entire-policy';
        return (
          <PolicyDetailsStep
            record={record}
            showPolicyPlan={!hidePlanFields}
            showPlanType={!hidePlanFields && (editOption === 'entire-policy' || editOption === 'plan-type')}
            policyPlan={policyPlan}
            onChangePolicyPlan={setPolicyPlan}
            planType={planType}
            onChangePlanType={changePlanType}
            startDate={startDate}
            onChangeStartDate={setStartDate}
            endDate={endDate}
            onChangeEndDate={setEndDate}
            tenure={tenure}
            onChangeTenure={setTenure}
            subPlan={subPlan}
            onSelectSubPlan={setSubPlan}
            selectedEligible={selectedEligible}
            onToggleEligible={toggleEligible}
            onDownloadPolicy={() => flashToast('Policy is downloaded!')}
          />
        );
      }

      case 'proposer':
        return (
          <View style={styles.stepStack}>
            {proposerBanner}
            <ProposerDetailsStep
              data={proposer}
              update={(field, value) => setProposer((prev) => ({ ...prev, [field]: value }))}
            />
          </View>
        );

      case 'member':
        return (
          <RenewalMemberStep
            record={record}
            members={activeMembers}
            removedMembers={removedMembers}
            memberData={memberData}
            updateMemberData={updateMemberData}
            onRemoveMember={removeMember}
            onAddBackMember={addBackMember}
            onAddNewMember={addNewMember}
            onSaveNewMember={saveNewMember}
            onCancelNewMember={cancelNewMember}
            isMemberCapReached={isMemberCapReached}
            disableSumInsured={planType === 'floater'}
            useRelationshipBadge={editOption === 'member-details'}
            banner={memberBanner}
            onDownloadPolicy={() => flashToast('Policy is downloaded!')}
          />
        );

      case 'addons':
        return (
          <RenewalAddOnsStep
            record={record}
            planType={planType}
            activeMembers={activeMembers}
            memberAddOns={memberAddOns}
            onToggleMemberAddOn={toggleMemberAddOn}
            memberChoice={memberChoice}
            onMemberChoice={handleMemberChoice}
            floaterAddOns={floaterAddOns}
            onToggleFloaterAddOn={toggleFloaterAddOn}
            keepSameForAll={keepSameForAll}
            onToggleKeepSameForAll={toggleKeepSameForAll}
            isAddonLocked={isAddonLocked}
            banner={addOnsBanner}
            showSubPlan={editOption === 'addons-subplan'}
            subPlan={subPlan}
            onSelectSubPlan={setSubPlan}
            // Renewals cross-sell here, except in the entire-policy flow.
            showEligible={proceedOption === 'renewal' && editOption !== 'entire-policy'}
            selectedEligible={selectedEligible}
            onToggleEligible={toggleEligible}
            onSkipAndProceed={goNext}
            onDownloadPolicy={() => flashToast('Policy is downloaded!')}
          />
        );

      case 'nominee':
        return (
          <RenewalNomineeStep
            record={record}
            members={activeMembers}
            nomineeData={nomineeData}
            updateNomineeData={updateNomineeData}
            keepSameForAll={nomineeKeepSameForAll}
            onToggleKeepSameForAll={toggleNomineeKeepSame}
            showEligible={proceedOption === 'renewal' && editOption !== 'entire-policy'}
            selectedEligible={selectedEligible}
            onToggleEligible={toggleEligible}
            banner={nomineeBanner}
            onDownloadPolicy={() => flashToast('Policy is downloaded!')}
          />
        );

      case 'previous-policy':
        return (
          <PreviousPolicyView
            record={record}
            members={activeMembers}
            onDownloadPolicy={() => flashToast('Policy is downloaded!')}
          />
        );

      case 'kyc':
        return <KycDetailsStep data={kyc} update={(field, value) => setKyc((prev) => ({ ...prev, [field]: value }))} />;

      case 'summary':
        return (
          <RenewalSummary
            record={record}
            planType={planType}
            proceedOption={proceedOption}
            editOption={editOption}
            members={activeMembers}
            nomineeData={nomineeData}
          />
        );

      case 'payment':
        return (
          <PaymentStep data={payment} update={(field, value) => setPayment((prev) => ({ ...prev, [field]: value }))} />
        );

      default:
        return null;
    }
  };

  /* ------------------------------- view mode ----------------------------- */
  const expiry = getExpiryInfo(record.expiringWithin);
  const status = record.status.toLowerCase();

  // The read-only preview's banner and header badge follow the renewal's status:
  // payment due → link-sent, rejected → grace period, otherwise expiry-based.
  const viewToast =
    status === 'payment due'
      ? {
          variant: 'info' as const,
          badgeColor: 'violet' as const,
          badgeLabel: 'In Progress',
          title: 'Payment link sent to the customer!',
          message: `Payment link for renewal policy ID ${record.renewalPolicyId} has been shared with the customer. Follow up with them to complete renewal.`,
        }
      : status === 'rejected'
        ? {
            variant: 'error' as const,
            badgeColor: 'red' as const,
            badgeLabel: 'Expired',
            title: 'This policy has expired! Grace period ends in 15 days.',
            message: 'Contact the customer soon to renew this policy before the grace period ends.',
          }
        : {
            variant: expiry.variant,
            badgeColor: expiry.badgeColor,
            badgeLabel: expiry.badgeLabel,
            title: expiry.title,
            message: `Policy ID ${record.renewalPolicyId} for ${record.customer} is expiring soon. Follow up with the customer or send a quick renewal notice ASAP!`,
          };

  const shareSheet = (
    <ShareQuoteModal
      isOpen={shareNoticeOpen}
      onClose={() => setShareNoticeOpen(false)}
      title="Share Renewal Notice"
      subtitle="Send the renewal notice to your customer."
      idLabel="Renewal Quote ID:"
      shareLabel="Share the notice via:"
      quoteData={{ id: record.renewalQuoteId, customerName: record.customer, policyType: record.product }}
    />
  );

  const toastOverlay = (
    <>
      {addedMemberName ? (
        <View style={styles.toastTop} pointerEvents="box-none">
          <ToastGlobal
            variant="success"
            title="New member added successfully!"
            message={`${addedMemberName} was added successfully in the policy.`}
            onClose={() => setAddedMemberName(null)}
          />
        </View>
      ) : null}
      {toastMessage ? (
        <View style={styles.toastTop} pointerEvents="box-none">
          <ToastGlobal variant="success" title={toastMessage} />
        </View>
      ) : null}
    </>
  );

  if (isViewMode) {
    return (
      <View style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <RenewalSummary
            record={record}
            planType={currentPolicyPlanType}
            proceedOption={null}
            editOption={null}
            members={activeMembers}
            nomineeData={nomineeData}
            titleOverride={`${record.product} Policy`}
            titleBadge={<Badge label={viewToast.badgeLabel} variant="solid" size="lg" color={viewToast.badgeColor} />}
            topContent={<Toast variant={viewToast.variant} title={viewToast.title} message={viewToast.message} />}
          />
        </ScrollView>

        <View style={[styles.footerStack, { paddingBottom: footerPaddingBottom }]}>
          <Button
            label="Download full policy"
            variant="secondaryGray"
            leadingIcon={<DownloadSimple size={16} color={colors.textBody} />}
            onPress={() => flashToast('Policy is downloaded!')}
            fullWidth
          />
          <View style={styles.footerRow}>
            <Button
              label="Share Renewal Notice"
              variant="secondary"
              onPress={() => setShareNoticeOpen(true)}
              style={styles.footerBtn}
            />
            <Button
              label="Renew Policy"
              onPress={() => {
                setRenewClicked(true);
                onRenewFlowStart?.();
              }}
              style={styles.footerBtn}
            />
          </View>
        </View>

        {shareSheet}
        {toastOverlay}
      </View>
    );
  }

  const isSummary = currentKey === 'summary';

  return (
    <View style={styles.flex}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {showStepper && stepperSteps.length > 0 ? (
          <WizardStepper
            steps={stepperSteps.map((s) => ({ label: s.label }))}
            current={stepperSteps.findIndex((s) => s.actualStep === currentStep)}
            onStepPress={(index) => {
              const target = stepperSteps[index];
              if (target && target.actualStep <= maxVisitedStep) {
                setCurrentStep(target.actualStep);
              }
            }}
          />
        ) : null}

        {renderStep()}

        {/* The web app's sticky premium column. Web can afford to keep it beside
            every step; stacked under the content on a phone it just repeats
            itself down the flow, so it is limited to the steps where the figure
            is actually in play — the ones that change it, and the one that
            charges it. The proceed/edit choice has no premium yet and the
            summary already itemises it. */}
        {PREMIUM_CARD_STEPS.includes(currentKey) ? (
          <RenewalPremiumCard
            addOnCount={addOnTotalCount}
            addonPolicies={selectedEligiblePolicies}
            defaultExpanded={currentKey === 'payment'}
          />
        ) : null}
      </ScrollView>

      {isSummary ? (
        <View style={[styles.footerStack, { paddingBottom: footerPaddingBottom }]}>
          <Button label="Share Renewal Notice" variant="secondary" onPress={() => setShareNoticeOpen(true)} fullWidth />
          <View style={styles.footerRow}>
            <Button label="Edit Policy" variant="secondaryGray" onPress={resetStepperProgress} style={styles.footerBtn} />
            {/* Web labels this "Send Payment Link", but it advances to the
                payment step rather than sending anything. */}
            <Button label="Proceed to Payment" onPress={handleProceed} style={styles.footerBtn} />
          </View>
        </View>
      ) : (
        // Forward action only — Back lives on the screen's top bar.
        <View style={[styles.footerRowBar, { paddingBottom: footerPaddingBottom }]}>
          <Button
            label={currentKey === 'payment' ? 'Make Payment' : 'Proceed'}
            disabled={isProceedDisabled}
            onPress={handleProceed}
            fullWidth
          />
        </View>
      )}

      {/* Payment link sent — Quick Renewal (email / SMS) and the online-link mode. */}
      <BottomSheet
        visible={paymentLinkSentOpen}
        onClose={() => setPaymentLinkSentOpen(false)}
        icon={<CheckCircle size={20} color="#65A30D" weight="fill" />}
        featuredIconColor="lime"
        title="Payment Link Sent!"
        subtitle={`Payment link for renewal proposal ID ${record.renewalQuoteId} has been sent successfully!`}
        contentSlot={false}
        primaryAction={{ label: 'Start another renewal', onPress: handleIssueAnother }}
        secondaryAction={{ label: 'Copy Payment Link', onPress: () => flashToast('Link copied') }}
      />

      {/* Payment link generated — Quick Renewal "generate and copy". */}
      <BottomSheet
        visible={paymentLinkGeneratedOpen}
        onClose={() => setPaymentLinkGeneratedOpen(false)}
        icon={<Link size={20} color="#65A30D" weight="fill" />}
        featuredIconColor="lime"
        title="Payment Link generated"
        subtitle={`Payment link for renewal ID ${record.renewalQuoteId} has been generated successfully.`}
        contentSlot={false}
        primaryAction={{ label: 'Copy Payment Link', onPress: () => flashToast('Link copied') }}
        secondaryAction={{ label: 'Start another renewal', onPress: handleIssueAnother }}
      />

      {/* Payment successful — float / cheque / voucher modes. */}
      <BottomSheet
        visible={paymentSuccessOpen}
        onClose={() => setPaymentSuccessOpen(false)}
        icon={<CheckCircle size={20} color="#65A30D" weight="fill" />}
        featuredIconColor="lime"
        title="Payment Successful!"
        subtitle="The amount has been deducted from your notional float balance."
        contentMinHeight={0}
        primaryAction={{ label: 'Start another renewal', onPress: handleIssueAnother }}
        secondaryAction={{ label: 'Download receipt', onPress: () => flashToast('Receipt is downloaded!') }}
      >
        <View style={styles.receipt}>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Receipt Generated:</Text>
            <Text style={styles.receiptValue}>62354625431675</Text>
          </View>
          {payment.mode === 'agent-float' ? (
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Remaining Notional balance:</Text>
              <Text style={styles.receiptValue}>Rs. 91,000</Text>
            </View>
          ) : null}
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Amount paid:</Text>
            <Text style={styles.receiptValue}>
              Rs. {(28000 + addOnTotalCount * ADDON_UNIT_PREMIUM).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </BottomSheet>

      {/* Entire-policy flows confirm every change before the payment step. */}
      <Modal
        visible={confirmPolicyOpen}
        onClose={() => setConfirmPolicyOpen(false)}
        icon={<Info size={20} color={colors.brand} />}
        title="Confirm policy changes?"
        subtitle="Please verify all policy updates before confirming. These changes may affect coverage, premium, or member details."
        primaryAction={{
          label: 'Confirm',
          onPress: () => {
            setConfirmPolicyOpen(false);
            goNext();
          },
        }}
        secondaryAction={{ label: 'Back', onPress: () => setConfirmPolicyOpen(false), tone: 'neutral' }}
      />

      <ConfirmChangesSheet
        target={confirmTarget}
        activeOriginalMembers={activeOriginalMembers}
        newMembers={newMembers}
        removedMembers={removedMembers}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={() => {
          setConfirmTarget(null);
          goNext();
        }}
      />

      {shareSheet}
      {toastOverlay}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surfaceSubtle },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  stepStack: { gap: spacing.md },
  bannerStack: { gap: spacing.md },
  // Full-bleed footer bars, matching QuoteFooter in the quote flows.
  footerRowBar: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  footerStack: { gap: spacing.md, backgroundColor: colors.surface, padding: spacing.lg },
  footerRow: { flexDirection: 'row', gap: spacing.md },
  // `stretch` overrides Button's own `alignSelf: 'flex-start'`.
  footerBtn: { flex: 1, alignSelf: 'stretch' },
  toastTop: { position: 'absolute', top: spacing.sm, left: spacing.sm, right: spacing.sm, zIndex: 30 },
  receipt: {
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.lg,
    alignSelf: 'stretch',
  },
  receiptRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  receiptLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody, flexShrink: 1 },
  receiptValue: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, fontWeight: '500', color: colors.textHeading },
});
