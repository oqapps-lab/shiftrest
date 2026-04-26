/**
 * Edge Function: plan-generator
 *
 * Stage 6.6 — generates a personalised daily sleep plan from the user's
 * profile + shift context via OpenAI structured output. Caches into
 * `public.sleep_plans` (one row per (user_id, date)).
 *
 * Auth model:
 *   - Caller MUST pass a Supabase user JWT in the Authorization header.
 *   - The function uses service_role (env-injected) for DB writes that
 *     bypass RLS — necessary because the OpenAI call may take 2-5s and
 *     we don't want the user JWT timing out mid-write.
 *   - We still gate everything by user_id so RLS is logically respected.
 *
 * Input  (POST body):
 *   {
 *     date?: string;          // YYYY-MM-DD, defaults to today (UTC)
 *     force_refresh?: boolean // skip cache and regenerate
 *   }
 *
 * Output:
 *   {
 *     plan: SleepPlanRow,     // freshly generated or cached
 *     cached: boolean,
 *     generated_at: string
 *   }
 */

// deno-lint-ignore-file no-explicit-any

import { serve } from 'https://deno.land/std@0.220.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

// ─── Types ──────────────────────────────────────────────────────────────────

interface RequestBody {
  date?: string;
  force_refresh?: boolean;
}

interface ProfileRow {
  id: string;
  display_name: string | null;
  profession: string | null;
  chronotype: string | null;
  caffeine_cups_per_day: number | null;
  caffeine_type: string | null;
  caffeine_sensitivity: string | null;
  uses_melatonin: boolean | null;
  melatonin_dose_mg: number | null;
  has_children: boolean | null;
  family_commitments: { time?: string; description?: string }[] | null;
  commute_minutes: number;
  main_problem: string | null;
}

interface ShiftRow {
  date: string;
  shift_type: 'day' | 'night';
  start_time: string;
  end_time: string;
}

