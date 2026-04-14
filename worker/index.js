/**
 * PriceAlert Background Worker
 *
 * Runs 24/7 as a persistent process.
 * - Binance WebSocket for crypto (every tick, ~100ms)
 * - Yahoo Finance REST for stocks (every 30s)
 * - Checks all active alerts continuously
 * - Sends Email + Telegram + Discord notifications
 *
 * Deploy on Render.com (free tier) as a Background Worker
 */

const WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

// ── Config ──────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;
const STOCK_POLL_INTERVAL = 30_000; // 30 seconds
const ALERT_REFRESH_INTERVAL = 10_000; // refresh alerts from DB every 10s

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const resend = new Resend(RESEND_KEY);

// ── State ───────────────────────────────────────────
let alerts = [];
let notificationSettings = {};
let userEmails = {};
let prices = {};
let triggeredAlertIds = new Set();

// ── Logging ─────────────────────────────────────────
function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

// ── Load alerts & settings from DB ──────────────────
async function refreshAlerts() {
  try {
    const { data, error } = await supabase
      .from('pa_alerts')
      .select('*')
      .eq('is_active', true);

    if (error) { log(`Error fetching alerts: ${error.message}`); return; }
    alerts = data || [];

    // Get unique user IDs
    const userIds = [...new Set(alerts.map(a => a.user_id))];

    // Fetch notification settings for all users
    for (const userId of userIds) {
      if (!notificationSettings[userId]) {
        const { data: settings } = await supabase
          .from('pa_notification_settings')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (settings) notificationSettings[userId] = settings;
      }

      if (!userEmails[userId]) {
        const { data: user } = await supabase
          .from('pa_users')
          .select('email')
          .eq('id', userId)
          .single();
        if (user) userEmails[userId] = user.email;
      }
    }

    log(`Loaded ${alerts.length} active alerts for ${userIds.length} users`);
  } catch (e) {
    log(`Error refreshing alerts: ${e.message}`);
  }
}

// ── Notification senders ────────────────────────────
async function sendEmail(to, symbol, direction, targetPrice, currentPrice, note) {
  try {
    const emoji = direction === 'above' ? '🟢' : '🔴';
    const arrow = direction === 'above' ? '↑' : '↓';
    await resend.emails.send({
      from: 'PriceAlert <alerts@studyingabroadnow.info>',
      to,
      subject: `${emoji} ${symbol} hit your ${direction} target of $${targetPrice.toLocaleString()}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0c0c1d;color:#e8e8f0;border-radius:16px;overflow:hidden;">
          <div style="padding:32px;text-align:center;">
            <div style="font-size:48px;margin-bottom:8px;">${emoji}</div>
            <h1 style="margin:0 0 4px;font-size:22px;">Price Alert Triggered</h1>
            <p style="margin:0;color:#9ca3af;font-size:14px;">${symbol} is now ${direction} your target</p>
          </div>
          <div style="padding:0 32px 32px;">
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#9ca3af;font-size:14px;">${arrow} Target</td><td style="padding:8px 0;text-align:right;font-family:monospace;font-size:16px;font-weight:600;">$${targetPrice.toLocaleString()}</td></tr>
                <tr><td style="padding:8px 0;color:#9ca3af;font-size:14px;">💰 Current</td><td style="padding:8px 0;text-align:right;font-family:monospace;font-size:16px;font-weight:600;color:${direction === 'above' ? '#00d2a0' : '#ff4757'};">$${currentPrice.toLocaleString()}</td></tr>
              </table>
              ${note ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06);color:#9ca3af;font-size:13px;">📝 ${note}</div>` : ''}
            </div>
          </div>
        </div>`,
    });
    return true;
  } catch { return false; }
}

async function sendTelegram(botToken, chatId, symbol, direction, targetPrice, currentPrice, note) {
  try {
    const emoji = direction === 'above' ? '🟢' : '🔴';
    const arrow = direction === 'above' ? '↑' : '↓';
    let msg = `${emoji} <b>Price Alert Triggered!</b>\n\n`;
    msg += `<b>${symbol}</b> is now ${direction} your target\n`;
    msg += `${arrow} Target: $${targetPrice.toLocaleString()}\n`;
    msg += `💰 Current: $${currentPrice.toLocaleString()}\n`;
    if (note) msg += `\n📝 ${note}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch { return false; }
}

async function sendDiscord(webhookUrl, symbol, direction, targetPrice, currentPrice, note) {
  try {
    const color = direction === 'above' ? 0x00d2a0 : 0xff4757;
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: `${direction === 'above' ? '🟢' : '🔴'} Price Alert: ${symbol}`,
          color,
          fields: [
            { name: `${direction === 'above' ? '↑' : '↓'} Target`, value: `$${targetPrice.toLocaleString()}`, inline: true },
            { name: '💰 Current', value: `$${currentPrice.toLocaleString()}`, inline: true },
            ...(note ? [{ name: '📝 Note', value: note }] : []),
          ],
          timestamp: new Date().toISOString(),
        }],
      }),
    });
    return res.ok;
  } catch { return false; }
}

