<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Supabase-Postgres-3FCF8E?style=flat-square&logo=supabase" />
  <img src="https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

<h1 align="center">PriceAlert</h1>

<p align="center">
  <strong>Real-time crypto & stock price alerts with Email, Telegram & Discord notifications.</strong>
  <br />
  Free, self-hostable, and open source.
</p>

<p align="center">
  <a href="#features">Features</a> &bull;
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#architecture">Architecture</a> &bull;
  <a href="#deployment">Deploy</a> &bull;
  <a href="#contributing">Contributing</a>
</p>

---

## Why PriceAlert?

Most price alert tools are either paid, limited to one asset class, or don't support multiple notification channels. PriceAlert is **free, open source, and sends alerts to Email + Telegram + Discord simultaneously**.

- Set unlimited alerts for **crypto** (via Binance) and **US stocks** (via Yahoo Finance)
- Get notified the moment your target is hit — across **all your channels at once**
- **Real-time WebSocket** prices when the dashboard is open, **background cron** when it's not
- Self-host on Vercel's free tier in under 5 minutes

---

## Features

| Feature | Description |
|---------|-------------|
| **Real-time prices** | Binance WebSocket for crypto (~1s updates), Yahoo Finance REST for stocks |
| **Multi-channel alerts** | Email (Resend), Telegram Bot, Discord Webhooks — all fire simultaneously |
| **Above / Below targets** | Set direction-based alerts with optional notes |
| **Recurring alerts** | Keep alerts active after triggering for continuous monitoring |
| **Background monitoring** | External cron hits `/api/check-prices` every 60s when app is closed |
| **Client-side checking** | Instant browser + push notifications when dashboard is open |
| **Edit alerts** | Full edit modal — change target, direction, recurring, notes |
| **Alert history** | Complete log of every triggered alert with notification channel details |
| **Live price cards** | Dashboard shows real-time prices with flash animations on updates |
| **Progress bars** | Visual indicator of how close current price is to your target |
| **Dark theme** | Premium fintech-inspired UI with glassmorphism and glow effects |
| **Custom JWT auth** | httpOnly cookie auth — no conflict with other Supabase projects |
| **Mobile responsive** | Full mobile navigation with slide-out drawer |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router, TypeScript) |
| **Styling** | Tailwind CSS v4 + Framer Motion |
| **Database** | Supabase (Postgres) |
| **Auth** | Custom JWT (httpOnly cookies, `jose` + `bcryptjs`) |
| **Crypto prices** | Binance WebSocket (client) + REST API (server) |
| **Stock prices** | Yahoo Finance REST API (no API key needed) |
| **Email** | Resend (3,000 free emails/month) |
| **Telegram** | Telegram Bot API |
| **Discord** | Discord Webhooks |
| **Deployment** | Vercel (free tier) |
| **Background jobs** | cron-job.org (free, hits API route every 60s) |

---

