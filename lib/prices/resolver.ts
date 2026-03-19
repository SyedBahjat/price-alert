import { getBinancePrice, getBinancePrices } from './binance';
import { getStockPrice, getStockPrices } from './stocks';

export async function getPrice(symbol: string, assetType: 'crypto' | 'stock'): Promise<number> {
  return assetType === 'crypto' ? getBinancePrice(symbol) : getStockPrice(symbol);
}

export async function getPricesForAlerts(
  alerts: { symbol: string; asset_type: 'crypto' | 'stock' }[]
): Promise<Record<string, number>> {
  const cryptoSymbols = [...new Set(alerts.filter(a => a.asset_type === 'crypto').map(a => a.symbol))];
  const stockSymbols = [...new Set(alerts.filter(a => a.asset_type === 'stock').map(a => a.symbol))];

  const [cryptoPrices, stockPricesResult] = await Promise.all([
    cryptoSymbols.length > 0 ? getBinancePrices(cryptoSymbols) : {},
    stockSymbols.length > 0 ? getStockPrices(stockSymbols) : {},
  ]);

  return { ...cryptoPrices, ...stockPricesResult };
}
