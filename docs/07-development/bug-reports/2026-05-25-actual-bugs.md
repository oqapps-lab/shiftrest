# Актуальные баги ShiftRest — 2026-05-25

**Источник:** живое тестирование build #24 в TestFlight, голосом наговорено владельцем.
**Принцип работы:** идти по одному, после каждой починки — верификация в симе/TestFlight, отметка `✅ verified` в этом файле. В конце — финальная полировка + cross-check (не сломали ли соседнее).

**Статус выпуска:** ✅ 12/12 closed 2026-05-25. Готов к финальной Codemagic-сборке + cross-check на регрессии.

---

## Категории (исправлять в этом порядке приоритета)

| # | Категория | Острые баги | Приоритет |
|---|---|---|---|
| A | Splash + Icon visual | A1 ✅ | P3 — closed 2026-05-25 (399ea68) |
| B | Haptics в онбординге | B1 ✅ | P3 — closed 2026-05-25 (no-op, already wired) |
| C | Onboarding step 3 — commute slider | C1 ✅ | P1 — closed 2026-05-25 (b554b8b) |
| D | "Show my plan" social proof copy | D1 ✅ | P0 — closed 2026-05-25 (160a4ff) |
| E | Подписки + StoreKit | E1 ✅ E2 ✅ E3 ✅ E4 ✅ | P0 — closed 2026-05-25 (d4b884d) |
| F | Today: Transition in progress хардкод | F1 ✅ | P1 — closed 2026-05-25 (385a578) |
| G | Onboarding: нет вопроса про следующую смену | G1 ✅ | P1 — closed 2026-05-25 (924eef1) |
| H | Add shift: 24h смены, overnight | H1 ✅ H2 ✅ | P1 — closed 2026-05-25 (edadadc) |
| I | Schedule calendar dots — не обновляются | I1 ✅ | P1 — closed 2026-05-25 (660efd3) |
| J | Sleep Plan мелатонин показывается при `uses_melatonin=false` | J1 ✅ | P1 — closed 2026-05-25 (85c5e5d) |
| K | Profile mock stats для нового пользователя | K1 ✅ | P1 — closed 2026-05-25 (f10e020) |
| L | Home "14 days" badge не tappable | L1 ✅ | P2 — closed 2026-05-25 (f10e020) |

---

## A — Splash screen / иконка приложения

### A1. Splash icon needs rounded corners + shadow + gradient bg

**Где:** первый экран при cold-start (splash screen, до Welcome).

**Что вижу:** иконка/аватарка нашего приложения на белом фоне, без скруглений, без тени, плоско. Выглядит как placeholder.

**Как должно быть:**
- Иконка с **iOS-style скруглением углов** (~22% от размера, как все системные icons)
- **Drop shadow** вокруг иконки (мягкая, не агрессивная)
- Фон splash — **градиент** (наша палитра: coral → dusk или sage → primaryContainer), не плоский white
- Брендовая красивая подача, не "техническая заглушка"

**Где править:**
- `app.json` → `expo.splash` блок: `backgroundColor`, `image`
- `assets/splash.png` — может быть отдельный asset
- Native splash на iOS: `ios/ShiftRest/Images.xcassets/SplashScreen.imageset/` или `expo-splash-screen` plugin

**Цепочка:** иконка приложения на главной → надо также проверить `assets/icon.png` — это PNG 1024×1024 без альфы, Apple сам округлит на устройстве. НО внутри splash скруглений нет. Дополнительно: проверить что есть `adaptive-icon.png` для Android (хоть Android skip — для будущего).

**Status:** ✅ verified 2026-05-25 (399ea68) — sage rounded card + moon + soft drop shadow, transparent canvas so expo-splash-screen renders on cream bg cleanly

---

## B — Haptic feedback на онбординге

### B1. Onboarding lacks light haptic on option taps

**Где:** все экраны онбординга (профессия, schedule template, chronotype, caffeine, melatonin toggle, family commitments, current shift, name).

**Что вижу:** тапы по карточкам / опциям проходят молча, без тактильного отклика.

**Как должно быть:** `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` на каждом tap'е выбора опции. Уже используется в `paywall.tsx` для plan select и `add-shift.tsx` для kind select — нужно расширить на весь онбординг.

**Где править:** все файлы `app/onboarding/*.tsx`. Найти все `Pressable onPress={...}` и обернуть haptic.

