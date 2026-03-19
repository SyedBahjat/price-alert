import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getPricesForAlerts } from '@/lib/prices/resolver';
import { sendTelegramMessage, formatAlertMessage } from '@/lib/notifications/telegram';
import { sendDiscordMessage } from '@/lib/notifications/discord';
import { sendAlertEmail } from '@/lib/notifications/email';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all active alerts
    const { data: alerts, error } = await supabaseAdmin
      .from('pa_alerts')
      .select('*')
      .eq('is_active', true);

    if (error || !alerts?.length) {
      return NextResponse.json({ checked: 0, triggered: 0 });
    }

    // Fetch prices for all unique symbols
    const prices = await getPricesForAlerts(alerts);

    let triggered = 0;

    for (const alert of alerts) {
      const currentPrice = prices[alert.symbol];
      if (!currentPrice) continue;

      // Update last checked price
      await supabaseAdmin
        .from('pa_alerts')
        .update({ last_checked_price: currentPrice })
        .eq('id', alert.id);

      // Check if alert should trigger
      const shouldTrigger =
        (alert.direction === 'above' && currentPrice >= alert.target_price) ||
        (alert.direction === 'below' && currentPrice <= alert.target_price);

      if (!shouldTrigger) continue;
      triggered++;

      // Get user's notification settings
      const { data: settings } = await supabaseAdmin
        .from('pa_notification_settings')
        .select('*')
        .eq('user_id', alert.user_id)
        .single();

      const channels: string[] = [];

      // Get user email for email notifications
      const { data: user } = await supabaseAdmin
        .from('pa_users')
        .select('email')
        .eq('id', alert.user_id)
        .single();

      // Send Email
      if (settings?.email_enabled !== false && user?.email) {
        const sent = await sendAlertEmail(
          user.email, alert.symbol, alert.direction, alert.target_price, currentPrice, alert.note
        );
        if (sent) channels.push('email');
      }

      if (settings?.telegram_enabled && settings.telegram_bot_token && settings.telegram_chat_id) {
        const msg = formatAlertMessage(
          alert.symbol, alert.direction, alert.target_price, currentPrice, alert.note
        );
        const sent = await sendTelegramMessage(settings.telegram_bot_token, settings.telegram_chat_id, msg);
        if (sent) channels.push('telegram');
      }

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
        user_id: alert.user_id,
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
    }

    return NextResponse.json({ checked: alerts.length, triggered });
  } catch (error) {
    console.error('Check prices error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
