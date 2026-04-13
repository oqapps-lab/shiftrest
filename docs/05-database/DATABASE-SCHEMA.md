# Database Schema — ShiftRest
**Дата: 13 апреля 2026**

> Основано на: [FEATURES.md](../02-product/FEATURES.md), [MONETIZATION.md](../02-product/MONETIZATION.md), [SCREEN-MAP.md](../04-ux/SCREEN-MAP.md), [USER-FLOWS.md](../04-ux/USER-FLOWS.md)

---

## Обзор

11 таблиц для MVP (F1–F8). Все таблицы в схеме `public`, RLS включена на каждой.

| # | Таблица | Назначение | Тип |
|---|---------|-----------|-----|
| 1 | profiles | Профиль пользователя + данные онбординга | User data |
| 2 | user_settings | Настройки приложения и уведомлений | User data |
| 3 | subscriptions | Статус подписки (синк с Adapty) | Billing |
| 4 | shift_templates | Справочник шаблонов ротаций | Reference |
| 5 | user_schedules | Привязка пользователя к шаблону расписания | User data |
| 6 | shifts | Индивидуальные смены в календаре | User data |
| 7 | sleep_plans | Сгенерированные планы сна (по дням) | User data |
| 8 | transition_plans | Многодневные планы перехода между режимами | User data |
| 9 | transition_steps | Шаги внутри плана перехода | User data |
| 10 | sleep_streaks | Трекинг серий (streak) соблюдения плана | User data |
| 11 | ai_requests | Лог вызовов OpenAI API | System log |

---

## Таблица: profiles

**Назначение:** Расширение auth.users — профиль, данные онбординга, персональные параметры для генерации плана сна.
**Связана с:** auth.users (1:1)

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | — | PK, FK → auth.users(id) ON DELETE CASCADE |
| display_name | text | NULL | NULL | Имя пользователя (шаг онбординга S11) |
| avatar_url | text | NULL | NULL | URL аватара в Supabase Storage |
| profession | text | NULL | NULL | Профессия: nurse, firefighter, factory, other |
| chronotype_score | smallint | NULL | NULL | Итоговый балл MEQ-квиза (3 вопроса) |
| chronotype | text | NULL | NULL | Результат: lark, owl, intermediate |
| caffeine_cups_per_day | smallint | NULL | NULL | Чашек кофеина в день (0–8) |
| caffeine_type | text | NULL | NULL | Тип: coffee, tea, energy_drink |
| caffeine_sensitivity | text | NULL | NULL | Чувствительность: normal, slow, unknown |
| uses_melatonin | boolean | NULL | NULL | Принимает ли мелатонин |
| melatonin_dose_mg | numeric(3,1) | NULL | NULL | Текущая доза (0.5–10 мг) |
| has_children | boolean | NULL | NULL | Есть ли дети |
| family_commitments | jsonb | NULL | '[]' | Фиксированные обязательства: [{time, description}] |
| commute_minutes | smallint | NOT NULL | 30 | Время дороги домой (мин) |
| main_problem | text | NULL | NULL | Главная проблема: cant_sleep, transition, fatigue, caffeine |
| onboarding_completed | boolean | NOT NULL | false | Пройден ли онбординг полностью |
| onboarding_step | smallint | NULL | NULL | Текущий шаг при прерывании (для возобновления) |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `CHECK (profession IN ('nurse', 'firefighter', 'factory', 'other'))`
- `CHECK (chronotype IN ('lark', 'owl', 'intermediate'))`
- `CHECK (caffeine_sensitivity IN ('normal', 'slow', 'unknown'))`
- `CHECK (caffeine_type IN ('coffee', 'tea', 'energy_drink'))`
- `CHECK (main_problem IN ('cant_sleep', 'transition', 'fatigue', 'caffeine'))`
- `CHECK (commute_minutes BETWEEN 0 AND 180)`
- `CHECK (caffeine_cups_per_day BETWEEN 0 AND 20)`

**Индексы:**
- PK на `id` (автоматический)

**RLS:** Включена. Политики описаны в [RLS-POLICIES.md](./RLS-POLICIES.md).

---

## Таблица: user_settings

