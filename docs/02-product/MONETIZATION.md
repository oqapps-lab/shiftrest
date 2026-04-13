# Monetization — ShiftRest
**Дата: 13 апреля 2026**

> Основано на: [MARKET-RESEARCH.md](../01-research/MARKET-RESEARCH.md), [COMPETITORS.md](../01-research/COMPETITORS.md), [TARGET-AUDIENCE.md](./TARGET-AUDIENCE.md), бенчмарки RevenueCat/Adapty, веб-поиск.

---

## 1. Модель монетизации: Freemium + Subscription

### Выбранная модель

**Freemium с premium подпиской (monthly + annual).**

### Почему именно эта модель

| Альтернатива | Почему НЕ подходит |
|-------------|-------------------|
| **One-time purchase** | Нет recurring revenue → не масштабируется. Sleep plan обновляется каждый блок смен → recurring value = recurring payment |
| **Ads-supported** | Health-аудитория чувствительна к рекламе. Реклама в sleep app = враждебный UX. Low CPM для нишевой аудитории |
| **Pure subscription (без free tier)** | Shift workers скептичны — нужно показать ценность до оплаты. Бесплатный план = воронка для organic growth |
| **IAP (разовые покупки)** | Не подходит для ongoing service. План сна нужен каждую неделю, не один раз |
| **Freemium + subscription** | **Выбрано.** Free tier для discovery + premium для полной ценности. Стандарт для health apps (RISE, Sleep Cycle, Pillow) |

### Обоснование

