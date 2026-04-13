# Funnel — ShiftRest
**Дата: 13 апреля 2026**

> Основано на: [PRACTICES-BRIEF.md](../03-practices/PRACTICES-BRIEF.md), [PRODUCT-VISION.md](../02-product/PRODUCT-VISION.md), [USER-FLOWS.md](./USER-FLOWS.md)

---

## 1. Воронка конверсии

```
App Store Impressions
    │
    │  [Store Page CVR: 35%+]
    │  Benchmark H&F iOS: 30.8% (AppTweak)
    ▼
Install (Download)
    │
    │  [Open Rate: 85%]
    │  15% never open after install
    ▼
First Open
    │
    │  [Onboarding Start: 95%]
    │  5% drop на Welcome screen
    ▼
Onboarding Started
    │
    │  [Completion: 60%+]
    │  Benchmark H&F D1: 26% (Business of Apps)
    │  Наша цель выше за счёт квиза + прогресс-бар
    ▼
Onboarding Complete (Aha-Moment Seen)
    │
    │  [Paywall Shown: 100%]
    │  Все видят paywall после aha-момента
    ▼
Paywall View
    │
    │  [Trial Start: 10%+]
    │  Benchmark median: 6.5%, p90: 20.3% (RevenueCat 2026)
    │  82% trial starts — в Day 0
    ▼
Trial Started (7-day)
    │
    │  [Trial-to-Paid: 40%+]
    │  Benchmark 7-day trial: ~45% median (RevenueCat 2026)
    ▼
Paid Subscriber
    │
    │  [D30 Retention: 10%+]
    │  Benchmark H&F median: 3% (Enable3), Top 10%: 15%+
    ▼
Active User (Month 2+)
    │
    │  [Monthly Churn: <10%]
    │  Годовой план retention до 36%
    ▼
Long-term Subscriber (Month 6+)
```

---

## 2. Детализация каждого шага воронки

### 2.1. App Store Impressions → Install

