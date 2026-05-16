import React from 'react';
import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="sleep-preferences" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="about" />
    </Stack>
  );
}
