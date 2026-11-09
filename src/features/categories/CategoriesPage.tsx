import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronRight, Newspaper, Package, Cpu, Car, Layers } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export const CategoriesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    {
      name: 'Paper & Cardboard',
      slug: 'paper',
      icon: Newspaper,
      desc: 'Old newspapers, books, cartons, and shredded office paper.',
      itemCount: 4,
      ratesFrom: '₹12/kg',
    },
    {
      name: 'Plastics',
      slug: 'plastic',
      icon: Package,
      desc: 'PET bottles, milk pouches, hard containers, and HDPE scrap.',
      itemCount: 3,
      ratesFrom: '₹10/kg',
    },
    {
      name: 'Metals (Iron & Steel)',
      slug: 'ferrous-metals',
      icon: Layers,
      desc: 'Iron rods, scrap sheets, tin cans, grills, and construction steel.',
      itemCount: 3,
      ratesFrom: '₹28/kg',
    },
    {
      name: 'Non-Ferrous Metals',
      slug: 'non-ferrous-metals',
      icon: Layers,
      desc: 'Copper wire, brass utensils, aluminium cans, lead batteries.',
      itemCount: 4,
      ratesFrom: '₹100/kg',
    },
    {
      name: 'E-Waste & Electronics',
      slug: 'e-waste',
      icon: Cpu,
      desc: 'Laptops, mobile phones, printed circuit boards, and cables.',
      itemCount: 5,
      ratesFrom: '₹18/kg',
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

  const filtered = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.desc.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-content-ink">
          Material Categories
        </h1>
        <p className="text-sm text-content-muted">
          Browse materials accepted by Scrap Mitra with published indicative rates.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="search"
          placeholder="Search materials (e.g., copper, newspaper, bike)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-surface-card text-content-ink border border-border-line rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cat) => {
          const Icon = cat.icon
          return (
            <Link key={cat.slug} to={`/categories/${cat.slug}`} className="block group">
              <Card variant="interactive" className="h-full flex items-start gap-4 p-4.5">
                <div className="w-12 h-12 rounded-2xl bg-secondary-green-soft text-primary-green flex items-center justify-center flex-none group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-content-ink group-hover:text-primary-green transition-colors">
                      {cat.name}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-content-muted group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-content-muted mt-1 line-clamp-2">
                    {cat.desc}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="default" className="text-[11px]">
                      {cat.itemCount} items
                    </Badge>
                    <span className="text-xs text-primary-green font-semibold">
                      From {cat.ratesFrom}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

