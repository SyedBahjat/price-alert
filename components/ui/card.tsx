import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl glass p-4',
        hover && 'glass-hover transition-all duration-200 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
