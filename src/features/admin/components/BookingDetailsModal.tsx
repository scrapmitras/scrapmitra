import React, { useState } from 'react'
import {
  X,
  Truck,
  MapPin,
  Clock,
  User,
  Phone,
  IndianRupee,
  Package,
  CheckCircle2,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatINR } from '@/lib/utils'
import type { Booking } from '@/types'

interface BookingDetailsModalProps {
  booking: Booking | null
  onClose: () => void
  onUpdateStatus: (bookingId: string, status: string) => Promise<void>
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  onClose,
  onUpdateStatus,
}) => {
  const [isUpdating, setIsUpdating] = useState(false)

  if (!booking) return null

  const handleStatusChange = async (status: string) => {
    setIsUpdating(true)
    await onUpdateStatus(booking.id, status)
    setIsUpdating(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface-card border border-border-line rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border-line flex items-center justify-between bg-surface-bg/50 flex-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary-green-soft text-primary-green flex items-center justify-center flex-none">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg text-content-ink">
                  Booking #{booking.booking_number}
                </h3>
                <Badge
                  variant={
                    booking.status === 'confirmed'
                      ? 'success'
                      : booking.status === 'completed'
                      ? 'default'
                      : 'orange'
                  }
                  className="text-[10px] uppercase font-bold"
                >
                  {booking.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-xs text-content-muted">
                Placed on {new Date(booking.created_at).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-bg border border-border-line flex items-center justify-center text-content-muted hover:text-content-ink transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-content-ink">
          {/* Section 1: Customer & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-bg border border-border-line">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-content-muted uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary-green" />
                Customer Contact
              </span>
              <p className="text-sm font-bold text-content-ink">{booking.pickup_contact_name}</p>
              <a
                href={`tel:${booking.pickup_contact_phone_e164}`}
                className="text-xs text-primary-green font-semibold hover:underline inline-flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                {booking.pickup_contact_phone_e164}
              </a>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-content-muted uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary-green" />
                Scheduled Window
              </span>
              <p className="text-sm font-semibold text-content-ink">
                {booking.scheduled_for
                  ? new Date(booking.scheduled_for).toLocaleString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Pending Slot Assignment'}
              </p>
              {booking.customer_note && (
                <p className="text-xs text-content-muted italic">Note: "{booking.customer_note}"</p>
              )}
            </div>
          </div>

          {/* Section 2: Full Pickup Address */}
          <div className="p-4 rounded-2xl bg-surface-bg border border-border-line space-y-1.5">
            <span className="text-[11px] font-bold text-content-muted uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary-green" />
              Pickup Location
            </span>
            <p className="text-sm font-bold text-content-ink">
              {booking.pickup_address_line1}
              {booking.pickup_address_line2 ? `, ${booking.pickup_address_line2}` : ''}
            </p>
            <p className="text-xs text-content-muted">
              Landmark: {booking.pickup_landmark || 'None'} • Locality: {booking.pickup_locality}
            </p>
            <p className="text-xs text-content-muted">
              {booking.pickup_city}, {booking.pickup_state} -{' '}
              <strong className="text-content-ink">{booking.pickup_postal_code}</strong> ({booking.pickup_country_code})
            </p>
          </div>

          {/* Section 3: Scrap Line Items Breakdown */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-content-muted uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-primary-green" />
              Materials to Collect ({booking.items?.length || 0} commodities)
            </span>

            {booking.items && booking.items.length > 0 ? (
              <div className="border border-border-line rounded-2xl overflow-hidden divide-y divide-border-line">
                <div className="grid grid-cols-12 bg-surface-bg/80 px-4 py-2 text-[11px] font-bold text-content-muted uppercase">
                  <div className="col-span-5">Material Snapshot</div>
                  <div className="col-span-3 text-center">Unit Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>

                {booking.items.map((item: any) => (
                  <div key={item.id} className="grid grid-cols-12 px-4 py-3 text-xs items-center">
                    <div className="col-span-5">
                      <span className="font-bold text-content-ink block">{item.item_name_snapshot}</span>
                      {item.customer_item_note && (
                        <span className="text-[10px] text-content-muted italic">
                          "{item.customer_item_note}"
                        </span>
                      )}
                    </div>
                    <div className="col-span-3 text-center font-mono text-content-muted">
                      ₹{item.rate_per_unit_snapshot}/{item.unit_snapshot}
                    </div>
                    <div className="col-span-2 text-center font-bold text-content-ink">
                      {item.final_quantity || item.estimated_quantity} {item.unit_snapshot}
                    </div>
                    <div className="col-span-2 text-right font-bold text-primary-green">
                      {formatINR(item.final_amount || item.estimated_amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-surface-bg text-xs text-content-muted text-center">
                No specific line items recorded. Estimated payout: {formatINR(booking.estimated_subtotal)}
              </div>
            )}
          </div>

          {/* Section 4: Total Financial Breakdown */}
          <div className="p-4 rounded-2xl bg-primary-green/5 border border-primary-green/20 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-content-ink flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-primary-green" />
                Payment & Disbursement Status
              </span>
              <p className="text-xs text-content-muted">
                Payment: <strong className="uppercase text-content-ink">{booking.payment_status}</strong> (Doorstep payout)
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-content-muted block">
                {booking.final_subtotal ? 'Final Weighed Total' : 'Estimated Payout'}
              </span>
              <span className="font-display font-black text-xl text-primary-green">
                {formatINR(booking.final_subtotal || booking.estimated_subtotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-border-line bg-surface-bg/50 flex flex-wrap items-center justify-between gap-3 flex-none">
          <div className="text-xs text-content-muted">
            Lifecycle: <strong className="text-content-ink uppercase">{booking.status}</strong>
          </div>

          <div className="flex items-center gap-2">
            {booking.status === 'pending_confirmation' && (
              <Button
                size="sm"
                onClick={() => handleStatusChange('confirmed')}
                isLoading={isUpdating}
                className="font-bold text-xs"
              >
                Confirm Pickup Window
              </Button>
            )}

            {booking.status === 'confirmed' && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleStatusChange('assigned')}
                isLoading={isUpdating}
                className="font-bold text-xs"
              >
                Assign Partner Van
              </Button>
            )}

            {booking.status === 'assigned' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('completed')}
                isLoading={isUpdating}
                className="font-bold text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-500/10"
              >
                Mark Completed & Paid
              </Button>
            )}

            {booking.status === 'completed' && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Fully Completed</span>
              </span>
            )}

            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleStatusChange('cancelled')}
                isLoading={isUpdating}
                className="text-xs text-rose-500 hover:bg-rose-500/10"
              >
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
