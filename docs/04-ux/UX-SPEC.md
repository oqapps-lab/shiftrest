# UX Specification — ShiftRest
**Дата: 13 апреля 2026**

> Синтез: [USER-FLOWS.md](./USER-FLOWS.md), [SCREEN-MAP.md](./SCREEN-MAP.md), [WIREFRAMES.md](./WIREFRAMES.md), [FUNNEL.md](./FUNNEL.md)

---

## 1. Общие принципы UX

### Принцип 1: Glance & Go (Глянул и пошёл)

**Правило:** Любой экран должен передать ключевую информацию за <5 секунд. 80% сессий — менее 1 минуты.

**Почему:** Марина (primary persona) — медсестра после 12-часовой ночной смены. Она уставшая, хочет знать «когда спать» и закрыть приложение. Алексей (пожарный) ещё лаконичнее — <30 секунд.

**Как применять:**
- Контекстная карточка на Home показывает «что делать сейчас» без скролла
- Числа и времена крупным шрифтом (≥24sp)
- Цветовая кодировка: зелёный (OK), жёлтый (скоро), красный (прошло) — для caffeine cutoff
- Минимум текста, максимум визуальных cues

### Принцип 2: Non-Judgmental by Default (Без осуждения)

**Правило:** Приложение никогда не штрафует, не показывает «плохие» метрики, не использует красные scores.

**Почему:** #1 причина удаления приложений shift workers — красные sleep scores за дневной сон. Sleep Cycle, Oura, Garmin — все штрафуют за «неправильное» время сна. ([TARGET-AUDIENCE.md](../02-product/TARGET-AUDIENCE.md), триггеры удаления)

**Как применять:**
- Тон: «Отлично адаптируетесь» вместо «Плохой сон»
- Streak: «4 дня по плану 🔥» вместо «Пропущено 3 дня»
- Transition: «Переход завершён!» вместо «Восстановление после нарушения»
- Визуально: синий/фиолетовый (спокойствие), не красный (тревога)

### Принцип 3: Schedule-First (Расписание первично)

**Правило:** Всё в приложении начинается с расписания смен. Без расписания = пустое состояние с CTA добавить.

**Почему:** ShiftRest — планировщик, не трекер. Расписание = фундамент для всех рекомендаций: sleep window, caffeine cutoff, melatonin timing, transition plan. ([FEATURES.md](../02-product/FEATURES.md), F1: P0)

**Как применять:**
- Онбординг: выбор шаблона ротации на шаге 2-3
- Home: всегда показывает «сегодняшний план» привязанный к текущей смене
- Notifications: привязаны к расписанию, не к фиксированному времени
- Пустое состояние: везде → «Добавьте расписание»

### Принцип 4: Progressive Trust (Доверие по нарастающей)

**Правило:** Сначала покажи ценность, потом проси что-то (данные, деньги, разрешения).

**Почему:** 35% пользователей уходят при запросе регистрации до ценности. Paywall до aha-момента даёт 2% trial vs 12% после. ([ONBOARDING-RESEARCH.md](../03-practices/ONBOARDING-RESEARCH.md), [PAYWALL-RESEARCH.md](../03-practices/PAYWALL-RESEARCH.md))

**Как применять:**
- Квиз перед регистрацией (deferred registration)
- Aha-момент (конкретный план) ПЕРЕД paywall
- Notification permission ПОСЛЕ paywall с контекстом
- Контекстный paywall при tap на premium (не прерывающий)

### Принцип 5: Empathetic Expertise (Эмпатичная экспертиза)

**Правило:** Тон — как опытная коллега-медсестра, которая «всё это прошла». Не врач сверху, не бот.

**Почему:** Shift workers не доверяют generic «спите 8 часов». Они доверяют коллегам. Social proof от медсестёр конвертирует лучше экспертных цитат. ([TARGET-AUDIENCE.md](../02-product/TARGET-AUDIENCE.md), каналы discovery)

**Как применять:**
- Отзывы в онбординге: от конкретных медсестёр/пожарных
- Объяснения: «Почему именно так?» — доступным языком, со ссылкой на науку
- Disclaimers: «Это информация, не назначение» — уважительно, не patronizing
- Имя: обращение по имени на Home и Paywall

---

## 2. Навигация

### 2.1. Тип навигации: Bottom Tab Bar (4 tabs) + Stack

**Обоснование:**
- Tab bar — стандарт для H&F приложений (RISE, Sleep Cycle, Calm)
- 4 tab — оптимальное количество для thumb zone на iPhone/Android
- Shift workers используют одной рукой (часто после смены, лёжа в кровати)

