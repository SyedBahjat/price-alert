import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { signToken } from '@/lib/auth/jwt';
import { sendWelcomeEmail } from '@/lib/notifications/email';

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if user exists
    const { data: existing } = await supabaseAdmin
      .from('pa_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabaseAdmin
      .from('pa_users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        display_name: displayName || email.split('@')[0],
      })
      .select('id, email, display_name')
      .single();

    if (error) throw error;

    // Create default notification settings (email on by default)
    await supabaseAdmin.from('pa_notification_settings').insert({ user_id: user.id, email_enabled: true });

    // Send welcome email (fire and forget)
    sendWelcomeEmail(user.email, user.display_name || email.split('@')[0]).catch(() => {});

    const token = await signToken({ userId: user.id, email: user.email });

    const response = NextResponse.json({ user: { id: user.id, email: user.email, displayName: user.display_name } });
    response.cookies.set('pa_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
