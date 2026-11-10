import React, { useState } from 'react'
import {
  X,
  Package,
  MapPin,
  Calendar,
  User,
  Phone,
  Send,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatINR } from '@/lib/utils'
import type { SellRequest } from '@/types'

interface SellRequestDetailsModalProps {
  sellRequest: SellRequest | null
  onClose: () => void
  onIssueQuotation: (sellRequestId: string, amount: number, notes: string) => Promise<void>
  onUpdateStatus: (sellRequestId: string, nextStatus: string) => Promise<void>
}

export const SellRequestDetailsModal: React.FC<SellRequestDetailsModalProps> = ({
  sellRequest,
  onClose,
  onIssueQuotation,
  onUpdateStatus,
}) => {
  const [quoteAmount, setQuoteAmount] = useState<string>(
    sellRequest?.quotation ? String(sellRequest.quotation.offered_amount) : ''
  )
  const [quoteNotes, setQuoteNotes] = useState<string>(
    sellRequest?.quotation?.offer_notes || 'Includes doorstep dismantling and free transit loading.'
  )
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isEditingQuote, setIsEditingQuote] = useState(!sellRequest?.quotation)
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null)

  if (!sellRequest) return null

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseFloat(quoteAmount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setStatusMessage('Please enter a valid scrap offer amount')
      return
    }

    setIsSubmittingQuote(true)
    setStatusMessage('Submitting quotation to customer...')
    try {
      await onIssueQuotation(sellRequest.id, amountNum, quoteNotes)
      setStatusMessage('Quotation sent successfully!')
      setIsEditingQuote(false)
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message || 'Failed to issue quotation'}`)
    } finally {
      setIsSubmittingQuote(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    setIsUpdatingStatus(true)
    try {
      await onUpdateStatus(sellRequest.id, status)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface-card border border-border-line rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border-line flex items-center justify-between bg-surface-bg/50 flex-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-none">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg text-content-ink">
                  Sell Request #{sellRequest.request_number}
                </h3>
                <Badge
                  variant={
                    sellRequest.status === 'quotation_sent' || sellRequest.status === 'accepted'
                      ? 'success'
                      : sellRequest.status === 'completed'
                      ? 'default'
                      : 'orange'
                  }
                  className="text-[10px] uppercase font-bold"
                >
                  {sellRequest.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-xs text-content-muted">
                Submitted on {new Date(sellRequest.created_at).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-bg border border-border-line flex items-center justify-center text-content-muted hover:text-content-ink transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-content-ink">
          {/* Section 1: Item Specification */}
          <div className="p-4 rounded-2xl bg-surface-bg border border-border-line space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-line/60 pb-3">
              <div>
                <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block">
                  Scrap Commodity / Item Title
                </span>
                <h4 className="font-display font-black text-lg text-content-ink">
                  {sellRequest.item_title}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-surface-card border border-border-line font-mono font-bold text-content-ink">
                  Qty: {sellRequest.estimated_quantity || 1} {sellRequest.unit || 'units'}
                </span>
                {sellRequest.item_condition && (
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 border border-amber-500/20 font-semibold">
                    {sellRequest.item_condition}
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs text-content-muted">
              <strong className="text-content-ink">Description / Observations: </strong>
              {sellRequest.item_description || 'No additional condition notes provided by customer.'}
            </div>

            {sellRequest.customer_note && (
              <div className="text-xs text-content-muted italic bg-surface-card p-2.5 rounded-xl border border-border-line">
                Customer instructions: "{sellRequest.customer_note}"
              </div>
            )}
          </div>

          {/* Section 2: Uploaded Inspection Photos */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-content-muted uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-primary-green" />
                Customer Verification Photos ({sellRequest.images?.length || 0})
              </span>
              <span className="text-[10px] text-content-muted">Stored in secure bucket: `sell-request-images`</span>
            </div>

            {sellRequest.images && sellRequest.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {sellRequest.images.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    onClick={() => setSelectedPreviewImage(img.storage_path)}
                    className="group relative rounded-2xl border border-border-line bg-surface-bg p-3 cursor-pointer hover:border-emerald-500 transition-all overflow-hidden flex flex-col justify-between h-28"
                  >
                    <div className="flex items-center justify-between text-content-muted text-[10px] font-mono">
                      <span>Photo #{idx + 1}</span>
                      <span>{(img.file_size_bytes / 1024).toFixed(0)} KB</span>
                    </div>

                    <div className="flex items-center justify-center flex-1 my-1">
                      <ImageIcon className="w-8 h-8 text-content-muted group-hover:text-primary-green group-hover:scale-110 transition-all" />
                    </div>

                    <div className="text-[10px] font-mono text-content-muted truncate group-hover:text-content-ink">
                      {img.original_file_name || img.storage_path}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-surface-bg text-xs text-content-muted text-center border border-dashed border-border-line">
                No inspection photos uploaded for this sell request.
              </div>
            )}

            {/* Photo Lightbox Popup */}
            {selectedPreviewImage && (
              <div className="p-3 bg-surface-bg rounded-xl border border-primary-green/30 text-xs flex items-center justify-between">
                <span className="text-content-ink font-mono font-medium truncate">
                  Selected Asset: <strong>{selectedPreviewImage}</strong>
                </span>
                <button
                  onClick={() => setSelectedPreviewImage(null)}
                  className="text-xs text-rose-500 font-bold hover:underline cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            )}
          </div>

          {/* Section 3: Customer & Address Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-bg border border-border-line">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-content-muted uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary-green" />
                Customer Contact
              </span>
              <p className="text-sm font-bold text-content-ink">{sellRequest.pickup_contact_name}</p>
              <a
                href={`tel:${sellRequest.pickup_contact_phone_e164}`}
                className="text-xs text-primary-green font-semibold hover:underline inline-flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                {sellRequest.pickup_contact_phone_e164}
              </a>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-content-muted uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary-green" />
                Pickup Location
              </span>
              <p className="text-xs font-bold text-content-ink">
                {sellRequest.pickup_address_line1}
                {sellRequest.pickup_address_line2 ? `, ${sellRequest.pickup_address_line2}` : ''}
              </p>
              <p className="text-[11px] text-content-muted">
                {sellRequest.pickup_locality}, {sellRequest.pickup_city} - {sellRequest.pickup_postal_code}
              </p>
              {sellRequest.preferred_pickup_date && (
                <p className="text-[11px] text-primary-green font-semibold flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  Preferred: {new Date(sellRequest.preferred_pickup_date).toLocaleDateString('en-IN')}
                </p>
              )}
            </div>
          </div>

          {/* Section 4: Quotation Valuation Desk */}
          <div className="p-5 rounded-2xl bg-surface-bg border border-border-line space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h4 className="font-display font-bold text-sm text-content-ink">
                  Price Quotation Desk (`public.quotations`)
                </h4>
              </div>

              {sellRequest.quotation && !isEditingQuote && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingQuote(true)}
                  className="text-xs font-bold"
                >
                  Revise Quote
                </Button>
              )}
            </div>

            {/* Display Active Quotation Details if Present */}
            {sellRequest.quotation && !isEditingQuote ? (
              <div className="p-4 rounded-xl bg-surface-card border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-content-muted uppercase font-bold block">
                      Quotation Identifier
                    </span>
                    <span className="font-mono text-sm font-bold text-content-ink">
                      #{sellRequest.quotation.quotation_number}
                    </span>
                  </div>
                  <Badge variant="success" className="uppercase font-bold text-[10px]">
                    {sellRequest.quotation.status}
                  </Badge>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-border-line">
                  <span className="text-xs text-content-muted font-medium">Offered Scrap Valuation:</span>
                  <span className="font-display font-black text-2xl text-emerald-600">
                    {formatINR(sellRequest.quotation.offered_amount)}
                  </span>
                </div>

                {sellRequest.quotation.offer_notes && (
                  <p className="text-xs text-content-muted italic bg-surface-bg p-2 rounded-lg border border-border-line">
                    Notes: {sellRequest.quotation.offer_notes}
                  </p>
                )}

                <div className="text-[11px] text-content-muted flex items-center justify-between">
                  <span>Sent: {new Date(sellRequest.quotation.sent_at || sellRequest.quotation.created_at).toLocaleString('en-IN')}</span>
                  <span>Valid Until: {new Date(sellRequest.quotation.valid_until).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            ) : (
              /* Quotation Input / Revision Form */
              <form onSubmit={handleQuoteSubmit} className="space-y-3 bg-surface-card p-4 rounded-xl border border-emerald-500/30">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-content-ink mb-1">
                      Offered Scrap Amount (₹ INR) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-content-muted">₹</span>
                      <input
                        type="number"
                        placeholder="e.g. 1850"
                        value={quoteAmount}
                        onChange={(e) => setQuoteAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 rounded-xl border border-border-line text-sm bg-surface-bg text-content-ink font-bold focus:ring-2 focus:ring-emerald-500"
                        required
                        min="1"
                        step="any"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-content-ink mb-1">
                      Terms & Inclusions
                    </label>
                    <input
                      type="text"
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      placeholder="e.g. Free doorstep dismantling and carrier pickup included"
                      className="w-full px-3 py-2 rounded-xl border border-border-line text-sm bg-surface-bg text-content-ink focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                  <span className="text-xs font-semibold text-emerald-600">
                    {statusMessage}
                  </span>
                  <div className="flex items-center gap-2">
                    {sellRequest.quotation && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingQuote(false)}
                        className="text-xs font-semibold"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      size="sm"
                      isLoading={isSubmittingQuote}
                      className="font-bold text-xs"
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      {sellRequest.quotation ? 'Update & Re-send Quotation' : 'Send Binding Quotation'}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer Lifecycle Actions */}
        <div className="px-6 py-4 border-t border-border-line bg-surface-bg/50 flex flex-wrap items-center justify-between gap-3 flex-none">
          <div className="text-xs text-content-muted">
            Request Status: <strong className="text-content-ink uppercase">{sellRequest.status}</strong>
          </div>

          <div className="flex items-center gap-2">
            {sellRequest.status === 'submitted' && (
              <Button
                size="sm"
                onClick={() => handleStatusChange('under_review')}
                isLoading={isUpdatingStatus}
                className="font-bold text-xs"
              >
                Mark Under Review
              </Button>
            )}

            {sellRequest.status === 'quotation_sent' && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleStatusChange('accepted')}
                isLoading={isUpdatingStatus}
                className="font-bold text-xs"
              >
                Accept On Behalf of Customer
              </Button>
            )}

            {sellRequest.status === 'accepted' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('completed')}
                isLoading={isUpdatingStatus}
                className="font-bold text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-500/10"
              >
                Mark Handover Completed
              </Button>
            )}

            {sellRequest.status !== 'cancelled' && sellRequest.status !== 'completed' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleStatusChange('cancelled')}
                isLoading={isUpdatingStatus}
                className="text-xs text-rose-500 hover:bg-rose-500/10"
              >
                Reject Request
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
