'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { Alert } from '@/lib/supabase/types';

interface UseAlertCheckerProps {
  alerts: Alert[];
  prices: Record<string, number>;
  onTriggered: (alert: Alert, currentPrice: number) => void;
}

export function useAlertChecker({ alerts, prices, onTriggered }: UseAlertCheckerProps) {
  const triggeredIds = useRef<Set<string>>(new Set());

  const check = useCallback(() => {
    for (const alert of alerts) {
      if (!alert.is_active) continue;
      if (triggeredIds.current.has(alert.id)) continue;

      const currentPrice = prices[alert.symbol];
      if (!currentPrice) continue;

      const shouldTrigger =
        (alert.direction === 'above' && currentPrice >= alert.target_price) ||
        (alert.direction === 'below' && currentPrice <= alert.target_price);

      if (shouldTrigger) {
        triggeredIds.current.add(alert.id);
        onTriggered(alert, currentPrice);
      }
    }
  }, [alerts, prices, onTriggered]);

  useEffect(() => {
    check();
  }, [check]);
}
