# ShiftRest

## Stack
- Expo SDK 55, React Native, TypeScript strict
- expo-router (file-based routing)
- Supabase (auth, database, storage)
- Adapty (subscriptions)
- OpenAI API (personalized sleep plans)

## About
Sleep advisor for shift workers (nurses, firefighters, factory workers). Not a sleep tracker — gives personalized sleep plans based on rotating schedules: when to sleep, melatonin timing, caffeine cutoff, transition plans between shift types.

## Target Audience
- Nurses with 3x12 rotations (primary)
- Firefighters/EMS with 24/48 schedules
- Factory workers with continental shifts

## Current Stage
Research (Stage 3)

## Rules
- useWindowDimensions() for responsive
- useSafeAreaInsets() for safe areas
- Haptics.impactAsync() on buttons
- aspectRatio for images
- Mock data from /mock/ (NO real API until Stage 6)
- Functional components + TypeScript strict
- StyleSheet.create (no inline styles)
- No class components
- No any types

## 3-Layer Layout System
Each screen has three layers:
1. **Background** — absolute, gradients/images, NOT inside ScrollView
2. **Content** — flex/scroll, text, cards, interactive
3. **Floating UI** — absolute, bottom buttons/top header

## File Structure
- /app/ — screens (expo-router)
- /components/ui/ — shared UI components
- /components/[feature]/ — feature-specific components
- /constants/ — colors, fonts, layout
- /docs/ — all documentation
- /docs/01-research/ — market research, competitors, personas
