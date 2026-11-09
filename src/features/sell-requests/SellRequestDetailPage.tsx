import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatINR } from '@/lib/utils'

export const SellRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  const request = {
    id: id || 'SI-2026-0002201',
    title: '5-Seater Teak Wood Living Room Sofa',
    category: 'Furniture',
    condition: 'Good condition, minor fabric wear, sturdy wooden frame.',
    expectedPrice: 5000,
    offeredQuotation: 4500,
    quotationId: 'QUOT-2026-081',
    status: 'quotation_sent',
    submittedAt: '09 Nov 2026, 04:15 PM',
    validUntil: '12 Nov 2026, 06:00 PM',
    address: 'Shop #14, Main Road, Vijayawada',
    photosCount: 4,
  }

  return (
    <div className="space-y-6">
      <Link
        to="/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted hover:text-primary-green"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>All Requests & Bookings</span>
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-mono text-content-muted block">{request.id}</span>
          <h1 className="font-display font-bold text-2xl text-content-ink">
            {request.title}
          </h1>
          <p className="text-xs text-content-muted">
            Submitted on {request.submittedAt}
          </p>
        </div>
        <Badge variant="orange" className="flex-none">
          Quotation Ready
        </Badge>
      </div>

      {/* Quotation Ready Action Alert */}
      <Card className="p-5 border-action-orange bg-action-orange-soft/40 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="orange">Official Valuation</Badge>
          <span className="text-xs text-action-orange font-semibold">
            Valid until 12 Nov
          </span>
        </div>

        <div>
          <span className="text-xs text-content-muted block">Our Offered Payout:</span>
          <span className="font-display font-bold text-3xl text-action-orange">
            {formatINR(request.offeredQuotation)}
          </span>
        </div>

        <p className="text-xs text-content-ink">
          Includes free doorstep pickup and disassembly by Scrap Mitra logistics.
        </p>

        <Link to={`/quotations/${request.quotationId}`} className="block pt-1">
          <Button variant="secondary" className="w-full font-bold gap-2">
            <span>Review Offer & Decide (Accept / Reject)</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </Card>

      {/* Submitted Details */}
      <Card className="p-5 space-y-3">
        <h3 className="font-display font-bold text-base text-content-ink">
          Submitted Item Details
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs border-y border-border-line py-3">
          <div>
            <span className="text-content-muted block">Category</span>
            <span className="font-semibold text-content-ink">{request.category}</span>
          </div>
          <div>
            <span className="text-content-muted block">Customer Expected Price</span>
            <span className="font-semibold text-content-ink">{formatINR(request.expectedPrice)}</span>
          </div>
        </div>

        <div>
          <span className="text-xs text-content-muted block mb-1">Item Description & Condition</span>
          <p className="text-xs sm:text-sm text-content-ink bg-surface-bg p-3 rounded-xl border border-border-line">
            {request.condition}
          </p>
        </div>

        <div>
          <span className="text-xs text-content-muted block mb-2">Uploaded Verification Photos</span>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="aspect-square rounded-xl bg-secondary-green-soft border border-border-line flex flex-col items-center justify-center text-primary-green"
              >
                <ImageIcon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-semibold">Photo {idx}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