### 2.2. Структура

```
Bottom Tab Bar:
┌────────┬────────────┬────────────┬─────────┐
│  Home  │  Schedule  │ Sleep Plan │ Profile │
│   🏠   │    📅      │    😴      │   👤    │
└────────┴────────────┴────────────┴─────────┘
```

| Tab | Stack | Deep Link |
|-----|-------|-----------|
| Home | Home → (modals) | Default tab при открытии |
| Schedule | Calendar → Add/Edit Shift → Template → Repeat | Push: «Расписание закончилось» |
| Sleep Plan | Daily Plan → Caffeine / Melatonin / Transition → Day Detail / Explanation | Push: caffeine, melatonin, sleep, transition |
| Profile | Overview → Preferences / Notifications / Subscription / About | Settings deep link |

### 2.3. Дополнительная навигация

| Паттерн | Где | Как |
|---------|-----|-----|
| **Onboarding** | First launch | Full-screen stack, no tab bar, forward-only, прогресс-бар |
| **Modals** | Paywall, Premium Gate, Celebration, Shift Changed | Slide up, dismiss by swipe down / button |
| **Swipe** | Sleep Plan: вчера/сегодня/завтра | Horizontal page swipe |
| **Deep Links** | Push → конкретный экран | Поддержка для всех push типов |
| **Back** | Внутри stack | iOS: swipe from edge, Android: system back |

---

## 3. Состояния экранов

### 3.1. Таблица состояний

| Экран | Loading | Empty | Data | Error | Premium Lock |
|-------|---------|-------|------|-------|-------------|
| **Home** | Skeleton (1 сек max) | S22: «Добавьте расписание» + CTA | S20/S21: план + streak + events | Offline banner + cached plan | S23: базовый план + locked cards |
| **Schedule** | Calendar skeleton | «Нет смен. Добавьте первую» + FAB | S30: цветной календарь | Offline: cached calendar, read-only | — (доступен бесплатно) |
| **Add Shift** | — | Pre-filled с defaults | Filled form | Validation error inline | — |
| **Sleep Plan** | Timeline skeleton | «План появится после добавления расписания» | S40: timeline + cards | Offline: cached plan. API error: rule-based fallback | Transition + Melatonin + AI locked |
| **Caffeine Detail** | — | — (всегда есть данные если есть план) | S41: cutoff + explanation | — | — (доступен бесплатно) |
| **Melatonin Detail** | — | — | S42: timing + dose + disclaimer | — | 🔒 Premium |
| **Transition Plan** | «Создаём план...» (2 сек) | «Нет перехода сейчас. Следующий: через X дней» | S43: checklist + timeline | Offline: template-based fallback | 🔒 Premium |
| **Profile** | Skeleton | — (всегда есть после онбординга) | S50: stats + settings | — | — |
| **Notification Settings** | — | — | S52: toggles | System permission blocked: deep link to Settings | — |

### 3.2. Loading Strategy

| Тип | Реализация | Время |
|-----|-----------|-------|
| App startup | Splash screen с logo → Home | <2 сек |
| Data fetch | Skeleton screens (не spinner) | <1 сек (cached), <3 сек (API) |
| Plan generation | Progress animation с текстом | 3-5 сек (онбординг), <2 сек (recalc) |
| Image loading | Placeholder → fade in | Progressive |

### 3.3. Offline Strategy

| Компонент | Offline поведение |
|-----------|------------------|
| Home | Cached plan. Banner: «Offline — последний план» |
| Schedule | Cached calendar. Read-only (нельзя добавить) |
| Sleep Plan | Cached plan или rule-based fallback |
| Transition Plan | Template-based plan (без AI) |
| Profile | Full access (local data) |
| Paywall | Не показывается. Retry при reconnect |
| Onboarding | Нельзя начать (нужен API). Banner: «Нет интернета» |

---

## 4. Микро-интеракции

### 4.1. Анимации

