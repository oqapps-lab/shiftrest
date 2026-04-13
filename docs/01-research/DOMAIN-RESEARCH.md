# Исследование предметной области — Sleep Science для ShiftRest
**Дата: 13 апреля 2026**

---

## 1. Ключевые концепции

### 1.1 Циркадные ритмы
**Что это:** Внутренние биологические часы (~24.2ч цикл), управляемые супрахиазматическим ядром (SCN) в гипоталамусе. SCN синхронизируется с внешними сигналами — прежде всего светом.

**Почему важно для ShiftRest:**
- Сменные работники принуждают организм бодрствовать, когда SCN «хочет» спать, и наоборот
- Полная адаптация циркадного ритма к ночной смене занимает **7–14 дней** — но большинство ротаций меняются каждые 2–4 дня
- **Вывод:** Большинство сменных работников никогда полностью не адаптируются. Задача ShiftRest — минимизировать рассинхронизацию

**Нобелевская премия 2017:** Jeffrey Hall, Michael Rosbash, Michael Young — за открытие молекулярных механизмов циркадных ритмов. Это легитимизировало циркадную медицину как мейнстрим.

**Источники:** [PMC: Circadian Rhythm Sleep Disorders](https://pmc.ncbi.nlm.nih.gov/articles/PMC2082105/), [Nobel Prize 2017](https://www.nobelprize.org/prizes/medicine/2017/summary/)

### 1.2 Shift Work Sleep Disorder (SWSD)
**Определение (ICSD-3):** Расстройство циркадного ритма, характеризующееся инсомнией и/или чрезмерной сонливостью у людей, чьи рабочие часы перекрываются с типичным временем сна.

**Ключевые цифры:**
| Показатель | Значение | Источник |
|-----------|----------|---------|
| Распространённость среди сменных работников | 26.5% (95% CI: 21.0–32.8%) | [Frontiers Meta-Analysis, 2021](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.638252/full) |
| Диапазон оценок | 10–40% | [Cleveland Clinic](https://my.clevelandclinic.org/health/diseases/12146-shift-work-sleep-disorder) |
| Среднее сокращение сна | 2–4 часа/день | [Sleep Foundation](https://www.sleepfoundation.org/shift-work-disorder) |
| Риск сердечно-сосудистых заболеваний | +40% | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6859247/) |
| Рак (классификация IARC/WHO) | Группа 2A — «вероятно канцерогенно» | [WHO/IARC](https://monographs.iarc.who.int/wp-content/uploads/2018/06/mono98.pdf) |

**Критерии диагностики:**
1. Инсомния и/или чрезмерная сонливость, связанная с рабочим расписанием
2. Симптомы присутствуют ≥3 месяцев
3. Сон нарушен по данным дневника/актиграфии ≥14 дней
4. Не объясняется другим расстройством сна

**Важно для ShiftRest:** Мы **НЕ диагностируем** SWSD. Мы помогаем управлять расписанием сна — это wellness, не медицина.

### 1.3 Мелатонин
**Что это:** Гормон, вырабатываемый эпифизом в темноте. Сигнал организму: «пора спать».

**Ключевые факты для ShiftRest:**

| Параметр | Рекомендация | Источник |
|----------|-------------|---------|
| Оптимальная доза | 0.5–3 мг (низкая доза эффективнее высокой) | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3558560/) |
| Для phase advance (раннее засыпание) | Принять за 10–11ч до mid-sleep | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3696986/) |
| Для phase delay (позднее засыпание) | Принять утром после пробуждения | [AASM](https://aasm.org/resources/practiceparameters/pp_circadianrhythm.pdf) |
| Форма | Fast-release (не slow-release для phase shifting) | [Timeshifter](https://www.timeshifter.com/shift-work-disorder/melatonin-for-shift-work-type-dose-timing) |
| Timing vs Dose | Время приёма важнее дозы | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4344919/) |

**Что может ShiftRest:** Рассчитать оптимальное время приёма мелатонина на основе расписания смен и желаемого времени сна. Это **информация, не назначение** — аналог «когда лучше принять мелатонин, если ваша смена начинается в 19:00».

### 1.4 Кофеин
**Механизм:** Блокирует аденозиновые рецепторы, подавляя сонливость.

| Параметр | Значение | Источник |
|----------|----------|---------|
| Период полувыведения | 5–6 часов (варьируется: 3–9ч) | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC2082105/) |
| Рекомендация AASM | Избегать во второй половине смены | [AASM](https://aasm.org/wp-content/uploads/2022/07/ProviderFS-ShiftWork.pdf) |
| Cutoff перед сном | ≥6 часов до планируемого сна | [Delphi Consensus](https://pmc.ncbi.nlm.nih.gov/articles/PMC10710992/) |
| Влияние на сон | Даже через 6ч снижает общее время сна на ~1ч | [Sleep Foundation](https://www.sleepfoundation.org/) |

**Что может ShiftRest:** Рассчитать «caffeine cutoff time» на основе окончания смены и планируемого времени сна.

### 1.5 Свет и циркадная адаптация
**Свет — самый мощный zeitgeber (синхронизатор) циркадных ритмов.**

**Рекомендации CDC/NIOSH:**
- **Первая половина ночной смены:** Яркий свет → повышает бодрость
- **Вторая половина ночной смены:** Снижение освещения → готовит к сну
- **Дорога домой после ночной смены:** Тёмные очки (солнцезащитные) → предотвращает циркадный reset
- **Комбинация:** Яркий свет ночью + тёмные очки утром + мелатонин = максимальная адаптация

**Источники:** [CDC/NIOSH Module 9](https://www.cdc.gov/niosh/work-hour-training-for-nurses/longhours/mod9/03.html), [CDC: Bright Light + Melatonin](https://stacks.cdc.gov/view/cdc/190211)

### 1.6 Стратегический napping
**NASA Nap Study:** 26-минутный «power nap» улучшил производительность на **34%** и бдительность на **54%** у пилотов и астронавтов.

| Тип | Длительность | Эффект | Когда |
|-----|-------------|--------|-------|
| Power nap | 15–20 мин | Boost бдительности без инерции | Во время перерыва на смене |
| Full cycle nap | 90 мин | Восстановление sleep debt | Перед ночной сменой |
| Recovery nap | 90–180 мин | Компенсация потерь | После смены, если основной сон невозможен сразу |

**Sleep inertia (инерция сна):** 15–30 мин (до 2ч) после пробуждения — сниженная производительность. Важно учитывать для рекомендаций «когда просыпаться перед сменой».

**Источники:** [NASA Technical Report](https://ntrs.nasa.gov/citations/19950006379), [Delphi Consensus](https://pmc.ncbi.nlm.nih.gov/articles/PMC10710992/)

### 1.7 Хронотип
**Что это:** Индивидуальная предрасположенность к «жаворонку» или «сове».

**Влияние на shift work:**
- **Совы** лучше переносят ночные смены
- **Жаворонки** лучше переносят утренние смены (но хуже — ночные)
- Хронотип влияет на оптимальное время приёма мелатонина и light exposure

**Что может ShiftRest:** Определить хронотип через короткий опросник (MEQ — Morningness-Eveningness Questionnaire) и персонализировать рекомендации.

### 1.8 Направление ротации
- **По часовой стрелке** (день → вечер → ночь): легче для адаптации (проще задерживать ритм, чем ускорять)
- **Против часовой стрелки** (ночь → вечер → день): тяжелее
- **Быстрая ротация** (2–3 дня): организм не успевает адаптироваться → минимизация десинхронизации важнее полной адаптации

**Источник:** [AASM Review](https://aasm.org/wp-content/uploads/2017/07/Review_CircadianRhythm.pdf)

---

## 2. Экспертные источники

### 2.1 Ведущие исследователи

| Имя | Институт | Область | Релевантность |
|-----|---------|---------|--------------|
| Dr. Steven Lockley | Harvard/Brigham & Women's | Циркадные ритмы и shift work | Co-founder Timeshifter; главный авторитет |
| Dr. Charles Czeisler | Harvard | Sleep medicine, circadian disruption | «отец» современной sleep medicine |
| Dr. Shantha Rajaratnam | Monash University | Shift work, fatigue management | Создатель SleepSync |
| Dr. Olivia Walch | Arcascope | Математическое моделирование circadian rhythms | Цифровой двойник ритмов |
| Dr. Jeanne Duffy | Harvard/Brigham & Women's | Circadian rhythm adaptation | Исследования light therapy |

### 2.2 Ключевые организации

| Организация | Роль | Ресурсы |
|------------|------|---------|
| **AASM** (American Academy of Sleep Medicine) | Клинические гайдлайны | [Practice Parameters](https://aasm.org/resources/practiceparameters/pp_circadianrhythm.pdf) |
| **CDC/NIOSH** | Рекомендации для работодателей и работников | [Work Hour Training for Nurses](https://www.cdc.gov/niosh/work-hour-training-for-nurses/) |
| **Sleep Foundation** | Evidence-based образование | [Shift Work Disorder](https://www.sleepfoundation.org/shift-work-disorder) |
| **IARC/WHO** | Классификация рисков | Shift work = Group 2A carcinogen |
| **Monash University Turner Institute** | Исследования shift work sleep | [SleepSync clinical trials](https://pmc.ncbi.nlm.nih.gov/articles/PMC10064476/) |

### 2.3 Ключевые исследования

| Исследование | Год | Находка | Ссылка |
|-------------|-----|---------|--------|
| SWSD Prevalence Meta-Analysis | 2021 | 26.5% shift workers с SWSD | [Frontiers](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.638252/full) |
| SleepSync RCT | 2023 | +29 мин сна, 70% легче засыпают | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10064476/) |
| Delphi Sleep Hygiene for Shift Workers | 2023 | 55 экспертов, consensus guidelines | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10710992/) |
| Melatonin Phase Shift | 2013 | Timing важнее dose; 0.5–3 мг оптимально | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3696986/) |
| NASA Nap Study | 1995 | 26-мин nap = +34% производительность | [NASA](https://ntrs.nasa.gov/citations/19950006379) |

---

## 3. Регуляторика

### 3.1 FDA (США) — Январь 2026 обновление

**Ключевое изменение:** FDA обновила guidance по General Wellness Products и Clinical Decision Support Software (6 января 2026), расширив перечень продуктов, не требующих FDA-регулирования.

**ShiftRest = General Wellness Product, если:**
| Критерий | Статус ShiftRest |
|---------|-----------------|
| Не инвазивное | ✅ Приложение, не устройство |
| Не имплантируемое | ✅ |
| Не представляет риска для безопасности | ✅ |
| Заявления о wellness, не о болезнях | ✅ «Улучшает качество сна» ≠ «лечит инсомнию» |
| Не делает медицинских диагнозов | ✅ Не диагностирует SWSD |

**Что МОЖНО заявлять:**
- «Помогает улучшить качество сна» ✅
- «Оптимизирует расписание сна для сменных работников» ✅
- «Рекомендует время для приёма мелатонина» ✅ (информация, не назначение)
- «Помогает управлять кофеином и световым воздействием» ✅
- «Sleep management» ✅ (прямо указано как wellness category)

**Что НЕЛЬЗЯ заявлять:**
- «Диагностирует Shift Work Sleep Disorder» ❌
- «Лечит инсомнию» ❌
- «Заменяет консультацию с врачом» ❌
- «Медицински одобрено» ❌ (если нет одобрения)

**Пример FDA-регуляции в sleep:** Sleepio получил FDA clearance (August 2024) как digital therapeutic для инсомнии — потому что заявляет лечебный эффект. ShiftRest не делает таких заявлений → не нужно одобрение.

**Источники:** [FDA Guidance Update Jan 2026](https://hooperlundy.com/fdas-new-digital-health-guidance-signal-shift-for-wellness-devices-and-cds/), [AHA News](https://www.aha.org/news/headline/2026-01-06-fda-issues-guidance-wellness-products-clinical-decision-support-software), [Latham & Watkins Analysis](https://www.lw.com/en/insights/fda-issues-updated-guidance-loosening-regulatory-approach-to-certain-digital-health-tools)

### 3.2 FTC (США) — Рекламные заявления

**FTC Health Products Compliance Guidance:**
- Все health claims должны быть «truthful, not misleading, and substantiated»
- Требуется «competent and reliable scientific evidence» для любого утверждения о здоровье
- **Для ShiftRest:** Ссылаемся на опубликованные исследования (AASM, PMC, CDC) для каждой рекомендации

**Рекомендации:**
- Каждая фича с health claim → ссылка на исследование
- Disclaimer: «Не является медицинским советом. Проконсультируйтесь с врачом.»
- Не использовать слова: «лечит», «диагностирует», «предотвращает заболевания»

### 3.3 App Store Guidelines

**Apple:**
- **Category 27.1:** Apps providing health info must cite reputable sources
- **Category 27.4:** Apps referring to health data must include a privacy policy
- **HealthKit:** Данные HealthKit нельзя использовать для рекламы или продажи третьим лицам

**Google Play:**
- **Health Apps Policy (2024+):** Требуется раскрытие, является ли приложение медицинским устройством
- **Data Safety:** Полная прозрачность по сбору и использованию health data

### 3.4 GDPR / Privacy

| Требование | Как выполнить |
|-----------|--------------|
| Health data = Special Category (Art. 9) | Явное согласие пользователя на обработку |
| Право на удаление (Art. 17) | Функция «Delete my data» в настройках |
| Минимизация данных (Art. 5) | Собирать только то, что нужно для рекомендаций |
| Data portability (Art. 20) | Экспорт данных пользователя |
| Supabase хранение | Выбрать EU-регион для EU-пользователей |

### 3.5 HIPAA (США)
**ShiftRest НЕ подпадает под HIPAA**, если:
- Не интегрируется с provider/payer systems
- Не получает PHI (Protected Health Information) от healthcare providers
- Пользователь сам вводит свои данные (= consumer health data, не PHI)

**Исключение:** Если будет B2B для больниц с интеграцией в HR/EHR системы — может потребоваться BAA (Business Associate Agreement).

---

## 4. Контент-стратегия — Как строить доверие

### 4.1 Научная обоснованность
**Принцип:** Каждая рекомендация в приложении должна быть подкреплена исследованием.

| Рекомендация | Научная основа |
|-------------|---------------|
| «Примите мелатонин в 14:00» | Melatonin phase response curve + расписание смены |
| «Не пейте кофе после 01:00» | Caffeine half-life (5–6ч) + время окончания смены |
| «Наденьте тёмные очки по дороге домой» | CDC/NIOSH light avoidance guidelines |
| «Вздремните 20 мин в 15:00» | NASA nap study + pre-shift napping research |
| «Ваш переход с ночи на день: план на 3 дня» | AASM circadian adaptation + chronotype |

### 4.2 Тон коммуникации
- **Не пугать** — не «shift work вызывает рак» (хотя это правда)
- **Эмпатия** — «мы знаем, что ваш сон отличается, и это нормально»
- **Non-judgmental** — никаких red scores, никаких «вы спали плохо»
- **Actionable** — не «спите больше», а «засыпайте в 08:30, поставьте будильник на 15:30»
- **Профессионально** — ссылки на источники доступны в приложении

### 4.3 Построение доверия

| Стратегия | Как реализовать |
|----------|----------------|
| **«Backed by science»** | Раздел «Наука» в приложении с ссылками на исследования |
| **Профессиональные endorsements** | Цитаты от sleep medicine докторов в marketing |
| **Community validation** | Отзывы от реальных медсестёр/пожарных |
| **Transparency** | Объяснять «почему» для каждой рекомендации |
| **Disclaimers** | «Не заменяет медицинскую консультацию» — видно, но не навязчиво |

### 4.4 Контент-маркетинг
- **r/nursing, r/nightshift, r/ems** — ответы на вопросы, не реклама
- **TikTok/Reels** — короткие видео «Когда пить кофе, если твоя смена в 19:00?»
- **Партнёрство с nursing influencers** — Nurse Blake (3.5M followers), Nurse Mendoza
- **Guest posts** на AllNurses.com, EMS1.com, FireRescue1.com

---

## 5. Ограничения и риски

### 5.1 Технические ограничения

| Ограничение | Описание | Митигация |
|------------|----------|-----------|
| **Нет объективных данных сна** | Без wearable мы не знаем, когда пользователь реально спал | Опционально: HealthKit/Google Health Connect интеграция |
| **Циркадный ритм — модель, не измерение** | Мы моделируем ритм на основе расписания, не измеряем CBT или мелатонин | Прозрачно сообщать: «это рекомендация на основе вашего расписания» |
| **Индивидуальная вариабельность** | Caffeine half-life: 3–9ч; хронотип меняет всё; генетика | Хронотип-опросник + обратная связь от пользователя → адаптация |
| **AI-галлюцинации** | OpenAI может генерировать неверные рекомендации | Structured prompts + validation layer + fallback на rule-based |

### 5.2 Юридические риски

| Риск | Вероятность | Последствия | Митигация |
|------|------------|-------------|-----------|
| FDA рассмотрит как medical device | Низкая | Необходимость 510(k) clearance | Строго wellness claims, disclaimers |
| FTC обвинит в ложных claims | Низкая | Штраф, требование убрать claim | Все claims подкреплены исследованиями |
| Судебный иск от пользователя | Средняя | Репутационный ущерб, costs | TOS + disclaimers + не давать советов по prescription medications |
| GDPR нарушение | Низкая | Штраф до 4% revenue | Privacy by design, DPO, EU data hosting |

### 5.3 Медицинские ограничения

**Что ShiftRest НЕ может и НЕ должен делать:**
1. ❌ Диагностировать SWSD или любое другое расстройство сна
2. ❌ Рекомендовать prescription medications (modafinil, зопиклон, etc.)
3. ❌ Заменять врача-сомнолога
4. ❌ Обещать конкретные клинические результаты («вы будете спать на 29 минут дольше»)
5. ❌ Давать рекомендации людям с comorbidities (апноэ, ПТСР, депрессия) без оговорок

**Что ShiftRest МОЖЕТ делать:**
1. ✅ Рассчитывать оптимальное окно сна на основе расписания
2. ✅ Информировать о времени приёма OTC-мелатонина (не назначение, а информация)
3. ✅ Рекомендовать caffeine cutoff time
4. ✅ Давать советы по light exposure (солнцезащитные очки, яркий свет)
5. ✅ Создавать план перехода между сменами
6. ✅ Рекомендовать обратиться к врачу, если симптомы тяжёлые

### 5.4 Этические ограничения
- **Не эксплуатировать страх** — shift work действительно увеличивает риск рака, CVD, но использование этого для продаж — неэтично
- **Не обвинять пользователя** — «вы не спите достаточно» → «вот как оптимизировать ваш сон с учётом расписания»
- **Acknowledging limitations** — «мы не можем решить проблему shift work как системы, но можем помочь вам в рамках вашего расписания»

---

## 6. Алгоритмическая основа ShiftRest

### 6.1 Входные данные
1. **Расписание смен** (ввод вручную или import из календаря)
2. **Хронотип** (MEQ опросник при онбординге)
3. **Предпочтения по сну** (когда хочет просыпаться на выходных)
4. **Кофеин** (сколько и когда обычно пьёт)
5. **Мелатонин** (принимает ли, какую дозу)
6. **Семейные обязательства** (дети в школу, время с семьёй)

### 6.2 Что рассчитывает
1. **Optimal sleep window** — когда ложиться и вставать для каждого дня
2. **Melatonin timing** — когда принять для максимального эффекта
3. **Caffeine cutoff** — последний кофе/энергетик
4. **Light exposure plan** — когда носить тёмные очки, когда искать яркий свет
5. **Transition plan** — пошаговый план перехода ночь→день (или наоборот)
6. **Nap windows** — когда и сколько вздремнуть

### 6.3 Научная модель
Основана на:
- **Melatonin Phase Response Curve** (PRC) — когда мелатонин сдвигает ритм вперёд/назад
- **Light PRC** — когда свет сдвигает ритм
- **Two-process model of sleep** (Borbély) — Process S (sleep pressure) + Process C (circadian drive)
- **Персонализация через AI** (OpenAI) — адаптация общих правил к конкретному пользователю

---

## 7. Ключевые выводы для разработки

1. **Наука на нашей стороне** — все рекомендации подкреплены исследованиями уровня AASM/CDC
2. **FDA не проблема** — wellness app claims полностью легальны после January 2026 guidance
3. **Главное ограничение — индивидуальная вариабельность** — нужна обратная связь + адаптация
4. **Non-judgmental дизайн — не опция, а требование** — shift workers ненавидят red scores
5. **Disclaimers обязательны** — но можно сделать элегантно, не пугая пользователя
6. **AI-персонализация — конкурентное преимущество**, но нужен validation layer поверх OpenAI

---

## Источники

### Клинические гайдлайны
- [AASM Practice Parameters: Circadian Rhythm Sleep Disorders](https://aasm.org/resources/practiceparameters/pp_circadianrhythm.pdf)
- [AASM: Circadian Adaptation to Shift Work (Provider Fact Sheet)](https://aasm.org/wp-content/uploads/2022/07/ProviderFS-ShiftWork.pdf)
- [CDC/NIOSH: Work Hour Training for Nurses](https://www.cdc.gov/niosh/work-hour-training-for-nurses/)
- [Delphi Consensus: Sleep Hygiene for Shift Workers (2023)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10710992/)

### Исследования
- [Melatonin Phase Shifting (PMC, 2013)](https://pmc.ncbi.nlm.nih.gov/articles/PMC3696986/)
- [Bright Light + Melatonin Combination (PMC, 2015)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4344919/)
- [SWSD Prevalence Meta-Analysis (Frontiers, 2021)](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.638252/full)
- [SleepSync Clinical Trial (PMC, 2023)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10064476/)
- [Recovery from Shift Work (Frontiers, 2023)](https://www.frontiersin.org/journals/neurology/articles/10.3389/fneur.2023.1270043/full)

### Регуляторика
- [FDA General Wellness Guidance (Updated Jan 2026)](https://hooperlundy.com/fdas-new-digital-health-guidance-signal-shift-for-wellness-devices-and-cds/)
- [FDA Digital Health Pilot (Dec 2025)](https://www.morganlewis.com/blogs/asprescribed/2025/12/new-fda-digital-health-pilot-same-fda-enforcement-discretion)
- [IARC/WHO: Shift Work Carcinogenicity](https://monographs.iarc.who.int/wp-content/uploads/2018/06/mono98.pdf)
