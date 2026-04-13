# Problem-Solution Fit — ShiftRest
**Дата: 13 апреля 2026**

> Основано на: [MARKET-RESEARCH.md](../01-research/MARKET-RESEARCH.md), [COMPETITORS.md](../01-research/COMPETITORS.md), [USER-PERSONAS.md](../01-research/USER-PERSONAS.md), [DOMAIN-RESEARCH.md](../01-research/DOMAIN-RESEARCH.md)

---

## 1. Проблема

### 1.1 Какая боль?

**Сменные работники не могут нормально спать при переходе между ночным и дневным режимом, а существующие инструменты не понимают их расписание.**

Конкретно:
- После блока ночных смен организм не может быстро переключиться на дневной режим. Полная циркадная адаптация занимает 7-14 дней, но ротации меняются каждые 2-4 дня ([DOMAIN-RESEARCH.md](../01-research/DOMAIN-RESEARCH.md), раздел 1.1)
- Сменные работники теряют **2-4 часа сна в день** по сравнению с дневными работниками ([MARKET-RESEARCH.md](../01-research/MARKET-RESEARCH.md), раздел 1.4)
- 26.5% сменных работников имеют клинический Shift Work Sleep Disorder ([Frontiers Meta-Analysis, 2021](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.638252/full))
- Существующие sleep-приложения (Sleep Cycle, RISE, Oura) **штрафуют за дневной сон** и предполагают фиксированный режим

### 1.2 Насколько она острая? (Frequency x Severity)

| Параметр | Значение |
|----------|----------|
| **Частота** | Каждый рабочий цикл (2-7 дней) — проблема возникает регулярно, а не разово |
| **Severity** | Высокая — влияет на здоровье (рак Group 2A по IARC), безопасность, семью, карьеру |
| **Масштаб** | 22M shift workers в US, 700M+ глобально |
| **Экономический ущерб** | $136.4B/год потери от усталости в US ([MARKET-RESEARCH.md](../01-research/MARKET-RESEARCH.md), раздел 1.5) |
| **Осознанность проблемы** | Высокая — люди знают, что спят плохо, но не знают, что делать |

**Оценка остроты: 9/10** — проблема хроническая, повторяющаяся, с серьёзными последствиями для здоровья и безопасности.

### 1.3 Как люди решают проблему сейчас?

| Текущее решение | Кто использует | Эффективность |
|----------------|----------------|---------------|
| Blackout-шторы + маска для сна | Почти все | Средняя — помогают заснуть, но не решают переход между режимами |
| Мелатонин (случайная доза, случайное время) | ~60% shift workers | Низкая — без привязки к расписанию эффект непредсказуем |
| Кофеин (метод проб и ошибок) | ~90% | Низкая — часто пьют слишком поздно, что мешает заснуть после смены |
| Sleep Cycle / Oura / RISE | ~15-20% | Низкая — штрафуют за дневной сон, не понимают ротации |
| «Просто терплю» | Все три персоны | Нулевая — основная «стратегия» |
| Prescription sleep aids | ~10% | Средняя, но с побочными эффектами и зависимостью |

*Источник: [USER-PERSONAS.md](../01-research/USER-PERSONAS.md), Common Patterns*

### 1.4 Почему текущие решения не работают?

1. **Sleep-трекеры работают «назад»** — фиксируют прошлый сон, а не планируют будущий. Сменному работнику нужен план на следующие 3 дня, а не отчёт о прошлой ночи
2. **Стандартные метрики не подходят** — «sleep score» предполагает 22:00-06:00 норму. Дневной сон = красная зона, что создаёт чувство вины вместо помощи
3. **Нет transition planning** — ни одно приложение не говорит «вот твой план перехода с ночей на дни за 3 дня» ([COMPETITORS.md](../01-research/COMPETITORS.md), раздел 6)
4. **Мелатонин без науки** — люди принимают случайные дозы в случайное время. Timing важнее дозы ([DOMAIN-RESEARCH.md](../01-research/DOMAIN-RESEARCH.md), раздел 1.3), но никто не рассчитывает оптимальное время на основе расписания
5. **Wearable requirement** — Oura ($299+подписка), Ultrahuman ($349) — дорого и необязательно для планирования

