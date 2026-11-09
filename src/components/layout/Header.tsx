import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, MapPin, User, Menu } from 'lucide-react'

interface HeaderProps {
  onOpenDrawer?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenDrawer }) => {
  const location = useLocation()
  const navigate = useNavigate()

  // Determine if current route is a sub-page that needs a back button
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
    if (path === '/sell-item') return 'Sell an Item'
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

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border-line px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Left side: Back button or Logo */}
        <div className="flex items-center gap-3 min-w-0">
          {!isRootTab ? (
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-surface-bg flex items-center justify-center text-content-ink hover:bg-secondary-green-soft transition-colors cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onOpenDrawer}
              className="md:hidden w-9 h-9 rounded-full bg-surface-bg flex items-center justify-center text-content-ink hover:bg-secondary-green-soft transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-primary-green" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2 group min-w-0">
            <span className="w-8 h-8 rounded-lg bg-primary-green text-white flex items-center justify-center font-bold text-lg shadow-sm flex-none">
              ♻
            </span>
            <div className="min-w-0">
              <span className="font-display font-bold text-lg text-primary-green tracking-tight group-hover:text-primary-green-deep block truncate">
                {isRootTab ? 'Scrap Mitra' : getPageTitle()}
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-content-muted">
          <Link
            to="/"
            className={`hover:text-primary-green transition-colors ${
              location.pathname === '/' ? 'text-primary-green font-semibold' : ''
            }`}
          >
            Home
          </Link>
          <Link
            to="/categories"
            className={`hover:text-primary-green transition-colors ${
              location.pathname.startsWith('/categories') ? 'text-primary-green font-semibold' : ''
            }`}
          >
            Categories
          </Link>
          <Link
            to="/rates"
            className={`hover:text-primary-green transition-colors ${
              location.pathname === '/rates' ? 'text-primary-green font-semibold' : ''
            }`}
          >
            Rates
          </Link>
          <Link
            to="/book/scrap"
            className={`hover:text-primary-green transition-colors ${
              location.pathname === '/book/scrap' ? 'text-primary-green font-semibold' : ''
            }`}
          >
            Book Pickup
          </Link>
          <Link
            to="/sell-item"
            className={`hover:text-primary-green transition-colors ${
              location.pathname === '/sell-item' ? 'text-action-orange font-semibold' : ''
            }`}
          >
            Sell Heavy Item
          </Link>
          <Link
            to="/bookings"
            className={`hover:text-primary-green transition-colors ${
              location.pathname.startsWith('/bookings') ? 'text-primary-green font-semibold' : ''
            }`}
          >
            My Bookings
          </Link>
        </nav>

        {/* Right side: Location & User controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-none">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-bg border border-border-line text-xs font-medium text-content-ink">
            <MapPin className="w-3.5 h-3.5 text-primary-green flex-none" />
            <span className="truncate max-w-[120px]">Vijayawada</span>
          </div>

          <Link
            to="/notifications"
            className="w-9 h-9 rounded-full bg-surface-bg border border-border-line flex items-center justify-center text-content-ink hover:bg-secondary-green-soft transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-content-muted" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-action-orange ring-2 ring-white" />
          </Link>

          <Link
            to="/account"
            className="w-9 h-9 rounded-full bg-primary-green text-white flex items-center justify-center font-bold text-sm shadow-sm hover:bg-primary-green-deep transition-colors"
            aria-label="My Account"
          >
            <User className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}
