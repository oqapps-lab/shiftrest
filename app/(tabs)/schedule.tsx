/**
 * S30 — Calendar View. Month grid as dots (not squares).
 * Color-coded: sage = day shift, dusk = night, mint = off.
 *
 * Reads from public.shifts via useShifts(). Falls back to a hard-coded
 * Stage-5 cycle when no auth.user / no rows so the demo still renders.
 */

import React from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Screen,
  Eyebrow,
  SerifHero,
  GlassCard,
  Text,
  Glyph,
  PillCTA,
} from '../../components/ui';
import { router } from 'expo-router';
import { colors, spacing } from '../../constants/tokens';
import { formatMonthYear } from '../../lib/derive';
import { useShifts } from '../../lib/queries';
import { useAuth } from '../../lib/auth/store';
import { useLocalShifts, removeLocalShift } from '../../lib/local-shifts/store';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { emitChange, EVENTS } from '../../lib/queries';
import { useOnboarding } from '../../lib/onboarding/store';
import { applyScheduleTemplate } from '../../lib/schedule/apply-template';
import { mockScheduleTemplates } from '../../mock/user';
import { t } from '../../lib/i18n';
import type { Translations } from '../../lib/i18n/locales/en';

type Kind = 'day' | 'night' | 'off' | 'past' | 'empty';

interface Cell {
  label: number | '';
  kind: Kind;
  iso?: string;
}

const dotColor: Record<Kind, string> = {
  day: colors.primary,
  night: colors.dusk,
  off: colors.primaryContainer,
  past: colors.inkGhost,
  empty: 'transparent',
};

function localIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Build a 6-week (42 cell) grid for the given month, Monday-first.
 * Empty cells fill the leading offset; remaining cells get the date.
 * shiftByIso lets us paint each cell from real data.
 */
function buildMonthGrid(year: number, month: number, shiftByIso: Map<string, 'day' | 'night'>): Cell[] {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first offset: getDay() returns 0=Sun..6=Sat → shift to 0=Mon..6=Sun
  const offset = (firstOfMonth.getDay() + 6) % 7;

  const today = new Date();
  const todayIso = localIso(today);

  // QA-BUG-4 follow-up: when the user has no shifts in their map at all,
  // paint future dates with no dot (kind='empty' but keep the label).
  // Otherwise every future cell defaulted to 'off' which conflicted with
  // the K1 'NO SHIFTS YET' CTA. With at least one explicit shift, fall
  // through to the legacy 'off' default for unmapped future days so the
  // legend (Off · Recovery window) still makes sense.
  const hasAnyMapped = shiftByIso.size > 0;

  const cells: Cell[] = [];
  for (let i = 0; i < offset; i++) cells.push({ label: '', kind: 'empty' });

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const iso = localIso(date);
    const realKind = shiftByIso.get(iso);
    let kind: Kind;
    if (realKind) {
      kind = realKind;
    } else if (!hasAnyMapped) {
      // No shifts at all → render every cell as a plain date number.
      kind = 'empty';
    } else if (iso < todayIso) {
      kind = 'past';
    } else {
      kind = 'off';
    }
    cells.push({ label: d, kind, iso });
  }

  // Pad to multiple of 7 so rows align (max 6 weeks = 42 cells).
  while (cells.length % 7 !== 0) cells.push({ label: '', kind: 'empty' });
  return cells;
}

// buildMockGrid removed (QA-BUG-4): the Stage-5 demo cycle painted fake
// day/night dots that conflicted with the K1 empty-state CTA. buildMonthGrid
// is now used in all paths — when no shifts exist, future cells render as
// kind='empty' (date number, no dot).

