# Research Brief — ShiftRest

**Обновлено: 26 апреля 2026** | Стадия: Research (Stage 3)

> Синтез всех исследований: [MARKET-RESEARCH.md](./MARKET-RESEARCH.md) · [COMPETITORS.md](./COMPETITORS.md) · [USER-PERSONAS.md](./USER-PERSONAS.md) · [DOMAIN-RESEARCH.md](./DOMAIN-RESEARCH.md)

---

## Elevator Pitch

ShiftRest — единственное приложение, которое превращает ротационное рабочее расписание медсестёр, пожарных и заводских рабочих в персональный план сна: когда ложиться, когда принять мелатонин, когда выпить последний кофе и как безболезненно переключиться с ночного режима на дневной — без штрафов за дневной сон.

---

## Скоринг по 7 критериям

| # | Критерий | Оценка | Комментарий | Источник |
|---|---|---|---|---|
| 1 | **Размер рынка** | 9/10 | 22M сменных работников США, 29M ЕС, 700M+ глобально. SAM $336M/год (consumer + B2B). TAM $435M–$1.9B к 2034 в shift work сегменте | [MARKET-RESEARCH §6](./MARKET-RESEARCH.md) |
| 2 | **Рост рынка** | 9/10 | Sleep apps CAGR 14.19% ($2.91B → $9.6B к 2034). Интерес к «circadian rhythm» +91% в 2025. «Sleep coach» +300% за 2024. B2B wellness $68.4B рынок | [MARKET-RESEARCH §2–3](./MARKET-RESEARCH.md) |
| 3 | **Конкуренция** (10 = пусто) | 9/10 | <10 shift-specific приложений. Лучший рейтинг в нише: Arcashift 4.4★ при 57 отзывах. Timeshifter 4.1★ iOS / 2.6★ Android. Позиционирование «высокая shift-специфичность + consumer scale» — квадрант пуст | [COMPETITORS §5, 7](./COMPETITORS.md) |
| 4 | **Ясность проблемы** | 10/10 | SWSD у 26.5–48% сменных работников. Потеря 2–4ч сна/день. $136.4B потерь от усталости/год в США. Три разные персоны — одна боль: «скажи что делать, а не насколько плохо» | [USER-PERSONAS](./USER-PERSONAS.md) · [MARKET-RESEARCH §1](./MARKET-RESEARCH.md) |
| 5 | **Монетизация** | 8/10 | Бенчмарки $30–70/год (OffShift $30, Zeitgeber $43, Timeshifter $70). 37% взрослых готовы платить за sleep coaching. WTP у shift workers выше среднего: ночная надбавка, B2B-канал через больницы/депо $3–8/employee/мес | [MARKET-RESEARCH §7](./MARKET-RESEARCH.md) |
| 6 | **Техническая сложность** (10 = просто) | 7/10 | Expo SDK 55 + React Native = кросс-платформа одним разработчиком. OpenAI API $0.01–0.05/запрос. Но: Melatonin PRC и Two-process model (Borbély) нетривиальны; нужен validation layer поверх AI; HealthKit интеграция — дополнительная сложность | [DOMAIN-RESEARCH §6](./DOMAIN-RESEARCH.md) |
| 7 | **Уникальность** | 8/10 | Schedule-first (не tracking-first) — уникально. Transition planning — killer feature, которой нет ни у одного конкурента. AI-персонализация в нише. Non-judgmental scoring. Cross-platform с Day 1 (конкуренты — iOS only) | [COMPETITORS §4, 8](./COMPETITORS.md) |
| | **ИТОГО** | **8.6/10** | | |

---

## Топ-5 инсайтов

### 1. Рынок пуст, окно 12–18 месяцев

Market Saturation Score: **2/10**. Лучший рейтинг в нише — Arcashift 4.4★ с 57 отзывами. Timeshifter — самый узнаваемый бренд — 4.1★ iOS и 2.6★ Android. Верхний правый квадрант позиционирования (shift-specific + consumer scale) не занят никем. OffShift (дек. 2025) и AfterShift (2026) сигнализируют: рынок привлекает игроков, но ни один не закрепился.

> Первый качественный продукт с 500+ отзывами станет точкой отсчёта для всей категории.

*→ [COMPETITORS §5, 7](./COMPETITORS.md) · [MARKET-RESEARCH §8](./MARKET-RESEARCH.md)*

---

### 2. «Planning, not tracking» — незанятая позиция

