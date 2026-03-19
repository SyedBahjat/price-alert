-- Price Alerts Schema (all tables prefixed pa_ to avoid conflicts)

CREATE TABLE IF NOT EXISTS pa_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pa_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES pa_users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('crypto', 'stock')),
  target_price NUMERIC NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('above', 'below')),
  is_active BOOLEAN DEFAULT true,
  is_recurring BOOLEAN DEFAULT false,
  note TEXT,
  last_checked_price NUMERIC,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pa_notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES pa_users(id) ON DELETE CASCADE,
  telegram_bot_token TEXT,
  telegram_chat_id TEXT,
  telegram_enabled BOOLEAN DEFAULT false,
  discord_webhook_url TEXT,
  discord_enabled BOOLEAN DEFAULT false,
  email_enabled BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS pa_alert_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES pa_alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES pa_users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  target_price NUMERIC NOT NULL,
  triggered_price NUMERIC NOT NULL,
  direction TEXT NOT NULL,
  notification_sent BOOLEAN DEFAULT false,
  notification_channels TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pa_alerts_user_id ON pa_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_pa_alerts_active ON pa_alerts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pa_alert_history_user_id ON pa_alert_history(user_id);
CREATE INDEX IF NOT EXISTS idx_pa_alert_history_alert_id ON pa_alert_history(alert_id);

-- RLS Policies
ALTER TABLE pa_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pa_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pa_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pa_alert_history ENABLE ROW LEVEL SECURITY;
