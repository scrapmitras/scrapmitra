import React, { useState, useRef, useEffect } from 'react'
import { Sparkles, RotateCw, Lightbulb } from 'lucide-react'

interface ScrapHero3DProps {
  className?: string
}

export const ScrapHero3D: React.FC<ScrapHero3DProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrivingOut, setIsDrivingOut] = useState(true)
  const [headlightsActive, setHeadlightsActive] = useState(true)
  const [selectedPin, setSelectedPin] = useState<string | null>(null)

  // 3D Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0, z: 0 })
  const isDraggingRef = useRef(false)
  const startPosRef = useRef({ x: 0, y: 0 })
  const currentTiltRef = useRef({ x: 0, y: 0 })

  // Trigger Drive Out Entrance
  const triggerDriveOut = () => {
    setIsDrivingOut(false)
    // Small timeout to reset animation
    setTimeout(() => {
      setIsDrivingOut(true)
    }, 50)
  }

  // Interactive Mouse Parallax (3D Perspective)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isDraggingRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    // Smooth tilt angles
    const tiltX = -(y / (rect.height / 2)) * 12 // max 12 deg pitch
    const tiltY = (x / (rect.width / 2)) * 16 // max 16 deg yaw
    setTilt({ x: tiltX, y: tiltY, z: 0 })
  }

  const handleMouseLeave = () => {
    if (!isDraggingRef.current) {
      setTilt({ x: 0, y: 0, z: 0 })
      setSelectedPin(null)
    }
  }

  // Touch & Drag Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true
    startPosRef.current = { x: e.clientX, y: e.clientY }
    currentTiltRef.current = { ...tilt }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      isDraggingRef.current = true
      startPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      currentTiltRef.current = { ...tilt }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length === 0) return
    const deltaX = e.touches[0].clientX - startPosRef.current.x
    const deltaY = e.touches[0].clientY - startPosRef.current.y
    const newY = Math.max(-28, Math.min(28, currentTiltRef.current.y + deltaX * 0.18))
    const newX = Math.max(-16, Math.min(16, currentTiltRef.current.x - deltaY * 0.14))
    setTilt({ x: newX, y: newY, z: 0 })
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false
        // Return smoothly to center after drag
        setTilt({ x: 0, y: 0, z: 0 })
      }
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      const deltaX = e.clientX - startPosRef.current.x
      const deltaY = e.clientY - startPosRef.current.y
      const newY = Math.max(-32, Math.min(32, currentTiltRef.current.y + deltaX * 0.16))
      const newX = Math.max(-18, Math.min(18, currentTiltRef.current.x - deltaY * 0.12))
      setTilt({ x: newX, y: newY, z: 0 })
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)
    window.addEventListener('mousemove', handleGlobalMouseMove)
    window.addEventListener('touchend', handleGlobalMouseUp)

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('touchend', handleGlobalMouseUp)
    }
  }, [])

  // Floating scrap pins attached to loaded cargo
  const cargoPins = [
    {
      id: 'copper',
      name: 'Copper Coil Wire',
      rate: '₹520/kg',
      position: 'top-[16%] left-[38%]',
      color: 'bg-orange-500',
    },
    {
      id: 'newspaper',
      name: 'Sorted Newspapers',
      rate: '₹14/kg',
      position: 'top-[28%] left-[24%]',
      color: 'bg-emerald-500',
    },
    {
      id: 'cardboard',
      name: 'Packaging Cartons',
      rate: '₹12/kg',
      position: 'top-[20%] left-[54%]',
      color: 'bg-amber-600',
    },
    {
      id: 'truck',
      name: 'Tata Ace Gold • AP 16 TX 4920',
      rate: 'Zero Pickup Fee',
      position: 'bottom-[34%] right-[32%]',
      color: 'bg-primary-green',
    },
  ]

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className={`relative w-full h-full min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] xl:min-h-[540px] flex items-center justify-center select-none overflow-hidden cursor-grab active:cursor-grabbing perspective-1200 ${className}`}
      aria-label="Photorealistic 3D Scrap Collection Truck driving out of screen"
    >
      {/* 3D Perspective Container */}
      <div
        className={`relative w-full max-w-[700px] aspect-16/10 flex items-center justify-center transition-transform duration-200 ease-out preserve-3d ${
          isDrivingOut ? 'animate-truck-drive-out' : 'scale-90 opacity-40'
        }`}
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1, 1, 1)`,
        }}
      >
        {/* Glow halo behind truck */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-primary-green/40 via-action-orange/15 to-transparent blur-3xl pointer-events-none -z-10 transform scale-110" />

        {/* Real Photorealistic Truck Render */}
        <img
          src="/images/scrap-truck-realistic.jpg"
          alt="Scrap Mitra Real Tata Ace Doorstep Scrap Collection Commercial Truck with Loaded Recyclables AP 16 TX 4920"
          className="w-full h-full object-cover object-center rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10 pointer-events-none transition-all duration-300"
          style={{
            filter: headlightsActive
              ? 'brightness(1.05) contrast(1.06)'
              : 'brightness(0.92) contrast(1.02)',
          }}
        />

        {/* Headlight Beams Glow Overlay */}
        {headlightsActive && (
          <div
            className="absolute top-[52%] right-[10%] w-72 h-36 pointer-events-none transform -translate-y-1/2 opacity-75 mix-blend-screen"
            style={{
              background:
                'radial-gradient(ellipse at left, rgba(254, 240, 138, 0.85) 0%, rgba(254, 240, 138, 0.35) 40%, transparent 80%)',
              transform: `translateY(-50%) rotate(${tilt.x * 0.4}deg)`,
            }}
          />
        )}

        {/* Specular Light Sheen sweep tracking mouse */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none mix-blend-overlay opacity-30 transition-opacity"
          style={{
            background: `radial-gradient(circle at ${50 + tilt.y * 1.5}% ${
              50 - tilt.x * 2
            }%, rgba(255,255,255,0.7) 0%, transparent 60%)`,
          }}
        />

        {/* Interactive Floating Hotspot Pins on Cargo */}
        {cargoPins.map((pin) => {
          const isSelected = selectedPin === pin.id
          return (
            <div
              key={pin.id}
              className={`absolute ${pin.position} z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-300 hover:scale-125`}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedPin(isSelected ? null : pin.id)
              }}
              onMouseEnter={() => setSelectedPin(pin.id)}
            >
              {/* Glowing Pulse Pin */}
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pin.color}`}
                />
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${pin.color} border-2 border-white shadow-md`}
                />
              </span>

              {/* Tooltip Card */}
              {isSelected && (
                <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/20 text-white text-xs font-bold whitespace-nowrap shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-1.5">
                    <span>{pin.name}</span>
                    <span className="text-action-orange">{pin.rate}</span>
                  </div>
                  <div className="w-2 h-2 bg-black/85 border-r border-b border-white/20 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Top Floating Badge: Genuine Vehicle Status */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white tracking-wider uppercase shadow-xl">
        <Sparkles className="w-3.5 h-3.5 text-action-orange animate-pulse" />
        <span>Real Scrap Collection Truck • AP 16 TX 4920</span>
      </div>

      {/* Bottom Floating Interactive Toolbar */}
      <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="text-[11px] font-medium text-white/80 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-md">
          ↺ Hover or drag 3D to tilt & explore cargo
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Headlights Toggle Button */}
          <button
            type="button"
            onClick={() => setHeadlightsActive(!headlightsActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-md transition-all cursor-pointer active:scale-95 border ${
              headlightsActive
                ? 'bg-amber-400 text-black border-amber-300 shadow-amber-500/30'
                : 'bg-black/50 text-white/80 border-white/15 hover:bg-black/70'
            }`}
            title="Toggle Truck Headlights"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Headlights</span>
          </button>

          {/* Replay "Comes Out" Entrance Animation Button */}
          <button
            type="button"
            onClick={triggerDriveOut}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary-green hover:bg-primary-green-dark text-white text-[11px] font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
            title="Drive truck out towards screen again"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Drive Out 3D</span>
          </button>
        </div>
      </div>
    </div>
  )
}