Все три персоны (Марина/медсестра, Алексей/пожарный, Даниил/заводской) говорят одно: *«Я знаю, что мой сон плохой. Мне нужно приложение, которое скажет, что делать.»* Существующие трекеры (Sleep Cycle, RISE, Oura) штрафуют за дневной сон и предполагают фиксированный режим. Ни один конкурент не занял позицию «планировщик» — только «трекер».

> Jobs-to-be-done Марины (Primary Persona): *Получить готовый план: когда спать, когда принять мелатонин, когда перестать пить кофе — под конкретную ротацию 3×12.*

*→ [USER-PERSONAS §JTBD, Primary Persona](./USER-PERSONAS.md) · [COMPETITORS §4](./COMPETITORS.md)*

---

### 3. Transition planning — killer feature без конкурентов

Переход с ночного режима на дневной — **#1 самый обсуждаемый вопрос** в r/nursing (700K+), r/nightshift, r/shiftwork. Ни один конкурент не делает этого хорошо: Timeshifter — частично, с багами и за $70/год; остальные — не делают вообще. Научная основа есть: Melatonin PRC + Light PRC + Two-process model.

> Если ShiftRest сделает одну вещь лучше всех — это transition planning.

*→ [COMPETITORS §6](./COMPETITORS.md) · [DOMAIN-RESEARCH §1.1, 1.3, 6](./DOMAIN-RESEARCH.md)*

---

### 4. Наука полностью легитимизирует продукт

Каждая рекомендация ShiftRest подкреплена публикациями уровня AASM/CDC/NASA/PMC: Melatonin PRC (время приёма важнее дозы), caffeine half-life 5–6ч (cutoff за 6ч до сна), NASA Nap Study (+34% производительность от 26-мин nap), Delphi Consensus 2023 (55 экспертов, sleep hygiene для shift workers). FDA guidance январь 2026 прямо классифицирует «sleep management» как wellness — одобрение не требуется.

*→ [DOMAIN-RESEARCH §1–3](./DOMAIN-RESEARCH.md)*

---

### 5. B2B — скрытый множитель, Год 2

Больницы теряют $136.4B/год на усталость сотрудников. Timeshifter и SleepSync уже продают B2B. Корпоративный wellness рынок $68.4B (+85% компаний с wellness-программами). После PMF на consumer-рынке ShiftRest открывает B2B-канал ($3–8/employee/мес) с enterprise-дашбордом и fatigue risk analytics. SOM Год 3: $5–10M ARR включает обе модели.

*→ [MARKET-RESEARCH §6–7](./MARKET-RESEARCH.md)*

---

## Риски

| # | Риск | Вер. | Влияние | Митигация |
|---|---|---|---|---|
| 1 | **Конкурент с финансированием** займёт нишу раньше (OffShift, Riseo или новый игрок получит seed-round) | Средняя | Критическое | MVP за 4–6 мес. Фокус на медсёстрах (tightest community). Не гнаться за полнотой — гнаться за скоростью первой ценности |
| 2 | **AI-галлюцинации** — OpenAI генерирует неправильный тайминг мелатонина или опасный совет | Средняя | Высокое (репутация + юр. риск) | Rule-based validation layer поверх OpenAI. Structured prompts в рамках AASM/CDC. Disclaimer на каждой рекомендации. Fallback на детерминистический алгоритм |
| 3 | **Retention** — скачивают, пробуют 3 дня, бросают (типичная проблема health apps) | Высокая | Высокое (низкий LTV, невозможность масштаба) | Schedule-first создаёт recurring value (новый план каждый блок смен). Push-уведомления привязаны к конкретной смене. Неделя 1 = план перехода = мгновенная ценность |
| 4 | **Холодный старт** — r/nursing не реагирует, сарафанное радио не запускается | Средняя | Высокое | Pre-launch: landing page + waitlist до разработки. 10–20 ручных интервью с медсёстрами. Nursing influencers (Nurse Blake 3.5M) при запуске |
| 5 | **Регуляторный риск** — FDA переклассифицирует при health claims | Низкая | Критическое (задержка 12–18 мес) | Строго wellness claims. Никаких слов «диагностирует», «лечит». FDA guidance 2026 явно защищает sleep management apps |

---

## Гипотезы для проверки

### До разработки

| # | Гипотеза | Метод | Критерий успеха |
|---|---|---|---|
| H1 | Медсёстры скачают приложение по рекомендации коллеги (сарафанное радио работает в нише) | Landing page + waitlist, пост в r/nursing без рекламы | >200 sign-ups за 2 недели |
| H2 | Transition plan (ночь→день) — ценнее для пользователей, чем caffeine/melatonin timing | Опрос «какую фичу хотите первой?» среди waitlist | >60% называют transition plan |
| H3 | $5.99/мес — приемлемая цена (не отталкивает, не обесценивает) | Ценовой тест на landing page (три варианта: $3.99, $5.99, $7.99) | Конверсия $5.99 ≥ 70% от конверсии $3.99 |

