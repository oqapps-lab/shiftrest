/**
 * App-events logger.
 *
 * Fire-and-forget writes to public.app_events. Never throws — analytics
 * failures must NEVER take down a user flow. RLS enforces user_id matches
 * the caller's JWT, so we just include `auth.users.id` and let the policy
 * do the check.
 *
 * Event types are free-form strings; document the canonical ones here:
 *   - 'signed_up'             — completed sign-up (password or apple)
 *   - 'signed_in'             — successful sign-in
 *   - 'signed_out'
 *   - 'plan_generated'        — AI returned a fresh sleep plan
 *   - 'plan_started'          — user committed to a transition plan
 *   - 'plan_step_completed'
 *   - 'notif_permission_granted'
 *   - 'notif_permission_denied'
 *   - 'notifs_scheduled'      — payload.count
 *
 * Add new types ad-hoc; the table doesn't care.
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase, isSupabaseConfigured } from './supabase';

const APP_VERSION = Constants.expoConfig?.version ?? '0.0.0';
const PLATFORM = Platform.OS;

export async function logEvent(
  eventType: string,
  payload: Record<string, unknown> = {},
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  // Capture user_id from current session — RLS will reject if it doesn't
  // match auth.uid(), so anonymous users get a silent no-op.
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  if (!userId) return;

  const row = {
    user_id: userId,
    event_type: eventType,
    payload: payload ?? {},
    client_platform: PLATFORM,
    client_app_version: APP_VERSION,
  };

  // Fire and forget. We don't await the response — UI must not block on
  // analytics.
  supabase.from('app_events').insert(row).then(({ error }) => {
    if (error && __DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[events] insert failed', error.message);
    }
  });
}
