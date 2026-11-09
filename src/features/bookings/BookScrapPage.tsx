import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Minus, ChevronDown, ChevronUp, MapPin, Calendar, Clock, AlertCircle, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatINR } from '@/lib/utils'

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
  const [step, setStep] = useState<'items' | 'slot'>('items')

  const [scrapItems, setScrapItems] = useState<ScrapRow[]>([
    { id: '1', name: 'Newspaper', icon: '📰', rate: 14, unit: 'kg', qty: 0 },
    { id: '2', name: 'Cardboard', icon: '📦', rate: 12, unit: 'kg', qty: 0 },
    { id: '3', name: 'Plastic', icon: '🧴', rate: 10, unit: 'kg', qty: 0 },
    { id: '4', name: 'Iron', icon: '🔩', rate: 28, unit: 'kg', qty: 0 },
    { id: '5', name: 'Aluminium', icon: '🥫', rate: 100, unit: 'kg', qty: 0 },
    { id: '6', name: 'Copper', icon: '🔌', rate: 520, unit: 'kg', qty: 0 },
    { id: '7', name: 'E-waste', icon: '💻', rate: 18, unit: 'kg', qty: 0 },
  ])

  const [vehicles, setVehicles] = useState<VehicleRow[]>([
    { id: 'v1', name: 'Bicycle', icon: '🚲', qty: 0 },
    { id: 'v2', name: 'Two-wheeler', icon: '🛵', qty: 0 },
    { id: 'v3', name: 'Auto-rickshaw', icon: '🛺', qty: 0 },
    { id: 'v4', name: 'Car', icon: '🚗', qty: 0 },
    { id: 'v5', name: 'Tractor', icon: '🚜', qty: 0 },
    { id: 'v6', name: 'Truck or bus', icon: '🚚', qty: 0 },
  ])

  const [isVehiclesOpen, setIsVehiclesOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState('addr-1')
  const [selectedSlot, setSelectedSlot] = useState('slot-1')
  const [contactNumber, setContactNumber] = useState('9876543210')
  const [customerNote, setCustomerNote] = useState('')

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
  const totalSelectedItems =
    scrapItems.filter((i) => i.qty > 0).length + (totalVehiclesCount > 0 ? 1 : 0)

  const handleConfirmBooking = () => {
    navigate('/bookings/SM-2026-0001042')
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
                  className="w-7 h-7 rounded-full bg-white shadow-xs flex items-center justify-center text-content-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary-green-soft cursor-pointer transition-colors"
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
                    kg
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
                    className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-border-line"
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
                        className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-content-ink disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        aria-label={`Decrease ${v.name}`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{v.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateVehQty(v.id, 1)}
                        className="w-6 h-6 rounded-full bg-primary-green text-white flex items-center justify-center cursor-pointer"
                        aria-label={`Increase ${v.name}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Sticky Estimation & Continue Action Bar */}
          <div className="sticky bottom-16 md:bottom-4 z-20 pt-4">
            <Card className="p-4 bg-white/95 backdrop-blur-md border-primary-green/30 shadow-lg flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-content-muted block font-medium">
                  Estimated Payout
                </span>
                <span className="font-display font-bold text-xl sm:text-2xl text-primary-green">
                  {totalScrapAmount > 0
                    ? formatINR(totalScrapAmount)
                    : totalVehiclesCount > 0
                    ? 'After Inspection'
                    : '₹0.00'}
                </span>
              </div>

              <Button
                size="md"
                disabled={totalSelectedItems === 0}
                onClick={() => setStep('slot')}
                className="gap-2 font-bold px-6"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>
          </div>
        </div>
      ) : (
        /* Step 2: Address & Slot Selection */
        <div className="space-y-5">
          {/* Items Summary Review */}
          <Card variant="muted" className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-content-muted">
                Items Selected
              </span>
              <button
                onClick={() => setStep('items')}
                className="text-xs font-semibold text-primary-green hover:underline cursor-pointer"
              >
                Edit Items
              </button>
            </div>
            <p className="text-sm font-semibold text-content-ink">
              {[
                ...scrapItems.filter((i) => i.qty > 0).map((i) => `${i.name} (${i.qty} kg)`),
                ...vehicles.filter((v) => v.qty > 0).map((v) => `${v.name} (x${v.qty})`),
              ].join(', ')}
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-border-line">
              <span className="text-xs text-content-muted">Estimated Total:</span>
              <span className="font-display font-bold text-base text-primary-green">
                {totalScrapAmount > 0 ? formatINR(totalScrapAmount) : 'Pending Inspection'}
              </span>
            </div>
          </Card>

          {/* Contact Details */}
          <div>
            <label className="block text-xs font-semibold text-content-ink mb-1.5">
              Contact Number for Doorstep Partner *
            </label>
            <div className="flex items-center rounded-xl border border-border-line overflow-hidden bg-white">
              <span className="bg-surface-bg px-3.5 py-2.5 text-xs font-semibold text-content-muted border-r border-border-line">
                +91
              </span>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                className="px-3 py-2.5 text-sm bg-transparent flex-1 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Address Selection */}
          <div>
            <label className="block text-xs font-semibold text-content-ink mb-1.5">
              Pickup Address *
            </label>
            <div className="space-y-2">
              <Card
                variant={selectedAddress === 'addr-1' ? 'default' : 'outline'}
                onClick={() => setSelectedAddress('addr-1')}
                className={`p-3.5 flex items-start gap-3 cursor-pointer ${
                  selectedAddress === 'addr-1' ? 'border-primary-green ring-1 ring-primary-green' : ''
                }`}
              >
                <MapPin className="w-4 h-4 text-primary-green flex-none mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-content-ink block">Home</span>
                  <span className="text-content-muted">
                    12-4, Gandhi Nagar 2nd Line, Near Apollo Pharmacy, Vijayawada
                  </span>
                </div>
              </Card>

              <Card
                variant={selectedAddress === 'addr-2' ? 'default' : 'outline'}
                onClick={() => setSelectedAddress('addr-2')}
                className={`p-3.5 flex items-start gap-3 cursor-pointer ${
                  selectedAddress === 'addr-2' ? 'border-primary-green ring-1 ring-primary-green' : ''
                }`}
              >
                <MapPin className="w-4 h-4 text-primary-green flex-none mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-content-ink block">Shop</span>
                  <span className="text-content-muted">
                    Shop #14, Main Road Commercial Complex, Vijayawada
                  </span>
                </div>
              </Card>
            </div>
          </div>

          {/* Pickup Slot Selection */}
          <div>
            <label className="block text-xs font-semibold text-content-ink mb-1.5">
              Available Pickup Slots (Atomic Capacity) *
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
                      : 'border-border-line bg-white hover:border-primary-green'
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
                  <span className="text-[10px] text-action-orange font-semibold block mt-1">
                    {s.seats}
                  </span>
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
              placeholder="e.g. Ring the bell on 2nd floor, keep scrap near gate."
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-line text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-green"
            />
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-bg border border-border-line text-xs text-content-muted">
            <AlertCircle className="w-4 h-4 text-primary-green flex-none mt-0.5" />
            <p>
              Your pickup slot will be reserved atomically. We verify address and recalculate prices on the server.
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
