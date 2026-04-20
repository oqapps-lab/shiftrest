/**
 * <AtmosphericBackground> — full-bleed canvas layer (Layer A of 3-layer rule).
 * Vertical 5-stop warm gradient (cream → peach → mint → cream).
 * Never place inside a ScrollView — it will scroll with content.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients, asGradient } from '../../constants/tokens';

interface Props {
  variant?: 'warm' | 'dim';
}

export function AtmosphericBackground({ variant = 'warm' }: Props) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={asGradient(gradients.atmosphereWarm)}
        locations={[0, 0.3, 0.55, 0.8, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

export default AtmosphericBackground;
