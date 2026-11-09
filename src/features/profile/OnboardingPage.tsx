import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, MapPin, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [locality, setLocality] = useState('')
  const [landmark, setLandmark] = useState('')
  const [language, setLanguage] = useState('en')
  const [error, setError] = useState('')

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please provide your full name.')
      return
    }
    if (!addressLine.trim()) {
      setError('Please provide your primary pickup address.')
      return
    }
    navigate('/book/scrap')
  }

  return (
    <div className="max-w-lg mx-auto py-4 sm:py-6 space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="default" className="text-xs">Setup Your Profile</Badge>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-content-ink">
          Welcome to Scrap Mitra
        </h1>
        <p className="text-xs sm:text-sm text-content-muted">
          Add your pickup details once so our collection team knows where to arrive.
        </p>
      </div>

      <Card className="p-6 border-border-line shadow-sm">
        <form onSubmit={handleComplete} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-content-ink mb-1.5">
              Full Name *
            </label>
            <div className="flex items-center px-3.5 py-3 rounded-xl border border-border-line focus-within:ring-2 focus-within:ring-primary-green">
              <User className="w-4 h-4 text-content-muted mr-2 flex-none" />
              <input
                type="text"
                placeholder="e.g., Ravi Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm bg-transparent focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-ink mb-1.5">
              Preferred Language
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'border-primary-green bg-secondary-green-soft text-primary-green'
                    : 'border-border-line bg-white text-content-muted'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('te')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  language === 'te'
                    ? 'border-primary-green bg-secondary-green-soft text-primary-green'
                    : 'border-border-line bg-white text-content-muted'
                }`}
              >
                తెలుగు (Telugu)
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-border-line">
            <h3 className="font-display font-bold text-sm text-content-ink mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary-green" />
              <span>Primary Pickup Address</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-content-muted mb-1">
                  House / Flat / Shop & Street *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Door No. 12-4, Gandhi Nagar 2nd Line"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-line text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-green"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-content-muted mb-1">
                    Locality / Area
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Benz Circle"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-line text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-green"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-content-muted mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Near Apollo Pharmacy"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-line text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-content-muted mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value="Vijayawada"
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-line text-sm bg-surface-bg text-content-muted cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-content-muted mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value="Andhra Pradesh"
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-line text-sm bg-surface-bg text-content-muted cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-status-error font-medium">{error}</p>}

          <Button type="submit" className="w-full">
            <span>Save & Start Recycling</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>
      </Card>
    </div>
  )
}
