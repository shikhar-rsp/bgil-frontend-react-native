import React, { useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { FilePlus, FileText } from 'phosphor-react-native';
import { Button, Radio, colors, spacing, radius, typography } from '@atlas-ds/react-native';

type VehicleType = 'registered' | 'new';

interface VehicleTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (type: VehicleType) => void;
}

export const VehicleTypeModal: React.FC<VehicleTypeModalProps> = ({ isOpen, onClose, onProceed }) => {
  const [selectedType, setSelectedType] = useState<VehicleType | null>(null);

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.scrim}>
        <View style={styles.card}>
          <Text style={styles.title}>Select Vehicle Type</Text>
          <Text style={styles.description}>Choose a vehicle type to proceed with quote creation</Text>

          <View style={styles.options}>
            <Pressable
              style={[styles.option, selectedType === 'registered' ? styles.optionRegSel : styles.optionReg]}
              onPress={() => setSelectedType('registered')}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedType === 'registered' }}
            >
              <View style={styles.optionTop}>
                <View style={[styles.optIcon, { backgroundColor: '#2563EB' }]}>
                  <FileText size={24} color="#FFFFFF" />
                </View>
                <Radio selected={selectedType === 'registered'} onPress={() => setSelectedType('registered')} />
              </View>
              <Text style={styles.optTitle}>Registered Vehicle</Text>
              <Text style={styles.optSub}>Vehicle has registration number</Text>
            </Pressable>

            <Pressable
              style={[styles.option, selectedType === 'new' ? styles.optionNewSel : styles.optionNew]}
              onPress={() => setSelectedType('new')}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedType === 'new' }}
            >
              <View style={styles.optionTop}>
                <View style={[styles.optIcon, { backgroundColor: '#EA580C' }]}>
                  <FilePlus size={24} color="#FFFFFF" />
                </View>
                <Radio selected={selectedType === 'new'} onPress={() => setSelectedType('new')} />
              </View>
              <Text style={styles.optTitle}>New Vehicle (Unregistered)</Text>
              <Text style={styles.optSub}>Registration pending, enter details manually.</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Button label="Cancel" variant="secondary" onPress={onClose} style={styles.footerBtn} />
            <Button
              label="Proceed"
              disabled={!selectedType}
              onPress={() => selectedType && onProceed(selectedType)}
              style={styles.footerBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: { width: '100%', maxWidth: 480, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md },
  title: { fontFamily: typography.fontFamily, fontSize: 18, fontWeight: '600', color: colors.textHeading },
  description: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  options: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  option: { flex: 1, borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, gap: spacing.lg },
  optionReg: { borderColor: '#BFDBFE', backgroundColor: colors.surface },
  optionRegSel: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  optionNew: { borderColor: '#FED7AA', backgroundColor: colors.surface },
  optionNewSel: { borderColor: '#FDBA74', backgroundColor: '#FFF7ED' },
  optionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optIcon: { width: 40, height: 40, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  optTitle: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textHeading },
  optSub: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  footer: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  footerBtn: { flex: 1 },
});
