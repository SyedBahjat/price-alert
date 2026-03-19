'use client';

import { useState, useCallback } from 'react';

export function usePrices() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const fetchPrice = useCallback(async (symbol: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/prices/${symbol}`);
      if (res.ok) {
        const data = await res.json();
        setPrices(prev => ({ ...prev, [symbol]: data.price }));
        return data.price;
      }
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { prices, loading, fetchPrice };
}
