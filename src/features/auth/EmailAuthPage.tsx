import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Phone, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export const EmailAuthPage: React.FC = () => {
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please provide both email and password.')
      return
    }
    setError('')
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      navigate('/onboarding')
    }, 600)
  }

  return (
    <div className="max-w-md mx-auto py-4 sm:py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-content-ink">
          {isSignUp ? 'Create Scrap Mitra Account' : 'Sign In with Email'}
        </h1>
        <p className="text-xs sm:text-sm text-content-muted">
          Manage your bookings, rate quotes, and payment history securely.
        </p>
      </div>

      <Card className="p-6 border-border-line shadow-sm space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-content-ink mb-1.5">
              Email Address
            </label>
            <div className="flex items-center px-3.5 py-3 rounded-xl border border-border-line focus-within:ring-2 focus-within:ring-primary-green focus-within:border-transparent transition-all">
              <Mail className="w-4 h-4 text-content-muted mr-2 flex-none" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm bg-transparent focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-content-ink">
                Password
              </label>
              {!isSignUp && (
                <Link
                  to="/auth/recover"
                  className="text-xs text-primary-green font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="flex items-center px-3.5 py-3 rounded-xl border border-border-line focus-within:ring-2 focus-within:ring-primary-green focus-within:border-transparent transition-all">
              <Lock className="w-4 h-4 text-content-muted mr-2 flex-none" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm bg-transparent focus:outline-none"
                required
              />
            </div>
          </div>

          {error && <p className="text-xs text-status-error font-medium">{error}</p>}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-primary-green font-semibold hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="grow border-t border-border-line"></div>
          <span className="shrink mx-3 text-xs text-content-muted">or</span>
          <div className="grow border-t border-border-line"></div>
        </div>

        <Link to="/auth/phone" className="block">
          <Button variant="outline" className="w-full text-xs sm:text-sm font-semibold gap-2">
            <Phone className="w-4 h-4 text-primary-green" />
            <span>Sign in with Phone OTP</span>
          </Button>
        </Link>
      </Card>
    </div>
  )
}
