// Green API — free WhatsApp messaging
// Sign up at green-api.com, create instance, scan QR with your phone

export async function sendWhatsAppMessage(
  instanceId: string,
  apiToken: string,
  phone: string,
  message: string
): Promise<boolean> {
  try {
    // Remove + and any spaces/dashes from phone
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const chatId = `${cleanPhone}@c.us`;

    const res = await fetch(
      `https://api.green-api.com/waInstance${instanceId}/sendMessage/${apiToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message }),
      }
    );
    const data = await res.json();
    return !!data.idMessage;
  } catch {
    return false;
  }
}

export function formatWhatsAppAlert(
  symbol: string,
  direction: string,
  targetPrice: number,
  currentPrice: number,
  note?: string | null
): string {
  const emoji = direction === 'above' ? '🟢' : '🔴';
  const arrow = direction === 'above' ? '↑' : '↓';
  let msg = `${emoji} *Price Alert Triggered!*\n\n`;
  msg += `*${symbol}* is now ${direction} your target\n`;
  msg += `${arrow} Target: $${targetPrice.toLocaleString()}\n`;
  msg += `💰 Current: $${currentPrice.toLocaleString()}\n`;
  if (note) msg += `\n📝 ${note}`;
  return msg;
}
