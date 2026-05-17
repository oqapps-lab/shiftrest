/**
 * S10 — Family & commitments. Step 9 / 10.
 * Toggle for kids-at-home with conditional pickup time + free-text reveal.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding, type PickupTime } from '../../lib/onboarding/store';
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
import { t } from '../../lib/i18n';

const PICKUP_OPTIONS: { value: PickupTime; label: string }[] = [
  { value: '14', label: '14:00' },
  { value: '15', label: '15:00' },
  { value: '16', label: '16:00' },
  { value: '17', label: '17:00' },
];

export default function Family() {
  const { state, update } = useOnboarding();
  const hasKids = state.hasChildren;
  const pickup = state.pickupTime;
  const other = state.otherCommitments;

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      keyboardAvoiding
      floatingFooter={
        <PillCTA
          variant="primary"
          label={t('onboarding.continue')}
          onPress={() => router.push('/onboarding/name')}
        />
      }
    >
      <Eyebrow>{t('onboarding.step_template', { n: 9, total: 10 })}</Eyebrow>
      <ProgressDots
        count={10}
        active={8}
        style={{ marginVertical: spacing.sm, justifyContent: 'flex-start' }}
      />

      <HeroNumber
        value={t('onboarding_screens.family.hero')}
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        {t('onboarding_screens.family.sub')}
      </Text>

      <View style={styles.toggleRow}>
        <Text variant="titleMd" family="display" weight="medium" color="ink">
          {t('onboarding_screens.family.kids_label')}
        </Text>
        <Toggle
          value={hasKids}
          onChange={(v) => update({ hasChildren: v })}
          accessibilityLabel={t('onboarding_screens.family.kids_a11y')}
        />
      </View>

      {hasKids && (
        <View style={{ marginTop: spacing.xl }}>
          <Eyebrow style={{ marginBottom: spacing.md }}>{t('onboarding_screens.family.pickup_time')}</Eyebrow>
          <SegmentedControl<PickupTime>
            options={PICKUP_OPTIONS}
            value={pickup}
            onChange={(v) => update({ pickupTime: v })}
          />

          <Eyebrow style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
            {t('onboarding_screens.family.other_commitments')}
          </Eyebrow>
          <TextField
            placeholder={t('onboarding_screens.family.placeholder')}
            value={other}
            onChangeText={(v) => update({ otherCommitments: v })}
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
