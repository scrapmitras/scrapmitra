import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, Calculator, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatINR } from '@/lib/utils'

export const RatesPage: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState('all')
  const [calcWeight, setCalcWeight] = useState<number>(20)
  const [calcRate, setCalcRate] = useState<number>(14)

  const rates = [
    { name: 'Newspaper', category: 'paper', rate: 14, unit: 'kg', icon: '📰' },
    { name: 'Cardboard / Cartons', category: 'paper', rate: 12, unit: 'kg', icon: '📦' },
    { name: 'Office White Paper', category: 'paper', rate: 16, unit: 'kg', icon: '📄' },
    { name: 'Books & Notebooks', category: 'paper', rate: 10, unit: 'kg', icon: '📚' },
    { name: 'Plastic Bottles (PET)', category: 'plastic', rate: 10, unit: 'kg', icon: '🧴' },
    { name: 'Hard Plastic Containers', category: 'plastic', rate: 8, unit: 'kg', icon: '🪣' },
    { name: 'Iron Scrap (Heavy)', category: 'metal', rate: 28, unit: 'kg', icon: '🔩' },
    { name: 'Tin Cans & Light Iron', category: 'metal', rate: 15, unit: 'kg', icon: '🥫' },
    { name: 'Copper Wires', category: 'metal', rate: 520, unit: 'kg', icon: '🔌' },
    { name: 'Brass / Bronze', category: 'metal', rate: 340, unit: 'kg', icon: '🪔' },
    { name: 'Aluminium Scrap', category: 'metal', rate: 100, unit: 'kg', icon: '🥘' },
    { name: 'E-Waste / Cables', category: 'ewaste', rate: 18, unit: 'kg', icon: '💻' },
  ]

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'paper', label: 'Paper' },
    { id: 'plastic', label: 'Plastics' },
    { id: 'metal', label: 'Metals' },
    { id: 'ewaste', label: 'E-Waste' },
  ]

  const filteredRates = selectedCat === 'all'
    ? rates
    : rates.filter((r) => r.category === selectedCat)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-content-ink">
          Today's Scrap Rates
        </h1>
        <p className="text-sm text-content-muted">
          Transparent market-benchmarked scrap rates in Vijayawada (Updated daily at 8:00 AM IST).
        </p>
      </div>

      {/* Indicative Rates Disclaimer Alert */}
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-secondary-green-soft border border-border-line text-xs text-content-ink">
        <Info className="w-4 h-4 text-primary-green flex-none mt-0.5" />
        <p>
          <strong className="font-semibold text-primary-green">Important Note:</strong> Rates displayed are indicative. Final payout is determined after physical inspection and certified digital weighing at your doorstep.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCat === cat.id
                ? 'bg-primary-green text-white shadow-xs'
                : 'bg-surface-card text-content-muted border border-border-line hover:border-primary-green'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Rates Table / List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
        {filteredRates.map((item) => (
          <Card
            key={item.name}
            className="flex items-center justify-between p-3.5 hover:border-primary-green transition-colors cursor-pointer"
            onClick={() => {
              setCalcRate(item.rate)
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h4 className="font-display font-bold text-sm text-content-ink">
                  {item.name}
                </h4>
                <span className="text-[11px] text-content-muted uppercase tracking-wider">
                  {item.category}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-display font-bold text-base text-primary-green">
                ₹{item.rate}
              </span>
              <span className="text-xs text-content-muted">/{item.unit}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Interactive Quick Value Estimator */}
      <Card className="p-5 border-primary-green/20 bg-linear-to-b from-white to-secondary-green-soft/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary-green" />
            <h3 className="font-display font-bold text-base text-content-ink">
              Quick Value Estimator
            </h3>
          </div>
          <Badge variant="default">Instant Calculator</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-content-muted mb-1.5">
              Select Material & Rate (₹/kg)
            </label>
            <select
              value={calcRate}
              onChange={(e) => setCalcRate(Number(e.target.value))}
              className="w-full bg-surface-card border border-border-line rounded-xl px-3 py-2 text-sm text-content-ink focus:outline-none focus:ring-2 focus:ring-primary-green"
            >
              {rates.map((r) => (
                <option key={r.name} value={r.rate}>
                  {r.name} – ₹{r.rate}/kg
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-muted mb-1.5">
              Estimated Weight (kg)
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              value={calcWeight}
              onChange={(e) => setCalcWeight(Math.max(1, Number(e.target.value)))}
              className="w-full bg-surface-card border border-border-line rounded-xl px-3 py-2 text-sm text-content-ink focus:outline-none focus:ring-2 focus:ring-primary-green"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border-line">
          <div>
            <span className="text-xs text-content-muted block">Estimated Payout</span>
            <span className="font-display font-bold text-2xl text-primary-green">
              {formatINR(calcWeight * calcRate)}
            </span>
          </div>
          <Link to="/book/scrap">
            <Button size="sm" className="gap-1.5">
              <span>Book Pickup</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

