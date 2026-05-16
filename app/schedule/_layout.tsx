import React from 'react';
import { Stack } from 'expo-router';

export default function ScheduleStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
        presentation: 'modal',
      }}
    >
      <Stack.Screen name="add-shift" />
    </Stack>
  );
}
