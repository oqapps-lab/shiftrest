/**
 * Settings → Chronotype (drill-down). MEQ-lite 3-question quiz.
 * Shows resolved bucket below the quiz so users see their chronotype.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Screen,
  Eyebrow,
  SerifHero,
  Text,
  Glyph,
  OptionCard,
  GlassCard,
} from '../../components/ui';
import { spacing, colors } from '../../constants/tokens';
import { mockChronotypeQuestions } from '../../mock/user';
import {
  useOnboarding,
  computeChronotypeScore,
  chronotypeBucket,
} from '../../lib/onboarding/store';
import { safeBack } from '../../lib/nav';
import { t } from '../../lib/i18n';

export default function ChronotypeSettings() {
  const { state, update } = useOnboarding();
  const score = computeChronotypeScore(state.chronotypeAnswers);
  const bucket = chronotypeBucket(score);

  return (
    <Screen orbs="subtle" scroll tabBarClearance={false}>
      <Pressable
        onPress={() => safeBack('/settings/sleep-preferences')}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.back')}
        style={styles.backRow}
      >
        <Glyph name="chevronLeft" size={22} color="inkMuted" />
      </Pressable>

      <Eyebrow>{t('settings_sub.chronotype.eyebrow')}</Eyebrow>
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        <SerifHero>{t('settings_sub.chronotype.title')}</SerifHero>
      </View>
      <Text variant="bodyMd" color="inkSubtle" style={{ marginBottom: spacing.huge }}>
        {t('settings_sub.chronotype.subtitle')}
      </Text>

      {bucket && (
        <GlassCard variant="paper" padding="xl" style={{ marginBottom: spacing.huge }}>
          <Eyebrow>{t('settings_sub.chronotype.your_result_eyebrow')}</Eyebrow>
          <Text
            variant="titleLg"
            family="display"
            weight="medium"
            color="ink"
            style={{ marginTop: spacing.xs }}
          >
            {t(`settings_sub.chronotype.bucket_${bucket}`)}
          </Text>
          <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.sm }}>
            {t(`settings_sub.chronotype.bucket_${bucket}_hint`)}
          </Text>
        </GlassCard>
      )}

      {mockChronotypeQuestions.map((q, qIdx) => (
        <View key={q.id} style={{ marginBottom: spacing.lg }}>
          <Text
            variant="titleMd"
            family="display"
            weight="medium"
            color="ink"
            style={{ marginBottom: spacing.sm }}
          >
            {`Q${qIdx + 1}. ${q.question}`}
          </Text>
          {q.options.map((opt) => (
            <OptionCard
              key={opt.id}
              title={opt.label}
              selected={state.chronotypeAnswers[q.id] === opt.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                update({
                  chronotypeAnswers: {
                    ...state.chronotypeAnswers,
                    [q.id]: opt.id,
                  },
                });
              }}
              accessibilityLabel={`${q.question} — ${opt.label}`}
            />
          ))}
        </View>
      ))}

      <View style={{ height: spacing.huge }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  backRow: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
});
