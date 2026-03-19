'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, TrendingUp, Activity, Zap, ArrowUp, ArrowDown } from 'lucide-react';
import { useAlerts } from '@/hooks/use-alerts';
import { useBinanceWs } from '@/hooks/use-binance-ws';
import { useStockPoller } from '@/hooks/use-stock-poller';
import { useAlertChecker } from '@/hooks/use-alert-checker';
import { useToast } from '@/components/ui/toast';
import { AlertForm } from '@/components/alerts/alert-form';
import { AlertList } from '@/components/alerts/alert-list';
import { OnboardingModal } from '@/components/onboarding/onboarding-modal';
import { formatPrice } from '@/lib/utils';
import type { Alert } from '@/lib/supabase/types';

export default function DashboardPage() {
  const { alerts, loading, createAlert, updateAlert, deleteAlert, refetch } = useAlerts();
  const { addToast } = useToast();

  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    const seen = localStorage.getItem('pa_onboarding_done');
    if (!seen) setShowOnboarding(true);
  }, []);
  const completeOnboarding = () => {
    localStorage.setItem('pa_onboarding_done', 'true');
    setShowOnboarding(false);
  };

  const cryptoSymbols = useMemo(
    () => [...new Set(alerts.filter(a => a.asset_type === 'crypto').map(a => a.symbol))],
    [alerts]
  );
  const stockSymbols = useMemo(
    () => [...new Set(alerts.filter(a => a.asset_type === 'stock').map(a => a.symbol))],
    [alerts]
  );

  const wsPrices = useBinanceWs(cryptoSymbols);
  const stockPrices = useStockPoller(stockSymbols, 30000);

  const prices = useMemo(() => {
    const p: Record<string, number> = {};
    for (const [symbol, data] of Object.entries(wsPrices)) p[symbol] = data.price;
    for (const [symbol, price] of Object.entries(stockPrices)) p[symbol] = price;
    return p;
  }, [wsPrices, stockPrices]);

  const handleAlertTriggered = useCallback(async (alert: Alert, currentPrice: number) => {
    addToast({
      title: `${alert.symbol} hit ${formatPrice(alert.target_price)}!`,
      description: `Current: ${formatPrice(currentPrice)} — ${alert.direction} target reached`,
      variant: 'alert',
    });
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(`Price Alert: ${alert.symbol}`, {
        body: `${alert.direction === 'above' ? '↑' : '↓'} Target ${formatPrice(alert.target_price)} hit! Current: ${formatPrice(currentPrice)}`,
        icon: '/favicon.ico',
      });
    }
    try {
      await fetch('/api/check-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId: alert.id, currentPrice }),
      });
      refetch();
    } catch (e) {
      console.error('Failed to trigger server notification:', e);
    }
  }, [addToast, refetch]);

  useAlertChecker({ alerts, prices, onTriggered: handleAlertTriggered });

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const activeAlerts = alerts.filter(a => a.is_active);
  const triggeredAlerts = alerts.filter(a => a.triggered_at);
  const trackingSymbols = new Set(alerts.map(a => a.symbol)).size;

  const handleToggle = async (id: string, isActive: boolean) => {
    await updateAlert(id, { is_active: isActive });
  };

  const handleEdit = async (id: string, updates: Partial<Alert>) => {
    await updateAlert(id, updates);
  };

  const hasLivePrices = Object.keys(wsPrices).length > 0 || Object.keys(stockPrices).length > 0;

  // Build price card data — merge crypto WS + stock polls
  const priceCards = useMemo(() => {
    const cards: { symbol: string; price: number; change24h?: number; type: 'crypto' | 'stock' }[] = [];
    for (const [symbol, data] of Object.entries(wsPrices)) {
      cards.push({ symbol, price: data.price, change24h: data.change24h, type: 'crypto' });
    }
    for (const [symbol, price] of Object.entries(stockPrices)) {
      cards.push({ symbol, price, type: 'stock' });
    }
    return cards;
  }, [wsPrices, stockPrices]);

  return (
    <div className="space-y-6">
      <OnboardingModal open={showOnboarding} onComplete={completeOnboarding} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {hasLivePrices && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-bullish/10 border border-bullish/20">
                <div className="w-1.5 h-1.5 rounded-full bg-bullish live-dot" />
                <span className="text-[10px] uppercase tracking-wider font-semibold text-bullish">Live</span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time price monitoring</p>
        </div>
        <AlertForm onSubmit={createAlert} />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active', value: activeAlerts.length, icon: Bell, color: 'text-primary', glow: 'glow-primary' },
          { label: 'Paused', value: alerts.length - activeAlerts.length, icon: BellOff, color: 'text-muted-foreground', glow: '' },
          { label: 'Triggered', value: triggeredAlerts.length, icon: Zap, color: 'text-bullish', glow: triggeredAlerts.length > 0 ? 'glow-green' : '' },
          { label: 'Tracking', value: trackingSymbols, icon: Activity, color: 'text-primary', glow: '' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-xl border border-card-border bg-surface/50 p-4 ${stat.glow}`}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-[10px] uppercase tracking-wider text-muted">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold font-mono tabular-nums">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Live Price Cards */}
      {priceCards.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold">Live Prices</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {priceCards.map((card, i) => {
              const prev = prices[card.symbol];
              const isUp = card.change24h !== undefined ? card.change24h >= 0 : true;
              return (
                <motion.div
                  key={card.symbol}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-xl border bg-surface/50 p-4 transition-all ${
                    isUp ? 'border-bullish/15 hover:border-bullish/30' : 'border-bearish/15 hover:border-bearish/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full live-dot ${isUp ? 'bg-bullish' : 'bg-bearish'}`} />
                      <span className="font-bold text-sm">{card.symbol.replace('USDT', '')}</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-widest text-muted">{card.type}</span>
                  </div>
                  <p className="font-mono text-xl font-bold tabular-nums">{formatPrice(card.price)}</p>
                  {card.change24h !== undefined && (
                    <div className={`flex items-center gap-1 mt-1.5 ${isUp ? 'text-bullish' : 'text-bearish'}`}>
                      {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      <span className="font-mono text-xs font-semibold">
                        {card.change24h >= 0 ? '+' : ''}{card.change24h.toFixed(2)}%
                      </span>
                      <span className="text-[10px] text-muted ml-1">24h</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alerts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Your Alerts</h2>
          <span className="text-xs text-muted-foreground">{alerts.length} total</span>
        </div>
        <AlertList
          alerts={alerts}
          loading={loading}
          prices={prices}
          onToggle={handleToggle}
          onDelete={deleteAlert}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
}
