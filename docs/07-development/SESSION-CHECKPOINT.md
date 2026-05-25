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


---

# Stage 6.6 — Internationalization + Deep Audit + Build #21 (2026-05-19 → 2026-05-20)

Snapshot after the multi-day i18n + audit session covering 41+ commits.

## Last known git HEAD

`205357d` on `main` — Jest infra + 42 unit tests + WCAG inkMuted fix.

## What's done (this stage)

### i18n localization

- Added 11 locale files (`en`, `de-DE`, `es-ES`, `fr-FR`, `it-IT`, `ja`, `ko`, `nl-NL`, `pt-BR`, `sv`, `zh-Hant`).
- 446 unique `t('namespace.key')` calls across `app/`, `components/`, `lib/`, `mock/` — each resolved in all 11 locales (cross-validated via `/tmp/validate_i18n.py`).
- Source files patched to route every user-facing string through `t()`:
  onboarding screens, auth (login/signup/forgot/confirm), settings (subscription/notifications/sleep-preferences/about), paywall, transition modal, add-shift, tabs (home/plan/schedule/profile), components/ui internals (Stepper a11y, FloatingTabBar labels).

### Bug fixes (20 distinct issues)

| # | Bug | Fix |
|---|---|---|
| 1 | `lib/notifications.ts` `const t = parseHourMinute(...)` shadowed i18n `t()` import → runtime `_t is not a function` | Renamed local to `tm` |
| 2 | `app/settings/sleep-preferences.tsx` had duplicate `import { t }` lines | Removed dup |
| 3 | `app/schedule/add-shift.tsx` broken relative `../lib/i18n` → `../../lib/i18n` | Fixed path |
| 4 | 8 macOS `._*` resource forks tracked in git → Metro SyntaxError | `git rm --cached` + `.gitignore` |
| 5 | `en.ts` lost keys to VS Code revert mid-session | `chflags uchg` lock + multi-round restoration |
| 6 | 5 module-level `const FOO = [..., t('key')]` patterns — eager-eval at module load, never re-translates on locale switch | Converted to lazy `getFoo()` functions: `SHIFT_OPTIONS`, `KIND_OPTIONS`, `VALUE_BULLETS`, `SEGMENT_OPTIONS`, `getValueBullets` |
| 7 | `formatHour(23.99999)` → `'23:60'` (Math.round overflow) | Refactored via `Math.round(h*60)` + modulo |
| 8 | `formatRelativeTime(10, 10.001)` → `'in 0m'` (sub-minute rounded down) | Added `if (totalMins === 0) return now` |
| 9 | Calendar `shiftMonth` race on Dec→Jan double-tap (closure-captured `viewMonth` stale) | Combined `{year, month}` into single `view` state |
| 10 | `home.tsx` parsed `mockPlan.caffeineCutoff` via `Number(split(':')[0])` — lost minutes | Added `parseFloatHour()` helper |
| 11 | `confirm.tsx` setTimeout(600ms) had no clearTimeout in unmount cleanup | Added `timerId` tracking |
| 12 | FR locale `'Aujourd'hui'` / `'Impossible d'enregistrer...'` broke parser (apostrophe in single-quoted string) | Switched to double quotes |
| 13 | SENSITIVITY hardcoded in sleep-preferences (i18n key existed but unused) | Routed via `t('sleep_prefs.sensitivity')` |
| 14 | Today/Tomorrow chip labels in add-shift hardcoded | Added 11-locale `add_shift.day_today`/`day_tomorrow` |
| 15 | Paywall `'Best value · save 35%'` hardcoded | Routed via `t('paywall.best_value_save', {percent:'35'})` |
| 16 | subscription.tsx ternary `'Start 7-day trial' / 'Resubscribe'` hardcoded | Routed via t() |
| 17 | `confirm.tsx` 4 hardcoded strings inside SerifHero conditional (`'Verifying...'`, `"You're in."`, `"Couldn't verify."`, `'Sign-in service is unavailable...'`) | Added `errors.*` keys, 11-locale translated |
| 18 | `transition.tsx` brittle `status === t('transition.status_done')` compare | Refactored to `statusKind` enum |
| 19 | `subscription.tsx` `mockUser.subscription === 'premium'` always-false (TS narrowed `'trial' as const`) | Widened type |
| 20 | `transition.tsx` useMemo missing dep `mockTransition.days` | Added |

