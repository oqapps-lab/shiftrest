/**
 * S50 — Profile Overview. Streak heatmap + 3 quick stats + settings list.
 */

import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import {
  Screen,
  Eyebrow,
  SerifHero,
  GlassCard,
  HeroNumber,
  Text,
  Glyph,
  showAppDialog,
} from '../../components/ui';
import { colors, spacing, radii } from '../../constants/tokens';
import { mockProfessions } from '../../mock/user';
import { formatTrialRemaining, clampDisplayName } from '../../lib/derive';
import { useAuth } from '../../lib/auth/store';
import { useOnboarding } from '../../lib/onboarding/store';
import { useStreak, useProfileStats, useSubscription } from '../../lib/queries';
import { useSleepJournal, journaledDayCount, recentJournalDays, weeklyAdaptScore, localCurrentStreak } from '../../lib/sleep-journal/store';
import { t } from '../../lib/i18n';

const STREAK_LENGTH = 14;

export default function Profile() {
  const { user, signOut } = useAuth();
  const { state: onboarding, update } = useOnboarding();

  // B3: tap avatar → pick a photo from the library. Local URI persisted in
  // the onboarding store (a future build uploads to Supabase storage for
  // the public stories feed). Permission-denied shows a branded dialog.
  const pickAvatar = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showAppDialog({
        title: t('profile.avatar.perm_title'),
        message: t('profile.avatar.perm_body'),
        actions: [{ label: t('a11y.close'), style: 'cancel' }],
      });
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!res.canceled && res.assets[0]?.uri) {
      update({ avatarUri: res.assets[0].uri });
    }
  };
  const { data: streak } = useStreak();
  const { data: stats } = useProfileStats();
  const { data: subscription } = useSubscription();
  // G4 + J1 + L1 + F9: live journal counter + recent 14 days for the heatmap
  // + per-bucket tally + non-judgemental adapt score.
  useSleepJournal();
  const journalDays = journaledDayCount();
  // R7-1/2: anonymous users now get streak + daysInApp from local journal
  // (was always 0 before, even with logged days). Signed-in users keep
  // the authoritative Supabase numbers.
  const streakValue = user
    ? (streak?.current_streak ?? 0)
    : localCurrentStreak();
  const daysInApp = user ? (stats?.daysInApp ?? 0) : journalDays;
  const adherencePct = user ? (stats?.onPlanPct ?? 0) : 0;
  const recentJournal = recentJournalDays(STREAK_LENGTH);
  const hasJournalHistory = recentJournal.some((d) => d.rating !== null);
  const adaptScore = weeklyAdaptScore();
  // Map score → positive copy. Never frames a low score as "bad sleep"
  // — we describe direction-of-adaptation, not performance.
  const adaptLabelKey =
    adaptScore == null
      ? null
      : adaptScore >= 75
      ? 'profile.adapt_well'
      : adaptScore >= 50
      ? 'profile.adapt_steady'
      : adaptScore >= 25
      ? 'profile.adapt_rough'
      : 'profile.adapt_tough';
  const recentTally = recentJournal.reduce(
    (acc, d) => {
      if (d.rating === 'good') acc.good++;
      else if (d.rating === 'ok') acc.ok++;
      else if (d.rating === 'bad') acc.bad++;
      else acc.empty++;
      return acc;
    },
    { good: 0, ok: 0, bad: 0, empty: 0 },
  );

  // Display name preference:
  //   onboarding.displayName (set in S11) →
  //   real auth user_metadata.display_name →
  //   email local part →
  //   "Friend" generic placeholder (NOT mockUser.name — that leaks "Marina"
  //   on cold-start which felt like demo data on App Store Review)
  // Clamp to 24 chars so the SerifHero stays on ≤2 lines.
  const displayName = clampDisplayName(
    onboarding.displayName?.trim() ||
      (user?.user_metadata as { display_name?: string } | undefined)?.display_name ||
      user?.email?.split('@')[0] ||
      t('profile.fallback_name'),
  );

  // Profession label preference: pick from mockProfessions catalogue when
  // user picked one in S02, else fall back to mockUser.profession label.
  const professionLabel =
    mockProfessions.find((p) => p.id === onboarding.profession)?.title ??
    t('professions.other');

  // Subscription subtitle: prefer real DB row over mock. Anonymous users
  // are always on the free tier until signup (mockUser irrelevant).
  let subscriptionSubtitle: string;
  if (!user) {
    subscriptionSubtitle = t('profile.subscription.free');
  } else if (subscription?.status === 'trial' && subscription.trial_end) {
    subscriptionSubtitle = t('profile.subscription.trial_template', { remaining: formatTrialRemaining(subscription.trial_end) });
  } else if (subscription?.status === 'active') {
    subscriptionSubtitle =
      subscription.plan === 'premium_annual' ? t('profile.subscription.annual') : t('profile.subscription.monthly');
  } else if (subscription?.status === 'grace_period') {
    subscriptionSubtitle = t('profile.subscription.grace');
  } else if (subscription?.status === 'cancelled' || subscription?.status === 'expired') {
    subscriptionSubtitle = t('profile.subscription.lapsed');
  } else {
    subscriptionSubtitle = t('profile.subscription.free');
  }

  const accountRow = user
    ? {
        glyph: 'user' as const,
        label: t('profile.rows.account'),
        subtitle: user.email ?? t('profile.signed_in'),
        onPress: () => {
          showAppDialog({
            title: t('profile.signout.title'),
            message: t('profile.signout.body'),
            actions: [
              { label: t('profile.signout.cancel'), style: 'cancel' },
              {
                label: t('profile.signout.confirm'),
                style: 'destructive',
                onPress: async () => {
                  // R14-1: surface signOut errors (e.g. offline)
                  // instead of silently no-op'ing.
                  const res = await signOut();
                  if (res?.error) {
                    showAppDialog({
                      title: t('profile.signout.failed_title'),
                      message: t('profile.signout.failed_body'),
                      actions: [{ label: t('profile.signout.cancel'), style: 'cancel' }],
                    });
                  }
                },
              },
            ],
          });
        },
      }
    : {
        glyph: 'sparkle' as const,
        label: t('profile.rows.save_account'),
        subtitle: t('profile.rows.save_account_sub'),
        onPress: () => router.push('/auth/signup'),
      };

  const SETTINGS: {
    glyph: 'gear' | 'bell' | 'sparkle' | 'user';
    label: string;
    subtitle: string;
    onPress: (() => void) | undefined;
  }[] = [
    accountRow,
    {
      glyph: 'gear',
      label: t('profile.rows.sleep_prefs'),
      subtitle: t('profile.rows.sleep_prefs_sub'),
      onPress: () => router.push('/settings/sleep-preferences'),
    },
    {
      glyph: 'bell',
      label: t('profile.rows.notifications'),
      subtitle: t('profile.rows.notifications_sub'),
      onPress: () => router.push('/settings/notifications'),
    },
    {
      glyph: 'sparkle',
      label: t('profile.rows.subscription'),
      subtitle: subscriptionSubtitle,
      onPress: () => router.push('/settings/subscription'),
    },
    {
      glyph: 'user',
      label: t('profile.rows.about'),
      subtitle: t('profile.rows.about_sub'),
      onPress: () => router.push('/settings/about'),
    },
  ];
  return (
    <Screen orbs="subtle" variant="dim" scroll>
      <Eyebrow>{t('profile.eyebrow')}</Eyebrow>
      <Pressable
        onPress={pickAvatar}
        style={styles.avatarWrap}
        accessibilityRole="button"
        accessibilityLabel={t('profile.avatar.a11y')}
      >
        {onboarding.avatarUri ? (
          <Image source={{ uri: onboarding.avatarUri }} style={styles.avatarImg} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Glyph name="user" size={30} color="primary" />
          </View>
        )}
        <View style={styles.avatarEditBadge}>
          <Glyph name="plus" size={12} color="onPrimary" />
        </View>
      </Pressable>
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.huge }}>
        <SerifHero>{displayName}</SerifHero>
        <Text
          variant="titleLg"
          family="display"
          weight="light"
          color="inkSubtle"
          style={{ marginTop: spacing.xs }}
        >
          {professionLabel}
        </Text>
      </View>

      <Eyebrow>{t('streak.label_template', { n: streakValue })}</Eyebrow>
      <View style={styles.streakRow}>
        {Array.from({ length: STREAK_LENGTH }).map((_, i) => {
          // Right-most dot = today; earliest = STREAK_LENGTH days ago.
          // Filled when within current streak; outlined otherwise.
          const dayIndex = STREAK_LENGTH - 1 - i;
          const filled = dayIndex < streakValue;
          const isToday = i === STREAK_LENGTH - 1;
          // Subtle gradient on filled dots so they read as "history" not flat.
          const opacity = filled ? 0.5 + (i / STREAK_LENGTH) * 0.5 : 1;
          return (
            <View
              key={i}
              style={[
                styles.streakDot,
                filled
                  ? { backgroundColor: colors.primary, opacity }
                  : styles.streakDotEmpty,
                filled && isToday && styles.streakDotActive,
              ]}
            />
          );
        })}
      </View>

      {/* J1 + F11: 14-day heatmap is a tap-target → /history full view */}
      {hasJournalHistory && (
        <Pressable
          onPress={() => router.push('/history')}
          accessibilityRole="button"
          accessibilityLabel={t('profile.journal_heatmap_open_a11y')}
        >
          <View style={{ height: spacing.lg }} />
          <View style={styles.heatmapHeader}>
            <Eyebrow>{t('profile.journal_heatmap_label')}</Eyebrow>
            <Glyph name="chevronRight" size={16} color="inkMuted" />
          </View>
          <View style={styles.streakRow}>
            {recentJournal.map((d, i) => {
              const isToday = i === recentJournal.length - 1;
              const color =
                d.rating === 'good'
                  ? colors.primary
                  : d.rating === 'ok'
                  ? colors.sunriseDim
                  : d.rating === 'bad'
                  ? colors.duskDim
                  : null;
              return (
                <View
                  key={d.iso}
                  style={[
                    styles.streakDot,
                    color
                      ? { backgroundColor: color }
                      : styles.streakDotEmpty,
                    color && isToday && styles.streakDotActive,
                  ]}
                />
              );
            })}
          </View>
          <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.sm }}>
            {t('profile.journal_tally', {
              good: recentTally.good,
              ok: recentTally.ok,
              bad: recentTally.bad,
            })}
          </Text>
        </Pressable>
      )}

      <View style={{ height: spacing.huge }} />

      <View style={styles.statsRow}>
        <GlassCard variant="glass" padding="lg" style={styles.stat}>
          <Eyebrow size="md">{t('profile.stat_days')}</Eyebrow>
          <HeroNumber value={daysInApp} size="md" />
        </GlassCard>
        <View style={{ width: spacing.sm }} />
        <GlassCard variant="glass" padding="lg" style={styles.stat}>
          <Eyebrow size="md">{t('profile.stat_journal')}</Eyebrow>
          <HeroNumber value={journalDays} size="md" />
        </GlassCard>
        <View style={{ width: spacing.sm }} />
        <GlassCard variant="glass" padding="lg" style={styles.stat}>
          <Eyebrow size="md">{t('profile.stat_on_plan')}</Eyebrow>
          <HeroNumber value={adherencePct} size="md" unit="%" />
        </GlassCard>
      </View>

      {/* F2: empty-state hint when all stats are zero (brand-new user) */}
      {daysInApp === 0 && journalDays === 0 && (
        <Text
          variant="bodyMd"
          color="inkMuted"
          align="center"
          style={{ marginTop: spacing.md }}
        >
          {t('profile.stats_empty_hint')}
        </Text>
      )}

      {/* F9: Adapt Score — non-judgemental positive framing. Only render
          once user has ≥3 journal entries (else weeklyAdaptScore=null). */}
      {adaptScore != null && adaptLabelKey && (
        <Pressable
          onPress={() => router.push('/history')}
          accessibilityRole="button"
          accessibilityLabel={t('profile.adapt_open_a11y')}
          style={{ marginTop: spacing.huge }}
        >
          <GlassCard variant="paper" padding="xxl">
            <View style={styles.adaptRow}>
              <View style={styles.adaptScoreWrap}>
                <HeroNumber value={adaptScore} size="lg" />
              </View>
              <View style={{ flex: 1 }}>
                <Eyebrow>{t('profile.adapt_eyebrow')}</Eyebrow>
                <Text
                  variant="titleLg"
                  family="display"
                  weight="light"
                  color="ink"
                  style={{ marginTop: 2 }}
                >
                  {t(adaptLabelKey)}
                </Text>
                <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
                  {t('profile.adapt_sub')}
                </Text>
              </View>
              <Glyph name="chevronRight" size={18} color="inkMuted" />
            </View>
          </GlassCard>
        </Pressable>
      )}

      {/* F20-P1 / C5: tap-target to the deep Sleep Library */}
      <Pressable
        onPress={() => router.push('/library')}
        accessibilityRole="button"
        accessibilityLabel={t('profile.tips_a11y')}
        style={{ marginTop: spacing.lg }}
      >
        <GlassCard variant="paper" padding="xxl">
          <View style={styles.adaptRow}>
            <View style={[styles.adaptScoreWrap, { backgroundColor: colors.primaryContainer }]}>
              <Glyph name="book" size={26} color="primary" />
            </View>
            <View style={{ flex: 1 }}>
              <Eyebrow>{t('profile.tips_eyebrow')}</Eyebrow>
              <Text variant="titleLg" family="display" weight="light" color="ink" style={{ marginTop: 2 }}>
                {t('profile.tips_title')}
              </Text>
              <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
                {t('profile.tips_sub')}
              </Text>
            </View>
            <Glyph name="chevronRight" size={18} color="inkMuted" />
          </View>
        </GlassCard>
      </Pressable>

      <View style={{ height: spacing.huge }} />

      <Eyebrow>{t('profile.settings')}</Eyebrow>
      <View style={{ height: spacing.md }} />

      {SETTINGS.map((row) => (
        <Pressable
          key={row.label}
          onPress={row.onPress}
          disabled={!row.onPress}
          accessibilityRole="button"
          accessibilityLabel={row.label}
          style={{ marginBottom: spacing.sm }}
        >
          <GlassCard variant="whisper" padding="xl">
            <View style={styles.settingsRow}>
              <View style={styles.settingsIcon}>
                <Glyph name={row.glyph} size={20} color="primary" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="titleMd" family="display" weight="medium" color="ink">
                  {row.label}
                </Text>
                <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
                  {row.subtitle}
                </Text>
              </View>
              {row.onPress && <Glyph name="chevronRight" size={18} color="inkMuted" />}
            </View>
          </GlassCard>
        </Pressable>
      ))}

      {/* Hint when in demo mode (no Supabase keys) */}
      {!user && (
        <View style={{ marginTop: spacing.md }}>
          <Text variant="bodyMd" color="inkMuted" align="center">
            {t('profile.anonymous_hint')}
          </Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    width: 84,
    height: 84,
    marginTop: spacing.lg,
    borderRadius: radii.pill,
  },
  avatarImg: {
    width: 84,
    height: 84,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceLow,
  },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
  },
  avatarEditBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.canvas,
  },
  heatmapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: 6,
  },
  streakDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  streakDotEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.inkGhost,
  },
  streakDotActive: {
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  adaptRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adaptScoreWrap: {
    width: 88,
    marginRight: spacing.lg,
  },
  stat: {
    flex: 1,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
});
