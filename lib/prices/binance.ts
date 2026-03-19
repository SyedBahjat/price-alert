import { BINANCE_REST_URL } from '@/lib/constants';

export async function getBinancePrice(symbol: string): Promise<number> {
  const res = await fetch(`${BINANCE_REST_URL}/ticker/price?symbol=${symbol}`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Binance API error for ${symbol}`);
  const data = await res.json();
  return parseFloat(data.price);
}

export async function getBinancePrices(symbols: string[]): Promise<Record<string, number>> {
  const params = new URLSearchParams({
    symbols: JSON.stringify(symbols),
  });
  const res = await fetch(`${BINANCE_REST_URL}/ticker/price?${params}`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error('Binance API error');
  const data: { symbol: string; price: string }[] = await res.json();
  const prices: Record<string, number> = {};
  for (const item of data) {
    prices[item.symbol] = parseFloat(item.price);
  }
  return prices;
}
