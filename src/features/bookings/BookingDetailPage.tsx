import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, AlertTriangle, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatINR } from '@/lib/utils'
import { supabase } from '@/lib/supabaseClient'
import type { Booking } from '@/types'

export const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('Changed my mind')
  const [isCancelling, setIsCancelling] = useState(false)

  const fetchBooking = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, items:booking_items(*)')
        .or(`booking_number.eq.${id},id.eq.${id}`)
        .maybeSingle()

      if (!error && data) {
        setBooking(data as Booking)
      } else {
        setBooking(null)
      }
    } catch (err) {
      console.error('Error loading booking:', err)
      setBooking(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBooking()
  }, [id])

  const handleConfirmCancel = async () => {
    if (!booking) return
    setIsCancelling(true)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancellation_reason: cancelReason,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', booking.id)

      if (!error) {
        setBooking((prev) => (prev ? { ...prev, status: 'cancelled' } : null))
        setShowCancelModal(false)
      }
    } catch (err) {
      console.error('Error cancelling booking:', err)
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-primary-green mx-auto" />
        <p className="text-xs text-content-muted">Loading live booking details...</p>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="font-display font-bold text-xl text-content-ink">
          Booking #{id} Not Found
        </h2>
        <p className="text-xs text-content-muted">
          This booking does not exist in the database or may have been deleted.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/bookings">
            <Button variant="outline" size="sm">
              View My Bookings
            </Button>
          </Link>
          <Link to="/book/scrap">
            <Button size="sm" className="font-bold">
              Book a Pickup
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const isCancelled = booking.status === 'cancelled'

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link
        to="/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted hover:text-primary-green transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>All Bookings</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-mono font-bold text-content-muted block">
            #{booking?.booking_number || id}
          </span>
          <h1 className="font-display font-black text-2xl text-content-ink">
            Doorstep Scrap Pickup
          </h1>
          <p className="text-xs text-content-muted">
            Scheduled for{' '}
            {booking?.scheduled_for
              ? new Date(booking.scheduled_for).toLocaleString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Pending Slot Confirmation'}
          </p>
        </div>
        <Badge
          variant={
            booking?.status === 'confirmed'
              ? 'success'
              : booking?.status === 'completed'
              ? 'default'
              : isCancelled
              ? 'error'
              : 'orange'
          }
          className="uppercase font-bold text-[10px]"
        >
          {booking?.status.replace('_', ' ') || 'Pending'}
        </Badge>
      </div>

      {/* Collection Timeline */}
      <Card className="p-5 space-y-4">
        <h3 className="font-display font-bold text-sm text-content-ink">
          Collection Timeline
        </h3>

        <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-line">
          <div className="relative">
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] bg-primary-green ring-4 ring-secondary-green-soft">
              ✓
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-content-ink">Booking Confirmed</h4>
              <p className="text-xs text-content-muted">Pickup order registered in system</p>
            </div>
          </div>

          <div className="relative">
            <div
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${
                booking?.status === 'assigned' || booking?.status === 'completed'
                  ? 'bg-primary-green ring-4 ring-secondary-green-soft'
                  : 'bg-border-line text-content-muted'
              }`}
            >
              {booking?.status === 'assigned' || booking?.status === 'completed' ? '✓' : '2'}
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-content-ink">Partner Assigned</h4>
              <p className="text-xs text-content-muted">
                {booking?.status === 'assigned' || booking?.status === 'completed'
                  ? 'Partner Van #AP16-TC-4589 assigned'
                  : 'Van route optimization in progress'}
              </p>
            </div>
          </div>

          <div className="relative">
            <div
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${
                booking?.status === 'completed'
                  ? 'bg-primary-green ring-4 ring-secondary-green-soft'
                  : 'bg-border-line text-content-muted'
              }`}
            >
              {booking?.status === 'completed' ? '✓' : '3'}
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-content-ink">Doorstep Weighing</h4>
              <p className="text-xs text-content-muted">Certified digital scale verification at doorstep</p>
            </div>
          </div>

          <div className="relative">
            <div
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${
                booking?.status === 'completed'
                  ? 'bg-primary-green ring-4 ring-secondary-green-soft'
                  : 'bg-border-line text-content-muted'
              }`}
            >
              {booking?.status === 'completed' ? '✓' : '4'}
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-content-ink">Instant Payout</h4>
              <p className="text-xs text-content-muted">Cash or instant UPI disbursement</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Material Snapshot (Real quantities entered by user) */}
      <Card className="p-5 space-y-3">
        <h3 className="font-display font-bold text-sm text-content-ink">
          Material Snapshot & Indicative Rates
        </h3>

        <div className="border border-border-line rounded-xl overflow-hidden divide-y divide-border-line text-xs">
          {booking?.items && booking.items.length > 0 ? (
            booking.items.map((item: any) => (
              <div key={item.id} className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-content-ink block">{item.item_name_snapshot}</span>
                  <span className="text-content-muted">
                    {item.final_quantity || item.estimated_quantity} {item.unit_snapshot} × ₹{item.rate_per_unit_snapshot}/{item.unit_snapshot}
                  </span>
                </div>
                <div className="font-display font-black text-sm text-primary-green">
                  {formatINR(item.final_amount || item.estimated_amount)}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-xs text-content-muted">
              Estimated total: {formatINR(booking?.estimated_subtotal || 0)}
            </div>
          )}
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-content-muted">
            {booking?.final_subtotal ? 'Final Weighed Total:' : 'Estimated Total:'}
          </span>
          <span className="font-display font-black text-xl text-primary-green">
            {formatINR(booking?.final_subtotal || booking?.estimated_subtotal || 0)}
          </span>
        </div>
      </Card>

      {/* Pickup Location Snapshot */}
      <Card className="p-5 space-y-2">
        <h3 className="font-display font-bold text-sm text-content-ink flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-primary-green" />
          <span>Pickup Location Snapshot</span>
        </h3>
        <p className="text-xs font-bold text-content-ink">
          {booking?.pickup_address_line1}
          {booking?.pickup_address_line2 ? `, ${booking.pickup_address_line2}` : ''}
        </p>
        <p className="text-xs text-content-muted">
          {booking?.pickup_locality}, {booking?.pickup_city} - {booking?.pickup_postal_code}
        </p>
        <div className="pt-1 text-xs text-content-ink">
          Contact: <strong>{booking?.pickup_contact_name}</strong> ({booking?.pickup_contact_phone_e164})
        </div>
      </Card>

      {/* Actions */}
      {!isCancelled && booking?.status !== 'completed' && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCancelModal(true)}
            className="text-xs text-rose-500 hover:bg-rose-500/10"
          >
            Cancel Pickup Request
          </Button>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface-card border border-border-line rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-xl">
            <h4 className="font-display font-bold text-base text-content-ink">
              Cancel Pickup Booking?
            </h4>
            <p className="text-xs text-content-muted">
              Are you sure you want to cancel this doorstep collection slot?
            </p>

            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-border-line bg-surface-bg text-content-ink"
            >
              <option value="Changed my mind">Changed my mind</option>
              <option value="Not available at scheduled time">Not available at scheduled time</option>
              <option value="Rates did not match expectation">Rates did not match expectation</option>
              <option value="Booked by mistake">Booked by mistake</option>
            </select>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelModal(false)}
                className="w-1/2 text-xs"
              >
                Keep Booking
              </Button>
              <Button
                size="sm"
                isLoading={isCancelling}
                onClick={handleConfirmCancel}
                className="w-1/2 text-xs bg-rose-500 hover:bg-rose-600 font-bold"
              >
                Yes, Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
