/**
 * <TodayCoachmark> — G7 sequential spotlight walkthrough for the Today screen.
 *
 * The owner wanted: "popups should open from the top and HIGHLIGHT each
 * widget." This is a real coachmark tour — it dims the whole screen, punches a
 * rounded-rect HOLE around one widget at a time using an SVG mask, and floats
 * an explanatory tooltip (step counter + title + body + Skip / Next) above or
 * below the hole. Advancing measures the next target, scrolls it into view if
 * it's off-screen, then re-punches the hole there.
 *
 * Robustness notes (deliberate choices):
 * - The hole is rendered with react-native-svg <Mask> (white = visible dim,
 *   black = punched hole). No reanimated worklets here — the only animation is
 *   a soft RN-core Animated fade of the tooltip on each step change. Keeps it
 *   bullet-proof inside a transparent <Modal>.
 * - Measurement uses target.measureInWindow(): window-space, scroll-independent,
 *   and it matches the full-screen Modal's coordinate space exactly.
 * - GRACEFUL: if a target can't be measured (unmounted, conditionally hidden,
 *   measure returns 0×0), we simply dim the whole screen with NO hole and
 *   center the tooltip — the user is never trapped. Skip always closes; the
 *   last step's button says Done and closes.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { GlassCard, Eyebrow, Text } from '../ui';
import { colors, radii, spacing } from '../../constants/tokens';
import { t } from '../../lib/i18n';

/** One stop on the tour: a target view ref + its explanatory copy. */
export interface CoachStep {
  /** Ref to the widget to spotlight. Wrap custom components in a
   *  <View ref={…} collapsable={false}> so measureInWindow works. */
  ref: React.RefObject<View | null>;
  titleKey: string;
  bodyKey: string;
}

interface TargetRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Props {
  visible: boolean;
  onDone: () => void;
  steps: CoachStep[];
  /** Parent scrolls its ScrollView so `y` (window-space top of the target) is
   *  comfortably on screen. Called before re-measuring an off-screen target. */
  scrollToY: (y: number) => void;
}

// Padding around the target rect when punching the hole.
const HOLE_PAD = 8;
// Estimated tooltip height used only to decide above/below placement + to clamp
// it on screen. The card sizes itself to content; this is a safe upper bound.
const TOOLTIP_MAX_W = 360;
const GAP = spacing.lg; // gap between hole and tooltip
// Delay after asking the parent to scroll before we re-measure, so the
// ScrollView has actually moved. ~250ms per the spec.
const SCROLL_SETTLE_MS = 260;

