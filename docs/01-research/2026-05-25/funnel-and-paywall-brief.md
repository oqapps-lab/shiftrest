# ShiftRest — Funnel, Paywall, Onboarding Brief

**Source:** parallel deep-research session 2026-05-25 (Reddit-equivalents + competitor reviews + medical lit + RevenueCat + Adapty 2026 data).

This brief is the authority for **G1 (next-shift onboarding)**, **E1-E3 (paywall + StoreKit + localized prices)**, and supporting ASO/copy decisions.

## TL;DR — what changes in this session

1. **Onboarding: ALWAYS ask next-shift** (Tonight / Tomorrow AM / Tomorrow PM / Day after / On break) — single most actionable data point, powers the "personalized plan reveal" aha-moment.
2. **Paywall: drop monthly OR keep at $9.99 (per owner) with Annual as auto-selected anchor.** Annual MUST visually dominate with "Save 81%" badge.
3. **Trial: 3-day** (RevenueCat data: 1.5× LTV vs 7-day, and matches typical &lt;72h-to-next-shift cycle).
4. **Free-tier:** today's hero card + shift schedule editor + generic articles. Locked: 7-day plan, recovery debt, family window, anchor-sleep coach.
5. **Refund clarity line** under paywall CTA: "Cancel anytime in Settings → Subscriptions. We never email asking you to come back." Directly addresses #1 complaint about RISE.

## Top-5 shift-worker pain points (ranked)

