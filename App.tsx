// gesture-handler must be imported once, before anything else, at the app entry.
import 'react-native-gesture-handler';

import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  createNavigationContainerRef,
  type LinkingOptions,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '@atlas-ds/react-native';
import type { RootStackParamList } from './src/navigation';
import { useAppFonts } from './src/fonts';
import { hydrateTokens } from './src/utils/tokenStorage';
import { setOnUnauthorized } from './src/infrastructure/authEvents';
import { LoaderProvider } from './src/presentation/context/LoaderContext';
import { Loader } from './src/presentation/components/auth/Loader';

import { DesignationSelect } from './src/presentation/pages/auth/DesignationSelect';
import { AgentLogin } from './src/presentation/pages/auth/AgentLogin';
import { RmLogin } from './src/presentation/pages/auth/RmLogin';
import { VerifyOtp } from './src/presentation/pages/auth/VerifyOtp';
import { GetHelp } from './src/presentation/pages/auth/GetHelp';
import { ForgotPassword } from './src/presentation/pages/auth/ForgotPassword';
import { ResetPassword } from './src/presentation/pages/auth/ResetPassword';
import { PasswordSuccess } from './src/presentation/pages/auth/PasswordSuccess';
import { DashboardScreen } from './src/presentation/pages/dashboard/DashboardScreen';
import { RMDashboardScreen } from './src/presentation/pages/dashboard/RMDashboardScreen';
import { TraineeScreen } from './src/presentation/pages/dashboard/TraineeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['atlas://'],
  config: {
    screens: {
      DesignationSelect: '',
      AgentLogin: 'auth/agent',
      RmLogin: 'auth/rm',
      VerifyOtp: 'auth/otp',
      GetHelp: 'auth/help',
      ForgotPassword: 'auth/forgot-password',
      ResetPassword: 'auth/reset-password',
      PasswordSuccess: 'auth/reset-success',
      Dashboard: 'dashboard',
      RMDashboard: 'rmdashboard',
      Trainee: 'trainee',
    },
  },
};

export default function App() {
  const fontsLoaded = useAppFonts();
  const hydrated = useRef(false);

  useEffect(() => {
    // Load persisted auth tokens into the synchronous cache before any request.
    hydrateTokens().finally(() => {
      hydrated.current = true;
    });

    // On forced logout (refresh failure), reset the stack to the login screen.
    setOnUnauthorized(() => {
      if (navigationRef.isReady()) {
        navigationRef.reset({ index: 0, routes: [{ name: 'DesignationSelect' }] });
      }
    });
    return () => setOnUnauthorized(null);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LoaderProvider>
          <NavigationContainer ref={navigationRef} linking={linking}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
            <Stack.Navigator
              initialRouteName="DesignationSelect"
              screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }}
            >
              <Stack.Screen name="DesignationSelect" component={DesignationSelect} />
              <Stack.Screen name="AgentLogin" component={AgentLogin} />
              <Stack.Screen name="RmLogin" component={RmLogin} />
              <Stack.Screen name="VerifyOtp" component={VerifyOtp} />
              <Stack.Screen name="GetHelp" component={GetHelp} />
              <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
              <Stack.Screen name="ResetPassword" component={ResetPassword} />
              <Stack.Screen name="PasswordSuccess" component={PasswordSuccess} />
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="RMDashboard" component={RMDashboardScreen} />
              <Stack.Screen name="Trainee" component={TraineeScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          <Loader />
        </LoaderProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
