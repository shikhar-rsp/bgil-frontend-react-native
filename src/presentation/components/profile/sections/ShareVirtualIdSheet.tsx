import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ChatCentered, IdentificationCard } from 'phosphor-react-native';
import {
  BottomSheet,
  Checkbox,
  colors,
  spacing,
  radius,
  typography,
  fontFamilyForWeight,
  BOTTOM_SHEET_HEADER_GLYPH_SIZE,
} from '@atlas-ds/react-native';
import type { Customer, ShareChannel } from '../../../../domain/entities/profile_entities';
import { dashboardImages } from '../../dashboard/images';
import { SHARE_CHANNELS } from '../constants';
import { CustomerMultiSelect } from './CustomerMultiSelect';

interface ShareVirtualIdSheetProps {
  isOpen: boolean;
  customers: Customer[];
  onClose: () => void;
  onShare: (customerIds: string[], channels: ShareChannel[]) => Promise<void>;
}

/** Picks recipients and delivery channels for the Virtual ID. */
export const ShareVirtualIdSheet: React.FC<ShareVirtualIdSheetProps> = ({
  isOpen,
  customers,
  onClose,
  onShare,
}) => {
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<ShareChannel[]>([]);
  const [isSharing, setIsSharing] = useState(false);

  // Clear the previous selection whenever the sheet is reopened. Adjusting state
  // during render (rather than in an effect) avoids a cascading re-render.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setSelectedCustomerIds([]);
      setSelectedChannels([]);
    }
  }

  const toggleChannel = (channel: ShareChannel) => {
    setSelectedChannels((channels) =>
      channels.includes(channel)
        ? channels.filter((item) => item !== channel)
        : [...channels, channel]
    );
  };

  const canShare = selectedCustomerIds.length > 0 && selectedChannels.length > 0;

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await onShare(selectedCustomerIds, selectedChannels);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <BottomSheet
      visible={isOpen}
      onClose={onClose}
      icon={<IdentificationCard size={BOTTOM_SHEET_HEADER_GLYPH_SIZE} color={colors.brand} />}
      title="Share Virtual ID with customers"
      subtitle="Choose the customer and select a sharing method to send the Virtual ID."
      primaryAction={{
        label: 'Share ID',
        onPress: handleShare,
        disabled: !canShare || isSharing,
      }}
      secondaryAction={{ label: 'Cancel', onPress: onClose }}
    >
      <View style={styles.content}>
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Select Customers</Text>
          <CustomerMultiSelect
            customers={customers}
            selectedIds={selectedCustomerIds}
            onChange={setSelectedCustomerIds}
          />
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Share your Virtual ID via</Text>
          <View style={styles.channelRow}>
            {SHARE_CHANNELS.map((channel) => {
              const isSelected = selectedChannels.includes(channel.id);
              return (
                <Pressable
                  key={channel.id}
                  onPress={() => toggleChannel(channel.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={channel.label}
                  style={[styles.channel, { borderColor: channel.border }]}
                >
                  {/* Coloured border always; the tinted fill only once picked. */}
                  {isSelected ? (
                    <LinearGradient
                      colors={['#FFFFFF', channel.tint]}
                      style={StyleSheet.absoluteFill}
                    />
                  ) : null}

                  <View style={styles.channelTick} pointerEvents="none">
                    <Checkbox checked={isSelected} size="sm" />
                  </View>

                  {channel.iconKey ? (
                    <Image
                      source={dashboardImages[channel.iconKey]}
                      style={styles.channelIcon}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.smsIcon}>
                      <ChatCentered size={14} color={colors.textOnBrand} />
                    </View>
                  )}

                  <Text style={styles.channelLabel}>{channel.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingBottom: spacing.sm },
  block: { gap: spacing.sm },
  blockTitle: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 14,
    lineHeight: 20,
    color: colors.textHeading,
  },
  channelRow: { flexDirection: 'row', gap: spacing.md },
  // overflow:hidden keeps the gradient inside the rounded border.
  channel: {
    flex: 1,
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    overflow: 'hidden',
  },
  channelTick: { position: 'absolute', right: spacing.sm, top: spacing.sm },
  channelIcon: { width: 24, height: 24 },
  smsIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: '#2563EB',
  },
  channelLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textHeading,
  },
});
