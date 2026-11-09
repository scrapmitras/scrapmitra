import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, CheckCircle2, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export const SellItemPage: React.FC = () => {
  const navigate = useNavigate()
  const [category, setCategory] = useState('Furniture')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [expectedPrice, setExpectedPrice] = useState('')
  const [address, setAddress] = useState('addr-1')
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    'Furniture',
    'Vehicle',
    'Electronics',
    'Large Appliance',
    'Industrial / Mixed Lot',
  ]

  const handleTogglePhoto = (name: string) => {
    if (uploadedPhotos.includes(name)) {
      setUploadedPhotos(uploadedPhotos.filter((p) => p !== name))
    } else {
      setUploadedPhotos([...uploadedPhotos, name])
    }
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please provide a title for the item.')
      return
    }
    if (uploadedPhotos.length < 3) {
      setError('Please attach at least 3 photos (front, angle, condition).')
      return
    }
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      navigate('/sell-requests/SI-2026-0002201')
    }, 600)
  }

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="orange" className="mb-1 text-xs">
          Quotation Request
        </Badge>
        <h1 className="font-display font-bold text-2xl text-content-ink">
          Sell Heavy / Unusual Items
        </h1>
        <p className="text-xs sm:text-sm text-content-muted">
          Submit photos and details for furniture, appliances, or commercial machinery. Our team inspects and provides a guaranteed price quotation.
        </p>
      </div>

      <Card className="p-5 border-border-line space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Chips */}
          <div>
            <label className="block text-xs font-semibold text-content-ink mb-2">
              Item Category *
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    category === c
                      ? 'bg-action-orange text-white border-action-orange shadow-xs'
                      : 'bg-white text-content-muted border-border-line hover:border-action-orange'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Item Title */}
          <div>
            <label className="block text-xs font-semibold text-content-ink mb-1">
              Item Title / Name *
            </label>
            <input
              type="text"
              placeholder="e.g., 5-Seater Teak Wood Sofa Set, Old Godrej Refrigerator"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-line text-sm focus:outline-none focus:ring-2 focus:ring-action-orange"
              required
            />
          </div>

          {/* Photos Upload Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-content-ink">
                Item Photos (At least 3 required) *
              </label>
              <span className="text-[11px] font-semibold text-action-orange">
                {uploadedPhotos.length}/6 selected
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {['Front View', 'Back View', 'Side Angle', 'Condition', 'Detail 1', 'Detail 2'].map(
                (slot) => {
                  const isSelected = uploadedPhotos.includes(slot)
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleTogglePhoto(slot)}
                      className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary-green bg-secondary-green-soft text-primary-green'
                          : 'border-border-line bg-surface-bg text-content-muted hover:border-action-orange'
                      }`}
                    >
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 mb-1" />
                      ) : (
                        <Camera className="w-5 h-5 mb-1 opacity-70" />
                      )}
                      <span className="text-[10px] font-semibold leading-tight">
                        {slot}
                      </span>
                    </button>
                  )
                }
              )}
            </div>
          </div>

          {/* Details / Condition */}
          <div>
            <label className="block text-xs font-semibold text-content-ink mb-1">
              Condition & Description
            </label>
            <textarea
              rows={3}
              placeholder="Mention age, brand, working/non-working status, any visible damages, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-line text-xs focus:outline-none focus:ring-2 focus:ring-action-orange"
            />
          </div>

          {/* Expected Price (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-content-ink">
                Expected Price in ₹ (Optional)
              </label>
              <span className="text-[11px] text-content-muted">Leave blank for open quotation</span>
            </div>
            <div className="flex items-center px-3.5 py-2.5 rounded-xl border border-border-line bg-white">
              <span className="text-xs font-semibold text-content-muted mr-1.5">₹</span>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(e.target.value)}
                className="w-full text-sm bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Pickup Address */}
          <div>
            <label className="block text-xs font-semibold text-content-ink mb-1">
              Inspection / Pickup Address *
            </label>
            <select
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-line text-sm bg-white focus:outline-none focus:ring-2 focus:ring-action-orange"
            >
              <option value="addr-1">Home – 12-4, Gandhi Nagar 2nd Line, Vijayawada</option>
              <option value="addr-2">Shop – Shop #14, Main Road, Vijayawada</option>
            </select>
          </div>

          {error && <p className="text-xs text-status-error font-medium">{error}</p>}

          <Button
            type="submit"
            variant="secondary"
            className="w-full font-bold"
            isLoading={isSubmitting}
          >
            <span>Submit for Valuation & Quotation</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>
      </Card>
    </div>
  )
}
