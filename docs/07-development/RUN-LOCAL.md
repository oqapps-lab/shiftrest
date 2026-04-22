# RUN-LOCAL — ShiftRest

How to launch the Expo app locally for design review.

---

## Requirements

- **macOS** (recommended) for iOS Simulator, or a physical device running **Expo Go SDK 55**
- **Node.js 20 LTS** (Node 25 breaks `@expo/ngrok` — avoid)
- **npm 10+** (comes with Node 20)
- **Xcode 16+** with iOS 18 Simulator runtime (for native iOS build)
- **Expo Go** installed on the device or simulator

> On a Windows VM (Parallels guest) it's possible to run Metro on Windows and point Expo Go on the Mac host — see **§ Option B** below.

---

## Option A — single machine (Mac, simplest)

```bash
git clone https://github.com/oqapps-lab/shiftrest.git
cd shiftrest
npm install --legacy-peer-deps       # Reanimated v4 peer range needs this flag
npx expo install --fix               # Aligns RN/React versions to Expo SDK 55
npx expo start --ios
```

Expo starts Metro, opens Simulator, loads the app. Scan the QR from a device if you want to test on hardware.

## Option B — Metro on Windows VM, Simulator on Mac host

Useful when Claude is running in a Parallels guest but the simulator lives on the Mac host.

```bash
# On the Windows VM:
npm install --legacy-peer-deps
npx expo start --lan --port 8082
```

Metro auto-binds `0.0.0.0:8082`. Grab the LAN URL it prints (`exp://192.168.x.y:8082`).

```bash
# On the Mac (or from the VM targeting the Mac simulator):
xcrun simctl openurl <SIMULATOR_UDID> "exp://192.168.x.y:8082"
```

If the device shows an old cached bundle:
```bash
xcrun simctl terminate <UDID> host.exp.Exponent
# then re-open the URL
```

---

## First launch — expected behaviour

1. Splash screen on `#FCF9F6` cream
2. Fonts load (first launch: ~2 s as Google Fonts download)
3. **Welcome screen** (`app/index.tsx`) — breathing orb, "Rest catches up, gently."
4. Tap **Create my plan** → enters the 10-step onboarding quiz:
   1. profession → 2. schedule template → 3. current shift → 4. main problem
   → 5. social-proof-1 (93%) → 6. chronotype quiz → 7. caffeine →
   8. melatonin → 9. family → 10. name
5. After name: **social-proof-2** (filler) → **loading** (4-step analysis) → **aha** (plan preview with timeline ring)
6. Tap **Get the full plan** → paywall (modal, "7 days. Then you decide.")
7. Tap **Start 7-day trial** → **notifications** permission screen → tap any CTA → tab shell

---

## Navigation map (demo screens shipped)

| Route | File | Purpose |
|---|---|---|
| `/` | `app/index.tsx` | Welcome (S01) — entry for new users |
| `/onboarding/profession` | `app/onboarding/profession.tsx` | Profession picker (S02) — step 1 / 10 |
| `/onboarding/schedule` | `app/onboarding/schedule.tsx` | Schedule template (S03) — step 2 / 10 |
| `/onboarding/current-shift` | `app/onboarding/current-shift.tsx` | Current shift anchor (S04) — step 3 / 10 |
| `/onboarding/problem` | `app/onboarding/problem.tsx` | Main problem picker (S05) — step 4 / 10 |
| `/onboarding/social-proof-1` | `app/onboarding/social-proof-1.tsx` | 93% stat break (S06) — step 5 / 10 |
| `/onboarding/chronotype` | `app/onboarding/chronotype.tsx` | 3-question MEQ (S07) — step 6 / 10 |
| `/onboarding/caffeine` | `app/onboarding/caffeine.tsx` | Caffeine habits (S08) — step 7 / 10 |
| `/onboarding/melatonin` | `app/onboarding/melatonin.tsx` | Melatonin usage (S09) — step 8 / 10 |
| `/onboarding/family` | `app/onboarding/family.tsx` | Family commitments (S10) — step 9 / 10 |
| `/onboarding/name` | `app/onboarding/name.tsx` | Name input (S11) — step 10 / 10 |
| `/onboarding/social-proof-2` | `app/onboarding/social-proof-2.tsx` | Second social proof (S12) filler |
| `/onboarding/loading` | `app/onboarding/loading.tsx` | Analysis animation (S13) |
| `/onboarding/aha` | `app/onboarding/aha.tsx` | Plan preview (S14) |
| `/paywall` | `app/paywall.tsx` | Primary paywall (S15), modal |
| `/onboarding/notifications` | `app/onboarding/notifications.tsx` | Post-paywall permission ask (S16) |
| `/(tabs)` | `app/(tabs)/_layout.tsx` | Tab shell with `FloatingTabBar` |
| `/(tabs)` | `app/(tabs)/index.tsx` | Home / Today (S20) |
| `/(tabs)/schedule` | `app/(tabs)/schedule.tsx` | Calendar (S30) |
| `/(tabs)/plan` | `app/(tabs)/plan.tsx` | Daily Sleep Plan (S40) |
| `/(tabs)/profile` | `app/(tabs)/profile.tsx` | Profile Overview (S50) |
| `/transition` | `app/transition.tsx` | Transition Plan (S43), modal |
| `/auth/login` | `app/auth/login.tsx` | Sign in (S60) |
| `/auth/signup` | `app/auth/signup.tsx` | Create account (S61) |
| `/auth/forgot` | `app/auth/forgot.tsx` | Reset password (S62) |

