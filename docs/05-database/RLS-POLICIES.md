# RLS Policies — ShiftRest
**Дата: 13 апреля 2026**

> Все политики применяются после `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
> По умолчанию: пользователь видит и изменяет только свои данные (`auth.uid() = user_id`).

---

## Таблица: profiles

### SELECT
Пользователь видит только свой профиль.
```sql
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);
```

### UPDATE
Пользователь может обновлять только свой профиль.
```sql
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### INSERT
Профиль создаётся автоматически через триггер `on_auth_user_created`. Прямой INSERT от клиента не нужен, но разрешён для своего ID (на случай race condition).
```sql
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### DELETE
Запрещён. Удаление профиля — через удаление auth.users (CASCADE).

---

## Таблица: user_settings

### SELECT
```sql
CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);
```

### INSERT
```sql
CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### UPDATE
```sql
CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### DELETE
Запрещён. Настройки привязаны к пользователю на всё время жизни аккаунта.

---

## Таблица: subscriptions

### SELECT
Пользователь видит только свою подписку.
```sql
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

### INSERT
Подписка создаётся через Edge Function (Adapty webhook) с `service_role`. Клиентский INSERT для инициализации записи.
```sql
CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### UPDATE
Обновление только через Adapty webhook (service_role). Клиенту запрещено напрямую изменять подписку.

**Примечание:** Edge Function для Adapty webhook использует `service_role` key, который обходит RLS. Это позволяет webhook'у обновлять подписку любого пользователя.

---

## Таблица: shift_templates

### SELECT
Публичное чтение — все пользователи видят все активные шаблоны.
```sql
CREATE POLICY "Anyone can read active templates"
  ON public.shift_templates FOR SELECT
  USING (is_active = true);
```

### INSERT / UPDATE / DELETE
Управление только через service_role (миграции, admin). Клиентские политики не создаются.

---

## Таблица: user_schedules

### SELECT
```sql
CREATE POLICY "Users can view own schedules"
  ON public.user_schedules FOR SELECT
  USING (auth.uid() = user_id);
```

### INSERT
```sql
CREATE POLICY "Users can insert own schedules"
  ON public.user_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### UPDATE
```sql
CREATE POLICY "Users can update own schedules"
  ON public.user_schedules FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### DELETE
```sql
CREATE POLICY "Users can delete own schedules"
  ON public.user_schedules FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Таблица: shifts

### SELECT
```sql
CREATE POLICY "Users can view own shifts"
  ON public.shifts FOR SELECT
  USING (auth.uid() = user_id);
```

### INSERT
```sql
CREATE POLICY "Users can insert own shifts"
  ON public.shifts FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### UPDATE
```sql
CREATE POLICY "Users can update own shifts"
  ON public.shifts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### DELETE
Мягкое удаление через UPDATE (set deleted_at). Физический DELETE тоже разрешён (для очистки).
```sql
CREATE POLICY "Users can delete own shifts"
  ON public.shifts FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Таблица: sleep_plans

### SELECT
```sql
CREATE POLICY "Users can view own sleep plans"
  ON public.sleep_plans FOR SELECT
  USING (auth.uid() = user_id);
```

### INSERT
Планы создаются через Edge Function (AI или rule-based) с service_role, но клиент тоже может создавать (fallback rule-based на устройстве).
```sql
CREATE POLICY "Users can insert own sleep plans"
  ON public.sleep_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### UPDATE
```sql
CREATE POLICY "Users can update own sleep plans"
  ON public.sleep_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### DELETE
```sql
CREATE POLICY "Users can delete own sleep plans"
  ON public.sleep_plans FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Таблица: transition_plans

### SELECT
Базовый план доступен всем. Полный plan (с AI-персонализацией) — только premium.

**Free пользователи** видят свои планы (контент ограничивается на уровне приложения, не RLS — чтобы кэшированные планы trial-периода оставались читаемыми).
```sql
CREATE POLICY "Users can view own transition plans"
  ON public.transition_plans FOR SELECT
  USING (auth.uid() = user_id);
```

