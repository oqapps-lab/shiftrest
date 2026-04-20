/**
 * ShiftRest — Design Tokens (single source of truth)
 *
 * Mood: "Weightless Sanctuary" — warm paper canvas, sage-green mono-accent,
 * whisper-light typography, pill geometry, frosted glass, breathing orbs.
 *
 * DO NOT add inline hex values anywhere else in the codebase.
 * If a value is missing here, add it here first, then use the token.
 *
 * See docs/06-design/DESIGN-GUIDE.md for rationale and anti-patterns.
 */

// ─── COLORS ─────────────────────────────────────────────────────────────────

export const colors = {
  // Canvas & surface tiers (warm paper)
  canvas: '#FCF9F6',
  canvasDim: '#F5F2EF',
  surfaceLowest: '#FFFFFF',
  surfaceLow: '#F6F3EF',
  surface: '#F0EEE9',
  surfaceHigh: '#EAE8E3',
  surfaceHighest: '#E4E3DD',
  surfaceDim: '#DBDAD4',

  // Sage — single primary accent
  primary: '#45645E',
  primaryDim: '#395852',
  primaryBright: '#84A59D',
  primaryContainer: '#C7EAE1',
  primaryContainerDim: '#B9DCD3',
  onPrimary: '#DDFFF6',
  onPrimaryContainer: '#385851',

  // Narrative accents (shift-worker palette)
  sunrise: '#F4B886',
  sunriseDim: '#E89A5E',
  sunriseGlow: '#FAD9BB',
  dusk: '#9B7A9A',
  duskDim: '#7E5D7D',
  duskGlow: '#D6C4D5',
  coral: '#E8A09B',
  coralDim: '#CF7F7A',

  // Text
  ink: '#32332F',
  inkSubtle: '#5F5F5B',
  inkMuted: '#7B7B76',
  inkGhost: '#B3B2AD',

  // Utility
  transparent: 'transparent',
  glassTintWarm: 'rgba(255,252,248,0.65)',
  glassTintWarmAndroid: 'rgba(252,249,246,0.94)',
  glassHighlightTop: 'rgba(255,255,255,0.42)',
  glassHighlightTopEnd: 'rgba(255,255,255,0.00)',
  ambientGlowPrimary: 'rgba(69,100,94,0.08)',
} as const;

export type ColorToken = keyof typeof colors;

// ─── GRADIENTS ──────────────────────────────────────────────────────────────
// Exported as `readonly [string, string, ...string[]]` tuples for expo-linear-gradient
// RN types need exactly this shape; import and pass directly.

export const gradients = {
  // Canvas atmosphere — vertical 5-stop cream→peach→mint→cream
  atmosphereWarm: ['#FCF9F6', '#F9F3ED', '#F3EFE7', '#EEF3EE', '#F5F2EF'] as const,

  // Radial orbs (fade from color → transparent, used with circular masking via borderRadius)
  orbMint: ['rgba(199,234,225,0.45)', 'rgba(199,234,225,0.00)'] as const,
  orbSage: ['rgba(132,165,157,0.35)', 'rgba(132,165,157,0.00)'] as const,
  orbSunrise: ['rgba(244,184,134,0.32)', 'rgba(244,184,134,0.00)'] as const,
  orbDusk: ['rgba(155,122,154,0.28)', 'rgba(155,122,154,0.00)'] as const,

  // Breathing orb (concentric radial)
  breathOrb: [
    'rgba(199,234,225,0.90)',
    'rgba(199,234,225,0.45)',
    'rgba(199,234,225,0.18)',
    'rgba(199,234,225,0.00)',
  ] as const,

  // CTAs — 3 stops max, no white highlight (per DESIGN-GUIDE §9)
  ctaPrimary: ['#547972', '#45645E', '#395852'] as const,
  ctaSunrise: ['#F8CDA6', '#E89A5E'] as const,
  ctaDusk: ['#B091AE', '#7E5D7D'] as const,

  // Timeline ring arcs
  sleepArc: ['#6E5D84', '#9B7A9A'] as const,
  wakeArc: ['#F8CDA6', '#F4B886'] as const,

  // Glass highlight (1px top inner highlight on glass cards)
  glassHighlight: ['rgba(255,255,255,0.42)', 'rgba(255,255,255,0.00)'] as const,
} as const;

