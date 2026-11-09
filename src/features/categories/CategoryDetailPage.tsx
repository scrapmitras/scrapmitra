import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export const CategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()

  const categoryDetails: Record<
    string,
    {
      name: string
      desc: string
      items: { name: string; rate: string; unit: string; note: string; inspection?: boolean }[]
    }
  > = {
    paper: {
      name: 'Paper & Cardboard',
      desc: 'Sorted dry paper and corrugated boxes. Please ensure materials are free of oil or moisture.',
      items: [
        { name: 'Newspaper', rate: '₹14', unit: 'kg', note: 'English & regional daily newspapers' },
        { name: 'Cardboard / Corrugated Boxes', rate: '₹12', unit: 'kg', note: 'Flattened packaging boxes' },
        { name: 'Office White Paper', rate: '₹16', unit: 'kg', note: 'Printer paper, notes, office files' },
        { name: 'Books & Magazines', rate: '₹10', unit: 'kg', note: 'Old textbooks, notebooks, softcovers' },
      ],
    },
    plastic: {
      name: 'Plastics',
      desc: 'Clean plastic containers and packaging. Clean and rinse bottles before collection.',
      items: [
        { name: 'PET Bottles (Water/Soda)', rate: '₹10', unit: 'kg', note: 'Transparent bottles with caps removed' },
        { name: 'Hard Plastic (Buckets/Toys)', rate: '₹8', unit: 'kg', note: 'Rigid plastic household items' },
        { name: 'Polythene / Milk Pouches', rate: '₹6', unit: 'kg', note: 'Dry and cleaned packaging covers' },
      ],
    },
    'ferrous-metals': {
      name: 'Metals (Iron & Steel)',
      desc: 'Heavy and light iron scrap, construction reinforcement steel, and sheet metal.',
      items: [
        { name: 'Iron Scrap (Heavy)', rate: '₹28', unit: 'kg', note: 'Beams, angles, rods, cast iron' },
        { name: 'Tin / Light Cans', rate: '₹15', unit: 'kg', note: 'Oil tins, food containers' },
        { name: 'Steel Utensils', rate: '₹35', unit: 'kg', note: 'Stainless steel household items' },
      ],
    },
    'non-ferrous-metals': {
      name: 'Non-Ferrous Metals',
      desc: 'High-value non-iron metals. We verify grade using calibrated handheld analyzers.',
      items: [
        { name: 'Copper Wires / Utensils', rate: '₹520', unit: 'kg', note: 'Pure copper coils, stripped wires' },
        { name: 'Brass (Pithal)', rate: '₹340', unit: 'kg', note: 'Pooja items, taps, fittings' },
        { name: 'Aluminium Utensils & Cans', rate: '₹100', unit: 'kg', note: 'Pots, sections, soda cans' },
        { name: 'Lead Battery Scrap', rate: '₹85', unit: 'kg', note: 'Inverter & motorcycle batteries' },
      ],
    },
    'e-waste': {
      name: 'E-Waste & Electronics',
      desc: 'Safe and certified eco-recycling of electrical appliances and computer equipment.',
      items: [
        { name: 'Desktop CPU / Servers', rate: '₹350', unit: 'piece', note: 'Complete tower units' },
        { name: 'Laptops (Scrap)', rate: '₹250', unit: 'piece', note: 'Non-working units with motherboard' },
        { name: 'Old Mobile Phones', rate: '₹30', unit: 'piece', note: 'With or without battery' },
        { name: 'Mixed Cables & Chargers', rate: '₹18', unit: 'kg', note: 'Power cords, adapters, ethernet' },
      ],
    },
    vehicles: {
      name: 'Vehicles & Heavy Items',
      desc: 'End-of-life two-wheelers, auto-rickshaws, and cars. Requires owner documentation and on-site inspection.',
      items: [
        { name: 'Bicycle', rate: 'Quoted', unit: 'piece', note: 'Inspection required', inspection: true },
        { name: 'Two-Wheeler (Scooter/Bike)', rate: 'Quoted', unit: 'piece', note: 'RC document verification required', inspection: true },
        { name: 'Auto-Rickshaw', rate: 'Quoted', unit: 'piece', note: 'Inspection required', inspection: true },
        { name: 'Car / Van', rate: 'Quoted', unit: 'piece', note: 'Inspection required', inspection: true },
      ],
    },
  }

  const current = categoryDetails[slug || 'paper'] || categoryDetails.paper

  return (
    <div className="space-y-5">
      <Link
        to="/categories"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted hover:text-primary-green transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>All Categories</span>
      </Link>

      <div className="bg-surface-card rounded-3xl p-5 border border-border-line">
        <h1 className="font-display font-bold text-2xl text-content-ink">
          {current.name}
        </h1>
        <p className="text-sm text-content-muted mt-1">
          {current.desc}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <Badge variant="default">{current.items.length} items listed</Badge>
          <Badge variant="outline">Live Market Snapshot</Badge>
        </div>
      </div>

      <div className="space-y-3">
        {current.items.map((item) => (
          <Card key={item.name} className="flex items-center justify-between p-4 gap-3">
            <div className="min-w-0">
              <h3 className="font-display font-bold text-base text-content-ink">
                {item.name}
              </h3>
              <p className="text-xs text-content-muted mt-0.5">{item.note}</p>
            </div>
            <div className="text-right flex-none">
              <div className="font-display font-bold text-base text-primary-green">
                {item.rate}
                {item.unit !== 'piece' && <span className="text-xs font-normal text-content-muted">/{item.unit}</span>}
              </div>
              {item.inspection && (
                <span className="text-[10px] text-action-orange font-semibold block">
                  Inspect & Quote
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Card variant="muted" className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-primary-green flex-none" />
          <p className="text-xs text-content-ink font-medium">
            Ready to schedule a pickup for {current.name.toLowerCase()}?
          </p>
        </div>
        <Link to="/book/scrap">
          <Button size="sm" className="w-full sm:w-auto">
            Book Pickup Now
          </Button>
        </Link>
      </Card>
    </div>
  )
}
