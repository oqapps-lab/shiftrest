/**
 * S02 — Profession picker. Step 1 / 10.
 * 4 glass cards, one selected at a time, haptic on select.
 */

import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Screen,
  GlassCard,
  HeroNumber,
  Eyebrow,
  Text,
  PillCTA,
  ProgressDots,
  Glyph,
} from '../../components/ui';
import { colors, spacing, radii } from '../../constants/tokens';
import { mockProfessions } from '../../mock/user';

export default function Profession() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      floatingFooter={
        <PillCTA
          variant="primary"
          label="Continue"
          disabled={!selected}
          onPress={() => router.push('/onboarding/schedule')}
        />
      }
    >
      <Eyebrow>STEP 1 OF 10</Eyebrow>
      <ProgressDots count={10} active={0} style={{ marginVertical: spacing.sm, justifyContent: 'flex-start' }} />

      <HeroNumber
        value="What do you do?"
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text variant="bodyLg" color="inkSubtle" style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}>
        {"We tune every recommendation to your profession's rotation pattern."}
      </Text>

      {mockProfessions.map((p) => {
        const isActive = selected === p.id;
        return (
          <Pressable
            key={p.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelected(p.id);
            }}
            accessibilityRole="button"
            accessibilityLabel={p.title}
            accessibilityState={{ selected: isActive }}
            style={{ marginBottom: spacing.md }}
          >
            <GlassCard
              variant={isActive ? 'glass' : 'paper'}
              padding="xxl"
              style={[
                styles.row,
                isActive && { borderWidth: 0, shadowColor: colors.primary, shadowOpacity: 0.18, shadowRadius: 20 },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: isActive ? colors.primaryContainer : colors.surfaceHigh }]}>
                <Glyph name={p.glyph} size={24} color={isActive ? 'primary' : 'inkMuted'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="titleLg" family="display" weight="medium" color="ink">
                  {p.title}
                </Text>
                <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
                  {p.subtitle}
                </Text>
              </View>
              <View
                style={[
                  styles.radio,
                  { borderColor: isActive ? colors.primary : colors.inkGhost },
                ]}
              >
                {isActive && <View style={styles.radioInner} />}
              </View>
            </GlassCard>
          </Pressable>
        );
      })}

    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
