'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { ALL_SYMBOLS } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import type { CreateAlertInput } from '@/lib/supabase/types';

interface AlertFormProps {
  onSubmit: (input: CreateAlertInput) => Promise<void>;
}

export function AlertForm({ onSubmit }: AlertFormProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<typeof ALL_SYMBOLS[0] | null>(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [isRecurring, setIsRecurring] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [fetchingPrice, setFetchingPrice] = useState(false);

  const filteredSymbols = useMemo(
    () => ALL_SYMBOLS.filter(s =>
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.label.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  // Fetch live price when symbol is selected
  useEffect(() => {
    if (!selectedSymbol) { setLivePrice(null); return; }
    setFetchingPrice(true);
    fetch(`/api/prices/${selectedSymbol.symbol}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setLivePrice(data.price); })
      .catch(() => {})
      .finally(() => setFetchingPrice(false));
  }, [selectedSymbol]);

  const handleSubmit = async () => {
    if (!selectedSymbol || !targetPrice) return;
    setLoading(true);
    try {
      await onSubmit({
        symbol: selectedSymbol.symbol,
        asset_type: selectedSymbol.type,
        target_price: parseFloat(targetPrice),
        direction,
        is_recurring: isRecurring,
        note: note || undefined,
      });
      setOpen(false);
      setSelectedSymbol(null);
      setTargetPrice('');
      setNote('');
      setSearch('');
      setLivePrice(null);
    } catch (error) {
      console.error('Failed to create alert:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="w-4 h-4" /> New Alert
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-2xl border border-card-border bg-surface overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h2 className="text-lg font-bold">Create Alert</h2>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Symbol selector */}
                {!selectedSymbol ? (
                  <div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        type="text"
                        placeholder="Search symbol (BTC, AAPL, META...)"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full rounded-lg bg-surface-light border border-card-border pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary/50 transition-all"
                        autoFocus
                      />
                    </div>
                    <div className="mt-2 max-h-48 overflow-y-auto space-y-0.5">
                      {filteredSymbols.slice(0, 20).map(s => (
                        <button
                          key={s.symbol}
                          onClick={() => { setSelectedSymbol(s); setSearch(''); }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                          <span className="font-medium group-hover:text-primary transition-colors">{s.label}</span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-surface-light border border-card-border p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">{selectedSymbol.label}</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-white/5 px-2 py-0.5 rounded">{selectedSymbol.type}</span>
                      </div>
                      <button
                        onClick={() => setSelectedSymbol(null)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Live price */}
                    <div className="mt-2 flex items-center gap-2">
                      {fetchingPrice ? (
                        <Loader2 className="w-3.5 h-3.5 text-muted animate-spin" />
                      ) : livePrice ? (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-bullish live-dot" />
                          <span className="font-mono text-sm font-semibold text-foreground">{formatPrice(livePrice)}</span>
                          <span className="text-[10px] text-muted-foreground">live</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Direction */}
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

                <Input
                  label="Target Price ($)"
                  type="number"
                  step="any"
                  placeholder={livePrice ? `Current: ${formatPrice(livePrice)}` : 'e.g. 100000'}
                  value={targetPrice}
                  onChange={e => setTargetPrice(e.target.value)}
                />

                <Input
                  label="Note (optional)"
                  placeholder="e.g. Sell position when hit"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />

                {/* Recurring toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Recurring</p>
                    <p className="text-xs text-muted-foreground">Keep active after triggering</p>
                  </div>
                  <Toggle checked={isRecurring} onChange={setIsRecurring} />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!selectedSymbol || !targetPrice || loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Creating...' : 'Create Alert'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
