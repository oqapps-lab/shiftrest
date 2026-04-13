# Product Vision — ShiftRest
**Дата: 13 апреля 2026**

> Синтез документов Stage 2: [TARGET-AUDIENCE.md](./TARGET-AUDIENCE.md), [PROBLEM-SOLUTION-FIT.md](./PROBLEM-SOLUTION-FIT.md), [FEATURES.md](./FEATURES.md), [MONETIZATION.md](./MONETIZATION.md)

---

## 1. Elevator Pitch

**ShiftRest — приложение, которое превращает хаотичное расписание сменного работника в персонализированный план сна: когда спать, когда принять мелатонин, когда прекратить кофеин и как безболезненно перейти с ночного режима на дневной.** В отличие от трекеров (Sleep Cycle, Oura, RISE), которые штрафуют за дневной сон и не понимают ротации, ShiftRest — первый планировщик сна, построенный вокруг реального расписания сменных работников.

---

## 2. Product Canvas

| Блок | Содержание |
|------|-----------|
| **Problem** | 22M+ shift workers в US теряют 2-4 часа сна в день. 26.5% имеют клинический SWSD. Переход между ночным и дневным режимом — #1 нерешённая проблема. Существующие apps штрафуют за «неправильный» сон ([PROBLEM-SOLUTION-FIT.md](./PROBLEM-SOLUTION-FIT.md)) |
| **Solution** | Schedule-first планировщик сна: ввод расписания → персонализированный план (sleep windows, transition plan, melatonin timing, caffeine cutoff). AI-персонализация (OpenAI) с validation layer. Non-judgmental дизайн |
| **Key Metrics** | MRR, D30 retention, trial-to-paid conversion, transition plan engagement, NPS |
| **UVP** | «Мы не трекаем сон — мы планируем его. Первое приложение, которое не ругает за дневной сон, а помогает оптимизировать его.» |
| **Unfair Advantage** | 1) Transition planning — killer feature без конкурентов. 2) Cross-platform с Day 1 (конкуренты iOS-only). 3) Community-driven GTM через r/nursing (700K+). 4) Научная основа: AASM/CDC/NASA-backed алгоритмы |
| **Channels** | 1) Word of mouth (медсестры — тесные команды). 2) r/nursing, r/nightshift, AllNurses. 3) Nursing influencers (Nurse Blake 3.5M). 4) ASO (слабая конкуренция: «shift work sleep»). 5) B2B через hospital wellness programs (Year 2) |
| **Customer Segments** | Primary: медсёстры с 3x12 ротациями (US). Secondary: пожарные/EMS (24/48), заводские рабочие (continental). Year 2: B2B (hospital systems) ([TARGET-AUDIENCE.md](./TARGET-AUDIENCE.md)) |
| **Cost Structure** | Разработка (1 developer, Expo/RN). Инфраструктура: Supabase + OpenAI API ($0.01-0.05/запрос) + Adapty. Marketing: community + influencers. Apple/Google commission: 15-30% |
| **Revenue Streams** | Consumer subscription: $5.99/мес ($49.99/год). B2B enterprise: $3-8/employee/мес (Year 2). Affiliate: blackout curtains, melatonin, light therapy ([MONETIZATION.md](./MONETIZATION.md)) |

---

## 3. Success Metrics (KPI)

### 3.1 Core KPIs

*Benchmarks: H&F median trial-to-paid = 35% (RevenueCat/Adapty 2026), D30 retention H&F = 3% (Enable3 2026). ShiftRest targets above-median за счёт recurring schedule-based value.*

| Метрика | 3 мес | 6 мес | 12 мес |
|---------|-------|-------|--------|
| **MAU** | 3,000 | 12,000 | 40,000 |
| **Paid subscribers** | 250 | 1,100 | 5,000 |
| **Install-to-paid** | 2.5% | 3.5% | 4.5% |
| **Trial-to-paid** | 25% | 30% | 35% |
| **D1 retention** | 30% | 40% | 45% |
| **D7 retention** | 15% | 20% | 25% |
| **D30 retention** | 8% | 12% | 15% |
| **MRR** | $1,125 | $4,950 | $22,500 |
| **Monthly churn** | 10% | 8% | 6% |
| **App Store rating** | 4.2+ | 4.5+ | 4.6+ |
| **NPS** | 30+ | 40+ | 50+ |

