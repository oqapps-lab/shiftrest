/**
 * <DateTimePickerField> — tap field opens a modal sheet with a native
 * iOS wheel picker (community/datetimepicker). On Done the value lifts up.
 * Display style matches GlassCard primitives (whisper variant).
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import i18n from '../../lib/i18n';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { Eyebrow } from './Eyebrow';
import { Glyph } from './Glyph';
import { GlassCard } from './GlassCard';
import { colors, radii, spacing } from '../../constants/tokens';

interface Props {
  label: string;
  /** Date+time value. Combine date and hour on the caller side. */
  value: Date;
  onChange: (next: Date) => void;
  accessibilityLabel?: string;
  mode?: 'datetime' | 'time';
}

function formatDateTime(d: Date, mode: 'datetime' | 'time'): string {
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (mode === 'time') return time;
  // R19/i18n-2: was hardcoded English month/weekday arrays. Use
  // Intl.DateTimeFormat with i18n.locale so the field renders
  // localised "Mo 27 Mai" on de-DE etc.
  const fmt = new Intl.DateTimeFormat(i18n.locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  return `${fmt.format(d)} · ${time}`;
}

export function DateTimePickerField({
  label,
  value,
  onChange,
  accessibilityLabel,
  mode = 'datetime',
}: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value);
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(slide, { toValue: 0, duration: 260, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]).start();
    } else {
      fade.setValue(0);
      slide.setValue(1);
    }
  }, [open, fade, slide]);

  const openSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraft(value);
    setOpen(true);
  };

  const cancel = () => {
    setOpen(false);
  };

  const done = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(draft);
    setOpen(false);
  };

  const handleChange = (_: DateTimePickerEvent, picked?: Date) => {
    if (picked) setDraft(picked);
  };

  return (
    <>
      <Pressable
        onPress={openSheet}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        style={{ marginBottom: spacing.sm }}
      >
        <GlassCard variant="whisper" padding="xl">
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Eyebrow>{label}</Eyebrow>
              <Text
                variant="titleMd"
                family="display"
                weight="medium"
                color="ink"
                style={{ marginTop: 2 }}
              >
                {formatDateTime(value, mode)}
              </Text>
            </View>
            <Glyph name="chevronRight" size={18} color="inkMuted" />
          </View>
        </GlassCard>
      </Pressable>

      <Modal visible={open} transparent animationType="none" onRequestClose={cancel}>
        <TouchableWithoutFeedback onPress={cancel}>
          <Animated.View style={[styles.backdrop, { opacity: fade }]} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [
                {
                  translateY: slide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 400],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Pressable onPress={cancel} hitSlop={12} accessibilityRole="button">
              <Text variant="labelMd" weight="medium" color="inkMuted" uppercase>
                Cancel
              </Text>
            </Pressable>
            <Text variant="labelMd" weight="medium" color="ink" uppercase>
              {label}
            </Text>
            <Pressable onPress={done} hitSlop={12} accessibilityRole="button">
              <Text variant="labelMd" weight="medium" color="primary" uppercase>
                Done
              </Text>
            </Pressable>
          </View>

          {Platform.OS === 'ios' ? (
            <DateTimePicker
              value={draft}
              mode={mode}
              display="spinner"
              minuteInterval={5}
              onChange={handleChange}
              style={styles.picker}
              themeVariant="light"
            />
          ) : (
            <DateTimePicker
              value={draft}
              mode={mode}
              display="default"
              onChange={handleChange}
            />
          )}
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingBottom: spacing.huge,
    paddingTop: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.inkGhost,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkGhost,
  },
  picker: {
    height: 220,
  },
});
