# ShiftRest — Improvement Plan (owner feedback 2026-05-31)

Source: owner review of the live app. Two buckets — **bugs/polish** and
**missing functionality**. Work top-down, one item per commit, verify EACH
via (a) code, (b) jest/tsc, (c) live sim/UI screenshot. Re-check repeatedly.

Sim: `AF4951D7-668C-46F6-8FA1-0C564F0B7765` (iPhone 17 Pro) · Metro 8081.

---

## PART A — BUGS & POLISH

### A1 — Onboarding step 3 START/END cards render empty (white blocks)
- **Owner saw:** Day/Night shift → the two time containers are blank.
- **Finding:** current `main` renders `07:00` / `19:00` with chevrons
  correctly (DateTimePickerField, commit 83de2d5). The blank-card bug was
  the OLD GlassCard variant — fixed in main but the owner is on a STALE
  TestFlight build that predates the fix.
- **Action:** (1) verify fresh cold-start (empty AsyncStorage) also renders
  defaults, (2) ship a new TestFlight build so the fix reaches the device.
- **Status:** verify done → needs rebuild.

### A2 — i18n: force English for any unsupported device locale
- **Owner saw:** ru / kz device shows broken keys ("Get day night shift
  night of day" = raw/missing key text).
- **Root cause:** only `ru*` is explicitly aliased to `en`. Any other
  unsupported locale (kz, uk, tr, pl, ar, …) falls through i18n-js and
  renders `[missing key]`.
- **Fix:** compute locale at startup against a SUPPORTED set; if the device
  locale (and its base language) isn't supported → `i18n.locale = 'en'`.
  General solution, not per-locale whack-a-mole.
- **Verify:** set sim to ru, kz, ar → every screen renders English, no
  bracket/raw-key artifacts.

### A3 — Replace ALL standard Apple Alert popups with a branded modal
- **Owner saw:** "Log cup" caffeine confirm + calendar "Edit this shift"
  fire the stock iOS `Alert.alert`. Wants a custom beautiful sheet/dialog
  everywhere.
- **Scope:** 29 `Alert.alert` call sites across app/ + components/.
  Priority order:
  1. `(tabs)/index.tsx:365` — caffeine log confirm (owner-named)
  2. `(tabs)/schedule.tsx:231/252` — shift cell edit/delete (owner-named)
  3. destructive confirms: profile sign-out, sleep-prefs reset,
     work-schedule change
  4. all remaining info/error alerts
- **Build:** a reusable `<AppDialog>` (title/body/actions, branded styling,
  GlassCard + PillCTA, backdrop dismiss per Rule 23) + an imperative
  `showDialog()` helper so call sites stay terse. Replace site-by-site.
- **Verify:** trigger each live, screenshot the custom dialog, confirm
  backdrop dismiss + action wiring.

### A4 — Plan-generating (loading) screen: richer, slower, clearer
- **Owner saw:** the orb + 0→100% is too fast / unclear / low value.
- **Fix:**
  - Orb: add shimmer/gradient sweep + softer easing so it "переливается".
  - Counter text + sub-copy: larger, and step the messages so the user
    reads what's being computed (e.g. "Analyzing your rotation…",
    "Timing melatonin…", "Setting caffeine cutoff…").
  - Pace: stretch the 0→100 so it's legible (min ~2.5–3s), not instant.
- **Verify:** record the sequence on sim, confirm legibility + feel.

---

## PART B — MISSING FUNCTIONALITY (the "app is raw / boring" feedback)

### B1 — Sleep Plan for ANY date (not just Yesterday/Today/Tomorrow)
- **Owner saw:** set a shift 2 days out → no way to view that day's plan.
  Plan tab only pages Y/T/T.
- **Fix:** make a calendar date → open that date's full plan. Either extend
  the pager to arbitrary dates or add "tap a Schedule cell → Plan for that
  date". Plan derives from that date's shift kind + chronotype (engine
  already supports any shift input).
- **Verify:** set a future shift, open its date, confirm the plan reflects
  that shift (e.g. night → daytime sleep window).

### B2 — Richer per-day plan detail + content
- **Owner wants:** more nuance per plan — tips, "why this helps", short
  medical/educational content, so it actually helps the user sleep.
- **Fix:** expand each plan card with an expandable "why + how" section;
  surface relevant Sleep Library tips contextually; add a content/article
  surface. (Sleep Library exists at /tips — make it richer + more visible.)

### B3 — Community Stories (prominent + social)
- **Owner wants:** beautiful stories ON the home screen where users share
  how they normalized sleep; profile photo upload; stories shareable &
  public to everyone.
- **Current:** `StoriesCoverFlow` exists but minimal + empty-state heavy.
- **Fix:**
  - Promote stories on Today with real visual design (cover-flow polish).
  - Profile: avatar/photo upload (expo-image-picker — note: was removed in
    R24 as unused; re-add for this feature).
  - Story compose → submit → moderation → public feed; author display
    (first name + avatar, opt-in).
- **Verify:** compose a story, see it queued; render the feed with avatars.

### B4 — "Coming up · Shift Transition" — make it real or remove
- **Owner asked:** is this an actual feature? Currently a teaser card.
- **Fix:** confirm /transition + /transition-create are wired & valuable;
  if half-baked, finish (generate a real 2-day transition plan, show steps,
  mark complete) or remove the teaser until it's real.

---

## PART C — PROCESS (owner directive)
- Move step by step, NOT in a rush.
- Re-verify EVERY feature for bugs through code + jest/tsc + live UI.
- One logical fix per commit (Rule 0). Push to main.
- After Part A+B, ship a fresh TestFlight build so the device reflects all
  fixes (A1 especially is invisible until rebuilt).

## Execution log
(updated as each item lands)
- _pending start_
