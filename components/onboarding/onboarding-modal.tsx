'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Bell, Send, MessageSquare, ArrowRight, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

const steps = [
  {
    icon: TrendingUp,
    title: 'Welcome to PriceAlert',
    description: 'Track crypto and stock prices in real-time. Get notified the moment your targets are hit.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Bell,
    title: 'Create Price Alerts',
    description: 'Set a target price and direction (above or below). We support 15+ crypto pairs via Binance and major US stocks.',
    color: 'text-primary',
    bg: 'bg-primary/10',
    tips: [
      'Choose a symbol (BTC, ETH, AAPL, META...)',
      'Set your target price and direction',
      'Enable recurring to keep the alert active after triggering',
    ],
  },
  {
    icon: Zap,
    title: 'Real-Time Monitoring',
    description: 'Crypto prices update in real-time via Binance WebSocket when the dashboard is open. Stock prices poll every 30 seconds.',
    color: 'text-bullish',
    bg: 'bg-bullish/10',
    tips: [
      'Live price tickers on your dashboard',
      'Background cron checks every 60s when app is closed',
      'Alerts trigger both client-side and server-side',
    ],
  },
  {
    icon: Send,
    title: 'Set Up Notifications',
    description: 'Get instant alerts via Telegram and Discord. Head to Settings to configure your notification channels.',
    color: 'text-[#0088cc]',
    bg: 'bg-[#0088cc]/10',
    tips: [
      'Create a Telegram bot via @BotFather',
      'Get your Chat ID by messaging the bot, then visiting the getUpdates API',
      'For Discord, create a webhook in your channel settings',
    ],
  },
];

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md bg-surface border border-card-border rounded-2xl overflow-hidden"
      >
        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-8 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className={`w-16 h-16 rounded-2xl ${current.bg} flex items-center justify-center mx-auto mb-6`}
          >
            <current.icon className={`w-8 h-8 ${current.color}`} />
          </motion.div>

          {/* Content */}
          <h2 className="text-xl font-bold mb-2">{current.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>

          {/* Tips */}
          {current.tips && (
            <div className="mt-5 space-y-2 text-left">
              {current.tips.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{tip}</span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            {/* Dots */}
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === step ? 'bg-primary w-6' : i < step ? 'bg-primary/40' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              {step > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setStep(s => s - 1)}>
                  Back
                </Button>
              )}
              {!isLast ? (
                <Button size="sm" onClick={() => setStep(s => s + 1)} className="gap-1">
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button size="sm" onClick={onComplete} className="gap-1">
                  Get Started <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Skip */}
          {!isLast && (
            <button
              onClick={onComplete}
              className="mt-4 text-xs text-muted hover:text-muted-foreground transition-colors cursor-pointer"
            >
              Skip onboarding
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
