# Баг-репорт — Проход 2 (26 мая 2026)

**Автор:** Claude (автоматический проход)  
**Дата:** 26 мая 2026  
**Устройство:** Android Emulator Pixel 8 (emulator-5554)  
**Ветка:** NeverLandST  

---

## Итог прохода

Проход 2 использовал исправленный скрипт `take_screenshots_p2.ps1`. Скриншоты 01–04 получены корректно. На скриншоте 04 модальное окно Transition открылось — но кнопка × не была нажата правильно (координата 80,200 не совпадает с реальной позицией кнопки). Окно осталось открытым до конца прохода. Параллельно возникла критическая ошибка в transition.tsx — бесконечный цикл setState, который показал ошибку на весь экран.

**Покрытие:**
| Скриншоты | Статус | Что показывают |
|-----------|--------|----------------|
| 01–03 | ✅ Валидные | Вкладка Today |
| 04 | ✅ Валидный | Transition modal (открыт) |
| 05–10 | ❌ Невалидные | Transition modal завис, не закрылся |
| 11–12 | ❌ Невалидные | Console Error на весь экран |
| 13–23 | ❌ Невалидные | Transition modal + тост с ошибкой поверх всего |
| 24–27 | ❌ Невалидные | Full-screen Console Error dialog (развёрнут) |

---

## Новые баги, зафиксированные в этом проходе

---

### B22 — Бесконечный цикл в transition.tsx: Console Error "Maximum update depth exceeded"

**Где:** Вкладка Today → плашка TRANSITION IN PROGRESS → открыть модальное окно → оставить открытым ~10 секунд

**Что вижу:**  
Через несколько секунд после открытия модального окна Transition появляется красный тост внизу экрана:  
> Maximum update depth exceeded. This can ha...  

При нажатии на тост или при следующем взаимодействии с экраном разворачивается окно Console Error на весь экран:  
> **Console Error**  
> Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.

Call Stack показывает:
- `useEffect$argument_0` — файл `transition.tsx`
- `dispatchSetStateInternal`
- `dispatchSetState`
- Далее: `commitPassiveMountOnFiber` и `recursivelyTraversePassiveMountEffects` — тысячи раз подряд (бесконечный цикл)

**Как должно быть:**  
Никаких ошибок. Модальное окно Transition должно открываться и закрываться без ошибок в консоли.

**Скриншоты:**
- `11-sleep-plan.png` — первый раз Console Error на весь экран
- `24-paywall.png` — развёрнутый Console Error с первой частью call stack
- `25-paywall-scroll1.png` — call stack прокручен: `useEffect$argument_0` → `transition.tsx`
- `26-paywall-scroll2.png` — call stack: бесконечный `commitPassiveMountOnFiber` / `recursivelyTraversePassiveMountEffects`

**Приоритет:** HIGH

---

### B23 — Transition modal показывает неверные/устаревшие даты

**Где:** Вкладка Today → плашка TRANSITION IN PROGRESS → открыть модальное окно

**Что вижу:**  
В заголовках дней написано:  
- DAY 1 · **WED 22**  
- DAY 2 · **THU 23**  

Сегодня 26 мая 2026 (вторник). Числа 22 и 23 — это прошлые даты (22 мая 2026 был пятницей, не средой). Ни число, ни день недели не соответствуют реальной дате.

**Как должно быть:**  
Даты в Transition modal должны отражать реальные даты смены пользователя — динамически, не хардкодом.

**Скриншот:** `04-transition-modal-open.png`

**Приоритет:** MEDIUM

---

## Известные баги, подтверждены повторно

- **F1 / TRANSITION IN PROGRESS** — плашка с фиксированным текстом внизу Today (скриншот 03, полоса снизу)
- **B10** — значок "14 DAYS" в шапке (скриншот 01)

---

## Проблема скрипта (причина незакрытого модала)

В скрипте `take_screenshots_p2.ps1` закрытие модального окна прописано как `Tap 80 200`. Реальная кнопка × находится в правом верхнем углу модала, приблизительно на координатах **880, 80** (в оригинальных 1080×2400). Нажатие в точку 80,200 попало в пустую зону — модал остался открытым.

**Эффект:**  
- Скриншоты 05–23: модал виден поверх всех экранов
- Скриншоты 24–27: Console Error dialog развёрнут на весь экран — нажатие на тост в точке ~870,110 попало на кнопку × самого тоста, что раскрыло полный dialog

**Исправление для следующего прохода:**  
Заменить `Tap 80 200` на `Tap 880 80` для закрытия Transition modal.