### 3.2 Product-Specific KPIs

| Метрика | Цель | Почему важно |
|---------|------|-------------|
| **Transition Plan engagement** | 60%+ paid users создают ≥1 transition plan/мес | Killer feature = core retention driver |
| **Schedule completion** | 80%+ users завершают ввод расписания в onboarding | Без расписания нет ценности |
| **Notification opt-in** | 70%+ | Notifications привязаны к расписанию = персонализированная ценность |
| **Notification opt-out (D30)** | <20% | Hypothesis H6: привязанные к расписанию notifications не раздражают |
| **AI satisfaction** | AI-план rated 4+/5 у 70%+ users | Hypothesis H4: AI > rule-based |
| **Onboarding completion** | 85%+ | Максимум 2 минуты — если бросают, UX слишком сложный |

### 3.3 Business KPIs

| Метрика | Year 1 | Year 2 | Year 3 |
|---------|--------|--------|--------|
| **ARR** | $120K-270K | $1.3-3.5M | $5.4-8.9M |
| **Paid users** | 5K | 32K | 80-120K |
| **B2B employees** | — | 10K | 30-50K |
| **LTV** | $54 | $60 | $67+ |
| **CAC (blended)** | $8 | $7 | $6 |
| **LTV/CAC** | 6.8x | 8.6x | 11x+ |

---

## 4. Roadmap

### Phase 1: MVP (Month 1-2) — Design & Foundation

**Цель:** Дизайн + архитектура + core screens

| Задача | Детали |
|--------|--------|
| UX/UI дизайн | Wireframes + hi-fi дизайн для 5 экранов + onboarding |
| Design system | Цвета, шрифты, компоненты (3-Layer Layout System) |
| Архитектура | Expo Router, Supabase schema, API contracts |
| Schedule engine | Шаблоны ротаций (3x12, 24/48, continental), ручной ввод |
| Onboarding flow | 4-6 шагов, хронотип-опросник, profession picker |

**Deliverable:** Clickable prototype + technical foundation

### Phase 2: Core Product (Month 3-4) — Build MVP

**Цель:** Работающий продукт с P0 фичами

| Задача | Детали |
|--------|--------|
| Sleep Plan Algorithm | Two-process model + chronotype → optimal sleep windows |
| Transition Planning | Night→Day и Day→Night plans, 2-3 day timeline |
| Caffeine & Melatonin | Cutoff timer + PRC-based timing + push notifications |
| AI Integration | OpenAI structured prompts + validation layer + fallback |
| Smart Notifications | Schedule-bound pushes: sleep prep, caffeine, melatonin, sunglasses |
| Paywall + Adapty | Freemium model, 7-day trial, subscription management |

**Deliverable:** Feature-complete MVP ready for testing

### Phase 3: Launch (Month 5-6) — Ship & Iterate

**Цель:** App Store + первые 5,000 users

| Задача | Детали |
|--------|--------|
| Beta testing | 50-100 медсестёр через r/nursing waitlist |
| Bug fixing | Stability, edge cases (overtime, shift swaps) |
| App Store submission | iOS + Android одновременно (Expo EAS) |
| ASO | Optimize для «shift work sleep», «nurse sleep schedule» |
| Community launch | r/nursing, r/nightshift, AllNurses — help, not advertise |
| Waitlist activation | Email/SMS waitlist → download link |
| Influencer outreach | 2-3 nursing influencers для awareness |

**Deliverable:** Live in App Store + Google Play, first 5K downloads

### Phase 4: Growth v1.0 (Month 7-9) — Retention & Expansion

**Цель:** Product-market fit validation, expand to secondary personas

