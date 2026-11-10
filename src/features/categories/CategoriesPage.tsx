import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronRight, Newspaper, Package, Cpu, Car, Layers } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useScrapRates } from '@/hooks/useScrapRates'

export const CategoriesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const { rates } = useScrapRates()

  const getMinRateForCat = (catId: string, fallback: string) => {
    const matches = rates.filter((r) => r.category === catId)
    if (matches.length === 0) return fallback
    const minRate = Math.min(...matches.map((m) => m.rate))
    return `From ₹${minRate}/kg`
  }

  const categories = [
    {
      name: 'Paper & Cardboard',
      slug: 'paper',
      icon: Newspaper,
      desc: 'Old newspapers, books, cartons, and shredded office paper.',
      itemCount: 4,
      ratesFrom: getMinRateForCat('paper', '₹12/kg'),
    },
    {
      name: 'Plastics',
      slug: 'plastic',
      icon: Package,
      desc: 'PET bottles, milk pouches, hard containers, and HDPE scrap.',
      itemCount: 3,
      ratesFrom: getMinRateForCat('plastic', '₹10/kg'),
    },
    {
      name: 'Metals (Iron & Steel)',
      slug: 'ferrous-metals',
      icon: Layers,
      desc: 'Iron rods, scrap sheets, tin cans, grills, and construction steel.',
      itemCount: 3,
      ratesFrom: getMinRateForCat('metal', '₹28/kg'),
    },
    {
      name: 'Non-Ferrous Metals',
      slug: 'non-ferrous-metals',
      icon: Layers,
      desc: 'Copper wire, brass utensils, aluminium cans, lead batteries.',
      itemCount: 4,
      ratesFrom: getMinRateForCat('metal', '₹100/kg'),
    },
    {
      name: 'E-Waste & Electronics',
      slug: 'e-waste',
      icon: Cpu,
      desc: 'Laptops, mobile phones, printed circuit boards, and cables.',
      itemCount: 5,
      ratesFrom: getMinRateForCat('ewaste', '₹18/kg'),
    },
    {
      name: 'Vehicles & Heavy Items',
      slug: 'vehicles',
      icon: Car,
      desc: 'Bicycles, two-wheelers, cars, tractors, and machinery.',
      itemCount: 6,
      ratesFrom: 'Quoted',
    },
  ]

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.desc.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-content-ink">
          Material Categories
        </h1>
        <p className="text-sm text-content-muted">
          Explore recyclable materials we collect across Vijayawada at verified doorstep weights.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
        <input
          type="text"
          placeholder="Search materials (e.g. Copper, Newspaper, Battery, Iron)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-card border border-border-line text-sm text-content-ink placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-primary-green"
        />
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cat) => {
          const Icon = cat.icon
          return (
            <Link key={cat.slug} to={`/categories/${cat.slug}`} className="block group">
              <Card
                variant="interactive"
                className="h-full p-4 flex flex-col justify-between hover:border-primary-green transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary-green-soft text-primary-green flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline">{cat.itemCount} items</Badge>
                  </div>
                  <h3 className="font-display font-bold text-base text-content-ink group-hover:text-primary-green transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-content-muted mt-1 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border-line flex items-center justify-between text-xs">
                  <span className="font-bold text-primary-green">{cat.ratesFrom}</span>
                  <span className="text-content-muted flex items-center gap-1 group-hover:text-primary-green transition-colors">
                    <span>View items</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
