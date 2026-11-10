import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Truck,
  IndianRupee,
  Package,
  MapPin,
  Clock,
  FileText,
  Plus,
  RefreshCw,
  LogOut,
  TrendingUp,
  Headphones,
  Phone,
  Mail,
  ChevronRight,
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/app/auth-context'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatINR } from '@/lib/utils'
import type { Booking, SellRequest, Payment, Address, ScrapItem } from '@/types'

export const DashboardPage: React.FC = () => {
  const { profile, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [scrapItems, setScrapItems] = useState<ScrapItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'bookings' | 'sell_requests' | 'payments' | 'rates'>('bookings')

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/auth/email')
    }
  }, [isLoggedIn, navigate])

  const fetchUserDataFromDatabase = async () => {
    if (!profile?.id) return
    setIsLoading(true)

    try {
      // 1. Fetch User's Bookings from public.bookings table
      let bQuery = supabase
        .from('bookings')
        .select('*, items:booking_items(*)')
        .order('created_at', { ascending: false })

      if (profile.phone_e164) {
        bQuery = bQuery.or(`profile_id.eq.${profile.id},pickup_contact_phone_e164.eq.${profile.phone_e164}`)
      } else {
        bQuery = bQuery.eq('profile_id', profile.id)
      }

      const { data: bookingsData } = await bQuery

      if (bookingsData) setBookings(bookingsData as Booking[])

      // 2. Fetch User's Custom Sell Requests from public.sell_requests table
      const { data: sellData } = await supabase
        .from('sell_requests')
        .select('*, images:sell_request_images(*), quotation:quotations(*)')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })

      if (sellData) {
        const formatted = sellData.map((s: any) => ({
          ...s,
          quotation: Array.isArray(s.quotation) ? s.quotation[0] : s.quotation,
        }))
        setSellRequests(formatted as SellRequest[])
      }

      // 3. Fetch User's Payments from public.payments table
      const { data: payData } = await supabase
        .from('payments')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })

      if (payData) setPayments(payData as Payment[])

      // 4. Fetch User's Saved Addresses from public.addresses table
      const { data: addrData } = await supabase
        .from('addresses')
        .select('*')
        .eq('profile_id', profile.id)

      if (addrData) setAddresses(addrData as Address[])

      // 5. Fetch Live Scrap Items and published Rates
      const { data: itemsData } = await supabase
        .from('scrap_items')
        .select('*, current_rate:scrap_rates(*)')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (itemsData) {
        const formattedItems = itemsData.map((item: any) => ({
          ...item,
          current_rate: Array.isArray(item.current_rate) ? item.current_rate[0] : item.current_rate,
        }))
        setScrapItems(formattedItems as ScrapItem[])
      }
    } catch (err) {
      console.error('Error querying Supabase tables for user:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserDataFromDatabase()
  }, [profile?.id])

  // Total earnings strictly calculated from completed payment records in database
  const totalEarned = payments.reduce(
    (acc, p) => (p.status === 'success' ? acc + Number(p.amount) : acc),
    0
  )

  if (!profile) {
    return null
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner: Real User Details from public.profiles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-primary-green-deep to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-primary-green/30">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-300">
              Supabase Connected • User ID: {profile.id.slice(0, 8)}...
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white flex items-center gap-2">
            <span>Welcome, {profile.display_name || 'Customer'}!</span>
            <Badge variant="success" className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              Verified User
            </Badge>
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100/80 pt-0.5">
            {profile.phone_e164 && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                {profile.phone_e164}
              </span>
            )}
            {profile.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                {profile.email}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchUserDataFromDatabase}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-white/10"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="border-white/20 text-white hover:bg-white/10 text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* 4 Real Metric Summary Cards (Live from Supabase) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Bookings */}
        <Card className="p-4 sm:p-5 border-border-line hover:border-primary-green/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-content-muted">
              Bookings
            </span>
            <div className="w-8 h-8 rounded-xl bg-secondary-green-soft text-primary-green flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-content-ink">
            {bookings.length}
          </div>
          <p className="text-[11px] text-content-muted mt-0.5">
            From `bookings` table
          </p>
        </Card>

        {/* Metric 2: Total Payouts */}
        <Card className="p-4 sm:p-5 border-border-line hover:border-action-orange/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-content-muted">
              Total Payouts
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-content-ink">
            {formatINR(totalEarned)}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
            From `payments` table
          </p>
        </Card>

        {/* Metric 3: Custom Sell Requests */}
        <Card className="p-4 sm:p-5 border-border-line hover:border-primary-green/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-content-muted">
              Sell Requests
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-content-ink">
            {sellRequests.length}
          </div>
          <p className="text-[11px] text-content-muted mt-0.5">
            From `sell_requests` table
          </p>
        </Card>

        {/* Metric 4: Saved Locations */}
        <Card className="p-4 sm:p-5 border-border-line hover:border-primary-green/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-content-muted">
              Saved Addresses
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-content-ink">
            {addresses.length}
          </div>
          <p className="text-[11px] text-content-muted mt-0.5">
            From `addresses` table
          </p>
        </Card>
      </div>

      {/* Quick Action Navigation */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Link to="/book/scrap">
          <Button size="sm" className="font-bold">
            <Plus className="w-4 h-4 mr-1.5" />
            Book Doorstep Pickup
          </Button>
        </Link>
        <Link to="/sell-item">
          <Button variant="secondary" size="sm" className="font-bold">
            <Package className="w-4 h-4 mr-1.5" />
            Sell Heavy Item (Get Quote)
          </Button>
        </Link>
        <Link to="/rates">
          <Button variant="outline" size="sm" className="font-semibold">
            <TrendingUp className="w-4 h-4 mr-1.5 text-primary-green" />
            Check Live Scrap Rates
          </Button>
        </Link>
        <Link to="/support">
          <Button variant="ghost" size="sm" className="font-semibold">
            <Headphones className="w-4 h-4 mr-1.5 text-content-muted" />
            Help Desk
          </Button>
        </Link>
      </div>

      {/* Data Views Tabs (All queried from Supabase) */}
      <Card className="border-border-line shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center border-b border-border-line bg-surface-card/60 px-4 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-primary-green text-primary-green'
                : 'border-transparent text-content-muted hover:text-content-ink'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>My Bookings ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sell_requests')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'sell_requests'
                ? 'border-primary-green text-primary-green'
                : 'border-transparent text-content-muted hover:text-content-ink'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Sell Requests & Quotes ({sellRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'payments'
                ? 'border-primary-green text-primary-green'
                : 'border-transparent text-content-muted hover:text-content-ink'
            }`}
          >
            <IndianRupee className="w-4 h-4" />
            <span>Payout Records ({payments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rates')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'rates'
                ? 'border-primary-green text-primary-green'
                : 'border-transparent text-content-muted hover:text-content-ink'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Live Price Catalog ({scrapItems.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6">
          {/* 1. BOOKINGS LIST */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-secondary-green-soft text-primary-green mx-auto flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-base text-content-ink">
                    No bookings found in database
                  </h3>
                  <p className="text-xs text-content-muted max-w-sm mx-auto">
                    You haven't scheduled any doorstep scrap pickups yet. Book your first pickup in 60 seconds!
                  </p>
                  <Link to="/book/scrap">
                    <Button size="sm" className="mt-2 font-bold">
                      Book a Pickup Now
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <Link
                      key={booking.id}
                      to={`/bookings/${booking.booking_number}`}
                      className="block group"
                    >
                      <div
                        className="p-4 rounded-2xl border border-border-line bg-surface-card hover:border-primary-green transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-content-ink">
                              #{booking.booking_number}
                            </span>
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
                            <span className="text-xs text-content-muted">
                              • {new Date(booking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>

                          <p className="text-sm font-semibold text-content-ink group-hover:text-primary-green transition-colors">
                            {booking.items && booking.items.length > 0
                              ? booking.items.map((i: any) => `${i.item_name_snapshot} (${i.estimated_quantity} ${i.unit_snapshot})`).join(' • ')
                              : 'Doorstep Collection Scheduled'}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-content-muted">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-primary-green" />
                              {booking.pickup_locality}, {booking.pickup_city}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-content-muted" />
                              {booking.scheduled_for ? new Date(booking.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending Slot'}
                            </span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-border-line">
                          <span className="text-xs text-content-muted">Estimated Payout</span>
                          <span className="font-display font-black text-lg text-primary-green">
                            {formatINR(booking.final_subtotal || booking.estimated_subtotal)}
                          </span>
                          <span className="text-[11px] font-semibold text-primary-green flex items-center gap-0.5 mt-1 group-hover:translate-x-0.5 transition-transform">
                            Track Order <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. SELL REQUESTS & QUOTATIONS */}
          {activeTab === 'sell_requests' && (
            <div className="space-y-4">
              {sellRequests.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-action-orange mx-auto flex items-center justify-center">
                    <Package className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-base text-content-ink">
                    No custom quotation requests
                  </h3>
                  <p className="text-xs text-content-muted max-w-sm mx-auto">
                    Have bulky items, old vehicles, or factory scrap? Submit a photo request and our team will quote you within 2 hours.
                  </p>
                  <Link to="/sell-item">
                    <Button variant="secondary" size="sm" className="mt-2 font-bold">
                      Get a Custom Quote
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {sellRequests.map((sr) => (
                    <div
                      key={sr.id}
                      className="p-4 rounded-2xl border border-border-line bg-surface-card hover:border-action-orange/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-content-ink">
                            #{sr.request_number}
                          </span>
                          <Badge variant="orange" className="text-[10px] uppercase font-bold">
                            {sr.status.replace('_', ' ')}
                          </Badge>
                          {sr.images && sr.images.length > 0 && (
                            <span className="text-[11px] bg-surface-bg px-2 py-0.5 rounded border border-border-line text-content-muted">
                              📸 {sr.images.length} photos
                            </span>
                          )}
                        </div>

                        <h4 className="font-display font-bold text-base text-content-ink">
                          {sr.item_title}
                        </h4>
                        <p className="text-xs text-content-muted line-clamp-1 max-w-xl">
                          {sr.item_description || 'Condition inspection pending'}
                        </p>
                        <p className="text-[11px] text-content-muted">
                          Pickup location: {sr.pickup_locality}, {sr.pickup_city} • {new Date(sr.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-border-line">
                        <span className="text-xs text-content-muted">Offered Quote</span>
                        <span className="font-display font-black text-lg text-action-orange">
                          {sr.quotation ? formatINR(sr.quotation.offered_amount) : 'Reviewing...'}
                        </span>
                        {sr.quotation && (
                          <span className="text-[10px] text-emerald-600 font-semibold">
                            Quote Ready to Accept
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. PAYOUT RECORDS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              {payments.length === 0 ? (
                <div className="text-center py-12 text-content-muted text-xs">
                  No payment records found in database for this account.
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl border border-border-line bg-surface-card flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
                          ₹
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-content-ink">
                              #{p.payment_number}
                            </span>
                            <Badge variant="success" className="text-[10px] uppercase font-bold">
                              {p.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-content-muted mt-0.5">
                            Method: <span className="font-bold uppercase text-content-ink">{p.method}</span> • {p.provider_name || 'Direct Transfer'}
                          </p>
                          <span className="text-[10px] text-content-muted">
                            Ref: {p.provider_payment_id || 'Cash on Doorstep Pickup'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-display font-black text-lg text-emerald-600 block">
                          +{formatINR(p.amount)}
                        </span>
                        <span className="text-[10px] text-content-muted">
                          {p.paid_at ? new Date(p.paid_at).toLocaleString() : 'Processing'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. LIVE SCRAP RATES */}
          {activeTab === 'rates' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {scrapItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-border-line bg-surface-card flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-display font-bold text-sm text-content-ink">
                      {item.name}
                    </h5>
                    <p className="text-xs text-content-muted">
                      Pricing unit: per {item.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-display font-black text-base text-primary-green block">
                      {item.current_rate ? `₹${item.current_rate.rate_per_unit}/${item.unit}` : 'Inspection'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      Live Mandi Rate
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
