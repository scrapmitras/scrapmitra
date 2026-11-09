import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatINR } from '@/lib/utils'

export const QuotationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [decision, setDecision] = useState<'pending' | 'accepted' | 'rejected'>('pending')
  const [isLoading, setIsLoading] = useState(false)

  const quote = {
    id: id || 'QUOT-2026-081',
    requestNumber: 'SI-2026-0002201',
    itemTitle: '5-Seater Teak Wood Living Room Sofa',
    offeredAmount: 4500,
    validUntil: '12 Nov 2026, 06:00 PM IST',
    terms: [
      'The offered price is net payable directly to you via instant UPI or cash at pickup.',
      'Scrap Mitra provides free doorstep lifting and transportation in Vijayawada.',
      'Item condition must match the photographs submitted during inspection.',
      'Offer expires automatically upon validity cutoff date.',
    ],
  }

  const handleDecision = (type: 'accepted' | 'rejected') => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setDecision(type)
    }, 600)
  }

  return (
    <div className="space-y-6">
      <Link
        to={`/sell-requests/${quote.requestNumber}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted hover:text-primary-green"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Sell Request</span>
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-mono text-content-muted block">{quote.id}</span>
          <h1 className="font-display font-bold text-2xl text-content-ink">
            Quotation Offer
          </h1>
          <p className="text-xs text-content-muted">
            For: {quote.itemTitle}
          </p>
        </div>
        <Badge
          variant={
            decision === 'accepted'
              ? 'success'
              : decision === 'rejected'
              ? 'error'
              : 'orange'
          }
        >
          {decision === 'accepted'
            ? 'Accepted'
            : decision === 'rejected'
            ? 'Declined'
            : 'Offer Active'}
        </Badge>
      </div>

      {/* Main Quotation Card */}
      <Card className="p-6 text-center space-y-4 border-action-orange/30 shadow-md">
        <span className="text-xs text-content-muted uppercase tracking-wider font-semibold block">
          Net Guaranteed Doorstep Payout
        </span>
        <div className="font-display font-extrabold text-4xl sm:text-5xl text-primary-green">
          {formatINR(quote.offeredAmount)}
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-action-orange-soft text-action-orange text-xs font-semibold mx-auto">
          <Clock className="w-3.5 h-3.5" />
          <span>Valid until: {quote.validUntil}</span>
        </div>
      </Card>

      {/* Terms & Valuation Notes */}
      <Card className="p-5 space-y-3">
        <h3 className="font-display font-bold text-sm text-content-ink flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary-green" />
          <span>Offer Terms & Conditions</span>
        </h3>
        <ul className="space-y-2 text-xs text-content-muted">
          {quote.terms.map((t, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-green mt-1.5 flex-none" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Customer Decision Actions */}
      {decision === 'pending' ? (
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleDecision('rejected')}
              disabled={isLoading}
              className="border-status-error text-status-error hover:bg-status-error-soft font-bold"
            >
              <XCircle className="w-5 h-5 mr-1.5" />
              <span>Decline Offer</span>
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => handleDecision('accepted')}
              isLoading={isLoading}
              className="font-bold"
            >
              <CheckCircle2 className="w-5 h-5 mr-1.5" />
              <span>Accept Offer</span>
            </Button>
          </div>
          <p className="text-[11px] text-center text-content-muted">
            Accepting will lock this valuation and prompt our dispatcher to schedule heavy pickup.
          </p>
        </div>
      ) : decision === 'accepted' ? (
        <Card variant="muted" className="p-5 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-primary-green mx-auto" />
          <h3 className="font-display font-bold text-lg text-content-ink">
            Quotation Accepted!
          </h3>
          <p className="text-xs text-content-muted max-w-sm mx-auto">
            Thank you! Our operations team has been notified. A scrap collection partner will contact you shortly to coordinate doorstep pickup.
          </p>
          <Link to="/bookings" className="inline-block pt-2">
            <Button size="sm">Go to My Bookings</Button>
          </Link>
        </Card>
      ) : (
        <Card className="p-5 text-center space-y-3 border-status-error/30 bg-status-error-soft/30">
          <XCircle className="w-12 h-12 text-status-error mx-auto" />
          <h3 className="font-display font-bold text-lg text-content-ink">
            Offer Declined
          </h3>
          <p className="text-xs text-content-muted max-w-sm mx-auto">
            You declined this quotation. The sell request has been closed. You may submit a new request anytime.
          </p>
          <Link to="/" className="inline-block pt-2">
            <Button variant="outline" size="sm">Return to Home</Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
