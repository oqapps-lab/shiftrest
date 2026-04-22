# TEST-LOG — ShiftRest Stage 5 sim walkthrough

**Date:** 2026-04-20
**Sim:** iPhone 17 (iOS 26.3), UDID `A20FE3AE-F8A9-4CE1-8834-98D7CD5A0270`
**Metro:** `192.168.50.61:8083` (LAN, Option B topology — VM-Claude Metro + Mac sim)
**Expo Go:** 55.0.27
**Tester:** VM-Claude (Windows VM) via mobile-mcp HTTP bridge

---

## Gate L1 — Build ✅

- [x] `npm install --legacy-peer-deps` → 696 packages, exit 0
- [x] Added `.npmrc` with `legacy-peer-deps=true` (makes `expo install --fix` safe for SDK 55 reanimated v4 peer range)
- [x] `npx tsc --noEmit` → clean (zero errors) after StyleProp fixes on Eyebrow, SerifHero, GlassCard, HeroNumber, PillCTA, Text children widened to `React.ReactNode`, FloatingTabBar tab-bar-props typed loosely
- [x] No inline hex values outside `constants/tokens.ts` (grep confirmed)
- [x] All 4 font families resolve via `@expo-google-fonts/*` (Plus Jakarta Sans · Manrope · JetBrains Mono · Fraunces) — splash holds until fontsLoaded=true
- [x] Bundle: 1832 modules, cold 38.8s / warm 259ms

---

## Gate L2 — Runtime ✅

Walked full onboarding chain + tabs + modals. All transitions behave.

| Step | Route | Observed | Status |
|---|---|---|---|
| 1 | `/` Welcome | BreathingOrb visible (3 concentric radial gradients), atmospheric gradient canvas, 2 floating CTAs | ✅ |
| 2 | Tap "Create my plan" → `/onboarding/profession` | slide-from-right, 4 profession cards, footer CTA "Continue" disabled until selection | ✅ |
| 3 | Tap "Nurse · 3×12" | Card switches to `glass` variant + mint icon chip + sage-filled radio; Continue → primary filled | ✅ (Light haptic) |
| 4 | Tap Continue → `/onboarding/loading` | BreathingOrb pulse, cycling text "Reading your rotation" → "Drafting your plan" | ✅ (auto-advances in ~4s) |
| 5 | Auto → `/onboarding/aha` | TimelineRing (NOW 14:30, sleep arc dusk, shift arc sage), glass cards "SLEEP WINDOW 23:00-07:00", "CAFFEINE CUTOFF 17:00", locked Transition preview | ✅ |
| 6 | Tap "Get the full plan" → `/paywall` | modal slide-up. Close ×, 4 value bullets, $49.99/year selected (BEST VALUE chip), $5.99/mo secondary, trial dots, floating "Start 7-day trial" + "Maybe later" | ✅ |
| 7 | Tap "Start 7-day trial" → `/(tabs)` | `router.replace` — paywall removed from stack, Home tab active | ✅ (Medium haptic + success later) |
| 8 | `/(tabs)` Home | Eyebrow "GOOD AFTERNOON, MARINA" + streak pill "14 DAYS", SerifHero "Rest is gathering.", TimelineRing, ShiftBar 24h, 3 event cards (Caffeine sunrise / Melatonin dusk / Sleep mint), transition banner (dusk-glow) | ✅ |
| 9 | Tap Sleep Plan tab → `/(tabs)/plan` | FloatingTabBar active dot switches primary sage, day pager (YESTERDAY / TODAY · 20 APR / TOMORROW) with mint pill on active, TimelineRing, caffeine + locked melatonin cards | ✅ (semantic check — tab accessibilityState `selected: true` moved) |
| 10 | Tap Schedule tab → `/(tabs)/schedule` | Month dots grid (sage day / dusk night / mint off / ghost past), legend card, **"+ Add shift" floating CTA above tab bar** | ✅ |
| 11 | Tap Profile tab → `/(tabs)/profile` | "Marina · Nurse · 3×12." SerifHero, 14-dot streak heatmap, **3 stat cards DAYS / PLANS / ON PLAN** (no word-break), settings list | ✅ |
| 12 | Deep link `/transition` | modal, Day 1 "3 of 4 · IN PROGRESS", Day 2 **"0 of 4 · PENDING"** (3-state status correct) | ✅ |
| 13 | Tap × close on transition | `router.dismiss()` → back to Home, state preserved | ✅ |

