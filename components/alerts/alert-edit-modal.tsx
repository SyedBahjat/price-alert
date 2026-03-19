'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { formatPrice } from '@/lib/utils';
import type { Alert } from '@/lib/supabase/types';

interface AlertEditModalProps {
  alert: Alert;
  currentPrice?: number;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Alert>) => Promise<void>;
}

export function AlertEditModal({ alert, currentPrice, open, onClose, onSave }: AlertEditModalProps) {
  const [targetPrice, setTargetPrice] = useState(String(alert.target_price));
  const [direction, setDirection] = useState<'above' | 'below'>(alert.direction);
  const [isRecurring, setIsRecurring] = useState(alert.is_recurring);
  const [isActive, setIsActive] = useState(alert.is_active);
  const [note, setNote] = useState(alert.note || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(alert.id, {
        target_price: parseFloat(targetPrice),
        direction,
        is_recurring: isRecurring,
        is_active: isActive,
        note: note || null,
      });
      onClose();
    } catch (e) {
      console.error('Failed to save:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md rounded-2xl border border-card-border bg-surface overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold">Edit Alert</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.symbol} — {alert.asset_type}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Current price indicator */}
              {currentPrice && (
                <div className="rounded-xl bg-surface-light border border-card-border p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-bullish live-dot" />
                    <span className="text-xs text-muted-foreground">Current Price</span>
                  </div>
                  <span className="font-mono text-sm font-bold">{formatPrice(currentPrice)}</span>
                </div>
              )}

              {/* Direction */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Direction</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDirection('above')}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      direction === 'above'
                        ? 'bg-bullish/10 text-bullish border border-bullish/30 shadow-[0_0_15px_rgba(0,210,160,0.1)]'
                        : 'bg-surface-light text-muted-foreground border border-card-border hover:border-white/10'
                    }`}
                  >
                    Above
                  </button>
                  <button
                    onClick={() => setDirection('below')}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      direction === 'below'
                        ? 'bg-bearish/10 text-bearish border border-bearish/30 shadow-[0_0_15px_rgba(255,71,87,0.1)]'
                        : 'bg-surface-light text-muted-foreground border border-card-border hover:border-white/10'
                    }`}
                  >
                    Below
                  </button>
                </div>
              </div>

              {/* Target price */}
              <Input
                label="Target Price ($)"
                type="number"
                step="any"
                placeholder={currentPrice ? `Current: ${formatPrice(currentPrice)}` : 'Target price'}
                value={targetPrice}
                onChange={e => setTargetPrice(e.target.value)}
              />

              {/* Note */}
              <Input
                label="Note (optional)"
                placeholder="e.g. Sell position when hit"
                value={note}
                onChange={e => setNote(e.target.value)}
              />

              {/* Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Recurring</p>
                    <p className="text-xs text-muted-foreground">Keep active after triggering</p>
                  </div>
                  <Toggle checked={isRecurring} onChange={setIsRecurring} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Active</p>
                    <p className="text-xs text-muted-foreground">Enable or pause this alert</p>
                  </div>
                  <Toggle checked={isActive} onChange={setIsActive} />
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={!targetPrice || saving}
                className="w-full"
                size="lg"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
