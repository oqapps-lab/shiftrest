# Smoke Test — Проход 2 (Ветка NeverLandST после merge main)

**Дата:** 2026-06-05  
**Устройство:** Pixel 8 эмулятор (emulator-5554), Android 15, 1080×2400  
**Ветка:** NeverLandST  
**Сценарий:** Универсальный smoke-test (2.smoke-test универсальный.txt)  
**Скриншоты:** screenshots/ (01–70)  

---

## Итог

| Категория | Кол-во |
|-----------|--------|
| Новых багов | 1 |
| Подтверждённых старых багов | 5 |
| Подтверждённых фиксов | 5 |
| Скринов | 70 |

---

## Новые баги

### NS3 — `{{days}}` не разрешается в кнопке Subscription (Settings)
**Приоритет:** HIGH  
**Экран:** Profile → Settings → Subscription  
**Описание:** Кнопка внизу экрана Subscription показывает `Start [missing "{{days}}" value]-day free trial` — переменная `{{days}}` не подставляется. При этом текст карточки вверху ("Unlock the full plan with a **3-day** trial") отображается корректно.  
**Скриншот:** screenshots/67-subscription.png, 67b-subscription-button-bug.png  
**Примечание:** В онбординге NS1 аналогичный баг выглядит исправленным (показывает "7 days"). На экране Settings он сохраняется — вероятно, другой компонент или другой источник данных.

---

## Подтверждённые старые баги

| ID | Баг | Скриншот |
|----|-----|---------|
| OB1 | Шаг 2 онбординга: "Custom schedule" скрыт за кнопкой Continue | (из прохода 1, подтверждён) |
| OB2 | Шаг 4 онбординга: "I'm on a break" скрыт за кнопкой Continue | (из прохода 1, подтверждён) |
| NS2 | NOTES (OPTIONAL) в Add Shift обрезается до "NO" | screenshots/34-35 |
| B02 | Кнопки выбора напитка стоят в столбик вместо строки (TODAY → CAFFEINE) | screenshots/46 |
| B15 | Кнопки доз мелатонина выровнены влево, а не по центру | screenshots/41 |

---

## Подтверждённые фиксы

| ID | Что было | Статус |
|----|----------|--------|
| B13 | Доза мелатонина 0.5 мг не была выбрана по умолчанию | ✅ Исправлено — 0.5 мг выбрана |
| B14 | Night shift не менял время на 19:00–07:00 | ✅ Исправлено — корректно меняет |
| B19 | Новый пользователь видел статистику опытного пользователя | ✅ Исправлено — пустое состояние |
| B20 | Лишняя точка "Nurse · 3×12." в профиле | ✅ Исправлено — "Nurse · 3×12" без точки |
| NS1 | Кнопка подписки в онбординге: `[missing "{{days}}" value]` | ✅ Исправлено в онбординге — показывает "7 days" |

---

## Покрытие по разделам

### TODAY tab
- Пустое состояние для нового пользователя — корректно (B19 fix ✅)
- SLEEP TODAY карточка с часами — отображается
- SAFE TO DRIVE статус — отображается
- CAFFEINE TODAY — кнопки напитков в столбик (B02 подтверждён)
- HYDRATION BOOST — карточка есть

### SCHEDULE tab
- Список смен — для нового пользователя пустой, корректно
- Кнопка "ADD SHIFT" — открывает форму
- Add Shift форма:
  - Night shift: B14 fix ✅ — время меняется на 19:00–07:00
  - NOTES OPTIONAL → обрезается до "NO" (NS2 подтверждён)
  - Melatonin toggle: B13 fix ✅ — 0.5 мг выбрана по умолчанию
  - Кнопки доз мелатонина сбиты влево (B15 подтверждён)
- Кнопка "+ Add Transition" — открывается
- Онбординг paywall: показывает "7 days" корректно (NS1 fix ✅)

### SLEEP PLAN tab
- Заголовок "A gentle plan for today." — корректно
- Карточки (Sleep window, Caffeine, Melatonin, Light, Power Nap, Meal Timing, Movement, Anchor Sleep, Connect Window) — все отображаются без обрезки
- Premium карточки (Shift-Change Protocol, Progress Tracking) — заблокированы, корректно
- "Why these times? →" ссылка — видна внизу

### PROFILE tab
- "Alex\nNurse · 3×12" — без лишней точки (B20 fix ✅)
- 0-DAY STREAK — отображается
- DAYS/JOURNAL/ON PLAN: все 0 для нового пользователя
- SLEEP LIBRARY карточка — отображается
- Sleep preferences: все поля заполнены из онбординга, "Reset all answers" есть
- Notifications: все 5 toggles работают, "Reminders scheduled locally" — есть
- Subscription: текст "3-day trial" корректен, **кнопка сломана** (NS3 — новый баг)
- About & support: VERSION 0.1.0, все ссылки, medical disclaimer — всё есть
- Save your account: форма Create Account, DEMO MODE notice — ожидаемо для Stage 3

---

## Без изменений / не найдено

- Текст не обрезается (кроме NS2, B02)
- Контраст везде читаемый
- Lorem ipsum не обнаружен
- Шрифты консистентные
- Иконки в tab bar корректные
- Анимации переходов плавные
