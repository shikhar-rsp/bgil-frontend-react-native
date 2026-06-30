import React, { useRef, useState } from 'react';
import { View, ScrollView, Animated, StyleSheet } from 'react-native';
import { colors } from '../../theme';

export interface ScrollbarProps {
  children: React.ReactNode;
  /** Viewport height (vertical) or width (horizontal) of the scroll area. */
  size?: number;
  /** Scroll direction. Default vertical. */
  horizontal?: boolean;
  /** Thumb colour. Default #E2E8F0 (web scrollbar thumb). */
  thumbColor?: string;
  /** Hide the custom scrollbar entirely (web `scrollbar-hidden`). */
  hidden?: boolean;
  /** Style for the outer viewport. */
  style?: object;
  /** Style for the scrolled content container. */
  contentContainerStyle?: object;
}

const THICKNESS = 4; // web --webkit-scrollbar width/height
const MIN_THUMB = 24;

/**
 * Scrollbar — a scroll viewport with a thin custom scroll thumb. Mirrors the
 * web `.scrollbar` (4px track, #E2E8F0 rounded thumb, transparent track). The
 * native indicator is hidden and a thumb overlay tracks the scroll position.
 */
export const Scrollbar: React.FC<ScrollbarProps> = ({
  children,
  size,
  horizontal = false,
  thumbColor = colors.borderSubtle, // #E2E8F0
  hidden = false,
  style,
  contentContainerStyle,
}) => {
  const [viewport, setViewport] = useState(0);
  const [content, setContent] = useState(0);
  const offset = useRef(new Animated.Value(0)).current;

  const scrollable = content > viewport + 1;
  const ratio = scrollable ? viewport / content : 1;
  const thumbExtent = Math.max(MIN_THUMB, viewport * ratio);
  const maxThumbTravel = Math.max(0, viewport - thumbExtent);
  const maxScroll = Math.max(1, content - viewport);

  const thumbPos = offset.interpolate({
    inputRange: [0, maxScroll],
    outputRange: [0, maxThumbTravel],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[horizontal ? { width: size } : { height: size }, styles.wrap, style]}
      onLayout={(e) =>
        setViewport(horizontal ? e.nativeEvent.layout.width : e.nativeEvent.layout.height)
      }
    >
      <ScrollView
        horizontal={horizontal}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onContentSizeChange={(w, h) => setContent(horizontal ? w : h)}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { [horizontal ? 'x' : 'y']: offset } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={contentContainerStyle}
      >
        {children}
      </ScrollView>

      {scrollable && !hidden ? (
        horizontal ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.thumbBase, { height: THICKNESS, width: thumbExtent, bottom: 0, left: 0, backgroundColor: thumbColor, transform: [{ translateX: thumbPos }] }]}
          />
        ) : (
          <Animated.View
            pointerEvents="none"
            style={[styles.thumbBase, { width: THICKNESS, height: thumbExtent, right: 0, top: 0, backgroundColor: thumbColor, transform: [{ translateY: thumbPos }] }]}
          />
        )
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'relative', overflow: 'hidden' },
  thumbBase: { position: 'absolute', borderRadius: 8 },
});
