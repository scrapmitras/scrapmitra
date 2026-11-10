import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { Drawer } from './Drawer'
import { SupabaseConnectionTest } from '@/components/SupabaseConnectionTest'

export const AppLayout: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-content-ink transition-colors duration-200">
      <Header onOpenDrawer={() => setIsDrawerOpen(true)} />
      <SupabaseConnectionTest />
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* 100% full-width main container allowing edge-to-edge heroes and expansive layouts like Amazon */}
      <main className="flex-1 w-full pb-24 lg:pb-12">
        {isHomePage ? (
          <Outlet />
        ) : (
          <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 py-6 sm:py-8">
            <Outlet />
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
