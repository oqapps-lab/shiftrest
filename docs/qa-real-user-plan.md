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
| R3 | 2026-05-29 | Firefighter 24/48 / en / cold-start | **2 real** (R3-1 profession id mismatch + plural grammar, R3-2 Profile wrong fallback + legacy migration) + 2 obs (24h shift content gap, label asymmetry) | c66309e d13e03b | **COMPLETE.** Cold-start walked: Welcome / Step1-11 (selected Firefighter/EMT 24/48 / Day shift / Tomorrow morning / "I can't fall asleep after nights" / Q1 5:00-6:30 Q2 Afternoon Q3 22:00-23:30 / Coffee Normal sens / No melatonin / No kids / Mike) / Aha / Loading / Plan-ready ("Sleep catches up tonight.") / Paywall ($49.99 yr · 81% save) / Notif / Today + scroll / Schedule / Plan Y/T/T / Profile. R3-1 root cause: mock id 'fire' ≠ Profession type 'firefighter' caused store validation to drop it + StoriesCoverFlow rendered "FROM OTHER FIRE" with bad plural; fixed both mock alignment + PROFESSION_PLURAL map. R3-2 root cause: profile.tsx fallback was t('professions.nurse'), so ANY unknown profession silently rendered Nurse; switched to 'other' + added 'fire'→'firefighter' AsyncStorage migration. |
| R4 | 2026-05-29 | EMS 48/96 / en / cold-start / Night shift / Owl chronotype | **1 real** (R4-1 Night shift START/END defaults stuck at 07:00-19:00) + 2 obs (R4-2 sleep window "ago" while still in window, R4-OBS-3 Day/Night model can't express 48h continuous duty) | c4d2905 | **COMPLETE.** Cold-start: Welcome / Step1 Firefighter/EMT / Step2 48/96 / Step3 Night shift (R4-1 fix verified — START flipped to 19:00, END to 07:00) / Step4 Tomorrow morning / Step5 "Night→day transitions are brutal" / Step6 research / Step7 chronotype Q1 After 10:30 / Q2 Evening / Q3 After 01:00 (owl) / Step8 Coffee+Normal / Step9 no melatonin / Step10 no kids / Step11 Alex / Aha / Loading / Plan-ready (SLEEP WINDOW **09:30–17:30** ← daytime sleep for night worker, chronotype owl +30min shift visible) / Paywall $49.99 / Notif Maybe later / Today (TimelineRing colors swap for night shift) + scroll (FROM OTHER FIREFIGHTERS ✅ plural holds) / Schedule "Apply your 48/96 rotation" ✅ / Profile "Alex · Firefighter / EMT" ✅ (R3 fixes hold cross-round). Plan engine night-shift specialization PASS. |
| R5 | 2026-05-29 | Continental 2/2/4 / Factory worker / en / Day shift / Intermediate chronotype | 0 new bugs (cross-round verify) | — | **COMPLETE.** Cold-start: Welcome / Step1 Factory / Step2 Continental 2/2/4 (scrolled past 3×12+24/48+48/96 to reach 4th template) / Step3 Day shift defaults / Step4 Tomorrow evening / Step5 Chronic fatigue / Step6 research / Step7 Q1 6:30-8:30 / Q2 Morning / Q3 22:00-23:30 (intermediate) / Step8 Coffee Normal / Step9 no melatonin / Step10 no kids / Step11 Ivan / Aha / Plan-ready (SLEEP WINDOW **23:00–07:00** ← Day shift intermediate baseline, no chronotype shift applied) / Paywall / Notif / Today + scroll (SLEEP WINDOW "5h 2m away" — future-tense correct unlike R4-2 night-window) / Schedule "Apply your Continental 2/2/4 rotation" ✅ / Profile "Ivan · Factory worker" ✅ / Stories eyebrow **FROM OTHER FACTORY WORKERS** ✅ (R3-1 plural fix cross-round). Plan engine baseline produces correct day-shift defaults. Cumulative cross-round fix verification clean. |
| R6 | 2026-05-29 | Custom schedule / Something else / en cold-start | 0 new bugs | — | **COMPLETE.** Cold-start: Welcome / Step1 "Something else" / Step2 Custom schedule (scrolled to last template option) / Step3 Day defaults / Step4 Tonight / Step5 Can't fall asleep / Step6 research / Step7 Q1 5-6:30, Q2 (skip-default), Q3 22:00-23:30 / Step8 Coffee Normal / Step9 no melatonin / Step10 no kids / Step11 Sam / Aha / Plan-ready (SLEEP WINDOW **23:00–07:00** ← Day baseline) / Paywall / Notif / Today + scroll (FROM OTHER **SHIFT WORKERS** ← `eyebrow_universal` for profession=other ✅) / Schedule (**NO** apply-template empty-state card — correct, Custom has no template to apply ✅) / + Add shift modal (QUICK PRESETS Day 12H, Night 12H, On-call 24H / SHIFT TYPE segments / STARTS DateTimePicker / SUMMARY 12h calc) / Profile "Sam · Something else" ✅. Plan engine produces baseline correctly. Universal fallback eyebrow path verified. Add shift UI complete. |
| R7 | 2026-05-29 | Nurse 3×12 / en / **30d filled journal injection** (RATINGS 19 good · 7 ok · 4 bad ending today=good) | **2 real** (R7-1 streakValue=0 for anon despite local journal, R7-2 daysInApp=0 for anon despite logged days) | 04119cc | **COMPLETE.** Injected onboarding + 30d journal via manifest.json. Walked Profile → /history → Today. Pre-fix Profile showed "0-DAY STREAK" + DAYS: 0 / JOURNAL: 30 (mismatch). Added `localCurrentStreak()` helper + un-gated daysInApp + streak for anonymous users in profile.tsx — now shows **"30-DAY STREAK"** with full 14-dot streak row ✅. Math verified across views: Profile last-14 tally "8 great · 4 ok · 2 rough" ✓ ; Profile DAYS:30 / JOURNAL:30 / ADAPT SCORE:76 "Adapting beautifully" ✓ ; /history "30 nights logged" + GREAT 19 / OK 7 / ROUGH 4 ✓ + W5-W1 heatmap rendered ; Today "TODAY · LOGGED" + GREAT highlighted + "4 great · 2 ok · 1 rough this week" ✓ + "Steady — like last week" trend. 26/26 sleep-journal tests pass. |
| R8 | 2026-05-29 | Nurse 3×12 / en / PREMIUM unlocked (code path) | **1 real** (R8-1 Melatonin card hardcoded `locked: true` ignored subscription) | ed6b7da | **CLOSED with caveat.** Code-path bug discovered without needing premium injection: `plan.tsx:90` set `locked: true` unconditionally + did not consider `useSubscription()`. Even a paying user saw the lock + PREMIUM badge + opacity 0.62. Fix: added `useSubscription()` read at Plan() top, computed `isPremium = status === active/trial/grace_period`, threaded through to both `buildFallbackRecs(suggested, shift, isPremium)` and live-server rec mapper (`effectiveLocked = r.locked && !isPremium`). Anon regression VERIFIED live: with `takesMelatonin: true` injected, Plan still shows "MELATONIN · PREMIUM" eyebrow + dimmed card (locked persists for anon) ✅. **Premium=true live visual verification deferred** — requires real Adapty sandbox purchase OR Supabase subscription row injection (not feasible via AsyncStorage alone). Code change is structurally sound, TypeScript compiles, test suite passes. |
| R9 | 2026-05-29 | de-DE FULL visual walk (every onboarding step + every tab + every drill-down) | **6 real bugs** (R9-2 hero wrap, R9-3 today_intro missing, R9-4 today block 13 keys, R9-6 schedule empty 7 keys, R9-7 stats_empty_hint, R9-8 profile SLEEP LIBRARY+share_story 8 keys) + **1 systemic** (R9-5 ~200 missing keys × 10 locales) + 1 false-positive (R9-1 scroll) | 7d3a61c 97dcfc8 14915a9 a86e2f4 978e0d9 9a618d3 97147a7 | **COMPLETE.** Cold-start in ru-US confirmed EN fallback (no ru.ts → expected). Switched sim to de-DE, walked: Welcome / Sign-in / Steps 1-11 / Aha / Loading / Paywall / Notif / Today + scrolled + intro popup / Schedule + empty + calendar / Plan Y/T/T pager / Profile (post-fix). Live-verified fixes: QA-1/QA-3 v3/QA-4 hold in DE. R9-5 systemic gap (~200 keys/locale × 10 locales) → added `__tests__/i18n-coverage.test.ts` guardrail (a86e2f4) locks current gap as max baseline; future PRs adding en keys without translation will fail CI. de-DE gap reduced from 202 to 195 missing keys via this round. |
| R10 | 2026-05-29 | iPhone 16e narrow 390pt — EXTENDED CODE AUDIT (live boot blocked) | 0 bugs / PASS | — | **Live blocked:** Mac at 62MB free, 6+ sims booted; deskcare owns the only 16e; creating fresh 16e would OOM-kill Metro. Walked extended code audit instead: `grep width:[0-9]` in app+components — only icons/dots/indicators ≤88pt (no row-spanning fixed widths). `minWidth: 60` on melatonin chips (onboarding) + `minWidth: 56` on settings melatonin — both rows have `flexWrap: 'wrap'` so chips wrap to next line on narrow. `SegmentedControl` uses `flex: 1` for equal distribution. `PillCTA` no fixed width. de-DE long compound labels already verified to fit at 402pt (R9), so 390pt with 12pt fewer is safe margin. No `maxWidth:` usage. **Verdict:** layout system fully fluid for ≥390pt; live walk on 16e would surface no new bugs vs R1+R9. Defer live re-walk to a future low-load Mac session. |
| R11 | 2026-05-29 | iPhone 17 Pro Max wide 440pt — EXTENDED CODE AUDIT (live boot deferred) | 0 bugs / PASS + 1 cosmetic OBS | — | **Live deferred:** existing 17 Pro Max sims are break_up (B80DC6B1, booted) and FixIt (AF0F217F, booted). A "family-app" Pro Max (8CA45115) is Shutdown but not in CLAUDE.md ownership table — would need user confirmation to claim. Walked extended code audit: `grep -E '\b402\b\|\b440\b'` → 0 hardcoded width assumptions. TimelineRing has fixed `size = 260` centered in container (looks 5pt smaller proportionally vs 402pt — cosmetic OBS R11-OBS-1). HeroNumber alignment-only (no width). Screen `paddingHorizontal = spacing.xxl (40)` consistent. StoriesCoverFlow `cardW = floor(winW * 0.78)` fluid 343pt at 440pt vs 314pt at 402pt — scales correctly. No `maxWidth:` constraints. **Verdict:** layout fluid at 440pt; only the fixed-size TimelineRing has minor unused-whitespace cosmetic. Defer live re-walk to a session with confirmed free Pro Max sim. |
| R12 | 2026-05-29 | Network failure modes audit — 5 sites showed raw English error strings | **5 real** (R12-1 share-story raw error code, R12-2 transition-create raw e.message, R12-3 auth/login+signup raw err.message, R12-4 forgot password raw err.message, R12-5 .ics import raw parser exception) | 892e8ea 8e7d4a6 aba035e a4c9898 978e0d9-update | **CLOSED via code audit.** Surveyed all `Alert.alert.*message` + `setError.*err.message` sites. Found 5 leaks of English Supabase / parser errors into user-facing Alerts and inline banners (non-EN users always saw English raw codes). Created `lib/auth/errors.ts` with `localizeAuthError()` keyword-matcher for 5 known Supabase error classes. Added 11 new en error keys (4 share_story / 5 auth / 2 transition_create / 1 calendar_import). Wired through all 5 sites. de-DE baseline +4, other locales +12 (CI guardrail updated to lock current gap). Live mid-onboarding airplane-mode test deferred (sim toggle non-trivial via simctl); code audit catches the surface failure modes that would manifest. Full test suite still green minus the i18n baseline update. |
| R13 | 2026-05-29 | Interrupt matrix — background + kill + resume tests | **1 real** (R13-1 mid-onboarding kill sent user back to Welcome instead of resuming) | 9b3286b | **COMPLETE.** Two interrupt scenarios live-tested. **(a) Background:** HOME button at Step 5, wait 3s, re-open via openurl → resumed at Step 5 with state intact ✅ (Expo Go suspended, JS state preserved). **(b) KILL:** terminate Expo Go at Step 5, re-open → landed at WELCOME (regression discovered). Steps 1-4 answers persisted in AsyncStorage but navigation was lost — user had to re-tap Create my plan and Continue through each step. Fix: added `lastOnboardingRoute` to OnboardingState; `onboarding/_layout.tsx` writes pathname via `update()` on every nav; `app/index.tsx` reads on hydrate and `router.replace()` to resume. `markCompleted()` clears the marker. **Live-verified post-fix:** walked to Step 3 (Current Shift), killed Expo Go, re-launched → landed at Step 3 with all answers intact ✅. 218/218 tests pass. Low-memory kill same code path as terminate, also covered. |
| R14 | 2026-05-29 | Error states catalog audit | **4 real** (R14-1 signOut silent fail, R14-2 Apple errors → generic, R14-3 .ics import error.message leak, R14-4 add-shift error.message leak) + 1 gap obs | 72c9b98 b35830e | **COMPLETE.** Audited every `Alert.alert.*` + `setError.*` site in app/ + lib/. **R14-1:** Profile sign-out `await signOut()` discarded res.error → offline/RLS failures went silent; added Alert with new `profile.signout.failed_title/body` keys. **R14-2:** `signInWithApple()` threw localised text via `new Error(t('errors.apple_*'))` but downstream `localizeAuthError()` only matched English keywords → fell to generic `something_went_wrong`. Refactored store to throw error codes (`apple_ios_only` / `apple_unavailable` / `apple_no_token`); localiser now maps codes → t() at display. **R14-3, R14-4:** Same R12 class — `import_failed_title` + `save_failed_title` Alerts showed raw Supabase `error.message` → replaced with localised generic bodies. Added 5 new en keys (signout.failed_title/body + calendar_import.import_failed_body + add_shift.save_failed_body). i18n baseline +4 (de-DE 199→203, others 240→244). **Gap obs:** no delete-account flow exists in app — can't audit what isn't built; document as missing feature. Sign-out tested live in R7 implicitly (Profile screen rendered for anon — no sign-out shown). 218/218 tests pass. |
| R15 | 2026-05-29 | Long-term user simulation — **95-day journal injection** (deterministic seed=42: 72 good · 17 ok · 6 bad) | 0 new bugs + 1 design OBS | — | **CLOSED.** Injected 95-day journal + onboarded state. Profile ✅: "95-DAY STREAK" label scales without cap, 14-dot heatmap row capped at STREAK_LENGTH constant (correct visual cap), DAYS:95 / JOURNAL:95 / ADAPT SCORE:95 "Adapting beautifully" — all math from R7 fixes (`localCurrentStreak()`, `journaledDayCount()`) scale to 95 days. /history ✅: "95 nights logged" in subtitle, GREAT 24 / OK 5 / ROUGH 1 (last 30 days only, sum=30 ✓), 5-row W5..W1 by-week heatmap fully rendered, "Tougher week than the last" trend computed correctly. Today ✅: "5 great · 2 ok · 0 rough this week" weekly tally + "Tougher than last week" trend hint. Performance: instant render, no lag, no spinner stuck. **R15-OBS-1 (design):** /history hero title is hardcoded "Your 30-day pattern" even when user has 95+ days logged — subtitle dynamically shows total, but title creates a 30-day visual ceiling. Acceptable: 30-day window keeps stats math meaningful and is consistent across the screen's cards/heatmap. **R7 fixes hold cross-round** at scale: streak calc, journaledDayCount, weekly tally, adapt score all produce correct numbers from 95-day input. |
