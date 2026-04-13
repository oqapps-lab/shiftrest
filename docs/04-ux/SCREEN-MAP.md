# Screen Map — ShiftRest
**Дата: 13 апреля 2026**

> Основано на: [FEATURES.md](../02-product/FEATURES.md), [USER-FLOWS.md](./USER-FLOWS.md), [PRACTICES-BRIEF.md](../03-practices/PRACTICES-BRIEF.md)

---

## Полная карта экранов

```
ShiftRest App
│
├── 🚀 Onboarding (не авторизован)
│   ├── S01  Welcome
│   ├── S02  Profession Picker
│   ├── S03  Schedule Template
│   ├── S04  Current Shift
│   ├── S05  Main Problem
│   ├── S06  Social Proof Break #1
│   ├── S07  Chronotype Quiz
│   ├── S08  Caffeine Habits
│   ├── S09  Melatonin Usage
│   ├── S10  Family & Commitments
│   ├── S11  Name Input
│   ├── S12  Social Proof Break #2
│   ├── S13  Loading / Analysis
│   ├── S14  Aha-Moment (Plan Preview)
│   ├── S15  Paywall (Primary)
│   └── S16  Notification Permission
│
├── 📱 Main Tabs (авторизован)
│   ├── Tab 1: Home (Today)
│   │   ├── S20  Home — с данными (рабочий день)
│   │   ├── S21  Home — с данными (выходной)
│   │   ├── S22  Home — пустое состояние (нет расписания)
│   │   └── S23  Home — premium upsell (free user)
│   │
│   ├── Tab 2: Schedule (Расписание)
│   │   ├── S30  Calendar View (месяц)
│   │   ├── S31  Add Shift (добавить смену)
│   │   ├── S32  Edit Shift (редактирование)
│   │   ├── S33  Template Picker (выбор шаблона ротации)
│   │   └── S34  Repeat Settings (повтор на N недель)
│   │
│   ├── Tab 3: Sleep Plan (План сна)
│   │   ├── S40  Daily Sleep Plan (timeline)
│   │   ├── S41  Caffeine Cutoff Detail
│   │   ├── S42  Melatonin Timing Detail
│   │   ├── S43  Transition Plan (multi-day)
│   │   ├── S44  Transition Day Detail
│   │   ├── S45  Plan Explanation («Почему так?»)
│   │   └── S46  Weekly Plan Overview
│   │
│   └── Tab 4: Profile
│       ├── S50  Profile Overview
│       ├── S51  Sleep Preferences (edit)
│       ├── S52  Notification Settings
│       ├── S53  Subscription Management
│       └── S54  About / Support
│
├── 🔲 Modals / Overlays
│   ├── M01  Paywall (контекстный повторный показ)
│   ├── M02  Push Permission Primer
│   ├── M03  Premium Feature Gate (preview + lock)
│   ├── M04  Shift Changed (пересчёт плана)
│   ├── M05  Celebration (streak milestone, transition complete)
│   ├── M06  Rate App Prompt
│   ├── M07  Welcome Back (>14 дней отсутствия)
│   ├── M08  Schedule Expired (расписание закончилось)
│   └── M09  Disclaimer (мелатонин / медицинский)
│
└── ⚙️ System
    ├── X01  Loading (app startup)
    ├── X02  No Internet
    ├── X03  Force Update
    └── X04  Maintenance
```

---

## Детализация экранов

### Onboarding

