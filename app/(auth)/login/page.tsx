'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="PriceAlert" width={48} height={48} className="rounded-xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-bearish bg-bearish/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
