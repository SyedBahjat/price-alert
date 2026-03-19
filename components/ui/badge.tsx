import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'bullish' | 'bearish' | 'muted';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        {
          'bg-primary/10 text-primary': variant === 'default',
          'bg-bullish/10 text-bullish': variant === 'bullish',
          'bg-bearish/10 text-bearish': variant === 'bearish',
          'bg-white/5 text-muted-foreground': variant === 'muted',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
