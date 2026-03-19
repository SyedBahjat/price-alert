'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, CheckCircle, XCircle, History, Mail, Send, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, timeAgo } from '@/lib/utils';
import type { AlertHistory } from '@/lib/supabase/types';

const channelIcon: Record<string, typeof Mail> = {
  email: Mail,
  telegram: Send,
  discord: MessageSquare,
};

export default function HistoryPage() {
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/history')
      .then(r => r.ok ? r.json() : [])
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alert History</h1>
          <p className="text-sm text-muted-foreground">{history.length} triggered alert{history.length !== 1 ? 's' : ''}</p>
        </div>
        {history.length > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bullish/10 border border-bullish/20">
            <History className="w-3 h-3 text-bullish" />
            <span className="text-[10px] uppercase tracking-wider font-semibold text-bullish">{history.length}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : !history.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <History className="w-8 h-8 text-muted" />
          </div>
          <h3 className="text-lg font-medium">No alerts triggered yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            When your price targets are hit, they will appear here with full details.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((item, i) => {
            const isAbove = item.direction === 'above';
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-card-border bg-surface/50 p-4 hover:border-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isAbove ? 'bg-bullish/10' : 'bg-bearish/10'
                    }`}>
                      {isAbove ? (
                        <ArrowUp className="w-4 h-4 text-bullish" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-bearish" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{item.symbol}</span>
                        <Badge variant={isAbove ? 'bullish' : 'bearish'}>
                          {item.direction}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">Target:</span>
                        <span className="font-mono text-xs font-medium">{formatPrice(item.target_price)}</span>
                        <span className="text-muted text-xs">→</span>
                        <span className="text-xs text-muted-foreground">Hit:</span>
                        <span className={`font-mono text-xs font-medium ${isAbove ? 'text-bullish' : 'text-bearish'}`}>
                          {formatPrice(item.triggered_price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Notification channels */}
                    {item.notification_sent ? (
                      <div className="flex items-center gap-1.5">
                        {item.notification_channels.map(ch => {
                          const Icon = channelIcon[ch] || CheckCircle;
                          return (
                            <div key={ch} className="w-6 h-6 rounded-md bg-bullish/10 flex items-center justify-center" title={ch}>
                              <Icon className="w-3 h-3 text-bullish" />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center" title="No notification sent">
                        <XCircle className="w-3 h-3 text-muted" />
                      </div>
                    )}
                    <span className="text-[10px] text-muted tabular-nums whitespace-nowrap">{timeAgo(item.created_at)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
