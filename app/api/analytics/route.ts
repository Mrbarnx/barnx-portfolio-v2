import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { getSupabaseConfig, hasSupabaseConfig } from '@/lib/supabase/config';

const eventSchema = z.object({
  visitorId: z.string().uuid(), sessionId: z.string().uuid(),
  eventName: z.enum(['page_view', 'project_open', 'resource_open', 'download', 'external_click']),
  pathname: z.string().min(1).max(500).startsWith('/'), target: z.string().max(500).optional(),
  referrerHost: z.string().max(255).optional(),
});

function deviceType(userAgent: string) {
  if (/ipad|tablet/i.test(userAgent)) return 'tablet';
  if (/mobile|android|iphone/i.test(userAgent)) return 'mobile';
  return userAgent ? 'desktop' : 'unknown';
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseConfig()) return new NextResponse(null, { status: 204 });
  const parsed = eventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid event.' }, { status: 400 });
  const { url, anonKey } = getSupabaseConfig();
  const db = createClient(url, anonKey, { auth: { persistSession: false } });
  const country = request.headers.get('x-vercel-ip-country')?.toUpperCase();
  const { error } = await db.rpc('record_analytics_event', {
    p_visitor_id: parsed.data.visitorId, p_session_id: parsed.data.sessionId,
    p_event_name: parsed.data.eventName, p_pathname: parsed.data.pathname,
    p_target: parsed.data.target ?? null, p_referrer_host: parsed.data.referrerHost ?? null,
    p_country_code: country?.match(/^[A-Z]{2}$/) ? country : null,
    p_device_type: deviceType(request.headers.get('user-agent') ?? ''),
  });
  return new NextResponse(null, { status: error ? 202 : 204 });
}
