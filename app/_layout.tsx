/**
 * Root stack — loads fonts, wires safe-area + gesture handler, applies base canvas.
 */

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, LogBox, Platform } from 'react-native';

// Silence the dev-mode red toast for transient network failures during
// Edge Function cold starts. The hooks already fall back to mock data;
// the toast was confusing in QA. Filter ONLY the specific message —
// other network errors still surface.
import { useAppFonts } from '../hooks/useAppFonts';
import { colors } from '../constants/tokens';
import { AuthProvider } from '../lib/auth/store';
import { OnboardingProvider } from '../lib/onboarding/store';
import { ensureAdaptyActivated } from '../lib/adapty';
import { ensureAppsFlyerInit } from '../lib/appsflyer';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

if (__DEV__) {
  LogBox.ignoreLogs([
    'Network request failed',
    /TypeError:\s*Network request failed/,
  ]);
}

SplashScreen.preventAutoHideAsync().catch(() => null);

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => null);
    }
  }, [fontsLoaded]);

  // Activate third-party SDKs once on launch. ATT prompt fires BEFORE
  // AppsFlyer init so the SDK can use IDFA if user grants. Both no-op
  // when their key is not in the env (dev mode without .env works fine).
  useEffect(() => {
    (async () => {
      if (Platform.OS === 'ios') {
        // ATT can only fire when app is in foreground active state. expo-tracking-transparency
        // handles the timing internally. Silent if Info.plist key missing.
        try {
          await requestTrackingPermissionsAsync();
        } catch {
          // User denied / unavailable — fine, AppsFlyer falls back to IDFV-only.
        }
      }
      ensureAdaptyActivated().catch(() => null);
      ensureAppsFlyerInit().catch(() => null);
    })();
  }, []);

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
            <Stack.Screen name="schedule" options={{ presentation: 'pageSheet' }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="transition" options={{ presentation: 'pageSheet' }} />
            <Stack.Screen name="transition-create" options={{ presentation: 'pageSheet' }} />
            <Stack.Screen name="history" />
            <Stack.Screen name="paywall" options={{ presentation: 'pageSheet' }} />
          </Stack>
          </OnboardingProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