---

## 2. Наше решение

### 2.1 Ключевое обещание

**ShiftRest превращает хаотичное расписание сменного работника в персонализированный план: когда спать, когда принять мелатонин, когда прекратить кофеин и как безболезненно перейти между ночным и дневным режимом.**

### 2.2 Value Proposition

> **Для** медсестёр и сменных работников с ротационным расписанием,
> **у которых** нет инструмента для планирования сна при переходе между ночными и дневными сменами,
> **ShiftRest** — это приложение-планировщик сна,
> **которое позволяет** получить персонализированный план: оптимальное окно сна, время мелатонина, кофеиновый cutoff и пошаговый переход между режимами,
> **в отличие от** Sleep Cycle, RISE и Oura, которые штрафуют за дневной сон и предполагают фиксированный режим,
> **потому что** ShiftRest не трекает сон — он планирует его, опираясь на циркадную науку (AASM/CDC/NASA) и AI-персонализацию.

### 2.3 Три главных дифференциатора vs конкуренты

| # | Дифференциатор | Что это значит | Кто ближе всего | Почему мы лучше |
|---|---------------|---------------|-----------------|-----------------|
| 1 | **Transition Planning** | Пошаговый план перехода ночь→день и день→ночь с конкретными часами | Timeshifter (частично) | Timeshifter — баги при обновлении расписания, $120/год, тяжёлый онбординг. ShiftRest — чистый UX, $60/год, instant value |
| 2 | **Schedule-First подход** | Ввод расписания → автоматический план (не трекинг → отчёт) | OffShift | OffShift — только iOS, нет AI, нет transition planning. ShiftRest — кросс-платформа, AI-персонализация |
| 3 | **Non-Judgmental дизайн** | Никогда не штрафует за дневной сон. Празднует shift-appropriate сон | Никто | Все конкуренты используют стандартные метрики. ShiftRest — первый, кто проектирует метрики специально для shift workers |

*Источник: [COMPETITORS.md](../01-research/COMPETITORS.md), разделы 6, 8*

### 2.4 "Aha-moment"

**Момент:** Пользователь вводит своё расписание (3 ночные, 4 выходных) и видит план на неделю: конкретные часы сна для каждого дня, пошаговый переход с ночей на дни, время мелатонина привязанное к его расписанию, и кофеиновый cutoff для каждой смены.

**Реакция:** «Наконец-то кто-то понимает, что я работаю не с 9 до 5. И не ругает меня за то, что я сплю днём.»

**Когда это происходит:** В первые 2 минуты после ввода расписания — до paywall.

**Почему это работает:** Пользователь впервые видит план, сделанный *для его реального расписания*. Не общие советы «спите 8 часов», а «ложитесь в 08:30, примите мелатонин в 07:30, последний кофе до 02:00, на первый выходной — план перехода с 3 шагами».

---

## 3. Validation Checklist

### Проблема подтверждена данными

