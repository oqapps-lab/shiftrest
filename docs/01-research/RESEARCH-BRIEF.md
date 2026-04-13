# Research Brief — ShiftRest
**Дата: 13 апреля 2026**

> Синтез исследований: [MARKET-RESEARCH.md](./MARKET-RESEARCH.md), [COMPETITORS.md](./COMPETITORS.md), [USER-PERSONAS.md](./USER-PERSONAS.md), [DOMAIN-RESEARCH.md](./DOMAIN-RESEARCH.md)

---

## Elevator Pitch

ShiftRest — приложение для планирования сна сменных работников (медсёстры, пожарные, заводские рабочие), которое на основе расписания смен и AI генерирует персонализированные планы: когда спать, когда принять мелатонин, когда прекратить кофеин, как перейти с ночного на дневной режим. Не трекер сна, а планировщик — единственный продукт, который не штрафует за дневной сон, а помогает оптимизировать его.

---

## Scoring Table

| # | Критерий | Оценка | Обоснование |
|---|----------|--------|-------------|
| 1 | **Размер рынка** | 9/10 | 22M shift workers в US, 29M в EU, 700M+ глобально. TAM $435M–$1.9B к 2034. Sleep app рынок $2.9B → $9.6B (источник: [MARKET-RESEARCH.md](./MARKET-RESEARCH.md), раздел 8) |
| 2 | **Рост рынка** | 9/10 | Sleep apps CAGR 14.2%. Пост-пандемийный интерес к sleep health +58%. B2B wellness утроился с 2010 ($8B). Новые entrants (OffShift, Riseo) подтверждают тренд (источник: [MARKET-RESEARCH.md](./MARKET-RESEARCH.md), раздел 9) |
| 3 | **Конкуренция** (10 = мало) | 9/10 | <10 shift-specific приложений в App Store. Ни одно не имеет >4.5 звёзд с >1000 отзывов. Market Saturation Score: 2/10. Лидер (Timeshifter) — 3.5 звезды, баги. Верхний правый квадрант Positioning Map (shift-specific + consumer scale) **пуст** (источник: [COMPETITORS.md](./COMPETITORS.md), разделы 5, 7) |
| 4 | **Ясность проблемы** | 10/10 | SWSD = 26.5% среди shift workers (мета-анализ). Потеря 2–4 часа сна/день. $136.4B потерь от усталости. #1 запрос в сообществах — transition planning. 3 персоны подтверждают единую боль (источник: [USER-PERSONAS.md](./USER-PERSONAS.md), Common Patterns) |
| 5 | **Монетизация** | 8/10 | Benchmarks: $40–70/год (Sleep Cycle, RISE, Timeshifter). 37% взрослых готовы платить за sleep coaching. Shift workers — сегмент с повышенной WTP (ночная надбавка, urgent need). B2B-канал через больницы/депо ($3–8/employee/мес). SOM Y3: $5–10M ARR (источник: [MARKET-RESEARCH.md](./MARKET-RESEARCH.md), раздел 7) |
| 6 | **Техническая сложность** (10 = просто) | 7/10 | Expo SDK 55 + React Native = кросс-платформа одним разработчиком. OpenAI API $0.01–0.05/запрос. Но: циркадные алгоритмы (Melatonin PRC, Two-process model) нетривиальны. Нужен validation layer поверх AI. HealthKit/Health Connect интеграция — дополнительная сложность (источник: [DOMAIN-RESEARCH.md](./DOMAIN-RESEARCH.md), разделы 1, 6) |
| 7 | **Уникальность** | 8/10 | Schedule-first подход (не tracking-first). Transition planning — killer feature, которой нет ни у кого. AI-персонализация (consumer-grade SleepSync). Non-judgmental scoring. Cross-platform с Day 1 (конкуренты — iOS only). Family coordination gap полностью не закрыт (источник: [COMPETITORS.md](./COMPETITORS.md), раздел 6) |
| | **ИТОГО** | **8.6/10** | |

---

## Top-5 Insights

