'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  secret?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, secret, type, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const isSecret = secret || type === 'password';
    const inputType = isSecret ? (visible ? 'text' : 'password') : type;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-muted-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={inputType}
            className={cn(
              'w-full rounded-lg bg-surface-light border border-card-border px-3 py-2 text-sm text-foreground',
              'placeholder:text-muted transition-all duration-200',
              'focus:border-primary/50',
              isSecret && 'pr-10',
              error && 'border-bearish/50',
              className
            )}
            {...props}
          />
          {isSecret && (
            <button
              type="button"
              onClick={() => setVisible(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              tabIndex={-1}
            >
              {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-bearish">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
