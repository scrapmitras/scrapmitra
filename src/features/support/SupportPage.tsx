import React, { useState } from 'react'
import { Phone, Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export const SupportPage: React.FC = () => {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [bookingRef, setBookingRef] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setSubmitted(true)
    }, 600)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-content-ink">
          Customer Support
        </h1>
        <p className="text-sm text-content-muted">
          Need help with a pickup, rate discrepancy, or large item valuation?
        </p>
      </div>

      {/* Quick Contact Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a href="tel:+918662459999" className="block group">
          <Card variant="interactive" className="p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-secondary-green-soft text-primary-green flex items-center justify-center flex-none group-hover:scale-105 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-content-muted uppercase tracking-wider block">
                Helpline (Vijayawada)
              </span>
              <h4 className="font-display font-bold text-base text-content-ink">
                +91 866 245 9999
              </h4>
              <span className="text-[10px] text-primary-green font-medium">
                Mon - Sat (8 AM - 7 PM)
              </span>
            </div>
          </Card>
        </a>

        <a href="mailto:support@scrapmitra.com" className="block group">
          <Card variant="interactive" className="p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-secondary-green-soft text-primary-green flex items-center justify-center flex-none group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-content-muted uppercase tracking-wider block">
                Email Desk
              </span>
              <h4 className="font-display font-bold text-base text-content-ink">
                support@scrapmitra.com
              </h4>
              <span className="text-[10px] text-primary-green font-medium">
                Replies within 2 business hours
              </span>
            </div>
          </Card>
        </a>
      </div>

      {/* Ticket Submission Form */}
      <Card className="p-6 border-border-line space-y-4">
        <h3 className="font-display font-bold text-base text-content-ink flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary-green" />
          <span>Raise a Support Ticket</span>
        </h3>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-content-ink mb-1">
                Booking or Request Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. SM-2026-0001042"
                value={bookingRef}
                onChange={(e) => setBookingRef(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-line text-xs bg-surface-card text-content-ink focus:outline-none focus:ring-2 focus:ring-primary-green"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-ink mb-1">
                Subject *
              </label>
              <input
                type="text"
                placeholder="e.g. Collector delay, Weighing query, Change slot"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-line text-xs bg-surface-card text-content-ink focus:outline-none focus:ring-2 focus:ring-primary-green"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-ink mb-1">
                Message / Details *
              </label>
              <textarea
                rows={3}
                placeholder="Please describe how we can assist you..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-line text-xs bg-surface-card text-content-ink focus:outline-none focus:ring-2 focus:ring-primary-green"
                required
              />
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              <Send className="w-4 h-4 mr-1.5" />
              <span>Submit Ticket</span>
            </Button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-primary-green mx-auto" />
            <h4 className="font-display font-bold text-lg text-content-ink">
              Ticket Submitted (#TK-2026-401)
            </h4>
            <p className="text-xs text-content-muted max-w-xs mx-auto">
              Our customer success team in Vijayawada will contact you shortly on your registered number.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSubmitted(false)
                setSubject('')
                setMessage('')
              }}
            >
              Submit Another Request
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