### 1. Рынок пуст, но окно закрывается
Market Saturation Score: **2/10**. Менее 10 shift-specific приложений, ни одно не доминирует. Но OffShift (Dec 2025) и Riseo (2026) сигнализируют о растущем интересе. У первого качественного продукта есть **12–18 месяцев** преимущества первого хода.

*Источник: [COMPETITORS.md](./COMPETITORS.md), раздел 7; [MARKET-RESEARCH.md](./MARKET-RESEARCH.md), раздел 9.4*

### 2. «Planning, not tracking» — ключевой дифференциатор
Все три персоны говорят одно: **«Я знаю, что мой сон плохой. Мне нужно приложение, которое скажет, что делать.»** Существующие трекеры (Sleep Cycle, Oura, RISE) штрафуют за дневной сон и предполагают фиксированный режим. ShiftRest — единственный, кто планирует сон вперёд, а не фиксирует результат.

*Источник: [USER-PERSONAS.md](./USER-PERSONAS.md), Common Patterns; [COMPETITORS.md](./COMPETITORS.md), раздел 6*

### 3. Transition planning — killer feature без конкурентов
Переход с ночного на дневной режим — **#1 самый обсуждаемый вопрос** в r/nursing, r/nightshift, r/shiftwork. Ни одно существующее приложение не предлагает пошагового плана перехода. Timeshifter делает это частично, но с багами и за $120/год. ShiftRest может занять эту нишу с лучшим UX по $60/год.

*Источник: [MARKET-RESEARCH.md](./MARKET-RESEARCH.md), раздел 4.2; [COMPETITORS.md](./COMPETITORS.md), раздел 6*

### 4. Наука полностью на стороне продукта
Все рекомендации ShiftRest подкреплены исследованиями уровня AASM/CDC/NASA: Melatonin PRC, caffeine half-life, NASA Nap Study (+34% производительность), Two-process model, Delphi Consensus (2023). FDA guidance 2026 явно классифицирует «sleep management» как wellness — не нужно одобрение. Юридически безопасно при правильном disclaiming.

*Источник: [DOMAIN-RESEARCH.md](./DOMAIN-RESEARCH.md), разделы 1–3*

### 5. B2B — скрытый множитель роста
Больницы теряют **$1.4M/год на 1000 работников** из-за усталости. Workplace wellness рынок = $8B. Timeshifter и SleepSync уже продают B2B. ShiftRest может выйти на B2B на Year 2 после доказательства product-market fit на consumer-рынке, добавив enterprise tier ($3–8/employee/мес).

*Источник: [MARKET-RESEARCH.md](./MARKET-RESEARCH.md), раздел 7.4; [COMPETITORS.md](./COMPETITORS.md), раздел 1.1 (Timeshifter B2B)*

---

## Key Risks

| # | Риск | Вероятность | Последствия | Митигация |
|---|------|------------|-------------|-----------|
| 1 | **Окно закрывается раньше ожидаемого** — новый конкурент с хорошим UX и funding займёт рынок | Средняя | Потеря first-mover advantage; придётся конкурировать по фичам, не по позиционированию | MVP за 4–6 месяцев. Фокус на одной нише (медсёстры). Быстрый feedback loop. Не идеальный продукт, а работающий |
| 2 | **AI-галлюцинации** — OpenAI генерирует опасные рекомендации (неправильное время мелатонина, опасные советы) | Средняя | Репутационный ущерб, юридическая ответственность, потеря доверия | Structured prompts + rule-based validation layer поверх AI. Все рекомендации в рамках AASM/CDC guidelines. Fallback на детерминистический алгоритм. Human review на раннем этапе |
| 3 | **Retention** — пользователи скачивают, пробуют, забрасывают (типичная проблема health apps) | Высокая | Высокий churn, низкий LTV, невозможность масштабировать | Schedule-first подход создаёт recurring value (новый план на каждый блок смен). Push-уведомления привязаны к расписанию. Week 1 должна показать ощутимую ценность (план перехода) |
| 4 | **Регуляторный риск** — FDA переклассифицирует приложение как medical device | Низкая | Необходимость 510(k) clearance, задержка 12–18 месяцев | Строго wellness claims. Disclaimers. Не использовать слова «лечит», «диагностирует». FDA guidance 2026 явно защищает wellness apps (см. [DOMAIN-RESEARCH.md](./DOMAIN-RESEARCH.md), раздел 3.1) |
| 5 | **Cold start на B2B** — больницы и депо имеют длинные циклы продаж (6–12 месяцев) | Высокая | B2B-revenue откладывается, зависимость от consumer-revenue первые 2 года | Начать с consumer (self-serve). B2B — Year 2 приоритет. Pilot с 1–2 hospital systems, чтобы создать case study. Community-driven GTM (r/nursing) |

