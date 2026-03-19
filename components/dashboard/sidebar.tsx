'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Settings, History, LogOut } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-card-border bg-surface/80 backdrop-blur-xl z-40">
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <Image src="/logo.png" alt="PriceAlert" width={36} height={36} className="rounded-xl" />
          <div>
            <span className="text-base font-bold tracking-tight">PriceAlert</span>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-bullish live-dot" />
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground">live</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 mt-2">
        <p className="text-[10px] uppercase tracking-widest text-muted px-3 mb-2 font-semibold">Menu</p>
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-bearish hover:bg-bearish/5 transition-all w-full cursor-pointer border border-transparent hover:border-bearish/20"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
