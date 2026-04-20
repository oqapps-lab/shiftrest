# NAVIGATION-MAP — ShiftRest

> Single source of truth for screen transitions. Every CTA in the app must trace to an edge in this document.
> Derived from [USER-FLOWS.md](../04-ux/USER-FLOWS.md) (5 flows) and [SCREEN-MAP.md](../04-ux/SCREEN-MAP.md) (50 screens).
>
> **Rule**: never invent a screen. Every node here appears in SCREEN-MAP. Every edge appears in USER-FLOWS.
> **Rule**: modals dismiss via `router.dismiss()` (fallback `router.canGoBack() ? back() : replace('/(tabs)')`), never via a bare `router.back()`.
> **Rule**: tab switches use `router.replace('/(tabs)/<name>')` — prevents stack buildup on tab-to-tab taps.

This file is written **postmortem** for the 10-screen demo scaffold (commit `2663583`). It will be expanded as remaining 40 screens land in Stage 6.

---

## Route topology

```
expo-router layout tree
├── app/_layout.tsx                  ROOT STACK
│   ├── index.tsx                    S01 Welcome                  (/)
│   ├── (onboarding)/                ── implemented as app/onboarding/*
│   │   ├── _layout.tsx              sub-Stack, forward-only
│   │   ├── profession.tsx           S02                          (/onboarding/profession)
│   │   ├── loading.tsx              S13                          (/onboarding/loading)
│   │   └── aha.tsx                  S14                          (/onboarding/aha)
│   ├── (tabs)/                      BOTTOM-TAB GROUP
│   │   ├── _layout.tsx              FloatingTabBar
│   │   ├── index.tsx                S20 Home                      (/(tabs))
│   │   ├── schedule.tsx             S30 Calendar                  (/(tabs)/schedule)
│   │   ├── plan.tsx                 S40 Daily Sleep Plan          (/(tabs)/plan)
│   │   └── profile.tsx              S50 Profile                   (/(tabs)/profile)
│   ├── paywall.tsx                  S15 Paywall (MODAL)           (/paywall)
│   └── transition.tsx               S43 Transition Plan (MODAL)   (/transition)
```

---

## Implemented edges (demo scaffold — 10 screens)

### Flow 1 — First Launch (implemented: S01 → S02 → S13 → S14 → S15 → S20)

| From | Trigger | To | API |
|---|---|---|---|
| `/` (S01) | Tap "Create my plan" | `/onboarding/profession` (S02) | `router.push` |
| `/` (S01) | Tap "I already have an account" | `/(tabs)` (S20) | `router.replace` |
| `/onboarding/profession` (S02) | Select card + tap "Continue" | `/onboarding/loading` (S13) | `router.push` |
| `/onboarding/loading` (S13) | Auto after 4 cycled messages (~4s) | `/onboarding/aha` (S14) | `router.replace` |
| `/onboarding/aha` (S14) | Tap "Get the full plan" | `/paywall` (S15) | `router.push` |
| `/paywall` (S15) | Tap "Start 7-day trial" | `/(tabs)` (S20) | `router.replace` |
| `/paywall` (S15) | Tap "Maybe later" | `/(tabs)` (S20) | `router.replace` |
| `/paywall` (S15) | Tap × (close) | *dismiss modal* | `router.dismiss()` → fallback `replace('/(tabs)')` |

### Flow 2 — Core Action (implemented: S20 → S40; S20 → S43)

| From | Trigger | To | API |
|---|---|---|---|
| `/(tabs)` (S20) | Tap "Sleep Plan" tab | `/(tabs)/plan` (S40) | tab `navigate` |
| `/(tabs)` (S20) | Tap transition banner | `/transition` (S43) | `router.push` |
| `/transition` (S43) | Tap × (close) | *dismiss modal* | `router.dismiss()` → fallback |

### Flow 3 — Return Visit (implicit — tab switches)

| From | Trigger | To | API |
|---|---|---|---|
| any tab | Tap tab in `FloatingTabBar` | selected tab route | `navigation.navigate(route.name)` (React Navigation tab API) |

