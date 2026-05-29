/**
 * Unit tests for lib/calendar-import/parse.ts
 * .ics parser correctness + shift classification.
 */

import { parseIcs, classifyShiftType } from '../lib/calendar-import/parse';

describe('classifyShiftType', () => {
  test('detects night keywords (en)', () => {
    expect(classifyShiftType('Night shift')).toBe('night');
    expect(classifyShiftType('NIGHT')).toBe('night');
  });
  test('detects night keywords (ru)', () => {
    expect(classifyShiftType('Ночная смена')).toBe('night');
  });
  test('detects day keywords', () => {
    expect(classifyShiftType('Day shift')).toBe('day');
    expect(classifyShiftType('Morning shift')).toBe('day');
  });
  test('detects off keywords', () => {
    expect(classifyShiftType('Off day')).toBe('off');
    expect(classifyShiftType('Vacation')).toBe('off');
    expect(classifyShiftType('Holiday')).toBe('off');
    expect(classifyShiftType('Выходной')).toBe('off');
  });
  test('defaults to day for ambiguous', () => {
    expect(classifyShiftType('Random meeting')).toBe('day');
  });
});

describe('parseIcs — basic', () => {
  test('empty string returns empty array', () => {
    expect(parseIcs('')).toEqual([]);
  });

  test('parses single VEVENT all-day', () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'DTSTART;VALUE=DATE:20260527',
      'DTEND;VALUE=DATE:20260528',
      'SUMMARY:Off day',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const events = parseIcs(ics);
    expect(events).toHaveLength(1);
    expect(events[0].date).toBe('2026-05-27');
    expect(events[0].startTime).toBeNull();
    expect(events[0].shiftType).toBe('off');
  });

  test('parses VEVENT with local datetime', () => {
    const ics = [
      'BEGIN:VEVENT',
      'DTSTART:20260527T070000',
      'DTEND:20260527T190000',
      'SUMMARY:Day shift',
      'END:VEVENT',
    ].join('\r\n');
    const events = parseIcs(ics);
    expect(events).toHaveLength(1);
    expect(events[0].date).toBe('2026-05-27');
    expect(events[0].startTime).toBe('07:00');
    expect(events[0].endTime).toBe('19:00');
    expect(events[0].shiftType).toBe('day');
  });

  test('parses multiple VEVENT', () => {
    const ics = [
      'BEGIN:VEVENT',
      'DTSTART:20260527T070000',
      'SUMMARY:Day shift',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'DTSTART:20260528T190000',
      'SUMMARY:Night shift',
      'END:VEVENT',
    ].join('\r\n');
    const events = parseIcs(ics);
    expect(events).toHaveLength(2);
    expect(events[0].shiftType).toBe('day');
    expect(events[1].shiftType).toBe('night');
  });

  test('handles LF line endings', () => {
    const ics = 'BEGIN:VEVENT\nDTSTART:20260527T070000\nSUMMARY:Day shift\nEND:VEVENT';
    const events = parseIcs(ics);
    expect(events).toHaveLength(1);
  });

  test('classifies night shift from summary', () => {
    const ics = [
      'BEGIN:VEVENT',
      'DTSTART:20260527T190000',
      'SUMMARY:Night ICU',
      'END:VEVENT',
    ].join('\r\n');
    expect(parseIcs(ics)[0].shiftType).toBe('night');
  });

  test('ignores content outside VEVENT', () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:test',
      'BEGIN:VTIMEZONE',
      'TZID:UTC',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      'DTSTART:20260527T070000',
      'SUMMARY:Day shift',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const events = parseIcs(ics);
    expect(events).toHaveLength(1);
  });

  test('skips events without DTSTART', () => {
    const ics = [
      'BEGIN:VEVENT',
      'SUMMARY:Broken event',
      'END:VEVENT',
    ].join('\r\n');
    expect(parseIcs(ics)).toHaveLength(0);
  });

  test('handles SUMMARY with colons', () => {
    const ics = [
      'BEGIN:VEVENT',
      'DTSTART:20260527T070000',
      'SUMMARY:Time: 07:00 night',
      'END:VEVENT',
    ].join('\r\n');
    const events = parseIcs(ics);
    expect(events[0].summary).toBe('Time: 07:00 night');
    expect(events[0].shiftType).toBe('night');
  });

  test('unfolds long lines (RFC5545 §3.1)', () => {
    const ics = [
      'BEGIN:VEVENT',
      'DTSTART:20260527T070000',
      'SUMMARY:Day',
      ' shift',
      'END:VEVENT',
    ].join('\r\n');
    const events = parseIcs(ics);
    // The summary should be unfolded to "Dayshift"
    expect(events[0].summary).toBe('Dayshift');
  });

  test('parses UTC datetime DTSTART (Z suffix) and converts to local', () => {
    const ics = [
      'BEGIN:VEVENT',
      'DTSTART:20260527T140000Z',  // 14:00 UTC
      'DTEND:20260527T180000Z',
      'SUMMARY:Day shift',
      'END:VEVENT',
    ].join('\r\n');
    const events = parseIcs(ics);
    expect(events).toHaveLength(1);
    // date may differ depending on local timezone of the test runner,
    // but it should be valid YYYY-MM-DD and time HH:MM
    expect(events[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(events[0].startTime).toMatch(/^\d{2}:\d{2}$/);
  });

  test('ignores lines without colon (invalid property syntax)', () => {
    const ics = [
      'BEGIN:VEVENT',
      'DTSTART:20260527T070000',
      'GARBAGE_NO_COLON',
      'SUMMARY:Day',
      'END:VEVENT',
    ].join('\r\n');
    const events = parseIcs(ics);
    expect(events).toHaveLength(1);
    expect(events[0].summary).toBe('Day');
  });

  test('invalid DTSTART format → skipped', () => {
    const ics = [
      'BEGIN:VEVENT',
      'DTSTART:not-a-date',
      'SUMMARY:Broken',
      'END:VEVENT',
    ].join('\r\n');
    expect(parseIcs(ics)).toHaveLength(0);
  });
});
