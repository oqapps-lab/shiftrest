# Stage 6 — remaining tasks

Sorted by ROI / unblock value. Last updated 2026-04-25 after the Stage-6
ui-qa pass on iPhone 17 (HEAD `46bd7a1`).

## 1. Supabase project + .env  *(highest ROI — unblocks 2/3/4)*

- [ ] Create Supabase project (or pick existing self-hosted instance —
      see § "Self-hosted check" below for the candidate server we already own).
- [ ] Apply schema from `docs/05-database/AUTH.md` (or
      `DATABASE-SCHEMA.md`) — the `profiles` table at minimum, plus the
      `shifts` table for S31.
- [ ] Fill `.env`:
  ```
  EXPO_PUBLIC_SUPABASE_URL=https://...
  EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  ```
- [ ] Sim-test the full auth flow end-to-end:
      Welcome → Save your account → Signup → confirm email → Login → /(tabs).
- [ ] Verify `syncProfile()` writes a row to `profiles` after onboarding
      completes (tap any answer in /settings/sleep-preferences and watch the
      DB row update in real time).

**Time**: 30–60 min once the project exists.

## 2. expo-notifications scheduling  *(S52 currently only persists preferences)*

- [ ] Wire `Notifications.requestPermissionsAsync()` in `app/settings/notifications.tsx`
      when master flips ON.
- [ ] On every `(state, mockPlan)` change: cancel previous identifiers + call
      `Notifications.scheduleNotificationAsync({ content, trigger })` for each
      enabled reminder (bed-time with `bedReminderLead`, caffeine cutoff,
      melatonin).
- [ ] Persist scheduled identifiers to AsyncStorage so they can be cancelled
      after a reload before re-scheduling.
- [ ] Edit `app.json` to add notification permissions / icon (already in scope
      per Expo SDK 55 defaults).

**Time**: ~1–1.5 hours.

## 3. OpenAI plan generator  *(Aha / Plan tab still consume mockPlan)*

- [ ] New Supabase Edge Function `plan-generator`:
      input = `OnboardingState` + current shift + date.
      output = `{ sleepStart, sleepEnd, caffeineCutoff, melatoninTime,
                  windDownStart, transitionSteps[] }`.
- [ ] Model: Claude Haiku 4.5 or GPT-5-mini (cheap + fast).
- [ ] Cache result in `plans` table keyed by user_id + date. Regenerate on
      quiz answer change OR shift switch.
- [ ] Replace `mockPlan` reads in:
      `app/onboarding/aha.tsx`, `app/(tabs)/index.tsx`,
      `app/(tabs)/plan.tsx`, `app/transition.tsx`.

**Time**: ~1 day (Edge Function + table + 4 screen wires).

## 4. OAuth (Apple / Google) + Email-confirm deep-link

- [ ] Add `signInWithOAuth({ provider: 'apple' | 'google' })` to
      `lib/auth/store.tsx`.
- [ ] Add Apple sign-in button to login + signup screens (Apple guideline:
      "Sign in with Apple" required if other OAuth offered).
- [ ] Register + handle `shiftrest://auth/callback` deep-link to read the
      access_token from Supabase magic-link emails.
- [ ] Configure provider redirect URLs in Supabase dashboard.

**Time**: 2–3 hours.

## 5. Stage 7 — Adapty (real subscriptions)

- [ ] Adapty SDK init in app root (already in `react-native-adapty` deps).
- [ ] Replace `mockUser.subscription` reads with Adapty profile checks.
- [ ] Hook the paywall CTA "Start 7-day trial" to Adapty's purchase flow.
- [ ] App Store Connect product setup (yearly $49.99 + monthly $5.99).

**Time**: ~1 day + App Store config (separate calendar item).

## Self-hosted check (parking note)

User asked to check `151.241.234.33` for an existing self-hosted Supabase
instance to potentially reuse. Result of that scan lands in this section
once verified.


---

## Stage 6.6 status (2026-05-20) — what's done since this TODO was written

All "Open TODOs before submission" closed:

- [x] `NSUserNotificationsUsageDescription` in app.json (was there from Stage 6).
- [x] `NSUserTrackingUsageDescription` added (ATT for AppsFlyer).
- [x] `eas init` done — `extra.eas.projectId` wired.
- [x] App created in ASC (ID `6766302800`).
- [x] Both IAPs created in ASC (Premium Monthly + Yearly via Adapty product mapping).
- [x] Apple Review demo-account seeded (per `project_supabase_creds.md` memory).
- [x] Screenshots uploaded × 11 locales (1320×2868 for APP_IPHONE_67 set type).
- [x] Age rating questionnaire submitted (12+, per memory).
- [x] App Pricing = Free (via `POST /v1/appPriceSchedules` 2026-05-20).
- [x] App Privacy questionnaire published (Tracking=Yes for AppsFlyer-related categories).
- [x] OAuth — Apple Sign-In wired in `lib/auth/store.tsx`.
- [x] Deep-link `shiftrest://auth/confirm` registered, handled by `app/auth/confirm.tsx`.
- [x] Adapty SDK init in `app/_layout.tsx` via `ensureAdaptyActivated()`.
- [x] Adapty paywall CTA wired to subscription state via `useSubscription()` hook.

## What's open NOW

- [ ] **Real-device QA on TestFlight build #21** — Apple Sign-In flow, Sandbox purchase, push delivery, ATT prompt.
- [ ] AppsFlyer `EXPO_PUBLIC_APPSFLYER_DEV_KEY` + `APP_ID` in `.env` (SDK bundled but bails at init currently).
- [ ] Edge cases QA: airplane mode, OpenAI timeout, cold start with empty AsyncStorage.
- [ ] Device matrix: iPhone SE, large screens, iOS 15.1, Dynamic Type, VoiceOver.
- [ ] Sentry crash reporting setup (optional but recommended).
- [ ] Final visual QA on `zh-Hant` (was deferred during i18n work).
- [ ] Vercel deploy for `oqapps/site/` — verify Privacy/Support/Marketing URLs resolve before public submission.
- [ ] Decision: when to do Submit For Review for public release. Currently `v1.0 state = PREPARE_FOR_SUBMISSION`; build #21 is in External TestFlight.

## Self-hosted Supabase check (parked from earlier)

Status unchanged — `151.241.234.33` scan not done. Project is on Supabase Cloud (ref `umjngckluosbmyjxgfjx` per `project_supabase_creds.md`). Self-hosted migration would be a separate post-launch initiative.