**Назначение:** Настройки приложения — уведомления, тема, язык, push-токен.
**Связана с:** auth.users (1:1)

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK → auth.users(id) ON DELETE CASCADE, UNIQUE |
| notifications_enabled | boolean | NOT NULL | true | Мастер-переключатель уведомлений |
| notify_sleep_reminder | boolean | NOT NULL | true | Напоминание «пора спать» |
| notify_sleep_reminder_minutes | smallint | NOT NULL | 30 | За сколько минут до сна |
| notify_caffeine_cutoff | boolean | NOT NULL | true | Уведомление о caffeine cutoff |
| notify_melatonin | boolean | NOT NULL | true | Напоминание о мелатонине |
| notify_dark_glasses | boolean | NOT NULL | true | Напоминание «тёмные очки» |
| notify_transition_steps | boolean | NOT NULL | true | Уведомления по шагам transition |
| theme | text | NOT NULL | 'system' | Тема: light, dark, system |
| language | text | NOT NULL | 'en' | Язык интерфейса |
| timezone | text | NULL | NULL | IANA timezone (e.g. America/New_York) |
| expo_push_token | text | NULL | NULL | Expo Push Token для отправки уведомлений |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `UNIQUE (user_id)`
- `CHECK (theme IN ('light', 'dark', 'system'))`
- `CHECK (notify_sleep_reminder_minutes BETWEEN 5 AND 120)`

**Индексы:**
- `idx_user_settings_user_id` UNIQUE ON (user_id)

**RLS:** Включена. Политики описаны в [RLS-POLICIES.md](./RLS-POLICIES.md).

---

## Таблица: subscriptions

**Назначение:** Текущий статус подписки, синхронизируется с Adapty через webhook.
**Связана с:** auth.users (1:1)

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK → auth.users(id) ON DELETE CASCADE, UNIQUE |
| adapty_profile_id | text | NULL | NULL | ID профиля в Adapty |
| status | text | NOT NULL | 'free' | free, trial, active, expired, cancelled, grace_period |
| plan | text | NOT NULL | 'free' | free, premium_monthly, premium_annual |
| trial_start | timestamptz | NULL | NULL | Начало trial-периода |
| trial_end | timestamptz | NULL | NULL | Конец trial-периода |
| current_period_start | timestamptz | NULL | NULL | Начало текущего периода подписки |
| current_period_end | timestamptz | NULL | NULL | Конец текущего периода подписки |
| cancellation_date | timestamptz | NULL | NULL | Дата отмены (если отменена) |
| store | text | NULL | NULL | Магазин: app_store, google_play |
| raw_data | jsonb | NULL | '{}' | Полный payload от Adapty webhook |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `UNIQUE (user_id)`
- `CHECK (status IN ('free', 'trial', 'active', 'expired', 'cancelled', 'grace_period'))`
- `CHECK (plan IN ('free', 'premium_monthly', 'premium_annual'))`
- `CHECK (store IN ('app_store', 'google_play'))`

**Индексы:**
- `idx_subscriptions_user_id` UNIQUE ON (user_id)
- `idx_subscriptions_adapty_profile_id` ON (adapty_profile_id) WHERE adapty_profile_id IS NOT NULL
- `idx_subscriptions_status` ON (status) WHERE status != 'free'

**RLS:** Включена. Политики описаны в [RLS-POLICIES.md](./RLS-POLICIES.md).

---

## Таблица: shift_templates

**Назначение:** Справочник предустановленных шаблонов ротаций (3x12, 24/48, Continental и т.д.).
**Связана с:** user_schedules (1:N — один шаблон может использоваться многими пользователями)

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| name | text | NOT NULL | — | Название: «3x12 Night», «24/48», «Continental 2/2/4» |
| slug | text | NOT NULL | — | Уникальный слаг: 3x12-night, 24-48, continental-2-2-4 |
| description | text | NULL | NULL | Краткое описание шаблона |
| profession | text | NOT NULL | 'all' | Целевая профессия: nurse, firefighter, factory, all |
| pattern | jsonb | NOT NULL | — | Определение цикла (см. ниже) |
| cycle_days | smallint | NOT NULL | — | Длина цикла в днях |
| is_active | boolean | NOT NULL | true | Активен ли шаблон |
| sort_order | smallint | NOT NULL | 0 | Порядок сортировки в UI |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Формат pattern (JSONB):**
```json
{
  "cycle": [
    {"type": "night", "start": "19:00", "end": "07:00"},
    {"type": "night", "start": "19:00", "end": "07:00"},
    {"type": "night", "start": "19:00", "end": "07:00"},
    {"type": "off"},
    {"type": "off"},
    {"type": "off"},
    {"type": "off"}
  ]
}
```

