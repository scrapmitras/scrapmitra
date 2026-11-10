import React, { useState, useRef } from 'react'
import { Sparkles, RotateCw, Lightbulb, Trees, Gauge, Wind } from 'lucide-react'

interface ScrapHero3DProps {
  className?: string
}

export const ScrapHero3D: React.FC<ScrapHero3DProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<'nature' | 'studio'>('nature')
  const [isAccelerating, setIsAccelerating] = useState(false)
  const [headlightsActive, setHeadlightsActive] = useState(true)
  const [selectedPin, setSelectedPin] = useState<string | null>(null)
  const [speedKmh, setSpeedKmh] = useState(42)

  // 3D Tilt & Steering State
  const [steering, setSteering] = useState({ x: 0, y: 0, roll: 0 })
  const isDraggingRef = useRef(false)
  const startPosRef = useRef({ x: 0, y: 0 })

  // Trigger "Drive Out" forward rush / acceleration
  const triggerDriveOut = () => {
    setIsAccelerating(true)
    setSpeedKmh(68)
    setTimeout(() => {
      setIsAccelerating(false)
      setSpeedKmh(42)
    }, 1800)
  }

  // Interactive Mouse Parallax & Steering Tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isDraggingRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    // Steering yaw & roll banking
    const yaw = (x / (rect.width / 2)) * 14 // degrees
    const pitch = -(y / (rect.height / 2)) * 8 // degrees
    const roll = (x / (rect.width / 2)) * 3.5 // body roll banking into the turn

    setSteering({ x: pitch, y: yaw, roll })
  }

  const handleMouseLeave = () => {
    if (!isDraggingRef.current) {
      setSteering({ x: 0, y: 0, roll: 0 })
      setSelectedPin(null)
    }
  }

  // Touch & Swipe Controls
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      isDraggingRef.current = true
      startPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length === 0) return
    const deltaX = e.touches[0].clientX - startPosRef.current.x
    const deltaY = e.touches[0].clientY - startPosRef.current.y

    const yaw = Math.max(-24, Math.min(24, deltaX * 0.16))
    const pitch = Math.max(-12, Math.min(12, -deltaY * 0.12))
    const roll = yaw * 0.25

    setSteering({ x: pitch, y: yaw, roll })
  }

  const handleTouchEnd = () => {
    isDraggingRef.current = false
    setSteering({ x: 0, y: 0, roll: 0 })
  }

  // Floating scrap pins attached to loaded cargo in the truck bed
  const natureCargoPins = [
    {
      id: 'copper',
      name: 'Copper Coil Wire',
      rate: '₹520/kg',
      position: 'top-[22%] right-[38%]',
      color: 'bg-orange-500',
    },
    {
      id: 'newspaper',
      name: 'Sorted Newspapers',
      rate: '₹14/kg',
      position: 'top-[20%] right-[44%]',
      color: 'bg-emerald-500',
    },
    {
      id: 'cardboard',
      name: 'Cardboard Cartons',
      rate: '₹12/kg',
      position: 'top-[20%] left-[42%]',
      color: 'bg-amber-600',
    },
    {
      id: 'truck',
      name: 'Tata Ace Gold • AP 16 TX 4920',
      rate: 'Active in Vijayawada',
      position: 'bottom-[34%] right-[28%]',
      color: 'bg-primary-green',
    },
  ]

  const studioCargoPins = [
    {
      id: 'copper-s',
      name: 'Copper Coil Wire',
      rate: '₹520/kg',
      position: 'top-[16%] left-[38%]',
      color: 'bg-orange-500',
    },
    {
      id: 'newspaper-s',
      name: 'Sorted Newspapers',
      rate: '₹14/kg',
      position: 'top-[28%] left-[24%]',
      color: 'bg-emerald-500',
    },
    {
      id: 'cardboard-s',
      name: 'Packaging Cartons',
      rate: '₹12/kg',
      position: 'top-[20%] left-[54%]',
      color: 'bg-amber-600',
    },
  ]

  const activePins = viewMode === 'nature' ? natureCargoPins : studioCargoPins

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full h-full min-h-[400px] sm:min-h-[460px] lg:min-h-[520px] xl:min-h-[560px] flex items-center justify-center select-none overflow-hidden cursor-grab active:cursor-grabbing ${className}`}
      aria-label="3D Moving Scrap Collection Truck surrounded by lush greenery and trees"
    >
      {/* 3D Perspective Stage Container */}
      <div
        className="relative w-full max-w-[720px] aspect-16/10 flex items-center justify-center transition-all duration-300 ease-out"
        style={{
          perspective: '1200px',
        }}
      >
        {/* Dynamic 3D Vehicle & Environment Card */}
        <div
          className={`relative w-full h-full rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.55)] border border-white/15 transition-transform duration-200 ease-out ${
            isAccelerating ? 'animate-truck-boost' : 'animate-truck-idle-suspension'
          }`}
          style={{
            transform: `perspective(1200px) rotateX(${steering.x}deg) rotateY(${steering.y}deg) rotateZ(${steering.roll}deg) scale(${
              isAccelerating ? 1.05 : 1
            })`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Main Visual: Moving Truck in Lush Greenery Avenue / Studio */}
          <img
            src={
              viewMode === 'nature'
                ? '/images/scrap-truck-nature.jpg'
                : '/images/scrap-truck-realistic.jpg'
            }
            alt="Scrap Mitra Tata Ace Mini Truck Driving actively surrounded by lush green trees and nature AP 16 TX 4920"
            className="w-full h-full object-cover object-center pointer-events-none transition-all duration-500"
            style={{
              filter: headlightsActive
                ? 'brightness(1.06) contrast(1.06)'
                : 'brightness(0.95) contrast(1.02)',
            }}
          />

          {/* Road Vibration & Driving Horizon Shadow */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/15 pointer-events-none" />

          {/* Headlights High-Beam Glow Cone */}
          {headlightsActive && (
            <div
              className={`absolute pointer-events-none transform -translate-y-1/2 opacity-75 mix-blend-screen transition-all duration-300 ${
                viewMode === 'nature'
                  ? 'top-[66%] right-[15%] w-80 h-36'
                  : 'top-[52%] right-[10%] w-72 h-36'
              }`}
              style={{
                background:
                  'radial-gradient(ellipse at left, rgba(254, 240, 138, 0.9) 0%, rgba(254, 240, 138, 0.4) 40%, transparent 80%)',
                transform: `translateY(-50%) rotate(${steering.x * 0.4}deg)`,
              }}
            />
          )}

          {/* Sunlight Rays & God-Rays Shimmer (when in nature mode) */}
          {viewMode === 'nature' && (
            <div
              className="absolute top-0 left-0 w-full h-full pointer-events-none mix-blend-screen opacity-40 animate-pulse-subtle"
              style={{
                background:
                  'radial-gradient(circle at 18% 12%, rgba(254, 243, 199, 0.8) 0%, rgba(254, 240, 138, 0.2) 45%, transparent 75%)',
              }}
            />
          )}

          {/* Drifting Leaves Particles (Nature Driving Mode) */}
          {viewMode === 'nature' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <span className="absolute top-[25%] left-[12%] text-emerald-400 text-lg opacity-80 animate-leaf-drift-1">🍃</span>
              <span className="absolute top-[35%] left-[45%] text-emerald-300 text-sm opacity-70 animate-leaf-drift-2">🌿</span>
              <span className="absolute top-[18%] left-[70%] text-lime-400 text-xs opacity-75 animate-leaf-drift-3">🍃</span>
            </div>
          )}

          {/* Dynamic Specular Sunlight Glare Tracking Steer */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-35"
            style={{
              background: `radial-gradient(circle at ${50 + steering.y * 2}% ${
                50 - steering.x * 2.5
              }%, rgba(255,255,255,0.8) 0%, transparent 65%)`,
            }}
          />

          {/* Interactive Floating Hotspot Pins on Cargo */}
          {activePins.map((pin) => {
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
                  <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-black/90 backdrop-blur-md border border-white/20 text-white text-xs font-bold whitespace-nowrap shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-150 z-30">
                    <div className="flex items-center gap-1.5">
                      <span>{pin.name}</span>
                      <span className="text-action-orange">{pin.rate}</span>
                    </div>
                    <div className="w-2 h-2 bg-black/90 border-r border-b border-white/20 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Floating Badge: Mode Status & Speedometer */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white tracking-wider uppercase shadow-xl">
          {viewMode === 'nature' ? (
            <>
              <Trees className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vijayawada Eco Route • AP 16 TX 4920</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-action-orange" />
              <span>3D Turntable Studio • AP 16 TX 4920</span>
            </>
          )}
        </div>

        {/* Live Speedometer & Driving Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white shadow-xl">
          <Gauge className="w-3.5 h-3.5 text-action-orange" />
          <span>{speedKmh} km/h</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
        </div>
      </div>

      {/* Bottom Floating Interactive Toolbar */}
      <div className="absolute bottom-3 inset-x-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="text-[11px] font-medium text-white/80 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-md">
          ↺ Move cursor to steer truck & explore trees
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Nature vs Studio Toggle */}
          <div className="flex items-center p-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-md">
            <button
              type="button"
              onClick={() => setViewMode('nature')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                viewMode === 'nature'
                  ? 'bg-primary-green text-white shadow-xs'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Trees className="w-3 h-3" />
              <span>Greenery</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('studio')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                viewMode === 'studio'
                  ? 'bg-primary-green text-white shadow-xs'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Studio</span>
            </button>
          </div>

          {/* Headlights Toggle Button */}
          <button
            type="button"
            onClick={() => setHeadlightsActive(!headlightsActive)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold shadow-md transition-all cursor-pointer active:scale-95 border ${
              headlightsActive
                ? 'bg-amber-400 text-black border-amber-300 shadow-amber-500/30'
                : 'bg-black/50 text-white/80 border-white/15 hover:bg-black/70'
            }`}
            title="Toggle Truck Headlights"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Beam</span>
          </button>

          {/* Boost / Drive Out 3D Button */}
          <button
            type="button"
            onClick={triggerDriveOut}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white text-[11px] font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20 ${
              isAccelerating
                ? 'bg-action-orange animate-pulse'
                : 'bg-primary-green hover:bg-primary-green-dark'
            }`}
            title="Accelerate truck forward towards screen"
          >
            {isAccelerating ? <Wind className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
            <span>{isAccelerating ? 'Driving Out!' : 'Drive Out 3D'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
