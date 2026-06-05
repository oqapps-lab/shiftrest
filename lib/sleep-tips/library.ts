/**
 * C5 — Sleep Library: 16 deep, research-backed articles for shift workers,
 * across 5 categories. Distinct from the short `SleepTip` cards in seed.ts —
 * these are browsable long-reads that justify the subscription.
 *
 * Content is inline English (v1). Localization of the full corpus into the
 * 10 supported locales is a follow-up content task; the library SCREEN
 * chrome (titles, chips, "min read") is localized via i18n now. Covers use
 * category gradient placeholders until the owner drops custom illustrations
 * into assets/library/<id>.* and wires IMAGE_MAP on the screen.
 *
 * Wellness-framed, never diagnostic (DOMAIN-RESEARCH §3/§5). Every science
 * claim carries a `source`.
 */

export type LibraryCategory =
  | 'light_clock'
  | 'caffeine_stimulants'
  | 'sleep_architecture'
  | 'night_shift'
  | 'recovery_social';

export interface LibraryArticle {
  id: string;
  category: LibraryCategory;
  title: string;
  hook: string;
  /** Full body; paragraphs separated by a blank line. */
  body: string;
  readMin: number;
  relevantTo: ('nurse' | 'firefighter' | 'factory' | 'all')[];
  keyTakeaway: string;
  source: string;
}

export const LIBRARY_CATEGORIES: { key: LibraryCategory | 'all'; labelKey: string }[] = [
  { key: 'all', labelKey: 'library.cat_all' },
  { key: 'light_clock', labelKey: 'library.cat_light_clock' },
  { key: 'caffeine_stimulants', labelKey: 'library.cat_caffeine' },
  { key: 'sleep_architecture', labelKey: 'library.cat_architecture' },
  { key: 'night_shift', labelKey: 'library.cat_night_shift' },
  { key: 'recovery_social', labelKey: 'library.cat_recovery' },
];

