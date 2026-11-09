import React from 'react'
import { ShieldCheck, ArrowDownLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatINR } from '@/lib/utils'

export const PaymentsPage: React.FC = () => {
  const payments = [
    {
      id: 'PAY-2026-0941',
      bookingId: 'SM-2026-0001039',
      amount: 1320,
      method: 'UPI (ravi@okhdfcbank)',
      status: 'success',
      paidAt: '07 Nov 2026, 11:42 AM',
      items: 'Newspaper (20 kg) + Copper (2 kg)',
    },
    {
      id: 'PAY-2026-0812',
      bookingId: 'SM-2026-0000892',
      amount: 560,
      method: 'Cash',
      status: 'success',
      paidAt: '24 Oct 2026, 03:15 PM',
      items: 'Iron Scrap (20 kg)',
    },
  ]

  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-content-ink">
          Payment History
        </h1>
        <p className="text-sm text-content-muted">
          Verified record of scrap payouts received at your doorstep.
        </p>
      </div>

      {/* Payout Summary */}
      <Card className="p-5 bg-linear-to-r from-primary-green to-secondary-green text-white flex items-center justify-between">
        <div>
          <span className="text-xs text-white/80 block font-medium">
            Verified Total Payouts
          </span>
          <span className="font-display font-bold text-3xl text-white">
            {formatINR(totalReceived)}
          </span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
          <ArrowDownLeft className="w-6 h-6 text-white" />
        </div>
      </Card>

      {/* Payment Records List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-content-muted px-1">
          Disbursement Receipts
        </h3>

        {payments.map((p) => (
          <Card key={p.id} className="p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-content-muted block">
                  {p.id} • Booking {p.bookingId}
                </span>
                <h4 className="font-display font-bold text-base text-content-ink">
                  {p.items}
                </h4>
              </div>
              <Badge variant="success" className="text-[10px]">
                Paid Successfully
              </Badge>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border-line text-xs">
              <div>
                <span className="text-content-muted">Disbursed via <strong>{p.method}</strong></span>
                <span className="text-content-muted block">{p.paidAt}</span>
              </div>
              <span className="font-display font-bold text-base text-primary-green">
                +{formatINR(p.amount)}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-secondary-green-soft text-xs text-content-ink border border-border-line">
        <ShieldCheck className="w-4 h-4 text-primary-green flex-none mt-0.5" />
        <p>
          Payments are verified via secure UPI reference or signed cash receipt signed by our certified collector partner.
        </p>
      </div>
    </div>
  )
}
