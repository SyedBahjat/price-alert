'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Trash2, Pause, Play, RefreshCw, Pencil } from 'lucide-react';
import { Alert } from '@/lib/supabase/types';
import { formatPrice, timeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AlertEditModal } from './alert-edit-modal';

interface AlertCardProps {
  alert: Alert;
  currentPrice?: number;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string, updates: Partial<Alert>) => Promise<void>;
}

export function AlertCard({ alert, currentPrice, onToggle, onDelete, onEdit }: AlertCardProps) {
  const [editOpen, setEditOpen] = useState(false);

  const isAbove = alert.direction === 'above';
  const DirectionIcon = isAbove ? ArrowUp : ArrowDown;

  const priceDiff = currentPrice
    ? ((currentPrice - alert.target_price) / alert.target_price) * 100
    : null;

  const progress = currentPrice
    ? isAbove
      ? Math.min(100, Math.max(0, (currentPrice / alert.target_price) * 100))
      : Math.min(100, Math.max(0, (alert.target_price / currentPrice) * 100))
    : 0;

  const isClose = progress > 95;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        layout
        className={`rounded-xl border transition-all duration-300 ${
          isClose && alert.is_active
            ? isAbove ? 'border-bullish/30 glow-green' : 'border-bearish/30 glow-red'
            : 'border-card-border'
        } bg-surface/50 backdrop-blur-sm overflow-hidden`}
      >
        {currentPrice && alert.is_active && (
          <div className="h-0.5 bg-white/5">
            <motion.div
              className={`h-full ${isAbove ? 'bg-bullish' : 'bg-bearish'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isAbove ? 'bg-bullish/10' : 'bg-bearish/10'
                } ${!alert.is_active ? 'opacity-40' : ''}`}
              >
                <DirectionIcon className={`w-5 h-5 ${isAbove ? 'text-bullish' : 'text-bearish'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-base">{alert.symbol}</span>
                  <Badge variant={alert.asset_type === 'crypto' ? 'default' : 'muted'}>
                    {alert.asset_type}
                  </Badge>
                  {alert.is_recurring && (
                    <Badge variant="muted">
                      <RefreshCw className="w-2.5 h-2.5 mr-1" /> loop
                    </Badge>
                  )}
                  {isClose && alert.is_active && (
                    <Badge variant={isAbove ? 'bullish' : 'bearish'}>
                      <span className="live-dot inline-block w-1.5 h-1.5 rounded-full bg-current mr-1" />
                      close
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">{isAbove ? 'Above' : 'Below'}</span>
                  <span className="font-mono text-sm font-semibold text-foreground">{formatPrice(alert.target_price)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              {onEdit && (
                <button
                  onClick={() => setEditOpen(true)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-primary cursor-pointer"
                  title="Edit alert"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => onToggle(alert.id, !alert.is_active)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {alert.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onDelete(alert.id)}
                className="p-2 rounded-lg hover:bg-bearish/10 transition-colors text-muted-foreground hover:text-bearish cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              {currentPrice ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full live-dot ${
                      priceDiff !== null && priceDiff >= 0 ? 'bg-bullish' : 'bg-bearish'
                    }`} />
                    <span className="font-mono text-lg font-bold tabular-nums">{formatPrice(currentPrice)}</span>
                  </div>
                  {priceDiff !== null && (
                    <span className={`font-mono text-xs font-medium px-1.5 py-0.5 rounded ${
                      priceDiff >= 0 ? 'text-bullish bg-bullish/8' : 'text-bearish bg-bearish/8'
                    }`}>
                      {priceDiff >= 0 ? '+' : ''}{priceDiff.toFixed(2)}%
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm text-muted">Loading price...</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!alert.is_active && <Badge variant="muted">paused</Badge>}
              {alert.triggered_at && (
                <Badge variant="bearish">triggered {timeAgo(alert.triggered_at)}</Badge>
              )}
              <span className="text-[10px] text-muted tabular-nums">{timeAgo(alert.created_at)}</span>
            </div>
          </div>

          {alert.note && (
            <p className="mt-2 text-xs text-muted-foreground border-t border-white/5 pt-2 italic">
              {alert.note}
            </p>
          )}
        </div>
      </motion.div>

      {/* Edit Modal */}
      {onEdit && (
        <AlertEditModal
          alert={alert}
          currentPrice={currentPrice}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSave={async (id, updates) => { await onEdit(id, updates); }}
        />
      )}
    </>
  );
}
