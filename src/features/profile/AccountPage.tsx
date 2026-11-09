import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Globe, Shield, LogOut, ChevronRight, CheckCircle2, Sun, Moon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/hooks/useTheme'

export const AccountPage: React.FC = () => {
  const [name, setName] = useState('Ravi Kumar')
  const [isEditing, setIsEditing] = useState(false)
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-content-ink">
          My Account
        </h1>
        <p className="text-sm text-content-muted">
          Manage your personal profile, addresses, and connected identity.
        </p>
      </div>

      {/* Profile Card */}
      <Card className="p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-green text-white font-display font-bold text-2xl flex items-center justify-center shadow-xs">
            R
          </div>
          <div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-2 py-1 border border-border-line rounded-lg text-sm font-bold text-content-ink focus:outline-none focus:ring-1 focus:ring-primary-green"
                />
              ) : (
                <h2 className="font-display font-bold text-lg text-content-ink">
                  {name}
                </h2>
              )}
              <Badge variant="success" className="text-[10px]">Verified</Badge>
            </div>
            <p className="text-xs text-content-muted mt-0.5">
              +91 98765 43210 • ravi@example.com
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Done' : 'Edit'}
        </Button>
      </Card>

      {/* Account Settings List */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-content-muted px-1">
          Preferences & Data
        </h3>

        <Link to="/account/addresses" className="block">
          <Card variant="interactive" className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-secondary-green-soft text-primary-green flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-content-ink">
                  Pickup Addresses
                </h4>
                <p className="text-xs text-content-muted">2 saved addresses</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-content-muted" />
          </Card>
        </Link>

        <Link to="/payments" className="block">
          <Card variant="interactive" className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-secondary-green-soft text-primary-green flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-content-ink">
                  Payment History & Payouts
                </h4>
                <p className="text-xs text-content-muted">View past scrap transaction receipts</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-content-muted" />
          </Card>
        </Link>

        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary-green-soft text-primary-green flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-content-ink">
                Language
              </h4>
              <p className="text-xs text-content-muted">English (India)</p>
            </div>
          </div>
          <Badge variant="outline">Default</Badge>
        </Card>

        {/* Dark Mode Preference Card */}
        <Card
          variant="interactive"
          onClick={toggleTheme}
          className="p-4 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary-green-soft text-primary-green flex items-center justify-center">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-action-orange" /> : <Moon className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-content-ink">
                Appearance & Theme
              </h4>
              <p className="text-xs text-content-muted">
                {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'} (Tap to switch)
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-bg border border-border-line text-content-ink">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </Card>
      </div>

      {/* Linked Identities */}
      <Card className="p-5 space-y-3">
        <h3 className="font-display font-bold text-sm text-content-ink">
          Linked Authentication Methods
        </h3>
        <p className="text-xs text-content-muted">
          Your account is secured via verified multi-provider credentials.
        </p>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-bg border border-border-line text-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary-green" />
              <span className="font-medium text-content-ink">Firebase Phone OTP (+91 98765 43210)</span>
            </div>
            <span className="text-status-success font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Linked
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-bg border border-border-line text-xs">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary-green" />
              <span className="font-medium text-content-ink">Supabase Email Auth (ravi@example.com)</span>
            </div>
            <span className="text-status-success font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
            </span>
          </div>
        </div>
      </Card>

      {/* Sign Out */}
      <Link to="/auth/phone" className="block pt-2">
        <Button variant="danger" className="w-full gap-2">
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Scrap Mitra</span>
        </Button>
      </Link>
    </div>
  )
}
