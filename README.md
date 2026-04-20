# ShiftRest

> Personal sleep plan for shift workers — nurses, firefighters, factory operators.
> Not a sleep tracker. A **planner**: when to sleep, melatonin timing, caffeine cutoff, transition plans between rotating shifts.

**Stage**: Research → Design → early Dev scaffold
**Design mood**: Weightless Sanctuary — warm paper canvas, sage accent, whisper-light typography.

---

## Stack

- **Expo SDK 55** + **expo-router 6** (file-based routing, typed routes)
- **React Native 0.79** · React 19
- **react-native-reanimated 4** (animations) · **react-native-svg 15** (iconography + rings) · **expo-blur** (frosted glass)
- **TypeScript strict**
- **Supabase** (auth, DB, storage — Stage 6)
- **Adapty** (subscriptions — Stage 6)
- **OpenAI API** (personalised plans — Stage 6)
- Fonts via **@expo-google-fonts** — Plus Jakarta Sans · Manrope · JetBrains Mono · Fraunces Italic

---

## Directory tree

```
shiftrest/
├── app/                           expo-router screens
│   ├── _layout.tsx                root stack, fonts, splash
│   ├── index.tsx                  S01 Welcome
│   ├── onboarding/
│   │   ├── _layout.tsx
│   │   ├── profession.tsx         S02
│   │   ├── loading.tsx            S13
│   │   └── aha.tsx                S14
│   ├── (tabs)/
│   │   ├── _layout.tsx            custom FloatingTabBar
│   │   ├── index.tsx              S20 Home
│   │   ├── schedule.tsx           S30 Calendar
│   │   ├── plan.tsx               S40 Daily Sleep Plan
│   │   └── profile.tsx            S50 Profile
│   ├── paywall.tsx                S15 (modal)
│   └── transition.tsx             S43 (modal)
├── components/
│   └── ui/                        14 design-system primitives
│       ├── Screen.tsx
│       ├── AtmosphericBackground.tsx
│       ├── OrbField.tsx
│       ├── GlassCard.tsx
│       ├── PillCTA.tsx
│       ├── HeroNumber.tsx
│       ├── Eyebrow.tsx
│       ├── SerifHero.tsx
│       ├── BreathingOrb.tsx
│       ├── ProgressDots.tsx
│       ├── TimelineRing.tsx
│       ├── ShiftBar.tsx
│       ├── Glyph.tsx
│       ├── FloatingTabBar.tsx
│       ├── Text.tsx
│       └── index.ts               barrel export
├── constants/
│   └── tokens.ts                  single source of truth — colors, gradients, radii, spacing, fonts
├── hooks/
│   └── useAppFonts.ts
├── mock/
│   └── user.ts                    placeholder data for demo screens
├── docs/
│   ├── 01-research/ … 03-practices/  market research (Stage 1–3)
│   ├── 04-ux/                     SCREEN-MAP · USER-FLOWS · UX-SPEC · WIREFRAMES · FUNNEL
│   ├── 05-database/
│   ├── 06-design/
│   │   ├── DESIGN-GUIDE.md        authoritative design spec (500+ lines)
│   │   └── stitch-raw/            raw Stitch handoff (design theme + 8 screenshots)
│   ├── 07-development/
│   │   └── RUN-LOCAL.md           how to launch for design review
│   └── 08-deployment/
├── app.json
├── package.json
├── tsconfig.json
├── expo-env.d.ts                  at root (NEVER inside app/)
└── README.md
```

---

## Running locally

See **[docs/07-development/RUN-LOCAL.md](docs/07-development/RUN-LOCAL.md)**.

TL;DR:

```bash
npm install --legacy-peer-deps
npx expo install --fix
npx expo start --ios
```

---

## Design system

ShiftRest's UI is built from 14 primitives that compose every screen. Rules, token tables, and anti-patterns live in **[docs/06-design/DESIGN-GUIDE.md](docs/06-design/DESIGN-GUIDE.md)**.

Key principles:

1. **Single accent** — sage green (`#45645E`). Narrative accents (sunrise amber, dusk plum, coral) carry one semantic meaning each.
2. **Tonal surfaces, not lines** — no 1px borders. Depth via surface tiers + frosted glass + radial orbs.
3. **Whisper-light typography** — ExtraLight 200 / Light 300 defaults. Hero display numbers are the only loud element.
4. **Pill geometry** — full-radius CTAs, 36px card radius, no sharp corners.
5. **3-layer rule** — Background (absolute) → Content (scroll) → Floating UI (absolute).
6. **Haptic Inhale** — Medium impact on primary CTAs, Light on selections, `cubic-bezier(0.4, 0, 0.2, 1)` easing everywhere.

---

## Design handoff source

- **Stitch project**: `10724681838946440315` — "Breathing App Component Sheet"
- **8 curated screens** → translated to `DESIGN-GUIDE.md` + 14 primitives + 10 demo screens
- **Pipeline**: `~/.claude/skills/stitch-to-native-ui/SKILL.md` v2.1

---

## Project stage tracker

- [x] Stage 1 — Niche validation
- [x] Stage 2 — Product vision, features, personas
- [x] Stage 3 — Practices research (onboarding, paywall, retention benchmarks)
- [x] Stage 4 — UX (50 screens mapped, user flows, funnel)
- [ ] **Stage 5 — Design & scaffold** ← current (primitives + 10 demo screens shipped)
- [ ] Stage 6 — Full screen build (remaining 40 screens) + Supabase + OpenAI integration
- [ ] Stage 7 — Adapty paywall integration + QA
- [ ] Stage 8 — Deployment (App Store · Google Play)

---

## License

Private · © 2026 gazetastreet.
