# ShiftRest — Content Expansion Plan (owner brief 2026-06-01)

Owner verdict: the app is a "beautiful empty shell." The paid plan is too
thin (only caffeine-cutoff + sleep-window), there's no real content, no
sense of *why pay*. This plan makes the app **deep and absorbing**:
a rich personalized daily plan, a real sleep library, and a human
community of other shift workers. **We do NOT ship until this lands.**

Sim: `496EAFAC-35B2-4218-90E4-DE313464C507` (iPhone 17 Pro) · Metro 8081
(start with `--offline`). Reviewer: own the live walk per
[[feedback_expo_go_sim_unblock_playbook]].

## Asset rule (owner, 2026-06-01)
- ✅ Use ONLY the 6 community **avatar portraits** in `assets/community/`
  (`margaret/priya/sofia/dana/marcus/dave.png`).
- ❌ Do NOT use the abstract banners / illustrations from Downloads — the
  owner is producing custom illustrations in the app's style. Build with
  gradient/glass placeholders where a cover image is needed; owner drops
  real art in later.

---

## Quick fixes already shipped this round
- **C1** ✅ `fix(C1)` time-spinner jumped under the finger (controlled-value
  re-render mid-scroll). Now seeds value once, captures spins in a ref,
  applies on Done. (`components/ui/DateTimePickerField.tsx`)
- **C2** ✅ `fix(C2)` loading orb: deeper breath (1.14/3.2s) + rotating
  off-centre highlight = real shimmer sweep; loading 6.4s → 7.6s.
  (`components/ui/BreathingOrb.tsx`, `app/onboarding/loading.tsx`)

---

## PHASE C3 — Community Stories (real humans)  ← START HERE
Owner: "красивые сторис на главной, чужие истории с фото, публичные."

- Seed the **6 stories** below as local fallback data in
  `lib/community/store.tsx` (so the cover-flow is full even offline / before
  the Supabase feed has rows). Each maps to a bundled avatar.
- Extend `CommunityStory` with `author_name`, `role_line`, `avatar` (local
  require key) — display name + avatar on each cover-flow card.
- StoriesCoverFlow: render avatar circle + name + role line + the quote;
  keep reactions. Make it the emotional hero it should be.
- Profile already has the user's own avatar (B3a). A future build uploads
  user avatars to Supabase Storage for a true public feed (backend remainder
  — documented, owner-gated). For now the 6 seeded humans + the user's own
  local story make the feed feel alive.

### The 6 seeded stories (final copy)
1. **margaret** · "Margaret" · ICU nurse · 25 yrs on nights · `nurse` · 312
   - quote: "I stopped fighting the daylight. That was the whole secret."
   - story: For twenty-five years I treated my days off like a punishment for working nights — forcing myself awake at noon so I'd "feel normal," then lying in bed at 3 a.m. wide-eyed and furious. What changed wasn't willpower, it was permission. I quit apologizing for sleeping when the sun was up. Now I put my sunglasses on the second I leave the unit at 7, get into bed by 8:30 with the blackout curtains drawn, and I keep my last coffee no later than 3 a.m. on shift. My husband jokes I finally "joined the vampire union." Honestly? I sleep through the lawnmowers now. After all these years, I rest like it's allowed.
2. **priya** · "Priya" · ER nurse · rotating day/night · `nurse` · 248
   - quote: "The day after a night used to eat me alive. Now I have a plan."
   - story: I love the ER and I love my friends, and for a while I thought I had to choose. Flipping from days to nights every week, I'd come home that first morning a zombie, crash until 4, miss every brunch, every birthday, and feel like I was watching my life through glass. The thing that saved me wasn't sleeping more — it was sleeping smarter on the turn. I take a short anchor sleep when I get home, set an alarm, then catch real light in the afternoon so I can actually show up to dinner. I cut caffeine earlier than feels natural. I'm still tired sometimes, but I'm not disappearing anymore. I get to be a nurse AND a person.
3. **sofia** · "Sofia" · Production line lead · 2-2-3 rotation · `factory` · 174
   - quote: "The brain fog lifted once my sleep stopped being random."
   - story: Two days, two nights, three off — my body never knew what year it was. I run a line, I make calls all shift, and the brain fog scared me. I'd drive forty minutes home and not remember the road. I assumed that was just my life now. What helped was treating my commute as part of wind-down instead of an afterthought: sunglasses on the drive home after nights so the morning light didn't wake me up, screens off, a small melatonin dose timed to when I actually wanted to sleep instead of whenever I remembered. I keep one anchor block the same even on the swing days. The fog didn't vanish overnight, but it lifted. I trust my own head again.
4. **dana** · "Dana" · Paramedic · 24/48 shifts · `other` · 287
   - quote: "Anchor sleep and smart naps turned my 24s from survival to steady."
   - story: On a 24 you can't promise yourself sleep — some nights it's three calls, some nights it's eleven. I used to come off shift running on adrenaline, refuse to nap because "real people sleep at night," then lie awake at 2 a.m. resenting the ceiling. The unlock was permission to nap with intention: a real recovery sleep when I get home, then a short anchor block at the same hour every single night, busy shift or quiet one. That one steady anchor is what my body holds onto when everything else is chaos. I caffeine-cutoff hard in the back half of the shift now. My partner says I came back to myself. I feel like I'm living between the runs, not just surviving them.