**Constraints:**
- `UNIQUE (slug)`
- `CHECK (profession IN ('nurse', 'firefighter', 'factory', 'all'))`
- `CHECK (cycle_days > 0)`

**Индексы:**
- `idx_shift_templates_slug` UNIQUE ON (slug)
- `idx_shift_templates_profession` ON (profession) WHERE is_active = true

**RLS:** Включена. Публичное чтение (SELECT для всех). Только service_role для INSERT/UPDATE/DELETE.

---

## Таблица: user_schedules

**Назначение:** Привязка пользователя к шаблону расписания с настройками повтора. Из этой конфигурации генерируются отдельные смены.
**Связана с:** auth.users, shift_templates, shifts

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK → auth.users(id) ON DELETE CASCADE |
| template_id | uuid | NULL | NULL | FK → shift_templates(id), NULL для кастомного расписания |
| name | text | NOT NULL | — | Название расписания (от шаблона или пользовательское) |
| start_date | date | NOT NULL | — | Дата начала |
| end_date | date | NOT NULL | — | Дата окончания (вычислена из repeat_weeks) |
| repeat_weeks | smallint | NOT NULL | 4 | На сколько недель повторить (2/4/6/8) |
| custom_pattern | jsonb | NULL | NULL | Кастомный паттерн (если template_id NULL) |
| is_active | boolean | NOT NULL | true | Активное расписание (одно на пользователя) |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `CHECK (end_date >= start_date)`
- `CHECK (repeat_weeks BETWEEN 1 AND 12)`

**Индексы:**
- `idx_user_schedules_user_id` ON (user_id)
- `idx_user_schedules_active` ON (user_id) WHERE is_active = true

**RLS:** Включена. Политики описаны в [RLS-POLICIES.md](./RLS-POLICIES.md).

---

## Таблица: shifts

**Назначение:** Индивидуальные смены в календаре пользователя. Генерируются из шаблона или создаются вручную.
**Связана с:** auth.users, user_schedules, sleep_plans

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK → auth.users(id) ON DELETE CASCADE |
| schedule_id | uuid | NULL | NULL | FK → user_schedules(id) ON DELETE SET NULL |
| date | date | NOT NULL | — | Дата смены |
| start_time | timestamptz | NOT NULL | — | Время начала смены |
| end_time | timestamptz | NOT NULL | — | Время конца смены |
| shift_type | text | NOT NULL | — | Тип: day, night |
| is_manual | boolean | NOT NULL | false | Ручной ввод (true) или из шаблона (false) |
| is_overtime | boolean | NOT NULL | false | Переработка |
| notes | text | NULL | NULL | Заметки пользователя |
| deleted_at | timestamptz | NULL | NULL | Мягкое удаление |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `CHECK (shift_type IN ('day', 'night'))`
- `CHECK (end_time > start_time)`

**Индексы:**
- `idx_shifts_user_date` ON (user_id, date) WHERE deleted_at IS NULL
- `idx_shifts_user_range` ON (user_id, start_time, end_time) WHERE deleted_at IS NULL
- `idx_shifts_schedule` ON (schedule_id) WHERE schedule_id IS NOT NULL

**RLS:** Включена. Политики описаны в [RLS-POLICIES.md](./RLS-POLICIES.md).

---

## Таблица: sleep_plans

**Назначение:** Сгенерированный план сна на конкретный день — оптимальное окно сна, caffeine cutoff, melatonin timing, nap.
**Связана с:** auth.users, shifts, ai_requests

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK → auth.users(id) ON DELETE CASCADE |
| shift_id | uuid | NULL | NULL | FK → shifts(id) ON DELETE SET NULL, связанная смена |
| date | date | NOT NULL | — | Дата, для которой план |
| plan_type | text | NOT NULL | — | Тип: work_day, day_off, transition |
| sleep_start | timestamptz | NOT NULL | — | Рекомендуемое начало сна |
| sleep_end | timestamptz | NOT NULL | — | Рекомендуемое окончание сна |
| sleep_duration_minutes | smallint | NOT NULL | — | Целевая длительность (мин) |
| caffeine_cutoff_at | timestamptz | NULL | NULL | Время последнего кофеина |
| melatonin_at | timestamptz | NULL | NULL | Рекомендуемое время приёма мелатонина |
| melatonin_dose_mg | numeric(3,1) | NULL | NULL | Рекомендуемая доза |
| melatonin_type | text | NULL | NULL | phase_advance или phase_delay |
| nap_start | timestamptz | NULL | NULL | Начало pre-shift nap |
| nap_end | timestamptz | NULL | NULL | Конец pre-shift nap |
| wind_down_start | timestamptz | NULL | NULL | Начало подготовки ко сну |
| explanation | text | NULL | NULL | AI-объяснение «почему такой план» |
| generation_method | text | NOT NULL | 'rule_based' | ai или rule_based |
| ai_request_id | uuid | NULL | NULL | FK → ai_requests(id), если сгенерирован AI |
| metadata | jsonb | NOT NULL | '{}' | Дополнительные данные (raw AI response и т.д.) |
| deleted_at | timestamptz | NULL | NULL | Мягкое удаление |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `CHECK (plan_type IN ('work_day', 'day_off', 'transition'))`
- `CHECK (melatonin_type IN ('phase_advance', 'phase_delay'))`
- `CHECK (generation_method IN ('ai', 'rule_based'))`
- `CHECK (sleep_duration_minutes BETWEEN 60 AND 840)`
- `UNIQUE (user_id, date) WHERE deleted_at IS NULL`

