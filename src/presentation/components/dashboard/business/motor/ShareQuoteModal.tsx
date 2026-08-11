import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CheckCircle, ChatText, Link, DownloadSimple } from 'phosphor-react-native';
import { BottomSheet, Button, Toast, colors, spacing, radius, typography, fontFamilyForWeight } from '@atlas-ds/react-native';
import { dashboardImages } from '../../images';

interface ShareQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteData?: {
    id: string;
    customerName: string;
    policyType: string;
  };
  /** Sheet heading. Defaults to the quote-created wording. */
  title?: string;
  subtitle?: string;
  /** Label for the id row — 'Policy ID:' / 'Renewal Policy ID:' etc. */
  idLabel?: string;
  /** Heading above the channel buttons. */
  shareLabel?: string;
}

/**
 * Share sheet used after creating a quote, and reused by the Policies and
 * Renewals tabs — the layout and channels are identical, only the wording
 * differs, so the labels are parameterised rather than duplicated.
 */
export const ShareQuoteModal: React.FC<ShareQuoteModalProps> = ({
  isOpen,
  onClose,
  quoteData = { id: 'QT - 28686-8728387', customerName: 'Rakesh Kumar', policyType: '4 Wheeler policy' },
  title = 'Quote Created Successfully!',
  subtitle = 'Share the quote with your customer.',
  idLabel = 'Quote ID:',
  shareLabel = 'Share the quote via:',
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  const handleCopyLink = () => {
    setCopied(true);
  };

  return (
    <BottomSheet
      visible={isOpen}
      onClose={onClose}
      icon={<CheckCircle size={20} color="#65A30D" weight="regular" />}
      featuredIconColor="lime"
      featuredIconShape="ring"
      title={title}
      subtitle={subtitle}
      contentMinHeight={0}
    >
      <View style={styles.content}>
        {copied ? <Toast variant="neutral" title="Link copied" onClose={() => setCopied(false)} /> : null}

        {/* Quote summary */}
        <View style={styles.summary}>
          <Row label={idLabel} value={quoteData.id} />
          <Row label="Customer name:" value={quoteData.customerName} />
          <Row label="Policy Type:" value={quoteData.policyType} />
        </View>

        {/* Share via */}
        <View style={styles.shareBlock}>
          <Text style={styles.shareLabel}>{shareLabel}</Text>

          <View style={styles.channelRow}>
            <ShareCard
              label="WhatsApp"
              icon={<Image source={dashboardImages.whatsapp} style={styles.channelIcon} resizeMode="contain" />}
              border="#A7F3D0"
              tint="#ECFDF5"
              onPress={onClose}
            />
            <ShareCard
              label="Email"
              icon={<Image source={dashboardImages.mail} style={styles.channelIcon} resizeMode="contain" />}
              border="#FED7AA"
              tint="#FFF7ED"
              onPress={onClose}
            />
          </View>

          <Button label="SMS" variant="secondaryGray" leadingIcon={<ChatText size={16} color={colors.textBody} />} onPress={onClose} fullWidth />
          <Button label="Copy Link" variant="secondaryGray" leadingIcon={<Link size={16} color={colors.textBody} />} onPress={handleCopyLink} fullWidth />
          <Button label="PDF" variant="secondaryGray" leadingIcon={<DownloadSimple size={16} color={colors.textBody} />} onPress={onClose} fullWidth />
        </View>
      </View>
    </BottomSheet>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const ShareCard: React.FC<{ label: string; icon: React.ReactNode; border: string; tint: string; onPress: () => void }> = ({ label, icon, border, tint, onPress }) => (
  <Pressable style={[styles.channel, { borderColor: border }]} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
    <LinearGradient colors={['#FFFFFF', tint]} style={StyleSheet.absoluteFill} />
    {icon}
    <Text style={styles.channelLabel}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  summary: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  rowLabel: { fontFamily: typography.fontFamily, fontSize: 16, lineHeight: 24, color: colors.textBody },
  rowValue: { fontFamily: typography.fontFamily, fontSize: 16, lineHeight: 24, color: colors.textHeading, flexShrink: 1, textAlign: 'right' },
  shareBlock: { gap: spacing.md },
  shareLabel: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.textHeading },
  channelRow: { flexDirection: 'row', gap: spacing.md },
  // overflow:hidden keeps the gradient inside the rounded border.
  channel: {
    flex: 1,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  channelIcon: { width: 32, height: 32 },
  channelLabel: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody },
});
