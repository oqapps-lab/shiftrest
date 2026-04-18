# ShiftRest

Sleep advisor for shift workers (nurses, firefighters, factory workers). Personalized sleep plans based on rotating schedules: when to sleep, melatonin timing, caffeine cutoff, transition plans between shift types.

## Stack
- Expo SDK 55, React Native, TypeScript (strict)
- expo-router (file-based routing)
- Supabase (auth, database, storage)
- Adapty (subscriptions)
- OpenAI API (personalized sleep plans)

## Getting started
```bash
npm install
cp .env.example .env  # fill in real keys
npm start
```

## Project structure
See `CLAUDE.md` for the full architectural rules and the 3-layer layout system.

Documentation lives in `/docs/`:
- `01-research/` — market research, competitors, personas, domain research, research brief
- `02-product/` — product vision, features, problem-solution fit, audience, monetization
- `03-practices/` — onboarding/paywall/retention/ASO research + practices brief
- `04-ux/` — screen map, user flows, wireframes, UX spec, funnel
- `05-database/` — DB schema, migrations, RLS policies
- `06-design/` — Stitch outputs, design system, screenshots
- `07-development/` — implementation notes, guides
- `08-deployment/` — store listings, release notes

## Current stage
Research (Stage 3)