1. **Subscription = recurring value.** ShiftRest генерирует новый план каждый блок смен → пользователь получает ценность повторно → подписка справедлива
2. **Freemium = growth engine.** 37% взрослых готовы платить за sleep coaching ([Sleep Foundation](https://www.sleepfoundation.org/)), но нужно показать ценность сначала
3. **Industry standard.** 55% revenue в sleep apps — paid subscriptions. Premium revenue растёт на 40% в год ([MARKET-RESEARCH.md](../01-research/MARKET-RESEARCH.md), раздел 7.2)
4. **Adapty-compatible.** Стек проекта включает Adapty для подписок ([CLAUDE.md](../../CLAUDE.md))

---

## 2. Тиры подписки

| Тир | Цена | Что включено | Ограничения |
|-----|------|-------------|-------------|
| **Free** | $0 | Ввод расписания (1 шаблон) + базовый sleep window (текущий блок смен) + caffeine cutoff (общий) | 1 шаблон ротации, нет transition plan, нет melatonin timing, нет AI, нет history, нет push-notifications с привязкой к расписанию |
| **Premium Monthly** | **$5.99/мес** | Всё из Free + Transition Plan + Melatonin timing + AI-персонализация + полный caffeine timer + smart notifications + история сна + все шаблоны ротаций + light exposure guide | — |
| **Premium Annual** | **$49.99/год** (~$4.17/мес) | Всё из Premium Monthly, экономия 30% | — |
| **B2B Enterprise** (Year 2) | **$3-8/employee/мес** | Всё из Premium + admin dashboard + anonymized fatigue analytics + compliance reports + SSO/SAML + bulk onboarding | Минимум 50 employees |

### Freemium-стратегия: «Покажи ценность, потом проси деньги»

**Бесплатный tier должен быть полезным, но ограниченным:**
- Пользователь вводит расписание → видит базовый план сна (optimal sleep window)
- **Aha-moment** происходит в Free: «Это приложение понимает мой график!»
- **Paywall trigger:** когда пользователь нажимает на Transition Plan или Melatonin Timing → soft paywall с 7-дневным trial

**Почему 7-дневный trial:**
- 1 полный цикл смен (3 ночных + 4 выходных или 2D/2N/4off) занимает ~7 дней
- За 7 дней пользователь проходит минимум 1 transition → видит ценность killer feature
- Industry standard для health apps (RISE, Sleep Cycle используют 7-day trial)

---

## 3. Ценообразование

### 3.1 Бенчмарки конкурентов

| Приложение | Месяц | Год | Тип |
|-----------|-------|-----|-----|
| Timeshifter Shift Work | $9.99 | $69.99 ($120/год full) | Прямой конкурент |
| RISE | — | $69.99 | General sleep (лидер) |
| Sleep Cycle Premium | — | $39.99 | General sleep |
| Pillow Premium | $4.99 | $39.99 | General sleep |
| Oura Membership | $5.99 | $69.99 | Wearable subscription |
| Calm | $14.99 | $69.99 | Meditation/sleep |
| Headspace | $12.99 | $69.99 | Meditation/sleep |

*Источник: [COMPETITORS.md](../01-research/COMPETITORS.md), [MARKET-RESEARCH.md](../01-research/MARKET-RESEARCH.md), раздел 7.1*

### 3.2 Бенчмарки категории (RevenueCat 2025-2026 / Adapty 2026)

| Метрика | Health & Fitness (benchmark) | ShiftRest (цель) | Источник |
|---------|------------------------------|-------------------|----------|
| **Медианная цена monthly** | $12.99/мес | $5.99/мес | [RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps/) |
| **Медианная цена annual** | $38.42/год | $49.99/год | [RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps/) |
| **Trial-to-paid conversion** | 35.0% (median H&F), top 10% = 68.3% | 30-40% | [RevenueCat 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/), [Adapty 2026](https://adapty.io/blog/health-fitness-app-subscription-benchmarks/) |
| **Install-to-trial** | 10.9% (global) | 10-15% | [Adapty 2026](https://adapty.io/state-of-in-app-subscriptions/) |
| **Install-to-paid (with trial)** | 1.78% (global) | 3-5% | [Adapty 2026](https://adapty.io/state-of-in-app-subscriptions/) |
| **Annual vs Monthly split** | 60.6% annual / 39.4% monthly (H&F) | 65/35 annual | [Adapty 2026](https://adapty.io/blog/health-fitness-app-subscription-benchmarks/) |
| **First-renewal retention (H&F)** | 30.3% (lowest category) | 40%+ | [RevenueCat 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/) |
| **Year 1 LTV per payer (NA)** | $32 | $54+ | [RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps/) |
| **Revenue per install (60 days)** | $0.63 (H&F) | $0.80+ | [RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps/) |
| **D1 retention (H&F)** | 20-27% | 40%+ | [Enable3 2026](https://enable3.io/blog/app-retention-benchmarks-2025) |
| **D7 retention (H&F)** | ~7% | 25%+ | [Enable3 2026](https://enable3.io/blog/app-retention-benchmarks-2025) |
| **D30 retention (H&F)** | ~3% | 15%+ | [Enable3 2026](https://enable3.io/blog/app-retention-benchmarks-2025) |
| **Optimal trial length** | 5-9 дней (45% conversion) | 7 дней | [Adapty 2026](https://adapty.io/blog/trial-conversion-rates-for-in-app-subscriptions/) |

**Почему ShiftRest может превысить H&F benchmarks по retention:**
- H&F benchmark D30 = 3% включает фитнес-приложения, которые забрасывают после NYE. ShiftRest имеет recurring trigger — каждый цикл смен генерирует новый план
- Schedule-bound notifications создают habitual return loop (не generic «time to work out»)
- Shift workers с acute pain = выше мотивация, чем у среднего H&F пользователя

**Sleep App Market:**
- 2024: $4.5B → 2033: $12.5B (CAGR 12.5%) — [Business Research Insights](https://www.businessresearchinsights.com/market-reports/sleep-apps-and-sleep-tracking-apps-market-125301)
- Top revenue: ShutEye $17M, Sleep Cycle $16M, BetterSleep $13M

### 3.3 Обоснование $5.99/мес ($49.99/год)

| Фактор | Анализ |
|--------|--------|
| **Дешевле главного конкурента** | Timeshifter: $9.99/мес. ShiftRest: $5.99/мес → на 40% дешевле с лучшим продуктом |
| **В рамках WTP аудитории** | Марина: $5-7/мес, Алексей: $5-8/мес, Даниил: $3-5/мес. $5.99 попадает в sweet spot для 2/3 персон |
| **Фрейминг ценности** | «Дешевле одной пачки мелатонина в месяц» ($10-15). «Дешевле 2 банок Red Bull в неделю» ($6-8) |
| **Annual discount = 30%** | $49.99/год vs $71.88 (12x$5.99). Достаточный discount для конверсии в annual |
| **Пространство для B2B** | $3-8/employee/мес для enterprise — маржа для объёмных скидок |
| **Price anchoring** | RISE $69.99/год — ShiftRest $49.99/год при более специализированном продукте |

### 3.4 Ценовые эксперименты (гипотеза H3 из Research)

| Вариант | Цена | Ожидаемая конверсия | Назначение |
|---------|------|--------------------|-----------| 
| A | $3.99/мес | Baseline (100%) | Максимальная конверсия, но низкий ARPU |
| **B (основной)** | **$5.99/мес** | **70-85% от A** | **Оптимальный баланс конверсии и ARPU** |
| C | $7.99/мес | 50-65% от A | Высокий ARPU, но может оттолкнуть бюджетный сегмент (Даниил) |

*Тест: landing page с 3 вариантами до начала разработки ([RESEARCH-BRIEF.md](../01-research/RESEARCH-BRIEF.md), гипотеза H3)*

---

## 4. Unit Economics (целевые)

### 4.1 Базовые метрики

| Метрика | Значение | Industry Benchmark | Обоснование |
|---------|----------|--------------------|-------------|
| **ARPU (monthly)** | $4.50 | — | Blend: 65% annual ($4.17/мес) + 35% monthly ($5.99/мес) |
| **ARPU (annual)** | $54.00 | $32 (H&F NA, RevenueCat) | Выше benchmark за счёт premium pricing ($49.99/год > медиана $38.42) |
| **Install-to-trial** | 10-15% | 10.9% (Adapty 2026) | Aha-moment до paywall повышает trial starts |
| **Trial-to-paid** | 30-40% | 35.0% (H&F median, Adapty/RevenueCat) | 7-дневный trial = 1 полный цикл смен. Оптимальный диапазон 5-9 дней (45% conversion по Adapty) |
| **Install-to-paid** | 3-5% | 1.78% (Adapty 2026) | Выше за счёт acute pain + niche focus. Niche apps конвертируют лучше general |
| **Monthly churn** | 5-8% | First-renewal retention 30.3% в H&F (RevenueCat) | Recurring value (новый план каждый цикл) + schedule-bound notifications снижают churn |
| **Average lifetime** | 12-18 мес | ~4-6 мес (H&F median) | Выше benchmark: shift work = ongoing problem, не сезонный goal |

### 4.2 LTV (Lifetime Value)

| Сценарий | Lifetime | ARPU/мес | LTV |
|----------|----------|----------|-----|
| **Conservative** | 12 мес | $4.50 | **$54** |
| **Base** | 15 мес | $4.50 | **$67.50** |
| **Optimistic** | 18 мес | $4.50 | **$81** |

### 4.3 CAC (Customer Acquisition Cost)

| Канал | CAC | Обоснование |
|-------|-----|-------------|
| **Organic (ASO + Reddit + WOM)** | $0-2 | Word of mouth + community presence + App Store search. Целевой канал Year 1 |
| **Paid Social (TikTok/Instagram)** | $8-15 | Health app benchmark. Niche targeting (nurses, shift workers) снижает CAC |
| **Influencer (Nursing)** | $3-8 | Nurse influencers: $1-5K за пост, 50K+ reach. CPM ниже, чем paid social |
| **B2B (Hospital)** | $20-40/employee | Длинный цикл продаж, но high LTV (employer pays → 0% churn) |
| **Blended CAC (Year 1)** | **$5-10** | 70% organic + 20% influencer + 10% paid |

### 4.4 Unit Economics Summary

| Метрика | Conservative | Base | Optimistic |
|---------|-------------|------|-----------|
| **LTV** | $54 | $67.50 | $81 |
| **CAC** | $10 | $7 | $5 |
| **LTV/CAC** | **5.4x** | **9.6x** | **16.2x** |
| **Payback Period** | 2.2 мес | 1.6 мес | 1.1 мес |
| **Gross Margin** | ~85% | ~87% | ~90% |

**Все сценарии проходят критерии:**
- LTV/CAC > 3x: **Да** (5.4x - 16.2x)
- Payback < 6 мес: **Да** (1.1 - 2.2 мес)

### 4.5 Cost Structure

| Статья расходов | $/мес на 1000 paid users | % Revenue |
|----------------|-------------------------|-----------|
| **Supabase** (auth, DB, storage) | $25-50 | ~1% |
| **OpenAI API** ($0.01-0.05/запрос, ~10 запросов/user/мес) | $100-500 | ~3-11% |
| **Adapty** (subscription management) | $50-100 | ~1-2% |
| **Apple/Google commission** | 15-30% of revenue | 15-30% |
| **Push notifications (Expo)** | $0-25 | <1% |
| **Hosting/CDN** | $10-30 | <1% |
| **Total variable cost** | ~$200-700 | ~20-35% |

**Gross margin: ~65-80%** (после комиссий App Store и variable costs)

*Примечание: Apple/Google забирают 30% в первый год, 15% после $1M revenue (Small Business Program)*

---

## 5. Revenue Projections

### Year 1 (Launch + Growth)

| Параметр | Month 1-3 | Month 4-6 | Month 7-9 | Month 10-12 | Total Y1 |
|----------|-----------|-----------|-----------|-------------|----------|
| **Downloads** | 5K | 15K | 25K | 40K | 85K |
| **Cumulative paid** | 250 | 1,100 | 2,500 | 5,000 | 5,000 |
| **MRR** | $1,125 | $4,950 | $11,250 | $22,500 | — |
| **Quarterly revenue** | $3,375 | $14,850 | $33,750 | $67,500 | **$119,475** |

### Year 2 (Expansion)

| Параметр | Q1 | Q2 | Q3 | Q4 | Total Y2 |
|----------|-----|-----|-----|-----|----------|
| **Cumulative paid** | 8K | 14K | 22K | 32K | 32K |
| **B2B employees** | 500 | 2K | 5K | 10K | 10K |
| **Consumer MRR** | $36K | $63K | $99K | $144K | — |
| **B2B MRR** | $2.5K | $10K | $25K | $50K | — |
| **Total quarterly** | $115K | $219K | $372K | $582K | **$1.29M** |

### Year 3 (Scale)

| Параметр | Total Y3 |
|----------|----------|
| **Paid users** | 80-120K |
| **B2B employees** | 30-50K |
| **Consumer ARR** | $4.3-6.5M |
| **B2B ARR** | $1.1-2.4M |
| **Total ARR** | **$5.4-8.9M** |

*Согласуется с SOM Y3 из [MARKET-RESEARCH.md](../01-research/MARKET-RESEARCH.md): $5-10M*

---

## 6. Дополнительные потоки revenue

### 6.1 B2B Enterprise (Year 2+)

| Параметр | Значение |
|----------|----------|
| **Целевые клиенты** | Hospital systems, fire departments, manufacturing plants, EMS agencies |
| **Pricing** | $3-8/employee/мес (volume-dependent) |
| **Что включено** | Premium для всех сотрудников + admin dashboard + fatigue risk analytics + compliance |
| **Sales cycle** | 3-6 месяцев для pilot, 6-12 для full deployment |
| **Benchmark** | Timeshifter предлагает B2B trials на 250+ сотрудников. SleepSync — B2B для здравоохранения, обороны, горнодобычи |
| **Потенциал** | $1.4M/год потерь от усталости на 1000 работников → ShiftRest окупается при 1% reduction в абсентеизме |

*Источник: [MARKET-RESEARCH.md](../01-research/MARKET-RESEARCH.md), раздел 7.4*

### 6.2 Affiliate (Year 1+)

| Продукт | Модель | Потенциал |
|---------|--------|-----------|
| **Blackout шторы** (Amazon) | Affiliate link в рекомендациях | Low ($1-3/sale), но organic fit |
| **Мелатонин** (бренды) | Affiliate / sponsored recommendation | Medium — осторожно с FTC disclosure |
| **Светотерапевтические лампы** | Affiliate link | Low-medium |
| **Wearables** (Ultrahuman, Oura) | Partnership / affiliate | Medium — co-marketing opportunity |

**Ожидаемый revenue от affiliate: <5% от total** — не основной поток, но дополнительная ценность для пользователя.

### 6.3 Data Insights (Year 3+, осторожно)

- **Aggregated, anonymized** данные о паттернах сна shift workers
- Потенциальные покупатели: healthcare systems, insurance companies, occupational health researchers
- **Важно:** только aggregated + anonymized. GDPR/privacy first. Explicit consent
- **Потенциал:** Low priority, high sensitivity. Не ключевой revenue stream

---

## 7. Paywall Strategy

### Тип paywall: Soft Paywall с Free Value

```
User Journey:
1. Download → Onboarding (FREE) → See basic sleep plan (FREE)
   ↓
2. Tap "Transition Plan" → Soft paywall → 7-day trial
   ↓
3. Trial starts → Full access 7 days → Conversion decision
   ↓
4. Trial ends → Premium or downgrade to Free tier
```

### Paywall Design Principles

1. **Value before paywall** — пользователь видит базовый план до оплаты (aha-moment)
2. **Soft, not hard** — не блокирует приложение, а ограничивает premium фичи
3. **7-day trial** — 1 полный цикл смен = 1 переход = ценность transition plan
4. **No dark patterns** — чёткое напоминание за 24ч до окончания trial
5. **Easy cancel** — одна кнопка в Settings. Не скрывать

### Conversion Optimization

| Тактика | Когда | Ожидаемый эффект |
|---------|-------|-----------------|
| **Aha-moment before paywall** | Onboarding → basic plan | Доверие → выше конверсия |
| **Anchor pricing** | Paywall screen: $5.99/мес vs $49.99/год (сохраняете $22) | Annual конверсия 60-70% |
| **Social proof** | «Используют 10,000+ медсестёр» (после достижения) | +10-15% конверсия |
| **Urgency framing** | «Ваш план перехода на завтра — попробуйте бесплатно 7 дней» | Привязка к реальному расписанию |
| **Trial reminder** | Push за 24ч до окончания trial | Уменьшает accidental churn |

---

## 8. Ключевые метрики для отслеживания

| Метрика | Формула | Цель Year 1 |
|---------|---------|-------------|
| **MRR** | Sum(active subscriptions x price) | $22,500 к Month 12 |
| **Conversion Rate** | Paid users / Total users | 4-6% |
| **Trial-to-Paid** | Paid after trial / Trial starts | 30-40% |
| **Monthly Churn** | Cancellations / Active subscribers | <8% |
| **ARPU** | MRR / Active paid users | $4.50 |
| **LTV** | ARPU x Avg lifetime | $54-81 |
| **CAC** | Marketing spend / New paid users | <$10 |
| **LTV/CAC** | LTV / CAC | >5x |
| **Payback Period** | CAC / ARPU monthly | <3 мес |

---

## Источники

### Research Stage
- [MARKET-RESEARCH.md](../01-research/MARKET-RESEARCH.md) — pricing benchmarks, WTP data, TAM/SAM/SOM, B2B opportunity
- [COMPETITORS.md](../01-research/COMPETITORS.md) — competitor pricing, positioning
- [TARGET-AUDIENCE.md](./TARGET-AUDIENCE.md) — WTP по персонам
- [RESEARCH-BRIEF.md](../01-research/RESEARCH-BRIEF.md) — monetization recommendations

### Industry Benchmarks (2025-2026)
- [RevenueCat State of Subscription Apps 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/) — conversion rates, churn, LTV benchmarks
- [RevenueCat State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps/) — pricing, revenue per install, subscription trends
- [RevenueCat Blog: Subscription Trends 2026](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026/) — 10-minute summary
- [Adapty State of In-App Subscriptions 2026](https://adapty.io/state-of-in-app-subscriptions/) — install-to-trial, trial-to-paid, pricing data
- [Adapty: Health & Fitness App Benchmarks 2026](https://adapty.io/blog/health-fitness-app-subscription-benchmarks/) — category-specific benchmarks
- [Adapty: Trial Conversion Rates 2026](https://adapty.io/blog/trial-conversion-rates-for-in-app-subscriptions/) — optimal trial length, price impact
- [Enable3: App Retention Benchmarks 2026](https://enable3.io/blog/app-retention-benchmarks-2025) — D1/D7/D30 by category

### Sleep App Market
- [Business Research Insights: Sleep Apps Market 2034](https://www.businessresearchinsights.com/market-reports/sleep-apps-and-sleep-tracking-apps-market-125301) — $4.5B→$12.5B
- [Sleep Cycle Investor Relations](https://investors.sleepcycle.com/) — $16M net revenue, pricing model
