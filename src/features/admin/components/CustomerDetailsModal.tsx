import React, { useEffect, useState } from 'react'
import {
  X,
  Phone,
  Mail,
  MapPin,
  Truck,
  Package,
  IndianRupee,
  ArrowRight,
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatINR } from '@/lib/utils'
import type { Profile, Booking, SellRequest, Payment, Address } from '@/types'

interface CustomerDetailsModalProps {
  customer: Profile | null
  onClose: () => void
  allBookings: Booking[]
  allSellRequests: SellRequest[]
  allPayments: Payment[]
  onOpenBooking: (booking: Booking) => void
  onOpenSellRequest: (sellRequest: SellRequest) => void
}

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  customer,
  onClose,
  allBookings,
  allSellRequests,
  allPayments,
  onOpenBooking,
  onOpenSellRequest,
}) => {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)
  const [activeSection, setActiveSection] = useState<'bookings' | 'sell_requests' | 'addresses' | 'payments'>('bookings')

  useEffect(() => {
    if (!customer) return

    const fetchAddresses = async () => {
      setIsLoadingAddresses(true)
      try {
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('profile_id', customer.id)
          .order('is_default', { ascending: false })

        if (!error && data) {
          setAddresses(data as Address[])
        }
      } catch (err) {
        console.error('Error fetching customer addresses:', err)
      } finally {
        setIsLoadingAddresses(false)
      }
    }

    fetchAddresses()
  }, [customer])

  if (!customer) return null

  const customerBookings = allBookings.filter((b) => b.profile_id === customer.id)
  const customerSellRequests = allSellRequests.filter((s) => s.profile_id === customer.id)
  const customerPayments = allPayments.filter((p) => p.profile_id === customer.id)
  const totalPayout = customerPayments.reduce(
    (acc, p) => (p.status === 'success' ? acc + Number(p.amount) : acc),
    0
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface-card border border-border-line rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border-line flex items-center justify-between bg-surface-bg/50 flex-none">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary-green-soft text-primary-green flex items-center justify-center font-display font-black text-xl flex-none border border-emerald-500/20">
              {(customer.display_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg text-content-ink">
                  {customer.display_name || 'Customer Account'}
                </h3>
                {customer.is_phone_verified && (
                  <Badge variant="success" className="text-[10px] font-bold">
                    Phone Verified
                  </Badge>
                )}
                {customer.is_email_verified && (
                  <Badge variant="default" className="text-[10px] font-bold">
                    Email Verified
                  </Badge>
                )}
              </div>
              <p className="text-xs text-content-muted">
                Customer ID: <code className="font-mono text-[11px] text-content-ink">{customer.id}</code>
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-content-ink">
          {/* Section 1: Customer Contact & Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-surface-bg border border-border-line">
              <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block mb-1">
                Direct Phone
              </span>
              {customer.phone_e164 ? (
                <a
                  href={`tel:${customer.phone_e164}`}
                  className="text-sm font-bold text-primary-green hover:underline flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {customer.phone_e164}
                </a>
              ) : (
                <span className="text-xs text-content-muted">No phone recorded</span>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-bg border border-border-line">
              <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block mb-1">
                Email Address
              </span>
              {customer.email ? (
                <a
                  href={`mailto:${customer.email}`}
                  className="text-sm font-bold text-primary-green hover:underline flex items-center gap-1.5 truncate"
                >
                  <Mail className="w-3.5 h-3.5 flex-none" />
                  <span className="truncate">{customer.email}</span>
                </a>
              ) : (
                <span className="text-xs text-content-muted">No email recorded</span>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-bg border border-border-line">
              <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block mb-1">
                Lifetime Payouts
              </span>
              <span className="font-display font-black text-lg text-emerald-600 block">
                {formatINR(totalPayout)}
              </span>
            </div>
          </div>

          {/* Quick Sub-tabs */}
          <div className="flex items-center gap-2 border-b border-border-line pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveSection('bookings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSection === 'bookings'
                  ? 'bg-secondary-green-soft text-primary-green font-black'
                  : 'text-content-muted hover:text-content-ink hover:bg-surface-bg'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Doorstep Bookings ({customerBookings.length})</span>
            </button>

            <button
              onClick={() => setActiveSection('sell_requests')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSection === 'sell_requests'
                  ? 'bg-amber-500/10 text-amber-700 font-black'
                  : 'text-content-muted hover:text-content-ink hover:bg-surface-bg'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Sell Requests ({customerSellRequests.length})</span>
            </button>

            <button
              onClick={() => setActiveSection('addresses')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSection === 'addresses'
                  ? 'bg-blue-500/10 text-blue-700 font-black'
                  : 'text-content-muted hover:text-content-ink hover:bg-surface-bg'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Saved Addresses ({addresses.length})</span>
            </button>

            <button
              onClick={() => setActiveSection('payments')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSection === 'payments'
                  ? 'bg-purple-500/10 text-purple-700 font-black'
                  : 'text-content-muted hover:text-content-ink hover:bg-surface-bg'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Disbursements ({customerPayments.length})</span>
            </button>
          </div>

          {/* Section View: Customer Bookings */}
          {activeSection === 'bookings' && (
            <div className="space-y-3">
              {customerBookings.length > 0 ? (
                customerBookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      onOpenBooking(b)
                    }}
                    className="p-3.5 rounded-2xl border border-border-line bg-surface-bg hover:border-emerald-500 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-content-ink group-hover:text-primary-green transition-colors">
                          #{b.booking_number}
                        </span>
                        <Badge
                          variant={
                            b.status === 'confirmed'
                              ? 'success'
                              : b.status === 'completed'
                              ? 'default'
                              : 'orange'
                          }
                          className="text-[10px] uppercase font-bold"
                        >
                          {b.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-[11px] text-content-muted">
                          • {new Date(b.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <p className="text-xs text-content-muted truncate max-w-md">
                        {b.pickup_address_line1}, {b.pickup_locality}, {b.pickup_city}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-border-line">
                      <div className="text-right">
                        <span className="text-[10px] text-content-muted block">Est. Payout</span>
                        <span className="font-display font-black text-sm text-emerald-600">
                          {formatINR(b.final_subtotal || b.estimated_subtotal)}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-content-muted group-hover:text-primary-green group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-2xl bg-surface-bg border border-dashed border-border-line text-center text-xs text-content-muted">
                  No pickup bookings created yet by this customer.
                </div>
              )}
            </div>
          )}

          {/* Section View: Customer Sell Requests */}
          {activeSection === 'sell_requests' && (
            <div className="space-y-3">
              {customerSellRequests.length > 0 ? (
                customerSellRequests.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onOpenSellRequest(s)
                    }}
                    className="p-3.5 rounded-2xl border border-border-line bg-surface-bg hover:border-amber-500 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-content-ink group-hover:text-amber-600 transition-colors">
                          #{s.request_number}
                        </span>
                        <Badge variant="orange" className="text-[10px] uppercase font-bold">
                          {s.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-[11px] text-content-muted">
                          • {new Date(s.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <h5 className="font-display font-bold text-sm text-content-ink">
                        {s.item_title}
                      </h5>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-border-line">
                      <div className="text-right">
                        <span className="text-[10px] text-content-muted block">Quoted Price</span>
                        <span className="font-display font-bold text-sm text-action-orange">
                          {s.quotation ? formatINR(s.quotation.offered_amount) : 'Pending'}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-content-muted group-hover:text-action-orange group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-2xl bg-surface-bg border border-dashed border-border-line text-center text-xs text-content-muted">
                  No sell or quotation requests created yet by this customer.
                </div>
              )}
            </div>
          )}

          {/* Section View: Customer Saved Addresses */}
          {activeSection === 'addresses' && (
            <div className="space-y-3">
              {isLoadingAddresses ? (
                <div className="p-6 text-center text-xs text-content-muted">Loading addresses from database...</div>
              ) : addresses.length > 0 ? (
                addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 rounded-2xl border border-border-line bg-surface-bg flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-content-ink capitalize">
                          {addr.label || addr.address_type}
                        </span>
                        {addr.is_default && (
                          <Badge variant="success" className="text-[10px]">Default</Badge>
                        )}
                      </div>
                      <p className="text-xs font-bold text-content-ink">
                        {addr.address_line1}
                        {addr.address_line2 ? `, ${addr.address_line2}` : ''}
                      </p>
                      <p className="text-xs text-content-muted">
                        Landmark: {addr.landmark || 'None'} • Locality: {addr.locality || 'N/A'}
                      </p>
                      <p className="text-xs text-content-muted">
                        {addr.city}, {addr.state} - {addr.postal_code}
                      </p>
                    </div>

                    <MapPin className="w-4 h-4 text-primary-green flex-none mt-1" />
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-2xl bg-surface-bg border border-dashed border-border-line text-center text-xs text-content-muted">
                  No addresses registered in `public.addresses`.
                </div>
              )}
            </div>
          )}

          {/* Section View: Customer Disbursements */}
          {activeSection === 'payments' && (
            <div className="space-y-3">
              {customerPayments.length > 0 ? (
                customerPayments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl border border-border-line bg-surface-bg flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-content-ink">
                          #{p.payment_number}
                        </span>
                        <Badge
                          variant={p.status === 'success' ? 'success' : 'orange'}
                          className="text-[10px] uppercase font-bold"
                        >
                          {p.status}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-content-muted block mt-0.5">
                        Method: <strong className="uppercase">{p.method}</strong> • {new Date(p.created_at).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-display font-black text-base text-emerald-600">
                        {formatINR(p.amount)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-2xl bg-surface-bg border border-dashed border-border-line text-center text-xs text-content-muted">
                  No payout transactions logged in `public.payments`.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border-line bg-surface-bg/50 flex items-center justify-between flex-none">
          <span className="text-xs text-content-muted">
            Joined on: {new Date(customer.created_at).toLocaleDateString('en-IN')}
          </span>
          <Button size="sm" variant="outline" onClick={onClose} className="text-xs font-semibold">
            Close Customer Card
          </Button>
        </div>
      </div>
    </div>
  )
}
