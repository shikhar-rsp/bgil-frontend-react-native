import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Plus, FunnelSimple, Check, PencilSimple, Trash, XCircle } from 'phosphor-react-native';
import {
  Badge,
  BottomSheet,
  Button,
  SearchBar,
  Textfield,
  TextArea,
  ToastGlobal,
  colors,
  fontFamilyForWeight,
  radius,
  spacing,
  typography,
} from '@atlas-ds/react-native';

// ---------------------------------------------------------------------------
// Model + fixtures
// ---------------------------------------------------------------------------

interface Note {
  id: string;
  title: string;
  description: string;
  date: string;
}

const SEED_NOTES: Note[] = Array.from({ length: 5 }, (_, i) => ({
  id: String(i + 1),
  title: "Points of discussion for today's call",
  description: "Halwinder Kapoor's policy and her husban's",
  date: '12/05/26',
}));

type SortKey = 'recent' | 'month' | 'alpha';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Recently created' },
  { key: 'month', label: 'Month wise' },
  { key: 'alpha', label: 'Alphabetically' },
];

/** Concentric double-ring badge (red-tinted) around a danger glyph. */
const DangerIconBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.ringOuter}>
    <View style={styles.ringInner}>{children}</View>
  </View>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface NotesSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Notes bottom sheet — a "Create a Note" button that reveals an inline
 * title/description form, a search + sort row, and the list of saved notes.
 * Saving flashes a success toast at the top of the sheet.
 */
