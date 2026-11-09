import React from 'react'
import { Link } from 'react-router-dom'
import { Recycle, Armchair, ChevronRight, ShieldCheck, Sparkles, Scale, Clock, Truck } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export const HomePage: React.FC = () => {
  const quickRates = [
    { name: 'Newspaper', rate: '₹14/kg', icon: '📰', trend: 'stable' },
    { name: 'Cardboard', rate: '₹12/kg', icon: '📦', trend: 'stable' },
    { name: 'Plastic', rate: '₹10/kg', icon: '🧴', trend: 'stable' },
    { name: 'Iron', rate: '₹28/kg', icon: '🔩', trend: 'up' },
    { name: 'Aluminium', rate: '₹100/kg', icon: '🥫', trend: 'stable' },
    { name: 'Copper', rate: '₹520/kg', icon: '🔌', trend: 'up' },
  ]

  const howItWorks = [
    {
      step: '1',
      title: 'Schedule Pickup',
      desc: 'Pick your items, address, and convenient time slot.',
      icon: Clock,
    },
    {
      step: '2',
      title: 'Doorstep Weighing',
      desc: 'Our verified partner arrives with certified digital scales.',
      icon: Scale,
    },
    {
      step: '3',
      title: 'Instant Payment',
      desc: 'Receive verified instant payout via UPI or cash directly.',
      icon: Sparkles,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-primary-green text-white p-6 sm:p-8 shadow-md">
        {/* Decorative background shape */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full border-[28px] border-white/10 pointer-events-none" />
        <div className="absolute -right-6 -bottom-16 w-64 h-64 rounded-full bg-secondary-green/30 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <Badge variant="orange" className="mb-3 text-xs font-bold uppercase tracking-wider">
            Doorstep Scrap Pickup
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
            Turn your scrap into instant cash.
          </h1>
          <p className="text-sm sm:text-base text-white/85 mb-6 max-w-md">
            Transparent market rates, certified digital weighing, and hassle-free pickup right at your doorstep.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/book/scrap">
              <Button variant="secondary" size="lg" className="font-bold">
                Book a Pickup
              </Button>
            </Link>
            <Link to="/rates">
              <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Check Today's Rates
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Two Big Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/book/scrap" className="block group">
          <Card variant="interactive" className="h-full p-5 flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-secondary-green-soft text-primary-green flex items-center justify-center text-2xl flex-none shadow-xs group-hover:scale-105 transition-transform">
              <Recycle className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-content-ink group-hover:text-primary-green transition-colors">
                  Book a Pickup
                </h3>
                <ChevronRight className="w-5 h-5 text-content-muted group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs sm:text-sm text-content-muted mt-1">
                Newspaper, cardboard, plastic, iron, metals, appliances & e-waste.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="default">Standard Rates</Badge>
                <span className="text-xs text-content-muted font-medium">From ₹10/kg</span>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/sell-item" className="block group">
          <Card
            variant="interactive"
            className="h-full p-5 flex items-start gap-4 border-action-orange/20 hover:border-action-orange"
          >
            <div className="w-13 h-13 rounded-2xl bg-action-orange-soft text-action-orange flex items-center justify-center text-2xl flex-none shadow-xs group-hover:scale-105 transition-transform">
              <Armchair className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-content-ink group-hover:text-action-orange transition-colors">
                  Sell Heavy Item
                </h3>
                <ChevronRight className="w-5 h-5 text-content-muted group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs sm:text-sm text-content-muted mt-1">
                Vehicles, bulk commercial lots, old electronics, and heavy machinery.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="orange">Quotation Based</Badge>
                <span className="text-xs text-content-muted font-medium">Upload photos for quote</span>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Rates Preview */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-content-ink">
              Today's Scrap Rates
            </h2>
            <p className="text-xs text-content-muted">
              Published indicative market rates in Vijayawada
            </p>
          </div>
          <Link
            to="/rates"
            className="text-xs sm:text-sm font-semibold text-primary-green hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickRates.map((item) => (
            <Card key={item.name} className="p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{item.icon}</span>
                <Badge variant="default" className="text-[11px] font-bold">
                  {item.rate}
                </Badge>
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-content-ink">{item.name}</h4>
                <p className="text-[11px] text-content-muted">Indicative per kg</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white rounded-3xl p-6 border border-border-line space-y-4 shadow-xs">
        <div className="text-center max-w-sm mx-auto">
          <Badge variant="default" className="mb-1.5">Simple 3-Step Process</Badge>
          <h2 className="font-display font-bold text-xl text-content-ink">
            How Scrap Mitra Works
          </h2>
          <p className="text-xs text-content-muted">
            Seamless recycling for households, shops, and apartments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {howItWorks.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.step}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface-bg border border-border-line"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-green text-white flex items-center justify-center font-bold text-sm flex-none shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-content-ink mb-1">
                    {item.step}. {item.title}
                  </h4>
                  <p className="text-xs text-content-muted leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Trust & Local Service Banner */}
      <Card variant="muted" className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary-green flex-none shadow-xs">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-content-ink">
              Doorstep Service Across Vijayawada
            </h4>
            <p className="text-xs text-content-muted">
              Serving Gandhi Nagar, Benz Circle, Patamata, Auto Nagar, and surrounding localities.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-green flex-none">
          <ShieldCheck className="w-4 h-4" />
          <span>ISO Certified Scales</span>
        </div>
      </Card>
    </div>
  )
}
