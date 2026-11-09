import React from 'react'
import { Link } from 'react-router-dom'
import { Recycle, Armchair, ChevronRight, ShieldCheck, Scale, Clock, Truck, Zap, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ScrapHero3D } from '@/components/3d/ScrapHero3D'

export const HomePage: React.FC = () => {
  const quickRates = [
    { name: 'Newspaper', rate: '₹14/kg', icon: '📰', cat: 'Paper' },
    { name: 'Cardboard', rate: '₹12/kg', icon: '📦', cat: 'Paper' },
    { name: 'Plastic', rate: '₹10/kg', icon: '🧴', cat: 'Plastic' },
    { name: 'Iron', rate: '₹28/kg', icon: '🔩', cat: 'Metals' },
    { name: 'Aluminium', rate: '₹100/kg', icon: '🥫', cat: 'Metals' },
    { name: 'Copper', rate: '₹520/kg', icon: '🔌', cat: 'Metals' },
  ]

  const howItWorks = [
    {
      step: '1',
      title: 'Schedule Pickup',
      desc: 'Select your materials, approximate weight, address, and preferred time slot.',
      icon: Clock,
    },
    {
      step: '2',
      title: 'Doorstep Weighing',
      desc: 'Our verified partner arrives at your door with certified digital scales.',
      icon: Scale,
    },
    {
      step: '3',
      title: 'Instant Payout',
      desc: 'Receive verified instant payment via UPI transfer or cash on the spot.',
      icon: Zap,
    },
  ]

  return (
    <div className="w-full flex flex-col">
      {/* 100% Full-Bleed Edge-to-Edge Hero Banner (Amazon-style cinematic presentation) */}
      <section className="w-full relative overflow-hidden bg-gradient-to-br from-[#02311f] via-[#045938] to-[#022316] text-white border-b border-primary-green/30 shadow-2xl">
        {/* Ambient atmospheric glows */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-secondary-green/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-action-orange/15 blur-3xl pointer-events-none" />

        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 py-8 sm:py-12 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Heading, Value Props & CTAs */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-action-orange text-white shadow-xs">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Doorstep Scrap Collection</span>
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-md text-white/90 border border-white/15">
                  <ShieldCheck className="w-3.5 h-3.5 text-action-orange" />
                  <span>Vijayawada Verified</span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Turn your scrap into <span className="text-action-orange underline decoration-action-orange/50 decoration-wavy">instant cash</span>.
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-white/85 max-w-2xl leading-relaxed">
                Transparent daily market rates, certified digital weighing right at your doorstep, and immediate payouts for homes, societies, shops, and businesses.
              </p>

              {/* Quick Benefits Pills */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-xs sm:text-sm text-white/90 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-action-orange flex-none" />
                  <span>Zero pickup fee</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-action-orange flex-none" />
                  <span>Certified digital scales</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-action-orange flex-none" />
                  <span>Instant UPI or Cash</span>
                </span>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap gap-3.5 pt-2">
                <Link to="/book/scrap">
                  <Button variant="secondary" size="lg" className="font-bold shadow-lg hover:scale-105 active:scale-95 transition-all text-base px-6 py-3">
                    <Recycle className="w-5 h-5 mr-2" />
                    <span>Book a Pickup</span>
                  </Button>
                </Link>
                <Link to="/rates">
                  <Button variant="outline" size="lg" className="bg-white/10 border-white/25 text-white hover:bg-white/20 backdrop-blur-md text-base px-6 py-3">
                    <span>Check Today's Rates</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: 3D Realistic Scrap Truck & Pop-Out Reveal Scene */}
            <div className="lg:col-span-6 xl:col-span-5 relative flex items-center justify-center">
              <div className="w-full relative rounded-3xl bg-black/25 backdrop-blur-md border border-white/15 p-2 overflow-hidden shadow-2xl">
                <ScrapHero3D />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 100% Expansive Content Area (Edge-to-edge max-width container) */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 py-8 sm:py-10 space-y-10 sm:space-y-12">
        {/* Two Big Primary Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <Link to="/book/scrap" className="block group">
            <Card variant="interactive" className="h-full p-5 sm:p-7 flex items-start gap-4 sm:gap-6 border-border-line hover:border-primary-green">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-secondary-green-soft text-primary-green flex items-center justify-center text-2xl flex-none shadow-xs group-hover:scale-110 transition-transform">
                <Recycle className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg sm:text-2xl text-content-ink group-hover:text-primary-green transition-colors">
                    Book a Pickup
                  </h3>
                  <ChevronRight className="w-5 h-5 text-content-muted group-hover:translate-x-1.5 transition-transform" />
                </div>
                <p className="text-xs sm:text-sm text-content-muted mt-1.5 leading-relaxed">
                  Newspaper, cardboard, plastic, iron, metals, home appliances & e-waste collected at your door.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="default" className="font-bold">Standard Rates</Badge>
                  <span className="text-xs sm:text-sm text-primary-green font-bold">From ₹10/kg</span>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/sell-item" className="block group">
            <Card
              variant="interactive"
              className="h-full p-5 sm:p-7 flex items-start gap-4 sm:gap-6 border-action-orange/25 hover:border-action-orange"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-action-orange-soft text-action-orange flex items-center justify-center text-2xl flex-none shadow-xs group-hover:scale-110 transition-transform">
                <Armchair className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg sm:text-2xl text-content-ink group-hover:text-action-orange transition-colors">
                    Sell Heavy Item
                  </h3>
                  <ChevronRight className="w-5 h-5 text-content-muted group-hover:translate-x-1.5 transition-transform" />
                </div>
                <p className="text-xs sm:text-sm text-content-muted mt-1.5 leading-relaxed">
                  Vehicles, bulk commercial lots, old electronics, heavy machinery, and office cleanouts.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="orange" className="font-bold">Quotation Based</Badge>
                  <span className="text-xs sm:text-sm text-action-orange font-bold">Upload photos for quote</span>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Today's Scrap Rates - Expansive Responsive Grid (up to 6 columns on desktop) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-content-ink">
                Today's Scrap Rates
              </h2>
              <p className="text-xs sm:text-sm text-content-muted">
                Published indicative market rates in Vijayawada (Updated daily)
              </p>
            </div>
            <Link
              to="/rates"
              className="text-xs sm:text-sm font-bold text-primary-green hover:underline flex items-center gap-1 group"
            >
              <span>View All Rates</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {quickRates.map((item) => (
              <Card
                key={item.name}
                className="p-4 sm:p-5 flex flex-col justify-between hover:border-primary-green hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted px-2 py-0.5 rounded-full bg-surface-bg border border-border-line">
                    {item.cat}
                  </span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm sm:text-base text-content-ink">
                    {item.name}
                  </h4>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-display font-extrabold text-base sm:text-lg text-primary-green">
                      {item.rate}
                    </span>
                  </div>
                  <span className="text-[10px] text-content-muted">Indicative per kg</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works - Responsive 3-Card Grid */}
        <section className="bg-surface-card rounded-3xl p-6 sm:p-8 lg:p-10 border border-border-line space-y-6 shadow-xs">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <Badge variant="default" className="font-bold">Doorstep Scrap Pickup</Badge>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-content-ink">
              How Scrap Mitra Works
            </h2>
            <p className="text-xs sm:text-sm text-content-muted">
              Certified scrap collection simplified for homes, societies, shops, and offices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 pt-2">
            {howItWorks.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.step}
                  className="flex flex-col sm:flex-row items-start gap-4 p-5 sm:p-6 rounded-2xl bg-surface-bg border border-border-line hover:border-primary-green/50 transition-colors shadow-xs"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary-green text-white flex items-center justify-center font-bold text-lg flex-none shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base sm:text-lg text-content-ink mb-1">
                      {item.step}. {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Trust & Local Service Banner */}
        <Card variant="muted" className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-surface-card flex items-center justify-center text-primary-green flex-none shadow-xs border border-border-line">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base sm:text-lg text-content-ink">
                Doorstep Service Across Vijayawada
              </h4>
              <p className="text-xs sm:text-sm text-content-muted">
                Serving Gandhi Nagar, Benz Circle, Patamata, Auto Nagar, Governorpet, Gunadala, Bhavanipuram, and surrounding areas.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-primary-green flex-none px-4 py-2.5 rounded-xl bg-surface-card border border-border-line shadow-xs">
            <ShieldCheck className="w-5 h-5 text-primary-green" />
            <span>ISO Certified Digital Weighing</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
