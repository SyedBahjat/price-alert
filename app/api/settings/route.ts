import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('pa_notification_settings')
    .select('telegram_bot_token, telegram_chat_id, telegram_enabled, discord_webhook_url, discord_enabled, email_enabled')
    .eq('user_id', session.userId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Include the user's email so the settings page can show it
  return NextResponse.json({ ...data, email: session.email });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from('pa_notification_settings')
    .upsert({
      user_id: session.userId,
      telegram_bot_token: body.telegram_bot_token || null,
      telegram_chat_id: body.telegram_chat_id || null,
      telegram_enabled: body.telegram_enabled || false,
      discord_webhook_url: body.discord_webhook_url || null,
      discord_enabled: body.discord_enabled || false,
      email_enabled: body.email_enabled ?? true,
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
