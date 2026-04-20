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
      <Stack.Screen name="loading" />
      <Stack.Screen name="aha" />
    </Stack>
  );
}