- [x] 26.5% shift workers с клиническим SWSD (мета-анализ, n=большой, 95% CI: 21.0-32.8%) — [Frontiers, 2021](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.638252/full)
- [x] 2-4 часа потери сна в день — [Sleep Foundation](https://www.sleepfoundation.org/shift-work-disorder)
- [x] $136.4B/год потерь от усталости — [CDC Foundation](https://www.cdcfoundation.org/pr/2015/worker-illness-and-injury-costs-us-employers-225-billion-annually)
- [x] #1 запрос в сообществах — transition planning — [MARKET-RESEARCH.md](../01-research/MARKET-RESEARCH.md), раздел 4.2
- [x] Все 3 персоны подтверждают единую боль: «Я знаю, что мой сон плохой. Мне нужно приложение, которое скажет, что делать» — [USER-PERSONAS.md](../01-research/USER-PERSONAS.md)

### Аудитория достаточно большая

- [x] TAM: $435M-$1.9B (shift work сегмент sleep app рынка к 2034) — [MARKET-RESEARCH.md](../01-research/MARKET-RESEARCH.md), раздел 8.1
- [x] SAM: $336M/год (англоязычные рынки, consumer + B2B) — [MARKET-RESEARCH.md](../01-research/MARKET-RESEARCH.md), раздел 8.2
- [x] SOM Year 3: $5-10M ARR — [MARKET-RESEARCH.md](../01-research/MARKET-RESEARCH.md), раздел 8.3
- [x] 22M shift workers в US, 700M+ глобально — [BLS](https://www.bls.gov/news.release/flex2.nr0.htm)

### Конкурентов можно обойти

- [x] Market Saturation Score: 2/10 — практически пустой рынок — [COMPETITORS.md](../01-research/COMPETITORS.md), раздел 7
- [x] Лидер (Timeshifter) — 3.5 звезды, баги, $120/год — [COMPETITORS.md](../01-research/COMPETITORS.md), раздел 1.1
- [x] Верхний правый квадрант Positioning Map (shift-specific + consumer scale) **пуст** — [COMPETITORS.md](../01-research/COMPETITORS.md), раздел 5
- [x] <10 shift-specific приложений в App Store, ни одно с >1000 отзывов — [COMPETITORS.md](../01-research/COMPETITORS.md), раздел 7
- [x] Новые entrants (OffShift, Riseo) подтверждают спрос, но не закрепились — [COMPETITORS.md](../01-research/COMPETITORS.md), раздел 9

### Техническая реализация возможна

- [x] Циркадная наука доступна: Melatonin PRC, Two-process model, Delphi Consensus (2023) — [DOMAIN-RESEARCH.md](../01-research/DOMAIN-RESEARCH.md), раздел 1
- [x] OpenAI API: $0.01-0.05/запрос для персонализации — [MARKET-RESEARCH.md](../01-research/MARKET-RESEARCH.md), раздел 9.1
- [x] Expo SDK 55 + React Native: кросс-платформа одним разработчиком за 4-6 месяцев — [CLAUDE.md](../../CLAUDE.md)
- [x] FDA wellness classification (Jan 2026): sleep management = wellness, не medical device — [DOMAIN-RESEARCH.md](../01-research/DOMAIN-RESEARCH.md), раздел 3.1
- [x] SleepSync (Monash) доказал эффективность подхода: +29 мин сна, 70% легче засыпают — [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10064476/)

---

## 4. Матрица Problem-Solution Fit

| Проблема пользователя | Решение ShiftRest | Научная основа | Конкуренты |
|----------------------|-------------------|----------------|------------|
| Не знаю, когда спать при ротации | Optimal sleep window на основе расписания | Two-process model (Borbély) | Timeshifter (частично, с багами) |
| Переход ночь→день — хаос | Пошаговый Transition Plan на 2-3 дня | AASM circadian adaptation + Melatonin PRC | **Никто** |
| Мелатонин наугад | Точное время приёма привязано к расписанию | Melatonin Phase Response Curve | Timeshifter (общие рекомендации) |
| Кофеин мешает заснуть | Caffeine cutoff timer до каждого сна | Half-life 5-6ч + AASM guidelines | **Никто** (shift-specific) |
| Sleep apps штрафуют за дневной сон | Non-judgmental scoring | Shift-appropriate метрики | **Никто** |
| Приложения не знают моё расписание | Шаблоны ротаций: 3x12, 24/48, continental | Profession-specific templates | OffShift (iOS only, базовые) |

---

## Источники

Все данные и выводы основаны на исследованиях Stage 1 (Research):
- [MARKET-RESEARCH.md](../01-research/MARKET-RESEARCH.md) — размер рынка, TAM/SAM/SOM, Reddit, монетизация
- [COMPETITORS.md](../01-research/COMPETITORS.md) — 12 конкурентов, positioning map, gap analysis
- [USER-PERSONAS.md](../01-research/USER-PERSONAS.md) — 3 персоны, реальные цитаты, common patterns
- [DOMAIN-RESEARCH.md](../01-research/DOMAIN-RESEARCH.md) — циркадная наука, регуляторика, алгоритмы
- [RESEARCH-BRIEF.md](../01-research/RESEARCH-BRIEF.md) — синтез и вердикт GO (8.6/10)
