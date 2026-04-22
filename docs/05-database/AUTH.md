# Auth — ShiftRest

**Stage:** 6 (scaffold landed; Supabase project still needs provisioning)
**Updated:** 2026-04-22

---

## Strategy: deferred registration

Per [UX-SPEC §3](../04-ux/UX-SPEC.md), users complete the 10-step onboarding quiz, see the Aha moment and the paywall, then receive permission asks — all **before** they're prompted to create an account. The 5-day funnel is built around *value first, account second*.

This means:

- The happy path **never blocks on auth**. A first-run user can reach `/(tabs)` without ever seeing a sign-in screen.
- Account creation is opt-in from two surfaces:
  - **Welcome (S01)** → "I already have an account" → `/auth/login` (returning users restoring on a new device)
  - **Profile (S50)** → "Save your account" row (anonymous users persisting their progress)
- Sign out happens from Profile → "Account" row (only visible when signed in).

---

## Screens

| Route | File | Purpose |
|---|---|---|
| `/auth/login` | `app/auth/login.tsx` | Email + password sign-in. Links to forgot + signup. |
| `/auth/signup` | `app/auth/signup.tsx` | Optional name + email + password. Renders "check your inbox" state on success when Supabase confirm-email is enabled. |
| `/auth/forgot` | `app/auth/forgot.tsx` | Email-only reset-link request. Renders "check your inbox" state on success. |
| `/auth/_layout.tsx` | `app/auth/_layout.tsx` | Stack with `slide_from_right` and `gestureEnabled: false`. |

All three use `<Screen keyboardAvoiding>` so the floating CTA lifts above the keyboard — see `components/ui/Screen.tsx`.

---

## Code map

```
lib/
├── supabase.ts              Supabase client factory (createClient + AsyncStorage adapter)
└── auth/
    └── store.tsx            <AuthProvider> Context + useAuth() hook
app/
├── _layout.tsx              wraps stack with <AuthProvider> + adds <Stack.Screen name="auth">
├── auth/
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── signup.tsx
│   └── forgot.tsx
├── index.tsx                "I already have an account" → router.push('/auth/login')
└── (tabs)/profile.tsx       Account row + signOut() flow
```

The Supabase client gracefully handles missing env. If either `EXPO_PUBLIC_SUPABASE_URL` or `EXPO_PUBLIC_SUPABASE_ANON_KEY` is empty, the module exports `supabase = null` and `isSupabaseConfigured = false`. Every auth method short-circuits to a clear error (`Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL …`). The screens then render a "DEMO MODE" surface telling the reviewer the flow is wired but the back-end isn't connected yet.

---

## useAuth() — public API

```ts
const {
  session,                 // Session | null — current Supabase session
  user,                    // User | null — convenience: session?.user
  loading,                 // boolean — true on first mount until session resolves
  configured,              // boolean — env vars present?
  signInWithPassword,      // (email, password) => Promise<{ error }>
  signUpWithPassword,      // (email, password, displayName?) => Promise<{ error }>
  resetPassword,           // (email) => Promise<{ error }>
  signOut,                 // () => Promise<{ error }>
} = useAuth();
```

All methods return a uniform `{ error: AuthError | Error | null }` shape so call sites can ignore the underlying SDK shape. Errors set state for inline display; success triggers haptic feedback and route transition.

---

## Supabase project setup (when we provision)

1. Create a new project in the Supabase dashboard. Region `eu-central-1` recommended for European nurses.
2. Settings → API → copy URL and anon key into `.env` (gitignored):

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role>           # server-side only
   ```

3. Authentication → Providers → enable Email provider.
   - For MVP, leave "Confirm email" ON (signup screen handles the "check your inbox" state).
   - For internal testing, toggle OFF so the auth state listener immediately delivers a session and the user lands on `/(tabs)`.
4. Authentication → URL configuration → set redirect URLs: `shiftrest://auth/callback` (matches `app.json` scheme).
5. Run the migrations from `docs/05-database/MIGRATIONS.md` to create `profiles`, `user_settings`, and the rest of the 11 tables. RLS policies are in `RLS-POLICIES.md`.
6. Cold-start the app — `useAuth().configured` flips to true, the DEMO MODE banners disappear, real sign-up/in calls go through.

---

## Local DX

- Deep-link straight to a screen during review:
  ```
  xcrun simctl openurl <UDID> "exp://127.0.0.1:8081/--/auth/login"
  xcrun simctl openurl <UDID> "exp://127.0.0.1:8081/--/auth/signup"
  xcrun simctl openurl <UDID> "exp://127.0.0.1:8081/--/auth/forgot"
  ```
- The "DEMO MODE" notice is intentional and visible to anyone running without `.env`. It replaces actual API calls with a clear error string so the UI can be reviewed without infra.
- Form validation (client-side):
  - Email must contain `@`.
  - Password must be ≥ 6 chars (Supabase min).
  - Continue button reflects validity in real time.

---

## What's still owed

- **Email confirm callback handling** — `shiftrest://auth/callback` is registered but no in-app handler reads the `access_token` from the deep link yet. Add `Linking.addEventListener` in `_layout.tsx` once a real Supabase project is connected.
- **OAuth (Apple / Google)** — the `signInWithOAuth({ provider })` paths aren't wired in `useAuth`. Adding them later is a pure addition to `lib/auth/store.tsx`.
- **Onboarding profile sync** — when a user completes the 10-step quiz, we should `upsert` their answers into `profiles` (table is specced in `DATABASE-SCHEMA.md`). For now, all answers live in component state and are lost on sign-out. Stage 6.5.
- **Adapty linkage** — Subscription tier currently reads from `mockUser.subscription`. Once Adapty is wired (Stage 7), the `subscriptions` table becomes the source of truth and Profile's "Subscription" row reads from there.
