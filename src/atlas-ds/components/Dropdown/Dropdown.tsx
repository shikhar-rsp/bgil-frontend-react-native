import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { CaretDown, CaretUp, CheckSquare, Square } from 'phosphor-react-native';
import { BottomSheet } from '../BottomSheet';
import { SearchBar } from '../SearchBar';
import { Tag } from '../Tag';
import {
  colors,
  radius,
  spacing,
  typography,
  inputShadowDefault,
  inputShadowFocus,
} from '../../theme';

export interface DropdownOption {
  /** Stable identifier passed to onChange when the row is tapped. */
  value: string;
  /** Visible row label — Body 2 / Regular per Figma. */
  label: string;
  /** Optional 20×20 icon rendered to the LEFT of the label. */
  icon?: React.ReactNode;
  /** If true, the row renders dimmed and ignores taps. */
  disabled?: boolean;
}

export interface DropdownProps {
  /** List of selectable options. 5+ rows will scroll inside the popover. */
  options: DropdownOption[];
  /** Currently selected `value` (single-select). Pass `null/undefined` for none. */
  value?: string | null;
  /** Fired when the user taps an enabled row (single-select). */
  onChange?: (value: string) => void;
  /**
   * Multi-select variant — rows toggle a checkbox, the menu stays open, and the
   * trigger shows the joined selection. Visually identical to the single-select
   * field/popover; only the row affordance + close behaviour differ.
   */
  multiple?: boolean;
  /** Selected values (multi-select). */
  selectedValues?: string[];
  /** Fired with the next selection array (multi-select). */
  onChangeValues?: (values: string[]) => void;
  /** Field label rendered above the input trigger. */
  label?: string;
  /** Placeholder shown in the trigger when nothing is selected. */
  placeholder?: string;
  /** Helper/hint text rendered below the trigger. */
  hint?: string;
  /** Error state — red border (caret icon unchanged), and `hint` renders in danger red. */
  error?: boolean;
  /** Disabled state — dims the trigger and blocks opening. */
  disabled?: boolean;
  /** Max height before the list starts scrolling (default 320). */
  maxHeight?: number;
  /**
   * Adds a search field above the options and filters them by label as the user
   * types. Worth turning on once the list is long enough that scanning it beats
   * typing — a year or city picker, not a three-item one.
   */
  searchable?: boolean;
  /**
   * Lay the options out as a grid of this many columns instead of one row per
   * option. Only sensible for short labels (years, sizes); long labels wrap and
   * the grid stops paying for itself. Default 1.
   */
  columns?: number;
  /** Style override on the outer container. */
  style?: object;
}

/** Rows of the grid kept on screen; the rest are a scroll away. */
const GRID_VISIBLE_ROWS = 3;
/** One cell: 8+8 padding, a 20px line, 1+1 border. */
const GRID_CELL_HEIGHT = spacing.sm * 2 + 20 + 2;
const GRID_VIEWPORT_HEIGHT =
  GRID_CELL_HEIGHT * GRID_VISIBLE_ROWS + spacing.sm * (GRID_VISIBLE_ROWS - 1);

/**
 * Dropdown (Single Select) — an input-style trigger that opens an anchored
 * option list, mirroring `@atlas-ds/react` `<Dropdown>`.
 *
 * Figma source: vHExm4J0Y43BZkLYswSKm8 node 1267:6440 (DropdownInput).
 *
 * Trigger states per Figma:
 *   • Default  — #E2E8F0 border, xs shadow, placeholder text #94A3B8, CaretDown.
 *   • Open     — #E2E8F0 border + 4px #F1F5F9 focus ring, CaretUp.
 *   • Selected — value in #1E293B, CaretDown.
 *   • Disabled — #F1F5F9 border, disabled bg/text, non-interactive.
 *   • Error    — #F87171 red border (CaretDown/Up as normal); hint renders #B91C1C.
 *
 * Label (Heading 4 / 14·20 / #475569) sits above; hint (same type) below.
 * The list (Body 2 / Rubik 14·20, selected row tinted brand) opens in a BottomSheet
 * and scrolls past `maxHeight`.
 */