// ── Alert checker ───────────────────────────────────
async function checkAlert(alert, currentPrice) {
  const key = `${alert.id}-${currentPrice.toFixed(2)}`;
  if (triggeredAlertIds.has(alert.id)) return;

  const shouldTrigger =
    (alert.direction === 'above' && currentPrice >= alert.target_price) ||
    (alert.direction === 'below' && currentPrice <= alert.target_price);

  if (!shouldTrigger) return;

  triggeredAlertIds.add(alert.id);
  log(`🔔 TRIGGERED: ${alert.symbol} ${alert.direction} $${alert.target_price} (current: $${currentPrice})`);

  const settings = notificationSettings[alert.user_id] || {};
  const email = userEmails[alert.user_id];
  const channels = [];

  // Send all notifications in parallel
  const promises = [];

  if (settings.email_enabled !== false && email) {
    promises.push(
      sendEmail(email, alert.symbol, alert.direction, alert.target_price, currentPrice, alert.note)
        .then(ok => { if (ok) channels.push('email'); })
    );
  }

  if (settings.telegram_enabled && settings.telegram_bot_token && settings.telegram_chat_id) {
    promises.push(
      sendTelegram(settings.telegram_bot_token, settings.telegram_chat_id, alert.symbol, alert.direction, alert.target_price, currentPrice, alert.note)
        .then(ok => { if (ok) channels.push('telegram'); })
    );
  }

  if (settings.discord_enabled && settings.discord_webhook_url) {
    promises.push(
      sendDiscord(settings.discord_webhook_url, alert.symbol, alert.direction, alert.target_price, currentPrice, alert.note)
        .then(ok => { if (ok) channels.push('discord'); })
    );
  }

  await Promise.allSettled(promises);

  log(`  → Sent to: ${channels.length > 0 ? channels.join(', ') : 'no channels configured'}`);

  // Log to history
  await supabase.from('pa_alert_history').insert({
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
    await supabase
      .from('pa_alerts')
      .update({ is_active: false, triggered_at: new Date().toISOString() })
      .eq('id', alert.id);
  } else {
    // For recurring, allow re-trigger after price moves away and comes back
    setTimeout(() => triggeredAlertIds.delete(alert.id), 60_000);
  }

  // Update last checked price
  await supabase
    .from('pa_alerts')
    .update({ last_checked_price: currentPrice })
    .eq('id', alert.id);
}

// ── Check all alerts against current prices ─────────
function checkAllAlerts() {
  for (const alert of alerts) {
    const price = prices[alert.symbol];
    if (price) checkAlert(alert, price);
  }
}

// ── Binance WebSocket (crypto) ──────────────────────
function startBinanceWs() {
  // Get unique crypto symbols from alerts
  function getStreams() {
    const symbols = [...new Set(
      alerts.filter(a => a.asset_type === 'crypto').map(a => a.symbol.toLowerCase())
    )];
    if (symbols.length === 0) return null;
    return symbols.map(s => `${s}@ticker`).join('/');
  }

  let ws = null;
  let reconnectTimeout = null;

  function connect() {
    const streams = getStreams();
    if (!streams) {
      log('No crypto alerts, skipping WebSocket. Will retry in 10s.');
      reconnectTimeout = setTimeout(connect, 10_000);
      return;
    }

    log(`Connecting to Binance WebSocket (${streams.split('/').length} streams)...`);
    ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

    ws.on('open', () => {
      log('✅ Binance WebSocket connected');
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);
        if (msg.s && msg.c) {
          const price = parseFloat(msg.c);
          prices[msg.s] = price;
          // Check alerts immediately on every price tick
          const relevantAlerts = alerts.filter(a => a.symbol === msg.s && a.is_active);
          for (const alert of relevantAlerts) {
            checkAlert(alert, price);
          }
        }
      } catch {}
    });

    ws.on('close', () => {
      log('WebSocket closed. Reconnecting in 3s...');
      reconnectTimeout = setTimeout(connect, 3000);
    });

    ws.on('error', (err) => {
      log(`WebSocket error: ${err.message}`);
      ws.close();
    });
  }

  connect();

  // Reconnect with updated streams when alerts change
  setInterval(() => {
    const newStreams = getStreams();
    if (ws && ws.readyState === WebSocket.OPEN) {
      // Close and reconnect if streams changed
      const currentStreams = ws.url.split('/ws/')[1];
      if (currentStreams !== newStreams) {
        log('Alert symbols changed, reconnecting WebSocket...');
        ws.close();
      }
    }
  }, 15_000);
}

