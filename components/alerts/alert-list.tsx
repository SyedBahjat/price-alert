'use client';

import { AnimatePresence } from 'framer-motion';
import { AlertCard } from './alert-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Alert } from '@/lib/supabase/types';
import { Bell } from 'lucide-react';

interface AlertListProps {
  alerts: Alert[];
  loading: boolean;
  prices: Record<string, number>;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string, updates: Partial<Alert>) => Promise<void>;
}

export function AlertList({ alerts, loading, prices, onToggle, onDelete, onEdit }: AlertListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!alerts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <Bell className="w-8 h-8 text-muted" />
        </div>
        <h3 className="text-lg font-medium text-foreground">No alerts yet</h3>
        <p className="text-sm text-muted-foreground mt-1">Create your first price alert to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {alerts.map(alert => (
          <AlertCard
            key={alert.id}
            alert={alert}
            currentPrice={prices[alert.symbol]}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