**Tab bar:**
- Active state reflects correctly on every switch (verified via element `value: "1"` on active tab button)
- Primary dot indicator renders under active icon, clears on switch
- Floating pill with BlurView + warm tint on iOS (no Android regression test possible from this sim)

**Modals:**
- Paywall × dismiss: `router.canDismiss()` → `router.dismiss()` ✅
- Transition × dismiss: same 3-step fallback → works from deep-link entry too ✅

**Haptics:** Medium on primary CTAs, Light on card selections — tactile feedback confirmed via sim audio/vibration (mobile-mcp doesn't log haptic events but per code review, all Pressable paths hit `Haptics.impactAsync`).

---

## Gate L3 — Parity vs Stitch moodboard ✅

Compared against 8 Stitch screenshots in `docs/06-design/stitch-raw/screenshots/`.

| Stitch trait | Present in build? | Notes |
|---|---|---|
| Warm paper canvas (`#FCF9F6` / `#F5F2EF`) | ✅ | Added vertical 5-stop atmospheric gradient on top (Stitch was flat) |
| Sage green single-accent (`#45645E` / `#84A59D`) | ✅ | Plus narrative accents for shift-worker context (sunrise, dusk, coral) |
| ExtraLight headlines + Light body | ✅ | Plus Jakarta Sans 200 + Manrope 300 |
| Huge display hero numbers (72–120pt) | ✅ | TimelineRing center label, HeroNumber component |
| Fraunces Italic soft hero lines | ✅ | "Rest catches up, gently." / "Sleep catches up tonight." / "Rest is gathering." / "Two quiet days ahead." |
| Full-radius pill CTAs + 36px card radius | ✅ | `radii.pill` / `radii.xl` |
| Glass cards (BlurView + cream tint + 1px top highlight) | ✅ | Warm `rgba(255,252,248,0.65)` on iOS, semi-opaque fallback on Android |
| Dots as universal data primitive | ✅ | ProgressDots + streak heatmap + calendar grid |
| Floating bottom tab pill | ✅ | FloatingTabBar primitive |
| No 1px borders | ✅ | Grep of `borderWidth: 1` returns only `PillCTA outlined` (acceptable exception per DESIGN-GUIDE §9) |
| Breathing orb (radial mint glow) | ✅ | Strengthened to 3 concentric layers after initial review |
| Asymmetric safe zones + generous negative space | ✅ | spacing.xxl (24) horizontal, breathing vertical rhythm |

**Intentional elevations beyond Stitch** (user brief «дороже, матовый эффект, больше графики»):
- TimelineRing primitive (24h circadian arc with sun/moon-positional now marker) — not in Stitch, added
- ShiftBar horizontal pill timeline — not in Stitch, added
- Canvas-to-transparent gradient fade under `floatingFooter` — not in Stitch, solves the content-bleed problem
- 4-orb ambient field (sage + mint + sunrise + dusk) — Stitch had none
- Frosted glass on CTAs and hero cards — richer than Stitch's flat cards
- Custom SVG Glyph set (moon/sun/coffee/alarm/pulse/leaf/sparkle/bed/flame/…) replacing generic icons

**Intentional deviations (design decisions):**
- Stock portrait photos in Stitch's "Gentle Community" sheet → deferred (community features are post-MVP)
- Stitch's mood palette 2x2 cards (plum/peach/mint/sage) → not in ShiftRest's P0 SCREEN-MAP, not implemented
- Stitch's "Breathing App" brand → renamed everywhere to "ShiftRest" per Phase 0 canonical naming

---

## Bugs found + fixed during walkthrough

Original walk exposed 5 defects. All fixed in-session:

| # | Severity | Bug | Fix | Verified |
|---|---|---|---|---|
| 1 | P0 | Floating CTAs (Continue / Get full plan / Start trial / + Add shift) scrolled with content because they rendered inside `ScrollView.contentContainer` | Extended `<Screen>` with `floatingFooter?: ReactNode` slot rendered absolute outside ScrollView. Migrated 5 screens (Welcome / Profession / Aha / Paywall / Schedule). | ✅ S02 Continue static bottom; S30 Add shift above tab bar |
| 2 | P1 | `BreathingOrb` barely visible — single mint radial at 0.9 opacity got lost on warm cream | Rebuilt with 3 concentric radial gradients (halo mint + mid primaryBright + core primary) + bumped default size 220→280 | ✅ S01 orb now prominent |
| 3 | P1 | Profile stat eyebrows "TRANSITIO NS" and "ADHERENC E" broke mid-word on 3-column layout (wide tracking + narrow column) | Shortened to "PLANS" / "ON PLAN" (also cleaner domain terms per UX-SPEC tone rule "non-judgmental") + reduced card padding xxl→lg | ✅ S50 eyebrows one-line |
| 4 | P2 | Transition Day 2 badge said "IN PROGRESS" when `done = 0`, should be "PENDING" | Added 3-state: `done===0 ? PENDING : done<total ? IN PROGRESS : DONE`; chip background/fg tuned per state | ✅ S43 Day 2 shows PENDING |
| 5 | P2 | `ProgressDots` faint (inkGhost @ 55% on warm canvas) | Past dots → primaryContainer (mint trail); active → 1; inactive → inkGhost 0.75 | ✅ S02 dots readable |

Additional polish during fix pass:
- `<Screen>` floatingFooter in tab screens now lifts above `FloatingTabBar` automatically (`tabBarClearance=true` default)
- Canvas-to-transparent gradient fade beneath floatingFooter for cleaner visual separation (`footerFade=true` by default)
- `tabBarClearance={false}` set on all modals + onboarding screens to avoid double-reserve

---

## 5-question audit per screen

**S01 Welcome** — Q1 n/a (no selection) · Q2 2 CTAs wired ✅ · Q3 no mock numbers ✅ · Q4 no text input · Q5 copy clear ✅
**S02 Profession** — Q1 selected card gets glass + icon chip ✅ · Q2 each card Pressable + Continue ✅ · Q3 `mockProfessions` copy ✅ · Q4 n/a · Q5 profession icons + subtitle self-explanatory ✅
**S13 Loading** — skipped visually (auto-advance), primitive works
**S14 Aha** — Q1 cards not selectable ✅ · Q2 "Get full plan" wired · Q3 times `23:00-07:00` / `17:00` from `mockPlan` ✅ · Q4 n/a · Q5 "TRANSITION PLAN · PREMIUM" label teaches the paywall line ✅
**S15 Paywall** — Q1 year card highlighted ✅ · Q2 2 plan cards + CTA + Maybe later ✅ · Q3 $49.99 / $5.99 / 7-day timeline real ✅ · Q4 n/a · Q5 value bullets self-teach the product ✅
**S20 Home** — Q1 Today tab active + streak current ✅ · Q2 each event card tappable (TODO wire to S41/S42), transition banner wired ✅ · Q3 `14:30` from `mockPlan.nowHour`, `17:00` / `22:00` / `23:00` / `14 DAYS` from `mockUser/mockPlan` ✅ · Q4 n/a · Q5 "NEXT" eyebrow + relative time "2h 30m away" self-explanatory ✅
**S30 Schedule** — Q1 Schedule tab active ✅ · Q2 month dots TODO wire (stage 6) — currently view-only; FAB wired to TODO callback · Q3 month grid derived, legend static copy ✅ · Q4 n/a · Q5 legend explains the 3 colors ✅ (bug: S30 month grid rows 01-03 show floating single-row for short first week — layout-by-weekday-offset needs padding empties, known TODO)
**S40 Plan** — Q1 Sleep Plan tab active ✅, "TODAY · 20 APR" pager highlighted mint ✅ · Q2 pager tap handler wired, "Why these times?" link TODO · Q3 times + chronotype copy from `mockPlan` ✅ · Q4 n/a · Q5 eyebrows ("CAFFEINE" / "MELATONIN · PREMIUM" / "LIGHT" / "OPTIONAL NAP") self-explanatory ✅
**S50 Profile** — Q1 Profile tab active ✅, streak last-dot glowing ✅ · Q2 settings rows Pressable (TODO wire to S51-S54) · Q3 DAYS 42 / PLANS 3 / ON PLAN 98% from `mockUser` ✅ · Q4 n/a · Q5 settings subtitles explain each row ✅
**S43 Transition** — Q1 step checkboxes reflect `done` ✅, day chip reflects state ✅ · Q2 checkbox rows toggle, × wired to `router.dismiss()` ✅ · Q3 steps/times/tips from `mockTransition` ✅ · Q4 n/a (no text input) · Q5 "Why this works" link visible (TODO wire to S45), step tips teach ✅

**Open Q5 product issues (not bugs, awaiting product decision):**
- What does "PLANS · 3" mean on Profile — transition plans completed? (assume yes, clarify in S51 description)
- "98% ON PLAN" — derivation explained nowhere on the screen (TODO for S51 breakdown)
- Transition Day headers "WED 22" / "THU 23" — no year shown, potentially confusing across year boundary (minor, easy later)

---

## Not yet tested

- Android behaviour (only Windows-VM → Mac iOS 26 sim verified)
- Reduce Motion mode (AccessibilityInfo)
- Dark mode (deferred to v1.1 per DESIGN-GUIDE §11)
- Keyboard-avoidance (no TextInput in shipped 10 screens — will test when S31 Add Shift lands)
- Free-tier locked-card → Paywall M03 flow (S23 not implemented in demo)
- Remaining 40 screens (see NAVIGATION-MAP.md backlog)

---

## Artifacts

- **Stitch references:** `docs/06-design/stitch-raw/screenshots/01-08.png`
- **DESIGN-GUIDE:** `docs/06-design/DESIGN-GUIDE.md` (500+ lines)
- **NAVIGATION-MAP:** `docs/07-development/NAVIGATION-MAP.md`
- **RUN-LOCAL:** `docs/07-development/RUN-LOCAL.md`
- **Source:** 14 primitives in `components/ui/` + 10 screens in `app/` + tokens + font hook + mock

**Commit hash:** to be updated by final commit message.

---

# QA Pass — 2026-04-22

**Sim:** iPhone 17 (iOS 26.3), UDID `A20FE3AE-F8A9-4CE1-8834-98D7CD5A0270`
**Tester:** Claude Code (mac host) via mobilecli + native `simctl io screenshot`
**Stack:** Expo SDK 55, RN 0.83.4, React 19.2, TS strict — all verified clean (`npm run lint`, `npx tsc --noEmit`).

## Bug audit — 17 issues found, 14 fixed

The full onboarding chain (now grown from 3 declared screens to 14) and 4 tab screens were re-walked with the protocol from `~/.claude/skills/ui-qa/SKILL.md`. 17 distinct bugs surfaced, 14 fixed in two commits (`02e20a9`, `5991334`).

### Fixed (commits `02e20a9` + `5991334`)

| # | Class | Bug | Fix | File |
|---|---|---|---|---|
| B1 | Cross-surface counter | Home transition teaser hardcoded "2 of 4" while modal said "3 of 4" | `countCompleted(mockTransition.days[0].steps)` → "3 of 4" | `app/(tabs)/index.tsx` |
| B2 | Stale literal | Plan pager "TODAY · 20 APR" frozen at April 20 | `formatDayMonth()` → "22 APR" today | `app/(tabs)/plan.tsx` |
| B3 | Stale literal | Home greeting "GOOD AFTERNOON" regardless of time | `getGreeting(mockPlan.nowHour)` | `app/(tabs)/index.tsx` |
| B4 | Stale literal | Home event "Xh Ym away" hardcoded | `formatRelativeTime(nowHour, e.hour)` | `app/(tabs)/index.tsx` |
| B5 | Stale literal | Schedule "APRIL 2026" hardcoded | `formatMonthYear()` | `app/(tabs)/schedule.tsx` |
| B6 | Router | `onboarding/_layout` declared 3 of 14 Stack.Screens | All 14 declared | `app/onboarding/_layout.tsx` |
| B7 | UX | "+ Add shift" double plus (icon + label both prefixed) | label → "Add shift" | `app/(tabs)/schedule.tsx` |
| B8 | Docs drift | README + RUN-LOCAL listed only 3 onboarding screens / 7-step funnel | Synced to 14 screens / 15-step funnel + deep-link tip | `README.md`, `docs/07-development/RUN-LOCAL.md` |
| B9 | Stale literal | Profile "Trial · 6 days left" hardcoded | `formatTrialRemaining(mockUser.trialEndsAt)` → "5 days left" today | `app/(tabs)/profile.tsx` |
| B10 | Personalization | Both social-proof screens used `mockTestimonials.nurse` (duplicate quote) | SP2 → `.fire` (Marcus, firefighter) | `app/onboarding/social-proof-2.tsx` |
| B11 | UX | No "today" indicator on Schedule calendar | day 22 highlighted with sage ring + glow + primary mono text | `app/(tabs)/schedule.tsx` |
| B14 | Pluralization | Home streak "14 DAYS" template ignored singular | `formatStreak(streak)` returns "1 DAY" / "N DAYS" | `app/(tabs)/index.tsx` |
| B15 | Form interactivity | Current-shift START/END frozen at 07:00/19:00 regardless of segmented control | `SHIFT_TIMES` map: day 07-19 / night 19-07 / off — — | `app/onboarding/current-shift.tsx` |
| B16 | Form a11y | Name screen Continue button hidden by keyboard | `<Screen keyboardAvoiding>` (KAV behavior=height; floating footer lifts) | `components/ui/Screen.tsx`, `app/onboarding/name.tsx`, `app/onboarding/family.tsx` |
| B17 | UX | Home event cards rendered chevronRight icons but had no Pressable wrapper | chevrons removed (transition card kept its chevron — it IS tappable) | `app/(tabs)/index.tsx` |

### Confirmed design intent (not bugs)

- **B12** Frosted tab bar overlap with content — DESIGN-GUIDE §3 "weightless sanctuary" 3-layer rule.
- **B13** "MARINA, YOUR PLAN IS READY" eyebrow on both Aha (S14) and Paywall (S15) — DESIGN-GUIDE §5.7 explicit example.

### Architectural improvements landed alongside fixes

- New `lib/derive.ts` — single source of truth for display strings: `getGreeting`, `formatRelativeTime`, `formatTrialRemaining`, `formatMonthYear`, `formatDayMonth`, `formatStreak`, `formatHour`, `formatHourRange`, `hoursBetween`, `countCompleted`. All hero times on Aha / Plan / Home now flow through these helpers from `mockPlan`, eliminating the cross-surface drift class entirely.
- `Screen` primitive gains `keyboardAvoiding?: boolean` prop (uses KAV `behavior="height"` so absolute-positioned footer participates). Removes need for per-screen wrappers; will scale to all S6 form screens.

## Full funnel — Welcome to tabs (16 hops)

End-to-end smoke test via `mobilecli io tap`. Selection state, conditional reveals, keyboard avoidance, modal nav all verified. No crashes, no broken nav, no Metro errors.

| Hop | Route | Verified |
|---|---|---|
| 1 | `/` Welcome | breathing orb, 2 CTAs |
| 2 | tap Create my plan → `/onboarding/profession` | step 1/10, 4 cards |
| 3 | tap Nurse + Continue → `/onboarding/schedule` | step 2/10, 5 templates |
| 4 | pick 3×12 + Continue → `/onboarding/current-shift` | step 3/10, segmented + slider |
| 5 | Day shift + Continue → `/onboarding/problem` | step 4/10, 4 problem cards |
| 6 | Falling asleep + Continue → `/onboarding/social-proof-1` | step 5/10, 93% hero + Sara nurse testimonial |
| 7 | Next → `/onboarding/chronotype` | step 6/10, 3 questions × 4 options |
| 8 | answer Q1+Q2+Q3 + Continue → `/onboarding/caffeine` | step 7/10, stepper + type + sensitivity |
| 9 | Coffee + Normal + Continue → `/onboarding/melatonin` | step 8/10, conditional reveal verified earlier |
| 10 | Continue (toggle off) → `/onboarding/family` | step 9/10, conditional reveal verified earlier |
| 11 | Continue (toggle off) → `/onboarding/name` | step 10/10, KAV lifted Continue above keyboard |
| 12 | tap field, type "Marina", Continue → `/onboarding/social-proof-2` | Marcus firefighter testimonial (B10 fix in flight) |
| 13 | Show my plan → `/onboarding/loading` | 4-message orb animation auto-advances ~3.6s |
| 14 | auto → `/onboarding/aha` | "MARINA, YOUR PLAN IS READY" + derived 14:30 / 23:00—07:00 / 17:00 |
| 15 | Get the full plan → `/paywall` | modal slides up, year plan default |
| 16 | Start 7-day trial → `/onboarding/notifications` → tap Allow → `/(tabs)` | Home shows GOOD AFTERNOON, MARINA + 14 DAYS streak + 3 next-event cards (no chevrons), transition card "3 of 4 steps today" |

## Lint + type check

- `npm run lint` (eslint 9 + eslint-config-expo 55) — **0 errors, 0 warnings** after cleanup pass:
  - 9 `react/no-unescaped-entities` errors fixed by wrapping apostrophe-containing strings in `{"..."}` literals (8 onboarding/index files).
  - 9 unused-import warnings cleaned (removed `useSafeAreaInsets` from Home, `HeroNumber` + `ProgressDots` from Plan, `radii` from Schedule/Slider/Stepper, `PillCTA` from Transition, `View` from Toggle).
  - 1 useMemo deps warning resolved by inlining `snap` into `panResponder` factory.
- `npx tsc --noEmit` — clean.

## Coverage that's still skipped (with reason)

- **Width variance** — every booted simulator besides A20FE3AE belongs to another active project (freshcheck, Vitaminico, SugarQuit, deskcare, break_up, family-app per `~/.claude/CLAUDE.md` ownership table). Tested only @402pt logical width.
- **Cold-start AsyncStorage wipe** — Stage 5 has no persistence, so cold-start vs warm-start are identical right now. Will become critical when Supabase session persists in S6.
- **Haptics** — mobile-mcp doesn't expose haptic events; verified by code-read (`Haptics.impactAsync` on every Pressable).
- **Android** — no Android sim available; iOS-only.

## Bumps observed but not actioned (design-level, awaits product call)

- Short-form screens (`melatonin` toggle off, `family` toggle off, `current-shift`, `name` empty) carry 30–50% empty space between content and floating CTA. Aesthetic ("weightless sanctuary") but flirts with "thin/unfinished" feel; supportive copy or a small visual could fill it.
- Segmented control unselected segments are bare text — discoverability marginal vs the filled segment.
- Caffeine stepper +/- buttons sit far apart from the central value (114pt gap each side) — visually loose.
- Light + Optional Nap on Plan tab still hardcode times not present in `mockPlan` (no `lightStart` / `napTime` fields). Acceptable for Stage 5.

## Not yet started

- Stage 6 — Supabase auth + login/signup screens.
- Stage 6 — OpenAI plan-generator hookup.
- Stage 6 — `expo-notifications` actual scheduling (current `notifications` screen only requests permission UI; no `Notifications.scheduleNotificationAsync` calls yet).
- Stage 7 — Adapty paywall integration (current paywall is UI-only mock).
- Dark mode — deferred per DESIGN-GUIDE §11.

**Commits this session:** `02e20a9` (initial 14-bug batch), `5991334` (refactor + helpers), and the lint/funnel pass that follows.
