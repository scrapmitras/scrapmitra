import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, Calculator, ArrowRight, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatINR } from '@/lib/utils'
import { useScrapRates } from '@/hooks/useScrapRates'

export const RatesPage: React.FC = () => {
  const { rates, isLoading, refetch } = useScrapRates()
  const [selectedCat, setSelectedCat] = useState('all')
  const [calcWeight, setCalcWeight] = useState<number>(20)
  const [calcRate, setCalcRate] = useState<number>(14)

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'paper', label: 'Paper' },
    { id: 'plastic', label: 'Plastics' },
    { id: 'metal', label: 'Metals' },
    { id: 'appliances', label: 'Appliances' },
    { id: 'ewaste', label: 'E-Waste' },
  ]

  const filteredRates =
    selectedCat === 'all'
      ? rates
      : rates.filter((r) => r.category === selectedCat)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-content-ink">
            Today's Live Scrap Rates
          </h1>
          <p className="text-sm text-content-muted">
            Transparent market-benchmarked scrap rates in Vijayawada (Updated live from pricing desk).
          </p>
        </div>

        <button
          onClick={refetch}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-border-line text-xs font-semibold text-content-muted hover:text-content-ink flex items-center gap-1.5 cursor-pointer bg-surface-card"
          title="Refresh rates"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync Rates</span>
        </button>
      </div>

      {/* Indicative Rates Disclaimer Alert */}
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-secondary-green-soft border border-border-line text-xs text-content-ink">
        <Info className="w-4 h-4 text-primary-green flex-none mt-0.5" />
        <p>
          <strong className="font-semibold text-primary-green">Real-time Benchmark:</strong> Rates displayed reflect the current live pricing desk index. Final payout is confirmed via certified digital weighing at your doorstep.
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
            key={item.id || item.name}
            className="flex items-center justify-between p-3.5 hover:border-primary-green transition-colors cursor-pointer group"
            onClick={() => {
              setCalcRate(item.rate)
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
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
              <span className="font-display font-black text-base text-primary-green">
                ₹{item.rate}
              </span>
              <span className="text-xs text-content-muted font-medium">/{item.unit}</span>
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
              Select Material & Rate
            </label>
            <select
              value={calcRate}
              onChange={(e) => setCalcRate(Number(e.target.value))}
              className="w-full bg-surface-card border border-border-line rounded-xl px-3 py-2 text-sm text-content-ink focus:outline-none focus:ring-2 focus:ring-primary-green"
            >
              {rates.map((r) => (
                <option key={r.id || r.name} value={r.rate}>
                  {r.name} – ₹{r.rate}/{r.unit}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-muted mb-1.5">
              Estimated Quantity
            </label>
            <input
              type="number"
              min={1}
              max={1000}
              value={calcWeight}
              onChange={(e) => setCalcWeight(Math.max(1, Number(e.target.value)))}
              className="w-full bg-surface-card border border-border-line rounded-xl px-3 py-2 text-sm text-content-ink focus:outline-none focus:ring-2 focus:ring-primary-green"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-border-line flex items-center justify-between">
          <div>
            <span className="text-xs text-content-muted block">Estimated Cash in Hand</span>
            <span className="font-display font-black text-2xl text-primary-green">
              {formatINR(calcWeight * calcRate)}
            </span>
          </div>

          <Link to="/book/scrap">
            <Button size="sm" className="font-bold flex items-center gap-1.5">
              <span>Book Doorstep Pickup</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