| Задача | Детали |
|--------|--------|
| Non-judgmental sleep score | Shift-appropriate метрики (F9) |
| Light exposure guide | CDC/NIOSH-based recommendations (F10) |
| Sleep history & trends | Dashboard с историей (F11) |
| HealthKit/Health Connect | Optional wearable data import (F12) |
| 24/48 + continental templates | Unlock пожарных и заводских рабочих |
| Retention optimization | Push timing, re-engagement, churn analysis |

**Deliverable:** v1.1 with expanded audience + retention features

### Phase 5: Scale v1.5 (Month 10-12) — B2B Foundation

**Цель:** Подготовка к B2B, international expansion

| Задача | Детали |
|--------|--------|
| Calendar import | Google Calendar / iCal import (F13) |
| Family coordination | Shared schedule for partners (F14) |
| Apple Watch companion | Quick view + haptic reminders (F17) |
| B2B pilot | 1-2 hospital systems, admin dashboard MVP |
| Localization research | UK, Australia, Canada — English first |
| A/B testing framework | AI vs rules (H4), scoring styles (H5) |

**Deliverable:** v1.5 + first B2B pilot agreements

---

## 5. Roadmap Summary (Visual)

```
Month:   1    2    3    4    5    6    7    8    9    10   11   12
         ├────┤    ├────┤    ├────┤    ├────┤    ├────┤    ├────┤
Phase 1: ██████                                              
         Design                                              
                                                             
Phase 2:       ████████                                      
               Build MVP                                     
                                                             
Phase 3:                ████████                              
                        Launch                               
                                                             
Phase 4:                         ████████████                
                                 Growth v1.0                 
                                                             
Phase 5:                                      ████████████   
                                              Scale v1.5     

KPIs:    ·····  ·····  250    1.1K   ·····  2.5K   ·····  5K paid
         Design  Beta   paid   paid   ·····  paid   ·····  users
```

---

## 6. Risk Mitigation Plan

| # | Риск | Вероятность | Митигация | Owner |
|---|------|------------|-----------|-------|
| 1 | **Окно закрывается** — конкурент с хорошим UX и funding | Средняя | MVP за 6 мес. Focus на одной нише (медсёстры). Speed > perfection | Product |
| 2 | **AI-галлюцинации** — опасные рекомендации | Средняя | Structured prompts + rule-based validation. Fallback на детерминистический алгоритм. Human review на beta | Engineering |
| 3 | **Low retention** — скачали → попробовали → забросили | Высокая | Recurring value через schedule-bound notifications. Transition plan = return trigger каждый цикл смен. Week 1 = aha-moment | Product |
| 4 | **Регуляторный риск** — FDA переклассификация | Низкая | Строго wellness claims. Disclaimers. Юридический review перед запуском | Legal |
| 5 | **B2B cold start** — длинные циклы продаж | Высокая | Consumer-first. B2B на Year 2 после PMF. Pilot с 1-2 hospital systems | Business |

---

## 7. Hypotheses Validation Plan

### До запуска (Month 1-4)

| ID | Гипотеза | Метод | Критерий успеха | Статус |
|----|---------|-------|-----------------|--------|
| H1 | Медсёстры скачают по рекомендации коллеги | Landing page + waitlist через r/nursing | >200 sign-ups за 2 недели | Pending |
| H2 | Transition plan ценнее caffeine/melatonin timing | Опрос waitlist: «какую фичу хотите первой?» | >60% выбирают transition plan | Pending |
| H3 | $5.99/мес — приемлемая цена | A/B тест на landing page (3 варианта) | $5.99 конверсия ≥70% от $3.99 | Pending |

### После запуска (Month 5-12)

| ID | Гипотеза | Метод | Критерий успеха | Статус |
|----|---------|-------|-----------------|--------|
| H4 | AI-план лучше rule-based | A/B тест в приложении | AI-группа: +15% satisfaction ИЛИ +20 мин сна | Pending |
| H5 | Non-judgmental scoring → retention | A/B тест: non-judgmental vs standard | D7 retention +10 п.п. | Pending |
| H6 | Schedule-bound notifications не раздражают | Opt-out rate analysis | Opt-out <20% через 30 дней | Pending |

*Источник: [RESEARCH-BRIEF.md](../01-research/RESEARCH-BRIEF.md), Hypotheses to Test*

