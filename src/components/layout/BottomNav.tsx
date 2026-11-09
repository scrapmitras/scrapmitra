import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Recycle, Armchair, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

export const BottomNav: React.FC = () => {
  const location = useLocation()

  const tabs = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Pickup', path: '/book/scrap', icon: Recycle },
    { label: 'Sell', path: '/sell-item', icon: Armchair },
    { label: 'Bookings', path: '/bookings', icon: ClipboardList },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  // Hide bottom nav on specific sub-flows (e.g. detailed auth or modal flows if needed)
  const hideBottomNav =
    location.pathname.startsWith('/auth/') ||
    location.pathname === '/onboarding'

  if (hideBottomNav) return null

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-border-line px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom, 0px))' }}
      aria-label="Mobile Navigation"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const active = isActive(tab.path)
          const Icon = tab.icon

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                'flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer',
                active ? 'text-primary-green font-bold' : 'text-content-muted hover:text-content-ink'
              )}
            >
              <div
                className={cn(
                  'w-11 h-7 rounded-full flex items-center justify-center mb-0.5 transition-colors',
                  active ? 'bg-secondary-green-soft text-primary-green' : 'text-content-muted'
                )}
              >
                <Icon className={cn('w-5 h-5', active ? 'stroke-[2.5px]' : 'stroke-2')} />
              </div>
              <span className="text-[11px] leading-tight tracking-tight">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