### INSERT
```sql
CREATE POLICY "Users can insert own transition plans"
  ON public.transition_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### UPDATE
Для отметки статуса (completed/abandoned) и обновления completed_steps.
```sql
CREATE POLICY "Users can update own transition plans"
  ON public.transition_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### DELETE
```sql
CREATE POLICY "Users can delete own transition plans"
  ON public.transition_plans FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Таблица: transition_steps

### SELECT
```sql
CREATE POLICY "Users can view own transition steps"
  ON public.transition_steps FOR SELECT
  USING (auth.uid() = user_id);
```

### INSERT
```sql
CREATE POLICY "Users can insert own transition steps"
  ON public.transition_steps FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### UPDATE
Для отметки is_completed и completed_at.
```sql
CREATE POLICY "Users can update own transition steps"
  ON public.transition_steps FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### DELETE
```sql
CREATE POLICY "Users can delete own transition steps"
  ON public.transition_steps FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Таблица: sleep_streaks

### SELECT
```sql
CREATE POLICY "Users can view own streaks"
  ON public.sleep_streaks FOR SELECT
  USING (auth.uid() = user_id);
```

### INSERT
```sql
CREATE POLICY "Users can insert own streaks"
  ON public.sleep_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### UPDATE
```sql
CREATE POLICY "Users can update own streaks"
  ON public.sleep_streaks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### DELETE
Запрещён. Streak-данные не удаляются.

---

## Таблица: ai_requests

### SELECT
Пользователь может видеть свои запросы (для отладки, «почему такой план»).
```sql
CREATE POLICY "Users can view own ai requests"
  ON public.ai_requests FOR SELECT
  USING (auth.uid() = user_id);
```

### INSERT
Создаётся через Edge Function (service_role). Клиентский INSERT запрещён.

### UPDATE / DELETE
Запрещены. Лог иммутабелен.

---

## Сводная таблица политик

| Таблица | SELECT | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|--------|
| profiles | own (id) | own (id) | own (id) | — |
| user_settings | own | own | own | — |
| subscriptions | own | own | — (service_role) | — |
| shift_templates | public (is_active) | — (service_role) | — (service_role) | — (service_role) |
| user_schedules | own | own | own | own |
| shifts | own | own | own | own |
| sleep_plans | own | own | own | own |
| transition_plans | own | own | own | own |
| transition_steps | own | own | own | own |
| sleep_streaks | own | own | own | — |
| ai_requests | own | — (service_role) | — | — |

**own** = `auth.uid() = user_id` (или `= id` для profiles)
**public** = доступно всем аутентифицированным пользователям
**—** = нет клиентской политики (только service_role)

---

## Важные примечания

### Premium-контент
Ограничение доступа к premium-фичам (Transition Plan, Melatonin, AI) реализовано **на уровне приложения**, а не RLS. Причины:
1. Данные trial-периода должны оставаться читаемыми после окончания trial (кэш)
2. Гибкость: paywall-логика меняется чаще, чем RLS-политики
3. Adapty SDK на клиенте — источник истины для paywall state

### Service Role
Edge Functions (Adapty webhook, AI generation) используют `SUPABASE_SERVICE_ROLE_KEY`, который обходит RLS. Это необходимо для:
- Обновления subscriptions по webhook от Adapty
- Записи ai_requests из Edge Function
- Массовой генерации sleep_plans

### Анонимные пользователи
Supabase Auth поддерживает anonymous sign-in. Анонимный пользователь получает `auth.uid()` и может:
- Пройти онбординг и сохранить профиль
- Создать расписание и получить базовый план
- При регистрации (email/apple/google) данные мигрируют на постоянный аккаунт

---

## Источники

- [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md) — таблицы и колонки
- [MONETIZATION.md](../02-product/MONETIZATION.md) — free vs premium разграничение
- [USER-FLOWS.md](../04-ux/USER-FLOWS.md) — какие операции выполняет пользователь
