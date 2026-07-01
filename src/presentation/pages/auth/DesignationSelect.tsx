import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Briefcase, User } from 'phosphor-react-native';
import { Tile, colors, spacing } from '@atlas-ds/react-native';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { useAuthUseCases } from '../../hooks/useAuthUseCases';
import { getTokenValue } from '../../../utils/tokenStorage';
import { ENV } from '../../../config/env';
import type { AuthScreenProps } from '../../../navigation';

export const DesignationSelect: React.FC<AuthScreenProps<'DesignationSelect'>> = ({
  navigation,
}) => {
  const { generateToken } = useAuthUseCases();

  useEffect(() => {
    // QC/demo mode: skip the token bootstrap (and its blocking loader) so the
    // login screen is immediately interactive without the UAT backend.
    if (ENV.MOCK_AUTH) {
      return;
    }
    // Only mint a fresh token if one isn't already persisted.
    const savedToken = getTokenValue('authToken');
    if (savedToken) {
      return;
    }
    generateToken()
      .then((result) => console.log('Token generated:', result))
      .catch((err) => console.error('Failed to generate token:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthLayout>
      <AuthHeader title="Log in" subtitle="Welcome back! Please select your designation." />

      <View style={styles.tiles}>
        <Tile
          label="Relationship Manager"
          description="Continue as RM"
          icon={<Briefcase size={20} color={colors.success} />}
          onPress={() => navigation.navigate('RmLogin')}
        />
        <Tile
          label="Insurance Agent"
          description="Continue as Agent"
          icon={<User size={20} color={colors.brand} />}
          onPress={() => navigation.navigate('AgentLogin')}
        />
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  tiles: { gap: spacing.lg, marginTop: spacing.xl },
});
