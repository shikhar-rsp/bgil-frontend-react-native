import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { ArrowClockwise, Cake, CalendarBlank, CaretDown, Check, Confetti, Copy, Info, NotePencil, Phone, Plus, Table as TableIcon, WarningCircle, XCircle } from 'phosphor-react-native';
import {
  Avatar,
  AvatarGroup,
  Badge,
  BottomSheet,
  Button,
  Checkbox,
  DatePicker,
  Filter,
  FilterButton,
  SearchBar,
  SegmentedControl,
  Table,
  Tag,
  Toast,
  accent,
  colors,
  fontFamilyForWeight,
  radius,
  shadow,
  spacing,
  typography,
  type AccentColor,
  type BadgeDotColor,
  type FilterGroup,
  type TableColumn,
} from '@atlas-ds/react-native';
import { ActionMenu } from '../common/ActionMenu';
import { MonthCalendar, type MonthEvents } from './MonthCalendar';
import { TaskDetailModal, buildDemoDetail, type TaskDetailData, type TaskType } from './TaskDetailModal';
import { EventDetailModal, buildEventDetail, type EventDetail } from './EventDetailModal';
import { MeetingDetailModal, buildMeetingDetail, type MeetingDetail, type Priority as MeetingPriority } from './MeetingDetailModal';
import type { OpenTaskRequest } from '../../../../navigation';

// ---------------------------------------------------------------------------
// Model + fixtures (mirrors the Figma reference)
// ---------------------------------------------------------------------------

type Category = 'Quote' | 'Proposal' | 'Renewal';
type Priority = 'Urgent' | 'Normal' | 'None' | 'Low';
type Status = 'Open' | 'In progress' | 'Closed';

interface TaskRow {
  id: string;
  customer: string;
  category: Category;
  description: string;
  /** Human "due in" label — e.g. 'Today', '2 days', '3 Days ago'. */
  dueIn: string;
  /** Past-due rows show the due label in red. */
  overdue?: boolean;
  priority: Priority;
  /** Assignee names — rendered as an overlapping avatar group. */
  assignees: string[];
  status: Status;
  /** When set, the task was assigned to me by this person (vs. created by me). */
  assignedBy?: string;
}

const TASKS: TaskRow[] = [
  { id: '1', customer: 'Priya Sharma', category: 'Quote', description: 'How to sell health care insurance', dueIn: 'Today', priority: 'Urgent', assignees: ['Amit Rao'], status: 'Open' },
  { id: '2', customer: 'Arijit Kumar', category: 'Proposal', description: 'Priti Sinha - 4 wheeler motor', dueIn: 'Today', priority: 'Normal', assignees: ['Amit Rao', 'Neha Das'], status: 'In progress', assignedBy: 'Manas Patel' },
  { id: '3', customer: 'Nikhil Patel', category: 'Renewal', description: 'Call customer to confirm renewal again', dueIn: 'Today', priority: 'Normal', assignees: ['Amit Rao'], status: 'Open' },
  { id: '4', customer: 'Rishabh Singh', category: 'Renewal', description: 'Call the customer to give status update', dueIn: '3 Days ago', overdue: true, priority: 'None', assignees: ['Amit Rao', 'Neha Das'], status: 'Closed' },
  { id: '5', customer: 'Gayatri Sharma', category: 'Renewal', description: 'Follow up with the internal team for status update', dueIn: '2 days', priority: 'Low', assignees: ['Amit Rao'], status: 'Open', assignedBy: 'Manas Patel' },
  { id: '6', customer: 'Madhu Verma', category: 'Proposal', description: 'Bhuvan Das - RM monthly performance review', dueIn: '5 Days ago', overdue: true, priority: 'Urgent', assignees: ['Amit Rao'], status: 'In progress' },
];

/** Category → accent used by the dot chips and the in-row badge. */
const CATEGORY_COLOR: Record<Category, AccentColor> = {
  Quote: 'orange',
  Proposal: 'violet',
  Renewal: 'rose',
};

/** Priority → solid badge accent. */
const PRIORITY_COLOR: Record<Priority, AccentColor> = {
  Urgent: 'red',
  Normal: 'amber',
  None: 'neutral',
  Low: 'blue',
};

/** Status → light badge accent. */
const STATUS_COLOR: Record<Status, AccentColor> = {
  Open: 'blue',
  'In progress': 'amber',
  Closed: 'lime',
};

const STATUSES = Object.keys(STATUS_COLOR) as Status[];

/** Assignable people shown in the "add assignee" bottom sheet. */
type Role = 'IMD' | 'Sub-IMD';
const ROLE_COLOR: Record<Role, AccentColor> = { IMD: 'emerald', 'Sub-IMD': 'blue' };
const PEOPLE: { id: string; name: string; role: Role }[] = [
  { id: 'self', name: 'Self', role: 'IMD' },
  { id: 'manish', name: 'Manish Tiwari', role: 'Sub-IMD' },
  { id: 'rahul', name: 'Rahul Jain', role: 'Sub-IMD' },
  { id: 'manas', name: 'Manas Patel', role: 'Sub-IMD' },
  { id: 'abhijit', name: 'Abhijit Desai', role: 'Sub-IMD' },
  { id: 'rohini', name: 'Rohini Kumar', role: 'Sub-IMD' },
  { id: 'sailesh', name: 'Sailesh Das', role: 'Sub-IMD' },
  { id: 'jay', name: 'Jay Shetty', role: 'Sub-IMD' },
];

// ---------------------------------------------------------------------------
// Events model + fixtures
// ---------------------------------------------------------------------------

type EventType = 'Birthday' | 'Member Birthday' | 'Multiple Birthday' | 'Anniversary';
type EventStatus = 'Pending' | 'Completed';

interface EventRow {
  id: string;
  customer: string;
  date: string;
  /** All occasions this event covers; a row can combine e.g. a member
   *  birthday and an anniversary. The first drives the cell badge colour. */
  occasions: EventType[];
  status: EventStatus;
  /** True once the wish has been sent ("Message sent"), else "Send wish". */
  sent: boolean;
}

/** Device today as `dd/mm/yyyy` — the format the event rows carry. */
const TODAY_DATE = (() => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
})();

