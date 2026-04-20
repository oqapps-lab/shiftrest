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
4. Tap **Create my plan** → profession picker
5. Tap any card → **Continue** → loading (4 steps) → aha moment (with timeline ring)
6. Tap **Get the full plan** → paywall (modal)
7. Tap **Start 7-day trial** → replaces stack with the tab shell

---

## Navigation map (demo screens shipped)

| Route | File | Purpose |
|---|---|---|
| `/` | `app/index.tsx` | Welcome (S01) — entry for new users |
| `/onboarding/profession` | `app/onboarding/profession.tsx` | Profession picker (S02) |
| `/onboarding/loading` | `app/onboarding/loading.tsx` | Analysis animation (S13) |
| `/onboarding/aha` | `app/onboarding/aha.tsx` | Plan preview (S14) |
| `/paywall` | `app/paywall.tsx` | Primary paywall (S15), modal |
| `/(tabs)` | `app/(tabs)/_layout.tsx` | Tab shell with `FloatingTabBar` |
| `/(tabs)` | `app/(tabs)/index.tsx` | Home / Today (S20) |
| `/(tabs)/schedule` | `app/(tabs)/schedule.tsx` | Calendar (S30) |
| `/(tabs)/plan` | `app/(tabs)/plan.tsx` | Daily Sleep Plan (S40) |
| `/(tabs)/profile` | `app/(tabs)/profile.tsx` | Profile Overview (S50) |
| `/transition` | `app/transition.tsx` | Transition Plan (S43), modal |

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