## Quick Start

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) account (free tier)
- A [Resend](https://resend.com) account (free tier, for email alerts)

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/price-alerts.git
cd price-alerts
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project (or use an existing one — all tables are `pa_` prefixed to avoid conflicts)
2. Go to **SQL Editor** and run the contents of [`database/schema.sql`](database/schema.sql)
3. Copy your **Project URL**, **anon key**, and **service role key** from **Settings > API**

### 3. Set up Resend

1. Sign up at [resend.com](https://resend.com)
2. Go to **API Keys** > Create API Key
3. Without a custom domain, emails send from `onboarding@resend.dev` (can only send to your own email — perfect for personal use)

### 4. Configure environment

```bash
cp .env.example .env.local
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (Resend)
RESEND_API_KEY=re_xxxxx

# Auth & Security
JWT_SECRET=any-random-secret-string-here
CRON_SECRET=any-random-secret-string-here

# Optional
BINANCE_API_KEY=your_binance_key
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, and create your first alert.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                  │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Binance WS   │  │ Stock Poller │  │  Alert    │ │
│  │ (crypto,~1s) │  │ (REST, 30s)  │  │  Checker  │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                 │                │       │
│         └────────┬────────┘                │       │
│                  ▼                         ▼       │
│         ┌──────────────┐         ┌──────────────┐  │
│         │  Dashboard   │         │ /api/check-  │  │
│         │  (live UI)   │         │  single      │  │
│         └──────────────┘         └──────┬───────┘  │
└─────────────────────────────────────────┼──────────┘
                                          │
┌─────────────────────────────────────────┼──────────┐
│                    Server (API Routes)   │          │
│                                         ▼          │
│  ┌──────────────┐   ┌────────────────────────────┐ │
│  │ /api/check-  │   │     Notification Engine     │ │
│  │  prices      │──▶│  ┌───────┐ ┌────┐ ┌─────┐  │ │
│  │ (cron, 60s)  │   │  │ Email │ │ TG │ │ DC  │  │ │
│  └──────────────┘   │  └───────┘ └────┘ └─────┘  │ │
│                     └────────────────────────────┘ │
│                              │                     │
│                     ┌────────▼────────┐            │
│                     │    Supabase     │            │
│                     │   (Postgres)    │            │
│                     └─────────────────┘            │
└────────────────────────────────────────────────────┘
```

### How real-time works

| Scenario | Crypto | Stocks |
|----------|--------|--------|
| **Dashboard open** | Binance WebSocket (~1s) | REST poll every 30s |
| **App closed** | Cron every 60s | Cron every 60s |

When the dashboard is open, the client-side alert checker compares live prices against your targets every tick. When a match is found, it simultaneously:
1. Shows an in-app toast notification
2. Fires a browser push notification
3. Calls `/api/check-single` which sends Email + Telegram + Discord

When the app is closed, an external cron service hits `/api/check-prices` every 60 seconds to check all active alerts server-side.

---

## Database Schema

All tables are prefixed with `pa_` to avoid conflicts when sharing a Supabase instance with other projects.

```
pa_users              — email/password auth
pa_alerts             — user's price alerts (symbol, target, direction, etc.)
pa_notification_settings — per-user Email/Telegram/Discord config
pa_alert_history      — log of every triggered alert
```

See [`database/schema.sql`](database/schema.sql) for the full schema with indexes and RLS policies.

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/signup` | POST | Create account |
| `/api/auth/login` | POST | Sign in |
| `/api/auth/logout` | POST | Sign out |
| `/api/alerts` | GET/POST/PATCH/DELETE | CRUD alerts |
| `/api/prices/[symbol]` | GET | Get current price |
| `/api/settings` | GET/PUT | Notification settings |
| `/api/notify` | POST | Send test notification |
| `/api/check-prices` | GET | Cron endpoint (check all active alerts) |
| `/api/check-single` | POST | Check single alert (client-triggered) |
| `/api/history` | GET | Get alert history |

---

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Deploy — done

### Set up background monitoring

1. Go to [cron-job.org](https://cron-job.org) (free)
2. Create a cron job pointing to:
   ```
   https://your-domain.vercel.app/api/check-prices?secret=YOUR_CRON_SECRET
   ```
3. Set interval to **every 1 minute**

Alerts now fire 24/7 even when nobody has the app open.

---

## Notification Setup

### Email (automatic)
Enabled by default. Alerts go to the signup email. No user config needed.

### Telegram
1. Create a bot via [@BotFather](https://t.me/BotFather) on Telegram
2. Send any message to your bot
3. Get your Chat ID from `https://api.telegram.org/botYOUR_TOKEN/getUpdates`
4. Enter both in **Settings** in the app

### Discord
1. Go to your Discord channel > **Settings** > **Integrations** > **Webhooks**
2. Create a webhook and copy the URL
3. Paste it in **Settings** in the app

---

## Project Structure

```
price-alerts/
├── app/
│   ├── (auth)/login, signup       # Auth pages
│   ├── (dashboard)/               # Dashboard, history, settings
│   ├── api/                       # All API routes
│   ├── page.tsx                   # Landing page
│   └── layout.tsx                 # Root layout
├── components/
│   ├── alerts/                    # Alert card, form, list, edit modal
│   ├── dashboard/                 # Shell, sidebar, topbar, mobile nav
│   ├── onboarding/                # First-time user onboarding
│   └── ui/                        # Button, input, toggle, card, etc.
├── hooks/                         # WebSocket, polling, alert checker
├── lib/
│   ├── auth/                      # JWT sign/verify
│   ├── notifications/             # Email, Telegram, Discord senders
│   ├── prices/                    # Binance, Yahoo Finance, resolver
│   └── supabase/                  # Client, admin, types
└── database/schema.sql            # Supabase schema
```

---

## Contributing

Contributions are welcome! Some ideas:

- [ ] More asset sources (Forex, commodities, indices)
- [ ] Price chart sparklines on alert cards
- [ ] Percentage-based alerts ("alert me if BTC drops 5%")
- [ ] Webhook notifications (custom URL)
- [ ] Multi-user admin dashboard
- [ ] Mobile app (React Native / Expo)

```bash
# Fork, clone, then:
git checkout -b feature/your-feature
# make changes
git commit -m "Add your feature"
git push origin feature/your-feature
# Open a PR
```

---

## License

[MIT](LICENSE) — use it however you want.

---

<p align="center">
  <sub>If this project helped you, consider giving it a ⭐</sub>
</p>
