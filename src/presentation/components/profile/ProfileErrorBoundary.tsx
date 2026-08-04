import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, colors, spacing, typography, fontFamilyForWeight } from '@atlas-ds/react-native';

interface ProfileErrorBoundaryProps {
  children: ReactNode;
  /** Returns the user to the dashboard — the web build used `window.location`. */
  onGoBack: () => void;
}

interface ProfileErrorBoundaryState {
  hasError: boolean;
}

/**
 * Scoped error boundary for the Profile module.
 *
 * Without a boundary a render-time throw unmounts the whole React root, leaving a
 * blank screen that only an app restart recovers. This keeps such a failure
 * contained to the profile screen and offers a way back.
 */
export class ProfileErrorBoundary extends Component<
  ProfileErrorBoundaryProps,
  ProfileErrorBoundaryState
> {
  state: ProfileErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ProfileErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Profile] Render error:', error, errorInfo.componentStack);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.body}>
          We couldn't display your profile. Please try again, or head back to the dashboard.
        </Text>
        <View style={styles.actions}>
          <Button
            label="Try again"
            variant="secondaryGray"
            size="md"
            onPress={() => this.setState({ hasError: false })}
          />
          <Button label="Back to dashboard" size="md" onPress={this.props.onGoBack} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    minHeight: 400,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 20,
    lineHeight: 28,
    color: colors.textHeading,
  },
  body: {
    textAlign: 'center',
    maxWidth: 420,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textBody,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