**Индексы:**
- `idx_sleep_plans_user_date` UNIQUE ON (user_id, date) WHERE deleted_at IS NULL
- `idx_sleep_plans_shift` ON (shift_id) WHERE shift_id IS NOT NULL

**RLS:** Включена. Политики описаны в [RLS-POLICIES.md](./RLS-POLICIES.md).

---

## Таблица: transition_plans

**Назначение:** Многодневный план перехода между режимами (ночь→день или день→ночь). Killer feature (F3).
**Связана с:** auth.users, transition_steps

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK → auth.users(id) ON DELETE CASCADE |
| transition_type | text | NOT NULL | — | night_to_day или day_to_night |
| start_date | date | NOT NULL | — | Первый день перехода |
| end_date | date | NOT NULL | — | Последний день перехода |
| total_days | smallint | NOT NULL | — | Количество дней (2–3) |
| total_steps | smallint | NOT NULL | — | Общее кол-во шагов |
| completed_steps | smallint | NOT NULL | 0 | Выполненных шагов |
| status | text | NOT NULL | 'active' | active, completed, abandoned |
| generation_method | text | NOT NULL | 'rule_based' | ai или rule_based |
| ai_request_id | uuid | NULL | NULL | FK → ai_requests(id) |
| deleted_at | timestamptz | NULL | NULL | Мягкое удаление |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `CHECK (transition_type IN ('night_to_day', 'day_to_night'))`
- `CHECK (status IN ('active', 'completed', 'abandoned'))`
- `CHECK (generation_method IN ('ai', 'rule_based'))`
- `CHECK (end_date >= start_date)`
- `CHECK (completed_steps <= total_steps)`
- `CHECK (total_days BETWEEN 1 AND 5)`

**Индексы:**
- `idx_transition_plans_user_status` ON (user_id, status) WHERE deleted_at IS NULL
- `idx_transition_plans_user_dates` ON (user_id, start_date, end_date) WHERE deleted_at IS NULL

**RLS:** Включена. Политики описаны в [RLS-POLICIES.md](./RLS-POLICIES.md).

---

## Таблица: transition_steps

**Назначение:** Отдельные шаги внутри плана перехода — с временами, действиями и прогрессом.
**Связана с:** transition_plans, auth.users

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| plan_id | uuid | NOT NULL | — | FK → transition_plans(id) ON DELETE CASCADE |
| user_id | uuid | NOT NULL | — | FK → auth.users(id) ON DELETE CASCADE (денормализация для RLS) |
| day_number | smallint | NOT NULL | — | День в плане (1, 2, 3) |
| step_order | smallint | NOT NULL | — | Порядок шага в рамках дня |
| scheduled_time | timestamptz | NOT NULL | — | Запланированное время |
| action_type | text | NOT NULL | — | Тип действия |
| title | text | NOT NULL | — | Заголовок: «Наденьте тёмные очки» |
| description | text | NULL | NULL | Подробное описание шага |
| explanation | text | NULL | NULL | Научное обоснование |
| is_completed | boolean | NOT NULL | false | Отмечен ли как выполненный |
| completed_at | timestamptz | NULL | NULL | Время отметки |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**action_type — допустимые значения:**
- `dark_glasses` — надеть тёмные очки
- `melatonin` — принять мелатонин
- `sleep` — лечь спать
- `wake` — проснуться / встать
- `light_seek` — искать яркий свет
- `light_avoid` — избегать яркого света
- `nap` — вздремнуть
- `custom` — пользовательский / другой

