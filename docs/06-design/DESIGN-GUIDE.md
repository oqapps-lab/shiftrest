# ShiftRest — DESIGN-GUIDE

> **Source**: Stitch project `10724681838946440315` ("Breathing App Component Sheet"), 8 curated screens, fetched 2026-04-20.
> **Canonical product name in UI copy:** **ShiftRest** (not "Zen Editorial", not "Breathing App" — those are Stitch's moodboard titles).
> **Pipeline:** `~/.claude/skills/stitch-to-native-ui/SKILL.md`

---

## 0. Visual summary (mood one-pager)

> **Weightless Sanctuary.** Warm paper-white canvas (`#FCF9F6` / `#F5F2EF`) that reads like oat-milk on handmade paper — never sterile white. Deep sage green (`#45645E` / `#84A59D`) is the single primary accent; everything else is tonal warm-greys from `#B3B2AD` down to `#32332F`. Typography is whisper-light Plus Jakarta Sans (200 weight with +0.05–0.1rem tracking for headers) and Manrope Light 300 for body — CONTRASTED only by huge 72–120pt display numbers (`14 DAYS`, `4:32`, `98%`) acting as meditative anchors. All containers are full-radius pills or organic 3rem rounded rectangles; **no sharp corners, no 1px borders, no shadows.** Depth is created by tonal surface shifts (`#FFFFFF` → `#F6F3EF` → `#F0EEE9` → `#EAE8E3`), breathing radial orbs, and frosted-glass BlurView cards. Dots are the universal data primitive — progress dots, activity heatmaps, correlation ticks, mood toggles — always sage-tinted at 20–100% opacity. Bottom navigation is a floating pill with 4 icons + center CTA. The overall feel: *Kinfolk magazine about slow living, but for nurses after a 12-hour night shift*.
>
> **What we accept from Stitch:** warm paper canvas, sage-green mono-accent, whisper-light typography, hero display numbers, pill geometry, breathing orbs, dots-as-universal-data, floating tab pill, asymmetric spacing.
>
> **What we throw away from Stitch:** flat (ungradient) canvas, placeholder stock portraits in community sheet, the generic "Zen Editorial" header label (→ becomes "ShiftRest"), auto-generated iconography (→ hand-built SVG set).
>
> **What we add (the "better than Stitch" layer, per user brief — «дороже, интереснее, больше градиентов, матовый эффект, больше графических элементов»):**
> 1. Multi-stop vertical atmospheric gradient on the canvas (cream → peach → mint → cream) instead of flat cream
> 2. Radial orb field (4 orbs: sage, mint, sunrise, dusk) behind content for ambient depth
> 3. Frosted `BlurView` glass cards with warm-tinted highlights (iOS; warm semi-opaque fallback on Android)
> 4. Shift-worker-specific accents integrated into the Zen palette: sunrise amber, dusk plum, gentle coral (never red)
> 5. Custom SVG glyph set (moon, sun, coffee, alarm, pulse, leaf, sparkle) replacing generic Material icons
> 6. 24h circadian ring + horizontal shift-bar timeline primitives that don't exist in Stitch

---

## 1. TL;DR — principles

1. **Single accent rule.** Sage green (`colors.primary`) is the only chromatic voice. Sunrise amber, dusk plum, coral are *narrative accents* — used exactly once per screen for a specific meaning (morning light / melatonin window / gentle caution). Never decorative.
2. **Tonal surfaces, not lines.** No `borderWidth: 1` anywhere. Surfaces separate by filling tonal tiers (5 tiers from `surfaceLowest` to `surfaceHighest`) or by drifting into negative space.
3. **Weightless typography.** Headings Plus Jakarta Sans 200 with wide tracking. Body Manrope 300. The only "loud" type is the hero display number (72–120pt, ExtraLight 200, bold only when the number is the *entire message* of the screen like a timer).
4. **Pill geometry everywhere.** `radii.pill` (full) for CTAs and tags; `radii.xl` (36) for cards; `radii.lg` (28) for elevated surfaces. No `borderRadius: 8`.
5. **3-layer rule.** Background (absolute) → Content (scroll) → Floating UI (absolute). Background NEVER lives inside a ScrollView.
6. **Frosted glass for hero cards.** `BlurView` + warm-cream tint + hair-thin top-edge highlight. Not raw fills.
7. **Haptic Inhale.** Every primary interaction fires `Haptics.impactAsync(Medium)` + a soft color bloom. Every selection fires `Light`. Slow cubic-bezier(0.4, 0, 0.2, 1) on all transitions.
8. **Dots + rings, not bars.** Progress = dots row. Streaks = dots heatmap. Correlation = dot scatter. 24h day = arc ring. Shift = horizontal pill band. Bars are a last resort.

---

## 2. Colors

### 2.1 Canvas & surfaces (warm paper tiers)

| Token | Hex | Use |
|---|---|---|
| `canvas` | `#FCF9F6` | Default screen background (base sheet) |
| `canvasDim` | `#F5F2EF` | Secondary screens (profile, settings) |
| `surfaceLowest` | `#FFFFFF` | Only for elevated glass card inner tint |
| `surfaceLow` | `#F6F3EF` | Cards that group text |
| `surface` | `#F0EEE9` | Standard cards |
| `surfaceHigh` | `#EAE8E3` | Focal cards, primary CTA background in "calm" mode |
| `surfaceHighest` | `#E4E3DD` | Most prominent static container; pressed state of `surfaceHigh` |
| `surfaceDim` | `#DBDAD4` | Rare — overflow chrome, skeletons |

### 2.2 Sage (the single primary accent)

| Token | Hex | Use |
|---|---|---|
| `primary` | `#45645E` | Filled CTA, active tab icon, ring progress fill, hero dot |
| `primaryDim` | `#395852` | CTA gradient bottom stop, pressed state |
| `primaryBright` | `#84A59D` | Highlighted sage (for gradient middle stops, chips) |
| `primaryContainer` | `#C7EAE1` | Mint card fill, chip fill, "breath" radial glow |
| `primaryContainerDim` | `#B9DCD3` | Pressed state of `primaryContainer` |
| `onPrimary` | `#DDFFF6` | Text on sage-filled surfaces (warm off-mint, never pure white) |
| `onPrimaryContainer` | `#385851` | Text on mint chip |

### 2.3 Narrative accents (shift-worker palette)

Used intentionally, never decoratively. Each has ONE semantic meaning.

| Token | Hex | Meaning |
|---|---|---|
| `sunrise` | `#F4B886` | Morning light, caffeine-window OPEN, "wake" markers |
| `sunriseDim` | `#E89A5E` | Pressed sunrise, gradient bottom |
| `sunriseGlow` | `#FAD9BB` | Ambient sunrise orb fill |
| `dusk` | `#9B7A9A` | Melatonin window, wind-down, evening |
| `duskDim` | `#7E5D7D` | Pressed dusk |
| `duskGlow` | `#D6C4D5` | Ambient dusk orb fill |
| `coral` | `#E8A09B` | Gentle caution (sleep debt, caffeine cutoff past) — **never red** |
| `coralDim` | `#CF7F7A` | Pressed coral |

### 2.4 Text

| Token | Hex | Use |
|---|---|---|
| `ink` | `#32332F` | Default text — used in place of `#000` |
| `inkSubtle` | `#5F5F5B` | Secondary text, body |
| `inkMuted` | `#7B7B76` | Tertiary text, captions, labels |
| `inkGhost` | `#B3B2AD` | Placeholder, disabled, deep secondary |

### 2.5 Gradients (named by mood, not location)

```
atmosphereWarm           vertical 5-stop canvas bloom
  0%    #FCF9F6          — top (oat cream)
  30%   #F9F3ED          — upper mid (peach-tinted cream)
  55%   #F3EFE7          — center (neutral)
  80%   #EEF3EE          — lower mid (mint-tinted)
  100%  #F5F2EF          — bottom (return to cream)
  angle: 180deg (top → bottom)

breathOrb                radial, for <BreathingOrb/>
  0%    rgba(199,234,225,0.90)   — inner mint core
  45%   rgba(199,234,225,0.45)
  70%   rgba(199,234,225,0.18)
  100%  rgba(199,234,225,0.00)   — fade to nothing

orbSage                  radial orb, 0.35 opacity
orbMint                  radial orb, 0.45 opacity
orbSunrise               radial orb, 0.32 opacity
orbDusk                  radial orb, 0.28 opacity

ctaPrimary               linear vertical, for <PillCTA variant="primary"/>
  0%    #547972          — slightly brighter sage
  55%   #45645E          — primary
  100%  #395852          — primaryDim

ctaSunrise               (for wake/morning CTAs)
  0%    #F8CDA6
  100%  #E89A5E

ctaDusk                  (for melatonin/wind-down CTAs)
  0%    #B091AE
  100%  #7E5D7D

sleepArc                 (for TimelineRing — night hours)
  0%    #6E5D84
  100%  #9B7A9A

wakeArc                  (for TimelineRing — day hours)
  0%    #F8CDA6
  100%  #F4B886

glassHighlight           top-edge inner highlight, 1px
  0%    rgba(255,255,255,0.42)
  100%  rgba(255,255,255,0.00)
```

All gradients exported from `constants/tokens.ts` as `readonly [string, string, ...string[]]` tuples (RN LinearGradient typing demands).

---

## 3. Typography

### 3.1 Families

| Token | Family | Weights | Role |
|---|---|---|---|
| `fonts.display` | Plus Jakarta Sans | 200, 300, 500 | Headlines, hero numbers |
| `fonts.body` | Manrope | 300, 400, 500 | Body, labels |
| `fonts.mono` | JetBrains Mono | 400, 500 | Timestamps, codes, coordinates |
| `fonts.serif` | Fraunces Italic | 300 italic | Rare soft hero moments (≤5 words, ≤1 per screen) |

Loaded via `@expo-google-fonts/plus-jakarta-sans`, `@expo-google-fonts/manrope`, `@expo-google-fonts/jetbrains-mono`, `@expo-google-fonts/fraunces`. Hook: `hooks/useAppFonts.ts`.

### 3.2 Scale & tracking

| Token | Size | Line height | Weight | Tracking | Usage |
|---|---|---|---|---|---|
| `displayXxl` | 120 | 128 | 200 | −0.5 | Single-number hero screen (timer, achievement) |
| `displayXl` | 88 | 96 | 200 | −0.5 | Hero number on a data screen (HR, streak) |
| `displayLg` | 64 | 72 | 200 | 0 | Section hero number |
| `displayMd` | 48 | 56 | 300 | 0 | Tertiary hero |
| `headlineLg` | 32 | 40 | 300 | +0.5 | Screen title |
| `headlineMd` | 24 | 32 | 300 | +0.4 | Card title |
| `titleLg` | 20 | 28 | 500 | +0.2 | Emphasis in body |
| `titleMd` | 17 | 24 | 500 | +0.1 | Button labels |
| `bodyLg` | 16 | 24 | 300 | +0.1 | Primary body |
| `bodyMd` | 14 | 22 | 300 | +0.1 | Secondary body |
| `labelLg` | 13 | 18 | 500 | +1.2 uppercase | Eyebrows, chips |
| `labelMd` | 11 | 16 | 500 | +1.6 uppercase | Micro-labels, timestamps |
| `serifHero` | 28 | 36 | 300 italic | +0.1 | Soft hero line |
| `mono` | 12 | 16 | 500 | +0.4 | Coordinates, codes |

### 3.3 Rules

- Headings are **ExtraLight 200 or Light 300** by default. Never Bold on a heading.
- Display numbers are ExtraLight 200 — weight lives in *size*, not *boldness*. The only exception is a timer/counter that IS the entire screen (then 300 with wider tracking).
- `labelLg` / `labelMd` always uppercase + wide tracking (+1.2 to +1.6).
- Fraunces Italic is reserved for **one soft hero line per screen** and capped at 5 words. Examples: "Your rest is sacred.", "Night catches up gently.", "A quiet victory." **Never use for body prose.**
- Body text: Manrope Light 300. Caps at 60 characters per line on mobile.

### 3.4 Anti-patterns

❌ Noto Serif long prose blocks (looks pretentious on mobile)
❌ Bold weights on any heading smaller than `displayLg`
❌ Mixing 4 families in one screen — max 3 (display + body + one accent serif/mono)
❌ All-caps on body text (only labels)
❌ `fontSize: 14` for hero numbers — they disappear

---

## 4. Surfaces & depth

### 4.1 Card variants

| Variant | Fill | Border | Effect |
|---|---|---|---|
| `whisper` | `surfaceLow` | none | Minimal group container, lowest visual weight |
| `paper` | `surface` | none | Default card, 3rem radius |
| `elevated` | `surfaceHigh` | none | Primary focal card |
| `glass` | BlurView intensity 40 tint "light" + `surfaceLowest` @ 65% | none | Hero glass card; uses top-edge highlight |
| `mint` | `primaryContainer` | none | Chip, success indicator |
| `dusk` | `duskGlow` | none | Evening/melatonin indicator |
| `sunrise` | `sunriseGlow` | none | Morning/wake indicator |

**Glass card spec (iOS):**
```
BlurView { intensity: 40, tint: "light" } — absolute fill
View { backgroundColor: rgba(255,252,248,0.65) } — absolute fill
LinearGradient { glassHighlight } — absolute top 1px, opacity to 0
Content — flex column, padding: spacing.xl
borderRadius: radii.xl
overflow: hidden
```

**Android glass fallback:** solid `rgba(252,249,246,0.94)` + `radii.xl`. BlurView on Android is noisy; use opacity.

### 4.2 Elevation via tonal shift (no shadows)

Dark/heavy shadows are banned. If an element must "lift" off the canvas:

1. Use a tier UP (`surface` on `canvasDim`, `surfaceHigh` on `surface`)
2. Add a frosted glass card
3. Add a subtle radial ambient glow (40px blur, 4% opacity of `primary`) BEHIND the element — not a drop shadow

The exception: floating tab bar. It needs ONE soft depth cue:
```
shadowColor: #45645E
shadowOpacity: 0.08
shadowRadius: 32
shadowOffset: { width: 0, height: 12 }
elevation: 12 (Android)
```
**Color the shadow with primary**, never neutral grey — grey shadows look dead on warm cream.

---

## 5. Primitives — component contracts

All live in `components/ui/`. Export from `components/ui/index.ts`.

### 5.1 `<Screen>`
Full-bleed 3-layer wrapper. Props: `variant?: 'default' | 'dim'`, `scroll?: boolean`, `tabBarClearance?: boolean`.
Renders: `<AtmosphericBackground />` → `<OrbField />` → children (as ScrollView if `scroll`). Applies `paddingBottom: insets.bottom + 160` if `tabBarClearance`.

### 5.2 `<AtmosphericBackground>`
Absolute, z-index -2. Renders `atmosphereWarm` gradient vertically. Children (orbs) layered above.

### 5.3 `<OrbField>`
Absolute, z-index -1. 4 radial orbs positioned at corners: top-right mint (orbMint), top-left sage (orbSage), bottom-right sunrise (orbSunrise), bottom-left dusk (orbDusk). Low opacity. `pointerEvents="none"` always.

Orb size: 320×320. Each orb is a View with absolute position + `backgroundColor: transparent` + a radial gradient via `expo-linear-gradient` (using a circular mask trick: set `width = height`, `borderRadius = width/2`, gradient fills with fade-to-transparent).

### 5.4 `<GlassCard>`
Props: `variant?: 'whisper' | 'paper' | 'elevated' | 'glass' | 'mint' | 'dusk' | 'sunrise'`, `padding?: keyof typeof spacing`, children.
Default variant: `paper`. All share `radii.xl` unless `variant === 'mint' | 'dusk' | 'sunrise'` (then `radii.lg`).

### 5.5 `<PillCTA>`
Props: `label: string`, `onPress`, `variant?: 'primary' | 'outlined' | 'glass' | 'sunrise' | 'dusk'`, `size?: 'lg' | 'md' | 'sm'`, `iconLeft?`, `iconRight?`, `loading?`, `disabled?`.
Behavior:
- `onPress` → `Haptics.impactAsync(Medium)` → callback
- Reanimated press scale: `withTiming(0.97, { duration: 120 })` on press-in, back on press-out
- `accessibilityRole="button"`, `accessibilityLabel={label}`
- `primary`: LinearGradient `ctaPrimary`, height 56 (`lg`), radii.pill, text `onPrimary` `titleMd`
- `outlined`: transparent fill, 1.5px `primary` border (the ONE place a border is allowed — only because it's a pill CTA), text `primary`
- `glass`: BlurView + `rgba(255,252,248,0.55)` fill + top highlight + `ink` text
- `sunrise` / `dusk`: LinearGradient `ctaSunrise` / `ctaDusk`, text `ink`
- Ambient glow behind primary: `shadowColor: primary, opacity: 0.22, radius: 28`

### 5.6 `<HeroNumber>`
Props: `value: string | number`, `size?: 'xxl' | 'xl' | 'lg' | 'md'`, `label?: string`, `labelPosition?: 'above' | 'below'`, `align?: 'left' | 'center' | 'right'`.
Renders:
- `<Text>` with `typeScale.displayXxl/Xl/Lg/Md`
- Optional `<Eyebrow>` above or below
- Supports right-slot for a unit (`4 <sup>s</sup>` pattern — small superscript in labelMd)

### 5.7 `<Eyebrow>`
Props: `children: string`, `color?: string`.
`labelLg` styling — uppercase, wide tracking, `inkMuted` default.

### 5.8 `<SerifHero>`
Props: `children: string`, `align?: 'left' | 'center'`.
Fraunces 300 italic, `serifHero` scale. Content prop must be ≤60 characters. Warns in dev if longer (just in Metro console).

### 5.9 `<BreathingOrb>`
Props: `size?: number` (default 220), `pulse?: boolean`, `label?: string` (shown inside, centered, ExtraLight 200).
Renders: circular View with `breathOrb` radial gradient. If `pulse`, scale animation via reanimated: `withRepeat(withTiming(1.08, { duration: 4000 }), -1, true)` — 4s slow breath cycle.

### 5.10 `<ProgressDots>`
Props: `count: number`, `active: number` (0-indexed), `variant?: 'primary' | 'accent'`, `size?: 8 | 10 | 12`.
Row of dots, `spacing.xs` gap. Inactive: `inkGhost`. Active: `primary` (or accent). Active dot is 1.4× size.

### 5.11 `<TimelineRing>`
24-hour circadian ring. SVG-based.
Props: `nowHour: number` (0-23.99), `sleepStart: number`, `sleepEnd: number`, `shiftStart?: number`, `shiftEnd?: number`, `size?: number` (default 260).
Renders concentric SVG arcs:
- Outer track: thin 2px `surfaceHigh` circle (24h)
- Night arc: `sleepArc` gradient between sleepStart → sleepEnd (fill for sleep block)
- Shift arc: `primary` stroke for shift hours (if provided)
- Now marker: small filled circle (`primary`) positioned on the ring at `nowHour * 15°`
- Center label: hour (Manrope mono), minutes (Manrope light) — stacked

### 5.12 `<ShiftBar>`
Horizontal timeline pill showing a day's shift + sleep window.
Props: `blocks: { start: number, end: number, kind: 'shift' | 'commute' | 'winddown' | 'sleep' | 'free' }[]`, optional `height?: number` (default 12).
Renders rounded pill (radii.pill) filled with segments. Colors per kind:
- `shift`: `primary`
- `commute`: `inkGhost`
- `winddown`: `duskGlow`
- `sleep`: `dusk`
- `free`: `surfaceHigh`

### 5.13 `<Glyph>`
Hand-built SVG icon set. Props: `name`, `size?`, `color?`.
Names: `moon`, `sun`, `coffee`, `alarm`, `pulse`, `leaf`, `sparkle`, `chevronRight`, `chevronLeft`, `close`, `check`, `plus`, `bell`, `gear`, `user`, `calendar`, `home`, `bed`, `flame` (streak).
All strokes 1.5px, rounded caps/joins, no fills by default. Stroke color from prop.

### 5.14 `<FloatingTabBar>`
Used as custom `tabBar` prop in `app/(tabs)/_layout.tsx`. Not a primitive used elsewhere.
Spec:
- Absolute bottom, `marginHorizontal: 16`, `marginBottom: insets.bottom + 12`
- `radii.pill`
- `height: 68`
- 4 tab items + optional center primary CTA (sage-filled pill, 48×48, lifted 18px above the bar — for Home's "Start Plan Now" quick action)
- Each tab item: icon 24px + label `labelMd`. Active: `primary` icon + label. Inactive: `inkMuted`
- Active indicator: tiny 4px sage dot below the icon (NOT a bar)
- Fill: BlurView intensity 40 tint light + `rgba(253,250,247,0.78)` overlay
- Shadow: primary-tinted as in §4.2

---

## 6. Layout system — the 3-layer rule

**Every screen has exactly three layers.** Never mix them.

```tsx
<Screen>                             // Layer A — <AtmosphericBackground/> + <OrbField/>
  <Header />                         // Layer C — absolute top
  <ScrollView contentContainerStyle={{
    paddingTop: insets.top + spacing.lg,
    paddingBottom: insets.bottom + 160,  // clearance for FloatingTabBar
    paddingHorizontal: spacing.xl,
  }}>
    {/* Layer B — content */}
    <Eyebrow>TODAY</Eyebrow>
    <HeroNumber size="xl" value="4:32" label="until sleep window" />
    <GlassCard variant="glass">
      …
    </GlassCard>
  </ScrollView>
  {/* FloatingTabBar rendered by (tabs)/_layout */}
</Screen>
```

**NEVER** put `<AtmosphericBackground>` inside a ScrollView — it will scroll with content and break the atmosphere. Background is always `position: absolute` behind everything else.

**Safe zones:**
- Horizontal: `spacing.xl` (24px) minimum from edges — Stitch's ≥3.5rem rule
- Top: `insets.top + spacing.lg` (header overlaps OK)
- Bottom: `insets.bottom + 160` when tab bar visible (floating pill + breathing room)

---

## 7. Screen recipes — primitive composition

Each recipe describes primitive composition, not JSX. Refer to `app/` for actual screens.

### 7.1 S01 Welcome
```
<Screen>
  <OrbField intensity="strong" />
  Content (ScrollView, centered):
    <BreathingOrb size={260} pulse>
      <HeroNumber size="xxl" value="·" />     ← three-dot breath mark
    </BreathingOrb>
    <SerifHero>Rest catches up, gently.</SerifHero>
    <Text bodyLg inkSubtle>
      The only sleep plan for shift workers that
      doesn't punish you for sleeping at noon.
    </Text>
  Floating bottom:
    <PillCTA primary label="Create my plan" />
    <PillCTA glass size="md" label="I already have an account" />
```

### 7.2 S02 Profession Picker
```
<Screen scroll>
  <Eyebrow>STEP 1 / 10</Eyebrow>
  <HeroNumber size="lg" value="What do you do?" />    ← title-as-hero, displayLg 300
  4 × <GlassCard paper>:
    <Glyph name="pulse/flame/gear/sparkle" size={28} color="primary" />
    <Text titleLg>Nurse · 3×12</Text>
    <Text bodyMd inkSubtle>Rotating day/night twelves</Text>
  Floating bottom: <PillCTA primary label="Continue" disabled={!selected} />
```

### 7.3 S13 Loading / Analysis
```
<Screen>
  <BreathingOrb size={300} pulse />
  <HeroNumber size="md" value={currentMessage} />    ← cycles "Analysing your schedule…" etc.
  <ProgressDots count={4} active={i} size={10} />
```

### 7.4 S14 Aha-Moment (Plan Preview)
```
<Screen scroll>
  <Eyebrow>{name}, YOUR PLAN IS READY</Eyebrow>
  <SerifHero>Sleep catches up tonight.</SerifHero>
  <TimelineRing nowHour={14.5} sleepStart={23} sleepEnd={7} shiftStart={7} shiftEnd={19} />
  <GlassCard glass>
    <Eyebrow>SLEEP WINDOW</Eyebrow>
    <HeroNumber size="md" value="23:00 — 07:00" />
  </GlassCard>
  <GlassCard glass>
    <Eyebrow>CAFFEINE CUTOFF</Eyebrow>
    <HeroNumber size="md" value="17:00" />
    <Text bodyMd>6 hours before sleep · gentle on sensitive types</Text>
  </GlassCard>
  Locked card preview (transition plan — blurred):
    <GlassCard glass style={{ opacity: 0.55 }}>
      <Glyph name="sparkle" /> <Text>Transition plan · Premium</Text>
  Floating bottom: <PillCTA primary label="Get the full plan" />
```

### 7.5 S15 Paywall
```
<Screen scroll>
  <Eyebrow>{name}, YOUR PLAN IS READY</Eyebrow>
  <SerifHero>7 days. Then you decide.</SerifHero>
  4 × value bullet (Glyph + bodyLg)
  2 × PricingCard (glass cards with pill selection):
    $5.99/mo
    $49.99/yr  ($0.96/wk) — "BEST VALUE" mint chip
  Trial timeline (dots showing days 1→7)
  Social proof: 3 quotes in a swiping carousel
  Floating bottom: <PillCTA primary label="Start 7-day trial" />
  Muted text link: "Maybe later"
```

### 7.6 S20 Home (today)
```
<Screen scroll>
  Header (absolute): eyebrow greeting "GOOD MORNING, MARINA" + streak pill "🔥 14"
  <SerifHero>Rest is gathering.</SerifHero>
  <TimelineRing nowHour={now} ... />    ← today's 24h at a glance
  <ShiftBar blocks=[...] />              ← horizontal pill timeline
  Next 3 events cards (GlassCard glass, each):
    - <Glyph coffee /> CAFFEINE CUTOFF · 17:00 · 4h 22m away
    - <Glyph moon   /> MELATONIN       · 22:00 · 9h 22m away
    - <Glyph bed    /> SLEEP WINDOW    · 23:00 · 10h 22m away
  Transition banner (if active): <GlassCard dusk> … </GlassCard>
  Floating bottom tab bar
```

### 7.7 S30 Calendar (month)
```
<Screen scroll>
  Header: month name + prev/next chevrons
  Month grid — 6 rows × 7 columns of dots (not squares). Each day = dot with tint:
    sage    = day shift
    dusk    = night shift
    mint    = off
    ghost   = past
  Small numbers below dots (Manrope mono).
  Legend row: 4 colored dots + labels.
  Floating bottom: <PillCTA primary label="+ Add shift" />
```

### 7.8 S40 Daily Sleep Plan
```
<Screen scroll>
  Eyebrow: TODAY · 20 APRIL
  <TimelineRing … full-size 280>
  Swipe pager: yesterday / today / tomorrow (pager snaps, ProgressDots below)
  4 recommendation cards (GlassCard glass, one per category):
    - caffeine    <Glyph coffee>   [sunrise pill with cutoff time]
    - melatonin   <Glyph moon>     [dusk pill with dose + time] (premium lock if free)
    - light       <Glyph sun>      [sunrise pill with window]
    - nap         <Glyph bed>      [mint pill with optional window]
  "Why these times?" link → S45
```

### 7.9 S43 Transition Plan
```
<Screen scroll>
  Eyebrow: TRANSITION · NIGHT → DAY
  <SerifHero>Two quiet days ahead.</SerifHero>
  Day 1 card (GlassCard glass):
    <Eyebrow>DAY 1 · WED 22</Eyebrow>
    <HeroNumber size="md" value="3 of 4" label="complete" />
    Checklist: 4 rows with toggle (<Glyph check>), each row: time + action + tip
  Day 2 card — same pattern
  Final row: muted pill link "Why this works" → S45
```

### 7.10 S50 Profile Overview
```
<Screen dim scroll>
  Eyebrow: PROFILE
  <SerifHero>Marina · Nurse · 3×12</SerifHero>
  Streak ribbon: 14 dots heatmap (sage opacity 20→100%) with current = 100%
  Quick stats row (3 glass cards side-by-side):
    <HeroNumber md value="42" label="days rested" />
    <HeroNumber md value="3"  label="transitions" />
    <HeroNumber md value="98" label="% adherence" />
  Settings list (whisper cards, chevronRight glyph):
    Sleep preferences · Notifications · Subscription · About · Sign out
```

---

## 8. Motion & haptics

| Element | Motion | Haptic |
|---|---|---|
| `PillCTA` primary press | scale 1 → 0.97 (120ms), back (160ms) | `Medium` |
| `PillCTA` glass / outlined press | scale 1 → 0.98, back | `Light` |
| `Toggle` / `Checkbox` | scale bounce + check draw (200ms) | `Light` |
| `BreathingOrb` pulse | 4s scale 1 → 1.08 → 1, ease-in-out | none |
| Onboarding step forward | slide left 300ms cubic-bezier(0.4,0,0.2,1) | `Light` on tap |
| Paywall present | slide up 400ms | none |
| Celebration (streak milestone) | confetti (Lottie) + scale 1 → 1.1 → 1 | `Heavy` + `Success` |
| Trial start CTA | scale + success glow | `Success` |
| Error / validation | shake 3 cycles 6px | `Error` |
| Tab switch | cross-fade 200ms | none |
| Sleep plan swipe | horizontal pager snap | `Light` on snap |

All easing: `Easing.bezier(0.4, 0, 0.2, 1)` — the "breath" curve. Never spring on primary CTAs (feels bouncy/cheap against the sage aesthetic).

**Reduce Motion** (AccessibilityInfo.isReduceMotionEnabled) → replace all scale/slide with instant fades.

---

## 9. Anti-patterns

❌ **Pure white** (`#FFFFFF`) as canvas. Always use `canvas` (`#FCF9F6`). `#FFFFFF` only exists as a tint inside glass cards.
❌ **Pure black** (`#000`). Use `ink` (`#32332F`).
❌ **1px borders** on cards, rows, dividers. Separate with tonal fills or negative space.
❌ **Drop shadows on content cards.** Only the floating tab bar gets a shadow (primary-tinted).
❌ **Bold weights on headings.** ExtraLight 200 / Light 300 only, except hero display numbers (stay 200 — weight lives in size).
❌ **Red** for warnings. Use `coral`. ShiftRest is non-judgmental.
❌ **Sharp corners.** Smallest radius anywhere is `radii.sm` (12). CTAs and chips = `radii.pill`.
❌ **4+ stop gradient with pure white highlight stop** on CTAs. Produces "ublyudsky" glossy effect. Max 3 stops.
❌ **Noto Serif** for hero text — pretentious on mobile. Use Fraunces Italic capped at 5 words.
❌ **Math-positioned labels around a ring.** 2-column legend below instead.
❌ **Content bleeds through tab bar.** Overlay fill must be ≥0.75 opacity.
❌ **`BlurView` with `flex: 1` child content.** Children collapse. Use `width: '100%'` on the inner View.
❌ **`router.back()` on a modal with no history.** Always `router.canGoBack() ? back() : replace('/(tabs)')`.
❌ **Fixed heights for paywall plan cards** — breaks on iPhone SE. Use `aspectRatio` + `useWindowDimensions`.

---

## 10. Accessibility checklist

- [ ] All interactive elements have `accessibilityRole` + `accessibilityLabel`
- [ ] Minimum touch target 48×48 (our pill CTAs are 56 tall; chip buttons need `hitSlop`)
- [ ] Contrast ≥ 4.5:1 for body text — verified: `ink` on `canvas` = 11.8:1 ✓
- [ ] Contrast ≥ 3:1 for large text — `inkMuted` on `canvas` = 4.3:1 ✓
- [ ] Color never the ONLY cue: caffeine status shows text ("OK" / "Cutoff passed") + color
- [ ] Dynamic Type supported — typography uses relative sizes, lines don't truncate at +2 setting
- [ ] VoiceOver reads display numbers as their semantic meaning (`accessibilityLabel="4 hours 32 minutes until sleep window"`)
- [ ] Reduce Motion disables `<BreathingOrb>` pulse and all slide transitions
- [ ] Tab bar reachable — floating pill is in the thumb zone on iPhone SE through Pro Max

---

## 11. Dark mode (planned, not yet built)

Keep the Zen Editorial spirit on a deep-sage midnight canvas. Spec reserved:

- `canvas` → `#101514` (near-black with sage tint)
- `surface` tiers: `#171D1B` → `#1F2826` → `#273331`
- `primary` stays `#84A59D` (switch to `primaryBright` as default — deeper sage disappears on dark)
- `primaryContainer` → `#243634` (deep mint)
- `ink` → `#E8E6E0`
- Orb opacities drop to 0.55× (dark amplifies)
- Glass cards → BlurView tint "dark", fill `rgba(23,29,27,0.65)`
- Auto-switch via `useColorScheme()` or user override in Profile → Appearance

Ship in v1.1. For v1.0 app.json `userInterfaceStyle: "light"`.

---

## 12. Pre-commit checklist

Before every commit touching UI:

- [ ] No inline hex values outside `constants/tokens.ts`
- [ ] No `borderWidth: 1` on cards (acceptable on `PillCTA outlined` only)
- [ ] No `#fff` / `#000` anywhere — use `onPrimary` / `ink`
- [ ] All `Pressable` / `TouchableOpacity` have `Haptics.impactAsync` or a handler-level call
- [ ] All `<Text>` has a typeScale token (no inline `fontSize`)
- [ ] ScrollView has `contentContainerStyle` with proper safe-area + tab-bar clearance
- [ ] No `AtmosphericBackground` inside a ScrollView
- [ ] Fraunces Italic hero lines ≤ 5 words
- [ ] Images use `aspectRatio` not fixed `height`
- [ ] Icons are from `<Glyph>` (not Material Icons / FontAwesome)
- [ ] Accessibility labels on all interactive elements
- [ ] Dark-mode dry-run screenshot at least once (visual check that colors don't invert badly)

---

## 13. File hygiene

- `expo-env.d.ts` — at repo **root**, never inside `app/`
- Dynamic routes in `Stack.Screen` use full path (`"plan/[id]"`, not `"plan"`)
- `.gitignore` includes `.expo/`, `node_modules/`, `ios/`, `android/`
- `app.json` → `userInterfaceStyle: "light"` (until dark mode ships in v1.1)
- `package.json` uses `--legacy-peer-deps` install due to reanimated v4 peer range
- Fonts loaded via `@expo-google-fonts/*` packages, not bundled .ttf

---

## 14. Source & traceability

- **Stitch project:** [projects/10724681838946440315](../../docs/06-design/stitch-raw/design-theme.json) — `designTheme` snapshot saved
- **Raw screenshots:** [stitch-raw/screenshots/](../../docs/06-design/stitch-raw/screenshots/)
- **UX docs:** [SCREEN-MAP.md](../04-ux/SCREEN-MAP.md), [UX-SPEC.md](../04-ux/UX-SPEC.md), [USER-FLOWS.md](../04-ux/USER-FLOWS.md)
- **Canonical name in UI:** ShiftRest (Stitch's "Zen Editorial" header is the moodboard name, not the brand)
- **Pipeline:** `~/.claude/skills/stitch-to-native-ui/SKILL.md` v2.1

**Precedence rule when sources disagree:** Stitch screenshots > `designMd` prose > UX-SPEC color table > designer prompts. (Per SKILL — the latest iterated artifact wins.)

---

**Changelog**
- v1.0 (2026-04-20) — initial draft from Stitch "Breathing App Component Sheet" → ShiftRest Zen Sanctuary mood
