# Target Audience — ShiftRest
**Дата: 13 апреля 2026**

> Расширение персон из [USER-PERSONAS.md](../01-research/USER-PERSONAS.md). Дополнено веб-поиском и данными из [MARKET-RESEARCH.md](../01-research/MARKET-RESEARCH.md).

---

## Персона 1: Марина — Медсестра реанимации (PRIMARY)

### Демография

| Поле | Данные |
|------|--------|
| **Возраст** | 28-38 лет (медиана: 32) |
| **Доход** | $65,000-$95,000/год (с ночной надбавкой ~$5-15/ч) |
| **Профессия** | Registered Nurse (RN), ICU / ER / Med-Surg |
| **Семья** | Замужем/в отношениях, 1-2 ребёнка дошкольного/школьного возраста |
| **Локация** | Пригород крупного города, США |
| **Образование** | BSN (Bachelor of Science in Nursing) |
| **Расписание** | 3x12 ночных (19:00-07:00), затем 4 выходных; ротация каждые 4-6 недель |
| **Устройства** | iPhone (70%+ медсестёр), Apple Watch у ~30% |
| **Tech-savviness** | Средняя — использует приложения для работы (Epic, Cerner), привыкла к digital tools |

### Jobs-to-be-done

| # | Когда я... | Я хочу... | Чтобы... |
|---|-----------|-----------|----------|
| 1 | Заканчиваю блок из 3 ночных смен и перехожу на дневной режим | Получить пошаговый план перехода с конкретными часами | Не быть «зомби» на первый выходной и провести время с детьми |
| 2 | Готовлюсь ко сну после ночной смены (07:30 утра) | Знать точное время приёма мелатонина | Заснуть быстрее и спать дольше, а не ворочаться до 10:00 |
| 3 | На смене в 2 часа ночи тянусь за кофе | Знать, можно ли ещё пить кофе или уже поздно | Не жертвовать бодростью на смене, но и заснуть дома |
| 4 | Начинаю новый блок смен через 2 дня | Увидеть план сна на весь блок заранее | Подготовить организм и предупредить мужа о расписании |
| 5 | Вижу красный sleep score в Sleep Cycle после дневного сна | Получить оценку, которая учитывает, что я работаю ночь | Не чувствовать вину за то, что мой сон «неправильный» |

### Контекст использования

| Параметр | Описание |
|----------|----------|
| **Когда открывает** | Утром после ночной смены (07:30-08:00), перед началом блока смен (за 1-2 дня), на первый выходной |
| **Где** | Дома (в спальне перед сном), иногда на перерыве в больнице |
| **Устройство** | iPhone — всегда. Apple Watch — для уведомлений |
| **Сессия** | 1-2 минуты: посмотреть план → закрыть. Не хочет «сидеть в приложении» |
| **Частота** | Ежедневно во время рабочего блока, 2-3 раза в неделю на выходных |

### Триггеры скачивания

1. **Коллега скинула ссылку** в групповой чат медсестёр (WhatsApp/iMessage): «Попробуй это, мне помогло с переходами»
2. Увидела **рекомендацию в r/nursing** или AllNurses форуме
3. Прочитала пост в **TikTok/Instagram**: «Как медсестре нормально спать после ночных»
4. Поискала в App Store: **«night shift sleep schedule»** после очередной бессонной ночи на выходных
5. HR-отдел больницы разослал **wellness newsletter** с рекомендацией

### Триггеры удаления (через 3 дня)

1. **Долгий онбординг** — если настройка > 3 минут, бросит
2. **Общие советы** — «спите 8 часов» вместо конкретных часов для её расписания
3. **Paywall до ценности** — если не видит план до оплаты
4. **Штрафует за дневной сон** — красные метрики = мгновенное удаление
5. **Спам уведомлениями** — больше 2-3 в день = отключит → забудет → удалит
6. **Не понимает 3x12 ротацию** — если нужно вручную объяснять приложению, что такое ночная смена

### Конкуренция за внимание

