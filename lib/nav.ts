/**
 * Safe navigation helpers — avoid GO_BACK errors when a screen is opened
 * via deep-link with no parent in the stack.
 */

import { router } from 'expo-router';
import type { Href } from 'expo-router';

/**
 * Pop the screen if there's a back stack, else replace with `fallback`.
 * Use for any back-chevron / cancel handler that might be reached via
 * deep-link.
 */
export function safeBack(fallback: Href = '/'): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}

/**
 * Dismiss a modal if dismissable, fall back to back, else replace.
 * Use for modal close (X) handlers.
 */
export function safeDismiss(fallback: Href = '/'): void {
  if (router.canDismiss?.()) {
    router.dismiss();
  } else if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}