---

## Hypotheses to Test

### До разработки (Stage 4 — Product)

| # | Гипотеза | Метод проверки | Критерий успеха |
|---|----------|---------------|-----------------|
| H1 | Медсёстры скачают приложение по рекомендации коллеги | Опрос в r/nursing (50+ ответов) или landing page с waitlist | >200 sign-ups за 2 недели при минимальной промоции |
| H2 | Transition plan (ночь→день) — ценнее, чем caffeine/melatonin timing | Опрос «какую фичу хотите первой?» среди waitlist-пользователей | >60% выбирают transition plan |
| H3 | $5.99/мес — приемлемая цена для целевой аудитории | Ценовой тест на landing page (3 варианта: $3.99, $5.99, $7.99) | Конверсия $5.99 не ниже 70% от конверсии $3.99 |

### Во время разработки (Stage 5–6)

| # | Гипотеза | Метод проверки | Критерий успеха |
|---|----------|---------------|-----------------|
| H4 | AI-персонализация даёт ощутимо лучший план, чем rule-based алгоритм | A/B тест (AI vs rules) на beta-тестерах | AI-группа: +15% удовлетворённость планом ИЛИ +20 мин сна (self-report) |
| H5 | Non-judgmental scoring увеличивает retention vs стандартные метрики | A/B тест в приложении | D7 retention: non-judgmental > standard на 10+ п.п. |
| H6 | Push-уведомления, привязанные к расписанию, не раздражают | Опрос + анализ opt-out rate | Opt-out < 20% через 30 дней |

---

## Recommendations — для Stage 4 (Product)

### 1. MVP Scope
**Minimal Viable Product за 4–6 месяцев:**

| Фича | Приоритет | Обоснование |
|------|-----------|-------------|
| Ввод расписания смен (ручной + шаблоны 3x12, 24/48, continental) | P0 | Основа всего — без расписания нет продукта |
| Генерация плана сна (optimal sleep window) | P0 | Core value proposition |
| Transition plan (ночь→день, день→ночь) | P0 | Killer feature, главный дифференциатор |
| Caffeine cutoff timer | P1 | Высокий запрос, простая реализация |
| Melatonin timing | P1 | Высокий запрос, требует PRC-алгоритм |
| AI-персонализация (OpenAI) | P1 | Конкурентное преимущество, но может быть rule-based MVP |
| Non-judgmental sleep score | P2 | Важно для retention, но не для первой ценности |
| HealthKit/Health Connect интеграция | P2 | Nice-to-have, не блокер |
| Family coordination | P3 | Уникальный gap, но не MVP |
| B2B dashboard | P3 | Year 2 |

### 2. Целевая аудитория — фокус
**Primary:** Медсёстры с 3x12 ротациями (US)
- Самое активное сообщество (r/nursing 700K+)
- Самая острая боль (переход ночь→день каждые 4 дня)
- Рекомендации коллег — главный канал discovery
- Готовность платить $5–7/мес подтверждена

**Secondary (Year 1+):** Пожарные/EMS (24/48), factory workers (continental)

