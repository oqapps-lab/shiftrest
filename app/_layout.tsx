/**
 * Root stack — loads fonts, wires safe-area + gesture handler, applies base canvas.
 */

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, LogBox } from 'react-native';

// Silence the dev-mode red toast for transient network failures during
// Edge Function cold starts. The hooks already fall back to mock data;
// the toast was confusing in QA. Filter ONLY the specific message —
// other network errors still surface.
if (__DEV__) {
  LogBox.ignoreLogs([
    'Network request failed',
    /TypeError:\s*Network request failed/,
  ]);
}
import { useAppFonts } from '../hooks/useAppFonts';
import { colors } from '../constants/tokens';
import { AuthProvider } from '../lib/auth/store';
import { OnboardingProvider } from '../lib/onboarding/store';

SplashScreen.preventAutoHideAsync().catch(() => null);

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => null);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    // Splash screen still visible; render nothing under it
    return <View style={{ flex: 1, backgroundColor: colors.canvas }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaProvider>
        <AuthProvider>
          <OnboardingProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.canvas },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="schedule" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="transition" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="paywall" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          </Stack>
          </OnboardingProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
