import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Recycle, Armchair, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Quotation Ready for Sofa Set',
      body: 'Our valuation team has provided an offer of ₹4,500. Click to review and accept.',
      time: '10 mins ago',
      link: '/sell-requests/SI-2026-0002201',
      isRead: false,
      icon: Armchair,
    },
    {
      id: 'notif-2',
      title: 'Partner Assigned for Pickup',
      body: 'Ramesh Kumar will arrive between 10:00 AM - 01:00 PM with certified digital scales.',
      time: '2 hours ago',
      link: '/bookings/SM-2026-0001042',
      isRead: false,
      icon: Recycle,
    },
    {
      id: 'notif-3',
      title: 'Payout of ₹1,320 Received',
      body: 'UPI payout successfully transferred for booking SM-2026-0001039.',
      time: '3 days ago',
      link: '/payments',
      isRead: true,
      icon: Sparkles,
    },
  ])

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-content-ink">
            Notifications
          </h1>
          <p className="text-sm text-content-muted">
            Updates regarding your scrap bookings and quotations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={markAllRead}
          className="text-xs"
        >
          Mark all as read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon = n.icon
          return (
            <Link key={n.id} to={n.link} className="block group">
              <Card
                className={`p-4 transition-all flex items-start gap-3.5 ${
                  !n.isRead ? 'border-primary-green/50 bg-secondary-green-soft/20 shadow-xs' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-none ${
                    !n.isRead
                      ? 'bg-primary-green text-white shadow-xs'
                      : 'bg-surface-bg text-content-muted border border-border-line'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display font-bold text-sm text-content-ink group-hover:text-primary-green transition-colors">
                      {n.title}
                    </h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-action-orange flex-none" />
                    )}
                  </div>
                  <p className="text-xs text-content-muted mt-1 leading-relaxed">
                    {n.body}
                  </p>
                  <span className="text-[10px] text-content-muted mt-2 block font-medium">
                    {n.time}
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
