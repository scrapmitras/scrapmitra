import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Phone, MapPin, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatINR } from '@/lib/utils'

export const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('Changed my mind')
  const [otherReason, setOtherReason] = useState('')
  const [isCancelled, setIsCancelled] = useState(false)

  const steps = [
    { title: 'Booking Confirmed', desc: '10 Nov, 08:30 AM', done: true },
    { title: 'Partner Assigned', desc: 'Ramesh (Electric Cargo Auto)', done: true },
    { title: 'Doorstep Weighing', desc: 'Digital scale verification', done: false },
    { title: 'Instant Payout', desc: 'Cash or UPI transfer', done: false },
  ]

  const items = [
    { name: 'Newspaper', rate: 14, estQty: 25, estTotal: 350 },
    { name: 'Cardboard / Cartons', rate: 12, estQty: 15, estTotal: 180 },
  ]

  const handleConfirmCancel = () => {
    setIsCancelled(true)
    setShowCancelModal(false)
  }

  return (
    <div className="space-y-6">
      <Link
        to="/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted hover:text-primary-green transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>All Bookings</span>
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-mono text-content-muted block">
            {id || 'SM-2026-0001042'}
          </span>
          <h1 className="font-display font-bold text-2xl text-content-ink">
            Doorstep Scrap Pickup
          </h1>
          <p className="text-xs text-content-muted">
            Scheduled for Today, 10 Nov 2026 (10:00 AM - 01:00 PM)
          </p>
        </div>
        <Badge variant={isCancelled ? 'error' : 'default'} className="flex-none">
          {isCancelled ? 'Cancelled' : 'Partner Assigned'}
        </Badge>
      </div>

      {/* Status Stepper Timeline */}
      <Card className="p-5 space-y-4">
        <h3 className="font-display font-bold text-sm text-content-ink">
          Collection Timeline
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-line">
          {steps.map((st, i) => (
            <div key={st.title} className="relative">
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${
                  st.done
                    ? 'bg-primary-green ring-4 ring-secondary-green-soft'
                    : 'bg-border-line text-content-muted'
                }`}
              >
                {st.done ? '✓' : i + 1}
              </div>
              <div>
                <h4
                  className={`font-display font-bold text-sm ${
                    st.done ? 'text-content-ink' : 'text-content-muted'
                  }`}
                >
                  {st.title}
                </h4>
                <p className="text-xs text-content-muted">{st.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Partner Details */}
      {!isCancelled && (
        <Card variant="muted" className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary-green text-white font-bold flex items-center justify-center text-sm shadow-xs">
              RK
            </div>
            <div>
              <span className="text-xs text-content-muted block">Assigned Partner</span>
              <h4 className="font-display font-bold text-sm text-content-ink">
                Ramesh Kumar (AP 16 TX 4920)
              </h4>
              <span className="text-[11px] text-primary-green font-semibold">
                Certified Digital Scale Verified
              </span>
            </div>
          </div>

          <a
            href="tel:+919876543210"
            className="w-9 h-9 rounded-full bg-white border border-border-line flex items-center justify-center text-primary-green hover:bg-secondary-green-soft"
            aria-label="Call partner"
          >
            <Phone className="w-4 h-4" />
          </a>
        </Card>
      )}

      {/* Items Snapshot Table */}
      <Card className="p-5 space-y-3">
        <h3 className="font-display font-bold text-sm text-content-ink">
          Material Snapshot & Indicative Rates
        </h3>

        <div className="divide-y divide-border-line text-xs">
          {items.map((it) => (
            <div key={it.name} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-content-ink block">{it.name}</span>
                <span className="text-content-muted">
                  {it.estQty} kg × ₹{it.rate}/kg
                </span>
              </div>
              <span className="font-display font-bold text-sm text-content-ink">
                {formatINR(it.estTotal)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-border-line flex items-center justify-between">
          <div>
            <span className="text-xs text-content-muted block">Estimated Total</span>
            <span className="font-display font-bold text-lg text-primary-green">
              {formatINR(530)}
            </span>
          </div>
          <span className="text-[11px] text-content-muted">
            Final weight calculated at weighing
          </span>
        </div>
      </Card>

      {/* Pickup Address Snapshot */}
      <Card className="p-4 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-content-muted uppercase">
          <MapPin className="w-3.5 h-3.5 text-primary-green" />
          <span>Pickup Location Snapshot</span>
        </div>
        <p className="text-xs sm:text-sm font-semibold text-content-ink">
          12-4, Gandhi Nagar 2nd Line, Near Apollo Pharmacy, Vijayawada – 520003
        </p>
        <p className="text-xs text-content-muted">
          Contact: Ravi Kumar (+91 98765 43210)
        </p>
      </Card>

      {/* Cancellation Action */}
      {!isCancelled && (
        <div className="pt-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowCancelModal(true)}
            className="w-full"
          >
            Cancel This Booking
          </Button>
        </div>
      )}

      {/* Cancellation Modal Dialog */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-content-ink/40 backdrop-blur-xs"
            onClick={() => setShowCancelModal(false)}
          />
          <div className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-content-ink">
                Cancel Pickup Booking
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-8 h-8 rounded-full bg-surface-bg flex items-center justify-center text-content-muted hover:text-content-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-content-muted">
              Please tell us why you are cancelling. Your reserved pickup slot will be released back to the neighborhood pool.
            </p>

            <div className="space-y-2">
              {[
                'Changed my mind',
                'Found a better price',
                'Booked by mistake',
                'Not available at pickup time',
                'Other',
              ].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setCancelReason(r)}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    cancelReason === r
                      ? 'border-primary-green bg-secondary-green-soft text-primary-green'
                      : 'border-border-line bg-white text-content-ink hover:border-primary-green'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {cancelReason === 'Other' && (
              <textarea
                rows={2}
                placeholder="Please describe your reason..."
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-border-line text-xs focus:outline-none focus:ring-2 focus:ring-primary-green"
              />
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="w-1/2"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Booking
              </Button>
              <Button
                variant="danger"
                className="w-1/2"
                onClick={handleConfirmCancel}
              >
                Confirm Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
