import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Phone,
  Mail,
  MapPin,
  Shield,
  LogOut,
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/app/auth-context'
import { supabase } from '@/lib/supabaseClient'

export const AccountPage: React.FC = () => {
  const { profile, isLoggedIn, logout, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  if (!isLoggedIn || !profile) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <h2 className="font-display font-bold text-xl text-content-ink">
          Not Signed In
        </h2>
        <p className="text-sm text-content-muted">
          Please sign in to view and manage your Scrap Mitra account.
        </p>
        <Link to="/auth/email">
          <Button className="font-bold">Sign In to Continue</Button>
        </Link>
      </div>
    )
  }

  const handleSaveName = async () => {
    if (!profile?.id) return
    setIsSaving(true)
    try {
      await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', profile.id)

      await refreshProfile()
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating name:', err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl text-content-ink">
            My Account
          </h1>
          <p className="text-sm text-content-muted">
            Manage your personal profile, saved addresses, and active session.
          </p>
        </div>
        <Link to="/dashboard">
          <Button variant="outline" size="sm" className="font-bold text-xs flex items-center gap-1.5">
            <LayoutDashboard className="w-3.5 h-3.5 text-primary-green" />
            <span>Open Dashboard</span>
          </Button>
        </Link>
      </div>

      {/* Profile Card from Supabase */}
      <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-border-line">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-green to-secondary-green text-white font-display font-bold text-2xl flex items-center justify-center shadow-md ring-2 ring-primary-green/20">
            {(profile.display_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="px-2.5 py-1 border border-border-line rounded-lg text-sm font-bold text-content-ink focus:outline-none focus:ring-1 focus:ring-primary-green bg-surface-card"
                  />
                  <Button size="sm" onClick={handleSaveName} isLoading={isSaving}>
                    Save
                  </Button>
                </div>
              ) : (
                <h2 className="font-display font-bold text-lg text-content-ink">
                  {profile.display_name}
                </h2>
              )}
              {profile.is_phone_verified && (
                <Badge variant="success" className="text-[10px]">
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-content-muted mt-1">
              {profile.phone_e164 && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-primary-green" />
                  {profile.phone_e164}
                </span>
              )}
              {profile.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-primary-green" />
                  {profile.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDisplayName(profile.display_name || '')
              setIsEditing(true)
            }}
          >
            Edit Name
          </Button>
        )}
      </Card>

      {/* Account Settings List */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-content-muted px-1">
          Account Shortcuts
        </h3>

        <Link to="/dashboard" className="block">
          <Card variant="interactive" className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-secondary-green-soft text-primary-green flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-content-ink">
                  Live Scrap Dashboard
                </h4>
                <p className="text-xs text-content-muted">View all your bookings, rates, and payouts</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-content-muted" />
          </Card>
        </Link>

        <Link to="/account/addresses" className="block">
          <Card variant="interactive" className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-secondary-green-soft text-primary-green flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-content-ink">
                  Saved Pickup Addresses
                </h4>
                <p className="text-xs text-content-muted">Manage your doorstep collection points</p>
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
      </div>

      {/* Logout Action */}
      <div className="pt-4 border-t border-border-line">
        <Button
          variant="outline"
          className="w-full text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-rose-500/30 font-bold"
          onClick={() => {
            logout()
            navigate('/auth/email')
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out of Account
        </Button>
      </div>
    </div>
  )
}