export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  multiple = false,
  selectedValues,
  onChangeValues,
  label,
  placeholder = 'Select an option',
  hint,
  error = false,
  disabled = false,
  maxHeight = 320,
  searchable = false,
  columns = 1,
  style,
}) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const q = query.trim().toLowerCase();
  const visibleOptions = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  const isGrid = columns > 1;

  const values = selectedValues ?? [];
  const selectedOption = options.find((o) => o.value === value) ?? null;
  const selectedOptions = values
    .map((v) => options.find((o) => o.value === v))
    .filter((o): o is DropdownOption => !!o);
  const isSelected = (opt: DropdownOption) =>
    multiple ? values.includes(opt.value) : opt.value === value;

  const triggerText = multiple
    ? values.length === 1
      ? selectedOptions[0]?.label ?? placeholder
      : placeholder
    : selectedOption
      ? selectedOption.label
      : placeholder;
  const hasValue = multiple ? values.length > 0 : !!selectedOption;

  const openMenu = () => {
    if (disabled) return;
    // Each opening starts from the full list rather than the last search.
    setQuery('');
    setOpen(true);
  };

  const select = (opt: DropdownOption) => {
    if (opt.disabled) return;
    if (multiple) {
      // Toggle; keep the menu open for further selections.
      const next = values.includes(opt.value)
        ? values.filter((v) => v !== opt.value)
        : [...values, opt.value];
      onChangeValues?.(next);
    } else {
      onChange?.(opt.value);
      setOpen(false);
    }
  };

  // Trigger box style varies by state (Figma DropdownInput).
  const inputStateStyle = disabled
    ? [styles.inputDisabled, inputShadowDefault]
    : error
      ? [styles.inputError, inputShadowDefault]
      : open
        ? [styles.inputOpen, inputShadowFocus]
        : [styles.inputDefault, inputShadowDefault];

  const iconColor = disabled ? colors.textDisabled : error ? colors.danger : colors.textBody;

  const optionList = (
    <View style={[styles.list, isGrid && styles.grid]}>
      {visibleOptions.map((opt) => {
        const selected = isSelected(opt);
        return (
          <Pressable
            key={opt.value}
            onPress={() => select(opt)}
            disabled={opt.disabled}
            accessibilityRole={multiple ? 'checkbox' : 'button'}
            accessibilityState={{ selected, checked: selected, disabled: !!opt.disabled }}
            style={({ pressed }) => [
              styles.row,
              // Cells share the row: a basis just under 100/columns leaves
              // room for the gaps, and flexGrow spreads what's left over.
              isGrid && [styles.gridCell, { flexBasis: `${100 / columns - 5}%` }],
              selected && styles.rowSelected,
              pressed && !opt.disabled && !selected && styles.rowPressed,
              opt.disabled && styles.rowDisabled,
            ]}
          >
            {multiple &&
              (selected ? (
                <CheckSquare size={20} color={colors.brand} weight="fill" />
              ) : (
                <Square size={20} color={colors.border} weight="regular" />
              ))}
            {opt.icon != null && <View style={styles.iconSlot}>{opt.icon}</View>}
            <Text
              style={[
                styles.rowLabel,
                isGrid && styles.gridLabel,
                selected && styles.rowLabelSelected,
                opt.disabled && styles.rowLabelDisabled,
              ]}
              numberOfLines={1}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
      {visibleOptions.length === 0 ? (
        <Text style={styles.empty}>No matches for "{query.trim()}"</Text>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable
        onPress={openMenu}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled }}
        style={[styles.input, inputStateStyle]}
      >
        {multiple && selectedOptions.length > 1 ? (
          <View style={styles.tagsWrap}>
            {selectedOptions.map((opt) => (
              <Tag
                key={opt.value}
                label={opt.label}
                size="md"
                shape="pill"
                onRemove={() => onChangeValues?.(values.filter((v) => v !== opt.value))}
              />
            ))}
          </View>
        ) : (
          <Text
            style={[styles.value, hasValue ? styles.valueSelected : styles.valuePlaceholder]}
            numberOfLines={1}
          >
            {triggerText}
          </Text>
        )}
        {open ? (
          <CaretUp size={20} color={iconColor} weight="regular" />
        ) : (
          <CaretDown size={20} color={iconColor} weight="regular" />
        )}
      </Pressable>

      {hint ? (
        <Text style={[styles.hint, disabled && styles.hintDisabled, error && styles.hintError]}>
          {hint}
        </Text>
      ) : null}

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={label ?? undefined}
        // A grid brings its own scroll viewport, so the sheet hugs it instead of
        // reserving a taller slot.
        contentMinHeight={isGrid ? 0 : maxHeight}
      >
        {searchable ? (
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery('')}
            placeholder="Search"
            style={styles.search}
          />
        ) : null}

        {isGrid ? (
          // Its own viewport: three rows stay on screen and the rest scroll
          // inside it, which also keeps the search field pinned above.
          <ScrollView
            style={styles.gridViewport}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {optionList}
          </ScrollView>
        ) : (
          optionList
        )}
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: spacing.sm, // 8px between label / input / hint
  },
  // Label — Heading 4 (14/20), #475569
  label: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.textBody,
  },
  // Input trigger — px 12, py 8, radius 8, 1px border, gap 8
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  inputDefault: { borderColor: colors.borderSubtle },
  inputOpen: { borderColor: colors.borderSubtle },
  inputDisabled: { borderColor: colors.surfaceMuted, backgroundColor: colors.surfaceSubtle },
  inputError: { borderColor: '#F87171' },
  // Value/placeholder — Heading 4 (14/20)
  value: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  valueSelected: { color: colors.textHeading },
  valuePlaceholder: { color: colors.textMuted },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 1,
    paddingVertical: 2,
  },
  // Hint — Heading 4 (14/20), #475569; disabled #CBD5E1; error #B91C1C
  hint: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.textBody,
  },
  hintDisabled: { color: colors.textDisabled },
  hintError: { color: '#B91C1C' },
  // ---- Popover list ----
  backdrop: { flex: 1 },
  menu: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.xs,
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  list: {
    gap: spacing.sm, // 8px between rows per Figma `layout_D2MHOO`
  },
  search: { marginBottom: spacing.sm },
  // maxHeight, not height — a filtered list shorter than the viewport shrinks
  // instead of leaving dead space under it.
  gridViewport: { maxHeight: GRID_VIEWPORT_HEIGHT },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  // Grid cells are tappable targets in their own right, so they carry the
  // border the single-column rows get from their full width.
  gridCell: {
    flexGrow: 1,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  gridLabel: { flex: 0, textAlign: 'center' },
  empty: {
    // Spans the row so it stays centred in grid mode too.
    width: '100%',
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    paddingVertical: spacing.md,
    textAlign: 'center',
  },
  // layout_HHG9UX — row, padding 8×12, gap 8
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  rowPressed: {
    backgroundColor: colors.surfaceSubtle,
  },
  rowSelected: {
    // Same tint as the Calendar's "in-range" cells — keeps the selection
    // language consistent across the system.
    backgroundColor: colors.brandSubtle,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  // 20×20 fixed slot for the icon. Consumers render any React node inside.
  iconSlot: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.textHeading, // #1E293B per Figma `fill_MD8UE9`
    flex: 1,
  },
  rowLabelSelected: {
    color: colors.brand,
    fontWeight: '500',
  },
  rowLabelDisabled: {
    color: colors.textMuted,
  },
});
