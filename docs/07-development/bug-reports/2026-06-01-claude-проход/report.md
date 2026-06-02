# ShiftRest — Проверка фиксов (smoke-test)
**Дата:** 2026-06-01  
**Ветка:** NeverLandST  
**Последний коммит:** 3c1fca7 Merge branch 'main' into NeverLandST  
**Цель:** Подтвердить, что 5 багов из MASTER-REPORT закрыты после обновления main

---

## Итог: все 5 фиксов подтверждены ✅

---

## Результаты

### B06 — Кнопка "Restart onboarding (dev)" видна всем пользователям ✅ ПОЧИНЕНО
**Проверка:** Profile → прокрутить настройки до конца  
**Факт:** Кнопки нет. Список настроек заканчивается на "About & support".  
**Скриншот:** screenshots/23-profile-scroll.png

---

### B13 — Доза мелатонина не выделена по умолчанию ✅ ПОЧИНЕНО
**Проверка:** Онбординг шаг 9 → "Yes, I take it" → раздел DOSE (MG)  
**Факт:** Кнопка 0.5 выделена тёмным цветом сразу после включения тоггла — без дополнительного тапа.  
**Скриншот:** screenshots/11b-onboarding-s09-toggle.png

---

### B14 — Тип смены "Night" не меняет время начала и конца ✅ ПОЧИНЕНО
**Проверка:** Schedule → "+ Add shift" → SHIFT TYPE → Night  
**Факт:** При выборе Night время автоматически меняется: STARTS 19:00, ENDS 07:00 следующего дня. SUMMARY: 19:00 → 2 Jun · 07:00.  
**Скриншот:** screenshots/27-addshift-night.png

---

### B19 — У нового пользователя сразу статистика как у опытного ✅ ПОЧИНЕНО
**Проверка:** Profile → блок со статистикой после первого онбординга  
**Факт:** DAYS: 0, JOURNAL: 0, ON PLAN: 0%. Подпись "Your first plan unlocks these numbers."  
**Скриншот:** screenshots/22-profile.png

---

### B20 — Лишняя точка после "Nurse · 3×12." в профиле ✅ ПОЧИНЕНО
**Проверка:** Profile → Sleep preferences → Profession → Nurse · 3×12 → вернуться на Profile  
**Факт:** Под именем отображается "Nurse · 3×12" — без точки в конце.  
**Скриншот:** screenshots/28-profile-nurse-top.png

---

## Папка скриншотов
`docs/07-development/bug-reports/2026-06-01-claude-проход/screenshots/`
