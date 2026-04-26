/**
 * <ShiftBar> — horizontal 24h timeline pill.
 * Shows a day's blocks: shift | commute | winddown | sleep | free.
 * Great for Home / Weekly Plan screens.
 */

import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radii } from '../../constants/tokens';
import { Text } from './Text';

type Kind = 'shift' | 'commute' | 'winddown' | 'sleep' | 'free';

export interface ShiftBlock {
  start: number;   // 0..24
  end: number;     // 0..24, may cross midnight
  kind: Kind;
  label?: string;
}

interface Props {
  blocks: ShiftBlock[];
  height?: number;
  showHourTicks?: boolean;
  style?: ViewStyle;
}

const kindColor: Record<Kind, string> = {
  shift: colors.primary,
  commute: colors.inkGhost,
  winddown: colors.duskGlow,
  sleep: colors.dusk,
  free: colors.surfaceHigh,
};

/**
 * Normalise a block into one or more segments [0..24] slices.
 * A midnight-crossing block becomes [start..24] and [0..end].
 */
function normaliseBlocks(blocks: ShiftBlock[]): { startPct: number; widthPct: number; kind: Kind }[] {
  const out: { startPct: number; widthPct: number; kind: Kind }[] = [];
  for (const b of blocks) {
    if (b.end > b.start) {
      out.push({
        startPct: (b.start / 24) * 100,
        widthPct: ((b.end - b.start) / 24) * 100,
        kind: b.kind,
      });
    } else {
      // Crosses midnight
      out.push({
        startPct: (b.start / 24) * 100,
        widthPct: ((24 - b.start) / 24) * 100,
        kind: b.kind,
      });
      out.push({
        startPct: 0,
        widthPct: (b.end / 24) * 100,
        kind: b.kind,
      });
    }
  }
  return out;
}

export function ShiftBar({ blocks, height = 14, showHourTicks = true, style }: Props) {
  const segments = normaliseBlocks(blocks);

  return (
    <View style={[{ width: '100%' }, style]}>
      <View
        style={[
          styles.track,
          { height, borderRadius: radii.pill, backgroundColor: colors.surfaceHigh },
        ]}
      >
        {segments.map((s, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${s.startPct}%`,
              width: `${s.widthPct}%`,
              backgroundColor: kindColor[s.kind],
              opacity: s.kind === 'free' ? 0 : 0.95,
              borderRadius: radii.pill,
            }}
          />
        ))}
      </View>

      {showHourTicks && (
        <View style={styles.ticks}>
          {[0, 6, 12, 18, 24].map((h) => (
            <Text key={h} variant="mono" family="mono" color="inkMuted">
              {String(h).padStart(2, '0')}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  ticks: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default ShiftBar;