| Параметр | Значение |
|----------|----------|
| **Целевой CVR** | 35%+ (benchmark H&F iOS: 30.8%, [AppTweak](https://www.apptweak.com/en/aso-blog/average-app-conversion-rate-per-category)) |
| **Что делаем** | 8 скриншотов с benefit-driven текстом (первые 3 = полное УТП). Custom Product Pages для медсестёр/пожарных/заводских (+32% CVR). Рейтинг 4.5+. Title: «ShiftRest: Shift Work Sleep» |
| **Точки потери** | Непонятное УТП на скриншотах. Рейтинг <4.0 (-89% CVR). Нет social proof. Цена не ясна |
| **Re-engagement** | ASO итерации каждые 2 недели. A/B тест скриншотов. CPP для каждого сегмента |

### 2.2. Install → First Open

| Параметр | Значение |
|----------|----------|
| **Целевой %** | 85% открывают после установки |
| **Что делаем** | Push при установке отсутствует (нет разрешения). Полагаемся на мотивацию момента скачивания |
| **Точки потери** | Отвлёкся, забыл. Скачал «на потом». Место на телефоне закончилось |
| **Re-engagement** | Нет канала до первого открытия. Минимизируем размер app bundle (<50 MB) |

### 2.3. First Open → Onboarding Complete

| Параметр | Значение |
|----------|----------|
| **Целевой %** | 60%+ завершают онбординг (benchmark: 26% D1, [Business of Apps](https://www.businessofapps.com/data/app-onboarding-rates/)) |
| **Что делаем** | Прогресс-бар (+50% completion). Персонализация через квиз (+35% конверсии). Social proof 2 раза в точках drop-off. Sunk cost effect: каждый ответ = инвестиция. Loading screen (+10-20% конверсии). Aha-момент с конкретным планом ДО paywall |
| **Точки потери** | Шаг 3-4: «зачем столько вопросов» → social proof break решает. Шаг 7-8: усталость от квиза → имя + preview мотивируют. «Другое» профессия: нет подходящего шаблона → ручной ввод |
| **Re-engagement** | Сохранение прогресса: при re-open → продолжение с последнего шага. Push невозможен (нет разрешения ещё) |

### 2.4. Onboarding Complete → Paywall View

| Параметр | Значение |
|----------|----------|
| **Целевой %** | 100% — paywall показывается всем после aha-момента |
| **Что делаем** | Seamless transition: Aha-момент → Paywall. Paywall ощущается как логическое продолжение (не прерывание). Персонализированный заголовок с именем (+17% конверсии) |
| **Точки потери** | Нет — paywall обязателен в flow |
| **Re-engagement** | N/A |

### 2.5. Paywall View → Trial Started

| Параметр | Значение |
|----------|----------|
| **Целевой %** | 10%+ начинают trial (benchmark median: 6.5%, p90: 20.3%, [RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps/)) |
| **Что делаем** | 7-дневный trial (sweet spot: 52% приложений). 2 тарифа (+61% конверсии). Годовой «Лучший выбор» ($0.96/нед). Анимация (2.9x vs статический). Trial timeline (снижает страх). Буллеты ценности (benefits > features). «Может быть позже» видимая |
| **Точки потери** | «Дорого» → показываем $0.96/нед. «Не доверяю trial» → trial timeline. «Не уверен в ценности» → aha-момент уже показан. Ошибка оплаты → retry |
| **Re-engagement** | «Может быть позже» → Home (free). Контекстный paywall при tap на premium фичу (M01). Proactive paywall через 3 дня после отказа. Email/push (если opt-in) |

### 2.6. Trial Started → Paid Subscriber

| Параметр | Значение |
|----------|----------|
| **Целевой %** | 40%+ конвертируются после trial (benchmark 7-day: ~45%, [RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps/)) |
| **Что делаем** | 7 дней = 1 полный рабочий цикл медсестры (3 ночные + 4 выходных). День 1-3: пользователь следует плану на ночных сменах. День 4-6: Transition Plan — killer feature. День 7: видит результат перехода. Trial reminder на день 5: «Trial заканчивается через 2 дня. Не потеряйте ваш план!» |
| **Точки потери** | Day 0 cancel: 55% отмен (benchmark). Не почувствовал разницу за 7 дней. Забыл про trial → автосписание → refund request |
| **Re-engagement** | Push день 5: «Trial заканчивается скоро». Schedule-bound push каждый день trial: caffeine, melatonin, sleep — показывает ежедневную ценность. Transition Plan на выходных — aha-момент #2 |

### 2.7. Paid Subscriber → Active User (Month 2+)

| Параметр | Значение |
|----------|----------|
| **Целевой D30 retention** | 10%+ (benchmark H&F: 3%, top 10%: 15%, [Enable3](https://enable3.io/blog/app-retention-benchmarks-2025)) |
| **Целевой monthly churn** | <10% ([PRODUCT-VISION.md](../02-product/PRODUCT-VISION.md)) |
| **Что делаем** | Sleep Streak (3.6x engagement, Duolingo pattern). Schedule-bound notifications = ежедневная ценность привязана к реальному графику. Transition Plan каждый цикл = recurring return trigger. Персонализация усиливается со временем (AI learns) |
| **Точки потери** | Привыкание к плану → «я уже знаю, когда спать» → нужен continuing value. Сменил работу / график → план не актуален → нужен easy re-setup. Подписка дорогая → annual plan + pause |
| **Re-engagement** | Push: «Новый блок смен через 2 дня — план готов». Streak freeze (1 в неделю). Годовой план (retention до 36% vs 6.7% у месячного). Subscription pause (churn -11-20%). Weekly digest: «На этой неделе вы спали по плану 5/7 дней» |

### 2.8. Active User → Long-term Subscriber (Month 6+)

| Параметр | Значение |
|----------|----------|
| **Целевой D90 retention** | 6%+ (benchmark H&F: 1-2%, [GetStream](https://getstream.io/blog/app-retention-guide/)) |
| **Что делаем** | v1.1 фичи: Sleep Score (F9), Light Guide (F10), History (F11), HealthKit (F12). Milestone celebrations (30, 60, 90 дней). Периодические AI-инсайты: «За месяц ваш сон улучшился на 45 мин» |
| **Точки потери** | Feature fatigue. Конкурент с лучшим UX. Перестал работать сменно |
| **Re-engagement** | Rate app prompt (после milestone). In-app survey: «Что бы вы хотели улучшить?». Win-back email через 14 дней после churn: «Ваш план ждёт» + скидка |

---

## 3. Числовая модель воронки (Month 6)

Расчёт на основе целевых метрик:

```
100,000  App Store Impressions
    │  × 35% Store CVR
    ▼
 35,000  Installs
    │  × 85% Open Rate
    ▼
 29,750  First Opens
    │  × 60% Onboarding Completion
    ▼
 17,850  Onboarding Complete
    │  × 100% Paywall Shown
    ▼
 17,850  Paywall Views
    │  × 10% Trial Start
    ▼
  1,785  Trials Started
    │  × 40% Trial-to-Paid
    ▼
    714  Paid Subscribers (from this cohort)
    │  × 10% D30 Retention (all users)
    ▼
  2,975  MAU at Month 6 (cumulative)
```

**Revenue (Month 6):**
- 1,100 paid subscribers (cumulative) × $5.99 avg (mix of monthly/annual) = ~$4,950 MRR
- Соответствует [PRODUCT-VISION.md](../02-product/PRODUCT-VISION.md) target: MRR $4,950 at 6 months

---

## 4. Retention Loop (Hook Model)

Цикл, который возвращает пользователя каждый день/цикл смен:

### 4.1. Daily Loop (рабочие дни)

```
┌─────────────────────────────────────────────┐
│                                             │
│   TRIGGER (Триггер)                         │
│   Push: «Последний кофе — до 01:00 ☕»      │
│   Push: «Примите мелатонин сейчас 💊»       │
│   Push: «Пора готовиться ко сну 😴»         │
│   (привязаны к расписанию, не фиксированы)  │
│                     │                       │
│                     ▼                       │
│   ACTION (Действие)                         │
│   Открыть приложение (<30 сек)              │
│   Глянуть план / подтвердить шаг            │
│                     │                       │
│                     ▼                       │
│   REWARD (Награда)                          │
│   Variable: Контекстная карточка            │
│   (разная каждый раз по времени суток)      │
│   Social: Sleep Streak +1 🔥               │
│   «Выспался по плану» → celebrate           │
│                     │                       │
│                     ▼                       │
│   INVESTMENT (Инвестиция)                   │
│   Данные: каждый день → точнее план         │
│   Streak: не хочу терять 🔥                │
│   Transition checklist → прогресс           │
│   Персонализация → «моё» приложение         │
│                     │                       │
│                     ▼                       │
│              [Следующий день]                │
│                                             │
└─────────────────────────────────────────────┘
```

### 4.2. Cycle Loop (каждый блок смен, ~7 дней)

```
┌─────────────────────────────────────────────┐
│                                             │
│   TRIGGER (Триггер)                         │
│   Конец блока смен →                        │
│   Push: «Transition plan готов 🌅»          │
│   Начало нового блока →                     │
│   Push: «Новый план сна на 3 смены»         │
│                     │                       │
│                     ▼                       │
│   ACTION (Действие)                         │
│   Открыть Transition Plan (3-5 мин)         │
│   Пройти пошаговый checklist за 2-3 дня     │
│                     │                       │
│                     ▼                       │
│   REWARD (Награда)                          │
│   🎉 Transition Complete celebration        │
│   «Вы перешли на дневной режим!»            │
│   Первый нормальный выходной с семьёй       │
│   (реальная награда > digital)              │
│                     │                       │
│                     ▼                       │
│   INVESTMENT (Инвестиция)                   │
│   AI: каждый цикл → умнее рекомендации      │
│   History: данные за N циклов               │
│   «5 transition plans завершено» (badge)     │
│   Коллегам порекомендовала (word of mouth)   │
│                     │                       │
│                     ▼                       │
│         [Следующий блок смен]               │
│                                             │
└─────────────────────────────────────────────┘
```

### 4.3. Почему этот loop работает для shift workers

| Фактор | Обоснование |
|--------|-------------|
| **Schedule-bound triggers** | Уведомления привязаны к реальному графику, а не к фиксированному времени. Утренний push в 07:45 после ночной ≠ утренний push в 07:45 на выходном. Персонализация +58% CTR ([OneSignal](https://onesignal.com/mobile-app-benchmarks-2024)) |
| **Recurring pain** | Переход ночь↔день происходит каждые 4-7 дней. Боль повторяется → trigger повторяется → привычка формируется |
| **Real-world reward** | «Первый нормальный выходной с детьми» > любой digital badge. Реальная награда = сильнейший мотиватор |
| **Growing investment** | Чем больше циклов → тем точнее AI → тем ценнее приложение. Уход = потеря персонализации |
| **Low-friction action** | <30 сек: глянул → закрыл. Не требует «сидеть в приложении». Подходит для Марины: 1-2 мин сессии |

---

## 5. Re-engagement стратегия для потерянных пользователей

### 5.1. По стадии воронки

| Потерян на | Когда возвращаем | Как | Канал |
|-----------|-----------------|-----|-------|
| Onboarding (не завершил) | Через 24ч | «Ваш план ждёт — осталось 2 шага!» | Push (если есть), иначе — нет канала |
| Paywall (отказался) | Через 3 дня | Контекстный paywall при tap на premium фичу | In-app |
| Trial (отменил Day 0) | День 5 trial | «Попробуйте Transition Plan до конца trial» | Push |
| Trial (не конвертировался) | День 7 + 3 дня | «Ваш план пересчитан с учётом нового расписания» | Push + In-app banner |
| Paid (churned) | Через 14 дней | «Ваш план ждёт. Скидка 30% на первый месяц» | Email + Push |
| Inactive (>7 дней) | День 7, 14 | «Новый блок смен скоро — план готов» | Push |
| Inactive (>30 дней) | День 30 | «Мы обновили алгоритм! Посмотрите новый план» | Email |

### 5.2. Push Notification Strategy

| Тип | Частота | Время | CTR target |
|-----|---------|-------|------------|
| Schedule-bound (caffeine, melatonin, sleep) | 2-3/день в рабочие дни | По расписанию пользователя | 8%+ |
| Transition Plan trigger | 1/цикл смен | Утро после последней смены | 12%+ |
| Streak reminder | 1/день (если не открыл) | Вечер | 5%+ |
| Weekly digest | 1/неделю | Воскресенье утро | 3%+ |
| **Суммарно** | **Max 2-3/день** | — | — |

**Правила:**
- Никогда не будить во время sleep window (тихие часы автоматические)
- Max 3 push в день (incl. schedule-bound)
- Если пользователь не открывает 3 push подряд → снизить до 1/день
- Opt-out rate target <20% через 30 дней ([PRODUCT-VISION.md](../02-product/PRODUCT-VISION.md))

---

## 6. Ключевые метрики для мониторинга

### 6.1. Воронка (weekly tracking)

| Метрика | Формула | Target | Источник бенчмарка |
|---------|---------|--------|-------------------|
| Store CVR | Installs / Impressions | 35%+ | AppTweak H&F iOS: 30.8% |
| Onboarding Completion | Completed / Started | 60%+ | Business of Apps: 26% D1 |
| Trial Start Rate | Trials / Paywall Views | 10%+ | RevenueCat 2026: 6.5% median |
| Trial-to-Paid | Paid / Trial Started | 40%+ | RevenueCat 2026: ~45% (7-day) |
| Install-to-Paid | Paid / Installs | 2.5%+ | Apphud: 1.7% median, 4.2% top |

### 6.2. Retention (cohort tracking)

| Метрика | Target | Источник бенчмарка |
|---------|--------|-------------------|
| D1 Retention | 35% | Adjust: 20-27% median, 40%+ top |
| D7 Retention | 20% | Enable3: ~7% median, 25%+ top 10% |
| D30 Retention | 10% | Enable3: ~3% median, 15%+ top 10% |
| D90 Retention | 6% | GetStream: 1-2% median |
| Monthly Churn | <10% | PRODUCT-VISION.md |
| Notification Opt-in | 70%+ | PRODUCT-VISION.md |
| Notification Opt-out D30 | <20% | PRODUCT-VISION.md |

### 6.3. Product engagement (weekly)

| Метрика | Target | Почему |
|---------|--------|--------|
| Transition Plan engagement | 60%+ paid users/мес | Killer feature = core retention |
| Schedule completion | 80%+ users | Без расписания нет ценности |
| Avg. session duration | <2 мин | Марина хочет «глянул → закрыл» |
| Sessions/week (рабочий блок) | 5+ | Ежедневно на рабочем блоке |
| Sessions/week (выходные) | 2-3 | Transition + check-in |

---

## Источники

- [PRACTICES-BRIEF.md](../03-practices/PRACTICES-BRIEF.md) — все бенчмарки конверсии и retention
- [PRODUCT-VISION.md](../02-product/PRODUCT-VISION.md) — KPI targets (3.1-3.3)
- [TARGET-AUDIENCE.md](../02-product/TARGET-AUDIENCE.md) — контекст использования, сессии <2 мин
- [ONBOARDING-RESEARCH.md](../03-practices/ONBOARDING-RESEARCH.md) — drop-off rates, conversion tactics
- [PAYWALL-RESEARCH.md](../03-practices/PAYWALL-RESEARCH.md) — trial benchmarks, paywall conversion
- [USER-FLOWS.md](./USER-FLOWS.md) — flows определяют шаги воронки
