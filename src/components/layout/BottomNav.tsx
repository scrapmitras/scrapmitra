import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Recycle, Armchair, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

export const BottomNav: React.FC = () => {
  const location = useLocation()

  const tabs = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Pickup', path: '/book/scrap', icon: Recycle },
    { label: 'Sell Heavy', path: '/sell-item', icon: Armchair, highlight: true },
    { label: 'Bookings', path: '/bookings', icon: ClipboardList },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  // Hide bottom nav on specific sub-flows (e.g. auth or onboarding)
  const hideBottomNav =
    location.pathname.startsWith('/auth/') ||
    location.pathname === '/onboarding'

  if (hideBottomNav) return null

  return (
    <nav
      className="lg:hidden fixed bottom-3 inset-x-3 z-40 max-w-md mx-auto"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Mobile Navigation Dock"
    >
      <div className="glass-panel rounded-3xl p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.22)] border border-white/20 dark:border-white/10 backdrop-blur-2xl">
        <div className="grid grid-cols-4 gap-1 items-center">
          {tabs.map((tab) => {
            const active = isActive(tab.path)
            const Icon = tab.icon

            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer relative select-none active:scale-95',
                  active
                    ? 'text-primary-green font-bold'
                    : 'text-content-muted hover:text-content-ink'
                )}
              >
                {/* Active Glowing Indicator Pill */}
                {active && (
                  <span className="absolute inset-0 bg-primary-green/12 dark:bg-primary-green/20 rounded-2xl -z-10 animate-in fade-in zoom-in-95 duration-150" />
                )}

                <div
                  className={cn(
                    'w-9 h-7 rounded-xl flex items-center justify-center mb-0.5 transition-all duration-200 relative',
                    active
                      ? 'text-primary-green'
                      : 'text-content-muted'
                  )}
                >
                  <Icon className={cn('w-5 h-5 transition-transform duration-200', active ? 'scale-110 stroke-[2.5px]' : 'stroke-2')} />
                  {tab.highlight && !active && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-action-orange ring-2 ring-surface-card" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight font-semibold">
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
