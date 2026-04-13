# ERD — ShiftRest
**Дата: 13 апреля 2026**

> Entity-Relationship Diagram для MVP-схемы базы данных.

---

## Полная диаграмма

```
┌─────────────────────────┐
│      auth.users         │
│   (Supabase Auth)       │
│─────────────────────────│
│ id              uuid PK │
│ email           text    │
│ phone           text    │
│ created_at      ts      │
└────────┬────────────────┘
         │
         │ id
         │
    ┌────┴────────────────────────────────────────────────────────────┐
    │         │              │              │              │          │
    │ 1:1     │ 1:1          │ 1:1          │ 1:1          │ 1:N     │
    ▼         ▼              ▼              ▼              ▼         ▼
┌──────────┐ ┌────────────┐ ┌──────────────┐ ┌───────────┐ ┌─────────────┐
│ profiles │ │  user_     │ │subscriptions │ │  sleep_   │ │ ai_requests │
│          │ │  settings  │ │              │ │  streaks  │ │             │
│──────────│ │────────────│ │──────────────│ │───────────│ │─────────────│
│ id    PK │ │ id      PK │ │ id        PK │ │ id     PK │ │ id       PK │
│=user.id  │ │ user_id FK │ │ user_id   FK │ │ user_id FK│ │ user_id  FK │
│ name     │ │ notif_*    │ │ status       │ │ current   │ │ type        │
│ profess. │ │ theme      │ │ plan         │ │ longest   │ │ prompt      │
│ chrono.  │ │ language   │ │ trial_*      │ │ last_date │ │ response    │
│ caffeine │ │ timezone   │ │ period_*     │ └───────────┘ │ model       │
│ melatonin│ │ push_token │ │ store        │               │ tokens      │
│ family   │ └────────────┘ │ adapty_id    │               │ cost        │
│ onboard. │                │ raw_data     │               │ status      │
└──────────┘                └──────────────┘               └──────┬──────┘
                                                                  │
         ┌────────────────────────────────────────────────────────┘
         │ ai_request_id (опциональный FK)
         │
    ┌────┴─── user_id ──────────────────────────────────┐
    │                          │                         │
    │ 1:N                      │ 1:N                     │ 1:N
    ▼                          ▼                         ▼
┌──────────────┐        ┌────────────┐          ┌────────────────┐
│ user_        │        │ sleep_     │          │ transition_    │
│ schedules    │        │ plans      │          │ plans          │
│──────────────│        │────────────│          │────────────────│
│ id        PK │        │ id      PK │          │ id          PK │
│ user_id   FK │        │ user_id FK │          │ user_id     FK │
│ template_id  │───┐    │ shift_id FK│──┐       │ type           │
│ name         │   │    │ date       │  │       │ start_date     │
│ start_date   │   │    │ plan_type  │  │       │ end_date       │
│ end_date     │   │    │ sleep_*    │  │       │ total_steps    │
│ repeat_weeks │   │    │ caffeine   │  │       │ completed      │
│ custom_pat.  │   │    │ melatonin  │  │       │ status         │
│ is_active    │   │    │ nap_*      │  │       │ gen_method     │
└──────┬───────┘   │    │ explanation│  │       │ ai_request_id  │
       │           │    │ gen_method │  │       └────────┬───────┘
       │ 1:N       │    │ ai_req_id │  │                │
       ▼           │    └────────────┘  │                │ 1:N
┌──────────────┐   │                    │                ▼
│ shifts       │   │                    │       ┌────────────────┐
│──────────────│   │                    │       │ transition_    │
│ id        PK │◄──┼────────────────────┘       │ steps          │
│ user_id   FK │   │                            │────────────────│
│ schedule_id  │───┘                            │ id          PK │
│ date         │                                │ plan_id     FK │
│ start_time   │                                │ user_id     FK │
│ end_time     │                                │ day_number     │
│ shift_type   │                                │ step_order     │
│ is_manual    │                                │ scheduled_time │
│ is_overtime  │                                │ action_type    │
│ notes        │                                │ title          │
└──────────────┘                                │ is_completed   │
                                                └────────────────┘

┌──────────────────┐
│ shift_templates  │  (справочник — нет FK на auth.users)
│──────────────────│
│ id            PK │◄──── user_schedules.template_id
│ name             │
│ slug          UQ │
│ profession       │
│ pattern    jsonb │
│ cycle_days       │
│ is_active        │
│ sort_order       │
└──────────────────┘
```