export function TodayCoachmark({ visible, onDone, steps, scrollToY }: Props) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [index, setIndex] = useState(0);
  // `rect` null => no measurable target this step => dim-only + centered tooltip.
  const [rect, setRect] = useState<TargetRect | null>(null);
  const fade = useRef(new Animated.Value(0)).current;
  // Guards against a stale measure callback (after scroll) writing into a step
  // the user has already advanced past.
  const stepTokenRef = useRef(0);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stepCount = steps.length;
  const current = steps[index];
  const isLast = index >= stepCount - 1;

  // Measure the current step's target. If it's off-screen, ask the parent to
  // scroll it into view, then re-measure after a short settle. Degrades to a
  // null rect (dim-only) on any failure.
  const measureStep = useCallback(
    (token: number) => {
      const node = steps[index]?.ref.current;
      if (!node || typeof node.measureInWindow !== 'function') {
        setRect(null);
        return;
      }
      node.measureInWindow((x, y, w, h) => {
        if (token !== stepTokenRef.current) return; // user advanced; ignore
        // Unmeasurable / flattened view → dim-only fallback.
        if (!w || !h || (w === 0 && h === 0)) {
          setRect(null);
          return;
        }
        const topVisible = insets.top + spacing.huge;
        const bottomVisible = screenH - insets.bottom - spacing.huge;
        const offTop = y < topVisible;
        const offBottom = y + h > bottomVisible;
        if (offTop || offBottom) {
          // Compute a target window-Y we want the widget's TOP to land at:
          // a comfortable position in the upper third of the visible area.
          const desiredTop = topVisible + spacing.xl;
          // The parent maps this to a content offset. We pass the DELTA-aware
          // window y so the parent can scroll by (currentTop - desiredTop).
          scrollToY(y - desiredTop);
          if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
          scrollTimerRef.current = setTimeout(() => {
            if (token !== stepTokenRef.current) return;
            const after = steps[index]?.ref.current;
            if (!after || typeof after.measureInWindow !== 'function') {
              setRect(null);
              return;
            }
            after.measureInWindow((x2, y2, w2, h2) => {
              if (token !== stepTokenRef.current) return;
              if (!w2 || !h2) {
                setRect(null);
                return;
              }
              setRect({ x: x2, y: y2, w: w2, h: h2 });
            });
          }, SCROLL_SETTLE_MS);
          return;
        }
        setRect({ x, y, w, h });
      });
    },
    [index, insets.bottom, insets.top, screenH, scrollToY, steps],
  );

  // On each step change (and on open), reset fade, bump the token, measure.
  useEffect(() => {
    if (!visible) return;
    const token = ++stepTokenRef.current;
    fade.setValue(0);
    setRect(null);
    // A frame's delay lets any just-completed scroll/layout settle before the
    // first measure of a freshly-shown step.
    const id = setTimeout(() => measureStep(token), 16);
    Animated.timing(fade, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
    return () => {
      clearTimeout(id);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
    // measureStep is recreated when `index` changes, which is exactly when we
    // want to re-run. visible re-arms on open.
  }, [visible, index, fade, measureStep]);

  // Reset to first step whenever the tour is (re)opened.
  useEffect(() => {
    if (visible) setIndex(0);
  }, [visible]);

  const close = useCallback(() => {
    stepTokenRef.current++; // invalidate any in-flight measure
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    onDone();
  }, [onDone]);

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLast) {
      close();
    } else {
      setIndex((i) => i + 1);
    }
  }, [isLast, close]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    close();
  }, [close]);

  if (!visible || stepCount === 0 || !current) return null;

  // ── Hole geometry (padded), clamped to screen ──────────────────────────
  const hole = rect
    ? {
        x: Math.max(0, rect.x - HOLE_PAD),
        y: Math.max(0, rect.y - HOLE_PAD),
        w: Math.min(screenW, rect.w + HOLE_PAD * 2),
        h: rect.h + HOLE_PAD * 2,
      }
    : null;

  // ── Tooltip placement ──────────────────────────────────────────────────
  // If the hole is in the LOWER half → place tooltip ABOVE it; else BELOW.
  // No hole → center vertically.
  const tooltipW = Math.min(TOOLTIP_MAX_W, screenW - spacing.xxl * 2);
  let tooltipTop: number | undefined;
  let tooltipBottom: number | undefined;
  if (hole) {
    const holeMidY = hole.y + hole.h / 2;
    const placeAbove = holeMidY > screenH / 2;
    if (placeAbove) {
      // anchor tooltip's BOTTOM just above the hole
      tooltipBottom = screenH - (hole.y - GAP);
      // clamp so it doesn't run under the status bar
      const maxBottom = screenH - (insets.top + spacing.lg);
      if (tooltipBottom > maxBottom) tooltipBottom = maxBottom;
    } else {
      tooltipTop = hole.y + hole.h + GAP;
      const maxTop = screenH - insets.bottom - spacing.colossal;
      if (tooltipTop > maxTop) tooltipTop = maxTop;
    }
  } else {
    // dim-only: center-ish, biased to upper third ("popups open from the top")
    tooltipTop = insets.top + spacing.colossal;
  }

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={close}>
      <View style={styles.root} pointerEvents="box-none">
        {/* Dim layer with the spotlight hole punched via SVG mask. */}
        <Svg
          width={screenW}
          height={screenH}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Defs>
            <Mask id="coachHole">
              {/* white = keep dim */}
              <Rect x={0} y={0} width={screenW} height={screenH} fill="#fff" />
              {/* black = punch a transparent hole */}
              {hole ? (
                <Rect
                  x={hole.x}
                  y={hole.y}
                  width={hole.w}
                  height={hole.h}
                  rx={radii.lg}
                  ry={radii.lg}
                  fill="#000"
                />
              ) : null}
            </Mask>
          </Defs>
          <Rect
            x={0}
            y={0}
            width={screenW}
            height={screenH}
            fill="rgba(0,0,0,0.6)"
            mask="url(#coachHole)"
          />
        </Svg>

        {/* A full-screen catcher so taps on the dim area don't fall through to
            the widgets underneath. Tapping the dim advances, like most tours. */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel={t('today_coach.next')}
        />

        {/* Tooltip */}
        <Animated.View
          style={[
            styles.tooltipWrap,
            { width: tooltipW, opacity: fade },
            tooltipTop !== undefined ? { top: tooltipTop } : null,
            tooltipBottom !== undefined ? { bottom: tooltipBottom } : null,
          ]}
          // box-none so the GlassCard's own buttons receive touches but the
          // wrapper itself doesn't block the dim-catcher around it.
          pointerEvents="box-none"
        >
          <GlassCard variant="paper" padding="xl">
            <Eyebrow style={styles.counter}>{`${index + 1}/${stepCount}`}</Eyebrow>
            <Text
              variant="titleLg"
              family="display"
              weight="medium"
              color="ink"
              style={styles.title}
            >
              {t(current.titleKey)}
            </Text>
            <Text variant="bodyMd" color="inkSubtle" style={styles.body}>
              {t(current.bodyKey)}
            </Text>
            <View style={styles.actions}>
              <Pressable
                onPress={handleSkip}
                accessibilityRole="button"
                accessibilityLabel={t('today_coach.skip')}
                hitSlop={10}
                style={styles.skipBtn}
              >
                <Text variant="bodyMd" family="body" weight="medium" color="inkMuted">
                  {t('today_coach.skip')}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleNext}
                accessibilityRole="button"
                accessibilityLabel={isLast ? t('today_coach.done') : t('today_coach.next')}
                style={styles.nextBtn}
              >
                <Text variant="bodyMd" family="body" weight="medium" color="onPrimary">
                  {isLast ? t('today_coach.done') : t('today_coach.next')}
                </Text>
              </Pressable>
            </View>
          </GlassCard>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tooltipWrap: {
    position: 'absolute',
    alignSelf: 'center',
  },
  counter: {
    marginBottom: spacing.xs,
  },
  title: {
    marginBottom: spacing.sm,
  },
  body: {
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipBtn: {
    paddingVertical: spacing.sm,
    paddingRight: spacing.lg,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TodayCoachmark;
