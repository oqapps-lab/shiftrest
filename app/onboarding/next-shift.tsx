/**
 * S05 — Next-shift picker. Step 4 / 11.
 *
 * Single most actionable data point per 2026-05-25 funnel research:
 * powers the 36-hour pre-shift plan that's ShiftRest's main aha-moment.
 * Always shown (research advised "ask for all users, not just off-today").
 */

import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import {
  Screen,
  HeroNumber,
  Eyebrow,
  Text,
  PillCTA,
  ProgressDots,
  OnboardingBack,
  OptionCard,
  DateTimePickerField,
} from '../../components/ui';
import { spacing } from '../../constants/tokens';
import type { GlyphName } from '../../components/ui';
import { useOnboarding, type NextShift } from '../../lib/onboarding/store';
import { t } from '../../lib/i18n';

interface NextShiftOption {
  id: NextShift;
  glyph: GlyphName;
}

const OPTIONS: NextShiftOption[] = [
  { id: 'tonight', glyph: 'moon' },
  { id: 'tomorrow_am', glyph: 'sun' },
  { id: 'tomorrow_pm', glyph: 'alarm' },
  { id: 'day_after', glyph: 'calendar' },
  { id: 'on_break', glyph: 'leaf' },
];

function defaultCustom(): Date {
  const d = new Date();
  d.setHours(d.getHours() + 12, 0, 0, 0);
  return d;
}
function parseCustom(s: string | null): Date {
  if (!s) return defaultCustom();
  const d = new Date(s);
  return isNaN(d.getTime()) ? defaultCustom() : d;
}

export default function NextShiftScreen() {
  const { state, update } = useOnboarding();
  const selected = state.nextShift;
  const customSelected = selected === 'custom';

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      footerClearance={208}
      floatingFooter={
        <PillCTA
          variant="primary"
          label={t('onboarding.continue')}
          disabled={!selected}
          onPress={() => router.push('/onboarding/problem')}
        />
      }
    >
      <OnboardingBack />
      <Eyebrow>{t('onboarding.step_template', { n: 4, total: 11 })}</Eyebrow>
      <ProgressDots
        count={11}
        active={3}
        style={{ marginVertical: spacing.sm, justifyContent: 'flex-start' }}
      />

      <HeroNumber
        value={t('onboarding_screens.next_shift.hero')}
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.lg }}
      >
        {t('onboarding_screens.next_shift.sub')}
      </Text>

      {OPTIONS.map((opt) => (
        <OptionCard
          key={opt.id}
          title={t(`onboarding_screens.next_shift.options.${opt.id}.title`)}
          subtitle={t(`onboarding_screens.next_shift.options.${opt.id}.subtitle`)}
          glyph={opt.glyph}
          selected={selected === opt.id}
          onPress={() => update({ nextShift: opt.id })}
          accessibilityLabel={t(`onboarding_screens.next_shift.options.${opt.id}.title`)}
        />
      ))}

      {/* R26-3: pick an exact date + time when none of the presets fit. */}
      <OptionCard
        key="custom"
        title={t('onboarding_screens.next_shift.options.custom.title')}
        subtitle={t('onboarding_screens.next_shift.options.custom.subtitle')}
        glyph="calendar"
        selected={customSelected}
        onPress={() =>
          update({
            nextShift: 'custom',
            nextShiftCustom: state.nextShiftCustom ?? defaultCustom().toISOString(),
          })
        }
        accessibilityLabel={t('onboarding_screens.next_shift.options.custom.title')}
      />
      {customSelected && (
        <View style={{ marginTop: spacing.md }}>
          <DateTimePickerField
            label={t('onboarding_screens.next_shift.options.custom.title')}
            mode="datetime"
            value={parseCustom(state.nextShiftCustom)}
            onChange={(d) => update({ nextShiftCustom: d.toISOString() })}
            accessibilityLabel={t('onboarding_screens.next_shift.options.custom.title')}
          />
        </View>
      )}
    </Screen>
  );
}