### Во время Beta

| # | Гипотеза | Метод | Критерий успеха |
|---|---|---|---|
| H4 | AI-план ощутимо лучше rule-based для нестандартных расписаний | A/B тест на beta-тестерах | Удовлетворённость AI-группы выше на 15%+ |
| H5 | Non-judgmental scoring увеличивает D7 retention | A/B тест (оценка vs отсутствие оценки) | D7 retention: non-judgmental > standard на 10+ п.п. |

---

## Рекомендации для MVP

### Делать (P0–P1)

| Фича | Приоритет | Почему |
|---|---|---|
| Ввод расписания (ручной + шаблоны 3×12, 24/48, continental) | P0 | Без расписания нет продукта |
| Генерация оптимального окна сна | P0 | Core value proposition |
| **Transition plan** (ночь→день и обратно) | P0 | Killer feature — единственный в нише |
| Caffeine cutoff timer | P1 | Высокий запрос, простая реализация |
| Melatonin timing | P1 | Высокий запрос, нужен PRC-алгоритм |
| AI-персонализация (OpenAI) с validation layer | P1 | Конкурентное преимущество |

### Не делать в MVP

| Что | Почему |
|---|---|
| Sleep tracking / history | Это трекер — противоречит позиционированию |
| Red scores за дневной сон | Убивает retention у целевой аудитории |
| Wearable requirement | Ограничивает аудиторию; wearable — опциональный бонус |
| B2B dashboard | Year 2, после PMF |
| Family coordination | Уникальный gap, но не MVP |
| Мультиязычность | Year 1 = только английский |

### Монетизация

| Tier | Цена | Содержание |
|---|---|---|
| **Free** | $0 | Ввод расписания + базовый sleep window (одна смена) |
| **Premium** | $5.99/мес · $49.99/год | Полный план + transitions + caffeine + melatonin + AI + история |
| **B2B** (Год 2) | $3–8/employee/мес | Enterprise dashboard + fatigue risk (анонимизированный) + compliance-документация |

**Ценовое позиционирование:** дешевле Timeshifter ($70/год) и Arcashift ($70/год), лучше OffShift ($30/год) по функциональности.

---

## Вердикт: **GO** ✅

### Обоснование

| Фактор | Данные |
|---|---|
| Размер рынка | 22M US + 29M EU; SAM $336M/год |
| Конкуренция | Лучший игрок в нише — 4.4★ при 57 отзывах |
| Подтверждённый спрос | 26.5–48% SWSD; #1 запрос без ответа в сообществах |
| Killer feature | Transition planning — нет ни у кого из 7 прямых конкурентов |
| Монетизация | Benchmarks $30–70/год; SOM Год 3 = $5–10M ARR |
| Технология | Expo + OpenAI — MVP за 4–6 месяцев одним разработчиком |
| Регуляторика | FDA guidance 2026 — wellness apps без одобрения |

**Итоговый скор: 8.6/10**

### Условия GO

1. **Landing page + waitlist** запущена до начала разработки (проверка H1, H3)
2. **MVP (P0 фичи)** в App Store + Google Play за 6 месяцев
3. **Primary persona — Марина** (медсестра 3×12): все решения проверяются на ней
4. **Transition planning** — первая и главная фича, не второстепенная
5. **Все health claims** подкреплены исследованиями + disclaimers всегда

---

## Источники

Все цифры и утверждения основаны на детальных исследованиях в:

| Файл | Содержание |
|---|---|
| [MARKET-RESEARCH.md](./MARKET-RESEARCH.md) | TAM/SAM/SOM, CAGR, Google Trends, Reddit, монетизация, temporal window, GO-вердикт |
| [COMPETITORS.md](./COMPETITORS.md) | 7 прямых + 3 косвенных конкурента, рейтинги, positioning map, gap analysis, saturation score 2/10 |
| [USER-PERSONAS.md](./USER-PERSONAS.md) | 3 персоны с JTBD, реальные цитаты Reddit/форумов, Primary Persona (Марина) |
| [DOMAIN-RESEARCH.md](./DOMAIN-RESEARCH.md) | Глоссарий 20 терминов, циркадная наука, регуляторика FDA/FTC/GDPR/HIPAA, алгоритмическая основа |

Первоисточники (PMC, AASM, CDC, FDA, BLS, App Store, Reddit) указаны в соответствующих документах.
