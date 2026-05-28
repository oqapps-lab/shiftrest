# Баг-репорт — 28 мая 2026 (back-nav-audit)

**Дата:** 2026-05-28  
**Метод:** ui-qa playbook `back-navigation-traps.md` — grep + статический анализ  
**Ветка:** main  
**Тестировал:** Claude (automated audit)

---

## Итог

| # | Баг | Файл:Строка | Приоритет |
|---|-----|------------|-----------|
| BN3 | `router.back()` без `canGoBack()` после restore-purchase на paywall | `app/paywall.tsx:139` | MAJOR |

---

## BN3: `router.back()` без guard после успешного restore на paywall

**Где:** `app/paywall.tsx`, строка 139  
**Что вижу:**

```ts
if (hasPremium) {
  emitChange(EVENTS.subscriptionChanged);
  router.back(); // нет canGoBack guard
}
```

Paywall может быть корневым экраном при onboarding или при заходе через deep-link. Если пользователь выполняет restore purchase в этом контексте, `hasPremium` становится `true`, но `router.back()` — silent no-op. Пользователь завис на paywall несмотря на то, что уже premium.

**Как должно быть:**

```ts
if (hasPremium) {
  emitChange(EVENTS.subscriptionChanged);
  if (router.canGoBack()) router.back();
  else router.replace('/(tabs)');
}
```

**Приоритет:** MAJOR — пользователь не может продолжить работу с приложением после успешной покупки через deep-link путь.