| Конкурент | Тип | Как отнимает внимание |
|----------|-----|----------------------|
| Sleep Cycle | Приложение | Уже установлено, привычка (хотя бесполезно для shift work) |
| Apple Sleep (нативное) | OS feature | Встроено в iPhone, «достаточно хорошо» для базового alarm |
| WhatsApp/iMessage | Мессенджер | Советы коллег в чате > любое приложение |
| Reddit (r/nursing) | Форум | Бесплатные советы от людей в такой же ситуации |
| «Просто терплю» | Привычка | Инерция — главный конкурент. Работало (плохо) годами |
| Мелатонин из CVS | Продукт | Физическое решение дешевле ($10/мес) и не требует приложения |

### Цитаты

> *«It would be great to have a toggle to flag that you do shift work so that it doesn't require you to set a persistent bedtime... last night it flagged a quiet half hour as sleep during a night shift because it was within my 'bedtime' it required me to set.»*
> — Wysdom85, Apple Community ([источник](https://discussions.apple.com/thread/254655393))

> *«I just did this manually on paper, given my rotation schedule for the next month, and it was tedious to do by hand. I'm looking for something that I can plug my pre-defined work schedule into and have it spit out a sleeping schedule for me to follow.»*
> — пользователь Student Doctor Network ([источник](https://forums.studentdoctor.net/threads/app-or-website-to-optimize-sleep-schedule-for-shift-work.1266395/))

> *«I have tried everything after a night shift... I have realized that nothing works.»*
> — EMDOC17, Student Doctor Network ([источник](https://forums.studentdoctor.net/threads/switching-sleep-schedules-after-night-shift.1235922/))

> *«I'm so tired when I get home, but I can't fall asleep. I lay there for two hours feeling exhausted but wide awake.»*
> — James, ER nurse ([источник](https://www.quadrawellness.com/blog/cant-sleep-after-night-shift/))

> *«Well I give up, as a shift worker this is horrible as a full body metric tracking device... For shift workers this design is just horrible... please can we just get an option to turn off the sleep schedule.»*
> — Gyrolion, Garmin Forum, о невозможности использовать smartwatch sleep tracking при сменной работе ([источник](https://forums.garmin.com/outdoor-recreation/outdoor-recreation/f/fenix-8-series/388118/sleep-tracking-as-shift-worker-is-an-horrible-experience))

---

## Персона 2: Алексей — Пожарный-спасатель

### Демография

| Поле | Данные |
|------|--------|
| **Возраст** | 30-45 лет (медиана: 38) |
| **Доход** | $55,000-$90,000/год (зависит от региона и стажа) |
| **Профессия** | Firefighter / Paramedic / EMT |
| **Семья** | Женат, 1-2 ребёнка школьного возраста |
| **Локация** | Город/пригород, США |
| **Образование** | Fire Academy + EMT/Paramedic certification |
| **Расписание** | 24/48 (24ч на дежурстве, 48ч выходных) или 48/96 |
| **Устройства** | Android (Samsung — 60%), iPhone (40%). Oura Ring / Garmin у ~20% |
| **Tech-savviness** | Средняя-низкая — практичный подход, не хочет разбираться |

### Jobs-to-be-done

| # | Когда я... | Я хочу... | Чтобы... |
|---|-----------|-----------|----------|
| 1 | Приехал домой в 8 утра после 24-часовой смены с 4 вызовами ночью | Знать: лечь сразу или подождать до ночи | Максимально восстановиться за 48 часов до следующей смены |
| 2 | Лежу на станции между вызовами и не могу заснуть | Знать, сколько минут вздремнуть, чтобы помочь, а не навредить | Быть функциональным на следующем вызове без sleep inertia |
| 3 | Вижу Oura readiness score 35/100 третий день подряд | Получить оценку, которая учитывает специфику 24-часовых смен | Не деморализоваться от цифр, а понимать, что я делаю всё правильно в рамках своего графика |
| 4 | На второй выходной, наконец чувствую себя нормально, но завтра опять на смену | Получить план «подготовки» к следующей 24-часовой смене | Прийти на станцию в лучшей форме и выдержать ночь |

### Контекст использования

| Параметр | Описание |
|----------|----------|
| **Когда открывает** | Сразу после смены (08:00), на станции перед сном (~22:00), на второй выходной (планирование) |
| **Где** | Дома (после смены), на станции (между вызовами) |
| **Устройство** | Смартфон. Предпочтительно — большие кнопки, минимум текста (устал, не хочет читать) |
| **Сессия** | < 1 минуты: глянул план → закрыл. Максимально простой интерфейс |
| **Частота** | День до смены + день после = 2-3 раза в неделю |

### Триггеры скачивания

1. **Начальник депо** упомянул на утренней перекличке: «Попробуйте это для recovery»
2. **Коллега показал на станции** во время тихого часа
3. Прочитал статью на **EMS1.com** или **FireRescue1.com** о sleep management
4. Увидел в **r/Firefighting** или **r/ems**

### Триггеры удаления (через 3 дня)

1. **Не понимает 24/48 расписание** — если приложение не имеет шаблона для 24-часовых смен
2. **Слишком много настроек** — пожарному нужен ответ за 30 секунд
3. **Red scores** — demoralize, не мотивируют
4. **Нет плана recovery** после тяжёлой смены (много вызовов ночью)
5. **Требует wearable** — не у всех есть Oura/Garmin

### Конкуренция за внимание

| Конкурент | Тип | Как отнимает внимание |
|----------|-----|----------------------|
| Oura Ring app | Wearable | Уже используют для sleep tracking (хотя бесполезно для 24ч) |
| Garmin Connect | Wearable | Body Battery вместо sleep score |
| «Спать, когда получается» | Привычка | 20+ лет стаж — привычка сильнее приложения |
| Caffeine / Energy drinks | Продукт | Проще выпить Red Bull, чем планировать сон |

### Цитаты

> *«I don't think you ever get used to it... my body clock is pretty screwed so I just do whatever I need to get through.»*
> — пользователь PistonHeads ([источник](https://www.pistonheads.com/gassing/topic.asp?h=0&f=211&t=1486394))

> *«In the last 2 years, 3 of my colleagues in their early 50s have died of sudden heart failure.»*
> — пользователь PistonHeads, о долгосрочных последствиях сменной работы ([источник](https://www.pistonheads.com/gassing/topic.asp?h=0&f=211&t=1486394))

> *«I worked 12 hour shifts 6 pm to 6 am! What a mess. By the time I got home it was 7 am, then I needed about a 1/2 hour to wind down.»*
> — officialcadet637, Reddit ([источник](https://www.buzzfeed.com/victoriavouloumanos/night-shift-workers-share-what-people-dont-understand-reddit))

---

## Персона 3: Даниил — Оператор конвейера

### Демография

| Поле | Данные |
|------|--------|
| **Возраст** | 22-32 года (медиана: 26) |
| **Доход** | $38,000-$58,000/год (с ночной надбавкой) |
| **Профессия** | Machine operator / Assembly line worker / Warehouse worker |
| **Семья** | Не женат, живёт с девушкой/партнёром или один |
| **Локация** | Промышленный город, Средний Запад / Юг США |
| **Образование** | High school diploma / Trade school |
| **Расписание** | Continental (2 дня 06:00-18:00, 2 ночи 18:00-06:00, 4 выходных) или DuPont |
| **Устройства** | iPhone 13 / Samsung Galaxy A-series (бюджетный сегмент), без wearable |
| **Tech-savviness** | Средняя — активный пользователь TikTok, Instagram, YouTube |

### Jobs-to-be-done

| # | Когда я... | Я хочу... | Чтобы... |
|---|-----------|-----------|----------|
| 1 | Через 2 дня перехожу с дневных смен на ночные | Получить план перестройки режима за 2 дня | Не быть полумёртвым на первой ночной смене |
| 2 | На 4 выходных и хочу жить «нормально» (гулять с друзьями, спать ночью) | Знать, как перестроиться на дневной режим и обратно | Не пропускать social life и не чувствовать себя усталым |
| 3 | Принимаю мелатонин случайным образом (1-10 мг) | Знать правильную дозу и время | Тратить деньги на мелатонин с результатом, а не наугад |
| 4 | Пью 3-й Red Bull за ночную смену в 4 утра | Понять, когда последний энергетик не помешает заснуть дома | Не валяться без сна до 10 утра, когда нужно спать |
| 5 | Набрал 8 кг за год и чувствую себя разбитым | Понять, связано ли это с режимом сна, и что изменить | Взять здоровье под контроль, начав с нормального сна |

### Контекст использования

| Параметр | Описание |
|----------|----------|
| **Когда открывает** | Перед блоком ночных смен (планирование), дома после ночной (07:00), на выходных (перестройка) |
| **Где** | Дома (кровать), иногда на перерыве в раздевалке |
| **Устройство** | Смартфон — единственное устройство |
| **Сессия** | 1-3 минуты. Готов потратить больше времени, чем пожарный, т.к. проблема новая и хочет разобраться |
| **Частота** | Каждый переход между типами смен (каждые 2-4 дня) |

### Триггеры скачивания

1. **TikTok / Instagram Reel**: «Почему после ночных смен ты всегда уставший — и что с этим делать»
2. **Поиск в App Store**: «shift work sleep» после очередной бессонной ночи
3. **Google**: «continental shift sleep schedule» или «SWSD symptoms»
4. **Reddit (r/nightshift)**: увидел пост с рекомендацией
5. **Коллега на заводе** показал приложение в раздевалке

### Триггеры удаления (через 3 дня)

1. **Цена** — $5.99/мес кажется дорогой. Нужен убедительный бесплатный trial
2. **Слишком «медицинское»** — если выглядит как clinical tool, а не friendly app
3. **Нет результата за 7 дней** — если не почувствовал разницу за один цикл смен
4. **Сложный интерфейс** — если непонятно, что делать при первом открытии
5. **Не знает continental shift** — если нет шаблона для 2/2/4

### Конкуренция за внимание

| Конкурент | Тип | Как отнимает внимание |
|----------|-----|----------------------|
| TikTok | Приложение | Скроллит вместо того, чтобы следовать плану сна |
| Energy drinks (Red Bull, Monster) | Продукт | Привычная «стратегия» бодрости, $30+/мес |
| Мелатонин из Walmart | Продукт | Дёшево ($8), не требует приложения |
| «Просто терплю» | Привычка | «Все на заводе так живут, зачем мне приложение» |
| YouTube sleep videos | Контент | Бесплатные «советы для ночных смен» — общие, но бесплатные |

### Цитаты

> *«I just want to sleep all the time. I can't concentrate on doing much at all... feeling tired almost constantly sucks.»*
> — пользователь PistonHeads ([источник](https://www.pistonheads.com/gassing/topic.asp?h=0&f=211&t=1486394))

> *«Shifts made me constantly tired, apathetic and prone to infections.»*
> — пользователь PistonHeads ([источник](https://www.pistonheads.com/gassing/topic.asp?h=0&f=211&t=1486394))

> *«My boyfriend works shifts, but they rotate - one week he works 6-2, the next could be 9-5, another week he works 11-6, etc. Because there's no consistency, his sleep schedule is completely fucked.»*
> — bmoney, Reddit ([источник](https://www.buzzfeed.com/victoriavouloumanos/night-shift-workers-share-what-people-dont-understand-reddit))

> *«I'm a rampant insomniac and only sleep for 3hrs max after nights... Tiredness is just something I live with.»*
> — Elroy Blue, PistonHeads ([источник](https://www.pistonheads.com/gassing/topic.asp?h=0&f=211&t=1486394))

---

## Сравнительная таблица персон

| Параметр | Марина (Медсестра) | Алексей (Пожарный) | Даниил (Оператор) |
|----------|-------------------|-------------------|-------------------|
| **Возраст** | 32 | 38 | 26 |
| **Доход** | $75-85K | $65-80K | $45-55K |
| **Расписание** | 3x12 | 24/48 | Continental 2/2/4 |
| **Главная боль** | Переход ночь→день | Фрагментированный сон + recovery | Хроническая усталость, каждые 2 дня переключение |
| **Текущее решение** | Sleep Cycle + мелатонин | Oura + «спать когда получается» | Energy drinks + мелатонин наугад |
| **WTP** | $5-7/мес | $5-8/мес | $3-5/мес |
| **Канал discovery** | Коллега + r/nursing | Начальник депо + коллега | TikTok + App Store search |
| **Killer feature** | Transition plan | Recovery plan после 24ч | Переход между 2D/2N |
| **Platform** | iPhone | Android (60%) | iPhone (бюджетный) |

---

## Primary Persona — Марина (Медсестра)

### Почему именно она?

| Фактор | Обоснование |
|--------|-------------|
| **Самое активное сообщество** | r/nursing — 700K+ подписчиков, AllNurses — крупнейший nursing-форум. Рекомендации коллег — главный канал discovery ([MARKET-RESEARCH.md](../01-research/MARKET-RESEARCH.md), раздел 4.1) |
| **Самая острая боль** | 3x12 ротация: переход ночь→день каждые 4 дня. Самый частый запрос в сообществах |
| **Готовность платить** | $5-7/мес подтверждена. Доход $75-85K — могут позволить. «Меньше, чем одна пачка мелатонина в месяц» |
| **Word of mouth** | Медсёстры работают в тесных командах (палата, смена). Одна рекомендация → 5-10 коллег скачивают |
| **B2B потенциал** | Больницы — крупнейший employer shift workers. Hospital wellness programs — канал для Year 2 B2B |
| **Размер сегмента** | ~6M healthcare shift workers в US. Достаточно для первого года |
| **Influencer канал** | Nurse Blake (3.5M), Nurse Mendoza — nursing influencers с massive reach |

### Как это влияет на MVP

1. **Шаблон 3x12** — первый в списке при онбординге
2. **Transition plan** — killer feature проектируется в первую очередь для 3-ночных блоков
3. **Тон коммуникации** — эмпатичный, professional, non-judgmental
4. **Цена** — $5.99/мес ($49.99/год) — в пределах WTP медсестёр
5. **ASO** — целевые запросы: «nurse sleep schedule», «night shift nurse sleep»
6. **GTM** — r/nursing, AllNurses, nursing influencers

### Secondary Personas (Year 1+)

| Приоритет | Персона | Когда | Что добавить |
|-----------|---------|-------|-------------|
| 2 | Пожарные/EMS | Month 4-6 | 24/48 и 48/96 шаблоны, recovery plan после тяжёлых смен |
| 3 | Заводские рабочие | Month 6-9 | Continental/DuPont шаблоны, бюджетный pricing tier |
| 4 | Hospitality/Retail | Year 2 | Нерегулярные смены, weekly schedule import |
| 5 | B2B (Hospital HR) | Year 2 | Enterprise dashboard, anonymized fatigue analytics |

---

## Источники

- [USER-PERSONAS.md](../01-research/USER-PERSONAS.md) — базовые персоны, цитаты, common patterns
- [MARKET-RESEARCH.md](../01-research/MARKET-RESEARCH.md) — размер сегментов, Reddit analysis, community data
- [COMPETITORS.md](../01-research/COMPETITORS.md) — конкуренция за внимание, gap analysis
- [DOMAIN-RESEARCH.md](../01-research/DOMAIN-RESEARCH.md) — научная основа для рекомендаций
- [Apple Community: Night shift sleep tracking](https://discussions.apple.com/thread/254655393)
- [Student Doctor Network: Sleep schedule for shift work](https://forums.studentdoctor.net/threads/app-or-website-to-optimize-sleep-schedule-for-shift-work.1266395/)
- [Student Doctor Network: Switching sleep after night shift](https://forums.studentdoctor.net/threads/switching-sleep-schedules-after-night-shift.1235922/)
- [PistonHeads: Continental shift body clock](https://www.pistonheads.com/gassing/topic.asp?h=0&f=211&t=1486394)
- [Garmin Forum: Sleep tracking as shift worker](https://forums.garmin.com/outdoor-recreation/outdoor-recreation/f/fenix-8-series/388118/sleep-tracking-as-shift-worker-is-an-horrible-experience)
- [BuzzFeed: Night shift workers share what people don't understand (Reddit)](https://www.buzzfeed.com/victoriavouloumanos/night-shift-workers-share-what-people-dont-understand-reddit)
- [Quadra Wellness: Can't sleep after night shift](https://www.quadrawellness.com/blog/cant-sleep-after-night-shift/)
