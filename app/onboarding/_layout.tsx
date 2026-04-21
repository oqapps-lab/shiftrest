import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
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
