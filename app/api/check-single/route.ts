import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';
import { sendTelegramMessage, formatAlertMessage } from '@/lib/notifications/telegram';
import { sendDiscordMessage } from '@/lib/notifications/discord';
import { sendAlertEmail } from '@/lib/notifications/email';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { alertId, currentPrice } = await req.json();
  if (!alertId || !currentPrice) {
    return NextResponse.json({ error: 'Missing alertId or currentPrice' }, { status: 400 });
  }

  const { data: alert } = await supabaseAdmin
    .from('pa_alerts')
    .select('*')
    .eq('id', alertId)
    .eq('user_id', session.userId)
    .single();

  if (!alert) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });

  const { data: settings } = await supabaseAdmin
    .from('pa_notification_settings')
    .select('*')
    .eq('user_id', session.userId)
    .single();

  const channels: string[] = [];

  // Send Email
  if (settings?.email_enabled !== false) {
    const sent = await sendAlertEmail(
      session.email, alert.symbol, alert.direction, alert.target_price, currentPrice, alert.note
    );
    if (sent) channels.push('email');
  }

  // Send Telegram
  if (settings?.telegram_enabled && settings.telegram_bot_token && settings.telegram_chat_id) {
    const msg = formatAlertMessage(
      alert.symbol, alert.direction, alert.target_price, currentPrice, alert.note
    );
    const sent = await sendTelegramMessage(settings.telegram_bot_token, settings.telegram_chat_id, msg);
    if (sent) channels.push('telegram');
  }

  // Send Discord
  if (settings?.discord_enabled && settings.discord_webhook_url) {
    const sent = await sendDiscordMessage(
      settings.discord_webhook_url,
      alert.symbol, alert.direction, alert.target_price, currentPrice, alert.note
    );
    if (sent) channels.push('discord');
  }

  // Log to history
  await supabaseAdmin.from('pa_alert_history').insert({
    alert_id: alert.id,
    user_id: session.userId,
    symbol: alert.symbol,
    target_price: alert.target_price,
    triggered_price: currentPrice,
    direction: alert.direction,
    notification_sent: channels.length > 0,
    notification_channels: channels,
  });

  // Deactivate non-recurring alerts
  if (!alert.is_recurring) {
    await supabaseAdmin
      .from('pa_alerts')
      .update({ is_active: false, triggered_at: new Date().toISOString() })
      .eq('id', alert.id);
  }

  await supabaseAdmin
    .from('pa_alerts')
    .update({ last_checked_price: currentPrice })
    .eq('id', alert.id);

  return NextResponse.json({ triggered: true, channels });
}
