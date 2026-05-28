# Баг-репорт — 28 мая 2026 (код-аудит)

**Дата:** 2026-05-28  
**Метод:** grep-аудит кода по playbook `ui-qa/playbooks/05-code-pattern-bug-hunt.md`  
**Ветка:** main (после pull `9612bea`)  
**Тестировал:** Claude (code-pattern audit)  
**Фокус:** новые файлы из последнего мержа (F11–F19) + полный проход по anti-patterns

---

## Итог

| # | Баг | Файл | Приоритет |
|---|-----|------|-----------|
| B27 | Hardcoded day numbers in mock transition plan | `mock/user.ts:62,71` | MEDIUM |

---

## B27: Hardcoded day numbers в mock-плане перехода

**Где:** `mock/user.ts`, строки 62 и 71  
**Что вижу:**

```typescript
label: `${(t('date.weekdays_short') as any)[3] ?? 'WED'} 22`,
// ...
label: `${(t('date.weekdays_short') as any)[4] ?? 'THU'} 23`,
```

Mock transition plan всегда показывает даты «WED 22» / «THU 23» (то есть 22–23 мая), независимо от текущей даты. Сегодня 28 мая (четверг) — mock говорит «четверг 23-е», разрыв 5 дней. Паттерн B23 из `playbooks/05-code-pattern-bug-hunt.md`.

Дополнительно: `(t('date.weekdays_short') as any)[3]` — `as any` обходит типизацию. Если i18n изменит структуру ключа `date.weekdays_short`, получим `undefined` и показ fallback `'WED'` / `'THU'`, скрывающего реальную проблему.

**Как должно быть:**  
Числа дней (`22`, `23`) должны вычисляться относительно `new Date()`. Например:

```typescript
import { formatRelativeDay } from '../lib/date-utils';
// day 0 = today, day 1 = tomorrow
label: `${weekdayShort(0)} ${dayOfMonth(0)}`,
```

**Приоритет:** MEDIUM  
Пользователь с активным mock-планом перехода всегда видит «план из прошлой недели» вместо текущего.

---

## Проверка новых файлов (F11–F19)

| Файл | Проверено | Находки |
|------|-----------|---------|
| `app/history.tsx` | ✅ grep пройден | нет багов |
| `app/schedule/import.tsx` | ✅ grep пройден | нет багов |
| `app/settings/health.tsx` | ✅ grep пройден | нет багов |
| `components/ui/PlanUpdatedBanner.tsx` | ✅ grep пройден | module-level listener — intentional по комментарию; не баг |
| `lib/calendar-import/parse.ts` | ✅ grep пройден | нет багов |

---

## Что не проверено

- Живое тестирование на симуляторе/устройстве (требует macOS + mobilecli)
- Тесты `__tests__/calendar-import.test.ts` — добавлены в этом мерже, прогон не выполнялся
