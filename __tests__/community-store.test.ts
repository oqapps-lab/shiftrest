/**
 * Unit tests for lib/community/store.tsx — submitStory().
 *
 * Covers the validation + error branches that share-story.tsx maps to
 * localised Alert copy (R12-1): empty / too_long / insert-error / success.
 * Supabase is mocked as configured so we exercise the post-guard logic.
 */

const mockSingle = jest.fn();
const mockInvoke = jest.fn((..._args: unknown[]) => ({ catch: () => undefined }));

jest.mock('../lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: () => ({
      insert: () => ({
        select: () => ({
          single: mockSingle,
        }),
      }),
    }),
    // Deferred ref (arrow) — eager `invoke: mockInvoke` would capture the
    // const while still in TDZ at mock-factory eval time.
    functions: { invoke: (...args: unknown[]) => mockInvoke(...args) },
  },
}));

import { submitStory } from '../lib/community/store';

beforeEach(() => {
  mockSingle.mockReset();
  mockInvoke.mockReset();
  mockInvoke.mockReturnValue({ catch: () => undefined });
});

describe('community/store — submitStory', () => {
  test('empty / whitespace-only text → error empty', async () => {
    const r = await submitStory('   ', 'nurse', 'en', 'user-1');
    expect(r).toEqual({ ok: false, error: 'empty' });
    expect(mockSingle).not.toHaveBeenCalled();
  });

  test('over 1000 chars → error too_long', async () => {
    const r = await submitStory('x'.repeat(1001), 'nurse', 'en', 'user-1');
    expect(r).toEqual({ ok: false, error: 'too_long' });
    expect(mockSingle).not.toHaveBeenCalled();
  });

  test('exactly 1000 chars is allowed (boundary)', async () => {
    mockSingle.mockResolvedValue({ data: { id: 'story-9' }, error: null });
    const r = await submitStory('x'.repeat(1000), 'nurse', 'en', 'user-1');
    expect(r).toEqual({ ok: true, id: 'story-9' });
  });

  test('insert error → propagates error.message', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'duplicate key' } });
    const r = await submitStory('Warm shower 90 min before bed.', 'nurse', 'en', 'user-1');
    expect(r).toEqual({ ok: false, error: 'duplicate key' });
  });

  test('insert returns no data + no error → unknown', async () => {
    mockSingle.mockResolvedValue({ data: null, error: null });
    const r = await submitStory('Magnesium at night.', 'nurse', 'en', 'user-1');
    expect(r).toEqual({ ok: false, error: 'unknown' });
  });

  test('success → ok + id, and fires summarize-story edge fn', async () => {
    mockSingle.mockResolvedValue({ data: { id: 'story-42' }, error: null });
    const r = await submitStory('Blackout curtains changed everything.', 'firefighter', 'en', 'user-7');
    expect(r).toEqual({ ok: true, id: 'story-42' });
    expect(mockInvoke).toHaveBeenCalledWith('summarize-story', expect.objectContaining({
      body: expect.objectContaining({ id: 'story-42' }),
    }));
  });

  test('trims before length checks + before insert', async () => {
    mockSingle.mockResolvedValue({ data: { id: 'story-1' }, error: null });
    await submitStory('   hello   ', 'nurse', 'en', 'user-1');
    // edge fn receives trimmed text, not the padded original
    expect(mockInvoke).toHaveBeenCalledWith('summarize-story', expect.objectContaining({
      body: expect.objectContaining({ raw_text: 'hello' }),
    }));
  });
});
