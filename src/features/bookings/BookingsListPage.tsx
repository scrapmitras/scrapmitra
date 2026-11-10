import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Calendar, MapPin, Plus, Sparkles, RefreshCw, Truck } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatINR } from '@/lib/utils'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/app/auth-context'
import type { Booking } from '@/types'

export const BookingsListPage: React.FC = () => {
  const { profile, isAdmin } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('bookings')
        .select('*, items:booking_items(*)')
        .order('created_at', { ascending: false })

      // Filter by customer unless admin
      if (!isAdmin) {
        if (profile?.id) {
          if (profile.phone_e164) {
            query = query.or(`profile_id.eq.${profile.id},pickup_contact_phone_e164.eq.${profile.phone_e164}`)
          } else {
            query = query.eq('profile_id', profile.id)
          }
        } else {
          const savedId = localStorage.getItem('scrap_mitra_active_profile_id')
          if (savedId) {
            query = query.eq('profile_id', savedId)
          }
        }
      }

      const { data, error } = await query
      if (!error && data) {
        setBookings(data as Booking[])
      }
    } catch (err) {
      console.error('Error fetching bookings from Supabase:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [profile?.id, isAdmin])

  const totalEarnings = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + (Number(b.final_subtotal) || Number(b.estimated_subtotal) || 0), 0)

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'active') return b.status !== 'completed' && b.status !== 'cancelled'
    if (filter === 'completed') return b.status === 'completed'
    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Paid & Completed', variant: 'success' as const }
      case 'assigned':
        return { label: 'Partner Assigned', variant: 'default' as const }
      case 'pending_confirmation':
        return { label: 'Pending Confirmation', variant: 'orange' as const }
      case 'cancelled':
        return { label: 'Cancelled', variant: 'error' as const }
      default:
        return { label: status.replace('_', ' '), variant: 'orange' as const }
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-content-ink">
            My Bookings
          </h1>
          <p className="text-sm text-content-muted">
            Track scrap collection visits and verified payouts in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchBookings}
            disabled={isLoading}
            className="text-content-muted hover:text-content-ink"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Link to="/book/scrap">
            <Button size="sm" className="gap-1.5 font-bold">
              <Plus className="w-4 h-4" />
              <span>New Pickup</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Lifetime Earnings Banner */}
      <div className="p-5 rounded-3xl bg-primary-green text-white shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs text-white/80 font-medium block">
            Total Scrap Payouts Received
          </span>
          <span className="font-display font-bold text-3xl text-white">
            {formatINR(totalEarnings)}
          </span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-action-orange text-xl">
          <Sparkles className="w-6 h-6 text-action-orange" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: `All Orders (${bookings.length})` },
          { id: 'active', label: `Active Pickup (${bookings.filter((b) => b.status !== 'completed' && b.status !== 'cancelled').length})` },
          { id: 'completed', label: `Completed (${bookings.filter((b) => b.status === 'completed').length})` },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              filter === f.id
                ? 'bg-primary-green text-white shadow-xs'
                : 'bg-surface-card text-content-muted border border-border-line hover:border-primary-green'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-12 text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-primary-green mx-auto" />
          <p className="text-xs text-content-muted">Loading live orders from database...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card className="p-10 text-center space-y-3 border-border-line">
          <div className="w-12 h-12 rounded-2xl bg-secondary-green-soft text-primary-green mx-auto flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-base text-content-ink">
            No bookings found
          </h3>
          <p className="text-xs text-content-muted max-w-sm mx-auto">
            {filter === 'all'
              ? "You haven't placed any scrap pickup bookings yet. Book doorstep pickup in 60 seconds!"
              : `No ${filter} bookings at the moment.`}
          </p>
          <Link to="/book/scrap">
            <Button size="sm" className="mt-2 font-bold">
              Book a Pickup Now
            </Button>
          </Link>
        </Card>
      ) : (
        /* Bookings List */
        <div className="space-y-3">
          {filteredBookings.map((b) => {
            const badge = getStatusBadge(b.status)
            const itemsSummary =
              b.items && b.items.length > 0
                ? b.items
                    .map(
                      (i: any) =>
                        `${i.item_name_snapshot} (${i.estimated_quantity} ${i.unit_snapshot})`
                    )
                    .join(' • ')
                : 'Doorstep Collection Scheduled'

            const scheduledFormatted = b.scheduled_for
              ? new Date(b.scheduled_for).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Date Pending'

            return (
              <Link
                key={b.id}
                to={`/bookings/${b.booking_number}`}
                className="block group"
              >
                <Card variant="interactive" className="p-4 space-y-2.5 hover:border-primary-green transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono text-content-muted font-bold block">
                        #{b.booking_number}
                      </span>
                      <h4 className="font-display font-bold text-base text-content-ink group-hover:text-primary-green transition-colors">
                        {itemsSummary}
                      </h4>
                    </div>
                    <Badge variant={badge.variant} className="flex-none uppercase text-[10px] font-bold">
                      {badge.label}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-content-muted">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary-green" />
                      <span>{scheduledFormatted}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary-green" />
                      <span className="truncate max-w-[240px]">
                        {b.pickup_address_line1}, {b.pickup_locality}, {b.pickup_city}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border-line">
                    <span className="text-xs font-semibold text-content-muted">
                      {b.final_subtotal ? 'Verified Payout' : 'Estimated Payout'}:{' '}
                      <strong className="text-primary-green font-display text-sm">
                        {formatINR(b.final_subtotal || b.estimated_subtotal || 0)}
                      </strong>
                    </span>

                    <div className="flex items-center gap-1 text-xs font-semibold text-primary-green">
                      <span>Track Details</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
