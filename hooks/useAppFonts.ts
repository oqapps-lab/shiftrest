/**
 * Load all app fonts via @expo-google-fonts packages.
 * Call this at the root _layout and hold the splash screen until resolved.
 */

import {
  useFonts as usePlusJakartaSans,
  PlusJakartaSans_200ExtraLight,
  PlusJakartaSans_300Light,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
} from '@expo-google-fonts/plus-jakarta-sans';

import {
  Manrope_300Light,
  Manrope_400Regular,
  Manrope_500Medium,
} from '@expo-google-fonts/manrope';

import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';

import { Fraunces_300Light_Italic } from '@expo-google-fonts/fraunces';

export function useAppFonts(): boolean {
  const [loaded] = usePlusJakartaSans({
    PlusJakartaSans_200ExtraLight,
    PlusJakartaSans_300Light,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    Manrope_300Light,
    Manrope_400Regular,
    Manrope_500Medium,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    Fraunces_300Light_Italic,
  });
  return loaded;
}
