import React, { useState } from 'react'
import { Plus, Home, Briefcase, Store } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export const AddressesPage: React.FC = () => {
  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      label: 'Home',
      type: 'home',
      line1: '12-4, Gandhi Nagar 2nd Line',
      landmark: 'Near Apollo Pharmacy',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      postalCode: '520003',
      isDefault: true,
    },
    {
      id: 'addr-2',
      label: 'Shop',
      type: 'shop',
      line1: 'Shop #14, Main Road Commercial Complex',
      landmark: 'Opposite State Bank',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      postalCode: '520001',
      isDefault: false,
    },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [newLabel, setNewLabel] = useState('Home')
  const [newLine1, setNewLine1] = useState('')
  const [newLandmark, setNewLandmark] = useState('')

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    )
  }

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLine1.trim()) return

    const newAddr = {
      id: 'addr-' + (addresses.length + 1),
      label: newLabel,
      type: newLabel.toLowerCase() as 'home' | 'shop',
      line1: newLine1,
      landmark: newLandmark,
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      postalCode: '520001',
      isDefault: addresses.length === 0,
    }

    setAddresses([...addresses, newAddr])
    setNewLine1('')
    setNewLandmark('')
    setShowAddForm(false)
  }

  const getIcon = (type: string) => {
    if (type === 'home') return Home
    if (type === 'shop') return Store
    return Briefcase
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-content-ink">
            Saved Addresses
          </h1>
          <p className="text-sm text-content-muted">
            Manage doorstep collection locations for your bookings.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Address</span>
        </Button>
      </div>

      {/* Add Address Form */}
      {showAddForm && (
        <Card className="p-5 border-primary-green space-y-4">
          <h3 className="font-display font-bold text-base text-content-ink">
            Add New Pickup Location
          </h3>
          <form onSubmit={handleAddAddress} className="space-y-3">
            <div className="flex gap-2">
              {['Home', 'Shop', 'Work', 'Other'].map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => setNewLabel(lbl)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    newLabel === lbl
                      ? 'bg-primary-green text-white border-primary-green'
                      : 'bg-surface-card text-content-muted border-border-line'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">
                Street / Door No / Building *
              </label>
              <input
                type="text"
                placeholder="e.g. 54-12/1, Patamata Main Road"
                value={newLine1}
                onChange={(e) => setNewLine1(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-line text-sm bg-surface-card text-content-ink focus:outline-none focus:ring-2 focus:ring-primary-green"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">
                Landmark
              </label>
              <input
                type="text"
                placeholder="e.g. Near Kanaka Durga Temple Arch"
                value={newLandmark}
                onChange={(e) => setNewLandmark(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-line text-sm bg-surface-card text-content-ink focus:outline-none focus:ring-2 focus:ring-primary-green"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Address
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Addresses List */}
      <div className="space-y-3">
        {addresses.map((addr) => {
          const Icon = getIcon(addr.type)
          return (
            <Card
              key={addr.id}
              className={`p-4 transition-all ${
                addr.isDefault ? 'border-primary-green bg-white shadow-xs' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary-green-soft text-primary-green flex items-center justify-center flex-none">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-base text-content-ink">
                        {addr.label}
                      </h4>
                      {addr.isDefault && (
                        <Badge variant="default" className="text-[10px]">
                          Default Pickup
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-content-ink mt-1">
                      {addr.line1}
                    </p>
                    {addr.landmark && (
                      <p className="text-xs text-content-muted">
                        Landmark: {addr.landmark}
                      </p>
                    )}
                    <p className="text-xs text-content-muted mt-0.5">
                      {addr.city}, {addr.state} – {addr.postalCode}
                    </p>
                  </div>
                </div>

                {!addr.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs text-primary-green font-semibold"
                  >
                    Set Default
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