interface OpenAiPlanResponse {
  sleep_start: string;          // HH:MM 24h, local
  sleep_end: string;            // HH:MM 24h, local
  sleep_duration_minutes: number;
  caffeine_cutoff: string;      // HH:MM
  melatonin_at: string | null;  // HH:MM or null
  melatonin_dose_mg: number | null;
  melatonin_type: 'phase_advance' | 'phase_delay' | null;
  wind_down_start: string;      // HH:MM
  nap_start: string | null;     // HH:MM or null
  nap_end: string | null;       // HH:MM or null
  recommendations: {
    type: 'caffeine' | 'melatonin' | 'light' | 'nap' | 'sleep_window' | 'wind_down';
    eyebrow: string;            // ALL CAPS short label, e.g. "CAFFEINE"
    hero: string;               // e.g. "Last cup by 17:00"
    body: string;               // 1-2 sentence rationale
    locked: boolean;            // premium-gated
  }[];
  explanation: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

// Audited 2026-04-26 against /v1/models — gpt-5.4-mini is the latest
// small chat-capable model with structured-output support. When a newer
// 5.5 / 6.x lands, swap here (and re-confirm pricing in cost_cents calc).
const OPENAI_MODEL = 'gpt-5.4-mini';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are a sleep medicine expert advising shift workers (nurses, firefighters, factory workers).
Given a user's profile and their shift for a specific date, generate a single-day sleep plan.

Rules:
- Times are local (no timezone). Use 24-hour HH:MM strings.
- Sleep window must be at least 7 hours when possible, 6 hours minimum.
- Caffeine cutoff = at least 6 hours before sleep_start (slow metabolisers: 8 hours).
- Melatonin only if profile.uses_melatonin = true. Otherwise melatonin_at = null.
- Phase advance (advance sleep earlier) for transitioning night→day.
- Phase delay (push sleep later) for transitioning day→night.
- Wind down: 1-2 hours before sleep_start. Dim lights, no screens.
- Nap: only suggest a pre-shift nap (20 min cap) for night shifts.
- Recommendations: 4-5 items, each with eyebrow (UPPERCASE 1-2 words), hero (action+time, <40 chars), body (rationale, <120 chars).
- One recommendation MUST be type='melatonin' with locked=true if user is on a free tier (we'll always set locked=true for the melatonin slot to drive trial conversion — except when uses_melatonin=false, then omit melatonin entirely).
- Explanation: 1 short paragraph (~200 chars) explaining the strategy in plain language.

Output STRICTLY the JSON schema. No markdown fences. No extra prose.`;

const PLAN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'sleep_start', 'sleep_end', 'sleep_duration_minutes',
    'caffeine_cutoff', 'melatonin_at', 'melatonin_dose_mg', 'melatonin_type',
    'wind_down_start', 'nap_start', 'nap_end',
    'recommendations', 'explanation',
  ],
  properties: {
    sleep_start: { type: 'string', pattern: '^[0-2][0-9]:[0-5][0-9]$' },
    sleep_end: { type: 'string', pattern: '^[0-2][0-9]:[0-5][0-9]$' },
    sleep_duration_minutes: { type: 'integer', minimum: 60, maximum: 840 },
    caffeine_cutoff: { type: 'string', pattern: '^[0-2][0-9]:[0-5][0-9]$' },
    melatonin_at: { type: ['string', 'null'] },
    melatonin_dose_mg: { type: ['number', 'null'] },
    melatonin_type: { type: ['string', 'null'], enum: ['phase_advance', 'phase_delay', null] },
    wind_down_start: { type: 'string', pattern: '^[0-2][0-9]:[0-5][0-9]$' },
    nap_start: { type: ['string', 'null'] },
    nap_end: { type: ['string', 'null'] },
    recommendations: {
      type: 'array',
      minItems: 3,
      maxItems: 6,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['type', 'eyebrow', 'hero', 'body', 'locked'],
        properties: {
          type: { type: 'string', enum: ['caffeine', 'melatonin', 'light', 'nap', 'sleep_window', 'wind_down'] },
          eyebrow: { type: 'string', maxLength: 30 },
          hero: { type: 'string', maxLength: 60 },
          body: { type: 'string', maxLength: 200 },
          locked: { type: 'boolean' },
        },
      },
    },
    explanation: { type: 'string', maxLength: 500 },
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function todayUtcIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildLocalTimestamp(date: string, hhmm: string): string {
  // Returns ISO with offset-less Z; client treats as local.
  return `${date}T${hhmm}:00`;
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

// ─── Main ───────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { ...corsHeaders(), 'content-type': 'application/json' },
    });
  }

  const startTs = Date.now();

  // Auth: extract user from JWT.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'missing_auth' }), {
      status: 401,
      headers: { ...corsHeaders(), 'content-type': 'application/json' },
    });
  }
  const userJwt = authHeader.slice('Bearer '.length);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const openaiKey = Deno.env.get('OPENAI_API_KEY');

  if (!supabaseUrl || !serviceRoleKey || !openaiKey) {
    return new Response(JSON.stringify({ error: 'missing_env' }), {
      status: 500,
      headers: { ...corsHeaders(), 'content-type': 'application/json' },
    });
  }

  // Two clients: one as user (JWT) for identity check, one as service (admin) for writes.
  const userClient = createClient(supabaseUrl, serviceRoleKey, {
    global: { headers: { Authorization: `Bearer ${userJwt}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userRes, error: userErr } = await userClient.auth.getUser(userJwt);
  if (userErr || !userRes?.user) {
    return new Response(JSON.stringify({ error: 'invalid_jwt', details: userErr?.message }), {
      status: 401,
      headers: { ...corsHeaders(), 'content-type': 'application/json' },
    });
  }
  const userId = userRes.user.id;

  // Parse body.
  let body: RequestBody = {};
  try {
    if (req.headers.get('content-type')?.includes('application/json')) {
      body = await req.json();
    }
  } catch {
    // empty body OK
  }
  const date = body.date ?? todayUtcIso();
  const forceRefresh = !!body.force_refresh;

