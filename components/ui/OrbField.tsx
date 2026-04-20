/**
 * <OrbField> — 4 radial orbs for ambient depth (Layer A.2 of 3-layer rule).
 * SVG-based to get true radial gradients (LinearGradient can't do radial).
 * Always pointerEvents="none" so it never swallows touches.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';

interface OrbProps {
  id: string;
  color: string;
  stopOpacity: number;
  size: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

function Orb({ id, color, stopOpacity, size, top, bottom, left, right }: OrbProps) {
  return (
    <View
      style={{
        position: 'absolute',
        top,
        bottom,
        left,
        right,
        width: size,
        height: size,
      }}
      pointerEvents="none"
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={stopOpacity} />
            <Stop offset="70%" stopColor={color} stopOpacity={stopOpacity * 0.25} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

interface Props {
  intensity?: 'subtle' | 'normal' | 'strong';
}

export function OrbField({ intensity = 'normal' }: Props) {
  const mult = intensity === 'subtle' ? 0.6 : intensity === 'strong' ? 1.35 : 1;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Orb id="orbMint" color="#C7EAE1" stopOpacity={0.55 * mult} size={360} top={-80} right={-100} />
      <Orb id="orbSage" color="#84A59D" stopOpacity={0.35 * mult} size={300} top={160} left={-120} />
      <Orb id="orbSunrise" color="#F4B886" stopOpacity={0.32 * mult} size={340} bottom={160} right={-110} />
      <Orb id="orbDusk" color="#9B7A9A" stopOpacity={0.28 * mult} size={320} bottom={-80} left={-80} />
    </View>
  );
}

export default OrbField;
