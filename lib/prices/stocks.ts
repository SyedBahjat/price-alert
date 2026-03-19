export async function getStockPrice(symbol: string): Promise<number> {
  // Use Yahoo Finance v8 API directly to avoid ESM issues with yahoo-finance2
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`,
    { next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error(`Yahoo Finance error for ${symbol}`);
  const data = await res.json();
  const meta = data.chart?.result?.[0]?.meta;
  if (!meta) throw new Error(`No data for ${symbol}`);
  return meta.regularMarketPrice;
}

export async function getStockPrices(symbols: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  const results = await Promise.allSettled(
    symbols.map(async (symbol) => {
      const price = await getStockPrice(symbol);
      return { symbol, price };
    })
  );
  for (const result of results) {
    if (result.status === 'fulfilled') {
      prices[result.value.symbol] = result.value.price;
    }
  }
  return prices;
}