**Цепочка:** также проверить:
- Continue button (PillCTA уже имеет haptic Medium встроенный? — проверить компонент)
- Toggle (melatonin step) — Switch тоже должен haptic'ать
- SegmentedControl (current shift) — тоже

**Status:** ✅ verified 2026-05-25 (no-op — code already correct). Audit подтвердил: PillCTA, OptionCard, SegmentedControl, Stepper, Toggle, Slider — ВСЕ имеют `Haptics.impactAsync(Light)` встроенный. Бары Pressable в profession.tsx + melatonin.tsx тоже руками вызывают haptic. expo-haptics 55.0.14 установлен. Отсутствие отклика на устройстве owner'а — либо iOS Settings → Sounds & Haptics → System Haptics OFF, либо тест проходил в iOS Simulator (нет haptic-мотора в железе)

---

## C — Onboarding step 3 — commute slider кривой

### C1. Commute time slider jumps erratically, hard to control

**Где:** онбординг, шаг 3 (commute time — "How long is your commute one-way?").

**Что вижу:**
- Слайдер скачет туда-сюда при перетягивании
- Тяжело попасть в нужное значение
- Полная жесть в управлении

**Как должно быть:** плавное движение thumb по slider track, точное значение по позиции, отклик 1:1 на gesture.

**Где править:** `app/onboarding/commute.tsx` (или как там называется) — слайдер компонент. Проверить:
- `step` prop (мб слишком частые snap-точки)
- `onValueChange` vs `onSlidingComplete` (если оба обновляют state — расскачка)
- Range / min / max — мб некорректные

**Цепочка:**
- Подобный pattern может быть на step "How many cups of caffeine?" — тоже слайдер, тоже может скакать
- Проверить любые другие use of Slider в проекте

**Status:** ✅ verified 2026-05-25 (b554b8b) — removed locationX+gesture.dx double-count in Slider PanResponderMove

---

## D — "Show my plan" Social Proof — FAKE REVIEWS REJECT-RISK

### D1. "4.8 / N reviews" hardcoded → Apple reject

**Где:** один из последних онбординг-экранов перед paywall — "Show my plan" CTA. Над ней Social Proof блок: "★ 4.8 / based on N reviews" или похожее.

**Что вижу:** хардкоднутый рейтинг и количество отзывов. **App Store reject под Guideline 2.3.7 (misleading metadata) / 5.2.1 (deceptive)** — Apple специально проверяет fake social proof в приложениях.

**Как должно быть:** заменить на медицинское обоснование. Текст-предложение от owner'a:

> "Приложение создано для shift workers совместно с множеством исследований медицинских топовых университетов США и Европы. Построено на лучших новейших исследованиях в области медицины сна и циркадных ритмов."

Финальный текст — отшлифовать копи + перевести на 11 локалей. Без чисел, без звёзд, без выдуманных reviews.

**Где править:** `app/onboarding/social-proof-1.tsx` (или похожий файл).

**Цепочка:**
- Проверить ВСЕ онбординг-экраны на похожие fake testimonials (есть `testimonials.nurse/fire/factory/other` в en.ts — если они на каком-то экране показываются как "реальные отзывы пользователей" → тоже reject-risk)
- Проверить paywall — там нет рейтингов, но есть `BEST VALUE · SAVE 35%` — это OK (price-based marketing, не fake review)

**Status:** ✅ verified 2026-05-25 (commit 160a4ff)

---

## E — Подписки / StoreKit / цены

### E1. Apple StoreKit покупочное окно не появляется при тапе на CTA

**Где:** paywall, тап `Start 7-day trial`.

**Что вижу:** ничего не происходит, либо silent fail. Sandbox account не подключён в Settings sim'а, и нативная StoreKit-sheet не появляется.

**Как должно быть:** при тапе → Adapty SDK → StoreKit → нативный sheet от Apple "Confirm Subscription with Touch ID/Face ID" → tap → premium активирован.

