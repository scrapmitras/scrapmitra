import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export const PasswordRecoverPage: React.FC = () => {
  const [email, setEmail] = useState('')
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
    <div className="max-w-md mx-auto py-4 sm:py-8 space-y-6">
      <Link
        to="/auth/email"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted hover:text-primary-green"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Sign In</span>
      </Link>

      <div className="text-center space-y-2">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-content-ink">
          Recover Password
        </h1>
        <p className="text-xs sm:text-sm text-content-muted">
          We will send you a secure link to reset your account password.
        </p>
      </div>

      <Card className="p-6 border-border-line shadow-sm space-y-5">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-content-ink mb-1.5">
                Registered Email
              </label>
              <div className="flex items-center px-3.5 py-3 rounded-xl border border-border-line focus-within:ring-2 focus-within:ring-primary-green">
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

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Send Recovery Link
            </Button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-primary-green mx-auto" />
            <h3 className="font-display font-bold text-lg text-content-ink">
              Check your inbox
            </h3>
            <p className="text-xs text-content-muted max-w-xs mx-auto">
              We have dispatched a password reset link to <strong>{email}</strong>.
            </p>
            <Link to="/auth/email" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full">
                Return to Sign In
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}
