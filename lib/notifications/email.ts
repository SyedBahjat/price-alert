import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendAlertEmail(
  to: string,
  symbol: string,
  direction: string,
  targetPrice: number,
  currentPrice: number,
  note?: string | null
): Promise<boolean> {
  try {
    const emoji = direction === 'above' ? '🟢' : '🔴';
    const arrow = direction === 'above' ? '↑' : '↓';

    const { error } = await getResend().emails.send({
      from: 'PriceAlert <onboarding@resend.dev>',
      to,
      subject: `${emoji} ${symbol} hit your ${direction} target of $${targetPrice.toLocaleString()}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; background: #0c0c1d; color: #e8e8f0; border-radius: 16px; overflow: hidden;">
          <div style="padding: 32px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 8px;">${emoji}</div>
            <h1 style="margin: 0 0 4px; font-size: 22px; color: #e8e8f0;">Price Alert Triggered</h1>
            <p style="margin: 0; color: #9ca3af; font-size: 14px;">${symbol} is now ${direction} your target</p>
          </div>
          <div style="padding: 0 32px 32px;">
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #9ca3af; font-size: 14px;">${arrow} Target Price</td>
                  <td style="padding: 8px 0; text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 600; color: #e8e8f0;">$${targetPrice.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #9ca3af; font-size: 14px;">💰 Current Price</td>
                  <td style="padding: 8px 0; text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 600; color: ${direction === 'above' ? '#00d2a0' : '#ff4757'};">$${currentPrice.toLocaleString()}</td>
                </tr>
              </table>
              ${note ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); color: #9ca3af; font-size: 13px;">📝 ${note}</div>` : ''}
            </div>
            <div style="text-align: center; margin-top: 24px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background: #00d4aa; color: #060611; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">View Dashboard</a>
            </div>
          </div>
          <div style="padding: 16px 32px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">PriceAlert — Real-Time Price Monitoring</p>
          </div>
        </div>
      `,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  try {
    const { error } = await getResend().emails.send({
      from: 'PriceAlert <onboarding@resend.dev>',
      to,
      subject: 'Welcome to PriceAlert 🚀',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; background: #0c0c1d; color: #e8e8f0; border-radius: 16px; overflow: hidden;">
          <div style="padding: 40px 32px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">📈</div>
            <h1 style="margin: 0 0 8px; font-size: 24px; color: #e8e8f0;">Welcome, ${name}!</h1>
            <p style="margin: 0; color: #9ca3af; font-size: 15px; line-height: 1.6;">You're all set to track prices and never miss a target again.</p>
          </div>
          <div style="padding: 0 32px 32px;">
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px;">
              <h3 style="margin: 0 0 12px; font-size: 14px; color: #00d4aa;">Get started in 3 steps:</h3>
              <div style="color: #9ca3af; font-size: 13px; line-height: 1.8;">
                <p style="margin: 0;">1️⃣ <strong style="color: #e8e8f0;">Create an alert</strong> — pick a symbol, set a target price</p>
                <p style="margin: 0;">2️⃣ <strong style="color: #e8e8f0;">Real-time tracking</strong> — crypto updates via WebSocket, stocks poll every 30s</p>
                <p style="margin: 0;">3️⃣ <strong style="color: #e8e8f0;">Get notified</strong> — email alerts are on by default, add Telegram or Discord in Settings</p>
              </div>
            </div>
            <div style="text-align: center; margin-top: 24px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background: #00d4aa; color: #060611; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Go to Dashboard</a>
            </div>
          </div>
          <div style="padding: 16px 32px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">PriceAlert — Real-Time Price Monitoring</p>
          </div>
        </div>
      `,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function sendTestEmail(to: string): Promise<boolean> {
  try {
    const { error } = await getResend().emails.send({
      from: 'PriceAlert <onboarding@resend.dev>',
      to,
      subject: '🔔 Test Alert — PriceAlert',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; background: #0c0c1d; color: #e8e8f0; border-radius: 16px; padding: 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 12px;">🔔</div>
          <h1 style="margin: 0 0 8px; font-size: 20px;">Email Notifications Working!</h1>
          <p style="margin: 0; color: #9ca3af; font-size: 14px;">You'll receive price alerts at this email address.</p>
        </div>
      `,
    });
    return !error;
  } catch {
    return false;
  }
}
