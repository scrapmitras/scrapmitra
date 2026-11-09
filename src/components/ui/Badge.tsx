import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline' | 'orange'
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-secondary-green-soft/80 backdrop-blur-xs border border-primary-green/25 text-primary-green font-semibold',
      success: 'bg-status-success-soft/80 backdrop-blur-xs border border-status-success/25 text-status-success font-semibold',
      warning: 'bg-status-warning-soft/80 backdrop-blur-xs border border-status-warning/25 text-status-warning font-semibold',
      error: 'bg-status-error-soft/80 backdrop-blur-xs border border-status-error/25 text-status-error font-semibold',
      orange: 'bg-action-orange-soft/80 backdrop-blur-xs border border-action-orange/30 text-action-orange font-semibold',
      outline: 'bg-surface-card/60 backdrop-blur-xs border border-border-line text-content-muted font-medium',
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

