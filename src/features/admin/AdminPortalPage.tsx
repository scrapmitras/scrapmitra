import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ShieldCheck,
  RefreshCw,
  LogOut,
  MapPin,
  Clock,
  CheckCircle2,
  Edit,
  Tag,
  Package,
  Headphones,
  Check,
  X,
  Phone,
  ArrowRight,
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/app/auth-context'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatINR } from '@/lib/utils'
import type { Booking, ScrapItem } from '@/types'

export const AdminPortalPage: React.FC = () => {
  const { profile, isLoggedIn, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get('tab') as 'rates' | 'orders' | 'support' | null
  const [activeTab, setActiveTab] = useState<'rates' | 'orders' | 'support'>(
    tabParam || 'rates'
  )

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleTabChange = (newTab: 'rates' | 'orders' | 'support') => {
    setActiveTab(newTab)
    setSearchParams({ tab: newTab })
  }

  // Database Data States
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [allScrapItems, setAllScrapItems] = useState<ScrapItem[]>([])
  const [allSupportTickets, setAllSupportTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Scrap Rate Editor States
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [newRateValue, setNewRateValue] = useState<string>('')
  const [isSavingRate, setIsSavingRate] = useState(false)
  const [rateUpdateMsg, setRateUpdateMsg] = useState<string>('')

  // Order Pricing Adjuster States (Final Weighing on Order)
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [adjustedSubtotal, setAdjustedSubtotal] = useState<string>('')
  const [isSavingOrderPrice, setIsSavingOrderPrice] = useState(false)
  const [orderPricingMsg, setOrderPricingMsg] = useState<string>('')

  // Protect Admin Route
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/admin/login')
      return
    }
    if (!isAdmin) {
      navigate('/dashboard')
    }
  }, [isLoggedIn, isAdmin, navigate])

  const fetchPlatformData = async () => {
    setIsLoading(true)
    try {
      // 1. Fetch Orders (Bookings with line items)
      const { data: bData } = await supabase
        .from('bookings')
        .select('*, items:booking_items(*)')
        .order('created_at', { ascending: false })
      if (bData) setAllBookings(bData as Booking[])

      // 2. Fetch Scrap Items with Live Benchmark Rates
      const { data: itemsData } = await supabase
        .from('scrap_items')
        .select('*, current_rate:scrap_rates(*)')
        .order('display_order', { ascending: true })
      if (itemsData) {
        const formatted = itemsData.map((item: any) => ({
          ...item,
          current_rate: Array.isArray(item.current_rate) ? item.current_rate[0] : item.current_rate,
        }))
        setAllScrapItems(formatted as ScrapItem[])
      }

      // 3. Fetch Support Queries
      const { data: supData } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false })
      if (supData) setAllSupportTickets(supData)
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchPlatformData()
    }
  }, [isAdmin])

  // =========================================================================
  // 1. UPDATE SCRAP COMMODITY RATE
  // Saves to public.scrap_rates & logs to public.rate_history.
  // Immediately propagates live across /rates, homepage, and booking flows.
  // Already booked orders remain locked with their historical snapshot rate.
  // =========================================================================
  const handleSaveRate = async (itemId: string, currentRateId?: string) => {
    const rateNum = parseFloat(newRateValue)
    if (isNaN(rateNum) || rateNum <= 0) return

    setIsSavingRate(true)
    setRateUpdateMsg('Updating live rate in database...')
    try {
      if (currentRateId) {
        const { error: updateErr } = await supabase
          .from('scrap_rates')
          .update({
            rate_per_unit: rateNum,
            effective_from: new Date().toISOString(),
          })
          .eq('id', currentRateId)

        if (updateErr) throw updateErr

        await supabase.from('rate_history').insert({
          scrap_rate_id: currentRateId,
          scrap_item_id: itemId,
          new_rate: rateNum,
          changed_by: profile?.id,
          change_reason: 'Admin price index update',
        })
      } else {
        const { data: newRate, error: insertErr } = await supabase
          .from('scrap_rates')
          .insert({
            scrap_item_id: itemId,
            rate_per_unit: rateNum,
            currency: 'INR',
            is_indicative: true,
            is_published: true,
            effective_from: new Date().toISOString(),
            created_by: profile?.id,
          })
          .select()
          .single()

        if (insertErr) throw insertErr

        if (newRate) {
          await supabase.from('rate_history').insert({
            scrap_rate_id: newRate.id,
            scrap_item_id: itemId,
            new_rate: rateNum,
            changed_by: profile?.id,
            change_reason: 'Initial benchmark price set by admin',
          })
        }
      }

      setRateUpdateMsg('Rate successfully saved! Live on /rates, homepage and booking flow.')
      setEditingItemId(null)
      setNewRateValue('')
      await fetchPlatformData()
    } catch (err: any) {
      setRateUpdateMsg(`Failed: ${err.message}`)
    } finally {
      setIsSavingRate(false)
    }
  }

  // =========================================================================
  // 2. ORDER PRICING & FINAL WEIGHING ADJUSTMENT
  // =========================================================================
  const handleSaveOrderPrice = async (bookingId: string) => {
    const finalAmount = parseFloat(adjustedSubtotal)
    if (isNaN(finalAmount) || finalAmount < 0) return

    setIsSavingOrderPrice(true)
    setOrderPricingMsg('Saving final weighed amount...')
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          final_subtotal: finalAmount,
          status: 'completed',
          payment_status: 'paid',
          completed_at: new Date().toISOString(),
        })
        .eq('id', bookingId)

      if (!error) {
        await supabase.from('booking_status_history').insert({
          booking_id: bookingId,
          to_status: 'completed',
          changed_by_profile_id: profile?.id,
          changed_by_role: 'admin',
          customer_visible_note: `Order weighed and completed. Final payout: ₹${finalAmount}`,
        })

        setEditingOrderId(null)
        setAdjustedSubtotal('')
        setOrderPricingMsg('Order price updated and completed!')
        await fetchPlatformData()
      }
    } catch (err) {
      console.error('Error saving order price:', err)
      setOrderPricingMsg('Error updating order price')
    } finally {
      setIsSavingOrderPrice(false)
    }
  }

  // Update Order Status (Confirm, Assign, Mark Completed & Paid, Cancel)
  const handleUpdateOrderStatus = async (bookingId: string, nextStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: nextStatus })
        .eq('id', bookingId)

      if (!error) {
        await supabase.from('booking_status_history').insert({
          booking_id: bookingId,
          to_status: nextStatus,
          changed_by_profile_id: profile?.id,
          changed_by_role: 'admin',
          customer_visible_note: `Order marked as ${nextStatus.replace('_', ' ')} by operations desk`,
        })

        await fetchPlatformData()
      }
    } catch (err) {
      console.error('Error updating order status:', err)
    }
  }

  // =========================================================================
  // 3. CUSTOMER QUERY STATUS UPDATER
  // =========================================================================
  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      await supabase
        .from('support_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', ticketId)
      await fetchPlatformData()
    } catch (err) {
      console.error('Error updating query status:', err)
    }
  }

  const totalOrdersAmount = allBookings.reduce(
    (acc, b) => acc + Number(b.final_subtotal || b.estimated_subtotal || 0),
    0
  )

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Clean, Non-Clumsy Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-emerald-500/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Scrap Mitra Admin Console • Vijayawada HQ</span>
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Pricing, Orders & Queries Desk
          </h1>
          <p className="text-xs text-slate-400">
            Logged in as: <strong className="text-white">{profile?.display_name || 'Admin'}</strong> ({profile?.email})
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/">
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs">
              Customer Store ↗
            </Button>
          </Link>

          <button
            onClick={fetchPlatformData}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync DB</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout()
              navigate('/admin/login')
            }}
            className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* 3 Clear, Direct Metric Cards (No Clutter) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Metric 1: Live Scrap Rates */}
        <Card
          onClick={() => handleTabChange('rates')}
          className={`p-4 border transition-all cursor-pointer active:scale-[0.98] ${
            activeTab === 'rates'
              ? 'border-emerald-500 bg-secondary-green-soft/20 ring-1 ring-emerald-500'
              : 'border-border-line bg-surface-card hover:border-emerald-500/60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase text-content-muted">Live Commodity Rates</span>
            <Tag className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-display font-black text-content-ink">
            {allScrapItems.length} Commodities
          </div>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <span>Change live rates</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </Card>

        {/* Metric 2: Customer Orders */}
        <Card
          onClick={() => handleTabChange('orders')}
          className={`p-4 border transition-all cursor-pointer active:scale-[0.98] ${
            activeTab === 'orders'
              ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
              : 'border-border-line bg-surface-card hover:border-blue-500/60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase text-content-muted">Customer Orders</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-display font-black text-content-ink">
            {allBookings.length} Orders
          </div>
          <span className="text-xs text-blue-600 font-semibold flex items-center justify-between mt-1">
            <span>Volume: {formatINR(totalOrdersAmount)}</span>
            <span className="flex items-center gap-0.5">Manage pricing →</span>
          </span>
        </Card>

        {/* Metric 3: Customer Queries */}
        <Card
          onClick={() => handleTabChange('support')}
          className={`p-4 border transition-all cursor-pointer active:scale-[0.98] ${
            activeTab === 'support'
              ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500'
              : 'border-border-line bg-surface-card hover:border-purple-500/60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase text-content-muted">Customer Queries</span>
            <Headphones className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-display font-black text-content-ink">
            {allSupportTickets.length} Support Tickets
          </div>
          <span className="text-xs text-purple-600 font-semibold flex items-center gap-1 mt-1">
            <span>Open query inbox</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </Card>
      </div>

      {/* Main Operations Container */}
      <Card className="border-border-line shadow-sm overflow-hidden">
        {/* Simple 3-Tab Selector */}
        <div className="flex items-center border-b border-border-line bg-surface-card px-4 pt-2.5 gap-2 overflow-x-auto">
          <button
            onClick={() => handleTabChange('rates')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'rates'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-content-muted hover:text-content-ink'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>1. Scrap Rates & Pricing Controller</span>
            <Badge variant="success" className="text-[9px]">Live Control</Badge>
          </button>

          <button
            onClick={() => handleTabChange('orders')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-content-muted hover:text-content-ink'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>2. Customer Orders & Pricing ({allBookings.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('support')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'support'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-content-muted hover:text-content-ink'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>3. Customer Queries ({allSupportTickets.length})</span>
          </button>
        </div>

        {/* View Content */}
        <div className="p-4 sm:p-6">
          {/* ================================================================= */}
          {/* 1. SCRAP RATES & PRICING CONTROLLER                               */}
          {/* ================================================================= */}
          {activeTab === 'rates' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-line pb-3">
                <div>
                  <h3 className="font-display font-bold text-base text-content-ink flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>Live Commodity Scrap Pricing Controller</span>
                  </h3>
                  <p className="text-xs text-content-muted">
                    When you update a rate here, it writes to `scrap_rates` and reflects on <strong>/rates</strong>, <strong>homepage ticker</strong>, and <strong>booking calculator</strong>. Already placed orders remain locked with their historical booked rate.
                  </p>
                </div>
                {rateUpdateMsg && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                    {rateUpdateMsg}
                  </span>
                )}
              </div>

              {/* Rates Table */}
              <div className="border border-border-line rounded-2xl overflow-hidden divide-y divide-border-line bg-surface-card">
                <div className="grid grid-cols-12 bg-surface-bg p-3 text-[11px] font-bold text-content-muted uppercase">
                  <div className="col-span-5">Material / Commodity</div>
                  <div className="col-span-2 text-center">Unit</div>
                  <div className="col-span-2 text-center">Live Rate</div>
                  <div className="col-span-3 text-right">Change Price</div>
                </div>

                {allScrapItems.map((item) => {
                  const isEditing = editingItemId === item.id
                  const currentRate = item.current_rate?.rate_per_unit ?? 0

                  return (
                    <div key={item.id} className="grid grid-cols-12 p-3.5 items-center hover:bg-surface-bg/50 transition-colors">
                      <div className="col-span-5">
                        <span className="font-display font-bold text-sm text-content-ink block">
                          {item.name}
                        </span>
                        <span className="text-xs text-content-muted">
                          {item.description || 'Verified scrap material'}
                        </span>
                      </div>

                      <div className="col-span-2 text-center">
                        <span className="text-xs font-mono font-bold text-content-muted uppercase px-2 py-0.5 rounded bg-surface-bg border border-border-line">
                          {item.unit}
                        </span>
                      </div>

                      <div className="col-span-2 text-center">
                        <span className="font-display font-black text-lg text-emerald-600">
                          ₹{currentRate}
                        </span>
                        <span className="text-xs text-content-muted font-medium">/{item.unit}</span>
                      </div>

                      <div className="col-span-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-xs font-bold text-content-ink">₹</span>
                            <input
                              type="number"
                              value={newRateValue}
                              onChange={(e) => setNewRateValue(e.target.value)}
                              placeholder={String(currentRate)}
                              className="w-20 px-2 py-1 text-sm font-bold border border-border-line rounded-lg bg-surface-bg text-content-ink focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              isLoading={isSavingRate}
                              onClick={() => handleSaveRate(item.id, item.current_rate?.id)}
                              className="text-xs font-bold px-2.5 py-1"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Save
                            </Button>
                            <button
                              onClick={() => setEditingItemId(null)}
                              className="p-1 text-content-muted hover:text-content-ink cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingItemId(item.id)
                              setNewRateValue(String(currentRate))
                            }}
                            className="text-xs font-semibold"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            Update Rate
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 2. CUSTOMER ORDERS & PRICING DESK                                 */}
          {/* ================================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-line pb-3">
                <div>
                  <h3 className="font-display font-bold text-base text-content-ink flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>Customer Orders & Order Pricing Desk</span>
                  </h3>
                  <p className="text-xs text-content-muted">
                    Manage pickup workflow and adjust final digital weighing prices. Booked material snapshots preserve historical rates.
                  </p>
                </div>
                {orderPricingMsg && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    {orderPricingMsg}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {allBookings.map((b) => {
                  const isEditingPrice = editingOrderId === b.id

                  return (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl border border-border-line bg-surface-card space-y-3 hover:border-blue-500/50 transition-all"
                    >
                      {/* Top Bar of Order */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-line/60 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-content-ink">
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
                          <span className="text-xs text-content-muted">
                            • {new Date(b.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-content-ink flex items-center gap-1.5">
                          <span>Customer:</span>
                          <span className="text-primary-green">{b.pickup_contact_name}</span>
                          <a
                            href={`tel:${b.pickup_contact_phone_e164}`}
                            className="text-content-muted hover:text-content-ink flex items-center gap-0.5 ml-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{b.pickup_contact_phone_e164}</span>
                          </a>
                        </div>
                      </div>

                      {/* Pickup Address & Schedule */}
                      <div className="text-xs text-content-muted flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-primary-green flex-none" />
                          {b.pickup_address_line1}, {b.pickup_locality}, {b.pickup_city} - {b.pickup_postal_code}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-content-muted flex-none" />
                          {b.scheduled_for ? new Date(b.scheduled_for).toLocaleString() : 'Scheduled Slot'}
                        </span>
                      </div>

                      {/* Booked Items (With Locked Historical Rates Snapshot) */}
                      <div className="bg-surface-bg p-3 rounded-xl border border-border-line text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-content-muted uppercase">
                          <span>Booked Material Snapshot (Locked At Booking Time)</span>
                          <span>Booking Subtotal</span>
                        </div>
                        {b.items && b.items.length > 0 ? (
                          <div className="space-y-1">
                            {b.items.map((i: any) => (
                              <div key={i.id} className="flex items-center justify-between text-content-ink font-medium">
                                <span>
                                  <strong>{i.item_name_snapshot}</strong>: {i.estimated_quantity} {i.unit_snapshot} @ locked rate ₹{i.rate_per_unit_snapshot}/{i.unit_snapshot}
                                </span>
                                <span className="font-mono font-bold text-primary-green">
                                  {formatINR(i.estimated_amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-content-muted italic">
                            Doorstep estimate: {formatINR(b.estimated_subtotal)}
                          </div>
                        )}
                      </div>

                      {/* Pricing & Weighing Adjustment + Status Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        {/* Order Pricing / Weighed Subtotal Input */}
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="text-[10px] font-bold text-content-muted uppercase block">
                              Order Pricing Payout
                            </span>
                            <span className="font-display font-black text-lg text-emerald-600">
                              {formatINR(b.final_subtotal || b.estimated_subtotal)}
                            </span>
                          </div>

                          {isEditingPrice ? (
                            <div className="flex items-center gap-1.5 bg-surface-bg p-1.5 rounded-xl border border-border-line">
                              <span className="text-xs font-bold">₹</span>
                              <input
                                type="number"
                                value={adjustedSubtotal}
                                onChange={(e) => setAdjustedSubtotal(e.target.value)}
                                placeholder="Weighed ₹"
                                className="w-24 px-2 py-1 text-xs font-bold border border-border-line rounded-lg bg-surface-card text-content-ink focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                isLoading={isSavingOrderPrice}
                                onClick={() => handleSaveOrderPrice(b.id)}
                                className="text-xs font-bold px-2 py-1"
                              >
                                Save Weighed Price
                              </Button>
                              <button
                                onClick={() => setEditingOrderId(null)}
                                className="text-xs text-content-muted hover:text-content-ink p-1 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            b.status !== 'completed' && (
                              <button
                                onClick={() => {
                                  setEditingOrderId(b.id)
                                  setAdjustedSubtotal(String(b.final_subtotal || b.estimated_subtotal))
                                }}
                                className="text-xs text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Adjust Weighed Amount</span>
                              </button>
                            )
                          )}
                        </div>

                        {/* Order Workflow Actions */}
                        <div className="flex items-center gap-2">
                          {b.status === 'pending_confirmation' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(b.id, 'confirmed')}
                              className="font-bold text-xs"
                            >
                              Confirm Order
                            </Button>
                          )}

                          {b.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleUpdateOrderStatus(b.id, 'assigned')}
                              className="font-bold text-xs"
                            >
                              Assign Partner Van
                            </Button>
                          )}

                          {b.status === 'assigned' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateOrderStatus(b.id, 'completed')}
                              className="font-bold text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-500/10"
                            >
                              Mark Completed & Paid
                            </Button>
                          )}

                          {b.status === 'completed' && (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Order Completed</span>
                            </span>
                          )}

                          {b.status !== 'cancelled' && b.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateOrderStatus(b.id, 'cancelled')}
                              className="text-xs text-rose-500 hover:bg-rose-500/10"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 3. CUSTOMER QUERIES & SUPPORT DESK                                */}
          {/* ================================================================= */}
          {activeTab === 'support' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-line pb-3">
                <div>
                  <h3 className="font-display font-bold text-base text-content-ink flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-purple-600" />
                    <span>Customer Queries & Helpdesk</span>
                  </h3>
                  <p className="text-xs text-content-muted">
                    Respond to customer inquiries, pickup timing questions, and support tickets
                  </p>
                </div>
                <span className="text-xs text-content-muted font-semibold">
                  Total Queries: {allSupportTickets.length}
                </span>
              </div>

              <div className="space-y-3">
                {allSupportTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl border border-border-line bg-surface-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-content-ink">
                          #{t.ticket_number}
                        </span>
                        <Badge
                          variant={
                            t.status === 'resolved'
                              ? 'success'
                              : t.status === 'in_progress'
                              ? 'orange'
                              : 'default'
                          }
                          className="text-[10px] uppercase font-bold"
                        >
                          {t.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-content-muted">
                          • {new Date(t.created_at).toLocaleString()}
                        </span>
                      </div>

                      <h4 className="font-display font-bold text-sm text-content-ink">
                        {t.subject}
                      </h4>
                      <p className="text-xs text-content-muted max-w-2xl">
                        "{t.message}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {t.status !== 'resolved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateTicketStatus(t.id, 'resolved')}
                          className="text-xs font-bold text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/10"
                        >
                          Mark Resolved
                        </Button>
                      )}
                      {t.status === 'open' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUpdateTicketStatus(t.id, 'in_progress')}
                          className="text-xs font-bold"
                        >
                          In Progress
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