| Элемент | Анимация | Технология | Цель |
|---------|----------|-----------|------|
| Onboarding: переход между шагами | Slide left (300ms, ease-out) | React Native Animated / Reanimated | Ощущение прогресса |
| Прогресс-бар онбординга | Fill animation (200ms) | Animated | Endowed progress effect |
| Loading screen | Sequential text + progress ring | Reanimated + Lottie | Perceived value (+10-20% конверсии) |
| Aha-момент: timeline | Staggered card entrance (50ms delay) | Reanimated | «Wow» эффект |
| Paywall: вход | Slide up + fade (400ms) | React Navigation modal | Seamless transition |
| Paywall: animation | Animated timeline preview | Lottie | 2.9x конверсия vs статический |
| Sleep Plan: timeline | Draw-in animation (500ms) | Reanimated SVG | Визуальный фокус |
| Caffeine status: цвет | Color transition (green→yellow→red, 300ms) | Animated | Мгновенная считываемость |
| Celebration (M05) | Confetti + scale bounce (1s) | Lottie | Дофаминовая награда |
| Streak counter | Count up + bounce (300ms) | Reanimated | Micro-reward |
| Checkbox (Transition) | Scale + check mark draw (200ms) | Animated | Тактильная обратная связь |
| Tab bar switch | Cross-fade (200ms) | React Navigation | Плавность |
| Swipe (Sleep Plan days) | Horizontal pager snap | Reanimated | Нативное ощущение |

### 4.2. Haptic Feedback

| Действие | Тип haptic | API |
|----------|-----------|-----|
| Нажатие CTA кнопки | Medium impact | Haptics.impactAsync(ImpactFeedbackStyle.Medium) |
| Выбор в квизе (onboarding) | Light impact | Haptics.impactAsync(ImpactFeedbackStyle.Light) |
| Checkbox toggle (Transition) | Light impact | Haptics.impactAsync(ImpactFeedbackStyle.Light) |
| Celebration / milestone | Heavy impact | Haptics.impactAsync(ImpactFeedbackStyle.Heavy) |
| Paywall: начать trial | Success notification | Haptics.notificationAsync(NotificationFeedbackType.Success) |
| Error (validation) | Error notification | Haptics.notificationAsync(NotificationFeedbackType.Error) |
| Streak +1 | Light impact | Haptics.impactAsync(ImpactFeedbackStyle.Light) |

### 4.3. Transitions

| Transition | Тип | Когда |
|-----------|-----|-------|
| Stack push | Slide from right (iOS), Slide from bottom (Android) | Навигация внутри tab |
| Stack pop | Slide to right (iOS), Fade (Android) | Назад |
| Modal present | Slide up | Paywall, Celebration, Feature Gate |
| Modal dismiss | Slide down (swipe gesture) | Закрытие modal |
| Tab switch | Cross-fade | Bottom tab bar |
| Onboarding | Slide left (forward only) | Шаги квиза |

---

## 5. Accessibility

### 5.1. Минимальные требования

| Требование | Стандарт | Реализация |
|-----------|---------|------------|
| **Контраст текста** | WCAG 2.1 AA — 4.5:1 (normal), 3:1 (large) | Все тексты проверить через контраст-чекер. Тёмные тона на светлом фоне |
| **Minimum touch target** | 44x44 pt (Apple HIG), 48x48 dp (Material) | Все кнопки, toggles, checkboxes. Padding для мелких элементов |
| **Font sizes** | Dynamic Type (iOS), Accessible font scaling (Android) | Поддержка системных настроек размера шрифта. Min: 14sp body, 12sp caption |
| **VoiceOver / TalkBack** | Все интерактивные элементы с labels | accessibilityLabel на всех кнопках, карточках, toggles. Иконки: decorative (no label) или informational (label) |
| **Screen reader navigation** | Логический порядок | accessibilityRole для всех элементов. Headers для секций. Группировка связанных элементов |
| **Color не единственный индикатор** | WCAG 2.1 1.4.1 | Caffeine status: цвет + текст («OK» / «Cutoff прошёл»). Timeline: цвет + pattern/label |
| **Motion** | Reduce Motion support | Проверка AccessibilityInfo.isReduceMotionEnabled. Fallback: без анимации (instant transitions) |

### 5.2. Специфичные для ShiftRest

