# App Store Connect — drop-in listing for ShiftRest v1.0

Single-file copy/paste reference for filling out the App Store Connect listing
once the app is created in ASC. **All fields below are FINAL** — pulled from
`aso/metadata/en-US.md` v1.2 (rev. 2026-05-02).

> **Workflow**: ASC web UI is required for the initial app creation (Apple's
> ASC API does not allow `POST /v1/apps` — confirmed live, 403 FORBIDDEN_ERROR).
> Once the app exists, the rest of the metadata can be pushed via API.
> See `memory/project_asc_metadata_pending.md` for the API push procedure.

---

## 1 · App creation dialog (one-time, web UI)

| ASC field | Value |
|---|---|
| Platforms | iOS only |
| App Name | `ShiftRest: Sleep for Shifts` |
| Primary Language | English (U.S.) |
| Bundle ID | `com.gazetastreet.shiftrest` (already registered, ASC id `757MYZ424L`) |
| SKU | `shiftrest-001` |
| User Access | Full Access |

After **Create**, status will be "Prepare for Submission". Version 1.0
auto-creates. Now everything below can be filled — manually or via API.

---

## 2 · App information (per locale, en-US default)

### Name (30 chars max)

```
ShiftRest: Sleep for Shifts
```
**27 / 30** chars. Recommended winner per `aso/metadata/en-US.md` §v1.2.
Backup if EMRE KEP brand-squat starts gaining traction: `Restwell: Shift Sleep Plan` (26 chars).

### Subtitle (30 chars max)

```
Circadian sleep planner
```
**23 / 30** chars. Claims `circadian rhythm` head term (T=62, CI=7.93)
combinatorially with keyword field `rhythm`.

### Privacy Policy URL

```
https://oqapps.pro/shiftrest/privacy
```
> Live after `vercel deploy --prod` of `oqapps/site/`. The page exists at
> `oqapps/site/shiftrest/privacy.html` — pending deploy.

### Category

| Slot | Category |
|---|---|
| Primary | Health & Fitness |
| Secondary | Lifestyle |

### Content Rights

> "Does your app contain, show, or access third-party content?"

