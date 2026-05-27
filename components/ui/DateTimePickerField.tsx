/**
 * <DateTimePickerField> — tap field opens a modal sheet with a native
 * iOS wheel picker (community/datetimepicker). On Done the value lifts up.
 * Display style matches GlassCard primitives (whisper variant).
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
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
}

function formatDateTime(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = `${weekdays[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${date} · ${time}`;
}

export function DateTimePickerField({
  label,
  value,
  onChange,
  accessibilityLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value);

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
                {formatDateTime(value)}
              </Text>
            </View>
            <Glyph name="chevronRight" size={18} color="inkMuted" />
          </View>
        </GlassCard>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={cancel}>
        <TouchableWithoutFeedback onPress={cancel}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.sheet}>
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
              mode="datetime"
              display="spinner"
              minuteInterval={5}
              onChange={handleChange}
              style={styles.picker}
              themeVariant="light"
            />
          ) : (
            <DateTimePicker
              value={draft}
              mode="datetime"
              display="default"
              onChange={handleChange}
            />
          )}
        </View>
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
