import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Modal as RNModal, StyleSheet } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowUpRight,
  CaretDown,
  Copy,
  Info,
  Smiley,
  Warning,
  X,
} from 'phosphor-react-native';
import { dashboardImages } from '../images';
import {
  Avatar,
  Badge,
  BottomSheet,
  Button,
  Checkbox,
  DatePicker,
  Dropdown,
  Modal,
  SearchBar,
  Tag,
  TextArea,
  Textfield,
  ToastGlobal,
  Radio,
  colors,
  fontFamilyForWeight,
  radius,
  spacing,
  typography,
  type AccentColor,
  type BadgeDotColor,
  type DropdownOption,
} from '@atlas-ds/react-native';

// ---------------------------------------------------------------------------
// Types + fixtures
// ---------------------------------------------------------------------------

export type Priority = 'Urgent' | 'Normal' | 'Low' | 'None';
export type MeetingMode = 'In-Person' | 'Virtual';
export type AttendeeRole = 'IMD' | 'Sub-IMD' | 'Customer' | 'Relationship Manager';

export interface Attendee {
  id: string;
  name: string;
  role: AttendeeRole;
}

export interface RescheduleRequest {
  id: string;
  requester: Attendee;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
  requestedOn: string;
}

export interface MeetingDetail {
  title: string;
  priority: Priority | null;
  scheduledByLabel: string;
  createdOn: string;
  createdByMe: boolean;
  attendees: Attendee[];
  email: string;
  phone: string;
  date: Date | null;
  startTime: string;
  endTime: string;
  mode: MeetingMode;
  address: string;
  agenda: string;
  upcomingName: string;
  upcomingOn: string;
  rescheduleRequests: RescheduleRequest[];
}

const CURRENT_USER: Attendee = { id: 'me', name: 'Rajesh Chaurasia', role: 'IMD' };

const DIRECTORY: Attendee[] = [
  { id: 'pritis', name: 'Priti Sinha', role: 'Customer' },
  { id: 'manas', name: 'Manas Patel', role: 'Sub-IMD' },
  { id: 'manish', name: 'Manish Jain', role: 'Sub-IMD' },
  { id: 'rahul', name: 'Rahul Jain', role: 'Sub-IMD' },
  { id: 'rohini', name: 'Rohini Kumar', role: 'Customer' },
];

const ROLE_COLOR: Record<AttendeeRole, AccentColor> = {
  IMD: 'blue',
  'Sub-IMD': 'indigo',
  Customer: 'emerald',
  'Relationship Manager': 'emerald',
};

const PRIORITY_COLOR: Record<Priority, AccentColor> = {
  Urgent: 'red',
  Normal: 'amber',
  Low: 'blue',
  None: 'neutral',
};
const PRIORITY_DOT: Record<Priority, BadgeDotColor> = {
  Urgent: 'red',
  Normal: 'amber',
  Low: 'blue',
  None: 'neutral',
};

const TIME_OPTIONS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM',
];
const AGENDA_PRESETS = ['Claims Grievance', 'Motor product explanation', 'Upgrading health policy'];

// Share channels shown in the "Confirm meeting details" sheet — colored border
// (always) + a light selected-bg tint; `img` is a bundled logo, SMS a blue tile.
const CHANNELS: { key: string; img: ImageSourcePropType | null; border: string; tint: string }[] = [
  { key: 'WhatsApp', img: dashboardImages.whatsapp, border: '#A7F3D0', tint: '#ECFDF5' },
  { key: 'Email', img: dashboardImages.mail, border: '#FED7AA', tint: '#FFF7ED' },
  { key: 'SMS', img: null, border: '#BFDBFE', tint: '#EFF6FF' },
];

/** "You, Priti Sinha and Manas Patel"-style joined name list. */
const formatNameList = (names: string[]): string => {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
};

const toOptions = (values: string[]): DropdownOption[] => values.map((v) => ({ label: v, value: v }));

/** Who a meeting is with — drives its attendee roster, header colour, and whether
 *  it's editable (I scheduled it) or read-only (someone else did). */
export type MeetingKind = 'customer' | 'sub-imd' | 'imd';