  // Cache check.
  if (!forceRefresh) {
    const { data: cached } = await adminClient
      .from('sleep_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .is('deleted_at', null)
      .maybeSingle();
    if (cached) {
      return new Response(
        JSON.stringify({ plan: cached, cached: true, generated_at: cached.created_at }),
        { headers: { ...corsHeaders(), 'content-type': 'application/json' } },
      );
    }
  }

  // Read profile + shift context.
  const { data: profile, error: profileErr } = await adminClient
    .from('profiles')
    .select(
      'id, display_name, profession, chronotype, caffeine_cups_per_day, caffeine_type, caffeine_sensitivity, uses_melatonin, melatonin_dose_mg, has_children, family_commitments, commute_minutes, main_problem',
    )
    .eq('id', userId)
    .maybeSingle<ProfileRow>();
  if (profileErr || !profile) {
    return new Response(JSON.stringify({ error: 'profile_not_found' }), {
      status: 404,
      headers: { ...corsHeaders(), 'content-type': 'application/json' },
    });
  }

  const { data: shift } = await adminClient
    .from('shifts')
    .select('date, shift_type, start_time, end_time')
    .eq('user_id', userId)
    .eq('date', date)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<ShiftRow>();

  // Build user prompt.
  const userPrompt = JSON.stringify({
    date,
    profile: {
      profession: profile.profession,
      chronotype: profile.chronotype,
      caffeine_cups_per_day: profile.caffeine_cups_per_day,
      caffeine_type: profile.caffeine_type,
      caffeine_sensitivity: profile.caffeine_sensitivity,
      uses_melatonin: profile.uses_melatonin,
      melatonin_dose_mg: profile.melatonin_dose_mg,
      has_children: profile.has_children,
      commute_minutes: profile.commute_minutes,
      main_problem: profile.main_problem,
    },
    shift: shift
      ? {
          type: shift.shift_type,
          start: shift.start_time,
          end: shift.end_time,
        }
      : { type: 'off' },
  });

  // Call OpenAI.
  const openaiRes = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'sleep_plan',
          strict: true,
          schema: PLAN_SCHEMA,
        },
      },
      temperature: 0.4,
    }),
  });

  if (!openaiRes.ok) {
    const errText = await openaiRes.text();
    return new Response(
      JSON.stringify({ error: 'openai_failed', status: openaiRes.status, details: errText }),
      { status: 502, headers: { ...corsHeaders(), 'content-type': 'application/json' } },
    );
  }

  const openaiJson = await openaiRes.json();
  const content = openaiJson.choices?.[0]?.message?.content;
  let parsed: OpenAiPlanResponse;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'openai_invalid_json', raw: content }),
      { status: 502, headers: { ...corsHeaders(), 'content-type': 'application/json' } },
    );
  }

  const tokensInput = openaiJson.usage?.prompt_tokens ?? 0;
  const tokensOutput = openaiJson.usage?.completion_tokens ?? 0;
  // gpt-5.4-mini pricing (verify on https://platform.openai.com/docs/pricing
  // before launch). Conservative placeholder roughly = 5.4-mini ≈ $0.25/M in,
  // $1.00/M out → cents per call = ceil(in*0.0000025 + out*0.00001).
  const costCents = Math.ceil(tokensInput * 0.0000025 + tokensOutput * 0.00001);

  // Log AI request.
  const { data: aiReq } = await adminClient
    .from('ai_requests')
    .insert({
      user_id: userId,
      request_type: 'sleep_plan',
      prompt: userPrompt.slice(0, 2000),
      response: parsed,
      model: OPENAI_MODEL,
      tokens_input: tokensInput,
      tokens_output: tokensOutput,
      cost_cents: costCents,
      duration_ms: Date.now() - startTs,
      status: 'success',
    })
    .select('id')
    .maybeSingle();

  // Build sleep_plans row.
  const planRow = {
    user_id: userId,
    shift_id: null,
    date,
    plan_type: shift ? (shift.shift_type === 'night' ? 'work_day' : 'work_day') : 'day_off',
    sleep_start: buildLocalTimestamp(date, parsed.sleep_start),
    sleep_end: buildLocalTimestamp(date, parsed.sleep_end),
    sleep_duration_minutes: parsed.sleep_duration_minutes,
    caffeine_cutoff_at: buildLocalTimestamp(date, parsed.caffeine_cutoff),
    melatonin_at: parsed.melatonin_at ? buildLocalTimestamp(date, parsed.melatonin_at) : null,
    melatonin_dose_mg: parsed.melatonin_dose_mg,
    melatonin_type: parsed.melatonin_type,
    nap_start: parsed.nap_start ? buildLocalTimestamp(date, parsed.nap_start) : null,
    nap_end: parsed.nap_end ? buildLocalTimestamp(date, parsed.nap_end) : null,
    wind_down_start: parsed.wind_down_start ? buildLocalTimestamp(date, parsed.wind_down_start) : null,
    explanation: parsed.explanation,
    generation_method: 'ai',
    ai_request_id: aiReq?.id ?? null,
    metadata: { recommendations: parsed.recommendations },
  };

  // Soft-delete any prior plan for this date, then insert new (upsert pattern
  // — `WHERE deleted_at IS NULL` unique index lets us keep history).
  await adminClient
    .from('sleep_plans')
    .update({ deleted_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('date', date)
    .is('deleted_at', null);

  const { data: inserted, error: insertErr } = await adminClient
    .from('sleep_plans')
    .insert(planRow)
    .select('*')
    .maybeSingle();

  if (insertErr) {
    return new Response(
      JSON.stringify({ error: 'insert_failed', details: insertErr.message }),
      { status: 500, headers: { ...corsHeaders(), 'content-type': 'application/json' } },
    );
  }

  return new Response(
    JSON.stringify({ plan: inserted, cached: false, generated_at: inserted!.created_at }),
    { headers: { ...corsHeaders(), 'content-type': 'application/json' } },
  );
});