| ID | Экран | Назначение | Откуда | Куда | Ключевые элементы |
|----|-------|-----------|--------|------|-------------------|
| S01 | Welcome | Передать ценностное предложение, начать путь | App Store (первый запуск) | S02 | Иллюстрация (сменный работник + часы), заголовок «Персональный план сна для сменных работников», подзаголовок, CTA «Создать мой план», social proof badge (кол-во пользователей) |
| S02 | Profession Picker | Определить профессию для персонализации | S01 | S03 | 4 карточки с иконками: Медсестра, Пожарный/EMT, Фабрика, Другое. Прогресс-бар (1/10) |
| S03 | Schedule Template | Выбрать тип ротации | S02 | S04 | Список шаблонов (3x12 день/ночь, 24/48, 48/96, Continental 2/2/4, «Своё расписание»). Краткое описание каждого. Прогресс-бар (2/10) |
| S04 | Current Shift | Уточнить текущее расписание | S03 | S05 | Выбор: «Я сейчас на дневных / ночных / выходных». Время начала и конца смены (picker). Время дороги домой (slider, default 30 мин). Прогресс-бар (3/10) |
| S05 | Main Problem | Понять приоритетную боль | S04 | S06 | 4 опции (single select): «Не могу заснуть после ночной», «Переход ночь↔день — кошмар», «Хроническая усталость», «Кофеин мешает спать». Прогресс-бар (4/10) |
| S06 | Social Proof #1 | Снизить drop-off в середине квиза | S05 | S07 | Статистика: «93% сменных работников не высыпаются. Вы не одиноки.» Отзыв по выбранной профессии. Без input — только «Далее» |
| S07 | Chronotype Quiz | Определить хронотип (сова/жаворонок) | S06 | S08 | 3 вопроса MEQ (упрощённых): preferred wake time, energy peak time, natural sleep time. Прогресс-бар (5/10) |
| S08 | Caffeine Habits | Данные для caffeine cutoff | S07 | S09 | Чашек в день (slider 0-8), тип (кофе/чай/энергетик), чувствительность: «Обычная» / «Кофе влияет сильно» / «Не знаю». Прогресс-бар (6/10) |
| S09 | Melatonin Usage | Данные для melatonin timing | S08 | S10 | Toggle: принимаете ли. Если да → дозировка (picker: 0.5/1/3/5/10 мг), время приёма (picker). Прогресс-бар (7/10) |
| S10 | Family & Commitments | Учёт семейных ограничений | S09 | S11 | Toggle: есть ли дети. Если да → возраст, забор из школы/сада (time picker). Другие фиксированные обязательства (optional text). Прогресс-бар (8/10) |
| S11 | Name Input | Персонализация (+13% конверсии) | S10 | S12 | Поле «Как вас зовут?», placeholder: «Марина». Прогресс-бар (9/10) |
| S12 | Social Proof #2 | Финальное подкрепление перед результатом | S11 | S13 | Отзыв от конкретного специалиста (медсестра ICU / пожарный / оператор) по выбранной профессии. Rating stars + App Store badge. Без input — только «Показать мой план» |
| S13 | Loading / Analysis | Повысить perceived value (+10-20% конверсии) | S12 | S14 | Анимация: «Анализируем ваш график...», «Рассчитываем оптимальное время сна...», «Готовим план мелатонина...», «Создаём transition plan...». 3-5 секунд |
| S14 | Aha-Moment | Показать конкретный результат ДО paywall | S13 | S15 | Заголовок «[Имя], вот ваш план сна». Visual timeline: смена → дорога → сон → wake up. 3 ключевые рекомендации (sleep window, caffeine cutoff, melatonin). Превью transition plan (размыто). CTA «Получить полный план» |
| S15 | Paywall (Primary) | Конвертировать в trial/подписку | S14 | S16 или Home | Персонализированный заголовок: «[Имя], ваш план готов». 4 буллета ценности. 2 тарифа: $5.99/мес, $49.99/год ($0.96/нед — «Лучший выбор»). Trial timeline (7 дней). Social proof. Анимация. «Может быть позже» (visible) |
| S16 | Notification Permission | Получить разрешение на push | S15 | Home (S20) | Контекст: «Чтобы напомнить про мелатонин и caffeine cutoff вовремя». Иконки 3 типов нотификаций. CTA «Разрешить» → системный диалог. «Позже» → Home |

### Main Tabs — Home

| ID | Экран | Назначение | Откуда | Куда | Ключевые элементы |
|----|-------|-----------|--------|------|-------------------|
| S20 | Home (рабочий день) | Показать сегодняшний план за <5 сек | Tab bar, push, app open | S40, S43 | Приветствие + Sleep Streak 🔥. Контекстная карточка (динамическая по времени суток). Следующие 3 события: caffeine cutoff, melatonin, sleep. Блок transition plan (если transition). Quick actions |
| S21 | Home (выходной) | Показать рекомендации на выходной | Tab bar, app open | S40, S43 | Приветствие «Выходной!». Рекомендация восстановления режима. Sleep Streak. Карточка: «Следующий блок смен через X дней» с CTA «Посмотреть plan» |
| S22 | Home (пустое) | Направить к созданию расписания | Онбординг (skip) / новый период | S30, S33 | Иллюстрация (пустой календарь). «Добавьте расписание, чтобы получить план сна». CTA «Добавить смены». Secondary: «Выбрать шаблон» |
| S23 | Home (free user) | Показать ценность premium | Tab bar (free user) | M01, S40 | Базовый план (только sleep window). Locked карточки: мелатонин 🔒, transition 🔒, AI-советы 🔒. Баннер: «Разблокируйте полный план — 7 дней бесплатно» |