| Ситуация | Проблема | Решение |
|----------|---------|---------|
| Тёмная комната (перед сном) | Яркий экран мешает | Dark mode обязателен. Auto-switch по системным настройкам. Опция «всегда тёмная» |
| Усталый пользователь | Мелкие элементы, сложные жесты | Крупные touch targets (52pt на key actions). Простые жесты (tap > swipe > long press) |
| Одна рука (лёжа) | Элементы в верхней части экрана | Key actions в нижней 2/3 экрана. Bottom sheet вместо top alerts. Tab bar always visible |
| Ночная смена (яркость минимальная) | Низкий контраст | Проверить все цвета при минимальной яркости. Нет чистого белого (#FFFFFF) в dark mode |

---

## 6. Список всех экранов (финальная таблица)

| # | ID | Экран | Раздел | Фичи | Приоритет | Состояния |
|---|----|-------|--------|------|-----------|-----------|
| 1 | S01 | Welcome | Onboarding | F6 | P0 | Default |
| 2 | S02 | Profession Picker | Onboarding | F6 | P0 | Default |
| 3 | S03 | Schedule Template | Onboarding | F6, F1 | P0 | Default, «Другое» |
| 4 | S04 | Current Shift | Onboarding | F6, F1 | P0 | Default |
| 5 | S05 | Main Problem | Onboarding | F6 | P0 | Default |
| 6 | S06 | Social Proof Break #1 | Onboarding | F6 | P0 | По профессии (3 варианта) |
| 7 | S07 | Chronotype Quiz | Onboarding | F6 | P0 | Default |
| 8 | S08 | Caffeine Habits | Onboarding | F6 | P0 | Default |
| 9 | S09 | Melatonin Usage | Onboarding | F6 | P0 | Yes/No toggle |
| 10 | S10 | Family & Commitments | Onboarding | F6 | P0 | With/without kids |
| 11 | S11 | Name Input | Onboarding | F6 | P0 | Default |
| 12 | S12 | Social Proof Break #2 | Onboarding | F6 | P0 | По профессии (3 варианта) |
| 13 | S13 | Loading / Analysis | Onboarding | F6 | P0 | Animation |
| 14 | S14 | Aha-Moment (Plan Preview) | Onboarding | F6, F2 | P0 | Default |
| 15 | S15 | Paywall (Primary) | Onboarding | Monetization | P0 | Default, trial active, error |
| 16 | S16 | Notification Permission | Onboarding | F7 | P1 | Default, already granted |
| 17 | S20 | Home (рабочий день) | Main / Home | F2, F4, F5 | P0 | Loading, data, premium |
| 18 | S21 | Home (выходной) | Main / Home | F2 | P0 | Data |
| 19 | S22 | Home (пустое) | Main / Home | — | P0 | Empty |
| 20 | S23 | Home (free user) | Main / Home | Monetization | P1 | Free tier |
| 21 | S30 | Calendar View | Main / Schedule | F1 | P0 | Empty, data |
| 22 | S31 | Add Shift | Main / Schedule | F1 | P0 | Default, validation error |
| 23 | S32 | Edit Shift | Main / Schedule | F1 | P0 | Data, delete confirm |
| 24 | S33 | Template Picker | Main / Schedule | F1 | P0 | Default |
| 25 | S34 | Repeat Settings | Main / Schedule | F1 | P1 | Default |
| 26 | S40 | Daily Sleep Plan | Main / Sleep Plan | F2, F4, F5, F8 | P0 | Loading, data, offline |
| 27 | S41 | Caffeine Cutoff Detail | Main / Sleep Plan | F4 | P1 | Green/yellow/red |
| 28 | S42 | Melatonin Timing Detail | Main / Sleep Plan | F5 | P1 | Data, disclaimer |
| 29 | S43 | Transition Plan | Main / Sleep Plan | F3 | P0 | Loading, data, empty, offline |
| 30 | S44 | Transition Day Detail | Main / Sleep Plan | F3 | P0 | Checklist states |
| 31 | S45 | Plan Explanation | Main / Sleep Plan | F8 | P1 | Data |
| 32 | S46 | Weekly Plan Overview | Main / Sleep Plan | F2 | P1 | Data |
| 33 | S50 | Profile Overview | Main / Profile | — | P1 | Data |
| 34 | S51 | Sleep Preferences | Main / Profile | F6 | P1 | Data (editable) |
| 35 | S52 | Notification Settings | Main / Profile | F7 | P1 | Data (toggles) |
| 36 | S53 | Subscription Management | Main / Profile | Monetization | P1 | Free, trial, paid |
| 37 | S54 | About / Support | Main / Profile | — | P2 | Static |
| 38 | M01 | Paywall (контекстный) | Modal | Monetization | P1 | Default, error |
| 39 | M02 | Push Permission Primer | Modal | F7 | P1 | Default |
| 40 | M03 | Premium Feature Gate | Modal | Monetization | P1 | Preview + lock |
| 41 | M04 | Shift Changed | Modal | F1 | P1 | Confirm |
| 42 | M05 | Celebration | Modal | Retention | P1 | Streak / Transition |
| 43 | M06 | Rate App | Modal | ASO | P2 | Default |
| 44 | M07 | Welcome Back | Modal | Retention | P2 | Default |
| 45 | M08 | Schedule Expired | Modal | F1 | P1 | Default |
| 46 | M09 | Disclaimer | Modal | Compliance | P1 | Default |
| 47 | X01 | Loading (startup) | System | — | P0 | Animation |
| 48 | X02 | No Internet | System | — | P1 | Default |
| 49 | X03 | Force Update | System | — | P2 | Default |
| 50 | X04 | Maintenance | System | — | P2 | Default |

### Сводка

| Категория | Экранов | P0 | P1 | P2 |
|-----------|---------|----|----|-----|
| Onboarding | 16 | 14 | 2 | 0 |
| Home | 4 | 3 | 1 | 0 |
| Schedule | 5 | 4 | 1 | 0 |
| Sleep Plan | 7 | 4 | 3 | 0 |
| Profile | 5 | 0 | 4 | 1 |
| Modals | 9 | 0 | 7 | 2 |
| System | 4 | 1 | 1 | 2 |
| **Итого** | **50** | **26** | **19** | **5** |

**Для MVP (P0):** 26 экранов — минимум для запуска
**Для v1.0 (P0+P1):** 45 экранов — полный запуск
**Для v1.1 (все):** 50 экранов — включая nice-to-have

---

## 7. Design System: Ключевые решения

### 7.1. Цветовая палитра (направления)

| Назначение | Цвет | Обоснование |
|-----------|------|-------------|
| Primary (сон, спокойствие) | Deep blue / indigo | Ассоциация со сном, ночным небом |
| Secondary (энергия, день) | Warm amber / gold | Солнечный свет, дневной режим |
| Accent (действие) | Soft purple | Мелатонин, twilight |
| Success / Streak | Teal / green | Позитив без агрессии |
| Warning (caffeine) | Amber → red gradient | Интуитивный traffic light |
| Background (light) | Off-white (#F8F9FA) | Не слепит после ночной смены |
| Background (dark) | Deep navy (#0D1B2A) | Минимум синего света |

### 7.2. Typography

| Уровень | Размер | Weight | Использование |
|---------|--------|--------|--------------|
| H1 | 28sp | Bold | Заголовки экранов |
| H2 | 22sp | SemiBold | Секции |
| H3 | 18sp | SemiBold | Подзаголовки карточек |
| Body | 16sp | Regular | Основной текст |
| Body Small | 14sp | Regular | Вторичный текст |
| Caption | 12sp | Regular | Labels, timestamps |
| Time Display | 32sp | Bold | Ключевые времена (caffeine cutoff, sleep start) |

### 7.3. Spacing & Layout (3-Layer System)

Согласно CLAUDE.md:

| Layer | Positioning | Содержимое |
|-------|-----------|-----------|
| **Background** | `position: absolute`, заполняет экран | Градиенты (night blue → dawn), images |
| **Content** | `flex: 1`, ScrollView если нужно | Карточки, тексты, interactive elements |
| **Floating UI** | `position: absolute`, bottom/top | CTA кнопки (onboarding), Tab Bar, Headers |

**Spacing scale:** 4, 8, 12, 16, 24, 32, 48 (8pt grid)
**Card border radius:** 16
**Button height:** 52 (primary), 44 (secondary)
**Card padding:** 16 внутри

---

## Источники

Этот документ синтезирует все документы Stage 4 UX:
- [USER-FLOWS.md](./USER-FLOWS.md) — 5 user flows
- [SCREEN-MAP.md](./SCREEN-MAP.md) — 50 экранов, навигация
- [WIREFRAMES.md](./WIREFRAMES.md) — 15 ASCII wireframes
- [FUNNEL.md](./FUNNEL.md) — воронка, retention loop, метрики

И документы предыдущих этапов:
- [FEATURES.md](../02-product/FEATURES.md) — F1-F8 → экраны
- [TARGET-AUDIENCE.md](../02-product/TARGET-AUDIENCE.md) — персоны → UX принципы
- [PRODUCT-VISION.md](../02-product/PRODUCT-VISION.md) — KPI → метрики воронки
- [PRACTICES-BRIEF.md](../03-practices/PRACTICES-BRIEF.md) — бенчмарки, best practices
- [ONBOARDING-RESEARCH.md](../03-practices/ONBOARDING-RESEARCH.md) — onboarding patterns
- [PAYWALL-RESEARCH.md](../03-practices/PAYWALL-RESEARCH.md) — paywall patterns
