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
- `01-research/` — market research, personas, domain research, product brief
- `02-product/` — features, user flows, screens
- `03-business/` — monetization, pricing, unit economics
- `04-design/` — design system, screen prompts, navigation
- `05-technical/` — DB schema, auth, edge functions
- `06-development/` — implementation notes
- `07-analytics/` — events, KPIs
- `08-deployment/` — store listings, release notes

## Current stage
Research (Stage 3)
