import React, { useMemo, useState } from 'react';
import { View, Text, Modal, FlatList, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, VideoCamera, MapPin } from 'phosphor-react-native';
import { Button, SearchBar, Badge, colors, spacing, radius, typography, type AccentColor } from '@atlas-ds/react-native';

type Session = {
  id: number;
  title: string;
  lob: string;
  mode: 'Virtual' | 'Physical';
  sessionStatus: 'Filling Fast' | 'Available' | 'Fully Booked';
};

const LOBS = ['Health', 'Motor', 'Travel', 'Life'];
const STATUSES: Session['sessionStatus'][] = ['Filling Fast', 'Available', 'Fully Booked'];

const SESSIONS: Session[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: `Common questions about ${LOBS[i % 4]} Insurance`,
  lob: LOBS[i % 4],
  mode: i % 2 === 0 ? 'Virtual' : 'Physical',
  sessionStatus: STATUSES[i % 3],
}));

const statusColor = (s: Session['sessionStatus']): AccentColor =>
  s === 'Filling Fast' ? 'orange' : s === 'Available' ? 'lime' : 'red';

interface BookTrainingProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Book-a-training sheet — the web side-drawer ported as a full-height sheet. */
export const BookTraining: React.FC<BookTrainingProps> = ({ isOpen, onClose }) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const term = search.trim().toLowerCase();

  const sessions = useMemo(
    () => SESSIONS.filter((s) => !term || s.title.toLowerCase().includes(term)),
    [term],
  );

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.scrim}>
        <View style={[styles.sheet, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Book a Training</Text>
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
              <X size={22} color={colors.textBody} />
            </Pressable>
          </View>

          <View style={styles.searchWrap}>
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search sessions" />
          </View>

          <FlatList
            data={sessions}
            keyExtractor={(s) => String(s.id)}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            renderItem={({ item }) => (
              <View style={styles.sessionCard}>
                <View style={styles.sessionTop}>
                  <Text style={styles.sessionTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Badge variant="light" size="sm" color={statusColor(item.sessionStatus)} label={item.sessionStatus} />
                </View>
                <View style={styles.sessionMeta}>
                  {item.mode === 'Virtual' ? (
                    <VideoCamera size={16} color={colors.textBody} />
                  ) : (
                    <MapPin size={16} color={colors.textBody} />
                  )}
                  <Text style={styles.sessionMetaText}>
                    {item.mode} · {item.lob}
                  </Text>
                </View>
                <Button
                  label="Book Session"
                  size="sm"
                  variant="secondary"
                  disabled={item.sessionStatus === 'Fully Booked'}
                  onPress={() => undefined}
                />
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { flex: 1, marginTop: spacing.xxl, backgroundColor: colors.surfaceSubtle, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  title: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '600', color: colors.textHeading },
  searchWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  list: { padding: spacing.lg, paddingTop: 0 },
  sep: { height: spacing.md },
  sessionCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  sessionTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  sessionTitle: { flex: 1, fontFamily: typography.fontFamily, fontSize: 15, fontWeight: '500', color: colors.textHeading },
  sessionMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  sessionMetaText: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
});
