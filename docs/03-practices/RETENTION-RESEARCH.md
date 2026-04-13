# Исследование retention — Best Practices
**Дата: 13 апреля 2026**

> Все данные получены из открытых источников 2024-2026 годов. Каждый факт сопровождается ссылкой на источник.

---

## Содержание

1. [Бенчмарки retention по категориям](#1-бенчмарки-retention-по-категориям)
2. [Механики удержания — что работает с данными](#2-механики-удержания--что-работает-с-данными)
3. [Антипаттерны удержания](#3-антипаттерны-удержания)
4. [Лучшие в классе — примеры приложений](#4-лучшие-в-классе--примеры-приложений)
5. [Рекомендации для ShiftRest](#5-рекомендации-для-shiftrest)

---

## 1. Бенчмарки retention по категориям

### 1.1 Общие бенчмарки мобильных приложений

| Метрика | Android | iOS | Среднее |
|---------|---------|-----|---------|
| D1 | 24% | 27% | 26% |
| D7 | 11% | 14% | 13% |
| D30 | 6% | 8% | 7% |

**Источники:**
- [Adjust — What Makes a Good Retention Rate](https://www.adjust.com/blog/what-makes-a-good-retention-rate/)
- [AppsFlyer — App Retention Benchmarks](https://www.appsflyer.com/infograms/app-retention-benchmarks/)

По данным Pushwoosh Benchmarks Study 2025, средний D7 retention на iOS составляет 6.89%, на Android — 5.15%, а D30 — 3.10% (iOS) и 2.82% (Android). Расхождение с данными Adjust объясняется разной методологией и выборкой.

**Источник:** [Pushwoosh — Increase App Retention 2026](https://www.pushwoosh.com/blog/increase-user-retention-rate/)

### 1.2 Бенчмарки по категориям (D1 / D7 / D30)

| Категория | D1 | D7 | D30 |
|-----------|----|----|-----|
| Health & Fitness | 20-27% | ~7% | ~3% |
| Финтех/Банкинг | 30% | 17.6% | 11.6% |
| E-commerce | 18-24.5% | 10.7% | 4.8-5% |
| Маркетплейсы | 33.7% | 16.1% | 8.7% |
| Социальные | 25-29% | 9-10% | 5% |
| Игры (казуальные) | 32.2% | 8% | <3% |
| Игры (хардкор) | 28.7% | — | — |
| Новости (iOS) | 35.88% | — | — |

**Источники:**
- [Plotline — Retention Rates for Mobile Apps by Industry](https://www.plotline.so/blog/retention-rates-mobile-apps-by-industry/)
- [AppsFlyer — App Retention Benchmarks](https://www.appsflyer.com/infograms/app-retention-benchmarks/)
- [Enable3 — App Retention Benchmarks 2026](https://enable3.io/blog/app-retention-benchmarks-2025)
- [Growth-Onomics — Mobile App Retention Benchmarks 2025](https://growth-onomics.com/mobile-app-retention-benchmarks-by-industry-2025/)

### 1.3 Top 10% vs Медиана vs Bottom 25%

| Перцентиль | D1 | D30 |
|------------|----|----|
| Top 10% (элитные) | 40%+ | 30-66% |
| Хороший уровень | 30-35% | 7-10% |
| Медиана (среднее) | 26% | 7% |
| Ниже среднего | <20% | <3% |

**Источники:**
- [Enable3 — App Retention Benchmarks 2026](https://enable3.io/blog/app-retention-benchmarks-2025)
- [Lovable — What Is a Good App Retention Rate](https://lovable.dev/guides/what-is-a-good-retention-rate-for-an-app)

По данным Lenny Rachitsky: для consumer-продуктов ~25% retention считается хорошим, ~45% — отличным. Для consumer SaaS: ~40% — хорошо, ~70% — отлично.

**Источник:** [Lenny's Newsletter — What Is Good Retention](https://www.lennysnewsletter.com/p/what-is-good-retention-issue-29)

### 1.4 D90 (долгосрочная лояльность)

D90 измеряет долгосрочную лояльность. Пользователи, активные на 90-й день, представляют ядро аудитории. Конкретные бенчмарки D90 по категориям ограничены, но исходя из кривой retention:
- Медиана: ~2-4%
- Хорошо: 5-8%
- Отлично: 15%+

**Источник:** [GetStream — 2026 Guide to App Retention](https://getstream.io/blog/app-retention-guide/)

### 1.5 Специфика Health & Fitness

Health & Fitness приложения имеют одни из самых низких показателей retention. Пользователи скачивают их с высокой мотивацией, которая быстро угасает. D30 ~3% означает, что 97% пользователей уходят в течение месяца.

**Контекст для ShiftRest:** При ценовой модели $5.99/мес нам нужно удерживать подписчиков минимум 3-4 месяца для окупаемости CAC. Средний D30 ~3% для категории — это базовая линия, которую необходимо превзойти минимум в 3-5 раз.

---

## 2. Механики удержания — что работает с данными

### 2.1 Push-уведомления

#### Влияние на retention

Push-уведомления оказывают значительное влияние на retention:

| Частота уведомлений | Рост retention vs 0 уведомлений |
|--------------------|---------------------------------|
| 1 уведомление (когда-либо) | +120% |
| Еженедельные | +440% |
| Ежедневные | +820% |

**Источник:** [Airship — How Push Notifications Impact Retention Rates](https://www.airship.com/resources/benchmark-report/how-push-notifications-impact-mobile-app-retention-rates/)

Push-уведомления удваивают retention в первые 90 дней после установки.

#### Оптимальная частота

| Количество в неделю | Opt-out rate |
|---------------------|-------------|
| 2-5 | 46% opt-out |
| 6-10 | 32% opt-out |
| 1 в неделю | 10% отключают, 6% удаляют приложение |
| 3-6 в неделю | 40% отключают уведомления |

**Источники:**
- [Business of Apps — Push Notification Statistics 2025](https://www.businessofapps.com/marketplace/push-notifications/research/push-notifications-statistics/)
- [Braze — What Makes Users Opt Out of Push Notifications](https://www.braze.com/resources/articles/opt-out-of-push-notifications-why-users-do-it)

**Вывод:** Оптимальная частота — 3-5 уведомлений в неделю. Релевантные уведомления снижают opt-out с 40% до 5%.

#### Лучшее время отправки для Health & Fitness

| Время | CTR |
|-------|-----|
| 5:00-7:00 утра | 5.33% |
| 17:00-20:00 | Высокий |
| 11:00-12:00 | 1.26% |

Утренние уведомления (мотивационные) и вечерние (напоминания о достижениях) — наиболее эффективны для health-приложений.

**Источник:** [ContextSDK — Peak Times to Send Push Notifications](https://contextsdk.com/blogposts/peak-times-to-send-push-notifications-for-best-ctr)

#### Контент уведомлений

- Уведомления с изображениями: CTR на 60% выше, чем без
- Персонализированные (с Data Tags): CTR на 58% выше
- A/B-тестирование: +8% к CTR в среднем
- Ретаргетинговые уведомления: CTR удваивается (+111%)
- In-app сообщения: CTR в 18-20 раз выше, чем у push

**Источник:** [OneSignal — Mobile App Benchmarks 2024](https://onesignal.com/mobile-app-benchmarks-2024)

Приложения с онбординговыми сообщениями показывают +24% к конверсии install-to-purchase. Многоканальные приложения имеют более высокий D1, D7 и D30 retention.

### 2.2 Серии (Streaks)

#### Данные Duolingo

Серии — основной драйвер роста Duolingo. Jackson Shuttleworth (Duolingo) в 2024 году назвал streaks "самым большим драйвером роста до мультимиллиардного бизнеса".

| Метрика | Значение |
|---------|----------|
| 7-дневная серия | Пользователи в 3.6x более вероятно останутся долгосрочно |
| Streak wager | +14% к D14 retention |
| Streak Freeze | -21% churn для пользователей в зоне риска |
| Двойной Streak Freeze | +0.38% DAU (относительный рост) |
| iOS виджет со streak | +60% к commitment |
| Общее влияние | Retention вырос с 12% до 55% |

**Источники:**
- [Orizon — Duolingo's Gamification Secrets](https://www.orizon.co/blog/duolingos-gamification-secrets)
- [StriveCloud — Duolingo Gamification Explained](https://www.strivecloud.io/blog/gamification-examples-boost-user-retention-duolingo)
- [OpenLoyalty — Duolingo Gamification Mechanics](https://www.openloyalty.io/insider/how-duolingos-gamification-mechanics-drive-customer-loyalty)

#### Механизм работы серий

Серии используют **loss aversion** (боязнь потери) — люди сильнее мотивированы не потерять прогресс, чем получить награду. Визуальный счётчик серии и ежедневные напоминания усиливают этот эффект.

**Ключевой insight:** Duolingo ввёл Weekend Amulet в 2024 — удвоение XP по субботам/воскресеньям, что помогает удерживать серии на выходных.

**Источник:** [TryPropel — Duolingo Customer Retention Strategy](https://www.trypropel.ai/resources/duolingo-customer-retention-strategy)

### 2.3 Геймификация (XP, значки, уровни)

#### Общее влияние

- Retention приложений с геймификацией улучшается на **22% в среднем**
- Комбинация streak + milestone: **+40-60% к DAU** по сравнению с одной механикой
- Dual-система (streak + milestone): **-35% churn** за 30 дней по сравнению с негеймифицированными альтернативами
- Глобальный рынок геймификации: $29.11 млрд в 2025, прогноз $92.51 млрд к 2030 (CAGR 26.02%)

**Источники:**
- [Plotline — Streaks and Milestones for Gamification](https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps/)
- [GIANTY — How Gamification Helps Boost Engagement 2025](https://www.gianty.com/gamification-boost-user-engagement-in-2025/)
- [Journal of Marketing Research — Gamification in Mobile Apps](https://journals.sagepub.com/doi/10.1177/00222437241275927)

#### Важное замечание

Геймификация работает только когда привязана к реальным действиям. Каждый бейдж или уровень должен отражать настоящее достижение, а не "пустышку". Иначе пользователь это чувствует.

**Источник:** [Storyly — Gamification Strategies to Boost App Engagement](https://www.storyly.io/post/gamification-strategies-to-increase-app-engagement)

### 2.4 Социальные функции

| Механика | Влияние |
|----------|---------|
| Социальные элементы в целом | +30% к retention |
| Связь и обмен опытом | До +60% к retention |
| Социальные вызовы | Значительно выше retention, чем у изолированных пользователей |
| Интеграция с соцсетями | +30% к DAU |
| Шеринг прогресса | 68% пользователей регулярно делятся достижениями |

**Источники:**
- [Lucid — Retention Metrics for Fitness Apps](https://www.lucid.now/blog/retention-metrics-for-fitness-apps-industry-insights/)
- [Swagsoft — Social Features in Mobile Applications](https://www.swagsoft.com/post/harnessing-the-power-of-social-features-in-mobile-applications)

**Strava** — пример социального retention: 14 миллиардов "kudos" в 2025 (+20% год к году). Социальная валидация — главный анти-чурн механизм.

**Источник:** [Trophy — Strava Gamification Case Study](https://trophy.so/blog/strava-gamification-case-study)

#### Предостережение по лидербордам

Лидерборды мотивируют лидеров, но демотивируют отстающих. Командные челленджи, где пользователи сотрудничают ради общей цели, работают лучше — они развивают сообщество и удовлетворяют кооперативные мотивации.

**Источник:** [Storyly — Gamification Strategies](https://www.storyly.io/post/gamification-strategies-to-increase-app-engagement)

### 2.5 Персонализация

| Механика | Влияние |
|----------|---------|
| AI-персонализация | До +50% к retention |
| Ежедневная вовлечённость в первую неделю | +80% вероятность активности через 6 месяцев |
| Предиктивная аналитика | -30% к churn через таргетированные интервенции |
| Гибкие цели (не только ежедневные) | +20% к D90 retention |
| Персонализированные функции | 71% пользователей считают ключевым для мотивации |

**Источники:**
- [RipenApps — AI Fitness App Development](https://ripenapps.com/blog/ai-fitness-app-development/)
- [Orangesoft — Strategies to Increase Fitness App Engagement](https://orangesoft.co/blog/strategies-to-increase-fitness-app-engagement-and-retention)

**Пример Down Dog:** Функция "Practice Frequency" позволяет ставить еженедельные цели вместо ежедневных, что привело к +20% к D90 retention. Это критически важно для shift workers, у которых нет одинакового расписания каждый день.

### 2.6 Email/SMS для реактивации

#### Email-бенчмарки (2024)

| Метрика | Значение |
|---------|----------|
| Средний open rate | 39.7-42.35% |
| Средний click rate | 1-2% |
| Средний click-to-open rate | 5.63% |
| Средняя конверсия (email) | 2-5% (до 12% с оптимизацией) |
| Behavioral emails open rate | До 42.36% |
| Broadcast emails open rate | 14.5-26.9% |
| Автоматизированные email-потоки | До 30x больше revenue vs broadcast |

**Источники:**
- [GetResponse — Email Marketing Benchmarks 2024](https://www.getresponse.com/resources/reports/email-marketing-benchmarks)
- [MailerLite — Email Marketing Benchmarks 2025](https://www.mailerlite.com/blog/compare-your-email-performance-metrics-industry-benchmarks)
- [MoEngage — Average Email Open Rate by Industry](https://www.moengage.com/blog/average-email-open-rate/)

#### Win-back кампании

Предложение win-back скидки на 3-м месяце показывает **10-18% успешность реактивации** по сравнению с отсутствием предложения.

**Источник:** [RevenueCat — State of Subscription Apps 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/)

### 2.7 Онбординг

Онбординг — самый критичный момент для retention:

| Метрика | Значение |
|---------|----------|
| Потеря пользователей Week 0 → Week 1 | ~75% |
| Onboarding > 5 шагов | -10-15% completion за каждый доп. экран |
| Онбординговые сообщения | +24% к install-to-purchase конверсии |
| Headspace: фокус на first 60 seconds | Пользователь медитирует в первую минуту |

**Источники:**
- [Digia — Mobile App Onboarding Guide](https://www.digia.tech/post/mobile-app-onboarding-activation-retention)
- [OpenSpaceServices — Why Users Leave Your App](https://www.openspaceservices.com/blog/mobile-app-ux-that-actually-retains-users-guide-to-onboarding-friction-points-and-first-session-design)

**Ключевой insight:** Time to First Value (TTFV) — один из сильнейших предикторов retention. Чем быстрее пользователь получит ценность, тем выше удержание.

---

## 3. Антипаттерны удержания

### 3.1 Агрессивные push-уведомления

**Проблема:** Чрезмерные или нерелевантные уведомления — одна из главных причин удаления приложений.

| Факт | Источник |
|------|----------|
| 1 push в неделю → 10% отключают, 6% удаляют | [Business of Apps — Push Notification Statistics](https://www.businessofapps.com/marketplace/push-notifications/research/push-notifications-statistics/) |
| 3-6 push в неделю → 40% отключают | [Business of Apps](https://www.businessofapps.com/marketplace/push-notifications/research/push-notifications-statistics/) |
| До 60% пользователей opt-out от push | [Andrew Chen — Why People Turn Off Push](https://andrewchen.com/why-people-are-turning-off-push/) |
| Слишком много push в день → opt-out 40% | [TruePush — Reasons Users Opt-Out](https://www.truepush.com/blog/opt-out-of-push-notifications/) |
| Релевантные push снижают opt-out до 5% | [TruePush](https://www.truepush.com/blog/opt-out-of-push-notifications/) |

**Вывод:** Push-уведомления — это "охраняемый канал" (Duolingo так их называет). Его нужно защищать от инфляции. Если пользователь отключит push, вы теряете один из самых мощных инструментов.

**Источник:** [TryPropel — Duolingo Customer Retention Strategy](https://www.trypropel.ai/resources/duolingo-customer-retention-strategy)

### 3.2 Over-геймификация

**Проблема:** Добавление очков, бейджей и лидербордов "ради галочки" — именно поэтому геймификация получает плохую репутацию.

- Поверхностная геймификация без привязки к реальным достижениям воспринимается как "шум"
- Пользователи чувствуют, когда бейджи не отражают реальных действий
- Это может вызвать обратный эффект — раздражение и уход

**Источник:** [Storyly — Gamification Strategies](https://www.storyly.io/post/gamification-strategies-to-increase-app-engagement)

**Правило:** Каждый элемент геймификации должен быть привязан к реальному результату. Бейдж "Первая неделя стабильного сна" значит что-то. Бейдж "Вы открыли приложение 3 раза" — нет.

### 3.3 Проблема продукта, а не маркетинга

Retention — это, в первую очередь, **проблема продукта**, а не маркетинга:

> "Retention is rarely a messaging problem. It is a product problem. The features you build, the clarity of the first experience, and the ease with which users realize value — determine whether they return."

**Источник:** [Codeft — Push Notifications, Not Pushy Apps](https://codeft.io/think-tank/push-notifications-not-pushy-apps-how-to-optimize-mobile-app-development-for-retention/)

Приложения, которые удерживают аудиторию, не полагаются на агрессивные уведомления или бесконечные скидки. Они фокусируются на прогрессе, контроле и вознаграждении.

### 3.4 Неправильная модель подписки

| Антипаттерн | Данные |
|-------------|--------|
| Высокая цена за месячную подписку | Retention 6.7% (vs 36% у дешёвых годовых) |
| Недельная подписка | Retention 3-6% (худший показатель) |
| Короткий trial (3-7 дней) | Самая высокая отмена на D0-D1 |
| ~30% годовых подписок | Отменяются в первый месяц |

**Источник:** [RevenueCat — State of Subscription Apps 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/)

### 3.5 Отсутствие раннего "aha-момента"

Средний D7 retention по всем вертикалям — 13%. Если пользователь не находит ценность за первые 7 дней, он уходит. Для health-приложений проблема усугубляется: многие пользователи не чувствуют раннюю пользу, что вызывает высокий отток после первой недели.

**Источник:** [Phiture — Increasing Headspace's Retention](https://phiture.com/success-stories/headspace-retention/)

---

## 4. Лучшие в классе — примеры приложений

### 4.1 Duolingo — король retention

**Результат:** DAU вырос в 4.5 раза за 4 года. Revenue: с $13M (2017) до $161M (2020).

**Что конкретно делают:**

1. **CURR-метрика:** Фокус на Current User Retention Rate (вероятность возврата на этой неделе, если пользователь приходил 2 предыдущие недели). CURR оказался в 5 раз более влиятельным, чем второй по значимости рычаг. За 4 года: +21% CURR, -40% ежедневный churn лучших пользователей.

2. **Серии:** Главный драйвер роста. 7-дневная серия → пользователь в 3.6x более вероятно останется надолго.

3. **Streak Freeze:** Снижает churn на 21%. Двойной Freeze — дополнительный рост DAU.

4. **Push как "защищённый канал":** Контролируемый объём, A/B-тесты контента, локализация, персонализация по языку обучения.

5. **Лиги и рейтинги:** Еженедельные соревнования, продвижение/понижение.

**Источники:**
- [Lenny's Newsletter — How Duolingo Reignited User Growth (Jorge Mazal)](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth)
- [Lenny's Newsletter — The Secret to Duolingo's Growth](https://www.lennysnewsletter.com/p/the-secret-to-duolingos-growth)
- [Trophy — Duolingo Gamification Case Study](https://trophy.so/blog/duolingo-gamification-case-study)

### 4.2 Headspace — персонализация в медитации

**Результат:** +109% к W1 retention, +49% к платным конверсиям.

**Что конкретно делают:**

1. **Медитация в первые 60 секунд:** Минимум фрикции на онбординге, быстрый вход в ценность.

2. **Адаптивный контент:** Ротация тем, голосов и длительности сессий до того, как наступит усталость.

3. **Outcome Dashboard:** Еженедельный дашборд с изменениями стресса, фокуса и сна.

4. **In-app сообщения:** Ключевой канал для retention. CRM-эксперименты через push + in-app + email.

5. **Smart escalation:** При ухудшении стресса или снижении активности — персонализированные рекомендации (коучинг, терапия).

**Источник:** [Phiture — Increasing Headspace's Retention](https://phiture.com/success-stories/headspace-retention/)

### 4.3 Calm — сила Daily Reminder

**Результат:** Пользователи с Daily Reminder показывают **3x retention** по сравнению с остальными.

**Что конкретно делают:**

1. **Daily Calm:** Пользователи ежедневного контента на 66% более вероятно продлят подписку.

2. **Двойной пик использования:** Утренний (Daily Calm) и вечерний ~22:00 (засыпание). Это критически важно для sleep-приложений.

3. **Промпт на Daily Reminder после первой сессии:** Показ экрана с предложением установить напоминание. Связь между напоминанием и retention — каузативная (не только корреляция).

4. **ML-персонализация:** Использование machine learning для подбора контента.

**Источники:**
- [Amplitude — How Calm Increased Retention 3x](https://amplitude.com/case-studies/calm)
- [PMC — Calm Meditation App Usage Patterns](https://pmc.ncbi.nlm.nih.gov/articles/PMC6858610/)

### 4.4 Noom — поведенческая наука для подписки

**Что конкретно делают:**

1. **Daily micro-lessons:** Ежедневные мини-уроки, основанные на психологии и поведенческой науке.

2. **Персональный коуч:** Каждый пользователь получает коуча.

3. **Группы поддержки:** Социальная структура для accountability.

4. **SOS-планы:** Пользователь выбирает тип поддержки, когда мотивация падает.

5. **Фокус на поведенческие изменения, а не ограничения:** "Psychology, not restriction."

**Источник:** [WebMD — Noom Diet Review](https://www.webmd.com/diet/noom-diet)

### 4.5 MyFitnessPal — привычка логирования

**Результат:** 90-дневный retention — 24% (что в 8x выше среднего для категории).

**Что конкретно делают:**

1. **Цикл Track → Remind → Celebrate → Connect:** Логирование еды → напоминание → празднование → социальное подкрепление.

2. **Streak на логирование:** Видимая текущая и максимальная серия.

3. **Weekly Habits:** "Логируйте 2 приёма пищи минимум 4 дня в неделю" — достижимые еженедельные цели.

4. **Адаптивные уведомления:** Промпты на логирование, поздравления с целями, персонализация по привычкам.

**Источники:**
- [TryPropel — MyFitnessPal Customer Retention Strategy](https://www.trypropel.ai/resources/myfitnesspal-customer-retention-strategy)
- [Trophy — MyFitnessPal Gamification Case Study](https://trophy.so/blog/myfitnesspal-gamification-case-study)

### 4.6 Strava — социальный retention

**Что конкретно делают:**

1. **Kudos (лайки):** 14 млрд kudos в 2025, +20% год к году. Социальная валидация — главный анти-churn.

2. **Segments & Personal Records:** Виртуальные медали за личные рекорды.

3. **Group Challenges:** Командные цели, которые ставят связность выше конкуренции.

4. **Реальная ценность:** 1 час активности на каждые 2 минуты в приложении. Пользователи получают реальную пользу, а не просто "залипают".

**Источник:** [Trophy — Strava Gamification Case Study](https://trophy.so/blog/strava-gamification-case-study)

### 4.7 RISE Science — персональный sleep-план

Наиболее близкий к ShiftRest по домену:

1. **Ежедневный прогноз:** Когда будет grogginess, когда лучшее время для фокуса, когда начинать wind-down.
2. **16 научно-обоснованных привычек:** Nudges в правильное время для снижения sleep debt.
3. **Фокус на sleep debt:** Видимая метрика "долга сна", которую пользователь стремится снизить.

**Источник:** [Rise Science](https://www.risescience.com/)

---

## 5. Рекомендации для ShiftRest

### 5.1 Целевые метрики

Исходя из бенчмарков Health & Fitness (медиана: D1 20-27%, D7 ~7%, D30 ~3%) и лучших практик, целевые метрики для ShiftRest:

| Метрика | Медиана категории | Цель ShiftRest (хорошо) | Цель ShiftRest (отлично) |
|---------|-------------------|-------------------------|--------------------------|
| D1 | 20-27% | 35% | 45% |
| D7 | ~7% | 20% | 30% |
| D30 | ~3% | 10% | 15% |
| D90 | ~1-2% | 6% | 10% |
| Monthly sub retention | 6.7% | 20% | 30% |

### 5.2 Ключевые retention-механики для ShiftRest

#### A. "Защищённый" push-канал (Day 0+)

**Стратегия по типу Duolingo:** Push-уведомления — охраняемый канал. Нельзя инфлировать.

- **Утренние push (5-7 AM):** "Твой план сна на сегодня готов" — персонализированный, по текущему графику смен
- **Вечерние push:** "Через 2 часа начни wind-down" — привязка к конкретному времени сна
- **Частота:** Максимум 1-2 уведомления в день, 5-7 в неделю
- **Персонализация:** Разный контент для медсестёр, пожарных, фабричных рабочих
- **A/B-тесты:** Постоянное тестирование контента и времени

**Обоснование:** CTR утренних push для health-приложений — 5.33% (vs 1.26% днём). Персонализированные push +58% CTR. [ContextSDK](https://contextsdk.com/blogposts/peak-times-to-send-push-notifications-for-best-ctr), [OneSignal](https://onesignal.com/mobile-app-benchmarks-2024)

#### B. Серия сна (Sleep Streak) — ключевая механика

**Стратегия по типу Duolingo streaks:**

- **Что считается:** День, когда пользователь следовал рекомендованному плану сна (лёг вовремя ± 30 мин)
- **Streak Freeze:** "Пропущенный день" — 1-2 заморозки в запасе (как Duolingo)
- **Shift Change Grace:** Автоматический Streak Freeze при переходе между типами смен
- **Weekly mode (по типу Down Dog):** Для shift workers с нерегулярным расписанием — "Выспись по плану 4 из 7 дней" вместо ежедневного требования

**Обоснование:** Streaks — главный драйвер Duolingo (3.6x long-term engagement на 7-й день). Streak Freeze -21% churn. Гибкие цели +20% D90. [Orizon](https://www.orizon.co/blog/duolingos-gamification-secrets), [Orangesoft](https://orangesoft.co/blog/strategies-to-increase-fitness-app-engagement-and-retention)

#### C. "Aha-момент" в первые 60 секунд

**Стратегия по типу Headspace/Calm:**

1. Минимальный онбординг (3-4 экрана максимум)
2. Вопрос о графике смен → мгновенный plan preview
3. **Первый экран ценности:** "Сегодня ложись в 22:30, мелатонин в 21:30, кофеин — стоп после 14:00"
4. Промпт на Daily Reminder после первого use

**Обоснование:** 75% пользователей уходят между Week 0 и Week 1. TTFV — сильнейший предиктор retention. Calm: Daily Reminder → 3x retention. [Digia](https://www.digia.tech/post/mobile-app-onboarding-activation-retention), [Amplitude — Calm](https://amplitude.com/case-studies/calm)

#### D. Персонализация на основе смен

**Стратегия по типу RISE Science + AI:**

- **Ежедневный план сна:** Адаптированный под текущую смену, время перехода, sleep debt
- **Caffeine Cutoff Timer:** Обратный отсчёт до "стоп кофе" — привязан к графику
- **Melatonin Timing:** Персональный таймер с push-уведомлением
- **Transition Plans:** При смене типа смены (ночная → дневная) — специальный 3-5 дневный план перехода

**Обоснование:** AI-персонализация → +50% retention. 71% пользователей считают персонализацию ключевой. [RipenApps](https://ripenapps.com/blog/ai-fitness-app-development/), [Orangesoft](https://orangesoft.co/blog/strategies-to-increase-fitness-app-engagement-and-retention)

#### E. Sleep Debt как числовая метрика (по типу RISE)

- **Видимая метрика sleep debt:** Число, которое пользователь стремится снизить (как долг, который хочется "погасить")
- **Еженедельный Outcome Dashboard** (по типу Headspace): Изменения в sleep debt, качестве сна, энергии
- **Monthly report:** Email с прогрессом за месяц

**Обоснование:** RISE использует sleep debt как ключевую метрику. Headspace: Outcome Dashboard улучшает retention. [Rise Science](https://www.risescience.com/), [Phiture — Headspace](https://phiture.com/success-stories/headspace-retention/)

#### F. "Осторожная" геймификация

**Значки привязаны к реальным результатам:**

- "7 дней стабильного сна" (не "7 дней в приложении")
- "Успешный переход на ночную смену"
- "Sleep debt < 1 часа"
- "30-дневная серия"

**НЕ делать:**
- XP за открытие приложения
- Лидерборды (слишком интимная тема для сна)
- Бейджи без привязки к здоровью

**Обоснование:** Привязка к результатам — обязательна. Over-геймификация вредит. [Storyly](https://www.storyly.io/post/gamification-strategies-to-increase-app-engagement)

#### G. Подписочная модель

**На основе данных RevenueCat:**

- **$5.99/мес** — текущая цена. Для mid-price monthly, ожидаемый retention 16.4%
- **Годовой план:** Обязательно предлагать. $39.99-49.99/год. Retention до 36%
- **7-дневный trial:** Не использовать 3-дневный (самый высокий cancellation). 7-14 дней оптимально
- **Pause option:** Снижает churn на 11-20%
- **Win-back на 3-м месяце:** Скидка → 10-18% реактивация

**Обоснование:** [RevenueCat — State of Subscription Apps 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/)

#### H. Реактивация неактивных пользователей

**Email-стратегия:**

- **Behavioral triggers:** Если пользователь не заходил 3 дня → email "Твой sleep debt растёт"
- **Week 2 без активности:** "Новый план для твоей смены на этой неделе"
- **Month 2:** Win-back с персональным прогрессом
- **Формат:** Behavior-based emails (open rate 42% vs 15-27% broadcast)

**Обоснование:** [GetResponse — Email Benchmarks](https://www.getresponse.com/resources/reports/email-marketing-benchmarks), [MoEngage](https://www.moengage.com/blog/average-email-open-rate/)

### 5.3 Приоритеты внедрения

| Приоритет | Механика | Влияние | Сложность |
|-----------|----------|---------|-----------|
| 1 | Быстрый "aha-момент" (план сна за 60 сек) | Критическое | Средняя |
| 2 | Daily Reminder prompt | Критическое (3x retention) | Низкая |
| 3 | Push-уведомления (утро + вечер, персональные) | Высокое (+120-820%) | Средняя |
| 4 | Sleep Streak + Streak Freeze | Высокое (3.6x engagement) | Средняя |
| 5 | Sleep Debt метрика | Высокое | Средняя |
| 6 | Значки привязанные к результатам | Среднее (+22%) | Низкая |
| 7 | Email реактивация | Среднее | Низкая |
| 8 | Годовой план + pause | Среднее (-11-20% churn) | Низкая |
| 9 | Weekly Outcome Dashboard | Среднее | Средняя |
| 10 | Win-back кампании | Среднее (10-18%) | Низкая |

### 5.4 Ключевая метрика для отслеживания

По примеру Duolingo, рекомендуем использовать аналог **CURR (Current User Retention Rate)** — вероятность возврата пользователя на этой неделе, если он был активен 2 предыдущие недели. Этот показатель в 5 раз более влиятелен, чем другие retention-метрики.

**Источник:** [Lenny's Newsletter — How Duolingo Reignited User Growth](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth)

---

## Источники (все)

1. [Adjust — What Makes a Good Retention Rate](https://www.adjust.com/blog/what-makes-a-good-retention-rate/)
2. [Airship — How Push Notifications Impact Retention](https://www.airship.com/resources/benchmark-report/how-push-notifications-impact-mobile-app-retention-rates/)
3. [Amplitude — How Calm Increased Retention 3x](https://amplitude.com/case-studies/calm)
4. [Andrew Chen — Why People Turn Off Push](https://andrewchen.com/why-people-are-turning-off-push/)
5. [AppsFlyer — App Retention Benchmarks](https://www.appsflyer.com/infograms/app-retention-benchmarks/)
6. [Braze — Opt Out of Push Notifications](https://www.braze.com/resources/articles/opt-out-of-push-notifications-why-users-do-it)
7. [Business of Apps — Push Notification Statistics 2025](https://www.businessofapps.com/marketplace/push-notifications/research/push-notifications-statistics/)
8. [Codeft — Push Notifications, Not Pushy Apps](https://codeft.io/think-tank/push-notifications-not-pushy-apps-how-to-optimize-mobile-app-development-for-retention/)
9. [ContextSDK — Peak Times Push Notifications](https://contextsdk.com/blogposts/peak-times-to-send-push-notifications-for-best-ctr)
10. [Digia — Mobile App Onboarding Guide](https://www.digia.tech/post/mobile-app-onboarding-activation-retention)
11. [Enable3 — App Retention Benchmarks 2026](https://enable3.io/blog/app-retention-benchmarks-2025)
12. [GetResponse — Email Marketing Benchmarks 2024](https://www.getresponse.com/resources/reports/email-marketing-benchmarks)
13. [GetStream — 2026 Guide to App Retention](https://getstream.io/blog/app-retention-guide/)
14. [GIANTY — Gamification Boost Engagement 2025](https://www.gianty.com/gamification-boost-user-engagement-in-2025/)
15. [Growth-Onomics — Mobile App Retention Benchmarks 2025](https://growth-onomics.com/mobile-app-retention-benchmarks-by-industry-2025/)
16. [Lenny's Newsletter — How Duolingo Reignited Growth](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth)
17. [Lenny's Newsletter — What Is Good Retention](https://www.lennysnewsletter.com/p/what-is-good-retention-issue-29)
18. [Lovable — What Is a Good App Retention Rate](https://lovable.dev/guides/what-is-a-good-retention-rate-for-an-app)
19. [Lucid — Retention Metrics for Fitness Apps](https://www.lucid.now/blog/retention-metrics-for-fitness-apps-industry-insights/)
20. [MailerLite — Email Marketing Benchmarks 2025](https://www.mailerlite.com/blog/compare-your-email-performance-metrics-industry-benchmarks)
21. [MoEngage — Average Email Open Rate](https://www.moengage.com/blog/average-email-open-rate/)
22. [MobileLoud — Push Notification Statistics](https://www.mobiloud.com/blog/push-notification-statistics)
23. [OneSignal — Mobile App Benchmarks 2024](https://onesignal.com/mobile-app-benchmarks-2024)
24. [OpenLoyalty — Duolingo Gamification Mechanics](https://www.openloyalty.io/insider/how-duolingos-gamification-mechanics-drive-customer-loyalty)
25. [OpenSpaceServices — Why Users Leave Your App](https://www.openspaceservices.com/blog/mobile-app-ux-that-actually-retains-users-guide-to-onboarding-friction-points-and-first-session-design)
26. [Orangesoft — Fitness App Engagement Strategies](https://orangesoft.co/blog/strategies-to-increase-fitness-app-engagement-and-retention)
27. [Orizon — Duolingo Gamification Secrets](https://www.orizon.co/blog/duolingos-gamification-secrets)
28. [Phiture — Increasing Headspace's Retention](https://phiture.com/success-stories/headspace-retention/)
29. [Plotline — Retention Rates by Industry](https://www.plotline.so/blog/retention-rates-mobile-apps-by-industry/)
30. [Plotline — Streaks and Milestones Gamification](https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps/)
31. [PMC — Calm Meditation App Usage Patterns](https://pmc.ncbi.nlm.nih.gov/articles/PMC6858610/)
32. [Pushwoosh — Increase App Retention 2026](https://www.pushwoosh.com/blog/increase-user-retention-rate/)
33. [RevenueCat — State of Subscription Apps 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/)
34. [RipenApps — AI Fitness App Development](https://ripenapps.com/blog/ai-fitness-app-development/)
35. [Rise Science](https://www.risescience.com/)
36. [Journal of Marketing Research — Gamification in Mobile Apps](https://journals.sagepub.com/doi/10.1177/00222437241275927)
37. [Storyly — Gamification Strategies](https://www.storyly.io/post/gamification-strategies-to-increase-app-engagement)
38. [StriveCloud — Duolingo Gamification](https://www.strivecloud.io/blog/gamification-examples-boost-user-retention-duolingo)
39. [Swagsoft — Social Features in Mobile Apps](https://www.swagsoft.com/post/harnessing-the-power-of-social-features-in-mobile-applications)
40. [Trophy — Duolingo Gamification Case Study](https://trophy.so/blog/duolingo-gamification-case-study)
41. [Trophy — MyFitnessPal Gamification](https://trophy.so/blog/myfitnesspal-gamification-case-study)
42. [Trophy — Strava Gamification Case Study](https://trophy.so/blog/strava-gamification-case-study)
43. [TruePush — Reasons Users Opt-Out](https://www.truepush.com/blog/opt-out-of-push-notifications/)
44. [TryPropel — Duolingo Retention Strategy](https://www.trypropel.ai/resources/duolingo-customer-retention-strategy)
45. [TryPropel — MyFitnessPal Retention Strategy](https://www.trypropel.ai/resources/myfitnesspal-customer-retention-strategy)
46. [WebMD — Noom Diet Review](https://www.webmd.com/diet/noom-diet)
