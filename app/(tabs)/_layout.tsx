import React from 'react';
import { Tabs } from 'expo-router';
import { FloatingTabBar } from '../../components/ui';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="schedule" options={{ title: 'Schedule' }} />
      <Tabs.Screen name="plan" options={{ title: 'Sleep Plan' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
