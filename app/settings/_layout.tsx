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
      <Stack.Screen name="profession" />
      <Stack.Screen name="work-schedule" />
      <Stack.Screen name="chronotype" />
      <Stack.Screen name="caffeine" />
      <Stack.Screen name="melatonin" />
      <Stack.Screen name="light" />
      <Stack.Screen name="health" />
      <Stack.Screen name="family" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="name" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="about" />
    </Stack>
  );
}
