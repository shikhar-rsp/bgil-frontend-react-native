import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Modal as RNModal, StyleSheet } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowUpRight,
  BookmarkSimple,
  CaretDown,
  CheckCircle,
  Info,
  Smiley,
  Trash,
  X,
} from 'phosphor-react-native';
import { dashboardImages } from '../images';
import {
  Badge,
  BottomSheet,
  Button,
  Calendar,
  Checkbox,
  DatePicker,
  Dropdown,
  Modal,
  MultiSelectDropdown,
  SearchBar,
  Tag,
  TextArea,
  Toast,
  ToastGlobal,
  Toggle,
  accent,
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
// Types + fixtures (mirrors the web CreateTaskModal)
// ---------------------------------------------------------------------------

export type TaskType = 'Quotes' | 'Proposals' | 'Renewals';
export type Priority = 'Urgent' | 'Normal' | 'Low' | 'None';
export type TaskStatus = 'Open' | 'In progress' | 'Completed';

export interface TaskOption {
  id: string;
  quoteId: string;
  displayId: string;
  customer: string;
  premium: number;
  status: 'Accepted' | 'Awaiting' | 'Rejected';
  lob: string;
  policyType: string;
  expiringOn: string;
}

/** Records the create-mode "Select task" search picks from, keyed by task type. */
const TASK_OPTIONS: Record<TaskType, TaskOption[]> = {
  Quotes: [
    { id: 'q1', quoteId: 'QT186876786287', displayId: 'QT - 28686-8728387', customer: 'Priti Sinha', premium: 12000, status: 'Accepted', lob: 'My Health Care - Floater', policyType: 'Health Guard Policy', expiringOn: '30/11/2026' },
    { id: 'q2', quoteId: 'QT186876789720', displayId: 'QT - 28686-8729720', customer: 'Priti Sinha', premium: 10000, status: 'Awaiting', lob: 'My Health Care - Floater', policyType: 'Health Guard Policy', expiringOn: '15/12/2026' },
    { id: 'q3', quoteId: 'QT123452889', displayId: 'QT - 12345-2889', customer: 'Rakesh Kumar', premium: 21000, status: 'Accepted', lob: '2 Wheeler - Individual', policyType: 'Motor Secure Policy', expiringOn: '07/01/2027' },
  ],
  Proposals: [
    { id: 'p1', quoteId: 'PR556120934', displayId: 'PR - 55612-0934', customer: 'Arijit Kumar', premium: 24000, status: 'Awaiting', lob: '4 Wheeler - Individual', policyType: 'Motor Secure Policy', expiringOn: '10/10/2026' },
    { id: 'p2', quoteId: 'PR556188210', displayId: 'PR - 55618-8210', customer: 'Madhu Verma', premium: 30500, status: 'Accepted', lob: 'My Health Care - Floater', policyType: 'Health Guard Policy', expiringOn: '05/11/2026' },
  ],
  Renewals: [
    { id: 'r1', quoteId: 'RN770231455', displayId: 'RN - 77023-1455', customer: 'Nikhil Patel', premium: 15000, status: 'Awaiting', lob: 'My Health Care - Individual', policyType: 'Health Guard Policy', expiringOn: '18/08/2026' },
    { id: 'r2', quoteId: 'RN770298640', displayId: 'RN - 77029-8640', customer: 'Rishabh Singh', premium: 27000, status: 'Accepted', lob: '4 Wheeler - Individual', policyType: 'Motor Secure Policy', expiringOn: '28/07/2026' },
  ],
};

const TASK_TYPES: TaskType[] = ['Quotes', 'Proposals', 'Renewals'];
const STATUS_OPTIONS: TaskStatus[] = ['Open', 'In progress', 'Completed'];
/** Colored bookmark shown before each status in the "Select status" dropdown. */
const STATUS_ICON_COLOR: Record<TaskStatus, string> = {
  Open: '#2563EB',
  'In progress': '#EA580C',
  Completed: '#16A34A',
};
const STATUS_DROPDOWN_OPTIONS: DropdownOption[] = STATUS_OPTIONS.map((s) => ({
  value: s,
  label: s,
  icon: <BookmarkSimple size={16} color={STATUS_ICON_COLOR[s]} weight="fill" />,
}));
const PEOPLE = ['Self', 'Rajesh Chaurasia', 'Manish Tiwari', 'Rahul Jain', 'Manas Patel', 'Abhijit Desai', 'Rohini Kumar'];
const DOC_TYPES = ["Doctor's prescription", 'Previous policy copy', 'CT scan report', 'Blood test report'];
const NOTIFY_PRESETS = ['3 Days before', '1 week', 'Custom'] as const;
type NotifyPreset = (typeof NOTIFY_PRESETS)[number];

const toOptions = (values: string[]): DropdownOption[] => values.map((v) => ({ label: v, value: v }));

const PRIORITIES: { key: Priority; dot: BadgeDotColor }[] = [
  { key: 'Urgent', dot: 'red' },
  { key: 'Normal', dot: 'amber' },
  { key: 'Low', dot: 'blue' },
  { key: 'None', dot: 'neutral' },
];

const TASK_STATUS_COLOR: Record<TaskStatus, AccentColor> = {
  Open: 'blue',
  'In progress': 'amber',
  Completed: 'lime',
};
const PRIORITY_BADGE_COLOR: Record<Priority, AccentColor> = {
  Urgent: 'red',
  Normal: 'amber',
  Low: 'blue',
  None: 'neutral',
};
const OPTION_STATUS_COLOR: Record<TaskOption['status'], AccentColor> = {
  Accepted: 'emerald',
  Awaiting: 'amber',
  Rejected: 'red',
};
type Stage = 'Underwriting' | 'Payment pending';
const STATUS_STAGE: Record<TaskOption['status'], Stage> = {
  Accepted: 'Underwriting',
  Awaiting: 'Payment pending',
  Rejected: 'Payment pending',
};
const STAGE_COLOR: Record<Stage, AccentColor> = { Underwriting: 'blue', 'Payment pending': 'amber' };

// Per-channel colored border (always) + selected background tint (the end
// colour of the web's radial gradient — RN can't render radial inline).
// `img` is a bundled logo; SMS has none and falls back to a blue tile.
const CHANNELS: { key: string; img: ImageSourcePropType | null; border: string; tint: string }[] = [
  { key: 'WhatsApp', img: dashboardImages.whatsapp, border: '#A7F3D0', tint: '#ECFDF5' },
  { key: 'Email', img: dashboardImages.mail, border: '#FED7AA', tint: '#FFF7ED' },
  { key: 'SMS', img: null, border: '#BFDBFE', tint: '#EFF6FF' },
];

const rupees = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`;
const ordinal = (d: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = d % 100;
  return `${d}${s[(v - 20) % 10] || s[v] || s[0]}`;
};
/** Short date for the "Custom" pill once a reminder is set — e.g. "24 Oct". */
const formatShort = (date: Date) => `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })}`;
const formatReminder = (date: Date) =>
  `${ordinal(date.getDate())} ${date.toLocaleString('en-US', { month: 'short' })} ${date.getFullYear()}`;

/** Pre-filled data for viewing/editing an existing task. */
export interface TaskDetailData {
  taskType: TaskType;
  task: TaskOption;
  status: TaskStatus;
  priority: Priority;
  source: string;
  createdOn: string;
  dueDate: Date | null;
  notify: boolean;
  notifyPreset: NotifyPreset | null;
  reminderDate: Date | null;
  assignees: string[];
  assignReadOnly?: boolean;
  notes: string;
  needDocs: boolean;
  sentDocuments: string[];
}

/** Build a demo edit-mode detail from a small set of fields. */
export const buildDemoDetail = (opts: {
  taskType: TaskType;
  customer: string;
  priority: Priority;
  status: TaskStatus;
  /** Banner subtitle — defaults to "Created by me". */
  source?: string;
  /** Current assignees — defaults to just "Self". */
  assignees?: string[];
  assignReadOnly?: boolean;
}): TaskDetailData => {
  const base = TASK_OPTIONS[opts.taskType][0];
  return {
    taskType: opts.taskType,
    task: { ...base, customer: opts.customer },
    status: opts.status,
    priority: opts.priority,
    source: opts.source ?? 'Created by me',
    createdOn: '10/11/2026',
    dueDate: new Date(2029, 10, 30),
    notify: true,
    notifyPreset: 'Custom',
    reminderDate: new Date(2026, 9, 24),
    assignees: opts.assignees ?? ['Self'],
    assignReadOnly: opts.assignReadOnly,
    notes: 'Follow up with the customer to get an update',
    needDocs: true,
    sentDocuments: ["Doctor's prescription", 'CT scan report'],
  };
};

// ---------------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------------

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <Text style={styles.fieldLabel}>
    {children}
    {required ? <Text style={styles.required}> *</Text> : null}
  </Text>
);

/** Create-mode searchable task picker — trigger + inline SearchBar/result list. */
const TaskPickerField: React.FC<{
  taskType: TaskType | null;
  value: TaskOption | null;
  onChange: (task: TaskOption) => void;
}> = ({ taskType, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const disabled = !taskType;

  const results = useMemo(() => {
    if (!taskType || !query.trim()) return [];
    const q = query.toLowerCase();
    return TASK_OPTIONS[taskType].filter(
      (o) => o.customer.toLowerCase().includes(q) || o.quoteId.toLowerCase().includes(q),
    );
  }, [taskType, query]);

  const label = taskType === 'Proposals' ? 'Proposal' : taskType === 'Renewals' ? 'Renewal' : 'Quote';

  return (
    <View>
      <Pressable
        style={[styles.selectTrigger, disabled && styles.selectDisabled]}
        onPress={() => !disabled && setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        <Text style={value ? styles.selectValue : styles.placeholder} numberOfLines={1}>
          {value ? value.customer : 'Select a task'}
        </Text>
        <CaretDown size={18} color={disabled ? colors.textDisabled : colors.textBody} />
      </Pressable>

      {open && !disabled ? (
        <View style={styles.pickerPanel}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search" />
          {query.trim() === '' ? (
            <View style={styles.pickerEmpty}>
              <View style={styles.pickerEmptyIcon}>
                <View style={styles.pickerEmptyIconInner}>
                  <Info size={22} color={colors.brand} />
                </View>
              </View>
              <Text style={styles.pickerEmptyText}>Search by {label} ID or customer name</Text>
            </View>
          ) : results.length === 0 ? (
            <View style={styles.pickerEmpty}>
              <Text style={styles.pickerEmptyText}>No results found</Text>
            </View>
          ) : (
            <View style={styles.pickerList}>
              {results.map((o) => (
                <Pressable
                  key={o.id}
                  style={[styles.resultCard, value?.id === o.id && styles.resultCardSelected]}
                  onPress={() => {
                    onChange(o);
                    setOpen(false);
                  }}
                >
                  <View style={styles.resultTop}>
                    <Text style={styles.resultId}>{o.quoteId}</Text>
                    <Badge label={o.status} variant="light" size="sm" color={OPTION_STATUS_COLOR[o.status]} />
                  </View>
                  <Text style={styles.resultMeta}>
                    Customer: <Text style={styles.resultMetaStrong}>{o.customer}</Text>   Premium:{' '}
                    <Text style={styles.resultMetaStrong}>{rupees(o.premium)}</Text>
                  </Text>
                  <Text style={styles.resultMeta}>
                    LOB: <Text style={styles.resultMetaStrong}>{o.lob}</Text>
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
};

/** Multi-select field — chip trigger that opens a bottom-sheet checkbox list. */
const MultiSelectField: React.FC<{
  options: DropdownOption[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  /** Bottom-sheet title. */
  title: string;
  disabled?: boolean;
  /** Values that can't be removed (rendered as disabled, locked chips). */
  lockedValues?: string[];
}> = ({ options, values, onChange, placeholder, title, disabled, lockedValues }) => {
  const [open, setOpen] = useState(false);
  const isLocked = (v: string) => !!lockedValues?.includes(v);
  // Locked options can't be toggled off in the sheet either.
  const sheetOptions = lockedValues?.length
    ? options.map((o) => (isLocked(o.value) ? { ...o, disabled: true } : o))
    : options;
  return (
    <View>
      <Pressable
        style={[styles.selectTrigger, disabled && styles.selectDisabled]}
        onPress={() => !disabled && setOpen(true)}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        <View style={styles.chipWrap}>
          {values.length === 0 ? (
            <Text style={styles.placeholder}>{placeholder}</Text>
          ) : (
            values.map((v) => (
              <Tag
                key={v}
                label={options.find((o) => o.value === v)?.label ?? v}
                size="sm"
                disabled={disabled || isLocked(v)}
                onRemove={disabled || isLocked(v) ? undefined : () => onChange(values.filter((x) => x !== v))}
              />
            ))
          )}
        </View>
        <CaretDown size={18} color={disabled ? colors.textDisabled : colors.textBody} />
      </Pressable>

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={title}
        primaryAction={{ label: 'Done', onPress: () => setOpen(false) }}
      >
        <MultiSelectDropdown options={sheetOptions} values={values} onChange={onChange} />
      </BottomSheet>
    </View>
  );
};

/** Single-select field — trigger + bottom sheet whose rows carry a checkbox. */
const SingleSelectField: React.FC<{
  options: DropdownOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  title: string;
}> = ({ options, value, onChange, placeholder, title }) => {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label;
  return (
    <View>
      <Pressable style={styles.selectTrigger} onPress={() => setOpen(true)} accessibilityRole="button">
        <Text style={value ? styles.selectValue : styles.placeholder} numberOfLines={1}>
          {selectedLabel ?? placeholder}
        </Text>
        <CaretDown size={18} color={colors.textBody} />
      </Pressable>

      <BottomSheet visible={open} onClose={() => setOpen(false)} title={title}>
        <View style={styles.optionList}>
          {options.map((o) => (
            <Pressable
              key={o.value}
              style={[styles.optionRow, value === o.value && styles.optionRowActive]}
              onPress={() => {
                onChange(o.value);
                setOpen(false);
              }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: value === o.value }}
            >
              <Checkbox
                size="sm"
                checked={value === o.value}
                onChange={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              />
              <Text style={styles.optionLabel}>{o.label}</Text>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
};

const SummaryCard: React.FC<{ task: TaskOption; showView: boolean; onView?: () => void }> = ({
  task,
  showView,
  onView,
}) => (
  <View style={styles.summaryCard}>
    <View style={styles.summaryHead}>
      <Text style={styles.summaryName}>{task.customer}</Text>
      <Badge
        label={STATUS_STAGE[task.status]}
        variant="light"
        size="sm"
        color={STAGE_COLOR[STATUS_STAGE[task.status]]}
        style={styles.centerBadge}
      />
      {showView ? (
        <Button
          label="View"
          variant="tertiary"
          size="sm"
          trailingIcon={<ArrowUpRight size={16} color={colors.brand} weight="bold" />}
          onPress={onView}
          style={styles.viewBtn}
        />
      ) : null}
    </View>
    <View style={styles.summaryGrid}>
      {[
        ['Quote ID:', task.displayId],
        ['Policy Type:', task.policyType],
        ['Premium:', rupees(task.premium)],
        ['Expiring on:', task.expiringOn],
      ].map(([label, val]) => (
        <View key={label} style={styles.summaryField}>
          <Text style={styles.summaryFieldLabel}>{label}</Text>
          <Text style={styles.summaryFieldValue}>{val}</Text>
        </View>
      ))}
    </View>
  </View>
);

// ---------------------------------------------------------------------------
// Main modal
// ---------------------------------------------------------------------------

export interface TaskDetailModalProps {
  visible: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  detail?: TaskDetailData;
  onView?: () => void;
  onDelete?: () => void;
  onUpdate?: () => void;
  onComplete?: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  visible,
  onClose,
  mode = 'create',
  detail,
  onView,
  onDelete,
  onUpdate,
  onComplete,
}) => {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const isEdit = mode === 'edit';
  // Assigned-to-me tasks: the pre-filled assignee(s) are locked (can't be removed).
  const lockedAssignees =
    isEdit && detail?.source?.startsWith('Assigned to me') ? detail.assignees : undefined;

  const [taskType, setTaskType] = useState<TaskType | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskOption | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<Priority | null>(null);
  const [notify, setNotify] = useState(false);
  const [notifyPreset, setNotifyPreset] = useState<NotifyPreset | null>(null);
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [status, setStatus] = useState<TaskStatus | null>(null);
  const [notes, setNotes] = useState('');
  const [needDocs, setNeedDocs] = useState(false);
  const [docsExpanded, setDocsExpanded] = useState(false);
  const [docTypes, setDocTypes] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [docMessage, setDocMessage] = useState('');
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  // Load an existing task into the form when opening in edit mode.
  useEffect(() => {
    if (!visible || !isEdit || !detail) return;
    setTaskType(detail.taskType);
    setSelectedTask(detail.task);
    setStatus(detail.status);
    setPriority(detail.priority);
    setDueDate(detail.dueDate);
    setNotify(detail.notify);
    setNotifyPreset(detail.notifyPreset);
    setReminderDate(detail.reminderDate);
    setShowReminder(detail.notify && !!detail.reminderDate);
    setAssignees(detail.assignees);
    setNotes(detail.notes);
    setNeedDocs(detail.needDocs);
    setDocsExpanded(detail.needDocs);
    setShowUpdateToast(false);
  }, [visible, isEdit, detail]);

  const reset = () => {
    setTaskType(null);
    setSelectedTask(null);
    setDueDate(null);
    setPriority(null);
    setNotify(false);
    setNotifyPreset(null);
    setReminderDate(null);
    setShowReminder(false);
    setAssignees([]);
    setStatus(null);
    setNotes('');
    setNeedDocs(false);
    setDocsExpanded(false);
    setDocTypes([]);
    setChannels([]);
    setDocMessage('');
    setShowUpdateToast(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const canSubmit = !!taskType && !!selectedTask && assignees.length > 0 && !!status;

  const toggleChannel = (key: string) =>
    setChannels((prev) => (prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]));

  const fireReminder = (date: Date) => {
    setReminderDate(date);
    setShowReminder(true);
  };

  const handlePreset = (preset: NotifyPreset) => {
    setNotifyPreset(preset);
    if (preset === 'Custom') {
      setCustomOpen(true); // open the calendar directly
      return;
    }
    const base = dueDate ?? new Date();
    const next = new Date(base);
    next.setDate(next.getDate() - (preset === '3 Days before' ? 3 : 7));
    fireReminder(next);
  };

  const handleUpdate = () => {
    // Closing a task requires an extra confirmation.
    if (status === 'Completed') {
      setShowCompleteConfirm(true);
      return;
    }
    onUpdate?.();
    setShowUpdateToast(true);
    // Keep the modal open and bring the success toast into view.
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete?.();
    handleClose();
  };

  const confirmComplete = () => {
    setShowCompleteConfirm(false);
    onComplete?.();
    handleClose();
  };

  const sentDocuments = detail?.sentDocuments ?? [];
  const docSentBanner =
    isEdit && sentDocuments.length > 0 ? (
      <Toast
        variant="success"
        layout="inline"
        title="Document request has already been sent to the customer."
        message={`The following documents have been requested\n${sentDocuments.map((d, i) => `${i + 1}. ${d}`).join(', ')}`}
      />
    ) : null;

  return (
    <RNModal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={handleClose}>
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Task</Text>
            {isEdit && status ? (
              // Proposals/Renewals expose "View" via the tappable status badge
              // (the summary-card View link is Quotes-only).
              taskType === 'Proposals' || taskType === 'Renewals' ? (
                <Pressable onPress={onView} accessibilityRole="button" accessibilityLabel={`View ${taskType}`}>
                  <Badge label={status} variant="light" size="sm" color={TASK_STATUS_COLOR[status]} style={styles.centerBadge} />
                </Pressable>
              ) : (
                <Badge label={status} variant="light" size="sm" color={TASK_STATUS_COLOR[status]} style={styles.centerBadge} />
              )
            ) : null}
          </View>
          <Pressable onPress={handleClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
            <X size={22} color={colors.textBody} />
          </Pressable>
        </View>

        <ScrollView ref={scrollRef} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* Edit banner */}
          {isEdit && selectedTask ? (
            // A plain View owns the radius, padding and layout; the gradient is a
            // background-only layer behind it. On iOS a gradient that hosts its
            // own children mis-sizes them and paints over them, clipping the card
            // off the right edge of the screen.
            <View style={styles.titleCard}>
              <LinearGradient
                colors={['#EFF6FF', '#FFFFFF']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.rowBetween}>
                <Text style={styles.titleText}>
                  {taskType} - {selectedTask.customer}
                </Text>
                {priority ? (
                  <Badge label={priority} variant="solid" size="sm" color={PRIORITY_BADGE_COLOR[priority]} style={styles.centerBadge} />
                ) : null}
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.metaMuted}>{detail?.source}</Text>
                <Text style={styles.metaMuted}>Created on {detail?.createdOn}</Text>
              </View>
            </View>
          ) : null}

          {/* Create-mode task pickers */}
          {!isEdit ? (
            <>
              <View style={styles.field}>
                <FieldLabel required>Select task type</FieldLabel>
                <SingleSelectField
                  options={toOptions(TASK_TYPES)}
                  value={taskType}
                  onChange={(v) => {
                    setTaskType(v as TaskType);
                    setSelectedTask(null);
                  }}
                  placeholder="Select a task type"
                  title="Select task type"
                />
              </View>
              <View style={styles.field}>
                <FieldLabel required>Select task</FieldLabel>
                <TaskPickerField taskType={taskType} value={selectedTask} onChange={setSelectedTask} />
              </View>
            </>
          ) : null}

          {/* Summary card */}
          {selectedTask ? (
            <SummaryCard task={selectedTask} showView={isEdit && taskType === 'Quotes'} onView={onView} />
          ) : null}

          {/* Update-success toast — sits just below the summary card. */}
          {isEdit && showUpdateToast ? (
            <ToastGlobal
              variant="success"
              title="Task Updated Successfully"
              message="Your task has been updated successfully."
              onClose={() => setShowUpdateToast(false)}
            />
          ) : null}

          {/* Documents already requested (edit) */}
          {docSentBanner}

          {/* Due date */}
          <View style={styles.field}>
            <FieldLabel>Due Date</FieldLabel>
            <DatePicker value={dueDate} onChange={setDueDate} placeholder="Enter date" />
          </View>

          {/* Priority */}
          <View style={styles.field}>
            <FieldLabel>Set Priority</FieldLabel>
            <View style={styles.pillRow}>
              {PRIORITIES.map((p) => (
                <Tag
                  key={p.key}
                  label={p.key}
                  size="sm"
                  dot={p.dot}
                  selected={priority === p.key}
                  showIndicator={false}
                  onPress={() => setPriority(p.key)}
                />
              ))}
            </View>
          </View>

          {/* Notify me */}
          <View style={styles.field}>
            <Toggle
              value={notify}
              onValueChange={(v) => {
                setNotify(v);
                if (!v) {
                  setNotifyPreset(null);
                  setReminderDate(null);
                  setShowReminder(false);
                }
              }}
              label="Notify Me"
              size="sm"
            />

            {/* Preset chips sit below the toggle. */}
            {notify ? (
              <View style={styles.pillRow}>
                {NOTIFY_PRESETS.map((preset) => {
                  const label =
                    preset === 'Custom' && notifyPreset === 'Custom' && reminderDate
                      ? formatShort(reminderDate)
                      : preset;
                  return (
                    <Tag
                      key={preset}
                      label={label}
                      size="sm"
                      selected={notifyPreset === preset}
                      showIndicator={false}
                      onPress={() => handlePreset(preset)}
                    />
                  );
                })}
              </View>
            ) : null}

            {showReminder && reminderDate ? (
              <ToastGlobal
                variant="success"
                title={`A reminder for this task is set for ${formatReminder(reminderDate)}.`}
                onClose={() => setShowReminder(false)}
              />
            ) : null}

            {/* Custom-reminder calendar — opens straight from the "Custom" chip. */}
            <BottomSheet
              visible={customOpen}
              onClose={() => setCustomOpen(false)}
              title="Set reminder"
              contentMinHeight={380}
            >
              <Calendar
                mode="single"
                selectedDate={reminderDate}
                onDateSelect={(d) => {
                  fireReminder(d);
                  setCustomOpen(false);
                }}
              />
            </BottomSheet>
          </View>

          {/* Assign to */}
          <View style={styles.field}>
            <FieldLabel required>Assign to</FieldLabel>
            <MultiSelectField
              options={toOptions(PEOPLE)}
              values={assignees}
              onChange={setAssignees}
              placeholder="Select Options"
              title="Assign to"
              disabled={isEdit && !!detail?.assignReadOnly}
              lockedValues={lockedAssignees}
            />
          </View>

          {/* Status */}
          <View style={styles.field}>
            <FieldLabel required>Select status</FieldLabel>
            <Dropdown
              options={STATUS_DROPDOWN_OPTIONS}
              value={status}
              onChange={(v) => setStatus(v as TaskStatus)}
              placeholder="Select a status"
            />
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <FieldLabel>Notes</FieldLabel>
            <TextArea value={notes} onChangeText={setNotes} placeholder="Describe what needs to be done…" rows={3} />
          </View>

          {/* Need documents */}
          <View style={styles.docsCard}>
            <Pressable style={styles.docsHeader} onPress={() => setDocsExpanded((e) => !e)} accessibilityRole="button">
              <Checkbox
                size="sm"
                checked={needDocs}
                onChange={(v) => {
                  setNeedDocs(v);
                  if (v) setDocsExpanded(true);
                }}
                label="Need documents for this task from customer?"
                style={styles.docsCheckbox}
              />
              <CaretDown size={18} color={colors.textBody} style={docsExpanded ? styles.caretUp : undefined} />
            </Pressable>

            {docsExpanded && needDocs ? (
              <View style={styles.docsBody}>
                {docSentBanner}
                <View style={styles.field}>
                  <FieldLabel required>Select document type</FieldLabel>
                  <MultiSelectField
                    options={toOptions(DOC_TYPES)}
                    values={docTypes}
                    onChange={setDocTypes}
                    placeholder="Select document type"
                    title="Select document type"
                  />
                </View>

                <View style={styles.field}>
                  <FieldLabel required>Send request through</FieldLabel>
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

                <View style={styles.field}>
                  <FieldLabel>Add a message</FieldLabel>
                  <TextArea value={docMessage} onChangeText={setDocMessage} placeholder="Enter a message…" rows={3} />
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* Footer — one full-width action per row, primary on top */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          {isEdit ? (
            <>
              <Button label="Update" variant="primary" fullWidth disabled={!canSubmit} onPress={handleUpdate} />
              <Button
                label="Delete Task"
                variant="secondaryDestructive"
                fullWidth
                onPress={() => setShowDeleteConfirm(true)}
              />
            </>
          ) : (
            <>
              <Button label="Create task" variant="primary" fullWidth disabled={!canSubmit} onPress={handleClose} />
              <Button label="Cancel" variant="secondaryGray" fullWidth onPress={handleClose} />
            </>
          )}
        </View>
      </View>

      {/* Delete confirmation */}
      <Modal
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        iconName="danger"
        title="Delete this task?"
        primaryAction={{ label: 'Confirm', tone: 'danger', onPress: confirmDelete }}
        secondaryAction={{ label: 'Cancel', tone: 'neutral', onPress: () => setShowDeleteConfirm(false) }}
      >
        <Text style={styles.confirmText}>
          This task will be removed from the calendar and for everyone it's assigned to. This action cannot be undone.
        </Text>
      </Modal>

      {/* Mark-as-completed confirmation */}
      <Modal
        visible={showCompleteConfirm}
        onClose={() => setShowCompleteConfirm(false)}
        iconName="success"
        title="Mark this task as Completed?"
        primaryAction={{ label: 'Confirm', onPress: confirmComplete }}
        secondaryAction={{ label: 'Cancel', tone: 'neutral', onPress: () => setShowCompleteConfirm(false) }}
      >
        <Text style={styles.confirmText}>
          Are you sure you would like to close this task? You can access this task from the table or calendar later as
          well.
        </Text>
      </Modal>
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
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTitle: { fontFamily: fontFamilyForWeight('600'), fontSize: 18, fontWeight: '600', color: colors.textHeading },

  body: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },

  titleCard: { borderRadius: radius.xl, padding: spacing.lg, gap: spacing.sm, overflow: 'hidden' },
  // Badges default to `alignSelf: 'flex-start'`; recentre against their row.
  centerBadge: { alignSelf: 'center' },
  titleText: { flex: 1, fontFamily: fontFamilyForWeight('600'), fontSize: 16, fontWeight: '600', color: colors.textHeading },
  metaMuted: { flexShrink: 1, fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textBody },

  // Summary card
  summaryCard: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, backgroundColor: colors.surfaceSubtle },
  summaryHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  summaryName: { fontFamily: fontFamilyForWeight('600'), fontSize: 16, fontWeight: '600', color: colors.textHeading },
  viewBtn: { marginLeft: 'auto' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.md },
  summaryField: { width: '50%', gap: 2 },
  summaryFieldLabel: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textBody },
  summaryFieldValue: { fontFamily: typography.fontFamily, fontSize: 13, lineHeight: 18, color: colors.textHeading },

  field: { gap: spacing.sm },
  fieldLabel: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody },
  required: { color: colors.dangerText },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },

  // Select-style trigger (task picker, multi-select)
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
  selectDisabled: { backgroundColor: colors.surfaceSubtle, borderColor: colors.surfaceMuted },
  selectValue: { flex: 1, fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  placeholder: { flex: 1, fontFamily: typography.fontFamily, fontSize: 14, color: colors.textMuted },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs, flex: 1 },

  // Single-select bottom-sheet option rows (checkbox + label).
  optionList: { gap: spacing.xs },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  // Selected row keeps the DS Dropdown's brand-tinted highlight.
  optionRowActive: { backgroundColor: colors.brandSubtle },
  optionLabel: { flex: 1, fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textHeading },

  // Task-picker inline panel
  pickerPanel: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  pickerEmpty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  // Double concentric circle: outer #EFF6FF, inner #DBEAFE, brand glyph.
  pickerEmptyIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerEmptyIconInner: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerEmptyText: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody, textAlign: 'center', maxWidth: 220 },
  pickerList: { gap: spacing.sm },
  resultCard: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.md, gap: 2 },
  resultCardSelected: { borderColor: colors.brand, backgroundColor: colors.brandSubtle },
  resultTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  resultId: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  resultMeta: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  resultMetaStrong: { color: colors.textHeading },

  // Documents section
  docsCard: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl, overflow: 'hidden' },
  docsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.surfaceSubtle,
  },
  docsCheckbox: { flex: 1 },
  caretUp: { transform: [{ rotate: '180deg' }] },
  docsBody: { padding: spacing.lg, gap: spacing.lg },

  channelRow: { flexDirection: 'row', gap: spacing.sm },
  channelCard: {
    flex: 1,
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
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
  channelCheck: { position: 'absolute', top: spacing.sm, right: spacing.sm },
  channelLabel: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textBody },

  // Actions stack, one full-width button per row.
  footer: {
    alignItems: 'stretch',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },

  confirmText: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textBody,
    textAlign: 'center',
  },

});
