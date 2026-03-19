'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { BINANCE_WS_URL } from '@/lib/constants';

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
}

export function useBinanceWs(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const connect = useCallback(() => {
    if (!symbols.length) return;

    const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
    const ws = new WebSocket(`${BINANCE_WS_URL}/${streams}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.s && data.c) {
        setPrices(prev => ({
          ...prev,
          [data.s]: {
            symbol: data.s,
            price: parseFloat(data.c),
            change24h: parseFloat(data.P),
          },
        }));
      }
    };

    ws.onclose = () => {
      reconnectRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();
  }, [symbols]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [connect]);

  return prices;
}