export const LIBRARY: LibraryArticle[] = [
  // ── Light & Your Clock ──────────────────────────────────────────────────
  {
    id: 'drive_home_sabotage',
    category: 'light_clock',
    title: 'Why the drive home is sabotaging your sleep',
    hook: 'You did everything right all night — then 12 minutes of morning sun on the drive home quietly cancelled it.',
    readMin: 3,
    relevantTo: ['nurse', 'firefighter', 'all'],
    source: 'Light phase-response curve; CDC/NIOSH Module 9',
    keyTakeaway: 'Morning sun on the commute resets your clock to "day" — block it with sunglasses to protect your sleep.',
    body:
      "You finished the shift, you're exhausted, you just want your bed. But the sun coming up over the dashboard is the single most powerful sleep signal your body has — and right now it's pointing the wrong way. Your circadian clock lives in a cluster of cells called the suprachiasmatic nucleus, and it takes its cues almost entirely from light hitting your retina. Morning light says one thing, loudly: day mode, wake up, shut down melatonin. That's exactly the hormone you need flowing when you crawl into bed at 8 a.m.\n\nIt doesn't take much. As little as 10–15 minutes of bright outdoor light (which can hit 10,000+ lux even on a cloudy morning, versus ~300 lux indoors) is enough to shove your clock later and blunt melatonin for hours. You'll lie down and feel inexplicably wired but tired — that's the reset you didn't ask for.\n\nThe fix is almost insultingly cheap: wraparound sunglasses, the darker the better, worn from the moment you leave the building until you're inside with the blinds drawn. Think of them as keeping your brain in night until you're safely asleep.\n\nTonight: keep dark wraparound sunglasses in your work bag. Put them on before you step outside, not after you squint.",
  },
  {
    id: 'light_master_switch',
    category: 'light_clock',
    title: 'Light is the master switch — everything else is a dimmer',
    hook: 'Melatonin pills, blackout curtains, magnesium — all of it is downstream of one thing your retina sees.',
    readMin: 3,
    relevantTo: ['all', 'factory'],
    source: 'Light as primary zeitgeber; melatonin suppression thresholds',
    keyTakeaway: 'Control when light hits your eyes and you control your clock — it beats every supplement.',
    body:
      "If you only fix one thing about your sleep, fix your light. Scientists call light the master zeitgeber — German for time-giver — because it overrides nearly every other cue your body clock uses. Temperature, meal timing, exercise: they all nudge your rhythm by minutes. Light moves it by hours.\n\nHere's the mechanism. Special cells in your retina (separate from the ones you see with) detect blue-wavelength light and report straight to your master clock. Bright light early in your biological day says advance — wake earlier. Bright light in your biological evening says delay — stay up later. Get the timing wrong and you fight your own physiology every shift.\n\nFor shift workers this is leverage. On a night shift, seek bright light (1,000+ lux — overhead fluorescents, a light box at the station) in the first half to stay alert and push your clock. Then dim down in the second half so you're not wired when you get home. Daytime sleepers need the opposite: darkness so complete you can't see your hand. Even 5–10 lux — a charger LED, a gap in the curtain — measurably suppresses melatonin.\n\nTonight: audit your bedroom in the dark. Any glowing dot you can see is stealing melatonin — tape it, unplug it, or cover the window gap.",
  },
  {
    id: 'light_box_3am',
    category: 'light_clock',
    title: 'A light box can keep you sharp at 3 a.m.',
    hook: "The 3-to-5 a.m. slump isn't weakness — it's your core temperature bottoming out, and light is the cure.",
    readMin: 2,
    relevantTo: ['nurse', 'factory'],
    source: 'Bright-light countermeasures for night work (circadian nadir)',
    keyTakeaway: 'Bright light early in a night shift fights the 3 a.m. trough; dim light late protects your morning sleep.',
    body:
      "Between roughly 3 and 5 a.m. your core body temperature hits its daily low, and your brain hits its drowsiest, most error-prone window. This is when medication mistakes, microsleeps at the wheel, and the worst judgment calls cluster. It's not about willpower — it's a hardwired circadian trough.\n\nBright light is the most effective countermeasure we have. Exposure to 1,000+ lux during the first half of a night shift does two things at once: it directly suppresses melatonin (immediate alertness, like a non-chemical espresso) and it nudges your clock to better tolerate being awake at night. Studies on night workers using bright light show measurably faster reaction times and fewer attention lapses through the danger zone.\n\nThe catch is timing. You want the bright exposure early-to-middle in the shift. Keep blasting yourself with light in the last 1–2 hours and you'll be too alert to sleep when you get home. Taper the brightness as your shift winds down.\n\nTonight: if your workstation is dim, get 20–30 minutes near the brightest light available in the first half of the shift — then dim down before you head home.",
  },
  // ── Caffeine & Stimulants ───────────────────────────────────────────────
  {
    id: 'caffeine_half_life',
    category: 'caffeine_stimulants',
    title: "That 6 p.m. coffee is still in you at midnight",
    hook: 'Half your afternoon coffee is still circulating six hours later — and it’s quietly shredding your deep sleep even if you fall asleep fine.',
    readMin: 3,
    relevantTo: ['all', 'nurse'],
    source: 'Caffeine t½ ≈5–6h; adenosine-receptor antagonism',
    keyTakeaway: 'Stop caffeine at least 6 hours before sleep — half of it lingers and steals your deep sleep.',
    body:
      "Caffeine works by impersonation. As you stay awake, a molecule called adenosine builds up and binds to receptors in your brain, creating the heavy, foggy pressure to sleep. Caffeine has nearly the same shape, so it jams those receptors — blocking the I'm-tired signal without removing the underlying fatigue. The adenosine is still there, piling up behind a locked door.\n\nThe problem is how slowly caffeine clears. Its half-life is about 5–6 hours, meaning a 200 mg coffee still leaves ~100 mg in your bloodstream 6 hours later, and ~50 mg after 12. So a coffee at 6 p.m. is still pharmacologically active at midnight. Even when you do fall asleep, research shows caffeine within 6 hours of bed cuts total sleep by over an hour and flattens slow-wave (deep) sleep — the restorative kind. You wake up unrefreshed and reach for more coffee.\n\nGenetics widen the spread: some people clear caffeine in 3 hours, others take 9. If coffee doesn't affect you, you may just not feel it while it still wrecks your sleep architecture.\n\nTonight: set a personal caffeine cutoff 6+ hours before sleep. End of shift at 7 a.m. and bed at 9 a.m.? Your last coffee should be around 3 a.m.",
  },
  {
    id: 'caffeine_strategic_dosing',
    category: 'caffeine_stimulants',
    title: "Sip, don't slam: the smarter way to use caffeine on shift",
    hook: 'The way most shift workers drink coffee — big and early — is exactly backwards.',
    readMin: 3,
    relevantTo: ['nurse', 'firefighter', 'factory'],
    source: 'Fatigue-countermeasure caffeine dosing; the caffeine nap',
    keyTakeaway: 'Use small, spaced doses timed for the 3 a.m. trough — and try a 20-minute caffeine nap.',
    body:
      "Most people front-load: a giant coffee at the start of the shift, then ride the crash. Fatigue research suggests the opposite works better. Smaller, spaced doses keep your blood level steady instead of spiking then plummeting, and they let you place caffeine where you actually need it — through the 3–5 a.m. circadian trough, not at hour one when you're already fresh.\n\nDose matters more than people think. The effective alertness dose is small: roughly 1–2 mg per kg of body weight, or about 75–150 mg for most adults — a single regular coffee or two espressos. Beyond ~200–400 mg in a sitting you mostly buy jitters, a racing heart, and a worse comedown, not more alertness.\n\nOne genuinely useful trick is the caffeine nap. Drink a coffee, then immediately lie down for 20 minutes. Caffeine takes ~20–30 minutes to kick in, so you get the nap's adenosine clearance and the caffeine peak at the same moment — waking up doubly sharp.\n\nTonight: split your shift caffeine into 2–3 small servings, save one for the pre-dawn dip, and stop well before your sleep window.",
  },
  {
    id: 'alcohol_rem_cost',
    category: 'caffeine_stimulants',
    title: "The nightcap that's robbing your second half of the night",
    hook: 'Alcohol does help you fall asleep — and that’s exactly the trap.',
    readMin: 3,
    relevantTo: ['all', 'firefighter'],
    source: 'Alcohol fragments 2nd-half sleep + suppresses REM',
    keyTakeaway: 'Alcohol speeds sleep onset but destroys REM and fragments the second half — stop 3–4 hours before bed.',
    body:
      "A drink or two after a hard shift feels like it works. You're relaxed, you drift off fast, and that's real: alcohol is a sedative and it does shorten how long it takes to fall asleep. But it buys the first hour at the expense of everything after it.\n\nAs your body metabolizes alcohol (roughly one standard drink per hour), it produces stimulating byproducts and triggers a rebound. The back half of your night fragments into micro-awakenings you may not even remember, and your heart rate stays elevated. Worst hit is REM sleep — the dreaming stage that consolidates memory and regulates mood. Alcohol can suppress REM early, then flood it later in a disorganized rebound, leaving you groggy and emotionally raw. You'll feel like you slept; the data says you barely did.\n\nFor shift workers this compounds a problem you already have. Your sleep is often shorter and lighter to begin with — losing REM and deep sleep on top of that is a deficit you carry into the next shift. It also worsens snoring and sleep apnea by relaxing airway muscles.\n\nTonight: if you drink, finish at least 3–4 hours before sleep and match each drink with water. A wind-down ritual relaxes you without the 3 a.m. rebound.",
  },
  // ── Sleep Architecture ──────────────────────────────────────────────────
  {
    id: 'ninety_minute_cycle',
    category: 'sleep_architecture',
    title: 'Why waking at the wrong minute ruins a good night',
    hook: 'Eight hours of sleep can leave you wrecked, while six can leave you sharp — the difference is where the alarm lands.',
    readMin: 3,
    relevantTo: ['all'],
    source: 'Ultradian ~90-min cycle; sleep inertia',
    keyTakeaway: 'Time your alarm to the end of a ~90-minute cycle to dodge sleep inertia — even short sleep feels better.',
    body:
      "Sleep isn't a flat plateau; it's a staircase you climb up and down all night. Each full cycle runs about 90 minutes (anywhere from 70–110) and moves through light sleep, deep slow-wave sleep, and finally REM, then loops back. Early cycles are heavy on deep sleep — physical repair. Later cycles are heavy on REM — memory and mood.\n\nHere's why it matters for your alarm. If you wake during deep slow-wave sleep, you get hit with sleep inertia: that thick, disoriented grogginess that can drag on 15–30 minutes (occasionally up to two hours). Your reaction time and judgment are genuinely impaired — a real hazard if you're driving home or starting a shift. Wake at the end of a cycle, in light sleep, and you pop up clear-headed even on less total sleep.\n\nYou can use the math. Count back from when you must wake in ~90-minute blocks. Need to be up at 4 p.m. for a night shift? Aim to fall asleep around 8:30 a.m. (≈7.5 hours = five cycles) or 10 a.m. (≈6 hours = four cycles), rather than 9:15 a.m., which dumps you mid-deep-sleep.\n\nTonight: add ~15 minutes for falling asleep, then target a wake time that's a multiple of 90 minutes from there.",
  },
  {
    id: 'nap_20_vs_90',
    category: 'sleep_architecture',
    title: 'The 20-minute nap, the 90-minute nap, and the one that ruins you',
    hook: 'There are exactly two good nap lengths — and the 45-minute nap most people take is the worst possible choice.',
    readMin: 3,
    relevantTo: ['firefighter', 'nurse', 'all'],
    source: 'NASA Nap Study (1995); sleep-inertia from mid-cycle waking',
    keyTakeaway: 'Nap 20 minutes (no grogginess) or 90 minutes (full cycle) — avoid the 45-minute deep-sleep trap.',
    body:
      "Naps are a shift worker's best tool, but length is everything, and it comes back to those 90-minute cycles. There are two sweet spots and a danger zone in the middle.\n\nThe 20-minute power nap keeps you in light sleep. You clear just enough adenosine (sleep pressure) to feel refreshed, and you wake before sliding into deep sleep — so no grogginess. NASA's famous study found a ~26-minute nap improved pilot performance by 34% and alertness by 54%. This is your on-break nap, your I-have-to-drive-home nap.\n\nThe 90-minute full-cycle nap lets you complete one entire cycle — light, deep, REM — and wake naturally at the light end. Use it before a night shift to bank sleep, or as recovery after one. You get real restorative value without inertia.\n\nThe trap is the 45–60 minute nap. It's long enough to drop you into deep slow-wave sleep but too short to climb back out, so the alarm yanks you from the bottom. You wake up worse than before you lay down — heavy, slow, and foggy for half an hour.\n\nTonight: set the alarm for 20 minutes or 90 minutes. Never 45.",
  },
  {
    id: 'core_temp_thermostat',
    category: 'sleep_architecture',
    title: 'Your body has a thermostat that decides when you can sleep',
    hook: "You can't sleep at 2 p.m. for the same reason you're alert then — your core temperature is near its daily peak.",
    readMin: 3,
    relevantTo: ['nurse', 'factory', 'all'],
    source: 'Core-temperature rhythm and sleep onset (~1°C drop)',
    keyTakeaway: 'Sleep rides a falling core temperature — warm shower then cool room to trigger the drop.',
    body:
      "There's a reason day-sleeping feels like fighting your own body: it is. Your core body temperature follows a daily rhythm, rising through the day to a peak in the early evening and falling to a low in the pre-dawn hours. Sleep wants to begin on the downslope. The actual drop in core temperature — about 1°C — is part of the signal that triggers sleep onset and helps you stay under.\n\nThis is why a 2 p.m. nap after a night shift can feel impossible. You're trying to sleep right as your temperature is climbing toward its peak — biologically the most alert wake-maintenance zone of the day. Your brain is shouting daytime. The pre-dawn low, by contrast, is when sleep comes easiest.\n\nYou can game the thermostat. A warm shower or bath about 60–90 minutes before bed sounds backwards but works: the warmth pulls blood to your skin, and once you get out, heat dumps fast and your core temperature drops — mimicking the natural pre-sleep dip. Studies show this can cut sleep-onset time by around a third. A cool bedroom (16–19°C) keeps the drop going; a hot room blocks it and fragments your sleep.\n\nTonight: warm shower 60–90 min before sleep, then a cool, dark room to let your core temperature fall.",
  },
  // ── Surviving Night Shift ───────────────────────────────────────────────
  {
    id: 'anchor_sleep',
    category: 'night_shift',
    title: 'The anchor sleep: one trick for rotating schedules',
    hook: 'If your shifts change every few days, full circadian adaptation is impossible — so stop chasing it and anchor instead.',
    readMin: 3,
    relevantTo: ['nurse', 'factory'],
    source: 'Anchor-sleep paradigm for rapid rotators',
    keyTakeaway: 'Keep one fixed 4-hour sleep block at the same time daily to stop your clock from resetting every rotation.',
    body:
      "Here's an uncomfortable truth: it takes 7–14 days of consistent timing for your clock to fully adapt to night work, but most rotations flip every 2–4 days. So you never adapt — you just stay permanently jet-lagged. Chasing full adaptation is a losing game. The smarter goal is to minimize the swing.\n\nThat's where anchor sleep comes in. You keep one fixed block of sleep — usually 4 hours — at the same clock time every single day, on-shift or off, and add the rest of your sleep wherever your schedule allows. Say you anchor 8 a.m. to noon. On a night-shift day you sleep 8 a.m.–2 p.m. (anchor plus extra). On a day off you might sleep 8 a.m.–noon, then add an evening nap. The anchor stays put.\n\nWhy it works: that consistent overlap gives your circadian rhythm a stable reference point, so it stops lurching wildly between schedules. Your melatonin and temperature rhythms hold a partial position instead of resetting every rotation. Workers using anchor sleep report less of the permanent-zombie feeling that comes from a clock with no fixed point at all.\n\nTonight: pick a 4-hour window that overlaps most of your sleep across your rotation and protect it as non-negotiable, every day.",
  },
  {
    id: 'split_biphasic_sleep',
    category: 'night_shift',
    title: "Can't sleep 8 hours straight? Split it on purpose",
    hook: 'Two shorter sleeps can beat one broken one — and for shift workers, broken is usually what you get anyway.',
    readMin: 3,
    relevantTo: ['firefighter', 'factory'],
    source: 'Biphasic/split sleep in sailors, doctors, military',
    keyTakeaway: 'Two well-timed sleep blocks (each a full cycle) can rival one unbroken night — and fit real shift life.',
    body:
      "The idea that humans must sleep eight unbroken hours is historically recent. Before artificial light, first sleep and second sleep with a waking gap was common, and many cultures still nap by design. For shift workers, deliberately splitting sleep into two blocks can outperform one long stretch you can't actually achieve.\n\nA typical split: a longer anchor sleep (say 4–5 hours) right after a night shift while your sleep pressure and post-shift fatigue are highest, then a second shorter block (2–3 hours) in the late afternoon or early evening before the next shift, timed to the dip in alertness. The first block captures most of your deep slow-wave sleep; the second tops up REM and refreshes alertness right before work.\n\nThe science is reassuring: total restorative value depends mostly on total time across both blocks, plus completing full cycles. Split schedules are well documented without the penalty you'd fear — if each block lands at a time your body can actually sleep (downslope of your temperature rhythm) and each is a multiple of ~90 minutes.\n\nTonight: instead of forcing one 8-hour day-sleep you keep waking from, plan a 4.5-hour block after shift and a 1.5–3-hour block before the next one.",
  },
  {
    id: 'eating_biological_night',
    category: 'night_shift',
    title: 'Why the 3 a.m. meal sits like a brick',
    hook: 'Your gut has its own clock, and at 3 a.m. it has clocked out for the night.',
    readMin: 3,
    relevantTo: ['nurse', 'factory', 'all'],
    source: 'Circadian glucose handling; shift-work metabolic risk',
    keyTakeaway: 'Your gut is offline at night — eat your main meal pre-shift and keep overnight food light.',
    body:
      "Ever notice that the big meal you eat mid-night-shift feels heavier, gassier, and somehow wrong? You're not imagining it. Your digestive system runs on its own circadian rhythm — stomach acid, enzymes, gut motility, and insulin sensitivity all wind down during your biological night because your body assumes you're asleep and fasting. Eat a heavy meal at 3 a.m. and you're asking a half-shuttered factory to run a full shift.\n\nThe consequences are real and measurable. Eating during the biological night spikes blood sugar higher and clears it more slowly than the identical meal eaten by day — one reason shift workers have elevated rates of weight gain, metabolic syndrome, and type 2 diabetes. It also worsens reflux and that leaden, bloated discomfort that makes the rest of the shift miserable.\n\nThe strategy is to eat your main meal before the shift, keep night-shift eating light, and lean on protein and complex carbs over sugar and grease. Stay hydrated — fatigue is often mild dehydration in disguise. And try to stop eating a couple of hours before your day-sleep so digestion isn't fragmenting it.\n\nTonight: eat your real dinner before the shift. On shift, graze on light protein-forward snacks, not a heavy 3 a.m. meal.",
  },
  {
    id: 'melatonin_what_it_is',
    category: 'night_shift',
    title: "Melatonin: what it actually is (and what it isn't)",
    hook: 'Most people use melatonin like a sleeping pill — which is why it "doesn’t work" for them.',
    readMin: 4,
    relevantTo: ['all', 'nurse'],
    source: 'Melatonin phase-response curve; 0.5–3 mg fast-release',
    keyTakeaway: 'Melatonin is a clock-timing signal, not a sleeping pill — low dose (0.5–3 mg), right time, real darkness.',
    body:
      "Melatonin isn't a sedative. It won't knock you out the way an antihistamine or alcohol does, and if you judge it by that standard you'll conclude it's useless. What it actually is: a timing signal. Your pineal gland releases it in darkness to tell your brain biological night is starting. Taking it is less like flipping a sleep switch and more like nudging the hands of your body clock.\n\nThat changes everything about how you use it. Dose: smaller is better — 0.5 to 3 mg. The low end is often more effective for shifting your clock than megadoses; 5–10 mg tablets mostly produce next-day grogginess. Form: fast-release, not extended-release, when your goal is to move your clock. Timing is the whole game. To shift your clock earlier (useful coming off nights back to days), take a low dose in the early evening, several hours before target bedtime. To anchor sleep after a night shift, a small dose before your day-sleep can help signal night against the daylight.\n\nWhat it isn't: a cure for being chronically short on sleep, a substitute for darkness (light at night overrides it), or something to take at random times — wrong timing can shove your clock the wrong way. It's an over-the-counter supplement, not medical advice — if sleep problems are severe, talk to a clinician.\n\nTonight: if you try it, start at 0.5–1 mg fast-release, take it at a consistent time relative to your target sleep, and pair it with real darkness.",
  },
  // ── Recovery & Social Life ──────────────────────────────────────────────
  {
    id: 'post_night_recovery',
    category: 'recovery_social',
    title: 'How to recover after nights without wrecking the next cycle',
    hook: 'The way you sleep after your last night shift decides whether your days off are a gift or a write-off.',
    readMin: 3,
    relevantTo: ['nurse', 'factory'],
    source: 'Recovery-from-shift-work research; Process-S homeostasis',
    keyTakeaway: 'After your last night, take a short morning sleep and reset to a normal bedtime — don’t crash all day.',
    body:
      "You finish a run of nights and your instinct is to crash until dinner. Sleep all day, you reason, and you'll be human again. But sleeping 2 p.m. to 10 p.m. on your first day off guarantees you're wide awake at 2 a.m. — and now your day off is just another night shift with no pay.\n\nThere's a better play, especially if you're rotating back to a day-based life. After your final night shift, take a shorter recovery sleep — around 3–4 hours, ending early-to-mid afternoon (say 9 a.m. to 1 p.m.). Yes, you'll be tired in the late afternoon. That tiredness is the point: it lets you go to bed at a normal-ish evening hour that night, sleep a full night, and wake the next morning roughly synced to the daytime world.\n\nPush through the afternoon dip with light exposure (get outside — daylight resets you toward day), a short 20-minute nap if you must, and a small early caffeine if needed. Then protect that first proper night's sleep fiercely. You trade one groggy afternoon for getting your whole days-off block back.\n\nTonight (after your last night): sleep 3–4 hours in the morning, get afternoon daylight, then go to bed that evening at a normal hour.",
  },
  {
    id: 'social_jetlag',
    category: 'recovery_social',
    title: 'Social jetlag: the hidden tax on your days off',
    hook: 'Every weekend you fly to a different time zone without leaving the house — and your body pays for the trip.',
    readMin: 3,
    relevantTo: ['all'],
    source: 'Social jetlag and metabolic/mood outcomes',
    keyTakeaway: 'Big day-off schedule swings act like repeated jet lag — keep your sleep midpoint steadier to cut the cost.',
    body:
      "Social jetlag is the gap between the schedule your body wants and the schedule your life demands. For shift workers it's brutal: you're on a night-leaning clock for work, then on your days off you yank yourself onto a day schedule for family, kids' soccer, dinner with friends. The mismatch is metabolically identical to flying across several time zones — except you do it twice a week, every week, forever. It's linked to worse mood, higher body weight, and increased metabolic and cardiovascular risk.\n\nYou can't eliminate it without quitting shift work, but you can shrink it. The biggest lever is consistency of your sleep midpoint — the clock time halfway through your sleep. Wild swings (sleeping 8 a.m.–4 p.m. one day, 11 p.m.–7 a.m. the next) are what hurt. An anchor-sleep block helps here too. Strategic light is the other lever: bright light when you want to be awake, darkness and sunglasses when you don't, to gently steer your clock instead of letting it free-fall.\n\nAnd give yourself grace. The goal isn't a perfect schedule — that's not available to you. It's smaller swings and protecting the moments that matter.\n\nTonight: on days off, keep your sleep midpoint within a couple of hours of your workday midpoint instead of flipping completely.",
  },
  {
    id: 'wind_down_ritual',
    category: 'recovery_social',
    title: 'Build a wind-down ritual that works in daylight',
    hook: 'Going from a coding alarm and bright lights to "sleep now" in five minutes is like slamming the brakes at full speed.',
    readMin: 3,
    relevantTo: ['firefighter', 'nurse', 'all'],
    source: 'Stimulus-control (CBT-I); parasympathetic down-shift',
    keyTakeaway: 'A consistent 30–45 minute wind-down (dim, cool, breathe) becomes a conditioned sleep cue your body obeys.',
    body:
      "After a shift your body is in sympathetic overdrive — alert, cortisol up, adrenaline still circulating, especially if the shift was high-stakes. Expecting to lie down and sleep instantly is unrealistic; you need a runway to shift from go to off. A consistent wind-down ritual is that runway, and over time it becomes a conditioned cue: do the same sequence nightly and your brain starts releasing the brakes the moment you begin.\n\nBuild a 30–45 minute sequence and keep it the same every day. Anchor it in the mechanisms that actually move your physiology: dim the lights (bright overhead light delays melatonin by 90+ minutes — go to lamps), drop the temperature with a warm shower an hour before so your core can fall, and down-shift the nervous system with slow breathing — try 4-7-8 (inhale 4 seconds, hold 7, exhale 8) for a few cycles to flip you into rest mode in about a minute. Swap the phone for a paper book; a few minutes of reading can drop stress sharply, and there's no algorithm pulling you back.\n\nFor day-sleepers, the ritual matters more: you're overriding daylight, so blackout, eye mask, earplugs or steady brown noise, and a cool room turn your bedroom into convincing night.\n\nTonight: pick three fixed steps — dim lights, warm shower, 4-7-8 breathing — and run them in the same order every sleep, on shift or off.",
  },
];

/** Articles relevant to a profession (or universal). Universal = always shown. */
export function articlesForProfession(
  prof: 'nurse' | 'firefighter' | 'factory' | null,
): LibraryArticle[] {
  if (!prof) return LIBRARY;
  return LIBRARY.filter((a) => a.relevantTo.includes('all') || a.relevantTo.includes(prof));
}

export function articleById(id: string): LibraryArticle | undefined {
  return LIBRARY.find((a) => a.id === id);
}
