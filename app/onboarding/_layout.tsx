import React, { useEffect } from 'react';
import { Stack, usePathname } from 'expo-router';
import { useOnboarding } from '../../lib/onboarding/store';

export default function OnboardingLayout() {
  // R13-1: persist the last onboarding route so Welcome can resume the
  // user after an app kill / cold-launch. Read pathname on every nav.
  const { update, state } = useOnboarding();
  const pathname = usePathname();
  useEffect(() => {
    if (pathname?.startsWith('/onboarding/') && pathname !== state.lastOnboardingRoute) {
      update({ lastOnboardingRoute: pathname });
    }
  }, [pathname, state.lastOnboardingRoute, update]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="profession" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="current-shift" />
      <Stack.Screen name="next-shift" />
      <Stack.Screen name="problem" />
      <Stack.Screen name="social-proof-1" />
      <Stack.Screen name="chronotype" />
      <Stack.Screen name="caffeine" />
      <Stack.Screen name="melatonin" />
      <Stack.Screen name="family" />
      <Stack.Screen name="name" />
      <Stack.Screen name="social-proof-2" />
      <Stack.Screen name="loading" />
      <Stack.Screen name="aha" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