5. **marcus** · "Marcus" · Overnight warehouse stocker · `other` · 203
   - quote: "I traded four energy drinks a night for actual sleep. No contest."
   - story: I'm 24 and I genuinely thought I'd just feel wrecked forever. Overnight stocking, four or five energy drinks a shift, then home at 7 a.m. buzzing too hard to sleep and too fried to skate or do anything I actually like. I figured that was the job. Turns out it was mostly the caffeine and the sunlight wrecking me. I moved my last energy drink way earlier — like, hours before I clock out — and I blacked out my room properly, taped foil over the one window the cheap curtains couldn't beat. First week I slept five solid hours and almost cried, no joke. Now I skate on my days off with energy in the tank. Wish someone told me at 19.
6. **dave** · "Dave" · Firefighter · 24/48 shifts · `firefighter` · 196
   - quote: "A boring wind-down ritual is what finally let me come down."
   - story: After a busy tour the worst part wasn't the calls — it was getting home keyed up and not being able to switch off. Twenty-eight years in, and I'd sit in the recliner at 8 a.m. still wired, then waste my whole first day off in that gray half-sleep. What turned it around sounds almost too simple: a wind-down ritual I do the same way every time. Hot shower, no screens, dim everything, ten minutes of slow breathing, then a proper recovery sleep before I try to live the day. Same routine whether the night was quiet or hell. It tells my body the tour is over and it's safe to land. I get my days off back now. After all this time, that's no small thing.

---

## PHASE C4 — Rich Daily Plan (the "why pay" core)
Extend `PlanRecommendation['type']` with **6 new modules** (keep the 7
existing). Each = title + one-liner (with personalized `{{placeholder}}`)
+ detail + WHY copy + personalization rules + when_shown gating. Full spec
(science-grounded) authored — implement into the plan engine + `WHY_BY_TYPE`
+ i18n `plan.why_card.<type>` (12 locales).

New module types:
1. `caffeine_timing` — strategic dosing (front-load + tactical 03:00 dose), not just cutoff.
2. `anchor_sleep` — fixed 4h block for fast rotators (continental / 3x12 / 24-48).
3. `recovery_sleep` — capped post-night morning sleep + "this is the plan, not failing".
4. `environment` — Sleep Cave: blackout + ~18°C + noise-mask (heaviest for day-sleepers).
5. `movement` — exercise window timed to active phase, gentle within 2h of sleep.
6. `social_sync` — protected family/social window (+ alcohol caution folded in).

Gating: a day surfaces **6–8 cards** ordered by time-of-day (a timeline,
not a checklist). `when_shown` matrix by day type (pre-night / night /
recovery / day-shift / off-day / transition) — see research doc. Personalize
on `profession × schedule × chronotype × caffeineSensitivity × kids`.
Derive helpers: `anchorSleepForSchedule`, `recoverySleepPlan`,
`environmentForBlock`, `movementWindowForShift`, `socialWindowForDay`.

This is what turns "two timestamps" into "my whole day, and why."

---

## PHASE C5 — Sleep Library (deep, browsable, absorbing)
New `LibraryArticle` model (richer than the 1-line `SleepTip`): id,
category, title, hook, body (180–260 words), readMin, relevantTo[],
keyTakeaway, source. **16 articles** in 5 categories:
- **Light & Your Clock** — drive-home sabotage, light = master switch, light box at 3am
- **Caffeine & Stimulants** — half-life (6pm coffee at midnight), strategic dosing/caffeine-nap, alcohol's REM cost
- **Sleep Architecture** — 90-min cycle & alarm timing, 20 vs 90 nap (avoid 45), core-temp thermostat
- **Surviving Night Shift** — anchor sleep, split/biphasic, eating at 3am, melatonin (what it is/isn't)
- **Recovery & Social Life** — post-night recovery, social jetlag, wind-down ritual
All copy authored (research-backed, wellness-framed, source pills). Build:
`lib/sleep-tips/library.ts` corpus + i18n `tips.lib.<id>.*` + richer /tips
grid (category filter + read-time) + an article-detail route. Covers use
gradient/glass placeholders (owner supplies art later).

---

## PHASE C6 — Ripple to Today / Schedule / Profile
- **Today**: Stories hero with avatars (C3); a contextual "Tonight's read"
  Library card; richer plan-preview.
- **Sleep Plan tab**: renders the 6–8 rich cards (C4); link into Library.
- **Schedule**: surface the transition/anchor context per upcoming shift.
- **Profile**: avatar done (B3a); add "my story" entry + saved articles.

## Process
- One phase at a time, commit per logical unit (Rule 0), push to main.
- Verify each on the recreated sim (offline Metro) — owner tests after.
- tsc + jest + i18n-coverage stay green; add tests for new derive helpers.
- Full research outputs (module spec, stories, article corpus) captured by
  the 3 research agents on 2026-06-01 — source of truth for the copy.