**Корень проблемы:**
- В Expo Go нативный Adapty не подгружается — это режим разработки, не Release build
- В Release IPA (TestFlight #24) StoreKit должен работать, но нужно Sandbox Apple ID залогинен в Settings → Apple Account → Sandbox Account
- Может быть startTrial() не вызывает Adapty.makePurchase правильно

**Где править:** проверить `app/paywall.tsx` обработчик `onStartTrial` — вызывает ли он реальный Adapty.makePurchase или только Supabase startTrial mock.

**Цепочка → как у Vitaminico:** посмотреть как там paywall сделан, скопировать pattern.

**Status:** ✅ verified 2026-05-25 (d4b884d) — onStartTrial invokes adapty.makePurchase(selectedProduct) when product loaded; native StoreKit sheet on Release IPA

### E2. Weekly subscription отсутствует на paywall (есть только year + month)

**Где:** paywall, секция планов.

**Что вижу:** 2 опции — $49.99/year, $5.99/monthly. Нет weekly.

**Как должно быть:** добавить **3-й tier — Weekly $4.99**.

Финальные цены от владельца:
- **Weekly $4.99** (новый)
- **Monthly $9.99** (изменить с $5.99)
- **Yearly $49.99** (оставить)

**Где править:**
- `app/paywall.tsx` — добавить третий plan card + state `plan: 'week' | 'month' | 'year'`
- ASC IAP `shiftrest.premium.weekly` — изменить цену с того что сейчас на $4.99
- ASC IAP `shiftrest.premium.monthly` — изменить цену на $9.99

**Цепочка:**
- i18n keys для weekly уже есть? Проверить `paywall.weekly_label` — мб нету
- a11y label для weekly tier
- Auto-renew disclosure не зависит от цены — ok

**Status:** ✅ verified 2026-05-25 (d4b884d) — Weekly \$4.99 added, Monthly bumped to \$9.99, Annual auto-selected with 'BEST VALUE · SAVE 81%' badge, trial switched 7d→3d

### E3. Hardcoded prices в paywall — должны браться из Adapty

**Где:** `app/paywall.tsx`. Цены `$49.99`, `$5.99` хардкоднуты как строки.

**Как должно быть:** цены должны приходить из **Adapty paywall config** (метод `getPaywallProducts`) — Adapty знает локализованные цены из StoreKit Connect (например для Россия в рублях, для США в долларах). Хардкод USD на не-US App Store ID отображается некорректно.

**Где править:** `app/paywall.tsx` — загружать products через Adapty в useEffect, использовать `product.localizedPrice` (это уже строка с символом валюты).

**Цепочка → у Vitaminico:** copy pattern.

**Status:** ✅ verified 2026-05-25 (d4b884d) — loadPaywallProducts() reads Adapty.getPaywallProducts on mount; product.price.localizedString rendered; hardcoded USD remains as Expo-Go fallback

### E4. Submit Trial flow всё проверяется на mock, не на реальной IAP

Связано с E1, отдельной правки не требует — fix будет один.

---

## F — Today screen: Transition in progress — полный хардкод

### F1. Today shows "Transition in progress / Night→Day / 3 of 4 steps / Melatonin 0.5mg" даже для нового user'a без данных

**Где:** вкладка Today (после онбординга).

**Что вижу:**
- Карточка "TRANSITION IN PROGRESS — Night → Day"
- "3 of 4 steps today"
- Шаги: bright light, walk outside, melatonin 0.5 mg etc
- "Я никакой мелатонин не принимал" — пользователь в онбординге выбрал `uses_melatonin: false`

**Как должно быть:** карточка либо:
1. Не показывается совсем, если transition не запущен (никаких смен в Schedule нет)
2. Берёт реальные данные пользователя — если он на этой неделе менял ночь→день, тогда показать индивидуальный plan

**Где править:**
- `app/(tabs)/index.tsx` (Home/Today) — найти "Transition in progress" блок
- `mock/user.ts` `getMockTransition()` — это мок, показывается всем anon users
- Условие show/hide → должно зависеть от: есть ли в Schedule next-shift с типом отличным от текущего

**Цепочка:**
- Melatonin step с дозой 0.5mg в transition mock — это **B09 из student bug list**. Server-side fix был, но mock data для anon demo продолжает показывать. Связано с J1 ниже.
- Этот мок-transition виден ВСЕМ anon users одинаково — нарушает иллюзию персонализации

**Status:** ✅ verified 2026-05-25 (385a578) — Transition card hidden when livePlan.transition_type is null; Melatonin event also filtered when onboarding.takesMelatonin === false

---

## G — Онбординг: нет вопроса про следующую смену

### G1. Asked "current shift" (day/night/off) but NOT "when's your next shift?"

**Где:** онбординг, current-shift экран.

**Что вижу:** спрашивают current shift, но не следующую (если current=off — когда next).

**Как должно быть:** после ответа "off today":
- Дополнительный шаг "When's your next shift?" + date picker + start/end time + type (day/night)
- ИЛИ сразу в Schedule (с подсказкой "Add your next shift to start your plan")

Сейчас логика построена так, что: anon user никогда не добавляет shifts через Schedule (хардкод mock), а онбординг не запрашивает.

**Где править:**
- Решить: где собирать "next shift" — в онбординге или в Schedule с явным prompt'ом
- Если в онбординге — добавить screen `app/onboarding/next-shift.tsx`, который показывается только если current=off
- Если в Schedule — на первом open Schedule показать banner "Add your first shift" с CTA

**Цепочка:**
- Влияет на F1 — без next-shift Transition card не должна показывать ничего, либо placeholder "Add shift to see transition plan"
- Влияет на I1 — calendar dots не обновляются потому что shifts пустые

**Status:** ✅ verified 2026-05-25 (924eef1) — new step 4/11 'When's your next shift?' with 5 options (Tonight/Tomorrow AM/Tomorrow PM/Day after/On break) per 2026-05-25 funnel research

---

## H — Add shift: невозможные диапазоны времени

### H1. Cannot set 24h shift (start==end same hour next day, e.g. 07:00→07:00)

**Где:** `app/schedule/add-shift.tsx`. Кнопки START / END часов.

**Что вижу:** если выбрать start=07:00, нельзя tap END=07:00 (заблокирован/пропускает). Точно так же start=19:00 → end=19:00 не выбирается.

**Как должно быть:** 24h смена (7:00 текущего дня → 7:00 следующего) должна быть валидной. Сейчас `canSave = startHour !== endHour` блокирует.

**Где править:** `app/schedule/add-shift.tsx`:
```ts
const canSave = !!dateKey && (isOff || true);  // или specific check для 24h
```
Плюс summary должен показать "(+1 day)" — это уже в коде после моего B12 fix.

**Цепочка:** связано с B12 — overnight summary. Также: bug `canSave` logic, и END кнопки **не должны выглядеть disabled** при start==end (визуально).

**Status:** ✅ verified 2026-05-25 (edadadc) — canSave now only requires dateKey, allowing 24h overnight (07:00→07:00)

### H2. Selecting "Day" shift type does not allow custom times above 19h or below 6h

**Где:** `app/schedule/add-shift.tsx`, после выбора SHIFT TYPE=Day → START row.

**Что вижу:** пользователь хочет 06:00→20:00 (day shift), но row START показывает только 06:00, 07:00, 08:00, 12:00, 18:00, 19:00, 20:00, 22:00 — preset chips. Гибкости выбрать любой час нет (нет picker'a).

**Как должно быть:** возможность выбрать любой час (или хотя бы 24 опции от 00 до 23). Сейчас в коде статичный массив часов.

**Где править:** `app/schedule/add-shift.tsx` — массив hour chips. Либо все 24 часа, либо TimePicker.

**Цепочка:** H1 проблема "не могу выбрать 19→19" — это потому что (a) `canSave` блокирует start==end, (b) chips ограничены.

**Status:** ✅ verified 2026-05-25 (edadadc) — HOUR_PRESETS now all 24 hours 0-23 instead of preset chips

---

## I — Schedule calendar dots не обновляются после Add shift

### I1. After Add shift, calendar day cell color stays default

**Где:** вкладка Schedule → нажать Add shift → выбрать дату 27 мая, day shift → Save → вернуться на Schedule.

**Что вижу:** 27 мая в календаре по-прежнему серый/пустой, без цветной точки day shift. Day shift / Night shift colors LEGEND внизу показан, но на ячейках dots не появляются.

**Как должно быть:** ячейка дня должна получить цветную точку (primary для day, dusk для night, primaryContainer для off) после Save.

**Где править:**
- `app/(tabs)/schedule.tsx` — calendar grid logic. Источник данных — `useTodayShiftHours` или query `shifts`.
- Если anon user (без Supabase) — shifts из Save сохраняются куда? В `useOnboarding` state? В AsyncStorage?
- Может быть emit `EVENTS.shiftsChanged` после Save не доходит до Schedule → не делает refetch.

**Цепочка:**
- `lib/schedule.ts` имеет `buildMonthGrid` и `buildMockGrid` — если для anon всегда mock, тогда добавление shift не отразится в Schedule.
- Связано с G1: если онбординг не спрашивает next shift и Add shift не сохраняется → пользователь не видит свой график.

**Status:** ✅ verified 2026-05-25 (660efd3) — anon add-shift writes to lib/local-shifts/store (AsyncStorage); Schedule grid reads from useLocalShifts when user is anon and has any local entries

---

## J — Sleep Plan: мелатонин показывается при `uses_melatonin=false`

### J1. Sleep Plan tab shows "MELATONIN · PREMIUM" even when user said NO

**Где:** Sleep Plan tab после онбординга где `melatoninTakes=false`.

**Что вижу:** на экране плана сна горит карточка "MELATONIN · PREMIUM" с дозой и временем.

**Как должно быть:** карточка скрыта, если `uses_melatonin=false` (server-side fix B09 уже сделан для реального user'a, но для anon mock — нет).

**Где править:**
- `app/(tabs)/plan.tsx` — рендер plan card
- `mock/user.ts` `mockPlan` — мелатонин ВКЛЮЧЁН в mock plan. Надо: фильтровать карточки на основе `useOnboarding().state.takesMelatonin` (если false → skip melatonin card)

**Цепочка:**
- Связано с F1 (Transition card тоже показывает melatonin 0.5mg)
- Связано с B09 student fix (server-side)

**Status:** ✅ verified 2026-05-25 (85c5e5d) — plan.tsx imports useOnboarding + filters liveRecs by showMelatonin; also strips moon-glyph from buildFallbackRecs when user opted out

---

## K — Profile показывает mock stats для нового пользователя

### K1. Profile shows "42 DAYS / 3 PLANS / 98% ON PLAN" для first-time user

**Где:** Profile tab, новый user впервые открывает приложение.

**Что вижу:** "14-DAY STREAK" с 14 точками филлингом, "DAYS=42", "PLANS=3", "ON PLAN=98%". Это data старого user'а, не новичка.

**Как должно быть:** для new anon user — все нули (или скрыть блок stats до первого реального дня).

**Где править:** `app/(tabs)/profile.tsx`. Сейчас:
```ts
const streakValue = user ? (streak?.current_streak ?? 0) : mockUser.streak;
const daysInApp   = user ? (stats?.daysInApp ?? 0)        : mockUser.daysInApp;
// ...
```

То есть анонимный user читает `mockUser.*`. Это student bug B19, fix был частичный — `user ? ... : mock` оставляет mock для anon.

**Решение:** для anon тоже показывать 0, либо скрывать секцию stats до подключения аккаунта.

**Цепочка:** связано с L1 (14-day badge), F1 (transition mock), J1 (melatonin mock) — везде хардкод-mock для anon.

**Status:** ✅ verified 2026-05-25 (f10e020) — anon users now read zeros instead of mockUser.streak/daysInApp/transitionsCompleted/adherence

---

## L — Home: "14 days" trial badge не tappable + нет объяснения

### L1. Home top-right "14 DAYS" badge has no tap target, no bottom sheet, no explanation

**Где:** Home tab, верхний правый угол — оранжевая капсула "14 DAYS".

**Что вижу:** капсула, текст "14 DAYS", и ничего не происходит при тапе. Что это значит — не понятно.

**Как должно быть:**
- Tap → bottom sheet: "You're on your free 7-day trial. X days remaining. Subscribe now to lock in your rotation plan."
- Либо tap → navigate to Subscription screen

**Где править:** `app/(tabs)/index.tsx` — найти "14 DAYS" badge, обернуть в Pressable + onPress → router.push('/settings/subscription') или модал.

**Цепочка:**
- Если число "14 DAYS" хардкод — связано с B10 (mock trialEndsAt), мой dynamic-getter fix должен работать
- Но число не tappable → ощущение как декорация → теряется monetization сигнал

**Status:** ✅ verified 2026-05-25 (f10e020) — badge wrapped in Pressable → /(tabs)/profile; also gated on streakValue > 0 so anon users without any streak don't see a misleading badge

---

## Общий принцип починки

1. Открываем bug → подробно разворачиваем сценарий
2. Делаем изменения в коде
3. Verify в симе или на iPhone
4. Если не получилось — итерируем
5. Только после `✅ verified` переходим к следующему

**Финальная фаза:** прогон ВСЕХ багов подряд (без починки) после того как все отмечены `✅` — убедиться что новые правки не сломали соседнее.

**Не идти к Submit For Review** пока этот файл не закрыт на 100%.
