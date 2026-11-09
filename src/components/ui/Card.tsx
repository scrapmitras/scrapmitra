import React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'muted' | 'outline' | 'interactive'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default:
        'glass-panel rounded-2xl p-4 sm:p-5 text-content-ink transition-colors',
      muted:
        'bg-secondary-green-soft/60 backdrop-blur-md text-content-ink border border-border-line rounded-2xl p-4 sm:p-5 transition-colors',
      outline:
        'bg-transparent text-content-ink border border-border-line rounded-2xl p-4 sm:p-5 transition-colors',
      interactive:
        'glass-panel rounded-2xl p-4 sm:p-5 text-content-ink hover:border-primary-green/70 hover:shadow-[0_10px_28px_rgba(0,0,0,0.09)] dark:hover:shadow-[0_10px_32px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 cursor-pointer transition-all duration-200',
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