### 3. Позиционирование
```
Для: медсестёр и сменных работников с ротационным расписанием
Которые: не могут нормально спать при переходе между ночным и дневным режимом
ShiftRest — это: приложение-планировщик сна
Которое: генерирует персонализированный план: когда спать, когда принять мелатонин, когда перестать пить кофе, как безболезненно перейти с ночей на дни
В отличие от: Sleep Cycle, RISE, Oura (которые штрафуют за дневной сон)
Наше отличие: мы не трекаем сон — мы планируем его. Мы не ругаем за «неправильное» время — мы помогаем в рамках вашего реального расписания.
```

### 4. Монетизация
| Tier | Цена | Что включено |
|------|------|-------------|
| **Free** | $0 | Ввод расписания + базовый sleep window (1 смена) |
| **Premium** | $5.99/мес или $49.99/год | Полный plan + transitions + caffeine + melatonin + AI + history |
| **B2B** (Year 2) | $3–8/employee/мес | Enterprise dashboard + anonymized fatigue risk + compliance |

### 5. Go-to-Market
1. **Community-first:** Присутствие в r/nursing, r/nightshift, r/ems — помогать, не рекламировать
2. **Landing page + waitlist** — для валидации H1 и H3 до начала разработки
3. **Nursing influencers** — Nurse Blake (3.5M), Nurse Mendoza — для awareness при запуске
4. **ASO (App Store Optimization)** — целевые запросы: «shift work sleep», «night shift sleep schedule», «nurse sleep schedule» (слабая конкуренция, высокий спрос)
5. **Word of mouth** — главный канал для shift workers (тесные команды: палата, станция, цех)

### 6. Что НЕ делать
- **Не заявлять медицинские функции** — строго wellness/lifestyle
- **Не делать трекер** — planning, not tracking
- **Не штрафовать** — никаких red scores за дневной сон
- **Не делать B2B до Product-Market Fit** — consumer first
- **Не добавлять wearable requirement** — приложение работает без устройств, wearable — опциональный бонус

---

## Verdict: **GO**

### Обоснование
Редкое сочетание факторов:
1. **Большой рынок** — 22M shift workers в US, TAM $435M–$1.9B
2. **Практически пустая конкуренция** — Market Saturation 2/10, ни одно приложение не доминирует
3. **Подтверждённый спрос** — 26.5% shift workers с SWSD, #1 запрос в сообществах без решения
4. **Чёткая монетизация** — subscription + B2B, benchmarks $40–70/год, SOM Y3 $5–10M
5. **Научная обоснованность** — AASM/CDC/NASA исследования, FDA wellness classification
6. **Техническая осуществимость** — Expo + OpenAI, один разработчик, 4–6 месяцев до MVP

### Условия GO
| # | Условие | Дедлайн |
|---|---------|---------|
| 1 | Landing page + waitlist запущена, валидирует H1 | До начала разработки |
| 2 | MVP (P0 фичи) выпущен в App Store + Google Play | 6 месяцев от старта |
| 3 | Фокус на медсёстрах как primary persona | Year 1 |
| 4 | Transition planning — первая и главная фича | MVP |
| 5 | Все health claims подкреплены исследованиями + disclaimers | Всегда |

### Итоговая оценка: **8.6/10 — GO**

---

## Источники

Все данные и цифры в этом документе основаны на детальных исследованиях, представленных в:
- [MARKET-RESEARCH.md](./MARKET-RESEARCH.md) — размер рынка, TAM/SAM/SOM, Google Trends, Reddit, монетизация, temporal window
- [COMPETITORS.md](./COMPETITORS.md) — 12 конкурентов, positioning map, gap analysis, saturation score
- [USER-PERSONAS.md](./USER-PERSONAS.md) — 3 персоны (медсестра, пожарный, заводской рабочий), реальные цитаты
- [DOMAIN-RESEARCH.md](./DOMAIN-RESEARCH.md) — циркадная наука, регуляторика (FDA/FTC/GDPR), ограничения

Первоисточники (PMC, AASM, CDC, FDA, BLS, Sleep Foundation, App Store, Reddit) указаны в соответствующих документах.
