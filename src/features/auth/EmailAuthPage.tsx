import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ScrapAuth3D } from '@/components/3d/ScrapAuth3D'
import { useAuth } from '@/app/auth-context'

export const EmailAuthPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, signUp, isLoggedIn } = useAuth()

  const [isSignUp, setIsSignUp] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard')
    }
  }, [isLoggedIn, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setIsLoading(true)

    if (isSignUp) {
      // Validate Sign Up inputs
      if (!name.trim()) {
        setError('Please enter your full name.')
        setIsLoading(false)
        return
      }
      if (!phone.trim()) {
        setError('Please enter your mobile number.')
        setIsLoading(false)
        return
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.')
        setIsLoading(false)
        return
      }

      const res = await signUp({
        name,
        phone,
        email,
        password,
      })

      if (res.success) {
        setSuccessMsg('Account created successfully! Redirecting to your dashboard...')
        setTimeout(() => {
          navigate('/dashboard')
        }, 600)
      } else {
        setError(res.error || 'Failed to create account.')
      }
    } else {
      // Validate Login inputs
      if (!identifier.trim()) {
        setError('Please enter your registered email or phone number.')
        setIsLoading(false)
        return
      }

      const res = await login(identifier, password)

      if (res.success) {
        if (res.isAdmin) {
          setSuccessMsg('Administrator verified! Loading Admin Operations Portal...')
          setTimeout(() => {
            navigate('/admin')
          }, 500)
        } else {
          setSuccessMsg('Login successful! Loading your dashboard...')
          setTimeout(() => {
            navigate('/dashboard')
          }, 500)
        }
      } else {
        setError(res.error || 'Invalid credentials or user not found.')
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="max-w-md mx-auto py-4 sm:py-8 space-y-5">
      {/* 3D Header Illustration */}
      <div className="relative rounded-3xl bg-linear-to-b from-secondary-green-soft/50 to-transparent p-3 border border-border-line/40">
        <ScrapAuth3D />
        <div className="text-center space-y-1 mt-2">
          <h1 className="font-display font-black text-2xl sm:text-3xl text-content-ink">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h1>
          <p className="text-xs sm:text-sm text-content-muted">
            {isSignUp
              ? 'Register with your details to access doorstep pickups & scrap rates'
              : 'Sign in with your registered email or mobile number'}
          </p>
        </div>
      </div>

      {/* Main Authentication Card */}
      <Card className="p-6 border-border-line shadow-sm space-y-5">
        {/* Toggle Mode Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-surface-bg border border-border-line text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false)
              setError('')
              setSuccessMsg('')
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              !isSignUp
                ? 'bg-primary-green text-white shadow-xs'
                : 'text-content-muted hover:text-content-ink'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true)
              setError('')
              setSuccessMsg('')
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              isSignUp
                ? 'bg-primary-green text-white shadow-xs'
                : 'text-content-muted hover:text-content-ink'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp ? (
            /* SIGN UP FIELDS */
            <>
              <div>
                <label className="block text-xs font-semibold text-content-ink mb-1.5">
                  Full Name *
                </label>
                <div className="flex items-center px-3.5 py-3 rounded-xl border border-border-line focus-within:ring-2 focus-within:ring-primary-green bg-surface-card transition-all">
                  <User className="w-4 h-4 text-content-muted mr-2 flex-none" />
                  <input
                    type="text"
                    placeholder="e.g. Anand Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-sm bg-transparent text-content-ink focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-ink mb-1.5">
                  Mobile Number *
                </label>
                <div className="flex items-center px-3.5 py-3 rounded-xl border border-border-line focus-within:ring-2 focus-within:ring-primary-green bg-surface-card transition-all">
                  <Phone className="w-4 h-4 text-content-muted mr-2 flex-none" />
                  <input
                    type="tel"
                    placeholder="e.g. 9848022338"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-sm bg-transparent text-content-ink focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-ink mb-1.5">
                  Email Address *
                </label>
                <div className="flex items-center px-3.5 py-3 rounded-xl border border-border-line focus-within:ring-2 focus-within:ring-primary-green bg-surface-card transition-all">
                  <Mail className="w-4 h-4 text-content-muted mr-2 flex-none" />
                  <input
                    type="email"
                    placeholder="e.g. anand@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm bg-transparent text-content-ink focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-ink mb-1.5">
                  Create Password *
                </label>
                <div className="flex items-center px-3.5 py-3 rounded-xl border border-border-line focus-within:ring-2 focus-within:ring-primary-green bg-surface-card transition-all">
                  <Lock className="w-4 h-4 text-content-muted mr-2 flex-none" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm bg-transparent text-content-ink focus:outline-none"
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            /* SIGN IN FIELDS */
            <>
              <div>
                <label className="block text-xs font-semibold text-content-ink mb-1.5">
                  Email or Mobile Number *
                </label>
                <div className="flex items-center px-3.5 py-3 rounded-xl border border-border-line focus-within:ring-2 focus-within:ring-primary-green bg-surface-card transition-all">
                  <User className="w-4 h-4 text-content-muted mr-2 flex-none" />
                  <input
                    type="text"
                    placeholder="ramesh.sharma@example.com or 9848022338"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full text-sm bg-transparent text-content-ink focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-content-ink">
                    Password *
                  </label>
                </div>
                <div className="flex items-center px-3.5 py-3 rounded-xl border border-border-line focus-within:ring-2 focus-within:ring-primary-green bg-surface-card transition-all">
                  <Lock className="w-4 h-4 text-content-muted mr-2 flex-none" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm bg-transparent text-content-ink focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Error & Success Messages */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 flex-none" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Action */}
          <Button
            type="submit"
            className="w-full font-bold h-11"
            isLoading={isLoading}
          >
            <span>{isSignUp ? 'Create Account & Enter' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-content-muted border-t border-border-line space-y-2">
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-green" />
            <span>Secure validation backed by Supabase PostgreSQL</span>
          </p>
          <div className="pt-1">
            <Link
              to="/admin/login"
              className="text-[11px] font-semibold text-content-muted hover:text-emerald-600 transition-colors inline-flex items-center gap-1"
            >
              <span>Platform Staff?</span>
              <strong className="underline text-emerald-600">Admin Operations Portal →</strong>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
