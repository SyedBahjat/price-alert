'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';

interface Settings {
  telegram_bot_token: string;
  telegram_chat_id: string;
  telegram_enabled: boolean;
  discord_webhook_url: string;
  discord_enabled: boolean;
  email_enabled: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    telegram_bot_token: '',
    telegram_chat_id: '',
    telegram_enabled: false,
    discord_webhook_url: '',
    discord_enabled: false,
    email_enabled: true,
  });
  const [userEmail, setUserEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [testingTg, setTestingTg] = useState(false);
  const [testingDc, setTestingDc] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setSettings({
            telegram_bot_token: data.telegram_bot_token || '',
            telegram_chat_id: data.telegram_chat_id || '',
            telegram_enabled: data.telegram_enabled || false,
            discord_webhook_url: data.discord_webhook_url || '',
            discord_enabled: data.discord_enabled || false,
            email_enabled: data.email_enabled ?? true,
          });
          if (data.email) setUserEmail(data.email);
        }
      })
      .catch(() => {});
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setStatus(res.ok
        ? { type: 'success', msg: 'Settings saved!' }
        : { type: 'error', msg: 'Failed to save settings' }
      );
    } catch {
      setStatus({ type: 'error', msg: 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const testNotification = async (type: 'telegram' | 'discord' | 'email') => {
    const setTesting = type === 'telegram' ? setTestingTg : type === 'discord' ? setTestingDc : setTestingEmail;
    setTesting(true);
    setStatus(null);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      setStatus({
        type: data.success ? 'success' : 'error',
        msg: data.success ? `${type} test sent!` : data.error || `${type} test failed`,
      });
    } catch {
      setStatus({ type: 'error', msg: 'Test failed' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your notification channels</p>
      </div>

      {status && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ${
            status.type === 'success'
              ? 'bg-bullish/5 text-bullish border-bullish/20'
              : 'bg-bearish/5 text-bearish border-bearish/20'
          }`}
        >
          {status.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {status.msg}
        </motion.div>
      )}

      {/* Email */}
      <div className="rounded-xl border border-card-border bg-surface/50 overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Email</h3>
              <p className="text-xs text-muted-foreground">
                {userEmail ? <span className="text-foreground font-mono text-[11px]">{userEmail}</span> : 'Your signup email'}
              </p>
            </div>
          </div>
          <Toggle checked={settings.email_enabled} onChange={v => setSettings(s => ({ ...s, email_enabled: v }))} />
        </div>
        <div className="px-4 pb-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => testNotification('email')}
            disabled={testingEmail}
          >
            {testingEmail ? 'Sending...' : 'Send Test Email'}
          </Button>
        </div>
      </div>

      {/* Telegram */}
      <div className="rounded-xl border border-card-border bg-surface/50 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0088cc]/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-[#0088cc]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Telegram</h3>
              <p className="text-xs text-muted-foreground">Bot notifications</p>
            </div>
          </div>
          <Toggle checked={settings.telegram_enabled} onChange={v => setSettings(s => ({ ...s, telegram_enabled: v }))} />
        </div>
        <div className="p-4 space-y-3">
          <Input
            id="tg-token"
            label="Bot Token"
            placeholder="123456:ABC-DEF1234ghIkl-..."
            secret
            value={settings.telegram_bot_token}
            onChange={e => setSettings(s => ({ ...s, telegram_bot_token: e.target.value }))}
          />
          <Input
            id="tg-chat"
            label="Chat ID"
            placeholder="Your chat ID"
            value={settings.telegram_chat_id}
            onChange={e => setSettings(s => ({ ...s, telegram_chat_id: e.target.value }))}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => testNotification('telegram')}
            disabled={testingTg || !settings.telegram_bot_token || !settings.telegram_chat_id}
          >
            {testingTg ? 'Sending...' : 'Send Test'}
          </Button>
        </div>
      </div>

      {/* Discord */}
      <div className="rounded-xl border border-card-border bg-surface/50 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#5865F2]/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#5865F2]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Discord</h3>
              <p className="text-xs text-muted-foreground">Webhook notifications</p>
            </div>
          </div>
          <Toggle checked={settings.discord_enabled} onChange={v => setSettings(s => ({ ...s, discord_enabled: v }))} />
        </div>
        <div className="p-4 space-y-3">
          <Input
            id="dc-webhook"
            label="Webhook URL"
            placeholder="https://discord.com/api/webhooks/..."
            secret
            value={settings.discord_webhook_url}
            onChange={e => setSettings(s => ({ ...s, discord_webhook_url: e.target.value }))}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => testNotification('discord')}
            disabled={testingDc || !settings.discord_webhook_url}
          >
            {testingDc ? 'Sending...' : 'Send Test'}
          </Button>
        </div>
      </div>

      <Button onClick={saveSettings} disabled={saving} size="lg" className="w-full">
        {saving ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
}
