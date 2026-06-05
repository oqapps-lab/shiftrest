/**
 * S01 — Welcome. The entry point when app opens without a session.
 * Breathing orb + soft hero line + two CTAs.
 *
 * Redirect rule: if the user already completed onboarding in a previous
 * session (persisted via OnboardingProvider → AsyncStorage), skip Welcome
 * and land on /(tabs). Wait for hydration so we don't flash Welcome first.
 *
 * Cold-start race: on a fresh install with a restored Keychain session
 * (Supabase token survives app delete), AsyncStorage is empty and
 * `state.completed` is false until the reverse-sync useEffect inside
 * the onboarding store fetches `profiles.onboarding_completed` from
 * Supabase. Show a blank canvas while `reverseSyncing` is true to
 * avoid flashing Welcome at returning users.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import {
  Screen,
  BreathingOrb,
  SerifHero,
  Text,
  PillCTA,
  Eyebrow,
} from '../components/ui';
import { spacing } from '../constants/tokens';
import { useOnboarding } from '../lib/onboarding/store';
import { useAuth } from '../lib/auth/store';
import { t } from '../lib/i18n';

// R17/A3: whitelist mirrors app/onboarding/_layout.tsx <Stack.Screen> names.
// Keep in sync when adding/removing onboarding screens.
const KNOWN_ONBOARDING_ROUTES: ReadonlySet<string> = new Set([
  '/onboarding/profession',
  '/onboarding/schedule',
  '/onboarding/current-shift',
  '/onboarding/next-shift',
  '/onboarding/problem',
  '/onboarding/social-proof-1',
  '/onboarding/chronotype',
  '/onboarding/caffeine',
  '/onboarding/melatonin',
  '/onboarding/family',
  '/onboarding/name',
  '/onboarding/social-proof-2',
  '/onboarding/loading',
  '/onboarding/aha',
  '/onboarding/notifications',
]);

export default function Welcome() {
  const { state, hydrated, reverseSyncing } = useOnboarding();
  const { loading: authLoading, user } = useAuth();

  useEffect(() => {
    if (hydrated && state.completed) {
      router.replace('/(tabs)');
      return;
    }
    // R13-1: resume mid-onboarding after app kill / cold-launch.
    // If user has stepped into onboarding before (lastOnboardingRoute
    // set) and hasn't completed, send them back to where they left off
    // instead of restarting from S01.
    if (hydrated && !state.completed && state.lastOnboardingRoute) {
      // R17/A3: validate the stored route against the known onboarding
      // screen whitelist — a renamed/removed screen + stale AsyncStorage
      // would otherwise dead-route via expo-router.
      if (KNOWN_ONBOARDING_ROUTES.has(state.lastOnboardingRoute)) {
        router.replace(state.lastOnboardingRoute as never);
      }
    }
  }, [hydrated, state.completed, state.lastOnboardingRoute]);

  // Avoid flashing Welcome at returning users:
  // - while AsyncStorage hydration in flight (`!hydrated`)
  // - while auth session is being restored (`authLoading`)
  // - while reverse-sync fetches the server profile after a session restore
  //   on an empty AsyncStorage (`reverseSyncing` — typical post-reinstall path)
  // - once we know onboarding is completed (`state.completed`) — the redirect
  //   above will fire on the next tick
  const sessionRestoreInFlight = authLoading || (user && !state.completed && reverseSyncing);
  if (!hydrated || state.completed || sessionRestoreInFlight) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <Screen
      scroll={false}
      tabBarClearance={false}
      orbs="strong"
      floatingFooter={
        <>
          <PillCTA
            variant="primary"
            label={t('welcome.cta_primary')}
            onPress={() => router.push('/onboarding/profession')}
          />
          <View style={{ height: spacing.sm }} />
          <PillCTA
            variant="glass"
            size="md"
            label={t('welcome.cta_secondary')}
            onPress={() => router.push('/auth/login')}
          />
        </>
      }
    >
      <View style={styles.body}>
        <Eyebrow>{t('welcome.eyebrow')}</Eyebrow>

        <View style={styles.orbWrap}>
          <BreathingOrb size={280} pulse />
        </View>

        <View style={styles.copy}>
          <SerifHero align="center">{t('welcome.hero')}</SerifHero>
          <Text
            variant="bodyLg"
            color="inkSubtle"
            align="center"
            style={{ marginTop: spacing.md }}
          >
            {t('welcome.subhead')}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 24,
  },
  orbWrap: {
    marginTop: 60,
    marginBottom: 40,
  },
  copy: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
});
