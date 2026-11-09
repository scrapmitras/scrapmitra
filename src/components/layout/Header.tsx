import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, MapPin, User, Menu, Sun, Moon, Search, Headphones } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

interface HeaderProps {
  onOpenDrawer?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenDrawer }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const isRootTab =
    location.pathname === '/' ||
    location.pathname === '/categories' ||
    location.pathname === '/rates' ||
    location.pathname === '/bookings'

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/') return 'Scrap Mitra'
    if (path === '/categories') return 'Categories'
    if (path.startsWith('/categories/')) return 'Category Items'
    if (path === '/rates') return 'Today\'s Rates'
    if (path === '/book/scrap') return 'Select Scrap'
    if (path === '/sell-item') return 'Sell Heavy Item'
    if (path === '/bookings') return 'My Bookings'
    if (path.startsWith('/bookings/')) return 'Booking Details'
    if (path.startsWith('/sell-requests/')) return 'Sell Request'
    if (path.startsWith('/quotations/')) return 'Quotation Offer'
    if (path === '/payments') return 'Payments'
    if (path === '/notifications') return 'Notifications'
    if (path === '/support') return 'Customer Support'
    if (path === '/account') return 'My Account'
    if (path === '/account/addresses') return 'Saved Addresses'
    if (path.startsWith('/auth/')) return 'Sign In'
    if (path === '/onboarding') return 'Profile Setup'
    return 'Scrap Mitra'
  }

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Categories', path: '/categories' },
    { label: 'Today\'s Rates', path: '/rates' },
    { label: 'Book Pickup', path: '/book/scrap' },
    { label: 'Sell Heavy Item', path: '/sell-item', isSpecial: true },
    { label: 'My Bookings', path: '/bookings' },
  ]

  const isLinkActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-border-line px-3 sm:px-6 md:px-8 lg:px-12 xl:px-16 transition-colors duration-200">
      <div className="w-full max-w-[1720px] mx-auto flex items-center justify-between gap-3 sm:gap-4 h-16 sm:h-18">
        {/* Left Side: Menu/Back & Brand Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          {!isRootTab ? (
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full glass-pill flex items-center justify-center text-content-ink hover:text-primary-green transition-all cursor-pointer active:scale-95 shadow-xs"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ) : (
            <button
              onClick={onOpenDrawer}
              className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full glass-pill flex items-center justify-center text-content-ink hover:text-primary-green transition-all cursor-pointer active:scale-95 shadow-xs"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-primary-green" />
            </button>
          )}

          {/* Premium Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group select-none min-w-0">
            {/* Custom Modern Recycling Emblem */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-primary-green to-primary-green-deep flex items-center justify-center shadow-md shadow-primary-green/25 ring-1 ring-white/20 group-hover:scale-105 active:scale-95 transition-transform flex-none">
              <svg
                className="w-5 h-5 text-white drop-shadow-sm group-hover:rotate-45 transition-transform duration-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
                <path d="M11 19h8.2a1.8 1.8 0 0 0 1.565-.89 1.78 1.78 0 0 0 .015-1.78l-3.08-5.33" />
                <path d="m14 4.5 4.3 7.5" />
                <path d="M8.5 4.5h7" />
                <path d="m3.5 14.5 3.5 4.5-2 3" />
                <path d="m20.5 9.5-3.5-4.5 2-3" />
              </svg>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-lg sm:text-xl tracking-tight text-content-ink">
                  Scrap<span className="text-action-orange">Mitra</span>
                </span>
                <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Doorstep Scrap Pickup Active" />
              </div>
              <span className="hidden sm:block text-[10px] font-bold text-content-muted tracking-wider uppercase -mt-0.5">
                {isRootTab ? 'Doorstep Scrap Payouts' : getPageTitle()}
              </span>
            </div>
          </Link>
        </div>

        {/* Center: "Feel Good" Segmented Floating Glass Nav Dock (Desktop) */}
        <nav className="hidden lg:flex items-center p-1 rounded-full bg-surface-card/80 dark:bg-white/5 border border-border-line/80 backdrop-blur-xl shadow-xs">
          {navLinks.map((tab) => {
            const active = isLinkActive(tab.path)
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 select-none flex items-center gap-1.5 ${
                  active
                    ? 'bg-primary-green text-white shadow-sm scale-[1.02]'
                    : tab.isSpecial
                    ? 'text-action-orange hover:bg-action-orange/10'
                    : 'text-content-muted hover:text-content-ink hover:bg-surface-bg'
                }`}
              >
                <span>{tab.label}</span>
                {tab.isSpecial && (
                  <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded-full font-extrabold ${
                    active ? 'bg-white/20 text-white' : 'bg-action-orange/15 text-action-orange'
                  }`}>
                    Fast Quote
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Quick Rate Search Capsule (Large Desktop) */}
        <Link
          to="/rates"
          className="hidden 2xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-card/60 dark:bg-white/5 border border-border-line text-content-muted hover:text-content-ink text-xs font-semibold transition-all hover:border-primary-green/50 shadow-2xs group"
          title="Search today's scrap rates"
        >
          <Search className="w-3.5 h-3.5 text-primary-green group-hover:scale-110 transition-transform" />
          <span>Check rates (Copper, Iron)...</span>
          <kbd className="text-[10px] bg-surface-bg dark:bg-white/10 px-1.5 py-0.5 rounded border border-border-line font-mono text-content-muted">
            /rates
          </kbd>
        </Link>

        {/* Right Controls: Location, Support, Theme Switcher & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-none">
          {/* Active City Pill */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-xs font-bold text-content-ink hover:border-primary-green/40 transition-colors shadow-2xs select-none"
            title="Service active across Vijayawada & Krishna District"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <MapPin className="w-3.5 h-3.5 text-primary-green flex-none -ml-0.5" />
            <span className="truncate max-w-[100px]">Vijayawada</span>
            <span className="text-[9px] font-extrabold text-content-muted bg-surface-bg dark:bg-white/10 px-1 py-0.2 rounded border border-border-line">
              AP
            </span>
          </div>

          {/* Quick Help Hotline Button */}
          <Link
            to="/support"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-xs font-bold text-content-ink hover:text-primary-green hover:border-primary-green/40 transition-all shadow-xs active:scale-95"
            title="Customer Support & Helpline"
          >
            <Headphones className="w-3.5 h-3.5 text-primary-green" />
            <span>Help</span>
          </Link>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full glass-pill flex items-center justify-center text-content-ink hover:text-action-orange transition-all cursor-pointer active:scale-90 shadow-xs"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-action-orange animate-in spin-in-90 duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-primary-green animate-in spin-in-90 duration-200" />
            )}
          </button>

          {/* Notifications Button with Live Ping */}
          <Link
            to="/notifications"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full glass-pill flex items-center justify-center text-content-ink hover:text-primary-green transition-all relative active:scale-90 shadow-xs"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-content-muted" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-action-orange ring-2 ring-surface-card" />
          </Link>

          {/* User Account Avatar */}
          <Link
            to="/account"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary-green to-secondary-green text-white flex items-center justify-center font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all ring-2 ring-primary-green/20"
            aria-label="My Account"
            title="My Account"
          >
            <User className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}