---

## 8. Что НЕ делаем (и почему)

| Решение | Обоснование |
|---------|-------------|
| **Не делаем sleep tracker** | Planning, not tracking — наш дифференциатор. Tracking = другой рынок (Sleep Cycle, Oura) |
| **Не заявляем медицинские функции** | FDA wellness classification. «Улучшает качество сна» ✅, «Лечит SWSD» ❌ |
| **Не штрафуем за «плохой» сон** | Non-judgmental = core brand promise. Red scores = причина удаления (#1 complaint shift workers) |
| **Не требуем wearable** | Работает без устройств. Wearable = опциональный бонус. Снижает барьер входа |
| **Не делаем B2B до PMF** | Consumer-first. B2B = Year 2 после доказательства product-market fit |
| **Не добавляем meditation/sounds** | Перенасыщенный рынок (Calm, Headspace). Не наша ценность |
| **Не делаем social features** | Sleep planning — индивидуальная задача. Social accountability не релевантна |

---

## 9. Verdict: **GO**

### Обоснование

Product Definition подтверждает выводы Research Stage и конкретизирует их:

| Фактор | Research (8.6/10) | Product Definition |
|--------|-------------------|-------------------|
| **Рынок** | 22M shift workers, TAM $435M-$1.9B | Primary persona (медсёстры) = 6M, достаточно для Year 1 |
| **Конкуренция** | Saturation 2/10, ни одно не доминирует | 3 чётких дифференциатора: transition planning, schedule-first, non-judgmental |
| **Проблема** | 26.5% SWSD, #1 запрос — transition | Problem-solution fit подтверждён для всех 3 персон, validation checklist — все 4 пункта ✅ |
| **Монетизация** | $40-70/год benchmarks | $5.99/мес ($49.99/год), LTV/CAC 5.4-16.2x, payback <3 мес |
| **Scope** | MVP 4-6 мес | 8 фич MVP, 5 экранов, ~16-20 недель разработки |
| **Roadmap** | — | 5 фаз, от дизайна до B2B pilot за 12 месяцев |

### Условия GO

| # | Условие | Дедлайн | Зависимость |
|---|---------|---------|-------------|
| 1 | Landing page + waitlist запущена, H1 валидирована (>200 sign-ups) | До начала Phase 2 (Month 2) | Marketing |
| 2 | Pricing test (H3) завершён, $5.99 подтверждена | До начала Phase 2 (Month 2) | Marketing |
| 3 | UX дизайн: 5 экранов + onboarding утверждены | Конец Phase 1 (Month 2) | Design |
| 4 | MVP (P0 + P1 фичи) в App Store + Google Play | Конец Phase 3 (Month 6) | Engineering |
| 5 | 5,000 downloads + 250 paid users | Конец Month 8 | Growth |
| 6 | App Store rating ≥4.2 | Month 9 | Quality |

### Итоговая оценка: **GO — переход к UX-проектированию (Stage 3)**

Продукт имеет:
- **Чёткую аудиторию** — медсёстры с 3x12 ротациями
- **Killer feature** — transition planning (никто не делает)
- **Жизнеспособную экономику** — LTV/CAC >5x, payback <3 мес
- **Реалистичный scope** — 8 фич, 5 экранов, 4-6 мес
- **Временное окно** — 12-18 мес first-mover advantage

---

## Источники

Этот документ синтезирует:
- [TARGET-AUDIENCE.md](./TARGET-AUDIENCE.md) — расширенные персоны, primary persona, JTBD
- [PROBLEM-SOLUTION-FIT.md](./PROBLEM-SOLUTION-FIT.md) — проблема, решение, validation checklist
- [FEATURES.md](./FEATURES.md) — MVP scope, фичи, dependency map
- [MONETIZATION.md](./MONETIZATION.md) — pricing, unit economics, revenue projections
- [RESEARCH-BRIEF.md](../01-research/RESEARCH-BRIEF.md) — scoring 8.6/10, вердикт GO, гипотезы
- Все документы docs/01-research/ — первичные данные
