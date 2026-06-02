# ShiftRest Smoke-test — Финальный отчёт
**Дата:** 2026-06-01  
**Ветка:** NeverLandST  
**Последний коммит:** 3c1fca7 Merge branch 'main' into NeverLandST  
**Сессия:** Продолжение от 2026-05-30 (прогресс: 2026-05-30-smoke-test-прогресс.md)

---

## Итог: всё проверено ✅

Smoke-test завершён полностью. Все 4 вкладки проверены.

---

## Результаты по вкладкам

### TODAY ✅ (проверена ранее, 2026-05-30)
- [x] Туториальный оверлей "Reading your Today screen"
- [x] Переключатели смен (Day / Night / Off day)
- [x] Кнопки качества сна (GREAT / OK / ROUGH)
- [x] "Tap for 30-day history" → Sleep History
- [x] LOG CUP — диалог подтверждения
- [x] "Night → day switch ahead" баннер → New Transition
- [x] "Share what helps you" → форма Your Story

### SCHEDULE ✅
- [x] Экран открывается, показывает June 2026
- [x] Легенда: Day shift / Night shift / Off day
- [x] Стрелка `<` (предыдущий месяц) — переключает на May 2026
- [x] Стрелка `>` (следующий месяц) — переключает на July 2026
- [x] Тап по дню в календаре — открывает диалог "Edit this shift?" с CANCEL/DELETE
- [x] "+ Add shift" — открывает экран "NEW SHIFT"
  - [x] Пресеты DAY 12H / NIGHT 12H / ON-CALL 24H — работают (меняют тип и время)
  - [x] SHIFT TYPE (Day/Night/Off) — работает
  - [x] STARTS датапикер — открывается ⚠️ см. B06
- [x] Gear icon — открывает Expo Dev Menu (см. B01-update)

### SLEEP PLAN ✅
- [x] Экран открывается, показывает TODAY · 1 JUN
- [x] YESTERDAY — переключается, показывает "Yesterday's plan."
- [x] TOMORROW — переключается, показывает "Tomorrow's plan."
- [x] Карточки отображаются: CAFFEINE, MELATONIN·PREMIUM, LIGHT, FULL-CYCLE NAP, MEAL TIMING
- [x] "Why these times? →" — открывает панель "YOUR PLAN, EXPLAINED"

### PROFILE ✅
- [x] Экран открывается: Alex, Nurse·3×12, 0-day streak, stats (DAYS/JOURNAL/ON PLAN)
- [x] JOURNAL · LAST 14 → Sleep History ("Your 30-day pattern", 30-дневная сетка)
- [x] Sleep Library → карточки с исследованиями, фильтры (ALL/ENVIRONMENT/NUTRITION/PRE-SLEEP RITUAL) работают
- [x] **SETTINGS:**
  - [x] Save your account → форма создания аккаунта (DEMO MODE)
  - [x] Sleep preferences → Profession, Work schedule, Chronotype, Caffeine, Melatonin, Light therapy — все кликабельны, открывают экраны редактирования
  - [x] Notifications → toggles работают (All notifications / Bed time / Caffeine cutoff / Melatonin timing), выбор lead time
  - [x] Subscription → paywall, "Start 3-day trial"
  - [x] About & support → VERSION 0.1.0, FAQ / Contact / Rate / Privacy Policy / Terms of Use

---

## Баги

### B01 — Gear icon открывает Expo Dev Menu, а не настройки (УТОЧНЕНИЕ)
**Статус:** Обновлён  
**Где:** Иконка ⚙️ в правом верхнем углу (видна на всех вкладках)  
**Что видим:** Тап открывает Expo Dev Menu (Reload / Go home / Toggle performance monitor / etc.), а не настройки приложения.  
**Как должно быть:** Должна открывать экран настроек приложения, либо кнопка должна быть убрана.  
**Приоритет:** MEDIUM  
**Скриншоты:** 49-schedule-open.png, 53-add-shift-open.png

### B02 — Датапикер на экране "New Transition" блокирует приложение (HIGH)
**Где:** Today → "Night → day switch ahead" → поле STARTS  
**Что видим:** Нативный датапикер открывается, но CANCEL и Android Back не закрывают его. Единственный выход — force-stop.  
**Приоритет:** HIGH  
**Скриншот:** screenshots/37-datepicker-ok.png

### B03 — Gear icon перекрывает кнопку LOG CUP при скролле (LOW)
**Где:** Today, карточка Caffeine при прокрутке вниз  
**Что видим:** ⚙️ зафиксирована поверх кнопки LOG CUP.  
**Приоритет:** LOW  
**Скриншот:** screenshots/12-today-scrolled2.png

### B04 — "Submit anonymously" неактивна при коротком тексте (MEDIUM)
**Где:** Today → "Share what helps you" → форма Your Story  
**Что видим:** Кнопка серая при 4 символах, нет объяснения минимальной длины.  
**Приоритет:** MEDIUM  
**Скриншот:** screenshots/45-story-typed.png

### B05 — ЗАКРЫТ ✅
**Было:** "+ Add shift" не реагировал на тап.  
**Факт:** Кнопка работает, открывает NEW SHIFT. Предыдущий тест был промахом координат.

### B06 — Датапикер STARTS на экране "Add a shift" не закрывается (HIGH)
**Где:** SCHEDULE → "+ Add shift" → поле STARTS  
**Что видим:** Датапикер открывается. CANCEL не закрывает. Android Back не закрывает. Единственный выход — force-stop.  
**Как должно быть:** CANCEL должен закрывать датапикер без сохранения даты.  
**Корень проблемы:** Та же что B02 — нативный Android DatePickerDialog не получает обработчик dismiss.  
**Приоритет:** HIGH  
**Скриншот:** screenshots/54-add-shift-datepicker.png, 55-add-shift-datepicker-stuck.png

---

## Технические замечания

### Патчи node_modules (для Expo Go, не коммитить)
Два файла в `expo-notifications` были пропатчены чтобы приложение запускалось в Expo Go:

1. `node_modules/expo-notifications/build/warnOfExpoGoPushUsage.js`  
   `throw new Error(message)` → `console.warn(message)` (Android + Expo Go не крашится)

2. `node_modules/expo-notifications/build/TopicSubscriptionModule.android.js`  
   `requireNativeModule('ExpoTopicSubscriptionModule')` → stub-объект (нативный модуль не доступен в Expo Go)

Эти изменения нужны только для smoke-test в Expo Go. В production build (dev client / release) они не нужны и не должны коммититься.

---

## Папка скриншотов
`docs/07-development/bug-reports/2026-05-30-claude-проход/screenshots/`  
Скриншоты 49–71 сделаны в этой сессии (01.06.2026).
