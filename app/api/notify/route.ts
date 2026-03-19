import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';
import { sendTelegramMessage } from '@/lib/notifications/telegram';
import { sendDiscordMessage } from '@/lib/notifications/discord';
import { sendTestEmail } from '@/lib/notifications/email';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { type } = await req.json();

  const { data: settings } = await supabaseAdmin
    .from('pa_notification_settings')
    .select('*')
    .eq('user_id', session.userId)
    .single();

  if (!settings) {
    return NextResponse.json({ error: 'No notification settings found' }, { status: 404 });
  }

  if (type === 'email') {
    const sent = await sendTestEmail(session.email);
    return NextResponse.json({ success: sent });
  }

  if (type === 'telegram') {
    if (!settings.telegram_bot_token || !settings.telegram_chat_id) {
      return NextResponse.json({ error: 'Telegram not configured' }, { status: 400 });
    }
    const msg = '🔔 <b>Test Alert</b>\n\nYour Telegram notifications are working!';
    const sent = await sendTelegramMessage(settings.telegram_bot_token, settings.telegram_chat_id, msg);
    return NextResponse.json({ success: sent });
  }

  if (type === 'discord') {
    if (!settings.discord_webhook_url) {
      return NextResponse.json({ error: 'Discord not configured' }, { status: 400 });
    }
    const sent = await sendDiscordMessage(
      settings.discord_webhook_url,
      'TEST', 'above', 100000, 100500, 'Test notification — your Discord webhook is working!'
    );
    return NextResponse.json({ success: sent });
  }

  return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
}