### Main Tabs — Schedule

| ID | Экран | Назначение | Откуда | Куда | Ключевые элементы |
|----|-------|-----------|--------|------|-------------------|
| S30 | Calendar View | Визуальное расписание смен на месяц | Tab bar | S31, S32, S33 | Месячный календарь с цветовой кодировкой: дневная (жёлтый), ночная (тёмно-синий), выходной (зелёный). Дот-нотация. Tap на дату → детали/редактирование. FAB «+ Добавить» |
| S31 | Add Shift | Добавить новую смену | S30 (FAB) | S30 | Выбор даты (single / range). Тип: день/ночь. Время начала/конца. Repeat: single / repeat pattern. Кнопка «Сохранить» |
| S32 | Edit Shift | Редактировать/удалить смену | S30 (tap на смену) | S30 | Pre-filled данные смены. Edit все поля. «Сохранить» / «Удалить смену» (с confirmation). Примечание: «Пересчитать план сна?» |
| S33 | Template Picker | Выбрать шаблон ротации | S30, S22 | S34 | Список шаблонов: 3x12 (день), 3x12 (ночь), 24/48, 48/96, Continental 2/2/4, DuPont. Визуальный preview каждого (мини-календарь 2 недели). «Свой шаблон» |
| S34 | Repeat Settings | Настроить повтор на будущее | S33 | S30 | Дата начала, длительность повтора (2/4/6/8 недель), preview: сколько смен будет добавлено. «Применить» |

### Main Tabs — Sleep Plan

| ID | Экран | Назначение | Откуда | Куда | Ключевые элементы |
|----|-------|-----------|--------|------|-------------------|
| S40 | Daily Sleep Plan | Детальный план на сегодня (core screen) | S20, Tab bar | S41, S42, S45 | 24-часовой visual timeline: блоки смены, дороги, wind-down, сна, свободного времени. Карточки рекомендаций: caffeine, melatonin, light, nap. Каждая с tap → detail. «Почему так?» link. Swipe: вчера/сегодня/завтра |
| S41 | Caffeine Detail | Объяснение caffeine cutoff | S40 (карточка) | S40 | Текущий статус (зелёный/жёлтый/красный). Cutoff time + обоснование. Настройка чувствительности (5-8ч). Правило: ≥6ч до сна. Disclaimer |
| S42 | Melatonin Detail | Объяснение melatonin timing | S40 (карточка) | S40 | Рекомендуемое время + обоснование (PRC). Рекомендуемая доза. Тип: phase advance vs phase delay. «Это информация, не назначение» disclaimer. Научные источники |
| S43 | Transition Plan | Пошаговый план перехода (killer feature) | S20, S40, Push | S44 | Заголовок: «Переход: Ночной → Дневной». Timeline на 2-3 дня. Для каждого дня: checklist шагов с временами. Progress: выполнено X из Y. Push-привязка к каждому шагу |
| S44 | Transition Day Detail | Детали одного дня transition | S43 (tap на день) | S43 | Развёрнутый checklist. Для каждого шага: время, действие, обоснование, toggle «выполнено». Рекомендации по свету (seek/avoid). Tip of the day |
| S45 | Plan Explanation | Научное обоснование рекомендаций | S40 (link) | S40 | Краткое объяснение Two-process model. Как хронотип влияет на план. Почему именно эти времена. Источники: AASM, CDC, NASA. Читабельно — не academic |
| S46 | Weekly Plan Overview | Обзор плана на весь рабочий блок | S40 (swipe) | S40 | 7-дневная timeline: каждый день = полоска (смена + сон). Transition дни выделены. Tap → detail дня |

### Main Tabs — Profile

