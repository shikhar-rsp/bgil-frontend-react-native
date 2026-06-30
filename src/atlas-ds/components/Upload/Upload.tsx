import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { UploadSimple } from 'phosphor-react-native';
import { colors, radius, spacing, typography } from '../../theme';

const UPLOAD_ICON_SIZE = 20;

/** Information about the currently-attached file. */
export interface UploadFile {
  /** Display name shown in the "Uploaded" row. */
  name: string;
  /** Optional size in bytes — used for the bytes-vs-MB helper. */
  size?: number;
  /** Native File object (web) — consumers can keep this for upload. */
  raw?: any;
}

export interface UploadProps {
  // ---- Label row ----
  /** Label shown above the drop zone (e.g. "Upload"). */
  label?: string;
  /** When true, appends a red asterisk to the label. */
  required?: boolean;
  /** When true, appends "(Optional)" to the label. */
  optional?: boolean;

  // ---- Drop zone ----
  /** Hint shown inside the drop zone (e.g. "PDF, JPG or PNG (Max 5MB)"). */
  hint?: string;
  /** `accept` attribute for the web file input (e.g. ".pdf,image/*"). */
  accept?: string;
  /** Reject files larger than this many MB; surfaces a built-in error. */
  maxSizeMB?: number;
  /** Override the default upload glyph (Phosphor `UploadSimple`, 20px). */
  uploadIcon?: React.ReactNode;

  // ---- State ----
  /** When set, the component renders the "Uploaded" layout with the file row. */
  file?: UploadFile | null;
  /** Error message — when set, the drop zone gets a red dashed border. */
  error?: string;
  /** When true, the drop zone is filled grey and ignores taps. */
  disabled?: boolean;

  // ---- Events ----
  /**
   * Called when the user picks a valid file. On web, the component handles
   * the hidden <input type="file"> internally and fires this. On native RN,
   * provide your own `onPickPress` that opens a native document picker (e.g.
   * @react-native-documents/picker) and pass the resulting file back via `file`.
   */
  onFileSelect?: (file: UploadFile) => void;
  /** Tap the trash icon on the uploaded row. */
  onFileRemove?: () => void;
  /**
   * Optional override for the drop-zone tap. When provided, the built-in
   * web file-picker behaviour is skipped — useful for native RN.
   */
  onPickPress?: () => void;
  /** Called with a built-in error string when validation fails. */
  onError?: (message: string) => void;

  // ---- Supporting row ----
  /** Helper text shown below the drop zone (overridden by `error` when set). */
  helperText?: string;
  /** Label for the right-side text link in the supporting row. */
  ctaLabel?: string;
  /** When undefined the CTA link is hidden. */
  onCtaPress?: () => void;

  // ---- Uploaded row ----
  /** Override the inline file-icon (default = the PDF badge). */
  fileIcon?: React.ReactNode;
  /** Override the inline trash glyph. */
  trashIcon?: React.ReactNode;

  /** Style override on the outer container. */
  style?: object;
}

/**
 * Upload — file-drop affordance matching Figma node 9270:2493.
 *
 * Five visual states (per Figma):
 *   • Default — dashed slate-300 border, white surface.
 *   • Active  — same border + focus ring shadow (4px slate-100).
 *   • Error   — red-600 dashed border + red helper text.
 *   • Uploaded — same border + file row below (PDF badge + name + trash).
 *   • Disabled — slate-100 fill + muted slate-300 hint text.
 *
 * On react-native-web the component renders a hidden <input type="file">
 * and triggers it when the drop zone is pressed — gives consumers a
 * working web upload out of the box. In native RN, pass `onPickPress`
 * with your own document-picker logic.
 */
