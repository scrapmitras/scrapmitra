import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/app/auth-context'

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoggedIn, isAdmin } = useAuth()

  const [email, setEmail] = useState('admin@scrapmitra.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      navigate('/admin')
    }
  }, [isLoggedIn, isAdmin, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!email.trim()) {
      setError('Please enter your administrator email.')
      setIsLoading(false)
      return
    }

    const res = await login(email, password)

    if (res.success) {
      if (res.isAdmin) {
        navigate('/admin')
      } else {
        setError('Access Denied: Your account does not have administrative privileges.')
      }
    } else {
      setError(res.error || 'Invalid administrator credentials.')
    }

    setIsLoading(false)
  }

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
      {/* Return link */}
      <div>
        <Link
          to="/auth/email"
          className="inline-flex items-center text-xs text-content-muted hover:text-primary-green transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to Customer Portal</span>
        </Link>
      </div>

      {/* Admin Branding Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-950/40">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-content-ink">
          Operations & Admin Portal
        </h1>
        <p className="text-xs sm:text-sm text-content-muted max-w-xs mx-auto">
          Authorized dispatch, quotation management, and daily scrap pricing control
        </p>
      </div>

      {/* Admin Form */}
      <Card className="p-6 border-slate-700/60 shadow-md space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-content-ink mb-1.5">
              Administrator Email *
            </label>
            <div className="flex items-center px-3.5 py-3 rounded-xl border border-border-line focus-within:ring-2 focus-within:ring-emerald-500 bg-surface-card transition-all">
              <Mail className="w-4 h-4 text-content-muted mr-2 flex-none" />
              <input
                type="email"
                placeholder="admin@scrapmitra.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm bg-transparent text-content-ink focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-ink mb-1.5">
              Admin Password *
            </label>
            <div className="flex items-center px-3.5 py-3 rounded-xl border border-border-line focus-within:ring-2 focus-within:ring-emerald-500 bg-surface-card transition-all">
              <Lock className="w-4 h-4 text-content-muted mr-2 flex-none" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm bg-transparent text-content-ink focus:outline-none"
              />
            </div>
            <span className="text-[11px] text-content-muted mt-1 block">
              Default seeded administrator: <strong className="text-primary-green">admin@scrapmitra.com</strong>
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full font-bold h-11 bg-slate-900 hover:bg-slate-800 text-white border border-emerald-500/40"
            isLoading={isLoading}
          >
            <span>Enter Admin Portal</span>
            <ArrowRight className="w-4 h-4 ml-1.5 text-emerald-400" />
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-border-line">
          <span className="text-[11px] text-content-muted">
            Are you a customer?{' '}
            <Link to="/auth/email" className="text-primary-green font-bold hover:underline">
              Customer Sign In & Sign Up
            </Link>
          </span>
        </div>
      </Card>
    </div>
  )
}