export const NotesSheet: React.FC<NotesSheetProps> = ({ visible, onClose }) => {
  const [notes, setNotes] = useState<Note[]>(SEED_NOTES);
  const [formOpen, setFormOpen] = useState(false);
  /** The note being edited, or null when the form creates a new note. */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('recent');
  const [sortOpen, setSortOpen] = useState(false);
  /** The note pending deletion (drives the confirm modal). */
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ variant: 'success' | 'error'; title: string; message?: string } | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setFormOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setDescription(note.description);
    setFormOpen(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEditingId(null);
    setFormOpen(false);
  };

  const saveNote = () => {
    if (editingId) {
      setNotes((prev) =>
        prev.map((n) => (n.id === editingId ? { ...n, title: title.trim(), description: description.trim() } : n)),
      );
      setToast({
        variant: 'success',
        title: 'Note Saved successfully!',
        message: 'Your changes to this note have been saved successfully.',
      });
    } else {
      setNotes((prev) => [
        { id: `n${prev.length + 1}-${prev.length}`, title: title.trim(), description: description.trim(), date: '12/05/26' },
        ...prev,
      ]);
      setToast({
        variant: 'success',
        title: 'Note Saved Successfully!',
        message: 'Your note has been successfully saved!',
      });
    }
    resetForm();
  };

  const confirmDelete = () => {
    setNotes((prev) => prev.filter((n) => n.id !== deleteId));
    setDeleteId(null);
    setToast({ variant: 'error', title: 'Note was deleted' });
  };

  const data = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? notes.filter((n) => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q))
      : notes;
    if (sort === 'alpha') return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    // 'recent' keeps insertion order (newest first); 'month' is a demo no-op.
    return filtered;
  }, [notes, search, sort]);

  const canSave = title.trim().length > 0;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Notes"
      contentMinHeight={480}
    >
      <View style={styles.container}>
        {/* Save / delete toast */}
        {toast ? (
          <ToastGlobal
            variant={toast.variant}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        ) : null}

        {/* Create a Note */}
        <Button
          label="Create a Note"
          variant="secondary"
          leadingIcon={<Plus size={18} color={colors.brand} weight="bold" />}
          onPress={openCreate}
          style={styles.createBtn}
        />

        {/* Inline create form */}
        {formOpen ? (
          <View style={styles.form}>
            <Textfield value={title} onChangeText={setTitle} placeholder="Title..." />
            <TextArea value={description} onChangeText={setDescription} placeholder="Write a description...." rows={4} />
            <View style={styles.formActions}>
              <Button label="Cancel" variant="secondaryGray" onPress={resetForm} style={styles.formBtn} />
              <Button
                label={editingId ? 'Save Changes' : 'Save note'}
                variant="primary"
                disabled={!canSave}
                onPress={saveNote}
                style={styles.formBtn}
              />
            </View>
          </View>
        ) : null}

        {/* Search + sort */}
        <View style={styles.searchRow}>
          <View style={styles.searchFlex}>
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search" />
          </View>
          <View>
            <Button
              label="Filter"
              variant="secondaryGray"
              leadingIcon={<FunnelSimple size={18} color={colors.textBody} />}
              onPress={() => setSortOpen((o) => !o)}
            />
            {sortOpen ? (
              <View style={styles.sortMenu}>
                {SORT_OPTIONS.map((o) => {
                  const active = sort === o.key;
                  return (
                    <Pressable
                      key={o.key}
                      style={[styles.sortItem, active && styles.sortItemActive]}
                      onPress={() => {
                        setSort(o.key);
                        setSortOpen(false);
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                    >
                      <Text style={styles.sortLabel}>{o.label}</Text>
                      {active ? <Check size={16} color={colors.brand} weight="bold" /> : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        </View>

        {/* Notes list */}
        <View style={styles.list}>
          {data.length > 0 ? (
            data.map((n) => (
              <View key={n.id} style={styles.noteCard}>
                <View style={styles.noteText}>
                  <Text style={styles.noteTitle} numberOfLines={1}>
                    {n.title}
                  </Text>
                  <Text style={styles.noteDesc} numberOfLines={1}>
                    {n.description}
                  </Text>
                </View>
                <View style={styles.noteRight}>
                  <Badge label={n.date} variant="light" size="sm" color="neutral" style={styles.dateBadge} />
                  <Pressable
                    onPress={() => setDeleteId(n.id)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Delete note"
                    style={styles.iconBtn}
                  >
                    <Trash size={18} color={colors.textBody} />
                  </Pressable>
                  <Pressable
                    onPress={() => openEdit(n)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Edit note"
                    style={styles.iconBtn}
                  >
                    <PencilSimple size={18} color={colors.textBody} />
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.empty}>No notes match your search.</Text>
          )}
        </View>
      </View>

      {/* Delete confirmation */}
      <BottomSheet visible={deleteId !== null} onClose={() => setDeleteId(null)} contentMinHeight={0}>
        <View style={styles.deleteBody}>
          <DangerIconBadge>
            <XCircle size={24} color={colors.danger} />
          </DangerIconBadge>
          <Text style={styles.deleteTitle}>Delete Note?</Text>
          <Text style={styles.deleteDesc}>Are you sure you want to delete this Note?</Text>
          <View style={styles.deleteActions}>
            <Button label="No, keep it" variant="secondaryGray" onPress={() => setDeleteId(null)} style={styles.deleteBtn} />
            <Button label="Yes, delete" variant="primaryDestructive" onPress={confirmDelete} style={styles.deleteBtn} />
          </View>
        </View>
      </BottomSheet>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: { gap: spacing.md },

  createBtn: { alignSelf: 'stretch' },
  form: { gap: spacing.sm },
  formActions: { flexDirection: 'row', gap: spacing.sm },
  formBtn: { flex: 1 },

  ringOuter: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
  ringInner: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  deleteBody: { gap: spacing.sm, alignItems: 'center' },
  deleteTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 18, lineHeight: 24, fontWeight: '500', color: colors.textHeading, textAlign: 'center' },
  deleteDesc: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody, textAlign: 'center' },
  deleteActions: { flexDirection: 'row', gap: spacing.sm, alignSelf: 'stretch', marginTop: spacing.xs },
  deleteBtn: { flex: 1 },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, zIndex: 2 },
  searchFlex: { flex: 1 },
  sortMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: spacing.xs,
    minWidth: 170,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: spacing.xs,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  sortItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sortItemActive: { backgroundColor: colors.surfaceSubtle },
  sortLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },

  list: { gap: spacing.sm },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  noteText: { flex: 1, gap: 2 },
  noteRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBtn: { padding: 2 },
  noteTitle: { fontFamily: fontFamilyForWeight('400'), fontSize: 14, fontWeight: '400', color: colors.textHeading },
  noteDesc: { fontFamily: typography.fontFamily, fontSize: 13, lineHeight: 18, color: colors.textBody },
  dateBadge: { alignSelf: 'center' },
  empty: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
});
