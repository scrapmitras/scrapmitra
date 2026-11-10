import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Recycle, Armchair, Sparkles, Bell, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/app/auth-context'

export const NotificationsPage: React.FC = () => {
  const { profile, isAdmin } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('notifications')
        .select('*, booking:bookings(booking_number)')
        .order('created_at', { ascending: false })

      if (!isAdmin && profile?.id) {
        query = query.eq('profile_id', profile.id)
      }

      const { data, error } = await query
      if (!error && data) {
        setNotifications(data)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [profile?.id, isAdmin])

  const markAllRead = async () => {
    if (profile?.id) {
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('profile_id', profile.id)
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const getNotificationLink = (n: any) => {
    if (n.booking?.booking_number) return `/bookings/${n.booking.booking_number}`
    if (n.related_booking_id) return `/bookings/${n.related_booking_id}`
    if (n.related_sell_request_id) return `/sell-requests/${n.related_sell_request_id}`
    return '/dashboard'
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking_created':
      case 'status_change':
        return Recycle
      case 'sell_request':
      case 'quotation_ready':
        return Armchair
      default:
        return Sparkles
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-content-ink">
            Notifications
          </h1>
          <p className="text-sm text-content-muted">
            Live updates regarding your scrap pickups and payout transfers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchNotifications}
            disabled={isLoading}
            className="text-content-muted hover:text-content-ink"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          {notifications.some((n) => !n.is_read) && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-primary-green mx-auto" />
          <p className="text-xs text-content-muted">Loading live notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-10 text-center space-y-3 border-border-line">
          <div className="w-12 h-12 rounded-2xl bg-secondary-green-soft text-primary-green mx-auto flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-base text-content-ink">
            No notifications yet
          </h3>
          <p className="text-xs text-content-muted max-w-sm mx-auto">
            You'll see real-time updates here as your pickup partner is assigned and weights are verified.
          </p>
          <Link to="/book/scrap">
            <Button size="sm" className="mt-2 font-bold">
              Book a Pickup Now
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = getIcon(n.notification_type)
            const targetLink = getNotificationLink(n)
            return (
              <Link key={n.id} to={targetLink} className="block group">
                <Card
                  className={`p-4 transition-all flex items-start gap-3.5 ${
                    !n.is_read ? 'border-primary-green/50 bg-secondary-green-soft/20 shadow-xs' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-none ${
                      !n.is_read
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
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-action-orange flex-none" />
                      )}
                    </div>
                    <p className="text-xs text-content-muted mt-1 leading-relaxed">
                      {n.body}
                    </p>
                    <span className="text-[10px] text-content-muted mt-2 block font-medium">
                      {new Date(n.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
