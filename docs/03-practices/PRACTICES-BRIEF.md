# Синтез исследований — Best Practices Brief
**Дата: 13 апреля 2026**

> Синтез документов: [ONBOARDING-RESEARCH.md](./ONBOARDING-RESEARCH.md), [PAYWALL-RESEARCH.md](./PAYWALL-RESEARCH.md), [RETENTION-RESEARCH.md](./RETENTION-RESEARCH.md), [ASO-RESEARCH.md](./ASO-RESEARCH.md)

---

## 1. MUST-DO чеклист (что ОБЯЗАТЕЛЬНО внедрить)

### Онбординг

- [ ] **15-20 экранов квиза** с прогресс-баром — длинные квизы в H&F стандартны (Noom 96, RISE 47, Flo 400+). Прогресс-бар +50% completion rate. ([UserGuiding](https://userguiding.com/blog/user-onboarding-statistics), [RevenueCat](https://www.revenuecat.com/blog/growth/why-your-onboarding-experience-might-be-too-short/))
- [ ] **Персонализация через квиз** — сбор данных о профессии, графике, проблемах со сном. Персонализированный онбординг +35% конверсии, +50% retention. ([AppAgent](https://appagent.com/blog/mobile-app-onboarding/))
- [ ] **Имя пользователя** — +13% конверсии просто от поля с именем, +17% при использовании на пейволле. ([Adapty](https://adapty.io/blog/how-to-build-app-onboarding-flows-that-convert/), [NamiML](https://www.nami.ml/blog/personalized-paywall-conversion-boost))
- [ ] **Loading screen перед результатом** — «Анализируем ваш профиль сна...» +10-20% к конверсии (паттерн Noom). ([Retention.blog](https://www.retention.blog/p/the-longest-onboarding-ever))
- [ ] **Aha-момент ДО пейволла** — показать конкретный план сна с временами. Upfront paywall после aha-момента: ~12% trial-to-paid vs 2% без. ([Dev.to](https://dev.to/paywallpro/the-paywall-timing-paradox-why-showing-your-price-upfront-can-5x-your-conversions-4alc))
- [ ] **Social proof 2-3 раза** — в точках drop-off. +30-33% к конверсии. Использовать отзывы от конкретных профессий. ([Glance](https://thisisglance.com/learning-centre/when-should-apps-use-social-proof-in-onboarding), [UserGuiding](https://userguiding.com/blog/user-onboarding-statistics))

### Paywall

- [ ] **Soft paywall с 7-дневным trial** — sweet spot (52% приложений). Медиана trial-to-paid ~45% для 5-9 дней. Для sleep-приложения 7 дней = 1 полный рабочий цикл. ([RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps/))
- [ ] **2 тарифа: месячный $5.99 + годовой $49.99** — переход от 1 к 2 тарифам +61% конверсии. Годовой = «Лучший выбор», показ как $0.96/нед. ([Adapty](https://adapty.io/blog/trial-conversion-rates-for-in-app-subscriptions/))
- [ ] **Буллеты ценности (3-5 пунктов)** — фокус на benefits, не features. Буллеты побеждают таблицы на мобильных. Решение за 3 секунды. ([Stormy AI](https://stormy.ai/blog/10-mobile-app-paywall-design-principles))
- [ ] **Trial timeline** — «Начало trial → Напоминание на 5-й день → Списание на 7-й день». Стандарт Apple, снижает страх. ([DEV Community](https://dev.to/paywallpro/effective-paywall-examples-in-health-fitness-apps-2025-3op9))
- [ ] **Двойное размещение paywall** — после онбординга (основной, 50% конверсий в Day 0) + контекстный (при доступе к premium-фичам). ([RevenueCat](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026/), [NamiML](https://www.nami.ml/blog/paywall-placement))
- [ ] **Анимированный paywall** — 2.9x конверсия vs статический. ([Business of Apps](https://www.businessofapps.com/insights/paywall-optimization-reimagined/))

### Retention

- [ ] **Быстрый aha-момент (первые 60 секунд)** — план сна с конкретными временами сразу после квиза. 75% пользователей уходят Week 0→Week 1. ([Digia](https://www.digia.tech/post/mobile-app-onboarding-activation-retention))
- [ ] **Daily Reminder prompt** — показать после первой сессии. Calm: пользователи с Daily Reminder = 3x retention. ([Amplitude — Calm](https://amplitude.com/case-studies/calm))
- [ ] **Push-уведомления 1-2/день, привязанные к расписанию** — утро: «Твой план сна на сегодня», вечер: «Через 2 часа wind-down». Персонализированные push +58% CTR, утренние push (5-7 AM) CTR 5.33%. ([OneSignal](https://onesignal.com/mobile-app-benchmarks-2024), [ContextSDK](https://contextsdk.com/blogposts/peak-times-to-send-push-notifications-for-best-ctr))
- [ ] **Sleep Streak + Streak Freeze** — серии = главный драйвер Duolingo (3.6x long-term engagement). Streak Freeze -21% churn. Адаптировать: «Выспись по плану 4 из 7 дней» для сменных работников. ([Orizon](https://www.orizon.co/blog/duolingos-gamification-secrets), [Orangesoft](https://orangesoft.co/blog/strategies-to-increase-fitness-app-engagement-and-retention))
- [ ] **Sleep Debt как числовая метрика** — видимое число, которое пользователь стремится снизить. Паттерн RISE Science. ([Rise Science](https://www.risescience.com/))
- [ ] **Годовой план + Pause** — годовой retention до 36% vs 6.7% у месячного. Pause снижает churn на 11-20%. ([RevenueCat 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/))

### ASO

- [ ] **Title: «ShiftRest: Shift Work Sleep»** — ключевые слова в начале, бренд узнаваем, вмещается в 23-26 видимых символов. ([Adapty](https://adapty.io/glossary/app-title/))
- [ ] **8 скриншотов с benefit-driven текстом** — первые 3 = полное ценностное предложение (90% не листают дальше). Скриншоты +20-35% конверсии. ([ASOmobile](https://asomobile.net/en/blog/screenshots-for-app-store-and-google-play-in-2025-a-complete-guide/), [TechMagnate](https://www.techmagnate.com/blog/app-store-screenshots-optimization/))
- [ ] **Рейтинг 4.5+ с момента запуска** — рост с 3 до 4 звёзд = +89% конверсии. Порог 4.0 критически важен. ([Appalize](https://www.appalize.com/da/blog/app-marketing/app-store-ratings-impact-on-downloads-data-driven-analysis))
- [ ] **Custom Product Pages** — отдельные CPP для медсестёр, пожарных, фабричных рабочих. CPP +32% конверсия. ([MobileAction](https://www.mobileaction.co/blog/custom-product-pages-meet-organic-search/))

---

## 2. AVOID чеклист (чего ИЗБЕГАТЬ)

- [ ] **Не требовать регистрацию до aha-момента** — потеря до 35% на этапе sign-up. Deferred registration (паттерн Duolingo). ([Jumio](https://www.jumio.com/how-to-reduce-customer-abandonment/))
- [ ] **Не перегружать экраны** — один вопрос = один экран. Каждый доп. шаг теряет ~20% пользователей. ([Gabor Cselle](https://medium.com/gabor/every-step-costs-you-20-of-users-b613a804c329))
- [ ] **Не использовать 3-дневный trial** — >55% отмен в Day 0. 7 дней — оптимум. ([RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps/))
- [ ] **Не показывать hard paywall без демонстрации ценности** — медитационное приложение: -40% конверсии при hard paywall без интро. ([DEV Community](https://dev.to/paywallpro/when-upfront-paywalls-work-and-when-they-hurt-conversion-54k1))
- [ ] **Не спамить push-уведомлениями** — 3-6 push/неделю: 40% отключают. Push — «охраняемый канал» (Duolingo). Макс. 1-2/день, только релевантные. ([Business of Apps](https://www.businessofapps.com/marketplace/push-notifications/research/push-notifications-statistics/), [TryPropel](https://www.trypropel.ai/resources/duolingo-customer-retention-strategy))
- [ ] **Не использовать «пустую» геймификацию** — бейджи без привязки к реальным результатам = раздражение. Каждый элемент → реальное достижение. ([Storyly](https://www.storyly.io/post/gamification-strategies-to-increase-app-engagement))
- [ ] **Не использовать лидерборды** — мотивируют лидеров, демотивируют отстающих. Сон — интимная тема. ([Storyly](https://www.storyly.io/post/gamification-strategies-to-increase-app-engagement))
- [ ] **Не скрывать кнопку закрытия paywall** — видимая «Может быть позже» (как Headspace). Скрытый X снижает доверие. ([Blake Crosley — Headspace](https://blakecrosley.com/guides/design/headspace))
- [ ] **Не использовать generic отзывы** — «Невероятное приложение!» неубедительно. Детальные, конкретные отзывы от медсестёр/пожарных. ([AppTweak](https://www.apptweak.com/en/aso-blog/10-tips-to-optimize-your-app-paywall))
- [ ] **Не стартовать с недельной подпиской** — retention 3-6% (худший показатель среди моделей). ([RevenueCat 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/))

---

## 3. Рекомендации по экранам

| Экран | Что должно быть | Источник/обоснование |
|-------|----------------|---------------------|
| **Welcome** | Ценностное предложение: «Персональный план сна для сменных работников». CTA: «Создать мой план». Social proof: кол-во пользователей | Benefit-driven CTA побеждает «Подписаться» ([Apphud](https://apphud.com/blog/design-high-converting-subscription-app-paywalls)) |
| **Профессия** | Выбор: медсестра / пожарный-EMT / фабрика / другое. Иконки. Определяет весь путь | Персонализация по роли +35% конверсии ([AppAgent](https://appagent.com/blog/mobile-app-onboarding/)) |
| **Квиз (8-10 экранов)** | По одному вопросу на экран: тип графика, текущая смена, длительность, главная проблема, кофеин, мелатонин, время начала смены, условия сна, имя | Sunk cost effect: чем больше ответов, тем выше мотивация дойти до конца ([Dev.to](https://dev.to/paywallpro/complete-onboarding-breakdown-9-steps-from-first-screen-to-paywall-2j7)) |
| **Social proof breaks** | 2-3 раза в квизе: «93% сменных работников не высыпаются» + отзыв коллеги по профессии | Noom ставит social proof в точках drop-off ([Behavioral Scientist](https://www.thebehavioralscientist.com/articles/noom-product-critique-onboarding)) |
| **Loading screen** | «Анализируем ваш профиль сна...» 3-5 сек анимации | +10-20% к конверсии ([Retention.blog](https://www.retention.blog/p/the-longest-onboarding-ever)) |
| **Aha-момент** | «[Имя], вот ваш план» — timeline дня: работа (серый), сон (синий), мелатонин (фиолетовый), кофеин-cutoff (красный). Показать превью плана перехода | Конкретный результат > обещание ([RevenueCat](https://www.revenuecat.com/blog/growth/paywall-placement/)) |
| **Paywall** | Персонализированный заголовок с именем, 4 буллета ценности, 2 тарифа (месяц + год), trial timeline, social proof (рейтинг + отзыв), анимация, кнопка «Может быть позже» | Комбинация лучших практик: +17% (имя) + 2.9x (анимация) + +61% (2 тарифа) |
| **Запрос уведомлений** | ПОСЛЕ paywall, с контекстом: «Чтобы напомнить про мелатонин вовремя». Как RISE | Контекст перед системным запросом повышает opt-in ([Reteno — RISE](https://gallery.reteno.com/flows/app-screens-rise)) |
| **Home** | Сегодняшний план: sleep window, caffeine cutoff, melatonin timing. Sleep Streak счётчик. Sleep Debt число. Кнопка Daily Reminder (если не установлен) | Daily Reminder = 3x retention ([Calm/Amplitude](https://amplitude.com/case-studies/calm)). Sleep Debt — паттерн RISE |
| **Transition Plan** | Визуальный 3-5 дневный план перехода. Push-уведомления привязаны к каждому шагу | Killer feature без конкурентов. 60%+ engagement target ([PRODUCT-VISION.md](../02-product/PRODUCT-VISION.md)) |

---

## 4. KPI Targets (из бенчмарков)

### 4.1 Воронка конверсии

| Метрика | Median (H&F) | Top 25% | Наша цель | Источник |
|---------|-------------|---------|-----------|----------|
| Onboarding completion | ~26% (D1) | — | **60%+** | [Business of Apps](https://www.businessofapps.com/data/app-onboarding-rates/), [Adapty](https://adapty.io/blog/how-to-build-app-onboarding-flows-that-convert/) |
| Trial start rate | 6.5% | 20.3% (p90) | **10%+** | [RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps/) |
| Trial-to-paid | ~45% (7-day) | 60%+ | **40%+** | [RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps/) |
| Install-to-paid | 1.7% (median) | 4.2% | **2.5%+** | [Apphud](https://apphud.com/blog/design-high-converting-subscription-app-paywalls) |
| Day 0 trial cancel | 55% | — | **<40%** | [RevenueCat 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/) |

### 4.2 Retention

| Метрика | Median (H&F) | Top 10% | Наша цель | Источник |
|---------|-------------|---------|-----------|----------|
| D1 retention | 20-27% | 40%+ | **35%** | [Adjust](https://www.adjust.com/blog/what-makes-a-good-retention-rate/), [Plotline](https://www.plotline.so/blog/retention-rates-mobile-apps-by-industry/) |
| D7 retention | ~7% | 25%+ | **20%** | [Enable3](https://enable3.io/blog/app-retention-benchmarks-2025) |
| D30 retention | ~3% | 15%+ | **10%** | [Enable3](https://enable3.io/blog/app-retention-benchmarks-2025), [Lenny](https://www.lennysnewsletter.com/p/what-is-good-retention-issue-29) |
| D90 retention | ~1-2% | 10%+ | **6%** | [GetStream](https://getstream.io/blog/app-retention-guide/) |
| Monthly churn | — | — | **<10%** | [PRODUCT-VISION.md](../02-product/PRODUCT-VISION.md) |
| Notification opt-in | — | — | **70%+** | [PRODUCT-VISION.md](../02-product/PRODUCT-VISION.md) |
| Notification opt-out D30 | — | — | **<20%** | [PRODUCT-VISION.md](../02-product/PRODUCT-VISION.md) |

### 4.3 ASO

| Метрика | Median (H&F) | Top | Наша цель | Источник |
|---------|-------------|-----|-----------|----------|
| Store page conversion | 30.8% (iOS H&F) | — | **35%+** | [AppTweak](https://www.apptweak.com/en/aso-blog/average-app-conversion-rate-per-category) |
| App Store rating | — | — | **4.5+** | [Appalize](https://www.appalize.com/da/blog/app-marketing/app-store-ratings-impact-on-downloads-data-driven-analysis) |
| Reviews count (3 мес) | — | — | **100+** | [Appalize](https://www.appalize.com/da/blog/app-marketing/app-store-ratings-impact-on-downloads-data-driven-analysis) |

### 4.4 Бизнес-метрики

| Метрика | Median | Наша цель | Источник |
|---------|--------|-----------|----------|
| Revenue per install (Day 60) | $0.38 (freemium) — $3.09 (hard) | **$1.50+** | [RevenueCat 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/) |
| LTV | — | **$54** | [PRODUCT-VISION.md](../02-product/PRODUCT-VISION.md) |
| CAC | — | **$8** | [PRODUCT-VISION.md](../02-product/PRODUCT-VISION.md) |
| LTV/CAC | — | **6.8x** | [PRODUCT-VISION.md](../02-product/PRODUCT-VISION.md) |

---

## 5. Приоритеты A/B тестирования

Приложения, запускающие 12-20 тестов в год, показывают **+74% MRR**. ([Adapty](https://adapty.io/blog/mobile-app-paywall-ab-testing/))

| # | Тест | Ожидаемый эффект | Когда |
|---|------|------------------|-------|
| 1 | Персонализированный заголовок paywall vs общий | +17% | Launch |
| 2 | 7-day trial vs no trial | +60% или -20% | Launch |
| 3 | 2 тарифа vs 1 тариф | +61% | Month 2 |
| 4 | Анимированный vs статический paywall | +2.9x | Month 2 |
| 5 | Paywall после aha-момента vs после онбординга | 5.5x разница | Month 3 |
| 6 | С social proof vs без | +30-50% | Month 3 |
| 7 | 7-day vs 14-day trial | Варьируется | Month 4 |

---

## 6. Ключевые выводы по конкурентам в нише

| Конкурент | Цена | Сильная сторона | Слабость для ShiftRest |
|-----------|------|-----------------|----------------------|
| Timeshifter | $9.99/мес | Научная основа, бренд | ShiftRest дешевле на 40% |
| RISE Science | $69.99/год | Sleep debt метрика, UX | Не для shift workers |
| OffShift | Подписка | Целевая аудитория совпадает | Нет transition planning |
| AfterShift | Подписка | Нишевое позиционирование | Новый, без base |

**Дифференциаторы ShiftRest:**
1. **Transition planning** — никто не делает
2. **Schedule-first подход** — не трекер, а планировщик
3. **Non-judgmental дизайн** — не штрафует за дневной сон
4. **Cross-platform Day 1** — конкуренты iOS-only
5. **Цена ниже** — $5.99/мес vs $9.99/мес (Timeshifter)

---

## Источники

Документ синтезирует данные из:
- [ONBOARDING-RESEARCH.md](./ONBOARDING-RESEARCH.md) — 40+ источников
- [PAYWALL-RESEARCH.md](./PAYWALL-RESEARCH.md) — 60+ источников
- [RETENTION-RESEARCH.md](./RETENTION-RESEARCH.md) — 46 источников
- [ASO-RESEARCH.md](./ASO-RESEARCH.md) — 40+ источников

Ключевые отчёты:
- [RevenueCat — State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps/)
- [RevenueCat — State of Subscription Apps 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/)
- [Adapty — State of In-App Subscriptions 2026](https://adapty.io/state-of-in-app-subscriptions/)
- [Lenny's Newsletter — How Duolingo Reignited Growth](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth)
- [Amplitude — How Calm Increased Retention 3x](https://amplitude.com/case-studies/calm)
- [Phiture — Increasing Headspace's Retention](https://phiture.com/success-stories/headspace-retention/)
