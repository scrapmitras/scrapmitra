import React from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center py-12 sm:py-20 space-y-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-3xl bg-secondary-green-soft text-primary-green font-display font-extrabold text-3xl flex items-center justify-center mx-auto shadow-sm">
        404
      </div>
      <h1 className="font-display font-bold text-2xl text-content-ink">
        Page Not Found
      </h1>
      <p className="text-xs sm:text-sm text-content-muted">
        The link you followed may be broken or the page may have been moved.
      </p>

      <div className="pt-4 flex justify-center gap-3">
        <Link to="/">
          <Button className="gap-2">
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
