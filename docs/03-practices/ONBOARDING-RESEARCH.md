# Исследование онбординга — Best Practices
**Дата: 13 апреля 2026**

---

## Содержание

1. [Бенчмарки и метрики](#1-бенчмарки-и-метрики)
2. [Что конвертирует](#2-что-конвертирует)
3. [Лучшие примеры (Best-in-Class)](#3-лучшие-примеры-best-in-class)
4. [Антипаттерны](#4-антипаттерны)
5. [Рекомендации для ShiftRest](#5-рекомендации-для-shiftrest)

---

## 1. Бенчмарки и метрики

### 1.1. Средние показатели завершения онбординга по категориям

Глобальный средний показатель завершения онбординга (onboarding rate) в Q2 2025 составил **8.4%** к 30-му дню. Более **90% пользователей** не завершают все шаги онбординга. При этом в первый день (Day 1) показатели значительно выше: приложения из категорий Finance, Health & Fitness и Sports демонстрируют **26%** завершения в день установки. К 30-му дню лидируют News & Magazines с показателем **13%**.
[Business of Apps — App Onboarding Rates 2025](https://www.businessofapps.com/data/app-onboarding-rates/)

Приложения с онбордингом показывают **24% engagement score** по сравнению с **17%** у приложений без онбординга (Q2 2024). Также приложения с онбордингом демонстрируют на **24% выше** конверсию install-to-purchase.
[OneSignal — Mobile App Benchmarks 2024](https://onesignal.com/mobile-app-benchmarks-2024)

### 1.2. Конверсия подписочных приложений

По данным RevenueCat State of Subscription Apps 2026:

| Метрика | Значение |
|---------|----------|
| Медиана trial start rate | ~6.5% |
| Top-performers (p90) trial start rate | **20.3%** (в 3x лучше среднего) |
| 82% trial starts | происходят в **день установки** |
| Конверсия trial-to-paid (длинные триалы 17-32 дня) | **42.5%** (медиана) |
| Конверсия trial-to-paid (короткие триалы <4 дней) | **25.5%** (медиана) |
| Hard paywall trial-to-paid (Day 35) | **10.7%** |
| Freemium trial-to-paid (Day 35) | **2.1%** |
| Install-to-paid (общий медиана) | **~1.7%** |

Длинные триалы (17-32 дня) конвертируются примерно на **70% лучше**, чем короткие (<4 дней).
[RevenueCat — State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps/)
[RevenueCat — Benchmarks 2026 Blog](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026/)

По данным Adapty, онбординговые пейволлы с триалами дают наивысшую конверсию install-to-paid — в среднем **1.78%**. При этом **60-80% выручки** большинства подписочных приложений генерируется именно онбординговым пейволлом.
[Adapty — How to Build App Onboarding Flows](https://adapty.io/blog/how-to-build-app-onboarding-flows-that-convert/)
[Adapty — State of In-App Subscriptions 2026](https://adapty.io/state-of-in-app-subscriptions-report/)

### 1.3. Оптимальное количество шагов

Данные исследования Appcues: **completion rate падает на 15%** с каждым дополнительным экраном онбординга после пяти. Это делает 5 экранов критическим порогом.
[Low Code Agency — Mobile App Onboarding Best Practices 2026](https://www.lowcode.agency/blog/mobile-onboarding-best-practices)

Рекомендации по количеству экранов:

| Тип приложения | Рекомендуемое количество экранов |
|----------------|----------------------------------|
| Простые приложения | **3 экрана** (ценность + минимум данных) |
| Сложные приложения | **5 экранов** (разрешения + персонализация + первое действие) |
| Подписочные Health/Fitness | **12-30 экранов** (длинный квиз + ценность + пейволл) |

При этом реальная медиана по данным Mobbin — **18 экранов**, что соответствует примерно **8 шагам** (создание аккаунта, верификация, ввод данных, запрос разрешений и т.д.).
[Routen Discovery — Optimal App Onboarding Length](https://routendiscovery.com/blog/post/optimal-app-onboarding-length-for-different-app-categories/)

Важно: для подписочных Health & Fitness приложений длинный онбординг (20-50+ экранов) — норма, но каждый экран должен ощущаться как прогресс. Успешные приложения (Noom, Flo, BetterMe, RISE) используют длинные квизы, потому что каждый вопрос увеличивает инвестицию пользователя.
[RevenueCat — Why Your Onboarding Might Be Too Short](https://www.revenuecat.com/blog/growth/why-your-onboarding-experience-might-be-too-short/)

### 1.4. Drop-off rate по шагам

**Каждый дополнительный шаг теряет ~20% пользователей** — это правило Gabor Cselle, подтвержденное множеством приложений. Более точно: потеря составляет **10-30% на каждый шаг** в зависимости от качества UX.
[Gabor Cselle — Every Step Costs You 20% of Users](https://medium.com/gabor/every-step-costs-you-20-of-users-b613a804c329)

Основные точки потери пользователей:

| Точка drop-off | Процент потерь |
|----------------|----------------|
| Установка -> регистрация | до **35%** |
| SMS верификация | ~**30%** (completion ~70%) |
| Верификация через Facebook | ~**50%** (completion ~50%) |
| Множественные методы входа | ~**10%** (completion ~90%) |
| KYC/сложные формы | **40-50%** |

**43%** пользователей бросают онбординг из-за friction при подтверждении личности или номера телефона.
[Jumio — How to Reduce Customer Abandonment](https://www.jumio.com/how-to-reduce-customer-abandonment/)
[IPification — Cut Drop-Off Rate](https://www.ipification.com/blog/how-mobile-apps-can-cut-the-drop-off-rate-in-sign-in-process/)

По данным RevenueCat, **55% всех отмен 3-дневного триала происходят в Day 0** — пользователь решает уйти, даже не проведя в приложении дня.
[RevenueCat — State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps/)

Средний retention rate в день установки — **25%**, снижается до **5.7%** к 20-му дню.
[Setgreet — What Numbers Say About Onboarding](https://www.setgreet.com/blog/what-the-numbers-actually-say-about-mobile-app-onboarding-(and-what-to-track))

---

## 2. Что конвертирует

### 2.1. Персонализация (сбор данных во время онбординга)

Персонализация — один из самых мощных рычагов конверсии:

- Персонализированный онбординг увеличивает конверсию на **35%+** и ретеншн на **50%**.
[AppAgent — Mobile App Onboarding](https://appagent.com/blog/mobile-app-onboarding/)

- Добавление поля с именем дает **+13% конверсии** просто за счет ощущения персональности.
[Adapty — How to Build App Onboarding Flows](https://adapty.io/blog/how-to-build-app-onboarding-flows-that-convert/)

- Персонализированные пейволлы превосходят generic на **15%+**. Даже простая персонализация (имя пользователя в заголовке) дает **+17% конверсии**.
[Adapty — Paywall Experiments Playbook](https://adapty.io/blog/paywall-experiments-playbook/)

- Generic туры убивают конверсию. Кастомизация пути на основе роли и поведения пользователя гарантирует, что каждый видит именно ту ценность, которая решает его проблему.
[Appcues — Trial to Paid Conversions](https://www.appcues.com/blog/trial-to-paid-conversions-user-onboarding)

- Кейс: улучшение онбординг-воронки повысило конверсию на **200%** (с 8% до 24%).
[Ridhi Singh — How We Improved Onboarding Funnel](https://medium.com/@ridhisingh/how-we-improved-our-onboarding-funnel-increased-conversions-by-200-9a106b238247)

**Механизм работы**: квиз-вопросы создают эффект «вложенного труда» (sunk cost). Чем больше пользователь ответил, тем сильнее его мотивация дойти до конца и увидеть результат. Ответы на квиз также должны **напрямую влиять** на показываемый план, рекомендации и текст пейволла.
[Dev.to — Complete Onboarding Breakdown: 9 Steps](https://dev.to/paywallpro/complete-onboarding-breakdown-9-steps-from-first-screen-to-paywall-2j7)

### 2.2. Прогресс-бары

- **78%** продуктов используют индикаторы прогресса во время онбординга.
[UserGuiding — 100+ Onboarding Statistics](https://userguiding.com/blog/user-onboarding-statistics)

- Приложения с геймификацией (включая прогресс-бары) показывают на **50% выше** completion rate.
[UserGuiding — 100+ Onboarding Statistics](https://userguiding.com/blog/user-onboarding-statistics)

- Прогресс-бары задействуют **Endowed Progress Effect**: пользователь видит начальный прогресс (например, «20% уже готово!»), что создает ощущение уже вложенного труда и мотивирует продолжить.
[Userpilot — Progress Bar Psychology](https://userpilot.com/blog/progress-bar-psychology/)

- Для онбордингов длиннее 60 секунд прогресс-бар или чеклист **критически необходим** — он показывает, сколько осталось, и снижает риск drop-off.
[FullStory — Guide to Mobile App Onboarding](https://www.fullstory.com/blog/guide-to-mobile-app-onboarding/)

- В Noom используются loading bars и визуализации данных, показывающие обработку ответов пользователя — это увеличивает конверсию на **10-20%**.
[Retention.blog — The Longest Onboarding Ever](https://www.retention.blog/p/the-longest-onboarding-ever)

### 2.3. Social proof (социальное доказательство)

- Social proof **увеличивает конверсию на 33%** («3 коллеги уже используют это»).
[Glance — When Should Apps Use Social Proof](https://thisisglance.com/learning-centre/when-should-apps-use-social-proof-in-onboarding)

- Онбординг с social proof конвертирует на **30% лучше**.
[UserGuiding — 100+ Onboarding Statistics](https://userguiding.com/blog/user-onboarding-statistics)

- Видео-отзывы показывают **+80%** к конверсии.
[Genesys Growth — Social Proof Conversion Stats](https://genesysgrowth.com/blog/social-proof-conversion-stats-for-marketing-leaders)

- Товары с отзывами покупают в **270% чаще**, чем без.
[Genesys Growth — Social Proof Conversion Stats](https://genesysgrowth.com/blog/social-proof-conversion-stats-for-marketing-leaders)

- Динамический social proof (live activity) дает **+98%** конверсии по сравнению со статичными страницами.
[Genesys Growth — Social Proof Conversion Stats](https://genesysgrowth.com/blog/social-proof-conversion-stats-for-marketing-leaders)

**Стратегия размещения**: Noom показывает social proof дважды — на шаге 5 и шаге 11 — предположительно потому, что UX-команда обнаружила, что пользователи уходят именно в эти моменты. Не стоит перегружать social proof в первые минуты — лучше дать пользователю сначала сформировать собственное мнение.
[The Behavioral Scientist — Noom Product Critique](https://www.thebehavioralscientist.com/articles/noom-product-critique-onboarding)
[Glance — When Should Apps Use Social Proof](https://thisisglance.com/learning-centre/when-should-apps-use-social-proof-in-onboarding)

### 2.4. «Aha-момент» перед пейволлом

Aha-момент — это критическая точка, когда ценность продукта становится для пользователя кристально ясной: интерес превращается в инвестицию.
[RevenueCat — Paywall Placement](https://www.revenuecat.com/blog/growth/paywall-placement/)

Ключевые данные:

- Приложения с upfront paywall (сразу после aha-момента): **~12% trial-to-paid** конверсия (медиана, 14-дневный триал).
- Приложения с post-content paywall (после длительного использования): **~2% trial-to-paid** — разница в **5.5 раз**.
[Dev.to — Paywall Timing Paradox](https://dev.to/paywallpro/the-paywall-timing-paradox-why-showing-your-price-upfront-can-5x-your-conversions-4alc)

- **Если aha-момент не доставлен в первые 60 минут, подписчик уже потерян.**
[RevenueCat — Paywall Placement](https://www.revenuecat.com/blog/growth/paywall-placement/)

- Лучший подход: после квиза показать экран «На основе ваших ответов...» с персонализированным результатом, а затем плавно перейти к пейволлу. Пейволл ощущается как логическое продолжение, а не прерывание.
[Dev.to — Fitness App Onboarding Guide](https://dev.to/paywallpro/fitness-app-onboarding-guide-data-motivation-completion-an0)

- **PhotoRoom**: во время онбординга пользователь загружает фото и удаляет фон — видит результат AI мгновенно. Сразу после этого — пейволл. Конверсия значительно выше стандартной.
[RevenueCat — Paywall Placement](https://www.revenuecat.com/blog/growth/paywall-placement/)

### 2.5. Геймификация и микро-награды

- Геймифицированные онбординги снижают ранний churn на **до 50%** и значительно ускоряют time-to-value.
[StriveCloud — Gamification Examples Onboarding](https://strivecloud.io/uncategorized/gamification-examples-onboarding/)

- Duolingo — золотой стандарт: до запроса имени или email пользователь уже зарабатывает «gems» за прохождение урока, создавая **дофаминовый цикл**.
[Userpilot — Onboarding Gamification](https://userpilot.com/blog/onboarding-gamification/)

- Микро-победы на каждом шаге (верификация, заполнение профиля, первое действие) делают каждый шаг ощущением прогресса, а не обязанности.
[Boxes and Arrows — Gamification in Mobile App Onboarding](https://boxesandarrows.com/how-to-use-gamification-in-mobile-app-onboarding/)

- Элементы: прогресс-бары, бейджи, награды, лидерборды, in-app челленджи.
[InAppStory — 10 Gamification Onboarding Techniques](https://inappstory.com/blog/10-gamification-onboarding-techniques)

---

## 3. Лучшие примеры (Best-in-Class)

### 3.1. Noom (Health & Fitness / Weight Loss)

| Параметр | Значение |
|----------|----------|
| Категория | Health & Fitness, похудение |
| Количество экранов | 96+ |
| Длительность | ~10-15 минут |

**Что делает хорошо:**
- Длинный квиз с глубокой персонализацией (вес, цели, привычки, образ жизни).
- Loading bars после ответов создают ощущение «анализа данных» — **+10-20% конверсии**.
- Social proof на шагах 5 и 11 для удержания пользователей в критические моменты.
- Поведенческий квиз в конце, стилизованный под психологический тест — повышает вовлеченность.
- Прогноз «когда вы достигнете цели» перед пейволлом — мощный aha-момент.
- Локализованная цена (определяется по IP) — снижает friction.
- Эмоциональный buy-in: пользователь чувствует, что приложение «знает» его.

[Justinmind — UX Case Study Noom](https://www.justinmind.com/blog/ux-case-study-of-noom-app-gamification-progressive-disclosure-nudges/)
[Retention.blog — The Longest Onboarding Ever](https://www.retention.blog/p/the-longest-onboarding-ever)
[The Behavioral Scientist — Noom Product Critique](https://www.thebehavioralscientist.com/articles/noom-product-critique-onboarding)

### 3.2. Flo (Health / Women's Health)

| Параметр | Значение |
|----------|----------|
| Категория | Health, женское здоровье |
| Количество экранов | до 400 (с ветвлениями), ~70 на путь |
| Уникальность | Server-driven онбординг |

**Что делает хорошо:**
- Разветвленный онбординг: разные пути для разных целей (цикл, беременность, зачатие, сексуальное здоровье).
- Server-driven система позволяет запускать **~30 экспериментов в месяц**.
- После миграции на backend-driven систему: **+13.5% ARPU**, **+20% конверсия** в подписку.
- Один эксперимент увеличил trial conversions **в 8 раз**.
- Длинные серии вопросов разбиваются пояснениями и напоминаниями о ценности.
- 5 гипотез за двухнедельный спринт — культура непрерывной оптимизации.

[LinkedIn — Flo's Onboarding Process 66% Increase](https://www.linkedin.com/pulse/flos-onboarding-process-has-experienced-66-increase-its-yuriev-)
[Medium/Flo Health — Mobile Onboarding Evolution Part 1](https://medium.com/flo-health/mobile-onboarding-evolution-part-1-cfc9702835ce)
[Retention.blog — Flo Success Story](https://www.retention.blog/p/flo-is-an-amazing-success-story)

### 3.3. RISE Sleep Tracker (Health & Fitness / Sleep)

| Параметр | Значение |
|----------|----------|
| Категория | Health & Fitness, сон |
| Количество экранов | **47 шагов** |
| Релевантность для ShiftRest | **ВЫСОКАЯ** (прямой конкурент) |

**Что делает хорошо:**
- Двойная цель онбординга: (1) убедить, что сон важен, (2) убедить, что RISE поможет.
- Метафора «сон как лекарство» — мощный фрейминг.
- Объясняет, как накопленный недосып влияет на работоспособность (education-first).
- Детальное введение в «Energy Timeline» — ключевую фичу.
- Контекстные объяснения перед запросом каждого разрешения (motion data, уведомления).
- Когнитивное пространство: технические вопросы чередуются с простыми.
- Высокая инвестиция пользователя в квиз мотивирует начать триал.

[Reteno Gallery — RISE Onboarding Flow](https://gallery.reteno.com/flows/app-screens-rise)
[RevenueCat — Why Your Onboarding Might Be Too Short](https://www.revenuecat.com/blog/growth/why-your-onboarding-experience-might-be-too-short/)
[ScreensDesign — RISE Sleep Tracker Showcase](https://screensdesign.com/showcase/rise-sleep-tracker)

### 3.4. Headspace (Health & Fitness / Meditation)

| Параметр | Значение |
|----------|----------|
| Категория | Health & Fitness, медитация |
| Количество шагов | **3 вопроса** |
| Drop-off rate | Был **38%**, оптимизирован |

**Что делает хорошо:**
- Минимальный friction: всего 3 вопроса (опыт медитации, цель, длина сессии).
- Множественные способы входа (email, Google, Facebook, Apple, SSO) — 2 клика через Google.
- Calming visuals и дружелюбный маскот (оранжевый персонаж).
- Пользователи, дошедшие до второй недели, в **5 раз чаще** конвертируются в платных.
- Фокус на intrinsic motivation — помогает пользователю осознать, зачем ему медитация.
- Мгновенная ценность: первый экран — «Take a deep breath» с таймером дыхания.

[GoodUX/Appcues — Headspace Mindful Onboarding](https://goodux.appcues.com/blog/headspaces-mindful-onboarding-sequence)
[Growth.Design — Headspace User Onboarding](https://growth.design/case-studies/headspace-user-onboarding)
[BehindLogin — Headspace UX Journey](https://behindlogin.com/news/headspace-onboarding-a-ux-journey-that-welcomes-and-delights/)

### 3.5. Calm (Health & Fitness / Meditation & Sleep)

| Параметр | Значение |
|----------|----------|
| Категория | Health & Fitness, медитация и сон |
| Количество шагов | ~8-10 |
| Подписка | $69.99/год |

**Что делает хорошо:**
- Первый экран — «Take a deep breath» — задает тон всему приложению.
- Персонализация: вопросы о предпочтениях настраивают домашний экран и уведомления.
- Tooltips для навигации — «направление = спокойствие».
- Дыхательное упражнение вместо статичного splash screen — мгновенная вовлеченность.
- 7-дневный бесплатный триал снижает барьер перед ценой $69.99/год.

[GoodUX/Appcues — Calm New User Experience](https://goodux.appcues.com/blog/calm-app-new-user-experience)
[TheAppFuel — Calm Onboarding](https://www.theappfuel.com/examples/calm_onboarding)

### 3.6. BetterMe (Health & Fitness / Fitness & Weight Loss)

| Параметр | Значение |
|----------|----------|
| Категория | Health & Fitness |
| Количество вопросов | **26 вопросов** |
| Модель | Hard paywall |

**Что делает хорошо:**
- Длинный квиз (26 вопросов), но вопросы и ответы короткие — ощущается легко.
- Пользователь чувствует себя «увиденным» (seen) — каждый вопрос про его конкретную ситуацию.
- Цена разбита по неделям — выглядит доступнее.
- Post-paywall upsells: одноразовые предложения (Sugar-Free Challenge, Flat Belly Challenge) для максимизации LTV.
- Hard paywall: нельзя использовать без подписки — фильтрует неплатежеспособных.

[TheAppFuel — BetterMe Onboarding](https://theappfuel.com/examples/bettermefitness_onboarding)
[ScreensDesign — BetterMe Showcase](https://screensdesign.com/showcase/betterme-health-coaching)

### 3.7. Duolingo (Education)

| Параметр | Значение |
|----------|----------|
| Категория | Education |
| Ключевая техника | Отложенная регистрация |

**Что делает хорошо (релевантно для ShiftRest):**
- **Deferred Account Creation**: аккаунт просят создать только когда это необходимо — до этого пользователь уже прошел урок.
- Первый урок ДО регистрации — мгновенный aha-момент.
- Геймификация (gems, streak, прогресс) создает дофаминовый цикл.
- Анимированные прогресс-бары и дружелюбный маскот.
- Extended onboarding: streak emails и еженедельные отчеты для re-engagement.

[UserGuiding — Duolingo Onboarding UX](https://userguiding.com/blog/duolingo-onboarding-ux)
[GoodUX/Appcues — Duolingo Onboarding](https://goodux.appcues.com/blog/duolingo-user-onboarding)
[Braingineers — Neuromarketing Study Duolingo](https://www.braingineers.com/post/user-experience-design-a-neuromarketing-evaluation-of-duolingos-onboarding-flow)

---

## 4. Антипаттерны

### 4.1. Перегрузка информацией

Попытка объяснить все сразу — множество экранов, плотные инструкции, непрерывные подсказки — **подавляет** пользователя вместо того, чтобы направлять. Day 1 retention rate составляет в среднем **20%**, и онбординговый friction — один из главных драйверов churn.
[Usetiful Blog — Common Mobile Onboarding Mistakes](https://blog.usetiful.com/2025/08/how-to-fix-mobile-onboarding-mistakes.html)
[LowCode Agency — Mobile Onboarding Best Practices 2026](https://www.lowcode.agency/blog/mobile-onboarding-best-practices)

### 4.2. Принудительная регистрация до демонстрации ценности

Если приложение требует регистрацию до того, как пользователь увидел хоть какую-то ценность, **часть потенциальных клиентов уходит**. Лучший подход — позволить изучить приложение, а регистрацию отложить максимально.
[Decode Agency — 6 Mistakes to Avoid](https://decode.agency/article/mobile-app-onboarding-mistakes/)

### 4.3. Запрос избыточных данных

Запрос контактов, геолокации или избыточной личной информации **до** доказательства ценности — классический антипаттерн. Каждое поле, которое не ведет к персонализации, — это потеря пользователей.
[Decode Agency — 6 App Onboarding Mistakes](https://decode.agency/article/app-onboarding-mistakes/)

### 4.4. Фокус на фичах, а не на пользе

Многие онбординги объясняют, **что** делают кнопки. Пользователям важно **зачем** — что приложение даст лично им. Feature-first подход не работает.
[DesignStudio — Mobile Onboarding UX Best Practices](https://www.designstudiouiux.com/blog/mobile-app-onboarding-best-practices/)

### 4.5. Отсутствие кнопки Skip

Какой бы ни был короткий и привлекательный онбординг, всегда найдутся пользователи, которые хотят его пропустить. **Не давать такой возможности — серьезная ошибка.** Пользователь должен иметь возможность выйти из онбординга в любой момент.
[Decode Agency — 6 Mistakes to Avoid](https://decode.agency/article/mobile-app-onboarding-mistakes/)

### 4.6. Одноразовый онбординг

Распространенная ошибка — дать хорошую поддержку при первом входе, но оставить это одноразовым событием. Онбординг должен быть расширенным (extended onboarding): повторные подсказки, email-последовательности, контекстные hints при открытии новых функций.
[Usetiful Blog — Common Mobile Onboarding Mistakes](https://blog.usetiful.com/2025/08/how-to-fix-mobile-onboarding-mistakes.html)

### 4.7. Игнорирование платформенных конвенций

Лагающие анимации, навязчивые pop-ups, ненативные компоненты разрушают опыт. Мобильные пользователи чрезвычайно чувствительны к производительности — даже минимальные нарушения ведут к фрустрации и раннему уходу.
[DesignStudio — Mobile Onboarding UX Best Practices](https://www.designstudiouiux.com/blog/mobile-app-onboarding-best-practices/)

### 4.8. Отсутствие тестирования

Самая распространенная ошибка — **не тестировать и не оптимизировать** ранние user flows. Flo запускает ~30 экспериментов в месяц. Нужно измерять drop-off на каждом шаге и итерировать постоянно.
[Decode Agency — 6 Mistakes to Avoid](https://decode.agency/article/mobile-app-onboarding-mistakes/)
[Medium/Flo Health — Mobile Onboarding Evolution](https://medium.com/flo-health/mobile-onboarding-evolution-part-1-cfc9702835ce)

### 4.9. Данные: что конкретно НЕ работает

| Антипаттерн | Эффект |
|-------------|--------|
| Forced Facebook login | **50%** completion (vs 90% при множестве вариантов) |
| Длинные формы без прогресс-бара | **+15% drop-off** на каждый экран после 5-го |
| Paywall без aha-момента | **5.5x ниже** конверсия |
| Онбординг без social proof | **-30%** конверсии |
| Статичный welcome-тур вместо интерактива | Значительно ниже engagement |

[IPification — Cut Drop-Off Rate](https://www.ipification.com/blog/how-mobile-apps-can-cut-the-drop-off-rate-in-sign-in-process/)
[UserGuiding — 100+ Onboarding Statistics](https://userguiding.com/blog/user-onboarding-statistics)

---

## 5. Рекомендации для ShiftRest

### 5.1. Контекст

ShiftRest — sleep advisor для сменных работников (медсёстры, пожарные, фабричные рабочие). Подписочная модель $5.99/мес. Не трекер сна, а персонализированный планировщик: когда спать, тайминг мелатонина, кофеиновый cutoff, планы перехода между сменами.

### 5.2. Рекомендуемое количество шагов

**15-20 экранов** (8-10 логических шагов). Это оптимальный баланс между:
- Достаточным количеством вопросов для глубокой персонализации (ключ к ценности ShiftRest).
- Не таким длинным квизом, как Noom (96 экранов) — у ShiftRest более узкий scope.
- Соответствием стандартам Health & Fitness категории (где длинные квизы — норма).

Обоснование:
- RISE (прямой конкурент) использует 47 шагов — ShiftRest может быть эффективнее за счет более узкого фокуса.
- Каждый экран должен собирать данные, которые **напрямую влияют** на результат (план сна).
- Completion rate падает на 15% после 5 экранов ([LowCode Agency](https://www.lowcode.agency/blog/mobile-onboarding-best-practices)), но прогресс-бар и персонализация компенсируют это.

### 5.3. Какие данные собирать

**Обязательные (влияют на план сна):**

| Шаг | Данные | Зачем |
|-----|--------|-------|
| 1 | Профессия / тип смены (медсестра 3x12, пожарный 24/48, фабрика) | Определяет шаблон расписания |
| 2 | Текущий график смен (дни/ночи/ротация) | Основа для плана сна |
| 3 | Длительность смены (8ч / 12ч / 24ч) | Расчет окна сна |
| 4 | Частота ротации (как часто меняется смена) | Планы перехода между типами |
| 5 | Главная проблема со сном (засыпание, просыпание, усталость на смене) | Персонализация приоритетов |
| 6 | Использование кофеина (да/нет, сколько чашек) | Расчет кофеинового cutoff |
| 7 | Опыт с мелатонином (да/нет) | Персонализация рекомендаций |
| 8 | Время пробуждения / начала смены | Точная привязка плана |

**Дополнительные (для refinement):**
- Возраст (влияет на потребность во сне)
- Семейное положение / дети (реалистичность окна сна)
- Домашние условия для сна (свет, шум)
- Имя (для персонализации UI)

### 5.4. Где показать ценность (Aha-момент)

**Aha-момент ShiftRest = персонализированный план сна.**

После квиза (перед пейволлом) показать:
1. **«На основе ваших ответов, вот ваш план:»** — экран с конкретными временами:
   - Когда ложиться спать
   - Когда принимать мелатонин
   - Кофеиновый cutoff
   - План перехода при смене типа смены
2. **Визуализация**: красивая timeline/график дня с цветовым кодированием (работа, сон, подготовка).
3. **Social proof**: «87% медсестёр с вашим графиком отмечают улучшение сна через 2 недели».

Это критически важно: пользователь должен **увидеть конкретный результат** до пейволла. Не «мы создадим план», а показать сам план (пусть даже сокращенный).

Обоснование: upfront paywall после aha-момента дает **~12% trial-to-paid** vs 2% при отложенном пейволле ([Dev.to — Paywall Timing Paradox](https://dev.to/paywallpro/the-paywall-timing-paradox-why-showing-your-price-upfront-can-5x-your-conversions-4alc)).

### 5.5. Предлагаемая структура онбординга

```
ФАЗА 1: ПРИВЕТСТВИЕ (2 экрана)
├── Экран 1: Welcome + ценностное предложение
│   «Персональный план сна для сменных работников»
│   Social proof: «Используют 50,000+ медсестер и пожарных»
│   CTA: «Создать мой план» (не «Зарегистрироваться»!)
│
├── Экран 2: Выбор профессии (с иконками)
│   Медсестра / Пожарный-EMT / Фабрика / Другое
│   (Определяет весь последующий путь)

ФАЗА 2: ПЕРСОНАЛИЗАЦИЯ — КВИЗ (10-12 экранов)
├── Экран 3: Тип графика
│   3x12 / 2-2-3 / 24/48 / Continental / Свой
│
├── Экран 4: Текущая смена (дневная/ночная/ротация)
│
├── Экран 5: Длительность смены
│   [Social proof break: «93% сменных работников
│    не высыпаются — вы не одиноки»]
│
├── Экран 6: Главная проблема со сном
│   Не могу заснуть после ночной / Просыпаюсь уставшим /
│   Засыпаю на смене / Не могу перестроиться между сменами
│
├── Экран 7: Кофеин (сколько, когда последний раз пьете)
│
├── Экран 8: Мелатонин (пробовали? помогает?)
│
├── Экран 9: Время начала следующей смены
│
├── Экран 10: Домашние условия (темнота, тишина, дети)
│
├── Экран 11: Имя (для персонализации)
│   [Social proof break: отзыв от коллеги по профессии]
│
├── Экран 12: «Анализируем ваш профиль сна...»
│   (Loading screen с анимацией — +10-20% конверсии)

ФАЗА 3: AHA-МОМЕНТ (2-3 экрана)
├── Экран 13: «[Имя], вот ваш персональный план сна»
│   Визуализация: Timeline дня с цветовыми блоками
│   - Рабочая смена (серый)
│   - Окно сна (синий)
│   - Мелатонин (фиолетовый маркер)
│   - Кофеиновый cutoff (красный маркер)
│   - Зона подготовки ко сну (голубой)
│
├── Экран 14: «А вот как перейти с ночной на дневную»
│   Превью плана перехода (показать 1-2 дня)
│
├── Экран 15: Social proof + результаты
│   «Медсестры с графиком 3x12 спят в среднем
│    на 1.5 часа больше с ShiftRest»

ФАЗА 4: ПЕЙВОЛЛ (1 экран)
├── Экран 16: Персонализированный пейволл
│   «[Имя], ваш план готов»
│   - 7-дневный бесплатный триал
│   - $5.99/мес (показать как $1.38/неделю)
│   - Годовой вариант со скидкой
│   - Гарантия: «Отмените в любой момент»
│   - Social proof: звездный рейтинг + кол-во отзывов

ФАЗА 5: POST-PAYWALL SETUP (2-3 экрана)
├── Экран 17: Запрос уведомлений
│   «Чтобы напомнить про мелатонин и сон»
│   (Контекст ПЕРЕД запросом — как RISE)
│
├── Экран 18: Настройка первого напоминания
│
├── Экран 19: «Всё готово! Вот ваш план на сегодня»
│   Переход на главный экран с планом
```

### 5.6. Ключевые принципы для реализации

1. **Прогресс-бар обязателен** — показывать процент или шаги на всех экранах квиза. 78% продуктов это используют, и это дает +50% completion rate.
[UserGuiding — 100+ Onboarding Statistics](https://userguiding.com/blog/user-onboarding-statistics)

2. **Каждый вопрос = одна идея** — не перегружать экраны. Один вопрос — один экран.
[Retention.blog — The Longest Onboarding Ever](https://www.retention.blog/p/the-longest-onboarding-ever)

3. **Social proof в точках drop-off** — минимум 2-3 раза за квиз. Использовать отзывы от конкретных профессий (медсестра, пожарный).
[Glance — When Should Apps Use Social Proof](https://thisisglance.com/learning-centre/when-should-apps-use-social-proof-in-onboarding)

4. **Loading screen перед результатом** — 3-5 секунд анимации «Анализируем ваш профиль» повышает perceived value. Noom использует это с доказанным +10-20% к конверсии.
[Retention.blog — The Longest Onboarding Ever](https://www.retention.blog/p/the-longest-onboarding-ever)

5. **Показать РЕЗУЛЬТАТ перед пейволлом** — не «мы создадим план», а конкретный план с временами. Это aha-момент.
[RevenueCat — Paywall Placement](https://www.revenuecat.com/blog/growth/paywall-placement/)

6. **Цена за неделю** — $5.99/мес отображать как $1.38/нед. Также предложить годовой вариант со скидкой.
[ScreensDesign — BetterMe Showcase](https://screensdesign.com/showcase/betterme-health-coaching)

7. **Пейволл = продолжение квиза** — не должен ощущаться как прерывание. «На основе ваших ответов, [Имя], мы подготовили персональный план...».
[Dev.to — Complete Onboarding Breakdown](https://dev.to/paywallpro/complete-onboarding-breakdown-9-steps-from-first-screen-to-paywall-2j7)

8. **7-дневный триал** — длинные триалы конвертируют на 70% лучше (42.5% vs 25.5%). Но отслеживать Day 0 cancellations (55% всех отмен).
[RevenueCat — State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps/)

9. **Разрешения — после пейволла** — запрашивать уведомления с контекстом («чтобы напомнить про мелатонин вовремя»), как делает RISE.
[Reteno Gallery — RISE Onboarding](https://gallery.reteno.com/flows/app-screens-rise)

10. **Skip-опция** — пользователь должен иметь возможность пропустить квиз, но с soft messaging о потере персонализации.
[Decode Agency — 6 Mistakes to Avoid](https://decode.agency/article/mobile-app-onboarding-mistakes/)

11. **A/B-тестирование с первого дня** — использовать Adapty для экспериментов с пейволлом, длиной квиза и порядком вопросов.
[Adapty — Paywall Experiments Playbook](https://adapty.io/blog/paywall-experiments-playbook/)

12. **Extended onboarding** — после подписки: push-уведомления, in-app подсказки при первом использовании, email-серия с советами по сну для конкретной профессии.
[Usetiful Blog — Common Mobile Onboarding Mistakes](https://blog.usetiful.com/2025/08/how-to-fix-mobile-onboarding-mistakes.html)

### 5.7. Метрики для отслеживания

| Метрика | Целевое значение | Источник бенчмарка |
|---------|-------------------|--------------------|
| Onboarding completion rate | >60% | [Adapty](https://adapty.io/blog/how-to-build-app-onboarding-flows-that-convert/) |
| Trial start rate | >10% (target p90: 20%+) | [RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps/) |
| Trial-to-paid conversion | >40% (7-day trial) | [RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps/) |
| Install-to-paid | >1.78% | [Adapty](https://adapty.io/state-of-in-app-subscriptions-report/) |
| Drop-off per step | <15% | [Gabor Cselle](https://medium.com/gabor/every-step-costs-you-20-of-users-b613a804c329) |
| Day 1 retention | >30% | [Business of Apps](https://www.businessofapps.com/data/app-onboarding-rates/) |
| Day 7 retention | >15% | [Setgreet](https://www.setgreet.com/blog/what-the-numbers-actually-say-about-mobile-app-onboarding-(and-what-to-track)) |

---

## Источники (полный список)

### Отчеты и бенчмарки
- [RevenueCat — State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps/)
- [RevenueCat — State of Subscription Apps 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/)
- [RevenueCat — Subscription App Trends Benchmarks 2026](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026/)
- [Adapty — State of In-App Subscriptions 2026](https://adapty.io/state-of-in-app-subscriptions-report/)
- [Business of Apps — App Onboarding Rates 2025](https://www.businessofapps.com/data/app-onboarding-rates/)
- [Business of Apps — App Conversion Rates 2026](https://www.businessofapps.com/data/app-conversion-rates/)
- [OneSignal — Mobile App Benchmarks 2024](https://onesignal.com/mobile-app-benchmarks-2024)
- [UserGuiding — 100+ Onboarding Statistics 2026](https://userguiding.com/blog/user-onboarding-statistics)

### Практики и руководства
- [Adapty — How to Build App Onboarding Flows](https://adapty.io/blog/how-to-build-app-onboarding-flows-that-convert/)
- [Adapty — Paywall Experiments Playbook](https://adapty.io/blog/paywall-experiments-playbook/)
- [RevenueCat — Paywall Placement](https://www.revenuecat.com/blog/growth/paywall-placement/)
- [RevenueCat — Why Your Onboarding Might Be Too Short](https://www.revenuecat.com/blog/growth/why-your-onboarding-experience-might-be-too-short/)
- [RevenueCat — Hard Paywall vs Soft Paywall](https://www.revenuecat.com/blog/growth/hard-paywall-vs-soft-paywall/)
- [AppAgent — Mobile App Onboarding](https://appagent.com/blog/mobile-app-onboarding/)
- [AppAgent — 5 Paywall Optimization Strategies](https://appagent.com/blog/mobile-app-onboarding-5-paywall-optimization-strategies/)
- [LowCode Agency — Mobile Onboarding Best Practices 2026](https://www.lowcode.agency/blog/mobile-onboarding-best-practices)
- [Userpilot — App Onboarding Best Practices](https://userpilot.com/blog/app-onboarding-best-practices/)
- [Userpilot — Progress Bar Psychology](https://userpilot.com/blog/progress-bar-psychology/)
- [FullStory — Guide to Mobile App Onboarding](https://www.fullstory.com/blog/guide-to-mobile-app-onboarding/)
- [Appcues — Trial to Paid Conversions](https://www.appcues.com/blog/trial-to-paid-conversions-user-onboarding)
- [VWO — Ultimate Mobile App Onboarding Guide 2026](https://vwo.com/blog/mobile-app-onboarding-guide/)
- [Appbooster — Онбординг в мобильном приложении](https://appbooster.com/academy/onboarding-best-practices-for-mobile-apps/)

### Анализ конкретных приложений
- [Justinmind — UX Case Study Noom](https://www.justinmind.com/blog/ux-case-study-of-noom-app-gamification-progressive-disclosure-nudges/)
- [Retention.blog — The Longest Onboarding Ever (Noom)](https://www.retention.blog/p/the-longest-onboarding-ever)
- [The Behavioral Scientist — Noom Product Critique](https://www.thebehavioralscientist.com/articles/noom-product-critique-onboarding)
- [Medium/Flo Health — Mobile Onboarding Evolution Part 1](https://medium.com/flo-health/mobile-onboarding-evolution-part-1-cfc9702835ce)
- [Retention.blog — Flo Success Story](https://www.retention.blog/p/flo-is-an-amazing-success-story)
- [Reteno Gallery — RISE Onboarding Flow](https://gallery.reteno.com/flows/app-screens-rise)
- [ScreensDesign — RISE Sleep Tracker](https://screensdesign.com/showcase/rise-sleep-tracker)
- [GoodUX/Appcues — Headspace Onboarding](https://goodux.appcues.com/blog/headspaces-mindful-onboarding-sequence)
- [Growth.Design — Headspace User Onboarding](https://growth.design/case-studies/headspace-user-onboarding)
- [GoodUX/Appcues — Calm New User Experience](https://goodux.appcues.com/blog/calm-app-new-user-experience)
- [TheAppFuel — BetterMe Onboarding](https://theappfuel.com/examples/bettermefitness_onboarding)
- [UserGuiding — Duolingo Onboarding UX](https://userguiding.com/blog/duolingo-onboarding-ux)
- [GoodUX/Appcues — Duolingo Onboarding](https://goodux.appcues.com/blog/duolingo-user-onboarding)

### Антипаттерны и ошибки
- [Usetiful Blog — Common Mobile Onboarding Mistakes](https://blog.usetiful.com/2025/08/how-to-fix-mobile-onboarding-mistakes.html)
- [Decode Agency — 6 Mistakes to Avoid](https://decode.agency/article/mobile-app-onboarding-mistakes/)
- [Decode Agency — 6 App Onboarding Mistakes](https://decode.agency/article/app-onboarding-mistakes/)
- [DesignStudio — Mobile Onboarding UX Best Practices](https://www.designstudiouiux.com/blog/mobile-app-onboarding-best-practices/)
- [DesignedUp — 200 Onboarding Flows Study](https://designerup.co/blog/i-studied-the-ux-ui-of-over-200-onboarding-flows-heres-everything-i-learned/)
- [Reteno — Onboarding That Works](https://reteno.com/blog/won-in-60-seconds-how-top-apps-nail-onboarding-to-drive-subscriptions)

### Конверсия и social proof
- [Gabor Cselle — Every Step Costs You 20% of Users](https://medium.com/gabor/every-step-costs-you-20-of-users-b613a804c329)
- [Glance — When Should Apps Use Social Proof](https://thisisglance.com/learning-centre/when-should-apps-use-social-proof-in-onboarding)
- [Genesys Growth — Social Proof Conversion Stats](https://genesysgrowth.com/blog/social-proof-conversion-stats-for-marketing-leaders)
- [Dev.to — Paywall Timing Paradox](https://dev.to/paywallpro/the-paywall-timing-paradox-why-showing-your-price-upfront-can-5x-your-conversions-4alc)
- [Dev.to — Complete Onboarding Breakdown](https://dev.to/paywallpro/complete-onboarding-breakdown-9-steps-from-first-screen-to-paywall-2j7)
- [Dev.to — Fitness App Onboarding Guide](https://dev.to/paywallpro/fitness-app-onboarding-guide-data-motivation-completion-an0)
- [Jumio — How to Reduce Customer Abandonment](https://www.jumio.com/how-to-reduce-customer-abandonment/)
- [IPification — Cut Drop-Off Rate](https://www.ipification.com/blog/how-mobile-apps-can-cut-the-drop-off-rate-in-sign-in-process/)
- [Stormy AI — From 0.5% to 8% Conversion](https://stormy.ai/blog/app-paywall-onboarding-optimization-guide)
- [Ridhi Singh — Increased Conversions by 200%](https://medium.com/@ridhisingh/how-we-improved-our-onboarding-funnel-increased-conversions-by-200-9a106b238247)

### Геймификация
- [Userpilot — Onboarding Gamification](https://userpilot.com/blog/onboarding-gamification/)
- [StriveCloud — Gamification Examples Onboarding](https://strivecloud.io/uncategorized/gamification-examples-onboarding/)
- [InAppStory — 10 Gamification Onboarding Techniques](https://inappstory.com/blog/10-gamification-onboarding-techniques)
- [Boxes and Arrows — Gamification in Mobile App Onboarding](https://boxesandarrows.com/how-to-use-gamification-in-mobile-app-onboarding/)
