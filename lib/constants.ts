export const CRYPTO_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT',
  'LINKUSDT', 'LTCUSDT', 'ATOMUSDT', 'NEARUSDT', 'APTUSDT',
] as const;

export const STOCK_SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA',
  'AMD', 'NFLX', 'CRM', 'ORCL', 'INTC', 'PYPL', 'SQ', 'COIN',
] as const;

export const ALL_SYMBOLS = [
  ...CRYPTO_SYMBOLS.map(s => ({ symbol: s, type: 'crypto' as const, label: s.replace('USDT', '/USDT') })),
  ...STOCK_SYMBOLS.map(s => ({ symbol: s, type: 'stock' as const, label: s })),
];

export const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';
export const BINANCE_REST_URL = 'https://api.binance.com/api/v3';
