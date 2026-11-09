import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, User, MapPin, Tag, ShieldCheck, HelpCircle, FileText, LogOut, ChevronRight } from 'lucide-react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true" aria-label="Navigation Menu">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-content-ink/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="relative w-4/5 max-w-sm h-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-border-line flex items-center justify-between bg-surface-bg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-green text-white font-display font-bold text-xl flex items-center justify-center shadow-sm">
              SM
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-content-ink">Scrap Mitra</h3>
              <p className="text-xs text-content-muted">Vijayawada, Andhra Pradesh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-border-line flex items-center justify-center text-content-muted hover:text-content-ink"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-content-muted">
            Customer Portal
          </div>

          <Link
            to="/account"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-bg text-sm font-medium text-content-ink transition-colors"
          >
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-primary-green" />
              <span>Profile & Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-content-muted" />
          </Link>

          <Link
            to="/account/addresses"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-bg text-sm font-medium text-content-ink transition-colors"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-primary-green" />
              <span>Saved Addresses</span>
            </div>
            <ChevronRight className="w-4 h-4 text-content-muted" />
          </Link>

          <Link
            to="/rates"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-bg text-sm font-medium text-content-ink transition-colors"
          >
            <div className="flex items-center gap-3">
              <Tag className="w-4 h-4 text-primary-green" />
              <span>Current Scrap Rates</span>
            </div>
            <ChevronRight className="w-4 h-4 text-content-muted" />
          </Link>

          <Link
            to="/categories"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-bg text-sm font-medium text-content-ink transition-colors"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-primary-green" />
              <span>Material Categories</span>
            </div>
            <ChevronRight className="w-4 h-4 text-content-muted" />
          </Link>

          <div className="pt-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-content-muted">
            Help & Policies
          </div>

          <Link
            to="/support"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-bg text-sm font-medium text-content-ink transition-colors"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 text-primary-green" />
              <span>Support & Contact</span>
            </div>
            <ChevronRight className="w-4 h-4 text-content-muted" />
          </Link>

          <Link
            to="/auth/phone"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-bg text-sm font-medium text-content-ink transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-primary-green" />
              <span>Sign In / Register</span>
            </div>
            <ChevronRight className="w-4 h-4 text-content-muted" />
          </Link>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border-line">
          <Link
            to="/auth/phone"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-border-line text-sm font-medium text-status-error hover:bg-status-error-soft transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>
    </div>
  )
}