---

## Связи

| Связь | Тип | FK | ON DELETE |
|-------|-----|----|----------|
| auth.users → profiles | 1:1 | profiles.id → auth.users.id | CASCADE |
| auth.users → user_settings | 1:1 | user_settings.user_id → auth.users.id | CASCADE |
| auth.users → subscriptions | 1:1 | subscriptions.user_id → auth.users.id | CASCADE |
| auth.users → sleep_streaks | 1:1 | sleep_streaks.user_id → auth.users.id | CASCADE |
| auth.users → user_schedules | 1:N | user_schedules.user_id → auth.users.id | CASCADE |
| auth.users → shifts | 1:N | shifts.user_id → auth.users.id | CASCADE |
| auth.users → sleep_plans | 1:N | sleep_plans.user_id → auth.users.id | CASCADE |
| auth.users → transition_plans | 1:N | transition_plans.user_id → auth.users.id | CASCADE |
| auth.users → transition_steps | 1:N | transition_steps.user_id → auth.users.id | CASCADE |
| auth.users → ai_requests | 1:N | ai_requests.user_id → auth.users.id | CASCADE |
| shift_templates → user_schedules | 1:N | user_schedules.template_id → shift_templates.id | SET NULL |
| user_schedules → shifts | 1:N | shifts.schedule_id → user_schedules.id | SET NULL |
| shifts → sleep_plans | 1:1 | sleep_plans.shift_id → shifts.id | SET NULL |
| transition_plans → transition_steps | 1:N | transition_steps.plan_id → transition_plans.id | CASCADE |
| ai_requests → sleep_plans | 1:1 | sleep_plans.ai_request_id → ai_requests.id | SET NULL |
| ai_requests → transition_plans | 1:1 | transition_plans.ai_request_id → ai_requests.id | SET NULL |

---

## Группы таблиц по доменам

```
┌─────────────────────────────────────────────────────────┐
│                    USER DOMAIN                          │
│  profiles  ·  user_settings  ·  subscriptions           │
│  sleep_streaks                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  SCHEDULE DOMAIN                        │
│  shift_templates  ·  user_schedules  ·  shifts          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    PLAN DOMAIN                          │
│  sleep_plans  ·  transition_plans  ·  transition_steps  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   SYSTEM DOMAIN                         │
│  ai_requests                                            │
└─────────────────────────────────────────────────────────┘
```

---

## Поток данных

```
Онбординг                    Ежедневное использование
─────────                    ────────────────────────

[Profession]  ─┐
[Chronotype]   │
[Caffeine]     ├──▶ profiles
[Melatonin]    │
[Family]       │
[Name]        ─┘

[Template]    ──▶ user_schedules ──▶ shifts ──▶ sleep_plans ──▶ Notifications
                                               (rule-based    (client-side
                                                или AI)        Expo Push)

                                    shifts ──▶ transition_plans ──▶ transition_steps
                                   (обнаружен                      (checklist
                                    переход                         с прогрессом)
                                    D→N / N→D)

[Trial/Pay]   ──▶ Adapty SDK ──▶ Adapty Webhook ──▶ subscriptions
                                 (Edge Function)

[AI запрос]   ──▶ Edge Function ──▶ OpenAI ──▶ ai_requests + sleep_plans
```

---

## Источники

- [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md) — полная схема таблиц
- [USER-FLOWS.md](../04-ux/USER-FLOWS.md) — потоки данных
