/**
 * S10 — Family & commitments. Step 9 / 10.
 * Toggle for kids-at-home with conditional pickup time + free-text reveal.
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import {
  Screen,
  HeroNumber,
  Eyebrow,
  Text,
  PillCTA,
  ProgressDots,
  Toggle,
  SegmentedControl,
  TextField,
} from '../../components/ui';
import { spacing } from '../../constants/tokens';

type PickupValue = '14' | '15' | '16' | '17';

const PICKUP_OPTIONS: { value: PickupValue; label: string }[] = [
  { value: '14', label: '14:00' },
  { value: '15', label: '15:00' },
  { value: '16', label: '16:00' },
  { value: '17', label: '17:00' },
];

export default function Family() {
  const [hasKids, setHasKids] = useState(false);
  const [pickup, setPickup] = useState<PickupValue>('15');
  const [other, setOther] = useState('');

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      floatingFooter={
        <PillCTA
          variant="primary"
          label="Continue"
          onPress={() => router.push('/onboarding/name')}
        />
      }
    >
      <Eyebrow>STEP 9 OF 10</Eyebrow>
      <ProgressDots
        count={10}
        active={8}
        style={{ marginVertical: spacing.sm, justifyContent: 'flex-start' }}
      />

      <HeroNumber
        value="Any family commitments?"
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        Fixed obligations change our plan (school pickup, etc).
      </Text>

      <View style={styles.toggleRow}>
        <Text variant="titleMd" family="display" weight="medium" color="ink">
          I have kids at home
        </Text>
        <Toggle
          value={hasKids}
          onChange={setHasKids}
          accessibilityLabel="Have kids at home"
        />
      </View>

      {hasKids && (
        <View style={{ marginTop: spacing.xl }}>
          <Eyebrow style={{ marginBottom: spacing.md }}>PICKUP TIME</Eyebrow>
          <SegmentedControl<PickupValue>
            options={PICKUP_OPTIONS}
            value={pickup}
            onChange={setPickup}
          />

          <Eyebrow style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
            OTHER COMMITMENTS
          </Eyebrow>
          <TextField
            placeholder="e.g. yoga Tue/Thu 18:00"
            value={other}
            onChangeText={setOther}
            autoCapitalize="sentences"
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
});
