# Баг-репорт — 29 мая 2026 (new-bugs)

**Дата:** 2026-05-29  
**Метод:** Targeted grep pass — non-atomic writes, race conditions  
**Ветка:** main  
**Тестировал:** Claude (automated)

---

## Итог

| # | Баг | Файл:Строка | Приоритет |
|---|-----|------------|-----------|
| SR-N1 | Неатомарная запись plan + steps — при ошибке вставки steps план остаётся осиротевшим в БД | `app/transition-create.tsx:100-131` | MEDIUM |

---

## SR-N1: Неатомарная запись план + шаги

**Где:** `app/transition-create.tsx`, строки 100–131  
**Что вижу:**

```ts
// ~строка 100: вставка плана
const { data: plan, error: planErr } = await supabase
  .from('transition_plans')
  .insert({ user_id: session.user.id, ... })
  .select()
  .single();

if (planErr) throw planErr;  // если упало здесь — ок, ничего не записано

// ~строка 130: вставка шагов в отдельном запросе
const { error: stepErr } = await supabase
  .from('transition_steps')
  .insert(steps.map(s => ({ plan_id: plan.id, ... })));

if (stepErr) throw stepErr;  // если упало здесь — план в БД ЕСТЬ, шагов НЕТ
```

Если `stepErr` при вставке шагов: план создан в `transition_plans` (с валидным `id`), но без единого шага в `transition_steps`. Пользователь видит ошибку и пробует снова — создаётся второй план. В результате в БД накапливаются осиротевшие планы без шагов.

**Как должно быть:**

Обернуть в RPC с `SECURITY DEFINER` и единой транзакцией, или использовать Supabase `rpc()` вызов который выполнит INSERT обоих таблиц атомарно:

```sql
CREATE OR REPLACE FUNCTION create_transition_plan(
  p_user_id uuid, p_plan jsonb, p_steps jsonb[]
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_plan_id uuid;
BEGIN
  INSERT INTO transition_plans (...) VALUES (...) RETURNING id INTO v_plan_id;
  INSERT INTO transition_steps (plan_id, ...) SELECT v_plan_id, ... FROM unnest(p_steps) s;
  RETURN v_plan_id;
END;
$$;
```

Минимальный фикс на клиенте — добавить DELETE плана при ошибке шагов:

```ts
if (stepErr) {
  await supabase.from('transition_plans').delete().eq('id', plan.id);
  throw stepErr;
}
```

**Приоритет:** MEDIUM
