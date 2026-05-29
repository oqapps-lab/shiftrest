# ShiftRest — Real-User QA Plan

**Цель:** прогнать прилу как реальный пользователь (не как тест-агент),
покрыть state matrix × profile matrix × locale matrix × device matrix.

**Sim:** AF4951D7-668C-46F6-8FA1-0C564F0B7765 (iPhone 17 Pro)
**Метро:** 8081
**Branch:** `qa-real-user-pass-<date>` (создаётся на каждый round)

## Round structure

Каждый раунд — это **1 профиль × 1 локаль × 1 state matrix** прогон от
Welcome до Profile с фокусом на ONE specific failure mode. Раунд занимает
~25-35 минут (Metro warm + AsyncStorage reset + walk + screenshots).

## Round backlog (приоритет ↓)

### R1 — Nurse 3×12 / en / cold-start / network-online (BASELINE)
- ✅ already done 2026-05-29

### R2 — Nurse 3×12 / **ru** / cold-start
- Покрытие: i18n fallback chain (ru → en), длинные русские строки
  в CTA/headers
- Spot: "Maybe later" → "Может быть позже" — overflow на 402pt?
- Spot: chronotype quiz Q1-Q3 русские варианты — wrap?

### R3 — Firefighter 24/48 / en / cold-start
- Покрытие: nextShift logic с 48h off-period, transition plan
  generation для 24h shifts
- Spot: добавление shifts в Schedule (24h vs 12h render)
- Spot: caffeine cutoff calc когда сон = 8AM (post-night)

### R4 — EMS 48/96 / en / cold-start
- Покрытие: longest-off pattern, Light therapy windows на 96h gap

### R5 — Continental 2/2/4 / en / cold-start
- Покрытие: rotating-shift pattern engine, schedule generation
  для 8-day cycle

### R6 — Custom schedule / en / cold-start
- Покрытие: custom Schedule pattern UI (week-builder)
- Spot: edge cases — all-off week, all-on week

### R7 — Nurse 3×12 / en / **filled history** (30 days)
- Inject: 30 mood entries, 5 transition plans, journal data
- Покрытие: heatmap render with data, Adapt Score calculation,
  streak counter > 0
- Spot: history page calendar with mixed GREAT/OK/ROUGH

### R8 — Nurse 3×12 / en / **PREMIUM unlocked**
- Inject: Adapty premium state
- Покрытие: Melatonin card unlocked (no lock icon), multi-day
  transition plans visible
- Spot: paywall not shown post-purchase

### R9 — **de-DE locale visual walk** (any profile)
- Покрытие: compound noun overflow that string-length diff missed
- Spot: bottom-tab labels in German (HEUTE / KALENDER / SCHLAFPLAN / PROFIL)
- Spot: chronotype quiz options in German

### R10 — **Narrow device (iPhone 16e 390pt)** — Nurse 3×12 / en
- Boot dedicated sim "iPhone 16e — QA Narrow"
- Покрытие: 12pt narrower than baseline reveals tight chip rows,
  long button labels truncating
- Spot: melatonin chip row (0.5 / 1 / 3 / 5 / 10) at 390pt

### R11 — **Wide device (iPhone 17 Pro Max 440pt)** — Nurse 3×12 / en
- Boot dedicated sim "iPhone 17 Pro Max — QA Wide"
- Покрытие: 38pt wider than baseline — excessive whitespace,
  centered content stretched
- Spot: HeroNumber on Welcome looks lost?
- Spot: TimelineRing on Plan — ratio scales correctly?

### R12 — **Network failure modes** — Nurse 3×12 / en
- Airplane mode on at various points:
  - mid-onboarding (does state survive?)
  - on Aha screen (does loader stick? timeout? graceful?)
  - on Paywall (does Adapty fail visibly?)
- Spot: offline write queue (mood entry while offline → flushed online?)

### R13 — **Interrupt matrix** — Nurse 3×12 / en
- Background app mid-onboarding, return after 1 min → which step?
- Lock screen during loading 0→100% counter — does it pause/resume?
- Low memory kill mid-onboarding — state recovered?