1. **"Can't fall asleep when I get home"** — melatonin timing + light-blocking the moment they walk in
2. **"First night back kills me — 3-4 AM wall"** — 36-48h pre-shift transition plan (anchor sleep + light pulse + nap windows)
3. **"Permanent jet lag, never recover"** — "Recovery debt" tracker
4. **"Family treats me like a ghost"** — social-window planner (2-3h/wk slots when they'd realistically be awake + present)
5. **"Scared of killing myself / my patients"** — Health Risk Index, framed positively ("clear in X days")

## Competitor gaps (where existing apps fail shift workers)

- **A** — Schedule input broken (AutoSleep tells users to manually set "Night Hour"; RISE has no rotation field at all)
- **B** — No actionable timing ("take 1mg at 7:42 AM today" doesn't exist in Sleep Cycle/Pillow/AutoSleep)
- **C** — First-night-back invisible (no app surfaces the 36h prep plan)
- **D** — No family/social integration
- **E** — Generic apps (Calm/Headspace) at $69.99/yr offer zero shift-specific content
- **F** — Cancellation pain (RISE locks unsubscribe, charges after trial cancel)

## ShiftRest funnel — opinionated screen sequence

1. Splash (2s)
2. **Profession picker** — Nurse / FF / EMS / Police / Factory / Trucker / Other (branches plan templates)
3. **Shift pattern** — 3×12 day / 3×12 night / 3×12 rotating / 24/48 / 48/96 / DuPont / Pitman / Continental / Variable
4. **Next-shift** — Tonight / Tomorrow AM / Tomorrow PM / Day after / On break ← **G1 implements this**
5. **Sleep struggles** (multi-select) — Can't fall asleep / Can't stay awake at 4 AM / First night back is brutal / Family complains / Recovery slow
6. **Light environment** — bedroom darkness (3 options) — drives first free advice
7. **Permissions** — framed as "we'll send the exact minute to take melatonin"
8. **"Analyzing your circadian profile…"** loader (3-5s) — Adapty proven pattern
9. **PLAN REVEAL (aha):** "Your next shift starts in 14 hours. Take melatonin at 9:47 PM. Cut caffeine by 2 PM tomorrow. Sleep window: 11 PM–6:30 AM."
10. **SOFT PAYWALL** with skip X visible — sell the next-shift plan, not "premium features"
11. If skipped → free zone with hard paywall at next plan refresh

Stay ≤ 12 screens. Anything over loses 13%+ conversion (Adapty).

## Paywall tiers (final)

| Tier | Price | Trial | Notes |
|---|---|---|---|
| **Weekly** | $4.99/wk | 3-day | RC 2026 sweet spot is $5.99; $4.99 is more competitive |
| Monthly | $9.99/mo | — | Owner's call. Research recommended dropping or raising to $14.99 — keeping $9.99 |
| **Yearly** | $49.99/yr | — | **AUTO-SELECT, biggest card, "BEST VALUE · Save 81%" badge** |

Defer: Lifetime $129.99 as winback-only tier on second-visit (5% take-rate could lift ARPU $6.50). Not in this build.

## Mandatory paywall copy elements

- "Cancel anytime in Settings → Subscriptions. We never email asking you to come back." (small text under CTA)
- Auto-renewal disclosure (Apple 3.1.2(c)) — already there
- Restore Purchases button — already there
- ToS + Privacy inline links — already there
- Show exact charge date + amount before confirm tap

## Honest social-proof claims (with study citations)

1. "Up to 78% of nurses experience sleep disorders." → BMC Nursing 2024 [Springer 10.1186/s12912-024-02651-z]
2. "Sleep-deprived nurses are 3× more likely to make patient care errors." → PSNet/AHRQ
3. "30% of shift workers develop Shift Work Sleep Disorder." → ICSD via PMC8007770
4. "Firefighters sleeping &lt;6h have 200% higher risk of fatal cardiac events." → Seattle Fire / PMC8632221
5. "Personalized circadian apps have shown 29+ min/night gains." → Monash SleepSync trial PMID 37009306

Phrasing: paraphrase the category result, never claim ShiftRest-specific numbers we don't have.

## Risks to avoid

1. Hidden cancellation / fight-back screens (FTC sued Amazon $2.5B for this 2025)
2. Marketing email spam after cancel (RISE-specific complaint)
3. Pre-selected expensive tier without clear price (FTC: 76% of apps do this)
4. Trial countdown ambiguity (show exact charge date + amount)
5. Fear-mongering health claims ("you'll get cancer")
6. Wearable requirement (don't require Apple Watch)
7. Over-gamified scores users can't improve
8. Content treadmill (no daily 15-min meditations for shift workers)
9. Long onboarding (≤12 screens)
10. Review-prompt on paywall (Apple-rejectable)

## ASO

- Title: `ShiftRest: Sleep for Night Shift` or `ShiftRest — Shift Worker Sleep`
- Subtitle: "Plans for nurses, FF, EMS"
- ASA terms: "shift work sleep", "night shift sleep", "nurse sleep schedule", "shift work disorder", "sleep schedule rotating shifts"
- AVOID: "sleep tracker", "sleep sounds", "meditation" (too generic, $5-7 CPI)
- Custom Product Pages per profession (15-40% CPI reduction)

## Sources (full URLs preserved for citation in social-proof copy)

- https://link.springer.com/article/10.1186/s12912-024-02651-z
- https://psnet.ahrq.gov/primer/fatigue-sleep-deprivation-and-patient-safety
- https://pmc.ncbi.nlm.nih.gov/articles/PMC8007770/
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8632221/
- https://pubmed.ncbi.nlm.nih.gov/37009306/
- https://www.cdc.gov/niosh/work-hour-training-for-nurses/longhours/mod9/06.html
- https://aasm.org/wp-content/uploads/2022/07/ProviderFS-ShiftWork.pdf
- https://www.revenuecat.com/state-of-subscription-apps/
- https://www.revenuecat.com/blog/growth/7-day-trial-subscription-app/
- https://adapty.io/blog/high-performing-paywall-2026/
- https://www.timeshifter.com/shift-work-disorder/melatonin-for-shift-work-type-dose-timing
- https://www.monash.edu/news/articles/world-first-app-helps-shift-workers-get-more-and-better-sleep
