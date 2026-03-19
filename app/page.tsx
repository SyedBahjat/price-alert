'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import {
  TrendingUp, Bell, Zap, Shield, ArrowRight, Send, MessageSquare,
  Mail, BarChart3, Clock, Wifi, ArrowUpRight, ArrowDownRight,
  Check, Star, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// --- Animated counter ---
function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(value / 40);
    const interval = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(interval); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(interval);
  }, [inView, value]);

  return <span ref={ref} className="tabular-nums">{prefix}{display.toLocaleString()}{suffix}</span>;
}

// --- Live ticker simulation ---
function LiveTicker() {
  const tickers = [
    { symbol: 'BTC', base: 104250 },
    { symbol: 'ETH', base: 3892 },
    { symbol: 'SOL', base: 178 },
    { symbol: 'NVDA', base: 182 },
    { symbol: 'META', base: 622 },
    { symbol: 'AAPL', base: 253 },
  ];
  const [prices, setPrices] = useState(tickers.map(t => ({ ...t, price: t.base, change: (Math.random() - 0.4) * 4 })));

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(p => {
        const delta = (Math.random() - 0.48) * p.base * 0.001;
        const newPrice = p.price + delta;
        return { ...p, price: newPrice, change: ((newPrice - p.base) / p.base) * 100 };
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-3 overflow-hidden">
      {prices.map(p => (
        <div key={p.symbol} className="shrink-0 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 min-w-[140px]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-white/60">{p.symbol}</span>
            <div className={cn('w-1.5 h-1.5 rounded-full', p.change >= 0 ? 'bg-[#00d4aa]' : 'bg-[#ff4757]')} style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
          <p className="font-mono text-lg font-bold text-white tabular-nums">
            ${p.price < 1000 ? p.price.toFixed(2) : Math.round(p.price).toLocaleString()}
          </p>
          <div className={cn('flex items-center gap-0.5 mt-1 text-xs font-mono font-medium', p.change >= 0 ? 'text-[#00d4aa]' : 'text-[#ff4757]')}>
            {p.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {p.change >= 0 ? '+' : ''}{p.change.toFixed(2)}%
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Section wrapper ---
function Section({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn('relative', className)}
    >
      {children}
    </motion.section>
  );
}

// ============================================================
export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div className="min-h-screen bg-[#060611] text-white overflow-x-hidden">
      {/* ---- NAV ---- */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-[#060611]/80 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image src="/logo.png" alt="PriceAlert" width={32} height={32} className="rounded-lg" />
            <span className="text-base font-bold tracking-tight">PriceAlert</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link href="/signup"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* ---- HERO ---- */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative pt-32 pb-24 px-5"
      >
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#00d4aa]/[0.04] rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[300px] h-[300px] bg-[#ff4757]/[0.03] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00d4aa]/20 bg-[#00d4aa]/[0.06] mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa]" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
            <span className="text-xs font-semibold text-[#00d4aa] tracking-wide uppercase">Real-time monitoring</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-extrabold leading-[0.95] tracking-tighter"
          >
            Never miss a
            <br />
            <span className="bg-gradient-to-r from-[#00d4aa] via-[#00e6b8] to-[#00d4aa] bg-clip-text text-transparent">
              price target
            </span>
            <br />
            again.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg sm:text-xl text-white/50 mt-8 max-w-2xl mx-auto leading-relaxed font-light"
          >
            Set price alerts for crypto and stocks. Get notified instantly via
            <span className="text-white/80 font-medium"> Email</span>,
            <span className="text-white/80 font-medium"> Telegram</span>, and
            <span className="text-white/80 font-medium"> Discord</span> —
            even when you&apos;re away.
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            <Link href="/signup">
              <Button size="lg" className="gap-2 text-base px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(0,212,170,0.2)]">
                Start for Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#how" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
              See how it works <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-8 sm:gap-16 mt-16 text-center"
          >
            {[
              { label: 'Symbols tracked', value: 30 },
              { label: 'Alert checks / day', value: 1440 },
              { label: 'Notification channels', value: 3 },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl sm:text-4xl font-bold font-mono text-white">
                  <AnimatedNumber value={s.value} />
                </p>
                <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Live ticker strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-16 overflow-hidden"
          >
            <LiveTicker />
          </motion.div>
        </div>
      </motion.section>

      {/* ---- FEATURES ---- */}
      <Section id="features" className="py-28 px-5 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00d4aa] mb-3">Features</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Built for serious traders
            </h2>
            <p className="text-white/40 mt-4 max-w-lg mx-auto">
              Everything you need to monitor markets and act instantly — no noise, no delays.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Wifi,
                title: 'WebSocket Prices',
                desc: 'Sub-second crypto updates via Binance WebSocket. See every tick in real-time.',
                accent: '#00d4aa',
              },
              {
                icon: BarChart3,
                title: 'Stocks & Crypto',
                desc: '15+ crypto pairs and major US stocks. AAPL, NVDA, META, BTC, ETH, SOL and more.',
                accent: '#00d4aa',
              },
              {
                icon: Bell,
                title: 'Smart Alerts',
                desc: 'Set above or below targets. Recurring alerts stay active after triggering.',
                accent: '#00d4aa',
              },
              {
                icon: Mail,
                title: 'Email Alerts',
                desc: 'Beautiful HTML email alerts sent to your inbox. Enabled by default.',
                accent: '#00d4aa',
              },
              {
                icon: Send,
                title: 'Telegram Bot',
                desc: 'Instant Telegram notifications via your own bot. Rich HTML formatting.',
                accent: '#0088cc',
              },
              {
                icon: MessageSquare,
                title: 'Discord Webhooks',
                desc: 'Rich embed notifications in your Discord channel. Beautiful and informative.',
                accent: '#5865F2',
              },
              {
                icon: Clock,
                title: 'Background Cron',
                desc: 'Checks run every 60 seconds even when you close the app. Never miss a move.',
                accent: '#00d4aa',
              },
              {
                icon: Zap,
                title: 'Instant Triggers',
                desc: 'Client-side checking when dashboard is open. Browser + push notifications.',
                accent: '#f59e0b',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                desc: 'Your API tokens are encrypted. JWT auth with httpOnly cookies. No tracking.',
                accent: '#00d4aa',
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.accent}15` }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.accent }} />
                </div>
                <h3 className="font-bold text-sm mb-1.5">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ---- HOW IT WORKS ---- */}
      <Section id="how" className="py-28 px-5 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00d4aa] mb-3">How it works</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Three steps. Under a minute.
            </h2>
          </div>

          <div className="grid gap-6">
            {[
              {
                step: '01',
                title: 'Create an alert',
                desc: 'Pick any crypto or stock symbol, set your target price, and choose above or below. Add a note to remind yourself why.',
              },
              {
                step: '02',
                title: 'We monitor 24/7',
                desc: 'Prices update in real-time via WebSocket when the dashboard is open. Background cron checks every 60 seconds when it\'s not.',
              },
              {
                step: '03',
                title: 'Get notified instantly',
                desc: 'The moment your target is hit, we fire notifications across all your enabled channels — Email, Telegram, Discord. Simultaneously.',
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex gap-6 items-start p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-[#00d4aa]/20 transition-colors"
              >
                <span className="font-mono text-4xl font-black text-[#00d4aa]/20 shrink-0 leading-none">{s.step}</span>
                <div>
                  <h3 className="text-lg font-bold mb-1">{s.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ---- SOCIAL PROOF ---- */}
      <Section className="py-28 px-5 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00d4aa] mb-3">Trusted by traders</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              What people are saying
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                name: 'Alex K.',
                role: 'Crypto Trader',
                text: 'I was using TradingView for alerts but the free tier is limited. PriceAlert gives me unlimited alerts with Telegram notifications. Game changer.',
              },
              {
                name: 'Sarah M.',
                role: 'Day Trader',
                text: 'The real-time WebSocket feed is incredible. I can see BTC price updating every second on my dashboard. Way faster than any browser extension.',
              },
              {
                name: 'David R.',
                role: 'Swing Trader',
                text: 'Love the background cron. I set my META alert at $600, closed the app, and got an email the moment it hit. Exactly what I needed.',
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-[#00d4aa] text-[#00d4aa]" />
                  ))}
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-white/30">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ---- PRICING ---- */}
      <Section id="pricing" className="py-28 px-5 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00d4aa] mb-3">Pricing</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Free. No catch.
            </h2>
            <p className="text-white/40 mt-4 max-w-md mx-auto">
              PriceAlert is completely free. No credit card, no trial period, no limits on alerts.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-sm mx-auto rounded-3xl border border-[#00d4aa]/20 bg-gradient-to-b from-[#00d4aa]/[0.06] to-transparent p-8 text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00d4aa] mb-2">Free Forever</p>
            <div className="flex items-baseline justify-center gap-1 mb-6">
              <span className="text-6xl font-extrabold">$0</span>
              <span className="text-white/30 text-lg">/mo</span>
            </div>

            <div className="space-y-3 text-left mb-8">
              {[
                'Unlimited price alerts',
                'Real-time WebSocket prices',
                'Email notifications',
                'Telegram bot integration',
                'Discord webhook support',
                'Background cron monitoring',
                '30+ crypto & stock symbols',
                'Alert history & analytics',
              ].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#00d4aa]/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#00d4aa]" />
                  </div>
                  <span className="text-sm text-white/60">{f}</span>
                </div>
              ))}
            </div>

            <Link href="/signup">
              <Button size="lg" className="w-full text-base py-4 rounded-xl shadow-[0_0_30px_rgba(0,212,170,0.15)]">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* ---- FINAL CTA ---- */}
      <Section className="py-28 px-5 border-t border-white/[0.04] relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#00d4aa]/[0.03] to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Start tracking prices
            <br />
            <span className="bg-gradient-to-r from-[#00d4aa] to-[#00e6b8] bg-clip-text text-transparent">in under a minute.</span>
          </h2>
          <p className="text-white/40 mt-6 text-lg max-w-md mx-auto">
            Free forever. No credit card required. Set your first alert right now.
          </p>
          <div className="mt-10">
            <Link href="/signup">
              <Button size="lg" className="gap-2 text-base px-10 py-4 rounded-xl shadow-[0_0_40px_rgba(0,212,170,0.2)]">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Section>

      {/* ---- FOOTER ---- */}
      <footer className="border-t border-white/[0.04] py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="PriceAlert" width={28} height={28} className="rounded-lg" />
            <span className="text-sm font-bold">PriceAlert</span>
          </div>
          <p className="text-xs text-white/20">Built with Next.js, Supabase & Resend. Deployed on Vercel.</p>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>

      {/* Inline keyframes for pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
