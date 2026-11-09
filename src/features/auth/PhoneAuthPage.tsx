import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Mail, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export const PhoneAuthPage: React.FC = () => {
  const navigate = useNavigate()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[6-9]\d{9}$/.test(phoneNumber.trim())) {
      setError('Please enter a valid 10-digit Indian mobile number.')
      return
    }
    setError('')
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setOtpSent(true)
    }, 600)
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6 && otp.length !== 4) {
      setError('Please enter the verification OTP.')
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
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-primary-green text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
          ♻
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-content-ink">
          Welcome to Scrap Mitra
        </h1>
        <p className="text-xs sm:text-sm text-content-muted">
          Turn your household and business scrap into instant cash.
        </p>
      </div>

      <Card className="p-6 border-border-line shadow-sm space-y-5">
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-content-ink mb-1.5">
                Mobile Number
              </label>
              <div className="flex rounded-xl border border-border-line overflow-hidden focus-within:ring-2 focus-within:ring-primary-green focus-within:border-transparent transition-all">
                <span className="bg-surface-bg px-3.5 py-3 text-sm font-semibold text-content-muted border-r border-border-line flex items-center gap-1">
                  🇮🇳 +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit number"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value.replace(/\D/g, ''))
                    setError('')
                  }}
                  className="flex-1 px-3.5 py-3 text-sm text-content-ink bg-white focus:outline-none"
                  autoFocus
                />
              </div>
              {error && <p className="text-xs text-status-error font-medium mt-1.5">{error}</p>}
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
              <span>Get Verification OTP</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="otp" className="text-xs font-semibold text-content-ink">
                  Enter 6-digit OTP
                </label>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-xs text-primary-green font-semibold hover:underline"
                >
                  Change Number
                </button>
              </div>
              <p className="text-xs text-content-muted mb-2">
                Sent to +91 {phoneNumber}
              </p>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''))
                  setError('')
                }}
                className="w-full text-center tracking-[0.5em] font-display font-bold text-2xl py-3 border border-border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green"
                autoFocus
              />
              {error && <p className="text-xs text-status-error font-medium mt-1.5">{error}</p>}
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
              Verify & Continue
            </Button>
          </form>
        )}

        <div className="relative flex py-2 items-center">
          <div className="grow border-t border-border-line"></div>
          <span className="shrink mx-3 text-xs text-content-muted">or continue with</span>
          <div className="grow border-t border-border-line"></div>
        </div>

        <div className="space-y-2">
          <Link to="/auth/email" className="block">
            <Button variant="outline" className="w-full text-xs sm:text-sm font-semibold gap-2">
              <Mail className="w-4 h-4 text-primary-green" />
              <span>Continue with Email & Password</span>
            </Button>
          </Link>
        </div>

        <div className="pt-2 flex items-center justify-center gap-2 text-xs text-content-muted">
          <ShieldCheck className="w-4 h-4 text-primary-green" />
          <span>Your data is encrypted and kept private</span>
        </div>
      </Card>
    </div>
  )
}
