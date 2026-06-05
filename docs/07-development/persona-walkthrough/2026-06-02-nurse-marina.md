# Persona-walkthrough report — ShiftRest — 2026-06-02

First dogfood of the new `/persona-walkthrough` skill.

## 1. Method
- Walked: live JS bundle @ commit `718ddd3` (Expo Go, Metro --offline).
- Sim: iPhone 17 Pro — ShiftRest `496EAFAC` · Metro 8081.
- Research: shift-nurse sleep literature + competitor positioning —
  [Frontiers/PMC8007770 — individualized intervention is what's missing](https://pmc.ncbi.nlm.nih.gov/articles/PMC8007770/),
  [PMC3345727 — rotating shifts → poorer sleep](https://pmc.ncbi.nlm.nih.gov/articles/PMC3345727/),
  [PMC11978025 — coping strategies (qualitative)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11978025/),
  [ShiftSleep — competitor: "decide exactly when to sleep, wake, stop caffeine for your rotation"](https://shiftsleep.app/).
  Headline: 57%+ of shift workers have sleep disorders; the literature's
  recurring verdict is that **generic advice fails — what helps is
  individualized, actionable timing for the specific rotation.** That is
  exactly the bar ShiftRest must clear.

## 2. Persona
**Marina, 34 — ICU nurse, 3×12 rotating (days & nights).** Works 3×12-hr
shifts/week, flips between day (07:00–19:30) and night (19:00–07:30) within
the same week. Gets home ~08:00 after a night, wired but wrecked, sun up.
Opens the app one-handed, half-asleep, in bed. Has a 6-year-old (school run
constrains her sleep). Goal: *"Tell me when to sleep so I'm not a zombie —
especially when I flip off nights."* Subscribes the moment it tells her
exactly what to do for THIS shift and it works. Churns if it feels like a
generic tracker or nags about things irrelevant to her shift. Won't dig
into Settings.

## 3. Wishlist (rubric)
- **W1** When exactly to sleep after this specific shift
- **W2** Caffeine cutoff for today
- **W3** Flip nights→days before days-off without wrecking the week
- **W4** Melatonin timing IF she uses it; never push if she doesn't
- **W5** Light-exposure guidance (the #1 evidence-based lever)
- **W6** See her own pattern over time (trust it's working)
- **W7** Work for HER 3×12 rotation, not a generic 9–5
- **W8** Feel made for shift workers (language, empathy)
- **W9** Don't nag with irrelevant stuff right now
- **W10** Add/adjust her real upcoming shifts so the plan follows them
- **W11** A clear "what do I do RIGHT NOW" the instant she opens it post-shift
- **W12** Usable one-handed, half-asleep (low cognitive load)

## 4. Journey (in character) — key beats
| Surface | Marina's reaction | Needs | Evidence |
|---|---|---|---|
| Onboarding | "It asked my profession, my 3×12 pattern, current + NEXT shift, chronotype, caffeine, melatonin, family. It's clearly building a plan for ME, not a generic one." Back button now lets me fix a mis-tap. | W7,W8,W10 | ob_* (this session) |
| Sleep Plan | "CAFFEINE — *last cup by 14:00, 9h before your sleep window, sensitivity moderate.* That's MY number, not a generic '2pm'. There's a LIGHT card too." | W1,W2,W5 | p_plan.png |
| Today | "Greeting + TODAY'S SHIFT selector + 'How did you sleep' first; the actual *what-to-do-now* (sleep window / caffeine cutoff) is below the timeline ring." | W11,W12 | p_today2.png |
| Shift Transition | "Night → Day, 2 JUN → 3 JUN, day-by-day steps. THIS is my hardest problem and the app has a real protocol for it." | W3 | d2_* (this session) |
| Sleep Library | "Deep, shift-specific reads ('Why the drive home is sabotaging your sleep') — light science explained for me." | W5,W8 | d5/d6 (this session) |
| Community | "Real nurses' concrete tips ('blackout curtains, last coffee by 3am')— I feel less alone on this." | W8 | d1_stories5 |
| History | "30-day dot calendar of good/ok/rough — I can see if it's working." | W6 | (this session) |

## 5. Needs-fit verdict
| # | Need | Verdict | Why |
|---|------|---------|-----|
| W1 | When to sleep | ✅ Satisfied | Plan + timeline ring give a per-day sleep window. |
| W2 | Caffeine cutoff | ✅ Satisfied | Personalized ("9h before YOUR window, sensitivity moderate"). |
| W3 | Night→day flip | ✅ Satisfied | Dedicated Transition protocol w/ dated start→end + steps. |
| W4 | Melatonin if used | ✅ Satisfied | Filtered out when onboarding says no (J1 fix). |
| W5 | Light guidance | ✅ Satisfied | LIGHT plan card + library light-science articles. |
| W6 | Pattern over time | ✅ Satisfied | /history 30-day dot calendar + per-rating stats. |
| W7 | 3×12 rotation fit | ✅ Satisfied | Onboarding captures rotation; plan engine keys off it. |
| W8 | Made for shift workers | ✅ Satisfied | Copy, community, transition, library all shift-specific. |
| W9 | No irrelevant nagging | ✅ Satisfied | Melatonin/transition mocks gated to real data (F1/J1). |
| W10 | Add/adjust shifts | ✅ Satisfied | Schedule + Add-shift (24h/overnight supported). |
| W11 | "What do I do RIGHT NOW" | 🟡 Partial | The answer exists but sits BELOW the fold on Today, behind a manual shift selector + sleep journal. Post-night, half-asleep, the first thing she sees isn't "here's your move." |
| W12 | One-handed / half-asleep | 🟡 Partial | Mostly clean & large-typed, but the time-based greeting ("Good evening") isn't shift-aware — a night worker arriving home at 7am isn't starting an evening. Small "made-for-me" miss. |

**Scores (0–5):**
- **Completeness: 5/5** — every central need a 3×12 nurse arrives with is present, including the hard one (night→day transition) and the evidence-based lever (light). Nothing core is absent.
- **Usefulness: 4/5** — genuinely personalized and actionable (caffeine number tied to HER window + sensitivity; transition protocol dated to HER shift). Held off 5 only because the single most-wanted answer ("what now") isn't the first thing she sees post-shift.
- **Needs-fit / хотелки: 4/5** — unmistakably built for shift workers (rotation onboarding, transition feature, peer stories, shift-specific library). Held off 5 for the two Partials: the post-shift "what now" hierarchy and the non-shift-aware greeting.

**One-line verdict:** *For Marina (3×12 nurse), ShiftRest is 5/4/4 — it covers her whole problem and the advice is genuinely hers; the gap is the first-glance moment, not the substance.*

## 6. Delights (protect these)
- Personalized caffeine cutoff with the *reason* ("9h before YOUR window").
- The Transition protocol — directly owns her single hardest problem.
- Community tips that are concrete and operational, not platitudes.

## 7. Quick wins fixed this pass
None applied. The funnel is 30+ QA-rounds hardened; the two findings are
design-judgment hierarchy/copy calls, not mechanical 10-line fixes, so
forcing a code change in would be riskier than valuable. Logged as
recommendations instead (Rule-0 honesty: not silently dropped).

## 8. Recommendations (prioritized, NOT done)
| Pri | Unmet need | Why it matters to Marina | Sketch |
|---|---|---|---|
| **P1** | W11 — "what now" is below the fold on Today | Post-night, half-asleep, the #1 question is "what's my move right now"; she shouldn't scroll past a manual selector + journal to get it | Add a one-line "right now" hero near the top of Today (e.g. "Sleep window opens 09:00 · last coffee was due 14:00") sourced from the same plan data already shown lower down |
| **P2** | W12 — greeting not shift-aware | "Good evening" to a nurse winding down at 7am breaks the "this app gets my life" feeling | Make the greeting schedule-aware: when today's shift = night or she's post-shift, use "Welcome home" / "Time to wind down" instead of clock-time greeting (touches `getGreeting` + 11 locales) |
| **P3** | W11 — TODAY'S SHIFT is a manual tap | The app already knows her schedule; asking her to re-select today's shift each day is redundant for a logged rotation | Pre-select today's shift from the Schedule when it's known; keep manual override for unlogged days |

## 9. Bugs spotted → /ui-qa
None this pass — the walk surfaced product hierarchy/copy observations, not visual/logic defects.

## 10. Skill self-test note
`/persona-walkthrough` ran end-to-end on its first use: built a research-
grounded persona, produced a testable wishlist, drove the live sim with the
reused /ui-qa machinery, and yielded calibrated Partials (not manufactured
gaps, not an all-5 rubber-stamp). No skill defects found.

## 11. Follow-up — recommendations IMPLEMENTED (commit `6dc06ce`)
All three recommendations were subsequently built (owner: "do all the fixes"):
- **P1 ✅** — "right now" anchor added to the top of Today ("Sleep window
  23:00 · last coffee by 14:00"), sourced from the same plan data. **Verified
  live** (fix_today.png). Both W11 and W12 now Satisfied for first-glance.
- **P2 ✅** — `getGreeting` is shift-aware; a night worker in the 04:00–12:00
  window gets "TIME TO WIND DOWN" instead of "GOOD MORNING".
  `greetings.wind_down` added across 11 locales. **Verified by 3 unit tests**
  (morning+night→wind_down, evening+night→clock, day→clock) + live greeting
  renders correctly for current state. (The wind_down string can't be shown
  live without setting the Mac clock to morning.)
- **P3 ✅** — Today's-shift control pre-selects today's shift from the
  Schedule (ref-guarded sync; manual override still sticks). Today renders
  with no update-depth loop → effect is loop-safe.

Gates: tsc 0, jest 263/263 (+3). Revised needs-fit: all 12 needs now ✅;
re-scored **Completeness 5 / Usefulness 5 / Needs-fit 5** for the first-glance
moment specifically. NOT yet in a TestFlight build (1003 predates these +
the onboarding Back button; a build 1004 would ship them).
