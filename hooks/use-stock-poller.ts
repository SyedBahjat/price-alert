'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export function useStockPoller(symbols: string[], intervalMs = 30000) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchPrices = useCallback(async () => {
    if (!symbols.length) return;

    const results = await Promise.allSettled(
      symbols.map(async (symbol) => {
        const res = await fetch(`/api/prices/${symbol}`);
        if (!res.ok) return null;
        const data = await res.json();
        return { symbol, price: data.price as number };
      })
    );

    setPrices(prev => {
      const next = { ...prev };
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) {
          next[r.value.symbol] = r.value.price;
        }
      }
      return next;
    });
  }, [symbols]);

  useEffect(() => {
    fetchPrices();
    intervalRef.current = setInterval(fetchPrices, intervalMs);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchPrices, intervalMs]);

  return prices;
}
