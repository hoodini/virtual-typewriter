'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface ButtonPrimaryProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'gradient' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  asChild?: boolean;
}

const ButtonPrimary = forwardRef<HTMLButtonElement, ButtonPrimaryProps>(
  ({ className, variant = 'solid', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      solid: 'bg-[#FF4D8E] text-white hover:bg-[#FF4D8E]/90 hover:scale-[1.02] active:scale-[0.98]',
      gradient: 'gradient-brand text-white hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]',
      outline: 'border-2 border-foreground/20 text-foreground hover:bg-foreground/5 dark:border-white/20 dark:text-white dark:hover:bg-white/5 hover:scale-[1.02] active:scale-[0.98]',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ButtonPrimary.displayName = 'ButtonPrimary';

export { ButtonPrimary };
