/**
 * F13 — Calendar import. Pick a .ics file → parse → preview → confirm
 * batch insert. Anon writes to local-shifts; signed-in writes to
 * Supabase shifts table.
 *
 * Heuristic classification: SUMMARY keywords map to shift_type.
 * User can override the heuristic by editing the shift on the calendar
 * afterwards (H1 calendar tap).
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import {
  Screen,
  Eyebrow,
  SerifHero,
  GlassCard,
  Text,
  Glyph,
  PillCTA,
  showAppDialog,
} from '../../components/ui';
import { colors, spacing, radii } from '../../constants/tokens';
import { safeDismiss } from '../../lib/nav';
import { useAuth } from '../../lib/auth/store';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { setLocalShift } from '../../lib/local-shifts/store';
import { emitChange, EVENTS } from '../../lib/queries';
import { parseIcs, type IcsEvent } from '../../lib/calendar-import/parse';
import { t } from '../../lib/i18n';

export default function CalendarImport() {
  const { user } = useAuth();
  const [events, setEvents] = useState<IcsEvent[] | null>(null);
  const [picking, setPicking] = useState(false);
  const [importing, setImporting] = useState(false);

  const onPickFile = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/calendar', 'application/octet-stream', '*/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) {
        setPicking(false);
        return;
      }
      const uri = result.assets[0].uri;
      const raw = await FileSystem.readAsStringAsync(uri);
      const parsed = parseIcs(raw);
      setEvents(parsed);
    } catch (e: unknown) {
      // R12-4: was dumping raw parser exception into Alert body.
      // Generic localised body — actual error logged for dev (LogBox).
      if (__DEV__) console.warn('[calendar-import]', e);
      showAppDialog({
        title: t('calendar_import.parse_failed_title'),
        message: t('calendar_import.parse_failed_body'),
        actions: [{ label: t('calendar_import.ok'), style: 'cancel' }],
      });
    } finally {
      setPicking(false);
    }
  };

  const onImport = async () => {
    if (!events || events.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setImporting(true);

    const anon = !isSupabaseConfigured || !supabase || !user?.id;
    if (anon) {
      // Local store — type only; no start/end times persisted.
      for (const e of events) {
        setLocalShift(e.date, e.shiftType);
      }
      emitChange(EVENTS.shiftsChanged);
      setImporting(false);
      showAppDialog({
        title: t('calendar_import.done_title'),
        message: t('calendar_import.done_body', { count: events.length }),
        actions: [{ label: t('calendar_import.ok'), onPress: () => safeDismiss('/(tabs)/schedule') }],
      });
      return;
    }

    // SR1 fix: signed-in bulk insert — all-day off events (vacation,
    // holiday) have startTime=null. The old filter was dropping them
    // silently. Keep them, pad with 00:00 / 23:59. Off shifts are still
    // off regardless of times.
    const inserts = events.map((e) => {
      const start = new Date(e.date + 'T' + (e.startTime ?? '00:00') + ':00');
      const end = new Date(e.date + 'T' + (e.endTime ?? '23:59') + ':00');
      if (end <= start) end.setDate(end.getDate() + 1);
      return {
        user_id: user!.id,
        date: e.date,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        shift_type: e.shiftType,
        is_manual: false,
        notes: e.summary || null,
      };
    });

    // SR2 fix: pre-fetch existing dates and filter so a double-tap on
    // Import (or a re-import after editing the .ics) does not duplicate
    // rows. Mirrors lib/schedule/apply-template.ts logic.
    const { data: existing } = await supabase!
      .from('shifts')
      .select('date')
      .eq('user_id', user!.id)
      .in('date', inserts.map((i) => i.date));
    const existingDates = new Set((existing ?? []).map((r) => r.date));
    const newInserts = inserts.filter((i) => !existingDates.has(i.date));

    const { error } = newInserts.length > 0
      ? await supabase!.from('shifts').insert(newInserts)
      : { error: null };
    setImporting(false);
    if (error) {
      // R14-3: was leaking Supabase error.message into Alert body.
      if (__DEV__) console.warn('[calendar-import]', error);
      showAppDialog({
        title: t('calendar_import.import_failed_title'),
        message: t('calendar_import.import_failed_body'),
        actions: [{ label: t('calendar_import.ok'), style: 'cancel' }],
      });
      return;
    }
    emitChange(EVENTS.shiftsChanged);
    showAppDialog({
      title: t('calendar_import.done_title'),
      message: t('calendar_import.done_body', { count: inserts.length }),
      actions: [{ label: t('calendar_import.ok'), onPress: () => safeDismiss('/(tabs)/schedule') }],
    });
  };

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      floatingFooter={
        events && events.length > 0 ? (
          <PillCTA
            variant="primary"
            label={importing ? t('calendar_import.importing') : t('calendar_import.import_cta', { count: events.length })}
            disabled={importing}
            onPress={onImport}
          />
        ) : (
          <PillCTA
            variant="primary"
            label={picking ? t('calendar_import.picking') : t('calendar_import.pick_cta')}
            disabled={picking}
            onPress={onPickFile}
          />
        )
      }
    >
      <View style={styles.headerRow}>
        <View style={{ width: 22 }} />
        <Eyebrow>{t('calendar_import.eyebrow')}</Eyebrow>
        <Pressable
          onPress={() => safeDismiss('/(tabs)/schedule')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.close')}
        >
          <Glyph name="close" size={22} color="inkMuted" />
        </Pressable>
      </View>

      <View style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        <SerifHero>{t('calendar_import.title')}</SerifHero>
      </View>
      <Text variant="bodyMd" color="inkSubtle" style={{ marginBottom: spacing.huge }}>
        {t('calendar_import.subtitle')}
      </Text>

      {!events ? (
        <GlassCard variant="paper" padding="xxl">
          <View style={styles.iconCenter}>
            <Glyph name="calendar" size={48} color="primary" />
          </View>
          <View style={{ height: spacing.lg }} />
          <Text
            variant="titleMd"
            family="display"
            weight="medium"
            color="ink"
            align="center"
          >
            {t('calendar_import.pick_hint_title')}
          </Text>
          <Text variant="bodyMd" color="inkSubtle" align="center" style={{ marginTop: spacing.sm }}>
            {t('calendar_import.pick_hint_body')}
          </Text>
        </GlassCard>
      ) : events.length === 0 ? (
        <GlassCard variant="paper" padding="xxl">
          <Text variant="titleMd" family="display" weight="medium" color="ink" align="center">
            {t('calendar_import.empty_title')}
          </Text>
          <Text variant="bodyMd" color="inkSubtle" align="center" style={{ marginTop: spacing.sm }}>
            {t('calendar_import.empty_body')}
          </Text>
        </GlassCard>
      ) : (
        <>
          <Eyebrow style={{ marginBottom: spacing.md }}>
            {t('calendar_import.preview_label', { count: events.length })}
          </Eyebrow>
          {events.slice(0, 12).map((e, i) => {
            const tint =
              e.shiftType === 'day'
                ? colors.primary
                : e.shiftType === 'night'
                ? colors.dusk
                : colors.primaryContainer;
            return (
              <GlassCard
                key={`${e.date}-${i}`}
                variant="whisper"
                padding="lg"
                style={{ marginBottom: spacing.sm }}
              >
                <View style={styles.row}>
                  <View style={[styles.dot, { backgroundColor: tint }]} />
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMd" family="display" weight="medium" color="ink">
                      {e.date}
                      {e.startTime ? ` · ${e.startTime}–${e.endTime ?? '?'}` : ''}
                    </Text>
                    <Text variant="bodyMd" color="inkSubtle">
                      {e.summary || t(`shift_kind.${e.shiftType}`)}
                    </Text>
                  </View>
                  <Text variant="labelMd" family="body" weight="medium" color="inkMuted" uppercase>
                    {t(`shift_kind.${e.shiftType}`)}
                  </Text>
                </View>
              </GlassCard>
            );
          })}
          {events.length > 12 && (
            <Text variant="bodyMd" color="inkSubtle" align="center" style={{ marginTop: spacing.sm }}>
              {t('calendar_import.more', { count: events.length - 12 })}
            </Text>
          )}
        </>
      )}

      <View style={{ height: spacing.huge }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  iconCenter: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
  },
});
