# Баг-репорт — 28 мая 2026 (security-audit)

**Дата:** 2026-05-28  
**Метод:** security-audit-toolkit — npm audit, secret detection, .gitignore check  
**Ветка:** main (после pull `7890767`)  
**Тестировал:** Claude (automated security scan)  
**Фокус:** секреты в git-истории, уязвимости зависимостей

---

## Итог

| # | Баг | Файл | Приоритет |
|---|-----|------|-----------|
| SH1 | Firebase GoogleService-Info.plist в git-трекинге | `GoogleService-Info.plist` | HIGH |

---

## SH1: Firebase GoogleService-Info.plist в git-трекинге

**Где:** `GoogleService-Info.plist` (ios/)  
**Что вижу:**

Файл с Firebase конфигурацией для iOS (`GOOGLE_APP_ID`, `GCM_SENDER_ID`, `API_KEY`) зафиксирован в git.

**Как должно быть:**

- Добавить в `.gitignore`:
  ```
  GoogleService-Info.plist
  ios/GoogleService-Info.plist
  ```
- Подгружать через CI/CD secret file (EAS secret file или Codemagic)
- Ограничить Firebase API key по bundle ID в Firebase Console → App restrictions

**Приоритет:** HIGH  
Файл в git-истории — нужна очистка: `git filter-repo --path GoogleService-Info.plist --invert-paths`.  
Firebase API key без bundle ID restriction позволяет злоупотреблять FCM-квотами.

---

## Зависимости (npm audit)

| Уровень | Пакет | Описание |
|---------|-------|----------|
| MODERATE | postcss | XSS через crafted CSS |
| MODERATE | uuid | bounds check |
| MODERATE | ws | memory disclosure |
| MODERATE | brace-expansion | DoS |

Нет CRITICAL/HIGH уязвимостей в зависимостях.