const EVENTS: EventRow[] = [
  // Dated today so the "Today's event" filter has something to match.
  { id: '1', customer: 'Ankit Sharma', date: TODAY_DATE, occasions: ['Birthday'], status: 'Pending', sent: false },
  { id: '2', customer: 'Priya Sharma', date: '01/11/2026', occasions: ['Member Birthday'], status: 'Completed', sent: true },
  { id: '3', customer: 'Arijit Kumar', date: '14/11/2026', occasions: ['Multiple Birthday'], status: 'Completed', sent: true },
  { id: '4', customer: 'Nikhil Patel', date: '15/11/2026', occasions: ['Birthday'], status: 'Pending', sent: false },
  { id: '5', customer: 'Rishabh Singh', date: '19/11/2026', occasions: ['Anniversary'], status: 'Completed', sent: true },
  { id: '6', customer: 'Gayatri Sharma', date: '24/11/2026', occasions: ['Member Birthday', 'Anniversary'], status: 'Pending', sent: false },
];

/** Event type → solid badge accent (all birthdays pink, anniversary violet). */
const EVENT_TYPE_COLOR: Record<EventType, AccentColor> = {
  Birthday: 'pink',
  'Member Birthday': 'pink',
  'Multiple Birthday': 'pink',
  Anniversary: 'violet',
};

/** Event status → light badge accent. */
const EVENT_STATUS_COLOR: Record<EventStatus, AccentColor> = {
  Pending: 'blue',
  Completed: 'lime',
};

const EVENT_FILTERS: { value: 'all' | 'birthday' | 'anniversary'; label: string; dot?: BadgeDotColor }[] = [
  { value: 'all', label: 'All' },
  { value: 'birthday', label: 'Birthday', dot: 'pink' },
  { value: 'anniversary', label: 'Anniversary', dot: 'violet' },
];

// ---------------------------------------------------------------------------
// Meetings model + fixtures
// ---------------------------------------------------------------------------

type MeetingMode = 'Virtual' | 'In-Person';

/** Who the meeting is with — drives the detail modal (customer/sub-IMD = editable,
 *  IMD = read-only with Request Reschedule) and the header colour. */
type MeetingKind = 'customer' | 'sub-imd' | 'imd';

interface MeetingRow {
  id: string;
  title: string;
  agenda: string;
  schedule: string;
  priority: Priority;
  attendees: string[];
  mode: MeetingMode;
  /** Row action label — "Join Meeting" (virtual) / "View Address" (in-person). */
  action: string;
  kind: MeetingKind;
  /** True when I scheduled it (editable); else scheduled with me (read-only). */
  createdByMe: boolean;
  /** Who scheduled it, when not me. */
  scheduledBy?: string;
}

const MEETINGS: MeetingRow[] = [
  { id: '1', title: 'Meeting with Customer', agenda: 'Meeting scheduled', schedule: '30/11/2026, 12:00 PM - 01:00 PM', priority: 'Normal', attendees: ['Priti Sinha'], mode: 'In-Person', action: 'View Address', kind: 'customer', createdByMe: true },
  { id: '2', title: 'Meeting with the Sub-IMDs', agenda: 'Meeting scheduled', schedule: '29/11/2026, 12:00 PM - 01:00 PM', priority: 'Normal', attendees: ['Manas Patel'], mode: 'In-Person', action: 'View Address', kind: 'sub-imd', createdByMe: true },
  { id: '3', title: 'Meeting with IMDs', agenda: 'How to sell health care insurance', schedule: '27/11/2026, 12:00 PM - 01:00 PM', priority: 'Normal', attendees: ['Manish Jain', 'Manas Patel', 'Rahul Jain'], mode: 'Virtual', action: 'Join Meeting', kind: 'imd', createdByMe: false, scheduledBy: 'Manish Jain' },
  { id: '4', title: 'Policy review with the team', agenda: 'Meeting scheduled', schedule: '18/08/2026, 02:00 PM - 03:00 PM', priority: 'Urgent', attendees: ['Manas Patel'], mode: 'In-Person', action: 'View Address', kind: 'sub-imd', createdByMe: true },
  { id: '5', title: 'Renewal status update', agenda: 'Call customer to confirm renewal again', schedule: 'Today, 02:00PM - 03:00PM', priority: 'Normal', attendees: ['Priti Sinha'], mode: 'Virtual', action: 'Join Meeting', kind: 'customer', createdByMe: false, scheduledBy: 'Manish Jain' },
  { id: '6', title: 'IMD sync (scheduled by me)', agenda: 'Team alignment for the quarter', schedule: '22/11/2026, 12:00PM - 01:00PM', priority: 'None', attendees: ['Manish Jain', 'Rahul Jain'], mode: 'Virtual', action: 'Join Meeting', kind: 'imd', createdByMe: true },
  { id: '7', title: 'Prospect intro call', agenda: 'Intro call with a new prospect', schedule: '25/11/2026, 03:00 PM - 03:30 PM', priority: 'Low', attendees: ['Rohini Kumar'], mode: 'Virtual', action: 'Join Meeting', kind: 'customer', createdByMe: true },
];

const MEETING_FILTERS: { value: 'all' | MeetingMode; label: string; dot?: BadgeDotColor }[] = [
  { value: 'all', label: 'All' },
  { value: 'Virtual', label: 'Virtual', dot: 'emerald' },
  { value: 'In-Person', label: 'In-Person', dot: 'warning' },
];

