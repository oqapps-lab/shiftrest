# Smoke-test — Проход 2 (Универсальный)
**Дата:** 2026-05-27  
**Ветка:** NeverLandST (после merge main dc1b461)  
**Промт:** smoke-test универсальный.txt  
**Устройство:** Pixel 8 эмулятор (emulator-5554)

---

## Новые баги

B27: Диалог "Edit this shift?" не предлагает редактирование — только удаление
Где: Schedule → тап на день с уже добавленной сменой (например 27 мая)
Что вижу: Открывается диалог с заголовком "Edit this shift?" и текстом "Tap Delete to remove the shift on 2026-05-27". Есть только кнопки CANCEL и DELETE. Нет никакой возможности изменить смену — только удалить её.
Как должно быть: Если заголовок называется "Edit", должна быть возможность отредактировать время, тип или дату смены. Либо заголовок нужно поменять на "Remove this shift?" чтобы он соответствовал тому, что реально происходит.
Скриншот: screenshots/07-tap-day27.png
Приоритет: MEDIUM

---

## Подтверждённые старые баги

H3: «App Store» вместо «Google Play» на Android — **ПОДТВЕРЖДЁН**
Где: Profile → Subscription — внизу экрана мелким текстом
Что вижу: "Cancel any time from your App Store account." — написано «App Store» хотя устройство Android.
Скриншот: screenshots/03-subscription.png
Приоритет: HIGH (как и раньше)

---

## Проверка — что работает нормально

| Элемент | Результат |
|---------|-----------|
| TODAY'S SHIFT (Day / Night / Off day) | ✅ Все три кнопки переключаются |
| HOW DID YOU SLEEP (GREAT / OK / ROUGH) | ✅ Выбор сохраняется, метка меняется на "TODAY · LOGGED" |
| Sleep Plan → YESTERDAY / TODAY / TOMORROW | ✅ Переключение работает, контент меняется |
| Add shift → закрытие через X | ✅ Модал закрывается |
| Settings → About & support | ✅ Все пункты видны, версия 0.1.0 |
| Settings → Subscription | ✅ Экран открывается, показывает Free tier |
| Profile stats (DAYS / JOURNAL / ON PLAN) | ✅ Показывает 0 корректно, не тапаются (ожидаемо без плана) |

---

## Что не проверено

- ❌ History экран (app/history.tsx) — не найдена точка входа в приложении
- ❌ Онбординг (не сбрасывался чтобы не терять данные теста)
- ❌ transition.tsx (старый модал B22/B23) — не воспроизвёлся
- ❌ Paywall экран
- ❌ "Save your account" flow (требует email/регистрацию)
