/**
 * Pure-View chevron icons. Drawn with two rotated borders to form a "<" / ">"
 * shape — no extra icon library required. If the consumer app already has
 * `lucide-react-native` or `@phosphor-icons/react-native`, swap these out at
 * the import site.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface IconProps {
  size?: number;
  color?: string;
}

const Caret: React.FC<IconProps & { direction: 'left' | 'right' | 'double-left' | 'double-right' }> = ({
  size = 16,
  color = colors.textHeading,
  direction,
}) => {
  const armSize = Math.round(size * 0.4);
  const armStyle = {
    width: armSize,
    height: armSize,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: color,
  };
  const rotate = direction === 'left' || direction === 'double-left' ? '-135deg' : '45deg';

  return (
    <View style={[styles.row, { width: size, height: size }]}>
      {(direction === 'double-left' || direction === 'double-right') && (
        <View style={[armStyle, { transform: [{ rotate }], marginRight: -armSize / 3 }]} />
      )}
      <View style={[armStyle, { transform: [{ rotate }] }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const ChevronLeft: React.FC<IconProps> = (props) => <Caret {...props} direction="left" />;
export const ChevronRight: React.FC<IconProps> = (props) => <Caret {...props} direction="right" />;
export const ChevronsLeft: React.FC<IconProps> = (props) => <Caret {...props} direction="double-left" />;
export const ChevronsRight: React.FC<IconProps> = (props) => <Caret {...props} direction="double-right" />;