/** Bottom-sheet filter groups for the Meetings tab. */
const MEETING_FILTER_GROUPS: FilterGroup[] = [
  {
    key: 'mode',
    label: 'Meeting Mode',
    options: [
      { value: 'Virtual', label: 'Virtual' },
      { value: 'In-Person', label: 'In-Person' },
    ],
  },
  {
    key: 'priority',
    label: 'Priority',
    options: [
      { value: 'Urgent', label: 'Urgent' },
      { value: 'Normal', label: 'Normal' },
      { value: 'Low', label: 'Low' },
      { value: 'None', label: 'None' },
    ],
  },
  {
    key: 'type',
    label: 'Type',
    options: [
      { value: 'me', label: 'Scheduled by Me' },
      { value: 'others', label: 'Scheduled by Others' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Calendar-view derivation (keyed by day-of-month)
// ---------------------------------------------------------------------------

/** Day-of-month a task is due on, read from its "due in" label ("Today",
 *  "2 days", "3 Days ago") relative to the device clock. */
const taskDay = (dueIn: string): number => {
  const now = new Date();
  const label = dueIn.trim().toLowerCase();
  if (label === 'today') return now.getDate();
  const match = label.match(/^(\d+)\s*day/);
  const days = match ? Number(match[1]) : 0;
  const delta = label.includes('ago') ? -days : days;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + delta).getDate();
};

// Calendar chips are derived from the (filtered) task list so both views show
// the same rows and a tapped chip opens that task. Coloured by category; the
// `id` links each chip back to its TASKS row, `done` marks closed tasks.
const buildTaskCalendar = (tasks: TaskRow[]): MonthEvents =>
  tasks.reduce<MonthEvents>((acc, t) => {
    const day = taskDay(t.dueIn);
    if (!acc[day]) acc[day] = [];
    acc[day].push({ label: t.customer, color: CATEGORY_COLOR[t.category], done: t.status === 'Closed', id: t.id });
    return acc;
  }, {});

/** Day-of-month from an event's `dd/mm/yyyy` date. */
const eventDay = (date: string): number => {
  const match = date.match(/^(\d{1,2})\b/);
  return match ? Number(match[1]) : 1;
};

/** "Ankit Sharma's Birthday" / "…'s Anniversary" / "…'s Birthday & Anniversary". */
const eventLabel = (e: EventRow): string => {
  const hasAnniv = e.occasions.includes('Anniversary');
  const hasBday = e.occasions.some((o) => o.includes('Birthday'));
  const word = hasAnniv && hasBday ? 'Birthday & Anniversary' : hasAnniv ? 'Anniversary' : 'Birthday';
  return `${e.customer}'s ${word}`;
};

// Calendar chips are derived from the (filtered) events list so a tapped chip
// opens the same event and the category/search filters apply to the calendar
// too. Anniversary → violet, birthday → rose; the `id` links each chip back to
// its EVENTS row.
const buildEventCalendar = (events: EventRow[]): MonthEvents =>
  events.reduce<MonthEvents>((acc, e) => {
    const day = eventDay(e.date);
    if (!acc[day]) acc[day] = [];
    acc[day].push({ label: eventLabel(e), color: e.occasions.includes('Anniversary') ? 'violet' : 'rose', id: e.id });
    return acc;
  }, {});

/** Day-of-month a meeting falls on: the leading `dd/` of its schedule, or the
 *  device's today for a "Today, …" schedule. */
const meetingDay = (schedule: string): number => {
  if (schedule.trim().toLowerCase().startsWith('today')) return new Date().getDate();
  const match = schedule.match(/^(\d{1,2})\b/);
  return match ? Number(match[1]) : 1;
};

// Calendar chips are derived from the (filtered) meetings list so a tapped chip
// opens the same meeting and the filters apply to the calendar too. Coloured by
// mode: Virtual → emerald, In-Person → orange; the `id` links each chip back to
// its MEETINGS row.
const buildMeetingCalendar = (meetings: MeetingRow[]): MonthEvents =>
  meetings.reduce<MonthEvents>((acc, m) => {
    const day = meetingDay(m.schedule);
    if (!acc[day]) acc[day] = [];
    acc[day].push({ label: m.title, color: m.mode === 'Virtual' ? 'emerald' : 'orange', id: m.id });
    return acc;
  }, {});

const CATEGORY_FILTERS: { value: 'all' | Category; label: string; dot?: BadgeDotColor }[] = [
  { value: 'all', label: 'All' },
  { value: 'Quote', label: 'Quote', dot: 'warning' },
  { value: 'Proposal', label: 'Proposal', dot: 'violet' },
  { value: 'Renewal', label: 'Renewal', dot: 'rose' },
];

/** Bottom-sheet filter groups for the Tasks tab. */
const TASK_FILTER_GROUPS: FilterGroup[] = [
  {
    key: 'source',
    label: 'Source',
    options: [
      { value: 'created', label: 'Created by me' },
      { value: 'assigned', label: 'Assigned to me' },
      { value: 'sub-imd', label: 'Assigned to sub-IMD' },
    ],
  },
  {
    key: 'priority',
    label: 'Priority',
    options: [
      { value: 'Urgent', label: 'Urgent' },
      { value: 'Normal', label: 'Normal' },
      { value: 'Low', label: 'Low' },
      { value: 'None', label: 'None' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export type TasksTab = 'tasks' | 'events' | 'meetings';

/**
 * The "Tasks" bottom-nav surface. The Tasks / Events / Meetings switch is the
 * header segmented control (owned by DashboardScreen); this renders the body
 * for the active `tab`.
 */
export const TasksScreen: React.FC<{
  tab: TasksTab;
  /** A task's "View" → open the matching Business flow (by task type). */
  onViewTaskQuote?: (taskType: TaskType, customer: string) => void;
  /** A task to open in the detail modal (e.g. from a tapped notification). */
  openTask?: OpenTaskRequest | null;
  onOpenTaskHandled?: () => void;
  /** Logged-in persona — drives the meeting row's action menu. Default 'agent'. */
  persona?: 'agent' | 'rm';
}> = ({ tab, onViewTaskQuote, openTask, onOpenTaskHandled, persona = 'agent' }) => {
  const [createOpen, setCreateOpen] = useState(false);
  const [createMeetingOpen, setCreateMeetingOpen] = useState(false);

  const list =
    tab === 'events' ? (
      <EventsList />
    ) : tab === 'meetings' ? (
      <MeetingsList persona={persona} onCreate={() => setCreateMeetingOpen(true)} />
    ) : (
      <TasksList
        onViewTaskQuote={onViewTaskQuote}
        openTask={openTask}
        onOpenTaskHandled={onOpenTaskHandled}
        onCreate={() => setCreateOpen(true)}
      />
    );

  return (
    <View style={styles.tabSurface}>
      {list}

      {/* Floating create action — a task on Tasks, a meeting on Meetings. */}
      {tab === 'tasks' || tab === 'meetings' ? (
        <View style={styles.fab}>
          <Button
            iconOnly
            variant="primary"
            size="lg"
            label={tab === 'meetings' ? 'Schedule a meeting' : 'Create a task'}
            leadingIcon={<Plus size={24} color={colors.textOnBrand} weight="bold" />}
            onPress={() => (tab === 'meetings' ? setCreateMeetingOpen(true) : setCreateOpen(true))}
          />
        </View>
      ) : null}

      <TaskDetailModal visible={createOpen} onClose={() => setCreateOpen(false)} mode="create" />
      <MeetingDetailModal visible={createMeetingOpen} onClose={() => setCreateMeetingOpen(false)} create />
    </View>
  );
};

/** A filter chip in the shell's chip row — rendered with the DS `Tag`. */
interface ChipDef {
  value: string;
  label: string;
  dot?: BadgeDotColor;
}

/** Concentric double-ring badge (outer #EFF6FF / inner #DBEAFE) around a glyph. */
const RoundedIconBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.ringOuter}>
    <View style={styles.ringInner}>{children}</View>
  </View>
);

/** Shared empty-state fallback: a rounded icon badge + title + description, with
 *  an optional action button (e.g. "Create a task"). Used by the Tasks and
 *  Meetings tables and — inside the month — their calendars, whenever a filter
 *  combination matches nothing. */
const ListEmpty: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, description, actionLabel, onAction }) => (
  <View style={styles.listEmpty}>
    <RoundedIconBadge>
      <Info size={22} color={colors.brand} />
    </RoundedIconBadge>
    <Text style={styles.listEmptyTitle}>{title}</Text>
    <Text style={styles.listEmptyDesc}>{description}</Text>
    {actionLabel ? (
      <Button label={actionLabel} variant="secondaryGray" size="md" onPress={onAction} style={styles.listEmptyBtn} />
    ) : null}
  </View>
);

/**
 * Shared card + toolbar for the Tasks / Events lists: filter chips, view
 * toggles, search, and the date-range + filter row. The list-specific table
 * (or empty / calendar state) is passed as `children`.
 */
const ListShell: React.FC<{
  chips: ChipDef[];
  category: string;
  onCategory: (value: string) => void;
  todayLabel: string;
  quick: 'today' | 'completed' | null;
  onQuick: (next: 'today' | 'completed' | null) => void;
  view: 'table' | 'calendar';
  onView: (next: 'table' | 'calendar') => void;
  search: string;
  onSearch: (value: string) => void;
  /** Show the "Completed" quick filter. Default true. */
  showCompleted?: boolean;
  /** Filter groups for the bottom-sheet filter. Omit to leave Filter inert. */
  filterGroups?: FilterGroup[];
  /** Currently-applied filter selections, keyed by group. */
  appliedFilters?: Record<string, string[]>;
  /** Fired with the next selections when the user taps Apply. */
  onApplyFilters?: (values: Record<string, string[]>) => void;
  children: React.ReactNode;
}> = ({
  chips,
  category,
  onCategory,
  todayLabel,
  quick,
  onQuick,
  view,
  onView,
  search,
  onSearch,
  showCompleted = true,
  filterGroups,
  appliedFilters,
  onApplyFilters,
  children,
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  // Draft selections while the sheet is open; committed only on Apply.
  const [draft, setDraft] = useState<Record<string, string[]>>({});
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const appliedCount = Object.values(appliedFilters ?? {}).reduce((n, arr) => n + arr.length, 0);
  const isCalendar = view === 'calendar';

  // Switching to the calendar hides the search box, so drop any query with it —
  // otherwise it would keep filtering the grid with nothing on screen saying so.
  const changeView = (next: 'table' | 'calendar') => {
    if (next === 'calendar' && search) onSearch('');
    onView(next);
  };

  const openFilter = () => {
    setDraft(appliedFilters ?? {});
    setFilterOpen(true);
  };

  // Calendar / Table toggle. Table view gives it its own row above the search
  // box; calendar view (no search box, no range picker) pairs it with Filter.
  const viewToggle = (fullWidth: boolean) => (
    <SegmentedControl
      size="sm"
      fullWidth={fullWidth}
      value={view}
      onChange={(v) => changeView(v as 'table' | 'calendar')}
      options={[
        {
          label: 'Calendar',
          value: 'calendar',
          icon: <CalendarBlank size={16} color={view === 'calendar' ? colors.brandPressed : colors.textBody} />,
        },
        {
          label: 'Table',
          value: 'table',
          icon: <TableIcon size={16} color={view === 'table' ? colors.brandPressed : colors.textBody} />,
        },
      ]}
    />
  );

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Everything lives inside one shadowed card. */}
      <View style={styles.card}>
        {/* Category filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {chips.map((c) => (
            <Tag
              key={c.value}
              label={c.label}
              size="sm"
              dot={c.dot}
              selected={category === c.value}
              showIndicator={false}
              onPress={() => onCategory(c.value)}
            />
          ))}
        </ScrollView>

        {/* Quick filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolRow}>
          <Tag
            label={todayLabel}
            size="sm"
            selected={quick === 'today'}
            showIndicator={false}
            onPress={() => onQuick(quick === 'today' ? null : 'today')}
          />
          {showCompleted ? (
            <Tag
              label="Completed"
              size="sm"
              selected={quick === 'completed'}
              showIndicator={false}
              onPress={() => onQuick(quick === 'completed' ? null : 'completed')}
            />
          ) : null}
        </ScrollView>

        {/* View toggle + search — table view only; the calendar has no search
            (it's browsed by scrolling) and carries its toggle on the row below. */}
        {isCalendar ? null : (
          <>
            {viewToggle(true)}
            <SearchBar value={search} onChangeText={onSearch} placeholder="Search" />
          </>
        )}

        {/* Date range + filter share a row so both fit within the card. The
            range picker is table-only — the calendar already scopes by month —
            so in calendar view the view toggle takes its place on the left. */}
        <View style={[styles.filterRow, isCalendar && styles.filterRowSplit]}>
          {isCalendar ? viewToggle(false) : (
            <DatePicker
              mode="range"
              startDate={rangeStart}
              endDate={rangeEnd}
              onRangeChange={(start, end) => {
                setRangeStart(start);
                setRangeEnd(end);
              }}
              startPlaceholder="From"
              endPlaceholder="To"
              style={styles.dateFlex}
            />
          )}
          <FilterButton onPress={filterGroups ? openFilter : undefined} count={appliedCount} />
        </View>

        {/* Table — inset within the card with a little margin. */}
        <View style={styles.tableWrap}>{children}</View>
      </View>

      {filterGroups ? (
        <BottomSheet
          visible={filterOpen}
          onClose={() => setFilterOpen(false)}
          title="Filter by"
          primaryAction={{
            label: 'Apply',
            onPress: () => {
              onApplyFilters?.(draft);
              setFilterOpen(false);
            },
          }}
          secondaryAction={{ label: 'Cancel', onPress: () => setFilterOpen(false) }}
        >
          <Filter groups={filterGroups} values={draft} onChange={setDraft} />
          <Button
            label="Reset Filters"
            variant="link"
            size="sm"
            leadingIcon={<ArrowClockwise size={16} color={colors.brand} />}
            onPress={() => setDraft({})}
            style={styles.resetBtn}
          />
        </BottomSheet>
      ) : null}
    </ScrollView>
  );
};

/** Map a task row's category to the modal's task-type + build a demo detail. */
const CATEGORY_TASK_TYPE: Record<Category, TaskType> = {
  Quote: 'Quotes',
  Proposal: 'Proposals',
  Renewal: 'Renewals',
};
const detailFor = (t: TaskRow): TaskDetailData =>
  buildDemoDetail({
    taskType: CATEGORY_TASK_TYPE[t.category],
    customer: t.customer,
    priority: t.priority,
    status: t.status === 'Closed' ? 'Completed' : t.status,
    // Assigned-to-me tasks show who assigned them and land on the current user;
    // created-by-me tasks default to "Created by me" / "Self".
    source: t.assignedBy ? `Assigned to me by ${t.assignedBy}` : 'Created by me',
    assignees: t.assignedBy ? ['Rajesh Chaurasia'] : ['Self'],
  });

const TasksList: React.FC<{
  onViewTaskQuote?: (taskType: TaskType, customer: string) => void;
  /** A task to open in the detail modal (e.g. from a tapped notification). */
  openTask?: OpenTaskRequest | null;
  onOpenTaskHandled?: () => void;
  /** Opens the create-task modal (from the empty state's action button). */
  onCreate?: () => void;
}> = ({ onViewTaskQuote, openTask, onOpenTaskHandled, onCreate }) => {
  const [category, setCategory] = useState<'all' | Category>('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table' | 'calendar'>('calendar');
  const [quick, setQuick] = useState<'today' | 'completed' | null>(null);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [detail, setDetail] = useState<TaskDetailData | null>(null);
  const [deletedToast, setDeletedToast] = useState(false);
  // Per-row status override so the Status badge and the trailing caret stay in sync.
  const [statuses, setStatuses] = useState<Record<string, Status>>({});

  // Auto-dismiss the "task deleted" toast.
  useEffect(() => {
    if (!deletedToast) return;
    const t = setTimeout(() => setDeletedToast(false), 3000);
    return () => clearTimeout(t);
  }, [deletedToast]);

  // Open the detail modal for a task handed in from a notification tap.
  useEffect(() => {
    if (!openTask) return;
    setDetail(
      buildDemoDetail({
        taskType: openTask.taskType,
        customer: openTask.customer,
        priority: openTask.priority,
        status: openTask.status,
        source: openTask.assignedBy ? `Assigned to me by ${openTask.assignedBy}` : 'Created by me',
        assignees: openTask.assignedBy ? ['Rajesh Chaurasia'] : ['Self'],
      }),
    );
    onOpenTaskHandled?.();
  }, [openTask, onOpenTaskHandled]);

  const columns = useMemo<TableColumn<TaskRow>[]>(() => {
    const statusOf = (t: TaskRow) => statuses[t.id] ?? t.status;
    return [
      ...COLUMNS,
      {
        key: 'status',
        header: 'Status',
        width: 130,
        render: (t) => (
          <Badge label={statusOf(t)} variant="light" size="sm" color={STATUS_COLOR[statusOf(t)]} style={styles.cellBadge} />
        ),
      },
      {
        key: 'statusArrow',
        header: '',
        width: 52,
        align: 'center',
        render: (t) => (
          <StatusArrow status={statusOf(t)} onChange={(s) => setStatuses((prev) => ({ ...prev, [t.id]: s }))} />
        ),
      },
    ];
  }, [statuses]);

  const data = useMemo(() => {
    const q = search.trim().toLowerCase();
    const priorities = filters.priority ?? [];
    const sources = filters.source ?? [];
    return TASKS.filter((t) => {
      if (category !== 'all' && t.category !== category) return false;
      if (quick === 'today' && t.dueIn !== 'Today') return false;
      if (quick === 'completed' && t.status !== 'Closed') return false;
      if (priorities.length > 0 && !priorities.includes(t.priority)) return false;
      // Source: "created" = mine (no assigner), "assigned" = assigned to me.
      // "sub-imd" has no backing data, so it matches nothing.
      if (sources.length > 0) {
        const matchesSource = sources.some(
          (s) => (s === 'created' && !t.assignedBy) || (s === 'assigned' && !!t.assignedBy),
        );
        if (!matchesSource) return false;
      }
      if (q && !(`${t.customer} ${t.description}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [category, search, quick, filters]);

  // The calendar shows the same filtered set as the table — every filter
  // (category, quick chips, priority/source, search) applies to both.
  const calendarEvents = useMemo(() => buildTaskCalendar(data), [data]);

  return (
    <>
      <ListShell
        chips={CATEGORY_FILTERS}
        category={category}
        onCategory={(v) => setCategory(v as 'all' | Category)}
        todayLabel="Today's task"
        quick={quick}
        onQuick={setQuick}
        view={view}
        onView={setView}
        search={search}
        onSearch={setSearch}
        filterGroups={TASK_FILTER_GROUPS}
        appliedFilters={filters}
        onApplyFilters={setFilters}
      >
        {view === 'calendar' ? (
          <MonthCalendar
            events={calendarEvents}
            onEventPress={(ev) => setDetail(detailFor(TASKS.find((t) => t.id === ev.id) ?? TASKS[0]))}
            emptyState={
              <ListEmpty
                title="No tasks found"
                description="No tasks match the filters you've applied. Try adjusting them."
                actionLabel="Create a task"
                onAction={onCreate}
              />
            }
          />
        ) : data.length > 0 ? (
          <Table columns={columns} data={data} rowKey="id" style={styles.table} onRowPress={(t) => setDetail(detailFor(t))} />
        ) : (
          <ListEmpty
            title="No tasks found"
            description="No tasks match the filters you've applied. Try adjusting them."
            actionLabel="Create a task"
            onAction={onCreate}
          />
        )}
      </ListShell>

      <TaskDetailModal
        visible={detail !== null}
        onClose={() => setDetail(null)}
        mode="edit"
        detail={detail ?? undefined}
        onDelete={() => setDeletedToast(true)}
        onView={() => {
          const d = detail;
          setDetail(null);
          if (d) onViewTaskQuote?.(d.taskType, d.task.customer);
        }}
      />

      {/* Bottom toast shown after a task is deleted. */}
      {deletedToast ? (
        <View style={styles.bottomToast} pointerEvents="box-none">
          <Toast
            variant="success"
            title="Task deleted successfully"
            message="Your task has been deleted successfully."
            onClose={() => setDeletedToast(false)}
          />
        </View>
      ) : null}
    </>
  );
};

const EventsList: React.FC = () => {
  const [category, setCategory] = useState<'all' | 'birthday' | 'anniversary'>('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table' | 'calendar'>('calendar');
  const [quick, setQuick] = useState<'today' | 'completed' | null>(null);
  const [detail, setDetail] = useState<EventDetail | null>(null);

  const data = useMemo(() => {
    const q = search.trim().toLowerCase();
    return EVENTS.filter((e) => {
      if (category === 'birthday' && !e.occasions.some((o) => o.includes('Birthday'))) return false;
      if (category === 'anniversary' && !e.occasions.includes('Anniversary')) return false;
      if (quick === 'today' && e.date !== TODAY_DATE) return false;
      if (quick === 'completed' && e.status !== 'Completed') return false;
      if (q && !e.customer.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [category, search, quick]);

  // The calendar shows the same filtered set as the table.
  const calendarEvents = useMemo(() => buildEventCalendar(data), [data]);

  return (
    <>
      <ListShell
        chips={EVENT_FILTERS}
        category={category}
        onCategory={(v) => setCategory(v as 'all' | 'birthday' | 'anniversary')}
        todayLabel="Today's event"
        quick={quick}
        onQuick={setQuick}
        view={view}
        onView={setView}
        search={search}
        onSearch={setSearch}
      >
        {view === 'calendar' ? (
          <MonthCalendar
            events={calendarEvents}
            onEventPress={(ev) => {
              const event = EVENTS.find((e) => e.id === ev.id) ?? EVENTS[0];
              setDetail(buildEventDetail(event.customer, event.occasions));
            }}
          />
        ) : data.length > 0 ? (
          <Table
            columns={EVENT_COLUMNS}
            data={data}
            rowKey="id"
            style={styles.table}
            onRowPress={(e) => setDetail(buildEventDetail(e.customer, e.occasions))}
          />
        ) : (
          <View style={styles.inlineEmpty}>
            <Text style={styles.inlineEmptyText}>No events match your filters.</Text>
          </View>
        )}
      </ListShell>

      <EventDetailModal visible={detail !== null} onClose={() => setDetail(null)} detail={detail ?? undefined} />
    </>
  );
};

/** Build the meeting detail (view or edit) for a clicked row. */
const meetingDetailFor = (m: MeetingRow): MeetingDetail =>
  buildMeetingDetail({
    title: m.title,
    priority: m.priority as MeetingPriority,
    mode: m.mode,
    kind: m.kind,
    createdByMe: m.createdByMe,
    scheduledBy: m.scheduledBy,
  });

const MeetingsList: React.FC<{ persona: 'agent' | 'rm'; onCreate?: () => void }> = ({ persona, onCreate }) => {
  const [category, setCategory] = useState<'all' | MeetingMode>('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table' | 'calendar'>('calendar');
  const [quick, setQuick] = useState<'today' | 'completed' | null>(null);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [detail, setDetail] = useState<MeetingDetail | null>(null);

  // The Actions menu differs by persona (RM edits/cancels; agent only reschedules).
  const columns = useMemo<TableColumn<MeetingRow>[]>(
    () => [...MEETING_COLUMNS, meetingActionsColumn(persona)],
    [persona],
  );

  const data = useMemo(() => {
    const q = search.trim().toLowerCase();
    const modes = filters.mode ?? [];
    const priorities = filters.priority ?? [];
    const types = filters.type ?? [];
    return MEETINGS.filter((m) => {
      if (category !== 'all' && m.mode !== category) return false;
      if (quick === 'today' && !m.schedule.startsWith('Today')) return false;
      if (modes.length > 0 && !modes.includes(m.mode)) return false;
      if (priorities.length > 0 && !priorities.includes(m.priority)) return false;
      // Type: "me" = meetings I scheduled; "others" = scheduled with me.
      if (types.length > 0) {
        const ok = types.some((t) => (t === 'me' && m.createdByMe) || (t === 'others' && !m.createdByMe));
        if (!ok) return false;
      }
      if (q && !(`${m.title} ${m.agenda}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [category, search, quick, filters]);

  // The calendar shows the same filtered set as the table.
  const calendarEvents = useMemo(() => buildMeetingCalendar(data), [data]);

  return (
    <>
      <ListShell
        chips={MEETING_FILTERS}
        category={category}
        onCategory={(v) => setCategory(v as 'all' | MeetingMode)}
        todayLabel="Today's meeting"
        quick={quick}
        onQuick={setQuick}
        view={view}
        onView={setView}
        search={search}
        onSearch={setSearch}
        showCompleted={false}
        filterGroups={MEETING_FILTER_GROUPS}
        appliedFilters={filters}
        onApplyFilters={setFilters}
      >
        {view === 'calendar' ? (
          <MonthCalendar
            events={calendarEvents}
            onEventPress={(ev) => {
              const meeting = MEETINGS.find((m) => m.id === ev.id) ?? MEETINGS[0];
              setDetail(meetingDetailFor(meeting));
            }}
            emptyState={
              <ListEmpty
                title="No meetings found"
                description="No meetings match the filters you've applied. Try adjusting them."
                actionLabel="Schedule a meeting"
                onAction={onCreate}
              />
            }
          />
        ) : data.length > 0 ? (
          <Table
            columns={columns}
            data={data}
            rowKey="id"
            style={styles.table}
            onRowPress={(m) => setDetail(meetingDetailFor(m))}
          />
        ) : (
          <ListEmpty
            title="No meetings found"
            description="No meetings match the filters you've applied. Try adjusting them."
            actionLabel="Schedule a meeting"
            onAction={onCreate}
          />
        )}
      </ListShell>

      <MeetingDetailModal visible={detail !== null} onClose={() => setDetail(null)} detail={detail ?? undefined} />
    </>
  );
};

// ---------------------------------------------------------------------------
// Table columns
// ---------------------------------------------------------------------------

const COLUMNS: TableColumn<TaskRow>[] = [
  {
    key: 'customer',
    header: 'Customer name',
    width: 200,
    render: (t) => (
      <View style={styles.customerCell}>
        <Text style={styles.customerName} numberOfLines={1}>
          {t.customer}
        </Text>
        <Badge label={t.category} variant="light" size="sm" color={CATEGORY_COLOR[t.category]} />
      </View>
    ),
  },
  {
    key: 'description',
    header: 'Description',
    width: 240,
    render: (t) => (
      <Text style={styles.description} numberOfLines={1}>
        {t.description}
      </Text>
    ),
  },
  {
    key: 'dueIn',
    header: 'Due in',
    width: 110,
    render: (t) => (
      <Text style={[styles.dueIn, t.overdue && styles.dueOverdue]} numberOfLines={1}>
        {t.dueIn}
      </Text>
    ),
  },
  {
    key: 'priority',
    header: 'Priority',
    width: 120,
    render: (t) => (
      <Badge
        label={t.priority}
        variant="solid"
        size="sm"
        color={PRIORITY_COLOR[t.priority]}
        icon={t.priority === 'Urgent' ? <WarningCircle size={12} color="#FFFFFF"  /> : undefined}
        style={styles.cellBadge}
      />
    ),
  },
  {
    key: 'assignees',
    header: 'Assigned to',
    width: 130,
    render: (t) => <AssigneesCell initial={t.assignees} />,
  },
];

const EVENT_COLUMNS: TableColumn<EventRow>[] = [
  {
    key: 'customer',
    header: 'Customer name',
    width: 200,
    render: (e) => (
      <View style={styles.customerCell}>
        <Text style={styles.customerName} numberOfLines={1}>
          {e.customer}
        </Text>
        <Badge label="Events" variant="light" size="sm" color="rose" />
      </View>
    ),
  },
  {
    key: 'date',
    header: 'Date',
    width: 130,
    render: (e) => (
      <Text style={styles.dueIn} numberOfLines={1}>
        {e.date}
      </Text>
    ),
  },
  {
    key: 'type',
    header: 'Events',
    width: 210,
    render: (e) => (
      <View style={styles.eventTypeCell}>
        {e.occasions.map((o) => (
          <Badge
            key={o}
            label={o}
            variant="solid"
            size="sm"
            color={EVENT_TYPE_COLOR[o]}
            icon={
              o === 'Anniversary' ? (
                <Confetti size={12} color="#FFFFFF" weight="fill" />
              ) : (
                <Cake size={12} color="#FFFFFF" weight="fill" />
              )
            }
            style={styles.cellBadge}
          />
        ))}
      </View>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: 130,
    render: (e) => (
      <Badge label={e.status} variant="light" size="sm" color={EVENT_STATUS_COLOR[e.status]} style={styles.cellBadge} />
    ),
  },
  {
    key: 'action',
    header: 'Action',
    width: 170,
    render: (e) =>
      e.sent ? (
        <Text style={styles.sentText} numberOfLines={1}>
          Message sent
        </Text>
      ) : (
        <View style={styles.actionRow}>
          <Button label="Send wish" variant="tertiary" size="sm" onPress={() => undefined} />
          <Button
            iconOnly
            label="Call"
            variant="tertiaryGray"
            size="sm"
            leadingIcon={<Phone size={16} color={colors.textBody} />}
            onPress={() => undefined}
          />
        </View>
      ),
  },
];

const MEETING_COLUMNS: TableColumn<MeetingRow>[] = [
  {
    key: 'title',
    header: 'Title',
    width: 210,
    render: (m) => (
      <Text style={styles.customerName} numberOfLines={1}>
        {m.title}
      </Text>
    ),
  },
  {
    key: 'agenda',
    header: 'Agenda',
    width: 240,
    render: (m) => (
      <Text style={styles.description} numberOfLines={1}>
        {m.agenda}
      </Text>
    ),
  },
  {
    key: 'schedule',
    header: 'Scheduled on',
    width: 230,
    render: (m) => (
      <Text style={styles.dueIn} numberOfLines={1}>
        {m.schedule}
      </Text>
    ),
  },
  {
    key: 'priority',
    header: 'Priority',
    width: 120,
    render: (m) => (
      <Badge
        label={m.priority}
        variant="solid"
        size="sm"
        color={PRIORITY_COLOR[m.priority]}
        icon={m.priority === 'Urgent' ? <WarningCircle size={12} color="#FFFFFF" weight="fill" /> : undefined}
        style={styles.cellBadge}
      />
    ),
  },
  {
    key: 'attendees',
    header: 'Attendees (with you)',
    width: 160,
    render: (m) => <AssigneesCell initial={m.attendees} />,
  },
];

const ACTION_ICON = 16;
/** The Actions column — its menu differs by persona (built in MeetingsList). */
const meetingActionsColumn = (persona: 'agent' | 'rm'): TableColumn<MeetingRow> => ({
  key: 'actions',
  header: 'Actions',
  width: 170,
  render: (m) => (
    <View style={styles.actionRow}>
      <Button label={m.action} variant="tertiary" size="sm" onPress={() => undefined} />
      <ActionMenu
        items={
          persona === 'rm'
            ? [
                { key: 'copy', label: 'Copy Link', icon: <Copy size={ACTION_ICON} color={colors.textBody} />, onPress: () => undefined },
                { key: 'edit', label: 'Edit Meeting', icon: <NotePencil size={ACTION_ICON} color={colors.textBody} />, onPress: () => undefined },
                { key: 'cancel', label: 'Cancel Meeting', danger: true, icon: <XCircle size={ACTION_ICON} color={accent.red.solidBg} />, onPress: () => undefined },
              ]
            : [
                { key: 'copy', label: 'Copy Link', icon: <Copy size={ACTION_ICON} color={colors.textBody} />, onPress: () => undefined },
                { key: 'reschedule', label: 'Request Reschedule', icon: <ArrowClockwise size={ACTION_ICON} color={colors.textBody} />, onPress: () => undefined },
              ]
        }
      />
    </View>
  ),
});

/**
 * "Assigned to" cell — the AvatarGroup's `+` opens a bottom sheet of people
 * (name + role) with checkboxes; ticking one adds their avatar to the group.
 */
const AssigneesCell: React.FC<{ initial: string[] }> = ({ initial }) => {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (id: string) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const pickedNames = PEOPLE.filter((p) => picked.includes(p.id)).map((p) => p.name);
  const names = [...initial, ...pickedNames];

  return (
    <>
      <AvatarGroup size="xs" onAdd={() => setOpen(true)} style={styles.cellAvatarGroup}>
        {names.map((name) => (
          <Avatar key={name} type="text" name={name} />
        ))}
      </AvatarGroup>

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Assign to"
        subtitle="Select people to assign this task to."
        primaryAction={{ label: 'Done', onPress: () => setOpen(false) }}
      >
        <View style={styles.assignList}>
          {PEOPLE.map((p) => (
            <View key={p.id} style={styles.assignRow}>
              <Checkbox
                size="sm"
                checked={picked.includes(p.id)}
                onChange={() => toggle(p.id)}
                label={p.name}
                style={styles.assignCheckbox}
              />
              <Badge label={p.role} variant="light" size="sm" color={ROLE_COLOR[p.role]} />
            </View>
          ))}
        </View>
      </BottomSheet>
    </>
  );
};

/**
 * Row-end status picker: a caret button (its own column) that opens an anchored
 * menu of status `Badge`s. Controlled — the status lives in the list so the
 * Status column's badge and this caret stay in sync. Tapping the caret opens a
 * bottom sheet listing the status `Badge` options.
 */
const StatusArrow: React.FC<{ status: Status; onChange: (next: Status) => void }> = ({ status, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        style={styles.statusTrigger}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Change status (currently ${status})`}
      >
        <CaretDown size={18} color={colors.textBody} />
      </Pressable>

      <BottomSheet visible={open} onClose={() => setOpen(false)} title="Update status">
        <View style={styles.statusSheetList}>
          {STATUSES.map((s) => (
            <Pressable
              key={s}
              style={[styles.statusSheetOption, s === status && styles.statusSheetOptionActive]}
              onPress={() => {
                onChange(s);
                setOpen(false);
              }}
              accessibilityRole="menuitem"
              accessibilityState={{ selected: s === status }}
            >
              <Badge label={s} variant="light" size="sm" color={STATUS_COLOR[s]} />
              {s === status ? <Check size={18} color={colors.brand} weight="bold" /> : null}
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Empty state (Events / Meetings)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  tabSurface: { flex: 1 },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.lg, zIndex: 10 },
  bottomToast: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg, zIndex: 20 },

  content: { padding: spacing.lg, paddingBottom: spacing.xxl },

  // The whole surface is one shadowed card holding every control + the table.
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.lg,
  },

  chipRow: { gap: spacing.sm, paddingRight: spacing.lg },
  toolRow: { gap: spacing.sm, paddingRight: spacing.lg, alignItems: 'center' },

  // Date range + filter on one row; the date field flexes, the filter hugs.
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  // Calendar view drops the range picker: the view toggle sits left, filter right.
  filterRowSplit: { justifyContent: 'space-between' },
  dateFlex: { flex: 1 },

  // Table inset within the card with a small top margin; it scrolls sideways
  // inside its own bordered, rounded surface.
  tableWrap: {},
  // Bleed the table to the card's edges (cancel its horizontal padding); the
  // cells' own 16px padding realigns the first column. Square corners + a top
  // border separate it from the controls above.
  table: {
    marginHorizontal: -spacing.lg,
    borderRadius: 0,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },

  // Status caret trigger (its own column) + its bottom-sheet option list.
  // The DS Badge is `alignSelf: 'flex-start'`; recentre it in table cells.
  cellBadge: { alignSelf: 'center' },
  eventTypeCell: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs },
  // AvatarGroup is likewise `alignSelf: 'flex-start'` — recentre it in cells.
  cellAvatarGroup: { alignSelf: 'center' },
  statusTrigger: { alignItems: 'center', justifyContent: 'center', padding: spacing.xs },
  statusSheetList: { gap: spacing.xs },
  statusSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  statusSheetOptionActive: { backgroundColor: colors.brandSubtle },

  // "Assign to" bottom-sheet list.
  assignList: { gap: spacing.xs },
  assignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  assignCheckbox: { flex: 1 },
  resetBtn: { alignSelf: 'flex-start', marginTop: spacing.sm },
  customerCell: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  customerName: { flexShrink: 1, fontFamily: fontFamilyForWeight('400'), fontSize: 14, lineHeight: 20, fontWeight: '400', color: colors.textHeading },
  description: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textHeading, flex: 1 },
  dueIn: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textHeading },
  dueOverdue: { color: accent.red.solidBg },
  sentText: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },

  inlineEmpty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  inlineEmptyText: { fontFamily: typography.fontFamily, ...typography.body2, color: colors.textBody },

  // Shared empty-state fallback (rounded icon badge + title + description).
  ringOuter: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  ringInner: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center' },
  listEmpty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  listEmptyTitle: { fontFamily: fontFamilyForWeight('600'), fontSize: 16, fontWeight: '600', color: colors.textHeading, textAlign: 'center' },
  listEmptyDesc: { fontFamily: typography.fontFamily, ...typography.body2, color: colors.textBody, textAlign: 'center', maxWidth: 280 },
  listEmptyBtn: { alignSelf: 'center', marginTop: spacing.xs },

  // Empty state (Events / Meetings).
});