// Customer meeting: me + a customer + a sub-IMD (green header, editable).
const CUSTOMER_ATTENDEES: Attendee[] = [CURRENT_USER, DIRECTORY[0], DIRECTORY[1]];
// Sub-IMD meeting: me + a sub-IMD (orange header, editable).
const SUBIMD_ATTENDEES: Attendee[] = [CURRENT_USER, DIRECTORY[1]];
// IMD meeting: an all-internal roster scheduled by someone else (orange, read-only).
const IMD_ATTENDEES: Attendee[] = [
  CURRENT_USER,
  { id: 'manish', name: 'Manish Jain', role: 'Relationship Manager' },
  { id: 'manas', name: 'Manas Patel', role: 'IMD' },
  { id: 'rahul', name: 'Rahul Jain', role: 'IMD' },
];

/**
 * Build a demo meeting detail. `kind` drives the roster + header colour (customer
 * → green, sub-IMD/IMD → orange); `createdByMe` drives the modal — scheduled by me
 * shows the edit form, otherwise the read-only view with Request Reschedule. The
 * two are independent (an IMD meeting I scheduled is still editable).
 */
export const buildMeetingDetail = (opts: {
  title: string;
  priority: Priority | null;
  mode: MeetingMode;
  kind: MeetingKind;
  createdByMe: boolean;
  scheduledBy?: string;
}): MeetingDetail => {
  const attendees =
    opts.kind === 'customer' ? CUSTOMER_ATTENDEES : opts.kind === 'sub-imd' ? SUBIMD_ATTENDEES : IMD_ATTENDEES;
  // A meeting I scheduled can receive a reschedule request from an attendee.
  const rescheduleRequests: RescheduleRequest[] =
    opts.createdByMe && opts.kind === 'imd'
      ? [
          {
            id: 'req1',
            requester: { id: 'manas', name: 'Manas Patel', role: 'IMD' },
            date: '30/11/2026',
            startTime: '12:00 PM',
            endTime: '01:00 PM',
            requestedOn: '11/11/2026',
          },
        ]
      : [];
  return {
    title: opts.title,
    priority: opts.priority,
    scheduledByLabel: opts.createdByMe ? 'Scheduled by me' : `Scheduled by ${opts.scheduledBy ?? 'Manish Jain'}`,
    createdOn: '10/11/2026',
    createdByMe: opts.createdByMe,
    attendees,
    email: 'priti@gmail.com',
    phone: '+91 9789365836',
    date: new Date(2026, 10, opts.createdByMe ? 30 : 27),
    startTime: '12:00 PM',
    endTime: '01:00 PM',
    mode: opts.mode,
    address: opts.mode === 'Virtual' ? 'https://meet.google.com/jts-zwse-ybx' : 'https://maps.google.com/?q=DLF+Cyber+City',
    agenda: 'Discuss upgrading policy plan to accomodate family',
    upcomingName: 'Priti Sinha',
    upcomingOn: '18th Aug 2026',
    rescheduleRequests,
  };
};

// ---------------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------------

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <Text style={styles.fieldLabel}>
    {children}
    {required ? <Text style={styles.required}>*</Text> : null}
  </Text>
);

/** Muted label + value used in the read-only cards. */
const InfoField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.infoField}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

const AttendeeRow: React.FC<{ attendee: Attendee; clashing?: boolean }> = ({ attendee, clashing }) => (
  <View style={styles.attendeeRow}>
    <Avatar size="xs" type="text" name={attendee.name} />
    <Text style={styles.attendeeName} numberOfLines={1}>
      {attendee.name}
      {attendee.id === CURRENT_USER.id ? ' (Me)' : ''}
    </Text>
    <Badge label={attendee.role} variant="light" size="sm" color={ROLE_COLOR[attendee.role]} />
    {clashing ? <Warning size={16} color="#F59E0B" weight="fill" style={styles.attendeeWarn} /> : null}
  </View>
);

type AttendeeFilter = 'all' | 'customers' | 'internal';
const ATTENDEE_FILTERS: { value: AttendeeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'customers', label: 'Customers' },
  { value: 'internal', label: 'Internal' },
];
const matchesFilter = (a: Attendee, f: AttendeeFilter) =>
  f === 'all' ? true : f === 'customers' ? a.role === 'Customer' : a.role !== 'Customer';

/** Concentric double-ring badge (outer #EFF6FF / inner #DBEAFE) with a glyph. */
const RoundedIconBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.ringOuter}>
    <View style={styles.ringInner}>{children}</View>
  </View>
);

