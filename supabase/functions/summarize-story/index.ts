/**
 * Edge Function: summarize-story
 *
 * F20-P2 — Takes a user-submitted raw story (1-1000 chars), produces
 * a 1-2 sentence anonymized summary via OpenAI, and writes it back to
 * the community_stories row. Approved=false is kept; a human moderator
 * flips it to true after review (Supabase Studio).
 *
 * Auth model: caller MUST pass a Supabase user JWT (verified by
 * Supabase platform). We write with service_role so the update bypasses
 * RLS — the row reference is gated by id which we own.
 *
 * Input  (POST body):
 *   { id: string, raw_text: string, locale: string }
 *
 * Output:
 *   { ok: true, summary: string } | { ok: false, error: string }
 */

// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY')!;

const SYSTEM = `You rewrite first-person "what helps me sleep" notes from shift workers into a clean 1-2 sentence anonymous summary, third person.

Rules:
- Keep the SPECIFIC mechanism if mentioned (e.g. weighted blanket 8kg, magnesium glycinate, 10-min walk after dinner).
- Strip names, employers, ages, family-member names, locations, identifying details.
- No quoting. Rewrite in your own voice.
- Tone: calm, factual, encouraging — not preachy, not "thoughts and prayers".
- Match the source language ({{LOCALE}}). Never switch languages.
- Output ONLY the summary text, nothing else.
- If the input has nothing about sleep (off-topic, spam, abusive), output exactly: SKIP
`;

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

async function summarize(rawText: string, locale: string): Promise<string | null> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      max_tokens: 200,
      messages: [
        { role: 'system', content: SYSTEM.replace('{{LOCALE}}', locale) },
        { role: 'user', content: rawText },
      ],
    }),
  });
  if (!res.ok) {
    console.error('openai error', res.status, await res.text());
    return null;
  }
  const data = await res.json();
  const out = data.choices?.[0]?.message?.content?.trim() ?? '';
  if (!out || out === 'SKIP') return null;
  return out;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders(req) });

  let body: { id?: string; raw_text?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_json' }, { status: 400, headers: corsHeaders(req) });
  }
  const { id, raw_text, locale = 'en' } = body;
  if (!id || !raw_text) {
    return Response.json({ ok: false, error: 'missing_fields' }, { status: 400, headers: corsHeaders(req) });
  }

  // R19/S-1 FIX: verify caller owns the story id before mutating it.
  // Without this, any signed-in user could pass another user's story id
  // + arbitrary raw_text → call OpenAI on attacker text and overwrite
  // the victim's ai_summary. Use the caller's JWT to look up auth.uid()
  // and gate the UPDATE on user_id = uid.
  const authHeader = req.headers.get('authorization') ?? '';
  const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!jwt) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401, headers: corsHeaders(req) });
  }
  const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser(jwt);
  if (userErr || !userData?.user) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401, headers: corsHeaders(req) });
  }
  const callerUid = userData.user.id;

  try {
    const summary = await summarize(raw_text, locale);
    const supa = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const patch: Record<string, unknown> = { ai_summary: summary, updated_at: new Date().toISOString() };
    // If the moderator flagged SKIP / off-topic, soft-delete by leaving
    // ai_summary null AND approved=false — caller won't render it.
    // R19/S-1: scope the UPDATE to the caller's own rows.
    const { error } = await supa
      .from('community_stories')
      .update(patch)
      .eq('id', id)
      .eq('user_id', callerUid);
    if (error) {
      console.error('db update error', error);
      return Response.json({ ok: false, error: error.message }, { status: 500, headers: corsHeaders(req) });
    }
    return Response.json({ ok: true, summary }, { headers: corsHeaders(req) });
  } catch (e) {
    console.error('summarize error', e);
    return Response.json({ ok: false, error: String(e) }, { status: 500, headers: corsHeaders(req) });
  }
});