### R14 — **Error states catalog**
- Auth: wrong password → error message render?
- Auth: email already registered → message?
- Settings → Sign out → goes to Welcome cleanly?
- Settings → Delete account (if exists) → confirmation flow?
- Import .ics — broken file → error toast?

### R15 — **Long-term user simulation**
- Inject 90+ days of history with mixed streaks, transitions, missed days
- Verify Adapt Score evolution, longest streak, "Insights" if exists
- Spot: heatmap perf on 90 days, scroll smoothness

## Each round produces

1. Screenshot pack `/tmp/qa_r<N>_<screen>.png` for every screen
2. Bug list with severity (CRITICAL/HIGH/MEDIUM/LOW/CONCERN)
3. Commit `qa-r<N>: <one-line>` per fix (Rule 0)
4. Round-closure note in this doc

## Tools

- Sim drive: `mobilecli io tap/swipe/text` + `xcrun simctl openurl`
- Screenshot: `~/.claude/bin/ios-shot <UDID> /tmp/qa_r<N>_<screen>.png`
- State inject: write to AsyncStorage manifest at
  `~/Library/Developer/CoreSimulator/Devices/<UDID>/data/Containers/Data/Application/*/Documents/ExponentExperienceData/@oqapps/shiftrest/RCTAsyncLocalStorage/manifest.json`
- Locale switch: edit `SCREENSHOT_OVERRIDE` in `lib/i18n/index.ts` +
  Metro restart with `--clear`

## Anti-drift gates (per ui-qa skill)

Per round before claiming "done":
1. **M1**: All round todos `live-verified` not just `completed`
2. **M2**: Forbidden phrases pre-100% — "round done", "✅ round closed"
3. **M3**: Closure ratio line: `<found> · <fixed> · <verified%>`
4. **M4**: Default = continue. Stop only on explicit user signal.
5. **M5**: New finding → reopens earlier "completed" round if same area
6. **M6**: Mid-round self-audit at ~10 tool calls

## Schedule

- One round per work session
- 15 rounds × ~30 min = ~7.5 hours total
- Distributed across multiple sessions (each session = 1-3 rounds)

## Round log

| # | Date | Profile / locale / state | Bugs found | Fix commits |
|---|------|--------------------------|------------|-------------|
| R1 | 2026-05-29 | Nurse 3×12 / en / cold-start | 4 (QA-3 v3, QA-4, QA-5 fp, QA-1 prior) | f3e2817 5d3a9bb 4faa78b 83de2d5 f7badd4 |
| R2 | TBD | Nurse 3×12 / ru / cold-start | — | — |
| R3 | TBD | Firefighter 24/48 / en | — | — |
| R4 | TBD | EMS 48/96 / en | — | — |
| R5 | TBD | Continental 2/2/4 / en | — | — |
| R6 | TBD | Custom schedule / en | — | — |
| R7 | TBD | Nurse / en / 30d history | — | — |
| R8 | TBD | Nurse / en / PREMIUM | — | — |
| R9 | 2026-05-29 | de-DE visual walk (partial 9/11 + 2 hot screens) | 1 real (R9-2 hero wrap), 1 false-positive (R9-1 scroll) | 7d3a61c | NOTE: Metro OOM-killed twice mid-walk; Mac running 6 sims. Walked: Welcome / Sign-in / Step1-9 (Profession/Schedule/CurrentShift/NextShift/Problem/Research/Chronotype/Caffeine/Melatonin). Verified live: QA-3 v3 + QA-4 fixes hold in DE. R9-2 fixed code-only, not re-visually-verified due to Metro outage. Remaining: Step10 Family (post-fix), Step11 Name, social-proof×2, Aha, Loading, Paywall, Notif, Today, Schedule, Plan, Profile, Settings — all need re-run when Mac frees up. |
| R10 | TBD | iPhone 16e narrow | — | — |
| R11 | TBD | iPhone 17 Pro Max wide | — | — |
| R12 | TBD | Network failure modes | — | — |
| R13 | TBD | Interrupt matrix | — | — |
| R14 | TBD | Error states | — | — |
| R15 | TBD | Long-term user (90d) | — | — |