### Flow 4 — Upgrade (implemented: S20 → S15 implied; M03 Premium Gate deferred)

| From | Trigger | To | API |
|---|---|---|---|
| `/(tabs)` (S23 when free tier) | Tap 🔒 card | `/paywall` (M01) | `router.push` — **not implemented yet**, free-tier branch is TODO |

### Flow 5 — Transition (implemented: S20 → S43)

| From | Trigger | To | API |
|---|---|---|---|
| `/(tabs)` (S20) | Tap transition banner | `/transition` (S43) | `router.push` |

---

## Not yet implemented — planned edges (Stage 6 backlog)

These transitions are defined in USER-FLOWS + SCREEN-MAP but their target screens are not in the demo scaffold:

- S02 → S03 Schedule Template, S03 → S04 Current Shift, S04 → S05 Main Problem (rest of onboarding before S13)
- S06 Social Proof #1, S07 Chronotype, S08 Caffeine Habits, S09 Melatonin, S10 Family, S11 Name, S12 Social Proof #2
- S16 Notification Permission (after S15 or after trial start)
- S21 Home weekend, S22 Home empty, S23 Home free tier (context-switch based on state, not a route)
- S31 Add Shift, S32 Edit Shift, S33 Template Picker, S34 Repeat Settings
- S41 Caffeine Detail, S42 Melatonin Detail, S44 Transition Day Detail, S45 Plan Explanation, S46 Weekly Plan
- S51 Sleep Preferences, S52 Notification Settings, S53 Subscription, S54 About
- Modals: M01–M09 (paywall context re-open, permission primer, feature gate, shift changed, celebration, rate app, welcome back, schedule expired, disclaimer)
- System: X01–X04 (loading splash, no internet, force update, maintenance)

**Priority for Stage 6:**
1. Complete onboarding chain S03–S12 (10 screens)
2. S31/S32/S33 Add/Edit Shift (Schedule detail)
3. S41/S42 Caffeine/Melatonin Detail
4. S21/S22/S23 Home state variants
5. S44/S45 Transition Day Detail + Plan Explanation
6. M01/M03 contextual paywall + premium gate
7. S51–S54 Profile detail chain

---

## Invariants (must always hold)

1. **No orphan CTAs.** Every `<PillCTA>` / `<Pressable>` that reads as interactive has an explicit edge here.
2. **Modal × button.** Uses the 3-step fallback: `router.dismiss()` → `router.back()` → `router.replace('/(tabs)')`. Never bare `router.back()`.
3. **Tab bar.** Uses `navigation.navigate(route.name)` via the custom `FloatingTabBar` — this is the React Navigation tab API, not router.push. Tab switches don't create stack history.
4. **Forward-only onboarding.** `(onboarding)/_layout.tsx` sets `gestureEnabled: false` and no back button. Once past a step the user cannot un-select. (When S03–S12 land, each will use `router.push` — `_layout` keeps the forward constraint via the layout option.)
5. **Paywall escape routes.** Both primary (trial start) and secondary (maybe later) resolve to `/(tabs)` via `replace`, never `push`. Deep-linked paywalls (post-purchase URL, notification tap) also resolve there so `dismiss()` always has a destination.
6. **Deep link targets.** Every route accepts entry via a direct URL. `/transition` and `/paywall` entered cold (no history) still dismiss correctly.

---

## Cross-ref

- [USER-FLOWS.md](../04-ux/USER-FLOWS.md) — the 5 flows
- [SCREEN-MAP.md](../04-ux/SCREEN-MAP.md) — all 50 screens, IDs
- [UX-SPEC.md](../04-ux/UX-SPEC.md) — navigation principles (§2), transitions (§4.3)
- [DESIGN-GUIDE.md](../06-design/DESIGN-GUIDE.md) — the visual system applied at each node
- [RUN-LOCAL.md](./RUN-LOCAL.md) — the navigation map for runtime walkthrough

---

**Changelog**
- v0.1 (2026-04-20) — initial postmortem from 10-screen demo (commit 2663583). Stage 5.