| ID | Экран | Назначение | Откуда | Куда | Ключевые элементы |
|----|-------|-----------|--------|------|-------------------|
| S50 | Profile Overview | Центр управления настройками | Tab bar | S51-S54 | Имя + профессия + тип смен. Sleep Streak (history). Quick stats: дней в приложении, transition plans completed. Список: Preferences, Notifications, Subscription, About |
| S51 | Sleep Preferences | Редактирование данных онбординга | S50 | S50 | Все данные из квиза (editableforms): хронотип, кофеин, мелатонин, семья, дорога. «Сохранить» → пересчёт плана |
| S52 | Notification Settings | Управление push-уведомлениями | S50 | S50 | Toggles для каждого типа: Sleep reminder, Caffeine cutoff, Melatonin, Dark glasses, Transition steps. За сколько минут до (picker). Master toggle |
| S53 | Subscription Management | Управление подпиской | S50 | M01, deep link | Текущий план: Free / Trial (до DD.MM) / Premium. Manage subscription → App Store/Google Play. Restore Purchase. «Перейти на Premium» (если free) |
| S54 | About / Support | Информация и помощь | S50 | External | Версия приложения. FAQ. Contact support (email). Privacy Policy. Terms of Use. Medical disclaimer. «Оценить приложение» → Store |

### Modals / Overlays

| ID | Экран | Назначение | Триггер | Действия |
|----|-------|-----------|---------|----------|
| M01 | Paywall (контекстный) | Конвертировать при tap на premium | Tap на 🔒 фичу | Trial / «Может быть позже» |
| M02 | Push Permission Primer | Подготовить к системному запросу | S16, или позже если отклонил | «Разрешить» → iOS/Android диалог / «Позже» |
| M03 | Premium Feature Gate | Показать preview premium | Tap на locked карточку | Размытый preview + CTA → M01 |
| M04 | Shift Changed | Подтвердить пересчёт плана | Edit shift / overtime | «Пересчитать план» / «Отмена» |
| M05 | Celebration | Награда за достижение | Streak milestone (3,7,14,30), transition complete | Анимация 🎉 + stat + «Продолжить» |
| M06 | Rate App | Запрос оценки в Store | После 3-й успешной Transition ИЛИ streak=7 | «Оценить» → In-app review / «Позже» |
| M07 | Welcome Back | Вернуть после отсутствия | Открытие через >14 дней | «Обновить расписание» → S30 / «Пропустить» → Home |
| M08 | Schedule Expired | Уведомить об истечении | Открытие, когда расписание пустое | «Продлить на 4 недели» → S34 / «Ввести новое» → S30 |
| M09 | Disclaimer | Медицинское предупреждение | Первый показ melatonin рекомендации | Текст disclaimer + «Понятно» |

### System

| ID | Экран | Назначение | Триггер | Поведение |
|----|-------|-----------|---------|-----------|
| X01 | Loading | Запуск приложения | App open | Logo + минимальная анимация. Быстрый (<2 сек) |
| X02 | No Internet | Offline-режим | Нет сети при критическом действии | «Нет подключения к интернету. Кэшированный план доступен.» Retry кнопка |
| X03 | Force Update | Принудительное обновление | Критическое обновление (major version) | «Доступна важная версия. Обновите приложение.» → Store |
| X04 | Maintenance | Техническое обслуживание | Серверы недоступны | «Ведутся технические работы. Попробуйте позже.» Кэшированные данные доступны |

---

## Навигационная структура

```
Bottom Tab Bar (4 tabs):
┌────────┬────────────┬────────────┬─────────┐
│  Home  │  Schedule  │ Sleep Plan │ Profile │
│   🏠   │    📅      │    😴      │   👤    │
└────────┴────────────┴────────────┴─────────┘
```

**Навигация внутри tabs:** Stack navigation (push/pop)
**Modals:** Presented over current context (slide up)
**Onboarding:** Stack navigation, no back button (forward only), прогресс-бар

---

## Итого экранов

| Раздел | Количество |
|--------|-----------|
| Onboarding | 16 |
| Home | 4 |
| Schedule | 5 |
| Sleep Plan | 7 |
| Profile | 5 |
| Modals | 9 |
| System | 4 |
| **Всего** | **50** |

**Уникальных экранов для дизайна:** ~35 (модалы и system переиспользуют компоненты)

---

## Источники

- [FEATURES.md](../02-product/FEATURES.md) — MVP scope, F1-F8 → экраны
- [USER-FLOWS.md](./USER-FLOWS.md) — flows определяют переходы между экранами
- [PRACTICES-BRIEF.md](../03-practices/PRACTICES-BRIEF.md) — рекомендации по экранам (раздел 3)
- [PRODUCT-VISION.md](../02-product/PRODUCT-VISION.md) — 5 основных экранов MVP
