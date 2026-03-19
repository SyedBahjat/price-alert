'use client';

import { useEffect, useRef, useState } from 'react';
import { formatPrice } from '@/lib/utils';

interface PriceTickerProps {
  symbol: string;
  price: number;
  change24h?: number;
  size?: 'sm' | 'lg';
}

export function PriceTicker({ symbol, price, change24h, size = 'sm' }: PriceTickerProps) {
  const prevPrice = useRef(price);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (price > prevPrice.current) setFlash('up');
    else if (price < prevPrice.current) setFlash('down');
    prevPrice.current = price;
    const timer = setTimeout(() => setFlash(null), 800);
    return () => clearTimeout(timer);
  }, [price]);

  if (size === 'lg') {
    return (
      <div className="flex flex-col items-center gap-1 min-w-[100px]">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          {symbol.replace('USDT', '')}
        </span>
        <span
          className={`font-mono text-lg font-bold tabular-nums px-1.5 py-0.5 rounded transition-all ${
            flash === 'up' ? 'price-up text-bullish' : flash === 'down' ? 'price-down text-bearish' : 'text-foreground'
          }`}
        >
          {formatPrice(price)}
        </span>
        {change24h !== undefined && (
          <span className={`text-[10px] font-mono font-medium ${change24h >= 0 ? 'text-bullish' : 'text-bearish'}`}>
            {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 px-2">
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full live-dot ${flash === 'up' ? 'bg-bullish' : flash === 'down' ? 'bg-bearish' : 'bg-muted'}`} />
        <span className="text-xs text-muted-foreground font-medium">{symbol.replace('USDT', '')}</span>
      </div>
      <span
        className={`font-mono text-sm font-semibold tabular-nums px-1 py-0.5 rounded transition-all ${
          flash === 'up' ? 'price-up' : flash === 'down' ? 'price-down' : ''
        }`}
      >
        {formatPrice(price)}
      </span>
      {change24h !== undefined && (
        <span className={`text-[10px] font-mono ${change24h >= 0 ? 'text-bullish' : 'text-bearish'}`}>
          {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
        </span>
      )}
    </div>
  );
}