**No** (we don't ship third-party media).

---

## 3 · Pricing & Availability

| ASC field | Value |
|---|---|
| Price tier | Free |
| Availability | All territories |

In-app purchases (added via the **In-App Purchases** section, see §6 below):
| Product | Type | Price |
|---|---|---|
| `shiftrest.premium.monthly` | Auto-renewable subscription | $5.99 / month |
| `shiftrest.premium.yearly` | Auto-renewable subscription | $49.99 / year |

Both belong to subscription group `shiftrest_premium`. 7-day free intro trial.

---

## 4 · Version 1.0.0 — App Store info

### Promotional Text (170 chars max — NOT indexed, instant-update)

```
New: ShiftRest is here. The first sleep planner that doesn't punish you for sleeping at noon. Built with circadian science (AASM, NASA, CDC). 7 days free.
```
**154 / 170** chars. Variant 1 (Launch). Rotate to Variant 2 in weeks 7–12,
Variant 3 after 100+ ratings.

### Description (4000 chars max — NOT indexed, conversion-only)

```
Sleep Cycle gives you a red score every time you sleep at 10 AM. ShiftRest is the only sleep planner for shift workers that doesn't punish you for sleeping at noon. Built for 22 million nurses, firefighters, and EMS who don't work 9-to-5.

WHY SHIFTREST IS DIFFERENT
- It's a planner, not a tracker. We don't score your sleep. We tell you when to sleep.
- Schedule-first. Type your rotation. Get a sleep window tuned to your shift, not a generic 10pm-6am bedtime.
- No red scores for daytime sleep. No "you missed your goal" notifications at 3 AM. No moralizing.
- Built on circadian science: AASM clinical guidelines, CDC NIOSH shift-work data, NASA chronotype research, Phase Response Curve algorithms.

WHAT YOU GET
- Personalized sleep window — tuned to your specific rotation (3x12, 24/48, continental, custom). The window moves with you.
- Melatonin timing by chronotype — not a generic "take 3mg at 9pm." The PRC algorithm calculates your circadian phase shift and tells you the exact window.
- Caffeine cutoff by sensitivity — slow metabolizers get 8 hours, fast metabolizers get 4. We ask, we adapt.
- Transition plans for rotating shifts — multi-day plans for night-to-day and day-to-night flips. When to nap. When to expose to morning light. When to skip melatonin. The killer feature competitors don't have.
- Light and dark protocol — when to wear blue-blockers, when to seek bright light, when to nap before a night shift.
- Always-free baseline — schedule input, basic sleep window, generic caffeine cutoff. Never paywalled.

WHO IT'S FOR
- ICU and ER nurses on 3x12 night rotations.
- Firefighters and EMS on 24/48 or 48/96 schedules.
- Factory workers on continental 2-2-4 patterns.
- Pilots, oil-rig crews, doctors on call, anyone whose body is asked to do something the sun didn't agree to.

NOT FOR
- 9-to-5 office workers (try Sleep Cycle, RISE, or Pillow).
- People looking for a sleep tracker score.
- Anyone who wants their app to scold them at 7 AM.

THE SCIENCE
ShiftRest is built on AASM (American Academy of Sleep Medicine) clinical guidelines for shift work disorder, CDC NIOSH research on rotating shifts, and Phase Response Curve algorithms used by NASA for crew chronobiology. We don't make medical claims — we apply established circadian science to your real schedule.

PRICING
- Free forever: schedule input, basic sleep window, generic caffeine cutoff.
- 7-day free trial of Premium, then:
  - Monthly $5.99
  - Annual $49.99 (save 35%)
- Cancel anytime in your Apple ID settings. No fine print.

NOT A MEDICAL DEVICE
ShiftRest supports sleep planning for shift workers. It does not diagnose, treat, or cure sleep disorders. If you suspect shift-work sleep disorder, insomnia, or sleep apnea, consult a board-certified sleep physician. If you are in crisis, contact 988 (US), 116 123 (UK), or 13 11 14 (AU).

PRIVACY
Your schedule and sleep data stay on your device or in your encrypted account. We do not sell data. HealthKit integration is opt-in.

— —

You've worked the night shift for 12 years. You know your body. You don't need another app to tell you sleep is important. You need an app that respects that you sleep at noon — and helps you do it well.

Rest catches up, gently.
```
**~3 360 / 4 000** chars. First 225 chars (above-the-fold) cover hook + differentiator + audience size.

### Keywords (100 chars max — comma-separated, no spaces)

```
night,nurse,firefighter,paramedic,emt,rotating,melatonin,caffeine,chronotype,nap,jetlag,rhythm
```
**94 / 100** chars. Brand `shiftrest`, descriptors `sleep`/`shifts`/`plan` already
claimed via Name + Subtitle, so excluded from this field per playbook §1
(no duplication across slots).

### What's New in This Version (4000 chars max)

```
Welcome to ShiftRest.

This is v1.0 — the day ShiftRest opens to nurses, firefighters, and EMS who work shifts the sun didn't agree to.

What's in this release:
- Schedule-first sleep planning. Type your rotation (3x12, 24/48, continental, custom). Get a sleep window tuned to your shift.
- Melatonin timing by chronotype. The PRC algorithm calculates your circadian phase, not a generic "take 3mg at 9pm."
- Caffeine cutoff by sensitivity. Slow metabolizers get 8 hours, fast metabolizers get 4.
- Transition plans for rotating shifts. Multi-day plans for night-to-day and day-to-night flips — when to nap, when to expose to light, when to skip melatonin.
- No red scores. No moralizing. No "you missed your goal" at 3 AM.
- Always-free baseline: schedule + basic sleep window + generic caffeine cutoff. Never paywalled.

A note from the team:
We built ShiftRest because Sleep Cycle gave Marina (an ICU nurse, our first user) a red score every time she slept at 10 AM after a 12-hour night shift. Existing apps assume a 10pm bedtime. Yours doesn't have one. Now neither does ours.

7 days free. Then you decide.

Questions, bugs, feature requests: shiftrest.app/support
```
**~1 090 / 4 000** chars. Reuse for v1.0.0, v1.0.1, v1.0.2.

### Marketing URL

```
https://oqapps.pro/shiftrest/
```

### Support URL

```
https://oqapps.pro/shiftrest/support
```

### Copyright

```
© 2026 OQapps · Evgeny Agafonov
```

---

## 5 · Age rating (Apple's questionnaire)

12+ predicted (medical/treatment information). Pre-fill these answers — review and adjust if Apple flags something:

| Question | Answer |
|---|---|
| Cartoon or fantasy violence | None |
| Realistic violence | None |
| Prolonged graphic / sadistic violence | None |
| Profanity or crude humor | None |
| Mature/suggestive themes | None |
| Horror/fear themes | None |
| Medical / treatment information | **Infrequent / Mild** ★ (we provide sleep guidance) |
| Alcohol, tobacco, or drug use | None |
| Simulated gambling | None |
| Sexual content / nudity | None |
| Unrestricted web access | No |
| Gambling | No |
| Contests | No |
| Made for Kids | **No** |

★ Why "Mild" not "Frequent": we never prescribe medication; melatonin/caffeine
guidance is functional (when), not dosed (how much). Phase Response Curve
suggestions are framed as schedule planning, not medical treatment.

---

## 6 · In-App Purchases (subscriptions)

Create both inside subscription group **`shiftrest_premium`**.

### `shiftrest.premium.monthly`

| Field | Value |
|---|---|
| Reference Name | ShiftRest Premium · Monthly |
| Product ID | `shiftrest.premium.monthly` |
| Subscription Duration | 1 month |
| Cleared for Sale | Yes |
| Price (US) | $5.99 (Tier 6) |
| Free Trial | 7 days |
| Display Name | Premium Monthly |
| Description | Full circadian plan, transition plans, unlimited shifts, longer history |

### `shiftrest.premium.yearly`

| Field | Value |
|---|---|
| Reference Name | ShiftRest Premium · Yearly |
| Product ID | `shiftrest.premium.yearly` |
| Subscription Duration | 1 year |
| Cleared for Sale | Yes |
| Price (US) | $49.99 (Tier 50) |
| Free Trial | 7 days |
| Display Name | Premium Yearly |
| Description | Best value · save 35% vs monthly |

### Subscription group localization (en-US)

```
ShiftRest Premium
Full circadian sleep planning, transition plans for rotating shifts, and unlimited shift history.
```

---

## 7 · App Review Information

### Demo account credentials

```
Email:    review-tester@shiftrest.app
Password: AppleReview2026!
```
> **TODO before submission**: actually create this account in Supabase
> (`profiles` row with onboarding completed, an active trial, sample shifts
> for the next 14 days, a generated plan). See `docs/app-store-readiness.md`
> §5 for the seed-data script.

### Notes for reviewer

```
ShiftRest is a sleep planner for shift workers (nurses, firefighters, EMS).

To explore the full app:
1. Sign in with the demo account above (already onboarded).
2. The Today tab shows the current sleep plan and timeline.
3. The Schedule tab has 14 days of sample shifts — tap any date to see details, or "+ Add shift" to create one.
4. The Sleep Plan tab shows the daily plan; toggle YESTERDAY / TOMORROW for prior/next day.
5. The Profile tab leads to Settings — Sleep preferences (rotation/chronotype/caffeine/melatonin form), Notifications, Subscription, About.
6. Trial is active for 7 days — Premium features (full circadian plan, transition plans) are unlocked.

App is iOS-only. No special hardware needed.

Privacy policy: https://oqapps.pro/shiftrest/privacy
Support: https://oqapps.pro/shiftrest/support

Questions: gztstrt@gmail.com
```

### Contact info

| Field | Value |
|---|---|
| First name | Evgeny |
| Last name | Agafonov |
| Phone | (provide actual number in ASC, not stored in repo) |
| Email | gztstrt@gmail.com |

---

## 8 · App icon

**Status**: placeholder v2 (sage-leaf, archetype B per `aso/icons/archetype-brief.md`).
File: `assets/icon.png` (1024×1024).

For final pre-submission upload to ASC, export 1024×1024 PNG (no transparency,
no rounded corners — Apple rounds them). Adaptive variants for App Store:

| Slot | Size | Source |
|---|---|---|
| App Store icon | 1024×1024 | `assets/icon.png` |
| Apple Watch / Health icons | per Apple specs | not yet generated |

---

## 9 · Localization plan

en-US is shipped at v1.0. Additional locales (per `aso/metadata/`):
en-GB, de-DE, es-ES, fr-FR, it-IT, ja, ko, nl-NL, pt-BR, sv, zh-Hant.

Each has a complete drop-in pack ready. Strategy: ship en-US only at v1.0,
add locales in v1.1 once we have download data.

---

## 10 · Pre-submission cross-checks

Before tapping **Submit for Review** in ASC:

- [ ] App created in ASC, bundle ID linked to `com.gazetastreet.shiftrest`
- [ ] Privacy URL resolves (Vercel deploy of `oqapps/site/` done)
- [ ] Support URL resolves
- [ ] Marketing URL resolves
- [ ] Privacy policy in ASC matches `oqapps/site/shiftrest/privacy.html`
- [ ] At least 1 build uploaded to TestFlight (`eas build --profile production` + `eas submit`)
- [ ] Screenshots uploaded for at least 6.5" (1290×2796)
- [ ] Demo account credentials work for an Apple reviewer
- [ ] Age rating questionnaire submitted
- [ ] In-app purchases created and "Ready to Submit"
- [ ] App icon 1024×1024 uploaded (no alpha, no rounded corners)
- [ ] Cancel-anytime line is in description (it is — line 38)
- [ ] NOT-A-MEDICAL-DEVICE disclaimer is in description (it is — line 36)
- [ ] Crisis hotlines listed (988 / 116 123 / 13 11 14)
