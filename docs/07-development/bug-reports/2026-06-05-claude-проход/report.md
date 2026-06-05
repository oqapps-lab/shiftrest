# Smoke-test — 2026-06-05 — проход Claude (NeverLandST)

Ветка: NeverLandST (после merge main → NeverLandST)  
Устройство: Pixel 8 (emulator-5554), Android  
Время: 07:54 – 09:04

---

## Итого: 2 бага (H1 · M1)

---

B1: Кнопка подписки — сырой шаблон вместо текста  
Где: Экран Profile → Subscription, кнопка внизу экрана  
Что вижу: Кнопка показывает текст `Start [missing "{{days}}" value]-day free trial` вместо нормального числа. Выглядит как технический мусор — пользователь видит непонятные скобки и служебные слова прямо на главной кнопке оплаты.  
Как должно быть: Кнопка должна читаться как "Start 3-day free trial" (или любое другое число дней). Текст должен быть чистым, без технических символов.  
Скриншот: screenshots/46-subscription-bug.png  
Приоритет: HIGH

---

B2: Форма добавления шифта — метка поля обрезана  
Где: Расписание → кнопка "+ Add shift" → форма "Add a shift", секция между ENDS и SUMMARY  
Что вижу: Метка поля "NOTES (OPTIONAL)" отображается как две буквы "NO" — остальной текст обрезан. Если смотришь на форму, непонятно что это за поле и зачем оно.  
Как должно быть: Метка должна читаться полностью: "NOTES (OPTIONAL)". Поле должно явно показывать, что это необязательные заметки к смене.  
Скриншот: screenshots/72-notes-bug-confirm.png  
Приоритет: MEDIUM

---

## Что проверено и работает

**Вкладка TODAY**
- Приветствие, заголовок, карточка "Right now" — норма
- TODAY'S FOCUS · PREMIUM — открывает пейволл ✓
- Кнопка LOG CUP → диалог "Log a cup of coffee?" → Cancel/Log it ✓
- HOW DID YOU SLEEP (GREAT/OK/ROUGH) — разворачивает форму с HOW LONG и WHAT AFFECTED IT ✓
- YOUR WEEK IN SLEEP обновляется после записи ✓
- Карточки ANCHOR SLEEP, SLEEP DEBT, циферблат 24h — отображаются ✓
- Кнопка "?" → коачмарк "Reading your Today screen" → Got it закрывает ✓
- INSIGHT OF THE DAY — контент реальный ✓
- PLAN AHEAD → модалка "New Transition" → закрывается Back ✓
- LOG CUP → диалог подтверждения ✓
- "Browse the Sleep Library →" → открывает библиотеку ✓

**Вкладка SCHEDULE**
- Календарь JUNE 2026 отображается ✓
- Тап на дату с шифтом → диалог "Remove this shift?" ✓
- Cancel в диалоге закрывает без удаления ✓
- Легенда (Day shift / Night shift / Off) — полная ✓
- "Import from calendar (.ics)" — ссылка видна ✓
- "+ Add shift" → форма открывается ✓
- QUICK PRESETS, SHIFT TYPE, STARTS, ENDS работают ✓
- Форма закрывается крестиком ✓

**Вкладка SLEEP PLAN**
- Дата "TODAY · 5 JUN" с навигацией "<" / ">" ✓
- Переход на TOMORROW → план обновляется ✓
- Карточки CAFFEINE, LIGHT, POWER NAP, MEAL TIMING, MOVEMENT WINDOW, ANCHOR SLEEP, CONNECT WINDOW — отображаются ✓
- Expand/collapse по тапу на карточку → "WHY THIS HELPS" разворачивается и сворачивается ✓
- MELATONIN · PREMIUM и другие premium-карточки залочены ✓
- "Why these times? →" → нижний лист с объяснениями → Got it закрывает ✓

**Вкладка PROFILE**
- Аватар, имя (Alex), профессия (Nurse · 3×12) ✓
- Стрик, статистика (DAYS / JOURNAL / ON PLAN) ✓
- Sleep preferences → все пункты открываются ✓
- Apple Health → кнопка Connect → диалог "Coming in v1.1" ✓
- Notifications → все тогглы видны, LEAD TIME 15/30/60 мин ✓
- About & support → VERSION 0.1.0 ✓
- Privacy Policy → реальный текст, LAST UPDATED JUNE 2026 ✓
- Terms of Use → реальный текст ✓

**Пейволл**
- Открывается при тапе на любой PREMIUM-элемент ✓
- "Maybe later" закрывает ✓
- Текст фич читается, кнопка "Start 7-day free trial" видна (отдельный экран — без бага B1) ✓

**Sleep Library**
- Открывается по ссылке с Today ✓
- Статьи открываются, контент реальный ✓
- Фильтры ALL / LIGHT & CLOCK / CAFFEINE видны ✓

---

## Наблюдения (не баги)

- Таб "SLEEP" в библиотеке обрезан справа — возможно, намеренно (горизонтальный скролл), возможно нет. Не блокирует, но выглядит немного криво.
- "Apple Health: Coming in v1.1" на Android показывает iOS-специфичную кнопку. Поведение корректное (диалог объясняет), но можно было бы скрыть кнопку совсем.
