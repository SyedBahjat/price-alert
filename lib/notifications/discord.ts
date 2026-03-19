export async function sendDiscordMessage(
  webhookUrl: string,
  symbol: string,
  direction: string,
  targetPrice: number,
  currentPrice: number,
  note?: string | null
): Promise<boolean> {
  try {
    const color = direction === 'above' ? 0x00d2a0 : 0xff4757;
    const arrow = direction === 'above' ? '↑' : '↓';

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: `${direction === 'above' ? '🟢' : '🔴'} Price Alert: ${symbol}`,
          color,
          fields: [
            { name: `${arrow} Target Price`, value: `$${targetPrice.toLocaleString()}`, inline: true },
            { name: '💰 Current Price', value: `$${currentPrice.toLocaleString()}`, inline: true },
            ...(note ? [{ name: '📝 Note', value: note, inline: false }] : []),
          ],
          timestamp: new Date().toISOString(),
        }],
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
