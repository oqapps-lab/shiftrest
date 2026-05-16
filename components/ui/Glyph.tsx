/**
 * <Glyph> — hand-built SVG icon set.
 * 1.5px strokes, rounded caps/joins, no fills by default.
 * All icons fit a 24x24 viewport and scale from the `size` prop.
 */

import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { colors } from '../../constants/tokens';

export type GlyphName =
  | 'moon'
  | 'sun'
  | 'coffee'
  | 'alarm'
  | 'pulse'
  | 'leaf'
  | 'sparkle'
  | 'chevronRight'
  | 'chevronLeft'
  | 'close'
  | 'check'
  | 'plus'
  | 'bell'
  | 'gear'
  | 'user'
  | 'calendar'
  | 'home'
  | 'bed'
  | 'flame';

interface Props {
  name: GlyphName;
  size?: number;
  color?: keyof typeof colors | string;
  strokeWidth?: number;
}

export function Glyph({ name, size = 24, color = 'ink', strokeWidth = 1.5 }: Props) {
  const stroke = (colors as Record<string, string>)[color as string] ?? color;
  const common = {
    stroke,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'moon' && (
        <Path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" {...common} />
      )}
      {name === 'sun' && (
        <>
          <Circle cx={12} cy={12} r={4} {...common} />
          <Line x1={12} y1={2} x2={12} y2={5} {...common} />
          <Line x1={12} y1={19} x2={12} y2={22} {...common} />
          <Line x1={2} y1={12} x2={5} y2={12} {...common} />
          <Line x1={19} y1={12} x2={22} y2={12} {...common} />
          <Line x1={4.8} y1={4.8} x2={6.9} y2={6.9} {...common} />
          <Line x1={17.1} y1={17.1} x2={19.2} y2={19.2} {...common} />
          <Line x1={4.8} y1={19.2} x2={6.9} y2={17.1} {...common} />
          <Line x1={17.1} y1={6.9} x2={19.2} y2={4.8} {...common} />
        </>
      )}
      {name === 'coffee' && (
        <>
          <Path d="M4 9h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9z" {...common} />
          <Path d="M16 11h2a3 3 0 0 1 0 6h-2" {...common} />
          <Path d="M7 4.5c0 .9.6 1.4.6 2.5s-.6 1.6-.6 2.5" {...common} />
          <Path d="M11 4.5c0 .9.6 1.4.6 2.5s-.6 1.6-.6 2.5" {...common} />
        </>
      )}
      {name === 'alarm' && (
        <>
          <Circle cx={12} cy={13} r={8} {...common} />
          <Path d="M12 9v4l2.5 2.5" {...common} />
          <Path d="M5 3.5L3 5.5M19 3.5L21 5.5" {...common} />
        </>
      )}
      {name === 'pulse' && (
        <Path d="M3 12h3l2-6 4 12 3-9 2 3h4" {...common} />
      )}
      {name === 'leaf' && (
        <>
          <Path d="M4 19c10-2 14-8 16-15-7 0-12 3-15 8-1.5 2.5-1.5 5-1 7z" {...common} />
          <Path d="M4 19c3-5 7-8 12-10" {...common} />
        </>
      )}
      {name === 'sparkle' && (
        <>
          <Path d="M12 3v4M12 17v4M3 12h4M17 12h4" {...common} />
          <Path d="M12 6l1.5 4.5L18 12l-4.5 1.5L12 18l-1.5-4.5L6 12l4.5-1.5L12 6z" {...common} />
        </>
      )}
      {name === 'chevronRight' && <Path d="M9 6l6 6-6 6" {...common} />}
      {name === 'chevronLeft' && <Path d="M15 6l-6 6 6 6" {...common} />}
      {name === 'close' && (
        <>
          <Line x1={6} y1={6} x2={18} y2={18} {...common} />
          <Line x1={18} y1={6} x2={6} y2={18} {...common} />
        </>
      )}
      {name === 'check' && <Path d="M5 12l4 4 10-10" {...common} />}
      {name === 'plus' && (
        <>
          <Line x1={12} y1={5} x2={12} y2={19} {...common} />
          <Line x1={5} y1={12} x2={19} y2={12} {...common} />
        </>
      )}
      {name === 'bell' && (
        <>
          <Path d="M6 8a6 6 0 1 1 12 0c0 5 2 7 2 7H4s2-2 2-7z" {...common} />
          <Path d="M10 19a2 2 0 0 0 4 0" {...common} />
        </>
      )}
      {name === 'gear' && (
        <>
          <Circle cx={12} cy={12} r={3} {...common} />
          <Path
            d="M19 12c0 .7-.1 1.4-.2 2l2 1.5-2 3.5-2.4-.8c-1 .8-2.2 1.4-3.5 1.7L12.5 22h-4l-.4-2.1c-1.3-.3-2.5-.9-3.5-1.7l-2.4.8-2-3.5 2-1.5c-.1-.6-.2-1.3-.2-2s.1-1.4.2-2l-2-1.5 2-3.5 2.4.8c1-.8 2.2-1.4 3.5-1.7L8.5 2h4l.4 2.1c1.3.3 2.5.9 3.5 1.7l2.4-.8 2 3.5-2 1.5c.1.6.2 1.3.2 2z"
            {...common}
          />
        </>
      )}
      {name === 'user' && (
        <>
          <Circle cx={12} cy={8} r={4} {...common} />
          <Path d="M4 21c0-4 4-7 8-7s8 3 8 7" {...common} />
        </>
      )}
      {name === 'calendar' && (
        <>
          <Path d="M5 5h14v15H5z" {...common} />
          <Line x1={5} y1={10} x2={19} y2={10} {...common} />
          <Line x1={9} y1={3} x2={9} y2={7} {...common} />
          <Line x1={15} y1={3} x2={15} y2={7} {...common} />
        </>
      )}
      {name === 'home' && (
        <Path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-9z" {...common} />
      )}
      {name === 'bed' && (
        <>
          <Path d="M3 18V9h10a4 4 0 0 1 4 4v5H3zM21 18v-5" {...common} />
          <Circle cx={7} cy={13} r={2} {...common} />
        </>
      )}
      {name === 'flame' && (
        <Path d="M12 3c0 3-4 5-4 9a4 4 0 0 0 8 0c0-2-1-3-1-5 2 1 3 3 3 6a6 6 0 1 1-12 0c0-5 6-5 6-10z" {...common} />
      )}
    </Svg>
  );
}

export default Glyph;