export default function Schedule() {
  const { user } = useAuth();
  const { state: onboarding } = useOnboarding();
  const [applying, setApplying] = React.useState(false);

  // Re-evaluate on every render so the "today" highlight stays correct
  // when the app sits open past midnight. The previous useMemo(()=>new Date(), [])
  // would freeze "today" at mount time and incorrectly highlight yesterday
  // until the user re-launched.
  const today = new Date();
  // Combined state so rapid taps near year boundary use the LATEST pair
  // in functional setters (avoid closure-captured staleness).
  const [view, setView] = React.useState(() => ({ year: today.getFullYear(), month: today.getMonth() }));
  const viewYear = view.year;
  const viewMonth = view.month;

  // ±1 month with year rollover at Dec/Jan.
  const shiftMonth = React.useCallback((delta: 1 | -1) => {
    Haptics.selectionAsync();
    setView(({ year, month }) => {
      const flat = year * 12 + month + delta;
      return { year: Math.floor(flat / 12), month: ((flat % 12) + 12) % 12 };
    });
  }, []);

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const goToToday = React.useCallback(() => {
    if (isCurrentMonth) return;
    Haptics.selectionAsync();
    // Fresh new Date() at call time — never stale.
    const now = new Date();
    setView({ year: now.getFullYear(), month: now.getMonth() });
  }, [isCurrentMonth]);

  const viewedDate = React.useMemo(() => new Date(viewYear, viewMonth, 1), [viewYear, viewMonth]);
  const monthStart = localIso(new Date(viewYear, viewMonth, 1));
  const monthEnd = localIso(new Date(viewYear, viewMonth + 1, 0));

  const { data: shiftRows } = useShifts(monthStart, monthEnd);

  const shiftByIso = React.useMemo(() => {
    const map = new Map<string, 'day' | 'night'>();
    for (const r of shiftRows) map.set(r.date, r.shift_type);
    return map;
  }, [shiftRows]);

  // I1: anon users — use local-shifts (persisted to AsyncStorage) instead of
  // the static buildMockGrid cycle so Add-shift entries actually paint the
  // calendar.
  const localShifts = useLocalShifts();
  const localShiftByIso = React.useMemo(() => {
    const map = new Map<string, 'day' | 'night'>();
    for (const [iso, kind] of Object.entries(localShifts)) {
      if (kind === 'day' || kind === 'night') map.set(iso, kind);
    }
    return map;
  }, [localShifts]);
  // QA-BUG-4: never fall back to buildMockGrid when localShifts is empty.
  // Mock dots painted on top of the K1 'NO SHIFTS YET' CTA created a
  // contradiction (calendar says "you have shifts" while card says you
  // don't). Truly empty grid is honest and pairs naturally with the CTA.
  const grid = React.useMemo(
    () => user
      ? buildMonthGrid(viewYear, viewMonth, shiftByIso)
      : buildMonthGrid(viewYear, viewMonth, localShiftByIso),
    [user, viewYear, viewMonth, shiftByIso, localShiftByIso],
  );

  const todayIso = localIso(today);

  // K1: Empty-state detection — true when the user has a chosen rotation
  // pattern but no shifts populated yet in the next 14 days. Surface a
  // one-tap "apply template" CTA so brand-new users don't see a dead
  // calendar full of off-day dots.
  const isViewingCurrentMonth = isCurrentMonth;
  const hasAnyShifts = (user
    ? shiftRows.length
    : Object.keys(localShifts).length) > 0;
  const showEmptyTemplateCTA =
    isViewingCurrentMonth &&
    !hasAnyShifts &&
    !!onboarding.scheduleId &&
    onboarding.scheduleId !== 'custom' &&
    !applying;
  const emptyTemplate = mockScheduleTemplates.find((tpl) => tpl.id === onboarding.scheduleId);

  const onApplyTemplate = React.useCallback(() => {
    if (!onboarding.scheduleId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setApplying(true);
    (async () => {
      try {
        await applyScheduleTemplate(onboarding.scheduleId!, {
          weeks: 4,
          userId: user?.id ?? null,
        });
        emitChange(EVENTS.shiftsChanged);
      } finally {
        setApplying(false);
      }
    })();
  }, [onboarding.scheduleId, user?.id]);

  // H1: Calendar tap handler — open Add Shift for empty days, or
  // offer Delete for days that already have a shift. Past days are
  // read-only (you can't change history).
  const onCellTap = React.useCallback((cell: Cell) => {
    if (cell.kind === 'empty' || !cell.iso) return;
    if (cell.kind === 'past') return;

    Haptics.selectionAsync();
    const hasShift = cell.kind === 'day' || cell.kind === 'night';

    if (!hasShift) {
      // Empty future day → open Add Shift with date pre-filled
      router.push({ pathname: '/schedule/add-shift', params: { iso: cell.iso } });
      return;
    }

    // Already has a shift → confirm delete
    Alert.alert(
      t('schedule.cell_action_title'),
      t('schedule.cell_action_body', { date: cell.iso }),
      [
        { text: t('schedule.cell_cancel'), style: 'cancel' },
        {
          text: t('schedule.cell_delete'),
          style: 'destructive',
          onPress: async () => {
            if (!isSupabaseConfigured || !supabase || !user?.id) {
              removeLocalShift(cell.iso!);
              return;
            }
            const { error } = await supabase
              .from('shifts')
              .update({ deleted_at: new Date().toISOString() })
              .eq('user_id', user.id)
              .eq('date', cell.iso!);
            if (error) {
              // R19/i18n-4: was leaking Supabase error.message into Alert body.
              if (__DEV__) console.warn('[schedule-delete]', error);
              Alert.alert(
                t('schedule.cell_delete_failed'),
                t('schedule.cell_delete_failed_body'),
              );
              return;
            }
            emitChange(EVENTS.shiftsChanged);
          },
        },
      ],
    );
  }, [user?.id]);

  return (
    <Screen
      orbs="subtle"
      scroll
      footerClearance={200}
      floatingFooter={
        <PillCTA
          variant="primary"
          label={t('schedule.add_shift')}
          onPress={() => router.push('/schedule/add-shift')}
          iconLeft={<Glyph name="plus" size={18} color="onPrimary" />}
        />
      }
    >
      <View style={styles.headerRow}>
        <Pressable
          hitSlop={12}
          onPress={() => shiftMonth(-1)}
          accessibilityRole="button"
          accessibilityLabel={t('schedule.prev_month')}
        >
          <Glyph name="chevronLeft" size={24} color="inkMuted" />
        </Pressable>
        <Pressable onPress={goToToday} hitSlop={8} accessibilityRole="button" accessibilityLabel={formatMonthYear(viewedDate)}>
          <Eyebrow>{formatMonthYear(viewedDate)}</Eyebrow>
        </Pressable>
        <Pressable
          hitSlop={12}
          onPress={() => shiftMonth(1)}
          accessibilityRole="button"
          accessibilityLabel={t('schedule.next_month')}
        >
          <Glyph name="chevronRight" size={24} color="inkMuted" />
        </Pressable>
      </View>

      <View style={{ marginTop: spacing.lg, marginBottom: spacing.xxxl }}>
        <SerifHero>{isCurrentMonth ? t('schedule.hero_today') : formatMonthYear(viewedDate) + '.'}</SerifHero>
      </View>

      {/* Weekday header */}
      <View style={styles.weekdayRow}>
        {((t('schedule.weekday_initials') as unknown) as Translations['schedule']['weekday_initials']).map((d, i) => (
          <View key={i} style={styles.weekdayCell}>
            <Text variant="labelMd" family="body" color="inkMuted" uppercase>
              {d}
            </Text>
          </View>
        ))}
      </View>

      {/* Month grid */}
      <View style={styles.grid}>
        {grid.map((d, i) => {
          // QA-BUG-4 follow-up: distinguish two "empty" forms —
          //  - leading offset (label === '') → render nothing
          //  - date cell with no shift assigned (label > 0, kind='empty')
          //    → render date number without a dot.
          const isLeadingOffset = d.label === '';
          const isToday = !isLeadingOffset && d.iso === todayIso;
          const isInteractive = !isLeadingOffset && d.kind !== 'past';
          if (isLeadingOffset) return <View key={i} style={styles.cell} />;
          return (
            <Pressable
              key={i}
              style={styles.cell}
              onPress={() => onCellTap(d)}
              disabled={!isInteractive}
              accessibilityRole={isInteractive ? 'button' : undefined}
              accessibilityLabel={d.iso}
            >
              {d.kind !== 'empty' && (
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: dotColor[d.kind], opacity: d.kind === 'past' ? 0.5 : 1 },
                    isToday && styles.dotToday,
                  ]}
                />
              )}
              <Text
                variant="mono"
                family="mono"
                color={isToday ? 'primary' : d.kind === 'past' ? 'inkGhost' : 'inkMuted'}
                weight={isToday ? 'medium' : undefined}
                style={{ marginTop: d.kind === 'empty' ? 0 : 4 }}
              >
                {String(d.label).padStart(2, '0')}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: spacing.huge }} />

      {/* K1: Apply-template CTA when the calendar is empty and the user
          already picked a rotation in onboarding. One tap, 28 days, done. */}
      {showEmptyTemplateCTA && emptyTemplate && (
        <Pressable
          onPress={onApplyTemplate}
          accessibilityRole="button"
          accessibilityLabel={t('schedule.empty_cta_a11y')}
          style={{ marginBottom: spacing.lg }}
        >
          <GlassCard variant="dusk" padding="xxl">
            <Eyebrow color="duskDim">{t('schedule.empty_eyebrow')}</Eyebrow>
            <Text
              variant="titleLg"
              family="display"
              weight="light"
              color="ink"
              style={{ marginTop: spacing.sm }}
            >
              {t('schedule.empty_title', { template: emptyTemplate.title })}
            </Text>
            <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.sm }}>
              {t('schedule.empty_sub')}
            </Text>
            <View style={{ height: spacing.md }} />
            <View style={styles.emptyCtaRow}>
              <Text variant="labelMd" weight="medium" color="primary" uppercase>
                {t('schedule.empty_cta')}
              </Text>
              <Glyph name="chevronRight" size={18} color="primary" />
            </View>
          </GlassCard>
        </Pressable>
      )}

      <GlassCard variant="paper" padding="xxl">
        <Eyebrow>{t('schedule.legend')}</Eyebrow>
        <View style={{ height: spacing.md }} />
        {[
          { color: colors.primary, label: t('schedule.day_shift'), subtitle: t('schedule.day_shift_time') },
          { color: colors.dusk, label: t('schedule.night_shift'), subtitle: t('schedule.night_shift_time') },
          { color: colors.primaryContainer, label: t('schedule.off_label'), subtitle: t('schedule.off_sub') },
        ].map((row) => (
          <View key={row.label} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: row.color }]} />
            <View style={{ flex: 1 }}>
              <Text variant="titleMd" family="display" weight="medium" color="ink">
                {row.label}
              </Text>
              <Text variant="bodyMd" color="inkSubtle">
                {row.subtitle}
              </Text>
            </View>
          </View>
        ))}
      </GlassCard>

      {/* F13: Calendar import entry point */}
      <Pressable
        onPress={() => router.push('/schedule/import')}
        accessibilityRole="button"
        accessibilityLabel={t('schedule.import_a11y')}
        style={{ marginTop: spacing.lg, alignSelf: 'center' }}
      >
        <View style={styles.importLinkRow}>
          <Glyph name="calendar" size={16} color="primary" />
          <Text variant="bodyMd" color="primary" weight="medium" style={{ marginLeft: spacing.sm }}>
            {t('schedule.import_from_calendar')}
          </Text>
        </View>
      </Pressable>

    </Screen>
  );
}

const styles = StyleSheet.create({
  importLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.285%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  dotToday: {
    shadowColor: colors.primary,
    shadowOpacity: 0.55,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
  },
});
