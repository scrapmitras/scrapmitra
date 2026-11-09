import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { Drawer } from './Drawer'

export const AppLayout: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-content-ink transition-colors duration-200">
      <Header onOpenDrawer={() => setIsDrawerOpen(true)} />
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 sm:py-6 sm:px-6 lg:px-8 pb-24 lg:pb-12">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
