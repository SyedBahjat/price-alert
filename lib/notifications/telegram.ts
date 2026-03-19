export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export function formatAlertMessage(
  symbol: string,
  direction: string,
  targetPrice: number,
  currentPrice: number,
  note?: string | null
): string {
  const emoji = direction === 'above' ? '🟢' : '🔴';
  const arrow = direction === 'above' ? '↑' : '↓';
  let msg = `${emoji} <b>Price Alert Triggered!</b>\n\n`;
  msg += `<b>${symbol}</b> is now ${direction} your target\n`;
  msg += `${arrow} Target: $${targetPrice.toLocaleString()}\n`;
  msg += `💰 Current: $${currentPrice.toLocaleString()}\n`;
  if (note) msg += `\n📝 ${note}`;
  return msg;
}
