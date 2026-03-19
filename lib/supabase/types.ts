export interface User {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  user_id: string;
  symbol: string;
  asset_type: 'crypto' | 'stock';
  target_price: number;
  direction: 'above' | 'below';
  is_active: boolean;
  is_recurring: boolean;
  note: string | null;
  last_checked_price: number | null;
  triggered_at: string | null;
  created_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  telegram_bot_token: string | null;
  telegram_chat_id: string | null;
  telegram_enabled: boolean;
  discord_webhook_url: string | null;
  discord_enabled: boolean;
  email_enabled: boolean;
}

export interface AlertHistory {
  id: string;
  alert_id: string;
  user_id: string;
  symbol: string;
  target_price: number;
  triggered_price: number;
  direction: string;
  notification_sent: boolean;
  notification_channels: string[];
  created_at: string;
}

export interface CreateAlertInput {
  symbol: string;
  asset_type: 'crypto' | 'stock';
  target_price: number;
  direction: 'above' | 'below';
  is_recurring?: boolean;
  note?: string;
}
