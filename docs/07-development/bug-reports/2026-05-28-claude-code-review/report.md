# Баг-репорт — 28 мая 2026 (code-review)

**Дата:** 2026-05-28  
**Метод:** code-review SKILL — 5 измерений (Security, Performance, Correctness, Maintainability, Testing)  
**Ветка:** main (коммит `fc49138` +21 тесты, calendar import)  
**Тестировал:** Claude (automated code review)  
**Фокус:** calendar import (`app/schedule/import.tsx`), новые тесты (`__tests__/`)

---

## Итог

| # | Баг | Файл:Строка | Приоритет |
|---|-----|------------|-----------|
| SR1 | All-day `off` события тихо теряются в авторизованном импорте | `app/schedule/import.tsx:86` | MAJOR |
| SR2 | Нет защиты от дублей при повторном импорте | `app/schedule/import.tsx:101` | MAJOR |
| SR3 | `expect(true).toBe(true)` — placeholder без реальной проверки | `__tests__/local-transition.test.ts:82` | MINOR |
| SR4 | Тест `stores the plan` без единого `expect` | `__tests__/local-transition.test.ts:41` | MINOR |
| SR5 | Mock chain не сбрасывается между тестами — хрупкая изоляция | `__tests__/apply-template-signed.test.ts:17` | MINOR |

> B27 — см. отдельный отчёт `2026-05-28-claude-код-аудит/report.md`

---

## SR1: All-day `off` события тихо теряются в авторизованном импорте

**Где:** `app/schedule/import.tsx`, строка 86  
**Что вижу:**

```ts
const inserts = events
  .filter((e) => e.shiftType !== 'off' || e.startTime) // ← keep off as off
  .map(...)
```

Логика: `e.shiftType !== 'off'` — `false` для off-событий. `false || null` — falsy. Все all-day off-события (vacation, holiday — у которых `startTime = null`) вырезаются до вставки в Supabase. В анонимном пути (строки 71–73) они проходят нормально через `setLocalShift`. Комментарий «keep off as off» противоречит поведению.

Сценарий: пользователь импортирует Google Calendar c «Vacation» (all-day event, без времени). `classifyShiftType('Vacation')` → `'off'`, `startTime = null`. Событие тихо выпадает из импорта только у авторизованных пользователей.

**Как должно быть:**

Убрать фильтр. Для `off` all-day событий использовать `00:00–23:59` как временные рамки:

```ts
const inserts = events.map((e) => ({
  user_id: user!.id,
  date: e.date,
  start_time: new Date(e.date + 'T' + (e.startTime ?? '00:00') + ':00').toISOString(),
  end_time: new Date(e.date + 'T' + (e.endTime ?? '23:59') + ':00').toISOString(),
  shift_type: e.shiftType,
  is_manual: false,
  notes: e.summary || null,
}));
```

**Приоритет:** MAJOR — данные пользователя тихо теряются без ошибки и без уведомления.

---

## SR2: Нет защиты от дублей при повторном импорте

**Где:** `app/schedule/import.tsx`, строка 101  
**Что вижу:**

```ts
const { error } = await supabase!.from('shifts').insert(inserts);
```

`applyScheduleTemplate` перед вставкой делает `SELECT` существующих дат и отфильтровывает их. В `CalendarImport.onImport` такого шага нет. Если пользователь нажмёт «Import» дважды, строки задублируются в БД.

**Как должно быть:**

Использовать `upsert` с `onConflict`:

```ts
const { error } = await supabase!
  .from('shifts')
  .upsert(inserts, { onConflict: 'user_id,date' });
```

Или добавить pre-fetch аналогично `apply-template.ts:76–86`:

```ts
const { data: existing } = await supabase!
  .from('shifts')
  .select('date')
  .eq('user_id', user!.id)
  .in('date', inserts.map(i => i.date))
  .is('deleted_at', null);
const existingDates = new Set((existing ?? []).map(r => r.date));
const newInserts = inserts.filter(i => !existingDates.has(i.date));
```

**Приоритет:** MAJOR — дублирование данных в БД при обычном пользовательском сценарии.

---

## SR3: Placeholder assertion `expect(true).toBe(true)`

**Где:** `__tests__/local-transition.test.ts`, строка 82  
**Что вижу:**

```ts
test('multiple toggles on same step flip state back and forth', () => {
  toggleLocalTransitionStep('s1');
  toggleLocalTransitionStep('s1');
  toggleLocalTransitionStep('s1');
  expect(true).toBe(true); // ← не проверяет реальный результат
});
```

Если `toggleLocalTransitionStep` сломается так, что перестанет переключать, тест всё равно пройдёт.

**Как должно быть:**

```ts
const after3 = getLocalTransitionPlan();
expect(after3?.steps.find(s => s.id === 's1')?.is_completed).toBe(true);
```

**Приоритет:** MINOR

---

## SR4: Тест `stores the plan` без единого `expect`

**Где:** `__tests__/local-transition.test.ts`, строки 41–50  
**Что вижу:**

```ts
test('stores the plan', () => {
  const plan = makePlan();
  setLocalTransitionPlan(plan);
  toggleLocalTransitionStep('s1');
  toggleLocalTransitionStep('s2');
  // нет ни одного expect()
});
```

Если `setLocalTransitionPlan` станет no-op, тест пройдёт без ошибок.

**Как должно быть:** добавить проверку сохранённого состояния или явно переименовать в smoke-тест.

**Приоритет:** MINOR

---

## SR5: Mock chain не сбрасывается между тестами

**Где:** `__tests__/apply-template-signed.test.ts`, строки 17–29  
**Что вижу:**

```ts
beforeEach(() => {
  lastInsertPayload = [];
  nextSelectReturn = { data: [] };
  nextInsertError = null;
  // mockChain.select/eq/insert и т.д. НЕ сбрасываются
});
```

`jest.fn()` объекты накапливают `.mock.calls` через все тесты. Любой будущий `expect(mockChain.insert).toHaveBeenCalledTimes(1)` упадёт без явной причины.

**Как должно быть:**

```ts
beforeEach(() => {
  lastInsertPayload = [];
  nextSelectReturn = { data: [] };
  nextInsertError = null;
  jest.clearAllMocks(); // сбрасывает call history всех jest.fn()
});
```

**Приоритет:** MINOR — не ломает текущие тесты, но создаёт хрупкость при расширении.