Deep-linking: `exp://127.0.0.1:8081/--/<route>` jumps straight to any screen during review.

---

## Auth setup

The auth flow ships in scaffold form (UI complete, Supabase client wired, helpers ready). To turn it on against a real backend:

```bash
cp .env.example .env
# fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
```

Without `.env` the auth screens render in a clearly labelled **DEMO MODE** — UI is reviewable, but submit returns a friendly error rather than a network call. See `docs/05-database/AUTH.md` for the full Supabase project provisioning checklist.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `ERESOLVE` on install | reanimated v4 peer range | `npm install --legacy-peer-deps` (mandatory) |
| `Cannot find module 'react-native-worklets/plugin'` | peer not auto-installed | `npm i react-native-worklets --legacy-peer-deps` |
| `NativeMicrotasksCxx could not be found` | RN version drift from Expo SDK | `npx expo install --fix` + restart Metro |
| Fonts not loading (default System seen) | Google Fonts CDN blocked | Retry online; fonts cache after first load |
| BlurView invisible on Android | BlurView is iOS-only in practice | Fallback is built in — semi-opaque fill (see `GlassCard.tsx`) |
| Expo Go stuck on splash | Stale cached bundle | Terminate app and re-open Metro URL |
| "missing default export" warning in Metro | `expo-env.d.ts` placed inside `app/` | Keep at project root (already correct here) |
| Dynamic route warnings | `Stack.Screen name=` doesn't match folder | Use full path: `name="plan/[id]"` not `name="plan"` |

---

## What's NOT supported yet (scope of this push)

- **Auth flows** — login/signup screens aren't wired to Supabase; Welcome currently deep-links to `/(tabs)` only
- **Dark mode** — specced in DESIGN-GUIDE §11, deferred to v1.1
- **Real API** — all data comes from `mock/user.ts`; Stage 6 will wire Supabase + OpenAI
- **Push notifications** — placeholder screen (S16) not built yet
- **Full 50-screen coverage** — we shipped 10 screens demonstrating the design language; rest will fill in during Stage 5 screen-map-first build

---

## Design references

- **DESIGN-GUIDE** → [docs/06-design/DESIGN-GUIDE.md](../06-design/DESIGN-GUIDE.md)
- **Raw Stitch screenshots** → [docs/06-design/stitch-raw/screenshots/](../06-design/stitch-raw/screenshots/)
- **Design theme JSON** → [docs/06-design/stitch-raw/design-theme.json](../06-design/stitch-raw/design-theme.json)
- **Pipeline skill** → `~/.claude/skills/stitch-to-native-ui/SKILL.md` v2.1

---

## Useful commands during review

```bash
# Re-run type check
npx tsc --noEmit

# Lint
npm run lint

# Clear Metro cache if things feel stale
npx expo start -c

# Production bundle size check
npx expo export
```