export const Upload: React.FC<UploadProps> = ({
  label = 'Upload',
  required,
  optional,
  hint = 'PDF, JPG or PNG (Max 5MB)',
  accept,
  maxSizeMB,
  uploadIcon,
  file,
  error,
  disabled,
  onFileSelect,
  onFileRemove,
  onPickPress,
  onError,
  helperText,
  ctaLabel,
  onCtaPress,
  fileIcon,
  trashIcon,
  style,
}) => {
  const [isActive, setIsActive] = useState(false);
  // Ref to the hidden file input on web.
  const fileInputRef = useRef<any>(null);

  const handlePickPress = () => {
    if (disabled) return;
    if (onPickPress) { onPickPress(); return; }
    // On web (incl. react-native-web), trigger the hidden input.
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: any) => {
    const f: File | undefined = e?.target?.files?.[0];
    if (!f) return;
    if (maxSizeMB && f.size > maxSizeMB * 1024 * 1024) {
      onError?.(`File exceeds the ${maxSizeMB} MB limit.`);
      // Reset so picking the same file again still fires onChange.
      e.target.value = '';
      return;
    }
    onFileSelect?.({ name: f.name, size: f.size, raw: f });
    e.target.value = '';
  };

  // Pick the dashed-border colour based on state precedence:
  //   error > active > default. Disabled uses no border but a filled bg.
  const borderColor = disabled
    ? '#F1F5F9'
    : error
      ? colors.danger
      : colors.border;
  const dropZoneBg = disabled ? colors.surfaceMuted : colors.surface;
  const hintColor = disabled ? colors.textDisabled : colors.textMuted;

  // Helper text — error message wins, then helperText prop, otherwise nothing.
  const showHelper = error || helperText;

  return (
    <View style={[styles.container, style]}>
      {/* Hidden file input (web only) — triggered programmatically. */}
      {Platform.OS === 'web' && !onPickPress && (
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          aria-hidden
          tabIndex={-1}
        />
      )}

      {/* ---- Label ----
          Figma renders "Upload*(Optional)" with NO spacing between segments
          — the asterisk sits flush against the word and "(Optional)" follows
          immediately. We concatenate without padding. */}
      {!!label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
          {optional && <Text style={styles.label}>(Optional)</Text>}
        </View>
      )}

      {/* ---- Drop zone ---- */}
      <Pressable
        onPress={handlePickPress}
        onHoverIn={() => setIsActive(true)}
        onHoverOut={() => setIsActive(false)}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${hint}`}
        style={({ pressed }) => [
          styles.dropZone,
          {
            borderColor,
            backgroundColor: dropZoneBg,
          },
          (isActive || pressed) && !disabled && !error && styles.dropZoneActive,
        ]}
      >
        <View style={styles.iconBadge}>
          {uploadIcon ?? (
            <UploadSimple
              size={UPLOAD_ICON_SIZE}
              color={disabled ? colors.textDisabled : colors.textBody}
              weight="regular"
            />
          )}
        </View>
        <Text style={[styles.hint, { color: hintColor }]}>{hint}</Text>
      </Pressable>

      {/* ---- Supporting row (helper + CTA link) ----
          Per Figma, the supporting row renders immediately after the drop
          zone; the uploaded file row sits below it. */}
      {(showHelper || (ctaLabel && onCtaPress)) && (
        <View style={styles.supportRow}>
          {showHelper && (
            <Text
              style={[styles.helperText, error ? styles.helperError : null]}
            >
              {error || helperText}
            </Text>
          )}
          {ctaLabel && onCtaPress && (
            <Pressable onPress={onCtaPress} hitSlop={6} accessibilityRole="link">
              <Text style={styles.cta}>{ctaLabel}</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* ---- Uploaded file row ---- */}
      {file && !disabled && (
        <View style={styles.fileRow}>
          <View style={styles.fileLeft}>
            <View style={styles.fileIconBadge}>
              {fileIcon ?? <PdfGlyph color="#2563EB" />}
            </View>
            <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
          </View>
          {onFileRemove && (
            <Pressable onPress={onFileRemove} hitSlop={8} accessibilityRole="button" accessibilityLabel="Remove file">
              {trashIcon ?? <TrashGlyph color={colors.textBody} />}
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Inline glyphs — PDF badge + trash (upload uses Phosphor via `uploadIcon`).
// ---------------------------------------------------------------------------

/** PDF file icon — small rounded rectangle in slate-blue. */
const PdfGlyph: React.FC<{ color: string }> = ({ color }) => (
  <View style={[glyphs.pdf, { borderColor: color }]} accessibilityElementsHidden>
    <Text style={[glyphs.pdfLabel, { color }]}>PDF</Text>
  </View>
);

/** Trash can icon — outline body + lid line. */
const TrashGlyph: React.FC<{ color: string }> = ({ color }) => (
  <View style={glyphs.trashWrap} accessibilityElementsHidden>
    <View style={[glyphs.trashLid, { backgroundColor: color }]} />
    <View style={[glyphs.trashBody, { borderColor: color }]} />
  </View>
);

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: spacing.sm, // 8 between label / drop zone / supporting row
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textBody,
  },
  required: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: colors.danger, // #B91C1C-ish — close enough to spec
  },
  // Drop zone — Figma `layout_XUAPK5`: row, padding 4 12 4 4, gap 8, dashed.
  dropZone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,    // 4
    paddingHorizontal: spacing.md,  // 12 right / 4 left handled by paddingLeft below
    paddingLeft: spacing.xs,         // 4 (icon hugs the left edge)
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
  },
  // Active state — Figma shadow `0 0 0 4px rgba(241, 245, 249, 1) + 0 1 2 rgba(10,13,18,0.05)`.
  dropZoneActive: {
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    // RNW renders the 4px focus ring as boxShadow; native RN ignores the second
    // shadow but the visual still reads as "active".
    // @ts-ignore
    boxShadow: '0 0 0 4px rgba(241, 245, 249, 1), 0 1px 2px rgba(10, 13, 18, 0.05)',
  },
  // 32×32 icon badge — slate-50 bg, radius 6, padding 6
  iconBadge: {
    width: 32,
    height: 32,
    padding: 6,
    borderRadius: radius.md,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  // Uploaded file row — Figma `layout_9J6JSR`: row, gap 8
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  fileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  // PDF file badge — Figma `layout_N06SZ8`: padding 4, radius 4, bg #EFF6FF
  fileIconBadge: {
    padding: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: '#000000', // matches Figma fill_Y14PYG
  },
  // Supporting row — Figma `layout_JTIVHA`: row, space-between, fill width
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helperText: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textBody,
  },
  helperError: {
    color: colors.danger,
  },
  cta: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.brandPressed,
  },
});

const glyphs = StyleSheet.create({
  // PDF mini-badge
  pdf: {
    width: 28,
    height: 16,
    borderWidth: 1.2,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfLabel: {
    fontFamily: 'Rubik',
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '700',
  },
  // Trash can
  trashWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashLid: {
    width: 12,
    height: 1.6,
    borderRadius: 0.5,
    marginTop: 1,
  },
  trashBody: {
    width: 9,
    height: 10,
    borderWidth: 1.6,
    borderRadius: 1,
    marginTop: 1,
  },
});
