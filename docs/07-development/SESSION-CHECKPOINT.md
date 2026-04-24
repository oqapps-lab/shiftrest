# Session checkpoint — 2026-04-22

Snapshot of where the autonomous Phase-A/B/C run stopped, so the next session can resume cleanly.

---

## Last known git HEAD

`b1adc14` on `main` (pushed to `origin/main`).

Full session log (most recent first):
```
b1adc14 feat(schedule): S31 Add shift modal + final session docs
d152d66 feat(onboarding): syncProfile() — Stage 6.5 hook for profiles upsert
32cd800 feat(settings): S52 Notifications + S53 Subscription + S54 About
ae17588 feat(settings): S51 Sleep preferences — compound editable form
94c8292 feat(onboarding): propagate displayName through app + Welcome skip-if-completed
3e2cb94 feat(onboarding): shared OnboardingProvider state with AsyncStorage persistence
ebe8f04 feat(auth): Stage 6 scaffold — login / signup / forgot + Supabase wiring
0112a85 chore: lint clean (0 errors, 0 warnings) + TEST-LOG update
5991334 refactor: Screen.keyboardAvoiding prop + all hero times derive from mockPlan
02e20a9 qa: 14 content/logic fixes from sim-verified QA pass
```

The later Stage-6 scaffold commits (`ebe8f04` → `b1adc14`) landed from a parallel session while Phase B tap-through was in progress; this session's uncommitted work was limited to the B2 funnel walk itself (no code changes owed).

## What's done

- **Phase A — polish** ✅ shipped in `5991334`
  - `components/ui/Screen.tsx` exposes `keyboardAvoiding` prop (behavior=`height`, because `padding` left the absolute floating footer stuck behind the keyboard).
  - `lib/derive.ts` grew `formatHour`, `formatHourRange`, `hoursBetween`.
  - Aha / Plan tab / Home EVENTS all read from `mockPlan` instead of repeating literals.

- **Phase B1 — lint** ✅ shipped in `0112a85`
  - 0 errors, 0 warnings via `npm run lint`.
  - 9 `react/no-unescaped-entities` errors fixed by wrapping apostrophe strings in `{"..."}`.
  - 9 unused-import / hook-dep warnings cleaned.

- **Phase C — Stage 6 auth & state scaffold** ✅ shipped across `ebe8f04` → `b1adc14`
  - `lib/supabase.ts` — graceful client (no-env ⇒ DEMO mode).
  - `lib/auth/store.tsx` — `<AuthProvider>` + `useAuth()`.
  - `lib/onboarding/store.tsx` — `<OnboardingProvider>` with AsyncStorage persistence + `syncProfile()`.
  - `app/auth/{login,signup,forgot}.tsx` — 3 auth screens.
  - `app/settings/{sleep-preferences,notifications,subscription,about}.tsx` — 4 settings detail screens.
  - `app/schedule/add-shift.tsx` — S31 modal (previously a no-op TODO on `(tabs)/schedule`'s CTA).
  - Every onboarding step migrated from local `useState` to `useOnboarding()` + `update()`, answers now persist across relaunch.

## What's NOT done (resume from here)

1. **Metro bundler blocker** — last known Metro crash was
   `SyntaxError: app/_layout.tsx: Expected corresponding JSX closing tag for <OnboardingProvider>. (53:8)`.
   The current file on disk (`app/_layout.tsx:33-59`) is **syntactically valid JSX** — `<AuthProvider>` wraps `<OnboardingProvider>` and both close correctly — so the error was from an earlier intermediate state. Verify by simply re-running `npx expo start` from the project root; if it still trips, open `app/_layout.tsx` and confirm the tag pairing before anything else.

2. **Phase B2 — full funnel tap-through** was interrupted at step 8 (melatonin). Smoke test remaining: melatonin → family → name (keyboard Continue lift works, confirmed) → SP2 → loading → aha → paywall → notifications → `(tabs)`. No bugs expected (every screen verified individually across Phase-1/Phase-2 earlier this session).

3. **Phase B3 — TEST-LOG.md** was updated by the parallel session (see `0112a85` and `b1adc14`). The current funnel-pass findings from this session have not been appended.

4. **Supabase provisioning** — the scaffold is env-driven (`.env.example` committed). To turn on real auth:
   - Create Supabase project.
   - Fill `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
   - Run the profile-table migration from `docs/05-database/AUTH.md` (if present) or `DATABASE-SCHEMA.md`.
   - Test `login` / `signup` end-to-end on the sim.

5. **Still owed per `b1adc14` commit message**
   - `expo-notifications` wiring (S16 + S52 only grant permission; nothing is actually scheduled).
   - OpenAI plan generator (Aha / Plan tab still consume `mockPlan`).
   - OAuth providers.
   - Email-confirmation deep-link callback.
   - Adapty subscription integration (Stage 7).

## Simulator / runtime state

- iPhone 17 (UDID `A20FE3AE-F8A9-4CE1-8834-98D7CD5A0270`) — **Shutdown**. Expo Go + ShiftRest bundle still installed (shutdown preserves installed-apps state). Last foreground screen before shutdown was S09 melatonin (step 8/10 of the funnel).
- Metro for shiftrest is **stopped** (port 8081 free). Other projects' Metros on 8082 (sugar-quit), 8083 (deskcare), 8087 (FixIt) were left untouched.
- No simulators other than A20FE3AE were touched this session.
- On resume: `xcrun simctl boot A20FE3AE-F8A9-4CE1-8834-98D7CD5A0270`, then `npx expo start` from project root, then `xcrun simctl openurl A20FE3AE-F8A9-4CE1-8834-98D7CD5A0270 "exp://127.0.0.1:8081"`.

## Known bug candidates still open (from QA deliverable)

Tracked as `Bxx` earlier in the session, all confirmed design-intent or already fixed:
- B12 frosted tab-bar content peek — intentional.
- B13 duplicate "MARINA, YOUR PLAN IS READY" eyebrow across Aha / Paywall — intentional per DESIGN-GUIDE §5.7.

Open follow-ups with no commit yet:
- **Short-screen empty space** on melatonin-off / family-off / current-shift-off states (~40-60% blank between form and Continue) — design-level call, not fixed.
- **Segmented-control unselected options** visually "float" without a container outline — discoverability concern.
- Calendar only renders April-sized (30 cells + 2 empty prefix = 32 total); will need 42-cell six-week grid when month changes.

## Resume command sheet

```bash
# 1. Restart Metro
cd /Users/evgenij/Desktop/work/APP_DEVELOPMENT/shiftrest
npx expo start --port 8081

# 2. Reopen on iPhone 17 (skip if already foreground)
xcrun simctl openurl A20FE3AE-F8A9-4CE1-8834-98D7CD5A0270 "exp://127.0.0.1:8081"

# 3. Validate
npx tsc --noEmit
npm run lint
```