export type GradientToken = keyof typeof gradients;

// Helper cast for LinearGradient (RN prop typing demands readonly tuple)
export function asGradient(g: readonly string[]): readonly [string, string, ...string[]] {
  return g as unknown as readonly [string, string, ...string[]];
}

// ─── RADII ──────────────────────────────────────────────────────────────────

export const radii = {
  xs: 8,
  sm: 12,
  md: 20,
  lg: 28,
  xl: 36,
  xxl: 48,
  pill: 999,
} as const;

export type RadiusToken = keyof typeof radii;

// ─── SPACING ────────────────────────────────────────────────────────────────
// 8pt grid with compressed low end (Stitch uses 3× scale — we use a hybrid)

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  mega: 64,
  colossal: 96,
} as const;

export type SpacingToken = keyof typeof spacing;

// ─── TYPOGRAPHY ─────────────────────────────────────────────────────────────

export const fonts = {
  display: {
    extraLight: 'PlusJakartaSans_200ExtraLight',
    light: 'PlusJakartaSans_300Light',
    medium: 'PlusJakartaSans_500Medium',
    semiBold: 'PlusJakartaSans_600SemiBold',
  },
  body: {
    light: 'Manrope_300Light',
    regular: 'Manrope_400Regular',
    medium: 'Manrope_500Medium',
  },
  mono: {
    regular: 'JetBrainsMono_400Regular',
    medium: 'JetBrainsMono_500Medium',
  },
  serif: {
    lightItalic: 'Fraunces_300Light_Italic',
  },
} as const;

// Type scale — see DESIGN-GUIDE §3.2
export const typeScale = {
  displayXxl: { fontSize: 120, lineHeight: 128, letterSpacing: -0.5 },
  displayXl: { fontSize: 88, lineHeight: 96, letterSpacing: -0.5 },
  displayLg: { fontSize: 64, lineHeight: 72, letterSpacing: 0 },
  displayMd: { fontSize: 48, lineHeight: 56, letterSpacing: 0 },
  headlineLg: { fontSize: 32, lineHeight: 40, letterSpacing: 0.5 },
  headlineMd: { fontSize: 24, lineHeight: 32, letterSpacing: 0.4 },
  titleLg: { fontSize: 20, lineHeight: 28, letterSpacing: 0.2 },
  titleMd: { fontSize: 17, lineHeight: 24, letterSpacing: 0.1 },
  bodyLg: { fontSize: 16, lineHeight: 24, letterSpacing: 0.1 },
  bodyMd: { fontSize: 14, lineHeight: 22, letterSpacing: 0.1 },
  labelLg: { fontSize: 13, lineHeight: 18, letterSpacing: 1.2 },
  labelMd: { fontSize: 11, lineHeight: 16, letterSpacing: 1.6 },
  serifHero: { fontSize: 28, lineHeight: 36, letterSpacing: 0.1 },
  mono: { fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
} as const;

export type TypeScaleToken = keyof typeof typeScale;

// Tracking helpers (for cases where you need absolute letter spacing)
export const tracking = {
  tight: -0.5,
  normal: 0,
  wide: 0.4,
  wider: 1.2,
  widest: 1.6,
} as const;

// ─── SHADOWS ────────────────────────────────────────────────────────────────
// Only used on floating tab bar. Sage-tinted, never neutral grey.

export const shadows = {
  tabBar: {
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  ctaPrimaryGlow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  ctaSunriseGlow: {
    shadowColor: colors.sunrise,
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  ctaDuskGlow: {
    shadowColor: colors.dusk,
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
} as const;

// ─── MOTION ─────────────────────────────────────────────────────────────────

export const motion = {
  // The "breath" curve — slow, eased, never springy
  breath: [0.4, 0, 0.2, 1] as const,
  press: { duration: 120 },
  pressRelease: { duration: 160 },
  pageSlide: { duration: 300 },
  modalSlide: { duration: 400 },
  tabFade: { duration: 200 },
  orbPulse: { duration: 4000 },
} as const;

// ─── EXPORT AGGREGATE ───────────────────────────────────────────────────────

export const tokens = {
  colors,
  gradients,
  radii,
  spacing,
  fonts,
  typeScale,
  tracking,
  shadows,
  motion,
} as const;

export default tokens;
