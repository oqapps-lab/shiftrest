# Баг-репорт — 29 мая 2026 (security-deep-dive)

**Дата:** 2026-05-29  
**Метод:** Security audit — code-security-auditor + security-auditor + threat-model SKILLs  
**Ветка:** main  
**Тестировал:** Claude (automated security audit)  
**Фокус:** Token storage, RLS policies, analytics

---

## Итог

| # | Баг | Файл:Строка | Приоритет |
|---|-----|------------|-----------|
| SR-S1 | JWT хранится в plaintext AsyncStorage | `lib/supabase.ts` | HIGH |
| SR-S2 | `subscriptions` INSERT policy не ограничивает `status`/`plan` — при отсутствующей строке пользователь может записать `status='active'` | `supabase/migrations/20260425000007_rls_policies.sql:29` | MEDIUM |
| SR-S3 | `purchase_failed` отправляет `String(err)` в Firebase — может содержать receipt-данные | `app/paywall.tsx:183` | LOW |

---

## SR-S1: JWT в plaintext AsyncStorage

**Где:** `lib/supabase.ts`  
**Что вижу:**

```ts
createClient(url, anonKey, {
  auth: {
    storage: AsyncStorage,  // ← plaintext
    autoRefreshToken: true,
    persistSession: true,
    flowType: 'pkce',       // ← PKCE правильно настроен для OAuth
  }
})
```

`flowType: 'pkce'` — хорошая практика для OAuth redirect flows. Но сам JWT после получения хранится в незашифрованном AsyncStorage.

**Как должно быть:**

```ts
import * as SecureStore from 'expo-secure-store';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

createClient(url, anonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    flowType: 'pkce',
  }
})
```

**Приоритет:** HIGH

---

## SR-S2: `subscriptions` INSERT без ограничения на `status`/`plan`

**Где:** `supabase/migrations/20260425000007_rls_policies.sql`, строка 29  
**Что вижу:**

```sql
CREATE POLICY "Users can insert own subscription" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  -- нет ограничения на status, plan, started_at
```

Политика проверяет только `user_id = auth.uid()`. Если строка подписки отсутствует (например, после admin-удаления или бага в триггере `handle_new_user`), пользователь может вставить:
```js
supabase.from('subscriptions').insert({
  user_id: user.id,
  status: 'active',
  plan: 'premium_annual',
})
```

На практике риск низкий — `handle_new_user()` создаёт строку с `status='free'` при регистрации и нет пользовательской DELETE политики. Но политика overpermissive по дизайну.

**Как должно быть:**

```sql
CREATE POLICY "Users can insert own subscription" ON public.subscriptions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND status = 'free'   -- только начальное состояние
    AND plan = 'free'
  );
```

Или убрать INSERT policy совсем — вся запись через `handle_new_user()` trigger (service_role) которому RLS не нужен.

**Приоритет:** MEDIUM

---

## SR-S3: `String(err)` в аналитическое событие — потенциальная утечка receipt данных

**Где:** `app/paywall.tsx`, строка 183  
**Что вижу:**

```ts
logEvent('purchase_failed', { plan: planValue, reason: String(err) });
```

`String(err)` на объекте ошибки Adapty или StoreKit может содержать внутренние сообщения с product ID, фрагментами receipt или токенами транзакций в зависимости от версии SDK.

**Как должно быть:**

```ts
logEvent('purchase_failed', {
  plan: planValue,
  reason: err instanceof Error ? err.message.substring(0, 100) : 'unknown',
});
```

**Приоритет:** LOW
