import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Calendar, MapPin, Plus, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatINR } from '@/lib/utils'

export const BookingsListPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  const bookings = [
    {
      id: 'SM-2026-0001042',
      items: 'Newspaper · 25 kg, Cardboard · 15 kg',
      status: 'assigned',
      statusLabel: 'Partner Assigned',
      badgeVariant: 'default' as const,
      scheduledFor: '10 Nov 2026, 10:00 AM - 01:00 PM',
      estimatedAmount: 530,
      finalAmount: null,
      address: '12-4, Gandhi Nagar, Vijayawada',
    },
    {
      id: 'SM-2026-0001039',
      items: 'Newspaper · 20 kg, Copper · 2 kg',
      status: 'completed',
      statusLabel: 'Paid & Completed',
      badgeVariant: 'success' as const,
      scheduledFor: '07 Nov 2026',
      estimatedAmount: 1320,
      finalAmount: 1320,
      address: '12-4, Gandhi Nagar, Vijayawada',
    },
    {
      id: 'SI-2026-0002201',
      items: 'Old Living Room Sofa Set',
      status: 'quotation_sent',
      statusLabel: 'Quotation Ready (₹4,500)',
      badgeVariant: 'orange' as const,
      scheduledFor: 'Under Review',
      estimatedAmount: 4500,
      finalAmount: null,
      address: 'Shop #14, Main Road, Vijayawada',
      isSellRequest: true,
    },
    {
      id: 'SM-2026-0000984',
      items: 'Iron Scrap · 80 kg',
      status: 'cancelled',
      statusLabel: 'Cancelled',
      badgeVariant: 'error' as const,
      scheduledFor: '01 Nov 2026',
      estimatedAmount: 2240,
      finalAmount: null,
      address: '12-4, Gandhi Nagar, Vijayawada',
    },
  ]

  const totalEarnings = bookings
    .filter((b) => b.status === 'completed' && b.finalAmount)
    .reduce((sum, b) => sum + (b.finalAmount || 0), 0)

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'active') return b.status !== 'completed' && b.status !== 'cancelled'
    if (filter === 'completed') return b.status === 'completed'
    return true
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-content-ink">
            My Bookings
          </h1>
          <p className="text-sm text-content-muted">
            Track scrap collection visits and verified payouts.
          </p>
        </div>

        <Link to="/book/scrap">
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span>New Pickup</span>
          </Button>
        </Link>
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
          { id: 'all', label: 'All Orders' },
          { id: 'active', label: 'Active Pickup' },
          { id: 'completed', label: 'Completed' },
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

      {/* Bookings List */}
      <div className="space-y-3">
        {filteredBookings.map((b) => (
          <Link
            key={b.id}
            to={b.isSellRequest ? `/sell-requests/${b.id}` : `/bookings/${b.id}`}
            className="block group"
          >
            <Card variant="interactive" className="p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono text-content-muted font-bold block">
                    {b.id}
                  </span>
                  <h4 className="font-display font-bold text-base text-content-ink group-hover:text-primary-green transition-colors">
                    {b.items}
                  </h4>
                </div>
                <Badge variant={b.badgeVariant} className="flex-none">
                  {b.statusLabel}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-content-muted">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary-green" />
                  <span>{b.scheduledFor}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary-green" />
                  <span className="truncate max-w-[200px]">{b.address}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border-line">
                <span className="text-xs font-semibold text-content-muted">
                  {b.finalAmount ? 'Verified Payout' : 'Estimated Payout'}:{' '}
                  <strong className="text-primary-green font-display text-sm">
                    {formatINR(b.finalAmount || b.estimatedAmount)}
                  </strong>
                </span>

                <div className="flex items-center gap-1 text-xs font-semibold text-primary-green">
                  <span>Track Details</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