**Constraints:**
- `CHECK (action_type IN ('dark_glasses', 'melatonin', 'sleep', 'wake', 'light_seek', 'light_avoid', 'nap', 'custom'))`
- `CHECK (day_number > 0)`
- `CHECK (step_order > 0)`

**Индексы:**
- `idx_transition_steps_plan` ON (plan_id, day_number, step_order)
- `idx_transition_steps_user` ON (user_id)

**RLS:** Включена. Политики описаны в [RLS-POLICIES.md](./RLS-POLICIES.md).

---

## Таблица: sleep_streaks

**Назначение:** Трекинг серий соблюдения плана сна (sleep streak). Отображается на Home (S20) и Profile (S50).
**Связана с:** auth.users (1:1)

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK → auth.users(id) ON DELETE CASCADE, UNIQUE |
| current_streak | smallint | NOT NULL | 0 | Текущая серия (дней) |
| longest_streak | smallint | NOT NULL | 0 | Рекордная серия |
| last_streak_date | date | NULL | NULL | Последняя дата в текущей серии |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `UNIQUE (user_id)`
- `CHECK (current_streak >= 0)`
- `CHECK (longest_streak >= current_streak)`

**Индексы:**
- `idx_sleep_streaks_user_id` UNIQUE ON (user_id)

**RLS:** Включена. Политики описаны в [RLS-POLICIES.md](./RLS-POLICIES.md).

---

## Таблица: ai_requests

**Назначение:** Лог вызовов OpenAI API — для отслеживания расходов, дебага и анализа качества генерации.
**Связана с:** auth.users, sleep_plans, transition_plans

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK → auth.users(id) ON DELETE CASCADE |
| request_type | text | NOT NULL | — | sleep_plan или transition_plan |
| prompt | text | NOT NULL | — | Отправленный промпт |
| response | jsonb | NULL | NULL | Ответ от API |
| model | text | NOT NULL | — | Модель: gpt-4o-mini, gpt-4o и т.д. |
| tokens_input | integer | NOT NULL | 0 | Токены на вход |
| tokens_output | integer | NOT NULL | 0 | Токены на выход |
| cost_cents | smallint | NOT NULL | 0 | Стоимость в центах |
| duration_ms | integer | NULL | NULL | Время ответа (мс) |
| status | text | NOT NULL | — | success, error, timeout |
| error_message | text | NULL | NULL | Сообщение об ошибке |
| created_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `CHECK (request_type IN ('sleep_plan', 'transition_plan'))`
- `CHECK (status IN ('success', 'error', 'timeout'))`
- `CHECK (tokens_input >= 0)`
- `CHECK (tokens_output >= 0)`
- `CHECK (cost_cents >= 0)`

**Примечание:** Нет `updated_at` — записи иммутабельны (лог).

**Индексы:**
- `idx_ai_requests_user` ON (user_id, created_at DESC)
- `idx_ai_requests_status` ON (status, created_at DESC) WHERE status != 'success'

**RLS:** Включена. Политики описаны в [RLS-POLICIES.md](./RLS-POLICIES.md).

---

## Общие паттерны

### Timestamps
Все таблицы (кроме ai_requests) имеют `created_at` и `updated_at`. Триггер `update_updated_at()` автоматически обновляет `updated_at` при UPDATE.

### Мягкое удаление
Таблицы `shifts`, `sleep_plans`, `transition_plans` используют `deleted_at timestamptz NULL`. Все индексы и уникальные ограничения учитывают `WHERE deleted_at IS NULL`.

### JSONB-поля
- `profiles.family_commitments` — массив семейных обязательств
- `shift_templates.pattern` — определение цикла ротации
- `user_schedules.custom_pattern` — кастомное расписание
- `subscriptions.raw_data` — payload Adapty webhook
- `sleep_plans.metadata` — дополнительные данные генерации

### Primary Keys
Все PK — `uuid`, генерируются через `gen_random_uuid()`. Исключение: `profiles.id` — ссылка на `auth.users(id)`.

---

## Источники

- [FEATURES.md](../02-product/FEATURES.md) — MVP scope F1–F8
- [MONETIZATION.md](../02-product/MONETIZATION.md) — модель подписки, тиры
- [SCREEN-MAP.md](../04-ux/SCREEN-MAP.md) — карта экранов → какие данные нужны
- [USER-FLOWS.md](../04-ux/USER-FLOWS.md) — сценарии → какие операции с данными