### Backend / infra

- `package-lock.json` refreshed (expo-localization, i18n-js, rtl-detect, bignumber.js, lodash, make-plural deps).
- 12 tables × 12 RLS enabled + 35 policies. RLS coverage 100%.
- `plan-generator` Edge Function — auth model verified (service_role for DB writes after JWT validation).

### Build pipeline

| Build # | Status | Contains |
|---|---|---|
| **20** | TestFlight Internal | i18n base, before deep audit fixes |
| **21** | Beta App Review **APPROVED** → External TestFlight `IN_BETA_TESTING` | + 17 commits post-#20 with bug fixes + ATT setup |

### ASC state (as of 2026-05-20 17:50 UTC)

- **App Pricing**: Free (USD $0, USA base territory, equivalent prices auto-derive). Set via `POST /v1/appPriceSchedules`.
- **App Privacy**: Published. Tracking=Yes for Device ID / Purchases / Usage Data (AppsFlyer-related).
- **v1.0 state**: `PREPARE_FOR_SUBMISSION` (CANCELED public review submission, user wanted External TestFlight first).
- **External Reviewers** beta group exists, build #21 attached, ready to invite testers.

### ATT setup (build #21)

- `npx expo install expo-tracking-transparency` (~55.0.14).
- `app.json` `infoPlist.NSUserTrackingUsageDescription` added.
- `app/_layout.tsx` — `requestTrackingPermissionsAsync()` called BEFORE `ensureAppsFlyerInit()` so SDK can use IDFA when granted.
- `.env` still missing `EXPO_PUBLIC_APPSFLYER_DEV_KEY` / `APP_ID` → SDK bundled but bails at init (no real tracking until env filled).

### Testing infrastructure

- Jest@29 + jest-expo + @types/jest installed.
- `__tests__/derive.test.ts` — 42 unit tests covering all pure functions in `lib/derive.ts`, including the formatHour and formatRelativeTime regressions. Runs in 0.557s.
- `tsc --noEmit` → 0 errors.
- `eslint app components lib --ext .ts,.tsx` → 0 warnings.

### A11y

- WCAG AA contrast audit — found `inkMuted` (#7B7B76) → 4.06:1 on canvas, fails body-text 4.5:1 requirement.
- Fixed: `inkMuted` → `#6B6B65` (5.11:1 canvas, 4.62 surface, 4.38 surfaceHigh).

## What's NOT done (next session)

- Real-device testing on physical iPhone (TestFlight build #21).
- Apple Sign-In flow on real device.
- Subscription purchase flow in Sandbox.
- Push notification delivery verification.
- Edge cases (airplane mode, OpenAI timeout, etc.).
- Device matrix (iPhone SE, large screens, iOS 15.1 minimum, Dark Mode, Dynamic Type, VoiceOver).
- Performance baseline (cold start time, memory, FPS).
- Sentry crash reporting setup.
- AppsFlyer ENV keys (when ready for attribution).
- Final visual QA on `zh-Hant` (was deferred earlier).
- Decision: Submit For Review (public) — currently CANCELED at user request.

## Memory

Project memory updated under `~/.claude/projects/.../memory/`:
- `project_submission_ready.md` — v1.0 metadata state
- `project_v10_attached_to_build20.md` — outdated, now build #21 attached
- `project_dist_cert_recovery_needed.md` — Codemagic plan unused (EAS local worked)
- 2 feedback memories added (sub-agent verification + import shadowing)