// ── Stock price poller ──────────────────────────────
async function pollStockPrices() {
  const stockSymbols = [...new Set(
    alerts.filter(a => a.asset_type === 'stock').map(a => a.symbol)
  )];

  if (stockSymbols.length === 0) return;

  for (const symbol of stockSymbols) {
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`
      );
      if (!res.ok) continue;
      const data = await res.json();
      const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price) {
        prices[symbol] = price;
      }
    } catch {}
  }

  // Check stock alerts after fetching all prices
  checkAllAlerts();
  log(`📊 Stock prices updated: ${stockSymbols.map(s => `${s}=$${prices[s]?.toFixed(2) || '?'}`).join(', ')}`);
}

// ── Health check server (keeps Render from sleeping) ─
function startHealthServer() {
  const http = require('http');
  const PORT = process.env.PORT || 10000;
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'running',
        alerts: alerts.length,
        symbols: Object.keys(prices).length,
        uptime: Math.floor(process.uptime()),
      }));
    } else {
      res.writeHead(200);
      res.end('PriceAlert Worker Running');
    }
  });
  server.listen(PORT, () => log(`Health server on port ${PORT}`));
}

// ── Main ────────────────────────────────────────────
async function main() {
  log('🚀 PriceAlert Worker starting...');
  log(`   Supabase: ${SUPABASE_URL}`);
  log(`   Resend: ${RESEND_KEY ? 'configured' : 'missing!'}`);

  // Initial load
  await refreshAlerts();

  // Start health server (required for Render free tier)
  startHealthServer();

  // Start Binance WebSocket for crypto
  startBinanceWs();

  // Poll stock prices every 30s
  pollStockPrices();
  setInterval(pollStockPrices, STOCK_POLL_INTERVAL);

  // Refresh alerts from DB every 10s (picks up new/edited/deleted alerts)
  setInterval(refreshAlerts, ALERT_REFRESH_INTERVAL);

  // Refresh notification settings every 60s
  setInterval(() => {
    notificationSettings = {};
    userEmails = {};
  }, 60_000);

  // Clean up old triggered IDs every 5 min
  setInterval(() => {
    const activeIds = new Set(alerts.map(a => a.id));
    for (const id of triggeredAlertIds) {
      if (!activeIds.has(id)) triggeredAlertIds.delete(id);
    }
  }, 300_000);

  log('✅ Worker running — monitoring prices 24/7');
}

main().catch(e => {
  log(`Fatal error: ${e.message}`);
  process.exit(1);
});
