import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline' | 'orange'
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-secondary-green-soft text-primary-green font-medium',
      success: 'bg-status-success-soft text-status-success font-semibold',
      warning: 'bg-status-warning-soft text-status-warning font-semibold',
      error: 'bg-status-error-soft text-status-error font-semibold',
      orange: 'bg-action-orange-soft text-action-orange font-semibold',
      outline: 'bg-transparent border border-border-line text-content-muted font-medium',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-1 rounded-full text-xs transition-colors',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