/** Attendee multi-select — chip trigger + bottom-sheet checkbox list with search. */
const AttendeePicker: React.FC<{ selected: Attendee[]; onChange: (next: Attendee[]) => void }> = ({
  selected,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<AttendeeFilter>('all');

  const q = query.trim().toLowerCase();
  // With no query the sheet lists the whole directory for the active tab, so
  // there's something to pick from before typing.
  const results = useMemo(() => {
    const pool = DIRECTORY.filter((p) => matchesFilter(p, filter));
    if (!q) return pool;
    return pool.filter((p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
  }, [q, filter]);

  const toggle = (p: Attendee) =>
    onChange(selected.some((s) => s.id === p.id) ? selected.filter((s) => s.id !== p.id) : [...selected, p]);

  return (
    <View>
      <Pressable style={styles.selectTrigger} onPress={() => setOpen(true)} accessibilityRole="button">
        <View style={styles.chipWrap}>
          {selected.length === 0 ? (
            <Text style={styles.placeholder}>Select attendees</Text>
          ) : (
            selected.map((p) => <Tag key={p.id} label={p.name} size="sm" shape="rounded" onRemove={() => toggle(p)} />)
          )}
        </View>
        <CaretDown size={18} color={colors.textBody} />
      </Pressable>

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Select attendees"
        primaryAction={{ label: 'Done', onPress: () => setOpen(false) }}
      >
        <View style={styles.pickerBody}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search" />

          <View style={styles.filterChips}>
            {ATTENDEE_FILTERS.map((f) => (
              <Tag
                key={f.value}
                label={f.label}
                size="sm"
                selected={filter === f.value}
                showIndicator={false}
                onPress={() => setFilter(f.value)}
              />
            ))}
          </View>

          {results.length === 0 ? (
            <View style={styles.pickerEmpty}>
              <RoundedIconBadge>
                <Info size={22} color={colors.brand} />
              </RoundedIconBadge>
              {q === '' ? null : <Text style={styles.pickerEmptyStrong}>No one matches "{query.trim()}"</Text>}
              <Text style={styles.pickerEmptyText}>Search by ID or Name</Text>
            </View>
          ) : (
            results.map((p) => {
              const sel = selected.some((s) => s.id === p.id);
              return (
                <Pressable
                  key={p.id}
                  style={[styles.pickerRow, sel && styles.pickerRowSelected]}
                  onPress={() => toggle(p)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: sel }}
                >
                  <Checkbox size="sm" checked={sel} onChange={() => toggle(p)} />
                  <View style={styles.pickerRowInfo}>
                    <Text style={styles.pickerName}>{p.name}</Text>
                    <Text style={styles.pickerId}>{p.id}</Text>
                  </View>
                  <Badge label={p.role} variant="light" size="sm" color={ROLE_COLOR[p.role]} />
                </Pressable>
              );
            })
          )}
        </View>
      </BottomSheet>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Main modal
// ---------------------------------------------------------------------------

export interface MeetingDetailModalProps {
  visible: boolean;
  onClose: () => void;
  detail?: MeetingDetail;
  /** Open a blank scheduling form instead of an existing meeting's detail. */
  create?: boolean;
  onCancelMeeting?: () => void;
  onUpdate?: () => void;
  onRequestReschedule?: () => void;
  onSchedule?: () => void;
}

export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({
  visible,
  onClose,
  detail,
  create,
  onCancelMeeting,
  onUpdate,
  onRequestReschedule,
  onSchedule,
}) => {
  const insets = useSafeAreaInsets();
  const isEdit = !!detail?.createdByMe;
  const isCreate = !!create;
  // Both the edit and create modes render the same scheduling form.
  const showForm = isEdit || isCreate;

  // Edit-form state
  const [title, setTitle] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [mode, setMode] = useState<MeetingMode | null>(null);
  const [address, setAddress] = useState('');
  const [agenda, setAgenda] = useState('');
  const [priority, setPriority] = useState<Priority | null>(null);
  const [requests, setRequests] = useState<RescheduleRequest[]>([]);
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [rescheduleSent, setRescheduleSent] = useState(false);
  // Read-only "Request Reschedule" flow: the inline form + the proposed slot.
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [reschedDate, setReschedDate] = useState<Date | null>(null);
  const [reschedStart, setReschedStart] = useState<string | null>(null);
  const [reschedEnd, setReschedEnd] = useState<string | null>(null);
  const [requested, setRequested] = useState<{ date: Date | null; start: string; end: string } | null>(null);
  // Create flow: the "Confirm meeting details" bottom sheet + its share channels.
  const [showConfirm, setShowConfirm] = useState(false);
  const [channels, setChannels] = useState<string[]>(['WhatsApp']);
  const toggleChannel = (key: string) =>
    setChannels((prev) => (prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]));

  useEffect(() => {
    if (!visible || !detail) return;
    setTitle(detail.title);
    setAttendees(detail.attendees.filter((a) => a.id !== CURRENT_USER.id));
    setDate(detail.date);
    setStartTime(detail.startTime);
    setEndTime(detail.endTime);
    setMode(detail.mode);
    setAddress(detail.address);
    setAgenda(detail.agenda);
    setPriority(detail.priority);
    setRequests(detail.rescheduleRequests);
    setShowUpdateToast(false);
    setShowUpcoming(false);
    setRescheduleSent(false);
    setShowRescheduleForm(false);
    setRequested(null);
  }, [visible, detail]);

  // Blank the form each time the create sheet opens.
  useEffect(() => {
    if (!visible || !create) return;
    setTitle('');
    setAttendees([]);
    setDate(null);
    setStartTime(null);
    setEndTime(null);
    setMode(null);
    setAddress('');
    setAgenda('');
    setPriority(null);
    setRequests([]);
    setShowUpdateToast(false);
    setShowUpcoming(false);
    setRescheduleSent(false);
    setShowConfirm(false);
    setChannels(['WhatsApp']);
  }, [visible, create]);

  if (!detail && !create) return null;

  const allAttendees = [CURRENT_USER, ...attendees];
  // Meetings with a customer get a green header; all-internal (IMD) meetings orange.
  const hasCustomer = !!detail && detail.attendees.some((a) => a.role === 'Customer');
  const bannerColors: [string, string] = hasCustomer ? ['#ECFDF5', '#FFFFFF'] : ['#FFF7ED', '#FFFFFF'];
  const scheduledOn = detail
    ? `${detail.date ? detail.date.toLocaleDateString('en-GB') : '—'}, ${detail.startTime.replace(' ', '')} - ${detail.endTime.replace(' ', '')}`
    : '';
  // A date/time change counts as a reschedule (drives the update-toast copy).
  const timeOrDateChanged = detail
    ? startTime !== detail.startTime || endTime !== detail.endTime || date?.getTime() !== detail.date?.getTime()
    : false;
  const isDirty = detail
    ? title !== detail.title ||
    timeOrDateChanged ||
    mode !== detail.mode ||
    address !== detail.address ||
    agenda !== detail.agenda ||
    priority !== detail.priority ||
    attendees.length !== detail.attendees.length - 1
    : false;
  const canSchedule =
    title.trim().length > 0 &&
    attendees.length > 0 &&
    !!date &&
    !!startTime &&
    !!endTime &&
    !!mode &&
    address.trim().length > 0;

  const confirmSchedule = `${date ? date.toLocaleDateString('en-GB') : '—'}, ${(startTime ?? '').replace(' ', '')} - ${(endTime ?? '').replace(' ', '')}`;
  const confirmAttendees = formatNameList(['You', ...attendees.map((a) => a.name)]);

  const handleConfirm = () => {
    setShowConfirm(false);
    onSchedule?.();
    onClose();
  };

  const resolveRequest = (id: string) => setRequests((prev) => prev.filter((r) => r.id !== id));

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    onCancelMeeting?.();
    onClose();
  };

  // Read-only "Request Reschedule" flow.
  const approver = detail ? detail.scheduledByLabel.replace(/^Scheduled by /, '') : '';
  const openRescheduleForm = () => {
    // Empty by default; reopening via "Change" keeps the proposed slot.
    setReschedDate(requested?.date ?? null);
    setReschedStart(requested?.start ?? null);
    setReschedEnd(requested?.end ?? null);
    setShowRescheduleForm(true);
  };
  const canRequest = !!reschedDate && !!reschedStart && !!reschedEnd;
  const confirmReschedule = () => {
    setRequested({ date: reschedDate, start: reschedStart ?? '', end: reschedEnd ?? '' });
    setShowRescheduleForm(false);
    setRescheduleSent(true);
    onRequestReschedule?.();
  };
  const requestedSlot = requested
    ? `${requested.date ? requested.date.toLocaleDateString('en-GB') : '—'}, ${requested.start.replace(' ', '')} - ${requested.end.replace(' ', '')}`
    : '';

  return (
    <RNModal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{isCreate ? 'Schedule a meeting' : 'Meeting'}</Text>
          <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
            <X size={22} color={colors.textBody} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* Banner (existing meetings only) */}
          {detail ? (
            <LinearGradient
              colors={bannerColors}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.banner}
            >
              <View style={styles.rowBetween}>
                <Text style={styles.bannerTitle}>{detail.title}</Text>
                {detail.priority ? (
                  <Badge label={detail.priority} variant="solid" size="sm" color={PRIORITY_COLOR[detail.priority]} />
                ) : null}
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.metaMuted}>{detail.scheduledByLabel}</Text>
                <Text style={styles.metaMuted}>Created on {detail.createdOn}</Text>
              </View>
            </LinearGradient>
          ) : null}

          {showForm ? (
            <>
              {/* Upcoming meeting reminder */}
              {isEdit && showUpcoming && detail ? (
                <ToastGlobal
                  variant="info"
                  title="Upcoming meeting!"
                  message={`A meeting is already scheduled for ${detail.upcomingName} on ${detail.upcomingOn}.`}
                  onClose={() => setShowUpcoming(false)}
                />
              ) : null}

              {/* Update toast — a date/time change reads as a reschedule. */}
              {showUpdateToast ? (
                timeOrDateChanged ? (
                  <ToastGlobal
                    variant="success"
                    title="Meeting rescheduled successfully!"
                    message={`Rescheduled for ${date ? date.toLocaleDateString('en-GB') : ''}, ${(startTime ?? '').replace(' ', '')} successfully`}
                    onClose={() => setShowUpdateToast(false)}
                  />
                ) : (
                  <ToastGlobal
                    variant="success"
                    title="Meeting Updated Successfully"
                    message="Your changes have been updated successfully."
                    onClose={() => setShowUpdateToast(false)}
                  />
                )
              ) : null}

              {/* Title */}
              <View style={styles.field}>
                <FieldLabel required>Title of the Meeting</FieldLabel>
                <Textfield value={title} onChangeText={setTitle} placeholder="Enter the meeting title" />
              </View>

              {/* Attendees */}
              <View style={styles.field}>
                <FieldLabel required>Select attendees</FieldLabel>
                <AttendeePicker selected={attendees} onChange={setAttendees} />
              </View>

              {/* List of Attendees */}
              {allAttendees.length > 1 ? (
                <View style={styles.listCard}>
                  <View style={styles.listHead}>
                    <Text style={styles.listTitle}>List of Attendees</Text>
                    <Badge label={String(allAttendees.length)} variant="light" size="sm" color="neutral" />
                  </View>
                  {allAttendees.map((a) => (
                    <AttendeeRow key={a.id} attendee={a} />
                  ))}
                </View>
              ) : null}


              {/* Date + time */}
              <View style={styles.field}>
                <FieldLabel required>Date</FieldLabel>
                <DatePicker value={date} onChange={setDate} placeholder="Select Date" />
              </View>
              <View style={styles.field}>
                <FieldLabel required>Select time</FieldLabel>
                <View style={styles.timeRow}>
                  <View style={styles.timeCol}>
                    <Dropdown options={toOptions(TIME_OPTIONS)} value={startTime} onChange={setStartTime} placeholder="Start" />
                  </View>
                  <Text style={styles.timeDash}>-</Text>
                  <View style={styles.timeCol}>
                    <Dropdown options={toOptions(TIME_OPTIONS)} value={endTime} onChange={setEndTime} placeholder="End" />
                  </View>
                </View>
              </View>

              {/* Reschedule request from an attendee (a meeting I scheduled) */}
              {isEdit && requests.map((r) => (
                <View key={r.id} style={styles.reqBlock}>
                  <ToastGlobal
                    variant="warning"
                    title={`Meeting reschedule request from ${r.requester.name}`}
                  />
                  <View style={styles.reqSlotCard}>
                    <InfoField
                      label="Requested Time"
                      value={`${r.date}, ${r.startTime.replace(' ', '')} - ${r.endTime.replace(' ', '')}`}
                    />
                    <Button label="Approve Requested Time" variant="tertiary" size="sm" onPress={() => resolveRequest(r.id)} />
                  </View>
                </View>
              ))}

              {/* Meeting mode */}
              <View style={styles.field}>
                <FieldLabel required>Meeting mode</FieldLabel>
                <View style={styles.modeRow}>
                  {(['In-Person', 'Virtual'] as MeetingMode[]).map((m) => (
                    <Pressable
                      key={m}
                      style={[styles.modeCard, mode === m && styles.modeCardSelected]}
                      onPress={() => setMode(m)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: mode === m }}
                    >
                      <Radio selected={mode === m} onPress={() => setMode(m)} size="sm" />
                      <Text style={styles.modeLabel}>{m}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Address / link */}
              <View style={styles.field}>
                <FieldLabel required>{mode === 'Virtual' ? 'Add meeting link' : 'Add address'}</FieldLabel>
                <Textfield
                  value={address}
                  onChangeText={setAddress}
                  placeholder={mode === 'Virtual' ? 'https://meet.google.com/abc-defg-hij' : 'Attach google maps link or enter address'}
                />
              </View>

              {/* Agenda + presets */}
              <View style={styles.field}>
                <FieldLabel>Agenda</FieldLabel>
                <TextArea value={agenda} onChangeText={setAgenda} placeholder="Describe what needs to be done…" rows={3} />
                <View style={styles.pillRow}>
                  {AGENDA_PRESETS.map((preset) => (
                    <Tag key={preset} label={preset} size="sm" showIndicator={false} onPress={() => setAgenda(preset)} />
                  ))}
                </View>
              </View>

              {/* Priority */}
              <View style={styles.field}>
                <FieldLabel>Set Priority</FieldLabel>
                <View style={styles.pillRow}>
                  {(Object.keys(PRIORITY_DOT) as Priority[]).map((p) => (
                    <Tag key={p} label={p} size="sm" dot={PRIORITY_DOT[p]} selected={priority === p} showIndicator={false} onPress={() => setPriority(p)} />
                  ))}
                </View>
              </View>
            </>
          ) : detail ? (
            <>
              {rescheduleSent ? (
                <ToastGlobal
                  variant="success"
                  title="Meeting reschedule request sent"
                  message={`Meeting reschedule request sent to ${approver} for approval.`}
                  onClose={() => setRescheduleSent(false)}
                />
              ) : null}

              {/* Attendees */}
              <View style={styles.viewCard}>
                <View style={styles.listHead}>
                  <Text style={styles.listTitle}>List of Attendees</Text>
                  <Badge label={String(detail.attendees.length)} variant="light" size="sm" color="neutral" />
                </View>
                <View style={styles.attendeeList}>
                  {detail.attendees.map((a) => (
                    <AttendeeRow key={a.id} attendee={a} />
                  ))}
                </View>
              </View>

              {/* Email + Mobile */}
              <View style={[styles.viewCard, styles.viewCardMuted, styles.viewGrid]}>
                <InfoField label="Email ID" value={detail.email} />
                <InfoField label="Mobile Number" value={detail.phone} />
              </View>

              {/* Scheduled on — the reschedule form / requested slot nest inside */}
              <View style={styles.viewCard}>
                <InfoField label="Scheduled on" value={scheduledOn} />

                {/* Inline reschedule form (opened via Request Reschedule / Change) */}
                {showRescheduleForm ? (
                  <View style={styles.reschedForm}>
                    <View style={styles.reschedHead}>
                      <Text style={styles.reschedTitle}>Request Reschedule</Text>
                      <Pressable onPress={() => setShowRescheduleForm(false)} hitSlop={8} accessibilityLabel="Close">
                        <X size={18} color={colors.textBody} />
                      </Pressable>
                    </View>
                    <View style={styles.field}>
                      <FieldLabel required>Date</FieldLabel>
                      <DatePicker value={reschedDate} onChange={setReschedDate} placeholder="Select Date" />
                    </View>
                    <View style={styles.field}>
                      <FieldLabel required>Select time</FieldLabel>
                      <View style={styles.timeRow}>
                        <View style={styles.timeCol}>
                          <Dropdown options={toOptions(TIME_OPTIONS)} value={reschedStart} onChange={setReschedStart} placeholder="Start" />
                        </View>
                        <Text style={styles.timeDash}>-</Text>
                        <View style={styles.timeCol}>
                          <Dropdown options={toOptions(TIME_OPTIONS)} value={reschedEnd} onChange={setReschedEnd} placeholder="End" />
                        </View>
                      </View>
                    </View>
                    <View style={styles.reschedActions}>
                      <Button label="Confirm" variant="primary" size="sm" fullWidth disabled={!canRequest} onPress={confirmReschedule} />
                      <Button label="Cancel" variant="secondaryGray" size="sm" fullWidth onPress={() => setShowRescheduleForm(false)} />
                    </View>
                  </View>
                ) : requested ? (
                  <View style={styles.requestedInline}>
                    <View style={styles.rowBetween}>
                      <InfoField label="Requested Time" value={requestedSlot} />
                      <Button label="Change" variant="tertiary" size="sm" onPress={openRescheduleForm} />
                    </View>
                  </View>
                ) : null}
              </View>

              {/* Location */}
              <View style={styles.viewCard}>
                <View style={styles.rowBetween}>
                  <InfoField label={detail.mode === 'In-Person' ? 'Address' : 'Meeting Link'} value={detail.address} />
                  <View style={styles.locationActions}>
                    <Pressable hitSlop={6} accessibilityRole="button" accessibilityLabel="Copy">
                      <Copy size={16} color={colors.textBody} />
                    </Pressable>
                    {detail.mode === 'In-Person' ? (
                      <Pressable hitSlop={6} accessibilityRole="button" accessibilityLabel="Open">
                        <ArrowUpRight size={16} color={colors.textBody} />
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              </View>

              {/* Agenda */}
              <View style={styles.viewCard}>
                <InfoField label="Agenda" value={detail.agenda} />
              </View>
            </>
          ) : null}
        </ScrollView>

        {/* Footer — one full-width action per row, primary on top */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          {isEdit ? (
            <>
              <Button
                label="Update"
                variant="primary"
                fullWidth
                disabled={!isDirty}
                onPress={() => {
                  onUpdate?.();
                  setShowUpdateToast(true);
                }}
              />
              <Button
                label="Cancel Meeting"
                variant="secondaryDestructive"
                fullWidth
                onPress={() => setShowCancelConfirm(true)}
              />
            </>
          ) : isCreate ? (
            <>
              <Button
                label="Schedule meeting"
                variant="primary"
                fullWidth
                disabled={!canSchedule}
                onPress={() => setShowConfirm(true)}
              />
              <Button label="Cancel" variant="secondaryGray" fullWidth onPress={onClose} />
            </>
          ) : !showRescheduleForm && !requested ? (
            <Button label="Request Reschedule" variant="secondary" fullWidth onPress={openRescheduleForm} />
          ) : null}
        </View>
      </View>

      {/* Cancel-meeting confirmation */}
      <Modal
        visible={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        iconName="danger"
        title="Cancel this meeting?"
        primaryAction={{ label: 'Confirm', tone: 'danger', onPress: confirmCancel }}
        secondaryAction={{ label: 'Keep meeting', tone: 'neutral', onPress: () => setShowCancelConfirm(false) }}
      >
        <Text style={styles.confirmText}>
          This meeting will be removed for everyone it's scheduled with. This action cannot be undone.
        </Text>
      </Modal>

      {/* Confirm meeting details — shown after "Schedule meeting" */}
      <BottomSheet
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        primaryAction={{ label: 'Confirm', onPress: handleConfirm }}
        secondaryAction={{ label: 'Cancel', onPress: () => setShowConfirm(false) }}
      >
        <View style={styles.confirmBody}>
          <RoundedIconBadge>
            <Info size={22} color={colors.brand} />
          </RoundedIconBadge>
          <Text style={styles.confirmTitle}>Confirm meeting details</Text>
          <Text style={styles.confirmDesc}>
            {mode === 'Virtual' ? 'A virtual' : 'An in-person'} meeting has been scheduled on{' '}
            <Text style={styles.confirmStrong}>{confirmSchedule}</Text> with attendees{' '}
            <Text style={styles.confirmStrong}>{confirmAttendees}.</Text>
          </Text>

          <View style={styles.shareVia}>
            <Text style={styles.shareViaLabel}>Share meeting details via</Text>
            <View style={styles.channelRow}>
              {CHANNELS.map((ch) => {
                const sel = channels.includes(ch.key);
                return (
                  <Pressable
                    key={ch.key}
                    style={[styles.channelCard, { borderColor: ch.border }]}
                    onPress={() => toggleChannel(ch.key)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: sel }}
                  >
                    {sel ? (
                      <LinearGradient
                        colors={['#FFFFFF', ch.tint]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                    ) : null}
                    <View style={styles.channelCheck}>
                      <Checkbox size="sm" checked={sel} onChange={() => toggleChannel(ch.key)} />
                    </View>
                    {ch.img ? (
                      <Image source={ch.img} style={styles.channelImg} resizeMode="contain" />
                    ) : (
                      <View style={styles.channelTile}>
                        <Smiley size={18} color="#FFFFFF" />
                      </View>
                    )}
                    <Text style={styles.channelLabel}>{ch.key}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </BottomSheet>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerTitle: { fontFamily: fontFamilyForWeight('600'), fontSize: 18, fontWeight: '600', color: colors.textHeading },

  body: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },

  banner: { borderRadius: radius.xl, padding: spacing.lg, gap: spacing.xs, overflow: 'hidden' },
  bannerTitle: { flex: 1, fontFamily: fontFamilyForWeight('600'), fontSize: 16, fontWeight: '600', color: colors.textHeading },
  metaMuted: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textBody },

  // Read-only cards
  viewCard: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  viewCardMuted: { backgroundColor: colors.surfaceSubtle },
  viewGrid: { flexDirection: 'row', gap: spacing.lg },
  attendeeList: { gap: spacing.sm },
  infoField: { flex: 1, gap: 2 },
  infoLabel: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textMuted },
  infoValue: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textHeading },
  locationActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },

  // Attendee row
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  attendeeName: { flex: 1, fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  attendeeWarn: { marginLeft: 'auto' },

  // Reschedule request (attendee → a meeting I scheduled)
  reqBlock: { gap: spacing.sm },
  reqSlotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: '#EFF6FF',
    borderRadius: radius.lg,
    padding: spacing.md,
  },

  // Read-only "Request Reschedule" inline form + the requested-slot card.
  reschedForm: {
    
    backgroundColor: '#EFF6FF',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  reschedHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reschedTitle: { fontFamily: fontFamilyForWeight('600'), fontSize: 15, fontWeight: '600', color: colors.textHeading },
  // Stacked like the footer — Confirm on top, each spanning the form's width.
  reschedActions: { alignItems: 'stretch', gap: spacing.sm },
  requestedInline: { backgroundColor: '#EFF6FF', borderRadius: radius.lg, padding: spacing.md },
  changeLink: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, fontWeight: '500', color: colors.brand },

  // List of attendees card
  listCard: { borderWidth: 1, borderColor: colors.borderSubtle, backgroundColor: colors.surfaceSubtle, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  listHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  listTitle: { fontFamily: fontFamilyForWeight('600'), fontSize: 14, fontWeight: '600', color: colors.textHeading },

  field: { gap: spacing.sm },
  fieldLabel: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody },
  required: { color: colors.dangerText },

  // Select trigger (attendees)
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs, flex: 1 },
  placeholder: { flex: 1, fontFamily: typography.fontFamily, fontSize: 14, color: colors.textMuted },

  // Attendee picker sheet
  pickerBody: { gap: spacing.sm },
  filterChips: { flexDirection: 'row', gap: spacing.sm },
  pickerEmpty: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xl },
  pickerEmptyStrong: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, fontWeight: '500', color: colors.textHeading },
  pickerEmptyText: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textMuted },
  pickerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderRadius: radius.md },
  pickerRowSelected: { backgroundColor: colors.brandSubtle },
  pickerRowInfo: { flex: 1 },
  pickerName: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  pickerId: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textMuted },

  // Time
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  timeCol: { flex: 1 },
  timeDash: { fontFamily: typography.fontFamily, fontSize: 16, color: colors.textMuted },

  // Meeting mode
  modeRow: { flexDirection: 'row', gap: spacing.sm },
  modeCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  modeCardSelected: { borderColor: colors.brand, backgroundColor: colors.brandSubtle },
  modeLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },

  // Actions stack, one full-width button per row.
  footer: {
    alignItems: 'stretch',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },

  confirmText: { fontFamily: typography.fontFamily, fontSize: 15, lineHeight: 22, color: colors.textBody, textAlign: 'center' },

  // Concentric double-ring badge (outer #EFF6FF / inner #DBEAFE).
  ringOuter: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  ringInner: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center' },

  // Confirm-meeting-details sheet
  confirmBody: { gap: spacing.md, alignItems: 'center' },
  confirmTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, lineHeight: 28, fontWeight: '500', color: colors.textHeading, textAlign: 'center' },
  confirmDesc: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody, textAlign: 'center' },
  confirmStrong: { fontFamily: fontFamilyForWeight('600'), fontWeight: '600', color: colors.textHeading },
  shareVia: { gap: spacing.sm, alignSelf: 'stretch' },
  shareViaLabel: { fontFamily: fontFamilyForWeight('500'), fontSize: 13, fontWeight: '500', color: colors.textHeading },
  channelRow: { flexDirection: 'row', gap: spacing.sm },
  channelCard: {
    flex: 1,
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  channelImg: { width: 32, height: 32 },
  channelTile: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelCheck: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 1 },
  channelLabel: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textBody },
});
