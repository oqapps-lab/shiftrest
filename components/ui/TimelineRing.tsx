/**
 * <TimelineRing> — 24-hour circadian ring.
 * SVG arcs for sleep window (dusk gradient), shift block (sage stroke), and current-hour marker.
 * Center shows current time as Manrope mono.
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Path,
  G,
} from 'react-native-svg';
import { colors } from '../../constants/tokens';
import { Text } from './Text';
import { Eyebrow } from './Eyebrow';

interface Props {
  nowHour: number;          // 0..23.99
  sleepStart: number;       // hour (e.g. 23)
  sleepEnd: number;         // hour (e.g. 7) — can cross midnight
  shiftStart?: number;
  shiftEnd?: number;
  size?: number;
  label?: string;
  centerLabel?: string;     // optional override for center ("4:32")
  style?: ViewStyle;
}

/**
 * Convert an hour (0..24) to a point on a circle centered at (cx, cy) radius r.
 * Hour 0 is at the top (12 o'clock position), clockwise.
 */
function polar(hour: number, cx: number, cy: number, r: number) {
  const angle = ((hour / 24) * 2 * Math.PI) - Math.PI / 2;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

/**
 * Build an SVG arc path between two hours on the ring.
 * Handles the wrap-around (e.g. sleep 23 → 7 crosses midnight).
 */
function arcPath(startHour: number, endHour: number, cx: number, cy: number, r: number) {
  // Hours may wrap midnight; normalise duration
  let duration = endHour - startHour;
  if (duration <= 0) duration += 24;
  const largeArc = duration > 12 ? 1 : 0;
  const start = polar(startHour, cx, cy, r);
  const end = polar(startHour + duration, cx, cy, r);
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function TimelineRing({
  nowHour,
  sleepStart,
  sleepEnd,
  shiftStart,
  shiftEnd,
  size = 260,
  label,
  centerLabel,
  style,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 14;
  const r = cx - strokeWidth - 4; // padding for the marker dot
  const markerR = 8;

  const nowPoint = polar(nowHour, cx, cy, r);
  const hh = Math.floor(nowHour);
  const mm = Math.floor((nowHour - hh) * 60);
  const displayedTime = centerLabel ?? `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgLinearGradient id="sleepGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#6E5D84" />
            <Stop offset="100%" stopColor="#9B7A9A" />
          </SvgLinearGradient>
          <SvgLinearGradient id="shiftGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#84A59D" />
            <Stop offset="100%" stopColor="#45645E" />
          </SvgLinearGradient>
        </Defs>

        {/* Track — full 24h thin ring */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={colors.surfaceHigh}
          strokeWidth={2}
          fill="none"
        />

        {/* Shift arc — sage gradient stroke */}
        {typeof shiftStart === 'number' && typeof shiftEnd === 'number' && (
          <Path
            d={arcPath(shiftStart, shiftEnd, cx, cy, r)}
            stroke="url(#shiftGrad)"
            strokeWidth={strokeWidth - 6}
            strokeLinecap="round"
            fill="none"
            opacity={0.75}
          />
        )}

        {/* Sleep arc — dusk gradient stroke */}
        <Path
          d={arcPath(sleepStart, sleepEnd, cx, cy, r)}
          stroke="url(#sleepGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />

        {/* Now marker — filled sage circle on the ring */}
        <G>
          <Circle cx={nowPoint.x} cy={nowPoint.y} r={markerR + 4} fill={colors.canvas} />
          <Circle cx={nowPoint.x} cy={nowPoint.y} r={markerR} fill={colors.primary} />
        </G>
      </Svg>

      {/* Centre label */}
      <View
        style={{
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
        }}
        pointerEvents="none"
      >
        {label && <Eyebrow color="inkMuted">{label}</Eyebrow>}
        <Text
          variant="displayLg"
          family="display"
          weight="extraLight"
          color="ink"
          style={{ marginTop: label ? 4 : 0 }}
        >
          {displayedTime}
        </Text>
      </View>
    </View>
  );
}

export default TimelineRing;
