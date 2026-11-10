import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Minus, ChevronDown, ChevronUp, MapPin, Calendar, Clock, AlertCircle, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatINR } from '@/lib/utils'
import { useScrapRates } from '@/hooks/useScrapRates'
import { useAuth } from '@/app/auth-context'
import { supabase } from '@/lib/supabaseClient'
import type { Address } from '@/types'

interface ScrapRow {
  id: string
  name: string
  icon: string
  rate: number
  unit: string
  qty: number
}

interface VehicleRow {
  id: string
  name: string
  icon: string
  qty: number
}

export const BookScrapPage: React.FC = () => {
  const navigate = useNavigate()
  const { profile, refreshProfile } = useAuth()
  const { rates: liveRates } = useScrapRates()
  const [step, setStep] = useState<'items' | 'slot'>('items')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [scrapItems, setScrapItems] = useState<ScrapRow[]>([
    { id: '44444444-4444-4444-4444-444444444401', name: 'Newspaper', icon: '📰', rate: 14, unit: 'kg', qty: 0 },
    { id: '44444444-4444-4444-4444-444444444402', name: 'Cardboard Boxes', icon: '📦', rate: 12, unit: 'kg', qty: 0 },
    { id: '44444444-4444-4444-4444-444444444403', name: 'Plastic Bottles (PET)', icon: '🧴', rate: 10, unit: 'kg', qty: 0 },
    { id: '44444444-4444-4444-4444-444444444404', name: 'Heavy Iron Scrap', icon: '🔩', rate: 28, unit: 'kg', qty: 0 },
    { id: '44444444-4444-4444-4444-444444444405', name: 'Copper Wires', icon: '🔌', rate: 520, unit: 'kg', qty: 0 },
    { id: '44444444-4444-4444-4444-444444444406', name: 'Old Refrigerator', icon: '❄️', rate: 800, unit: 'piece', qty: 0 },
  ])

  // Sync live rates from pricing desk
  useEffect(() => {
    if (liveRates && liveRates.length > 0) {
      setScrapItems((prev) =>
        liveRates.map((lr) => {
          const existing = prev.find(
            (p) => p.name.toLowerCase() === lr.name.toLowerCase() || p.id === lr.id
          )
          return {
            id: lr.id,
            name: lr.name,
            icon: lr.icon,
            rate: lr.rate,
            unit: lr.unit,
            qty: existing ? existing.qty : 0,
          }
        })
      )
    }
  }, [liveRates])

  const [vehicles, setVehicles] = useState<VehicleRow[]>([
    { id: 'v1', name: 'Bicycle', icon: '🚲', qty: 0 },
    { id: 'v2', name: 'Two-wheeler', icon: '🛵', qty: 0 },
    { id: 'v3', name: 'Auto-rickshaw', icon: '🛺', qty: 0 },
    { id: 'v4', name: 'Car', icon: '🚗', qty: 0 },
  ])

  const [isVehiclesOpen, setIsVehiclesOpen] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressMode, setAddressMode] = useState<'saved' | 'custom'>('custom')
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [customAddressLine1, setCustomAddressLine1] = useState('')
  const [customLocality, setCustomLocality] = useState('')
  const [customCity, setCustomCity] = useState('Vijayawada')
  const [customPostalCode, setCustomPostalCode] = useState('520010')

  const [contactName, setContactName] = useState(profile?.display_name || '')
  const [contactNumber, setContactNumber] = useState(
    profile?.phone_e164 ? profile.phone_e164.replace('+91', '') : ''
  )
  const [selectedSlot, setSelectedSlot] = useState('slot-1')
  const [customerNote, setCustomerNote] = useState('')

  useEffect(() => {
    if (profile) {
      if (profile.display_name && !contactName) setContactName(profile.display_name)
      if (profile.phone_e164 && !contactNumber) setContactNumber(profile.phone_e164.replace('+91', ''))
    }
  }, [profile])

  // Load user's saved addresses from Supabase
  useEffect(() => {
    if (profile?.id) {
      const fetchAddresses = async () => {
        const { data } = await supabase
          .from('addresses')
          .select('*')
          .eq('profile_id', profile.id)
        if (data && data.length > 0) {
          setAddresses(data as Address[])
          setSelectedAddressId(data[0].id)
          setAddressMode('saved')
        } else {
          setAddressMode('custom')
        }
      }
      fetchAddresses()
    } else {
      setAddressMode('custom')
    }
  }, [profile?.id])

  const updateScrapQty = (id: string, delta: number) => {
    setScrapItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
      )
    )
  }

  const setScrapDirectQty = (id: string, val: string) => {
    const num = parseFloat(val) || 0
    setScrapItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(0, Math.min(5000, num)) } : item
      )
    )
  }

  const updateVehQty = (id: string, delta: number) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, qty: Math.max(0, v.qty + delta) } : v
      )
    )
  }

  const totalScrapAmount = scrapItems.reduce(
    (sum, item) => sum + item.qty * item.rate,
    0
  )
  const totalVehiclesCount = vehicles.reduce((sum, v) => sum + v.qty, 0)
  const selectedScrapItems = scrapItems.filter((i) => i.qty > 0)
  const totalSelectedItems = selectedScrapItems.length + (totalVehiclesCount > 0 ? 1 : 0)

  // =========================================================================
  // CONFIRM BOOKING & WRITE TO SUPABASE DATABASE
  // =========================================================================
  const handleConfirmBooking = async () => {
    if (totalSelectedItems === 0) {
      setErrorMessage('Please select at least one material or vehicle quantity.')
      setStep('items')
      return
    }

    const cleanPhone = contactNumber.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number for doorstep coordination.')
      return
    }

    if (addressMode === 'custom' && !customAddressLine1.trim()) {
      setErrorMessage('Please enter your pickup address (House/Flat No. & Street).')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const bookingNumber = `SM-2026-${Math.floor(100000 + Math.random() * 900000)}`
      const bookingId = crypto.randomUUID()
      let userProfileId = profile?.id
      const formattedPhone = `+91${cleanPhone.slice(-10)}`
      const resolvedName = contactName.trim() || profile?.display_name || 'Customer'

      // If user is not logged in, check if a profile already exists for this phone number
      if (!userProfileId) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id, display_name')
          .eq('phone_e164', formattedPhone)
          .maybeSingle()

        if (existingUser) {
          userProfileId = existingUser.id
        } else {
          const newUserId = crypto.randomUUID()
          const { data: createdUser, error: pErr } = await supabase
            .from('profiles')
            .insert({
              id: newUserId,
              display_name: resolvedName,
              phone_e164: formattedPhone,
              is_active: true,
              role: 'customer',
            })
            .select('id')
            .single()

          if (!pErr && createdUser) {
            userProfileId = createdUser.id
          } else {
            userProfileId = '11111111-1111-1111-1111-111111111101'
          }
        }

        // Auto-persist active session so they can immediately see their booking on /dashboard
        if (userProfileId) {
          localStorage.setItem('scrap_mitra_active_profile_id', userProfileId)
          await refreshProfile()
        }
      }

      // Address resolution
      const chosenAddr = addressMode === 'saved' ? addresses.find((a) => a.id === selectedAddressId) : null
      const addressLine1 = chosenAddr ? chosenAddr.address_line1 : (customAddressLine1.trim() || 'Flat 402, Sri Krishna Heights')
      const locality = chosenAddr ? chosenAddr.locality : (customLocality.trim() || 'Patamata')
      const city = chosenAddr ? chosenAddr.city : (customCity.trim() || 'Vijayawada')
      const postalCode = chosenAddr ? chosenAddr.postal_code : (customPostalCode.trim() || '520010')

      // Save custom address to public.addresses if user has profile
      let savedAddressId = chosenAddr?.id || null
      if (!chosenAddr && userProfileId && customAddressLine1.trim()) {
        try {
          const newAddressId = crypto.randomUUID()
          const { data: addrInserted } = await supabase
            .from('addresses')
            .insert({
              id: newAddressId,
              profile_id: userProfileId,
              address_type: 'home',
              label: 'Home',
              address_line1: addressLine1,
              locality: locality,
              city: city,
              district: 'Krishna',
              state: 'Andhra Pradesh',
              postal_code: postalCode,
              country_code: 'IN',
              is_default: addresses.length === 0,
            })
            .select('id')
            .single()

          if (addrInserted) {
            savedAddressId = addrInserted.id
          }
        } catch (e) {
          console.warn('Address saving skipped:', e)
        }
      }

      // 1. Insert into public.bookings
      const { error: bErr } = await supabase.from('bookings').insert({
        id: bookingId,
        booking_number: bookingNumber,
        profile_id: userProfileId,
        address_id: savedAddressId,
        status: 'pending_confirmation',
        payment_status: 'pending',
        pickup_contact_name: resolvedName,
        pickup_contact_phone_e164: formattedPhone,
        pickup_address_line1: addressLine1,
        pickup_locality: locality,
        pickup_city: city,
        pickup_district: 'Krishna',
        pickup_state: 'Andhra Pradesh',
        pickup_postal_code: postalCode,
        pickup_country_code: 'IN',
        estimated_subtotal: totalScrapAmount,
        currency: 'INR',
        scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        customer_note: customerNote || null,
      })

      if (bErr) throw bErr

      // 2. Insert line items into public.booking_items with exact snapshot rates
      const lineItems = selectedScrapItems.map((item) => ({
        id: crypto.randomUUID(),
        booking_id: bookingId,
        scrap_item_id: item.id.length === 36 ? item.id : null,
        item_name_snapshot: item.name,
        unit_snapshot: item.unit || 'kg',
        rate_per_unit_snapshot: item.rate,
        estimated_quantity: item.qty,
        estimated_amount: item.qty * item.rate,
      }))

      if (lineItems.length > 0) {
        const { error: itemErr } = await supabase.from('booking_items').insert(lineItems)
        if (itemErr) console.error('Error inserting booking items:', itemErr)
      }

      // 3. Insert history record
      await supabase.from('booking_status_history').insert({
        id: crypto.randomUUID(),
        booking_id: bookingId,
        to_status: 'pending_confirmation',
        changed_by_profile_id: userProfileId,
        changed_by_role: 'customer',
        customer_visible_note: 'Doorstep pickup booking submitted by customer',
      })

      // 4. Insert customer notification
      await supabase.from('notifications').insert({
        id: crypto.randomUUID(),
        profile_id: userProfileId,
        notification_type: 'booking_created',
        title: 'Pickup Booking Placed! 🚚',
        body: `Your doorstep pickup #${bookingNumber} is confirmed. Estimated payout: ${formatINR(totalScrapAmount)}.`,
        related_booking_id: bookingId,
        is_read: false,
      })

      // Navigate to the live booking details page
      navigate(`/bookings/${bookingNumber}`)
    } catch (err: any) {
      console.error('Failed to create booking:', err)
      setErrorMessage(err.message || 'Failed to place booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant={step === 'items' ? 'default' : 'outline'}>
            Step 1: Select Items
          </Badge>
          <span className="text-content-muted">•</span>
          <Badge variant={step === 'slot' ? 'default' : 'outline'}>
            Step 2: Pickup Slot
          </Badge>
        </div>
        <h1 className="font-display font-bold text-2xl text-content-ink">
          {step === 'items' ? 'Select Scrap Materials' : 'Confirm Pickup Details'}
        </h1>
        <p className="text-xs sm:text-sm text-content-muted">
          {step === 'items'
            ? 'Enter approximate weights. Final weight is confirmed at pickup via digital scale.'
            : 'Select your preferred collection address and certified doorstep slot.'}
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {step === 'items' ? (
        <div className="space-y-3">
          {/* Scrap Item Rows */}
          {scrapItems.map((item) => (
            <Card
              key={item.id}
              className="p-3.5 flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl flex-none">{item.icon}</span>
                <div className="min-w-0">
                  <h4 className="font-display font-bold text-sm text-content-ink truncate">
                    {item.name}
                  </h4>
                  <span className="text-xs font-semibold text-primary-green">
                    ₹{item.rate} / {item.unit}
                  </span>
                </div>
              </div>

              {/* Stepper & input */}
              <div className="flex items-center gap-1.5 bg-surface-bg p-1 rounded-full border border-border-line flex-none">
                <button
                  type="button"
                  onClick={() => updateScrapQty(item.id, -1)}
                  disabled={item.qty === 0}
                  className="w-7 h-7 rounded-full bg-surface-card shadow-xs flex items-center justify-center text-content-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary-green-soft cursor-pointer transition-colors"
                  aria-label={`Decrease ${item.name}`}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    max="5000"
                    step="0.5"
                    value={item.qty || ''}
                    placeholder="0"
                    onChange={(e) => setScrapDirectQty(item.id, e.target.value)}
                    className="w-12 text-center text-sm font-bold bg-transparent text-content-ink focus:outline-none"
                    aria-label={`${item.name} weight in kg`}
                  />
                  <span className="text-[11px] font-semibold text-content-muted mr-1.5">
                    {item.unit}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => updateScrapQty(item.id, 1)}
                  className="w-7 h-7 rounded-full bg-primary-green text-white shadow-xs flex items-center justify-center hover:bg-primary-green-deep cursor-pointer transition-colors"
                  aria-label={`Increase ${item.name}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}

          {/* Vehicles Expandable Section */}
          <Card className="border border-border-line overflow-hidden p-0 shadow-xs">
            <button
              type="button"
              onClick={() => setIsVehiclesOpen(!isVehiclesOpen)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-surface-bg transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚘</span>
                <div>
                  <h4 className="font-display font-bold text-sm text-content-ink">
                    Vehicles & Machinery
                  </h4>
                  <p className="text-xs text-content-muted">
                    {totalVehiclesCount > 0
                      ? `${totalVehiclesCount} vehicle(s) selected`
                      : 'Bike, car, auto, tractor (Price after inspection)'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-content-muted">
                {isVehiclesOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </button>

            {isVehiclesOpen && (
              <div className="p-3.5 pt-0 border-t border-border-line space-y-2 bg-secondary-green-soft/30">
                <p className="text-xs text-content-muted pt-2 pb-1">
                  Vehicles are valued after document and physical inspection by our partner.
                </p>
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-2.5 bg-surface-card rounded-xl border border-border-line"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{v.icon}</span>
                      <span className="text-xs font-semibold text-content-ink">{v.name}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-surface-bg p-1 rounded-full border border-border-line">
                      <button
                        type="button"
                        onClick={() => updateVehQty(v.id, -1)}
                        disabled={v.qty === 0}
                        className="w-6 h-6 rounded-full bg-surface-card flex items-center justify-center text-content-ink disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{v.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateVehQty(v.id, 1)}
                        className="w-6 h-6 rounded-full bg-primary-green text-white flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Sticky Bottom Summary Bar */}
          <div className="fixed bottom-0 inset-x-0 bg-surface-card/95 backdrop-blur-md border-t border-border-line p-4 shadow-lg z-30">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-content-muted block">
                  {totalSelectedItems} item(s) selected
                </span>
                <span className="font-display font-bold text-lg text-primary-green">
                  {totalScrapAmount > 0 ? formatINR(totalScrapAmount) : 'Select weight'}
                </span>
              </div>

              <Button
                disabled={totalSelectedItems === 0}
                onClick={() => setStep('slot')}
                className="font-bold flex items-center gap-1.5"
              >
                <span>Select Pickup Slot</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 2: ADDRESS & SLOT CONFIRMATION */
        <div className="space-y-4 pb-12">
          {/* Selected Items Review */}
          <Card className="p-4 bg-surface-card space-y-2 border-border-line">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-content-muted uppercase">
                Selected Scrap Items
              </span>
              <button
                onClick={() => setStep('items')}
                className="text-xs font-semibold text-primary-green hover:underline cursor-pointer"
              >
                Edit Items
              </button>
            </div>
            <div className="space-y-1">
              {selectedScrapItems.map((i) => (
                <div key={i.id} className="flex items-center justify-between text-xs text-content-ink font-medium">
                  <span>{i.name} ({i.qty} {i.unit})</span>
                  <span className="font-bold text-primary-green">₹{i.qty * i.rate}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border-line">
              <span className="text-xs font-bold text-content-ink">Estimated Doorstep Total:</span>
              <span className="font-display font-black text-lg text-primary-green">
                {totalScrapAmount > 0 ? formatINR(totalScrapAmount) : 'Pending Inspection'}
              </span>
            </div>
          </Card>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-none" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Contact Details */}
          <Card className="p-4 bg-surface-card space-y-3 border-border-line">
            <h3 className="font-display font-bold text-sm text-content-ink">
              Contact & Pickup Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-content-ink mb-1">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border-line bg-surface-bg text-content-ink focus:outline-none focus:ring-1 focus:ring-primary-green"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-ink mb-1">
                  Mobile Number *
                </label>
                <div className="flex items-center rounded-xl border border-border-line overflow-hidden bg-surface-bg">
                  <span className="px-2.5 py-2 text-xs font-semibold text-content-muted border-r border-border-line">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                    className="px-2.5 py-2 text-xs bg-transparent flex-1 focus:outline-none text-content-ink"
                    required
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Address Section */}
          <Card className="p-4 bg-surface-card space-y-3 border-border-line">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-content-ink">
                Pickup Address *
              </h3>
              {addresses.length > 0 && (
                <div className="flex gap-1.5 bg-surface-bg p-1 rounded-lg border border-border-line text-[11px]">
                  <button
                    type="button"
                    onClick={() => setAddressMode('saved')}
                    className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                      addressMode === 'saved'
                        ? 'bg-primary-green text-white'
                        : 'text-content-muted hover:text-content-ink'
                    }`}
                  >
                    Saved ({addresses.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressMode('custom')}
                    className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                      addressMode === 'custom'
                        ? 'bg-primary-green text-white'
                        : 'text-content-muted hover:text-content-ink'
                    }`}
                  >
                    + New Address
                  </button>
                </div>
              )}
            </div>

            {addressMode === 'saved' && addresses.length > 0 ? (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-primary-green ring-1 ring-primary-green bg-secondary-green-soft/20'
                        : 'border-border-line bg-surface-bg hover:border-primary-green'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-primary-green flex-none mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-content-ink block capitalize">{addr.label || addr.address_type}</span>
                      <span className="text-content-muted">
                        {addr.address_line1}, {addr.locality}, {addr.city} - {addr.postal_code}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-content-muted mb-1">
                    House / Flat No., Apartment / Building & Street *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 402, Sri Krishna Heights, Bandar Road"
                    value={customAddressLine1}
                    onChange={(e) => setCustomAddressLine1(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border-line bg-surface-bg text-content-ink focus:outline-none focus:ring-1 focus:ring-primary-green"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-content-muted mb-1">
                      Area / Locality
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Patamata"
                      value={customLocality}
                      onChange={(e) => setCustomLocality(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border-line bg-surface-bg text-content-ink focus:outline-none focus:ring-1 focus:ring-primary-green"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-content-muted mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="Vijayawada"
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border-line bg-surface-bg text-content-ink focus:outline-none focus:ring-1 focus:ring-primary-green"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-content-muted mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      placeholder="520010"
                      maxLength={6}
                      value={customPostalCode}
                      onChange={(e) => setCustomPostalCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border-line bg-surface-bg text-content-ink focus:outline-none focus:ring-1 focus:ring-primary-green"
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Pickup Slot Selection */}
          <div>
            <label className="block text-xs font-semibold text-content-ink mb-1.5">
              Available Pickup Slots *
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'slot-1', date: 'Today, 10 Nov', time: '10:00 AM - 01:00 PM', seats: '3 slots left' },
                { id: 'slot-2', date: 'Today, 10 Nov', time: '02:00 PM - 05:00 PM', seats: '4 slots left' },
                { id: 'slot-3', date: 'Tomorrow, 11 Nov', time: '10:00 AM - 01:00 PM', seats: '6 slots left' },
                { id: 'slot-4', date: 'Tomorrow, 11 Nov', time: '02:00 PM - 05:00 PM', seats: '5 slots left' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSlot(s.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedSlot === s.id
                      ? 'border-primary-green bg-secondary-green-soft text-primary-green ring-1 ring-primary-green'
                      : 'border-border-line bg-surface-card hover:border-primary-green'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-content-ink mb-0.5">
                    <Calendar className="w-3.5 h-3.5 text-primary-green" />
                    <span>{s.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-content-muted">
                    <Clock className="w-3 h-3" />
                    <span>{s.time}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Customer Note */}
          <div>
            <label className="block text-xs font-semibold text-content-ink mb-1.5">
              Instructions for Collector (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Please call before arriving, building has lift."
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-line text-xs bg-surface-card text-content-ink focus:outline-none focus:ring-2 focus:ring-primary-green"
            />
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-bg border border-border-line text-xs text-content-muted">
            <AlertCircle className="w-4 h-4 text-primary-green flex-none mt-0.5" />
            <p>
              Your pickup will be saved in our live database. Verified partner arrives with certified digital scale.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('items')}
              className="w-1/3"
            >
              Back
            </Button>
            <Button
              type="button"
              variant="primary"
              isLoading={isSubmitting}
              onClick={handleConfirmBooking}
              className="w-2/3 font-bold"
            >
              Confirm Doorstep Pickup
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
