import React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'muted' | 'outline' | 'interactive'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-surface-card text-content-ink border border-border-line shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
      muted: 'bg-secondary-green-soft text-content-ink border border-border-line',
      outline: 'bg-transparent text-content-ink border border-border-line',
      interactive:
        'bg-surface-card text-content-ink border border-border-line shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:border-primary-green cursor-pointer transition-all duration-150',
    }

    return (
      <div
        ref={ref}
        className={cn('rounded-2xl p-4 sm:p-5', variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

