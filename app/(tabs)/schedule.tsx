/**
 * S30 — Calendar View. Month grid as dots (not squares).
 * Color-coded: sage = day shift, dusk = night, mint = off.
 *
 * Reads from public.shifts via useShifts(). Falls back to a hard-coded
 * Stage-5 cycle when no auth.user / no rows so the demo still renders.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
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

  const cells: Cell[] = [];
  for (let i = 0; i < offset; i++) cells.push({ label: '', kind: 'empty' });

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const iso = localIso(date);
    const realKind = shiftByIso.get(iso);
    let kind: Kind;
    if (realKind) {
      kind = realKind;
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

// Stage-5 fallback so unauthenticated demo screens still tell the story.
function buildMockGrid(year: number, month: number): Cell[] {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstOfMonth.getDay() + 6) % 7;
  const today = new Date();
  const todayIso = localIso(today);
  const cycle: ('day' | 'night' | 'off')[] = [
    'day', 'day', 'day', 'off', 'off', 'night', 'night',
    'night', 'off', 'off', 'day', 'day',
  ];
  const cells: Cell[] = [];
  for (let i = 0; i < offset; i++) cells.push({ label: '', kind: 'empty' });
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = localIso(new Date(year, month, d));
    if (iso < todayIso) {
      cells.push({ label: d, kind: 'past', iso });
      continue;
    }
    cells.push({ label: d, kind: cycle[(d - today.getDate()) % cycle.length] ?? 'off', iso });
  }
  while (cells.length % 7 !== 0) cells.push({ label: '', kind: 'empty' });
  return cells;
}

export default function Schedule() {
  const { user } = useAuth();

  const today = React.useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = React.useState(today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(today.getMonth());

  // ±1 month with year rollover at Dec/Jan.
  const shiftMonth = React.useCallback((delta: 1 | -1) => {
    Haptics.selectionAsync();
    setViewYear((y) => {
      const flat = y * 12 + viewMonth + delta;
      return Math.floor(flat / 12);
    });
    setViewMonth((m) => ((m + delta + 12) % 12));
  }, [viewMonth]);

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const goToToday = React.useCallback(() => {
    if (isCurrentMonth) return;
    Haptics.selectionAsync();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  }, [isCurrentMonth, today]);

  const viewedDate = React.useMemo(() => new Date(viewYear, viewMonth, 1), [viewYear, viewMonth]);
  const monthStart = localIso(new Date(viewYear, viewMonth, 1));
  const monthEnd = localIso(new Date(viewYear, viewMonth + 1, 0));

  const { data: shiftRows } = useShifts(monthStart, monthEnd);

  const shiftByIso = React.useMemo(() => {
    const map = new Map<string, 'day' | 'night'>();
    for (const r of shiftRows) map.set(r.date, r.shift_type);
    return map;
  }, [shiftRows]);

  const grid = React.useMemo(
    () => (user ? buildMonthGrid(viewYear, viewMonth, shiftByIso) : buildMockGrid(viewYear, viewMonth)),
    [user, viewYear, viewMonth, shiftByIso],
  );

  const todayIso = localIso(today);

  return (
    <Screen
      orbs="subtle"
      scroll
      floatingFooter={
        <PillCTA
          variant="primary"
          label="Add shift"
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
          accessibilityLabel="Previous month"
        >
          <Glyph name="chevronLeft" size={24} color="inkMuted" />
        </Pressable>
        <Pressable onPress={goToToday} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Viewing ${formatMonthYear(viewedDate)}, tap to jump to today`}>
          <Eyebrow>{formatMonthYear(viewedDate)}</Eyebrow>
        </Pressable>
        <Pressable
          hitSlop={12}
          onPress={() => shiftMonth(1)}
          accessibilityRole="button"
          accessibilityLabel="Next month"
        >
          <Glyph name="chevronRight" size={24} color="inkMuted" />
        </Pressable>
      </View>

      <View style={{ marginTop: spacing.lg, marginBottom: spacing.xxxl }}>
        <SerifHero>{isCurrentMonth ? 'Your next four weeks.' : formatMonthYear(viewedDate) + '.'}</SerifHero>
      </View>

      {/* Weekday header */}
      <View style={styles.weekdayRow}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
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
          const isToday = d.kind !== 'empty' && d.iso === todayIso;
          return (
            <View key={i} style={styles.cell}>
              {d.kind !== 'empty' && (
                <>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: dotColor[d.kind], opacity: d.kind === 'past' ? 0.3 : 1 },
                      isToday && styles.dotToday,
                    ]}
                  />
                  <Text
                    variant="mono"
                    family="mono"
                    color={isToday ? 'primary' : d.kind === 'past' ? 'inkGhost' : 'inkMuted'}
                    weight={isToday ? 'medium' : undefined}
                    style={{ marginTop: 4 }}
                  >
                    {String(d.label).padStart(2, '0')}
                  </Text>
                </>
              )}
            </View>
          );
        })}
      </View>

      <View style={{ height: spacing.huge }} />

      <GlassCard variant="paper" padding="xxl">
        <Eyebrow>LEGEND</Eyebrow>
        <View style={{ height: spacing.md }} />
        {[
          { color: colors.primary, label: 'Day shift', subtitle: '07:00 – 19:00' },
          { color: colors.dusk, label: 'Night shift', subtitle: '19:00 – 07:00' },
          { color: colors.primaryContainer, label: 'Off', subtitle: 'Recovery window' },
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

    </Screen>
  );
}

const styles = StyleSheet.create({
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
