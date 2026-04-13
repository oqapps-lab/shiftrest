# DB Spec — ShiftRest
**Дата: 13 апреля 2026**

> Дополнительные инфраструктурные решения: Storage, Edge Functions, Realtime, Cron, масштаб, бэкапы.

---

## 1. Storage Buckets

| Bucket | Назначение | Доступ | Лимиты |
|--------|-----------|--------|--------|
| `avatars` | Аватары пользователей (профиль S50) | Публичный read, auth write (свой файл) | 2 MB / файл, jpg/png/webp |

### Политики Storage

```sql
-- avatars: публичное чтение
CREATE POLICY "Public avatar read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- avatars: пользователь загружает в свою папку (user_id/*)
CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- avatars: пользователь обновляет свой аватар
CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- avatars: пользователь удаляет свой аватар
CREATE POLICY "Users delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### Структура файлов
```
avatars/
  {user_id}/
    avatar.jpg
```

**Примечание:** Для MVP нужен только один bucket. Медиа-контент (иллюстрации онбординга, иконки) — статика в бандле приложения, не в Storage.

---

## 2. Edge Functions

### 2.1 adapty-webhook

**Назначение:** Приём и обработка webhook-событий от Adapty при изменении статуса подписки.

| Параметр | Значение |
|----------|----------|
| **Эндпоинт** | `POST /functions/v1/adapty-webhook` |
| **Авторизация** | Adapty webhook secret (header validation) |
| **Использует** | `service_role` key (обходит RLS) |
| **Обновляет** | `subscriptions` |

**Логика:**
1. Валидация webhook signature
2. Извлечение `user_id` из Adapty profile → Supabase user mapping
3. Обновление `subscriptions`: status, plan, trial_start/end, period_start/end, store
4. Сохранение `raw_data` для дебага

**События Adapty:**
- `subscription_started` → status = 'active'
- `trial_started` → status = 'trial'
- `subscription_renewed` → обновление period_start/end
- `subscription_expired` → status = 'expired'
- `subscription_cancelled` → status = 'cancelled', cancellation_date
- `trial_expired` → status = 'expired' (если не конвертировался)
- `subscription_entered_grace_period` → status = 'grace_period'

### 2.2 generate-sleep-plan

**Назначение:** Генерация плана сна — через OpenAI API (premium) или rule-based (free/fallback).

| Параметр | Значение |
|----------|----------|
| **Эндпоинт** | `POST /functions/v1/generate-sleep-plan` |
| **Авторизация** | Supabase Auth (Bearer token) |
| **Использует** | `service_role` для записи ai_requests |
| **Обновляет** | `sleep_plans`, `ai_requests` |

**Входные данные:**
```typescript
{
  date: string;           // "2026-04-15"
  shift_id?: string;      // UUID смены (null для выходных)
}
```

**Логика:**
1. Получить профиль пользователя (chronotype, caffeine, melatonin, family, commute)
2. Получить смену на дату (из `shifts`)
3. Проверить подписку (`subscriptions.status`)
4. Если premium + AI доступен → OpenAI structured output
5. Если free или AI недоступен → rule-based алгоритм
6. Validation layer: все времена проверяются rule-based правилами
7. Записать в `sleep_plans`, при AI → записать в `ai_requests`

**Стоимость AI:** $0.01–0.05/запрос (GPT-4o-mini structured output).

### 2.3 generate-transition-plan

**Назначение:** Генерация многодневного плана перехода (ночь→день или день→ночь).

| Параметр | Значение |
|----------|----------|
| **Эндпоинт** | `POST /functions/v1/generate-transition-plan` |
| **Авторизация** | Supabase Auth (Bearer token) |
| **Использует** | `service_role` для записи |
| **Обновляет** | `transition_plans`, `transition_steps`, `ai_requests` |

**Входные данные:**
```typescript
{
  transition_type: 'night_to_day' | 'day_to_night';
  start_date: string;     // "2026-04-15"
  last_shift_end: string; // ISO timestamp последней смены
}
```

**Логика:**
1. Получить профиль (все параметры)
2. Определить количество дней перехода (2–3)
3. Если premium + AI → OpenAI для персонализации
4. Если free → rule-based шаблон
5. Создать `transition_plan` + `transition_steps`
6. Учесть `family_commitments` при планировании

### 2.4 delete-user-data

**Назначение:** Полное удаление данных пользователя (GDPR / Account deletion).

| Параметр | Значение |
|----------|----------|
| **Эндпоинт** | `POST /functions/v1/delete-user-data` |
| **Авторизация** | Supabase Auth (Bearer token) |
| **Использует** | `service_role` |

**Логика:**
1. Удалить Storage объекты (avatars/{user_id}/*)
2. Удалить auth.users запись → CASCADE удаляет все данные из public.*
3. Вернуть подтверждение

---

## 3. Realtime

### Таблицы с подпиской на Realtime

| Таблица | Нужен Realtime? | Обоснование |
|---------|----------------|-------------|
| profiles | Нет | Редко обновляется, клиент читает при открытии |
| user_settings | Нет | Обновляется локально, записывается в БД |
| subscriptions | **Да** | Webhook может обновить подписку — клиент должен узнать |
| shift_templates | Нет | Статический справочник |
| user_schedules | Нет | Обновляется пользователем, не внешними агентами |
| shifts | Нет | Обновляется пользователем |
| sleep_plans | Нет | Генерируется по запросу, клиент ждёт ответа |
| transition_plans | Нет | Аналогично |
| transition_steps | Нет | Обновляется пользователем (checklist) |
| sleep_streaks | Нет | Обновляется при действии пользователя |
| ai_requests | Нет | Лог, не нужен в реальном времени |

**Итого:** Realtime только для `subscriptions` — чтобы клиент моментально отобразил premium-статус после покупки через App Store.

```sql
-- Включение Realtime для subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
```

---

## 4. Cron Jobs (pg_cron)

### 4.1 Очистка мягко удалённых записей

```sql
-- Раз в неделю: удаление записей с deleted_at > 30 дней назад
SELECT cron.schedule(
  'cleanup-soft-deleted',
  '0 3 * * 0', -- каждое воскресенье в 3:00 UTC
  $$
    DELETE FROM public.shifts WHERE deleted_at < now() - interval '30 days';
    DELETE FROM public.sleep_plans WHERE deleted_at < now() - interval '30 days';
    DELETE FROM public.transition_plans WHERE deleted_at < now() - interval '30 days';
  $$
);
```

### 4.2 Очистка старых AI-логов

```sql
-- Раз в месяц: удаление ai_requests старше 90 дней
SELECT cron.schedule(
  'cleanup-ai-logs',
  '0 4 1 * *', -- 1-е число каждого месяца в 4:00 UTC
  $$
    DELETE FROM public.ai_requests WHERE created_at < now() - interval '90 days';
  $$
);
```

### 4.3 Обнуление просроченных стриков

```sql
-- Ежедневно: если last_streak_date < yesterday, обнулить current_streak
SELECT cron.schedule(
  'reset-expired-streaks',
  '0 6 * * *', -- каждый день в 6:00 UTC
  $$
    UPDATE public.sleep_streaks
    SET current_streak = 0, updated_at = now()
    WHERE last_streak_date < (now() AT TIME ZONE 'UTC')::date - interval '1 day'
      AND current_streak > 0;
  $$
);
```

---

## 5. Estimated Scale

### Year 1 (базовый сценарий)

| Метрика | Значение | Обоснование |
|---------|----------|-------------|
| **Пользователей** | 85K downloads → ~5K paid | [MONETIZATION.md](../02-product/MONETIZATION.md) |
| **DAU** | ~3K | 40% D30 retention от paid |
| **Записей profiles** | 85K | 1:1 с пользователями |
| **Записей shifts** | ~2.5M | ~85K users × ~30 shifts/мес (из шаблонов) |
| **Записей sleep_plans** | ~1.5M | ~50K active users × 30 дней/мес |
| **Записей transition_plans** | ~200K | ~50K users × 4 перехода/мес |
| **Записей transition_steps** | ~1.4M | ~200K plans × 7 steps avg |
| **Записей ai_requests** | ~500K | ~5K premium × ~10 запросов/мес × 10 мес |

### Размер данных (Year 1)

| Таблица | Средний размер строки | Строк | Размер |
|---------|----------------------|-------|--------|
| profiles | ~500 B | 85K | ~42 MB |
| shifts | ~200 B | 2.5M | ~500 MB |
| sleep_plans | ~400 B | 1.5M | ~600 MB |
| transition_steps | ~300 B | 1.4M | ~420 MB |
| ai_requests | ~2 KB (из-за prompt/response) | 500K | ~1 GB |
| Остальные | — | — | ~100 MB |
| **Итого** | | | **~2.7 GB** |

### Supabase Plan

**Year 1: Pro plan ($25/мес)** — достаточен:
- 8 GB БД
- 250 GB bandwidth
- 100K MAU на Auth
- 5 GB Storage
- Edge Functions: 2M вызовов

**Year 2: Pro plan** — мониторить, при >50K paid возможен переход на Team ($599/мес).

---

## 6. Backup Strategy

### Supabase Built-in

| Параметр | Pro Plan |
|----------|---------|
| **Автоматические бэкапы** | Ежедневные (7 дней хранения) |
| **Point-in-Time Recovery** | Да (до 7 дней, по минутам) |
| **Частота** | Каждые 24 часа + WAL archiving |

### Дополнительные меры

1. **Критические миграции:** Перед миграциями — ручной snapshot через Supabase Dashboard
2. **Seed-данные:** Shift templates хранятся в коде (миграция 008), восстанавливаемы из git
3. **User-данные:** PITR покрывает все сценарии восстановления
4. **Мониторинг:** Supabase Dashboard + pg_stat_statements для slow queries

### RTO/RPO

| Метрика | Значение |
|---------|----------|
| **RPO (Recovery Point Objective)** | ~1 минута (WAL streaming) |
| **RTO (Recovery Time Objective)** | ~5–15 минут (PITR restore) |

---

## 7. Безопасность

### Ключи

| Ключ | Где используется | Доступ |
|------|-----------------|--------|
| `SUPABASE_ANON_KEY` | Клиент (Expo app) | Публичный, ограничен RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions | Секретный, обходит RLS |
| `OPENAI_API_KEY` | Edge Function `generate-*` | Секретный |
| `ADAPTY_WEBHOOK_SECRET` | Edge Function `adapty-webhook` | Секретный |

### Хранение секретов

```bash
# Supabase Edge Function secrets
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set ADAPTY_WEBHOOK_SECRET=whsec_...
```

### Row Level Security

- RLS включена на **всех 11 таблицах** — без исключений
- `anon_key` + RLS = пользователь видит только свои данные
- `service_role` обходит RLS — используется только в серверных Edge Functions
- Нет прямого доступа к БД из клиента без RLS

---

## 8. Производительность

### Ключевые запросы и их оптимизация

| Запрос | Частота | Индекс |
|--------|---------|--------|
| Смены пользователя на месяц | Каждое открытие Schedule | `idx_shifts_user_date` |
| План сна на сегодня | Каждое открытие Home | `idx_sleep_plans_user_date_unique` |
| Активный transition plan | При обнаружении перехода | `idx_transition_plans_user_status` |
| Шаги transition по плану | Открытие Transition Plan | `idx_transition_steps_plan` |
| Текущая подписка | Каждый запрос | `UNIQUE(user_id)` на subscriptions |
| Шаблоны ротаций | Онбординг + Template Picker | `idx_shift_templates_profession` |

### Connection Pooling

Supabase Pro plan включает PgBouncer (connection pooling). Expo-клиент использует `supabase-js` с auto-reconnect — дополнительная настройка не нужна.

---

## 9. Миграция данных при обновлениях

### Анонимный → зарегистрированный пользователь

Supabase Auth `linkIdentity()` мержит anonymous user с email/apple/google аккаунтом. Данные остаются на том же `user_id` — миграция не нужна.

### v1.0 → v1.1 (Should Have features)

Потенциальные новые таблицы для v1.1:
- `sleep_logs` — фактические данные сна (F11 Sleep History, F12 HealthKit)
- `sleep_scores` — расчёт Sleep Score (F9)

Эти таблицы добавляются новой миграцией без изменения существующих.

---

## Источники

- [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md) — полная схема
- [MONETIZATION.md](../02-product/MONETIZATION.md) — прогнозы масштаба, тиры
- [FEATURES.md](../02-product/FEATURES.md) — MVP vs v1.1 scope
- [USER-FLOWS.md](../04-ux/USER-FLOWS.md) — потоки данных, Edge Function триггеры
