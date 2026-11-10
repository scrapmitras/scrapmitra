import React, { useState, useRef, useEffect } from 'react'
import { RotateCw, Lightbulb, Gauge, Wind, Navigation, MapPin } from 'lucide-react'

interface ScrapHero3DProps {
  className?: string
}

export const ScrapHero3D: React.FC<ScrapHero3DProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [speedKmh, setSpeedKmh] = useState(45)
  const [isBoosting, setIsBoosting] = useState(false)
  const [headlightsOn, setHeadlightsOn] = useState(true)
  const [selectedPin, setSelectedPin] = useState<string | null>(null)

  // 3D Perspective & Steering State
  const [steer, setSteer] = useState({ yaw: 0, pitch: 0, roll: 0, panX: 0 })
  const isDraggingRef = useRef(false)
  const startPosRef = useRef({ x: 0, y: 0 })

  // Speedometer dynamic fluctuation to simulate real driving
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isBoosting) {
        setSpeedKmh(43 + Math.floor(Math.sin(Date.now() / 1000) * 4))
      }
    }, 800)
    return () => clearInterval(interval)
  }, [isBoosting])

  // Trigger "Drive Out" forward rush / acceleration
  const triggerBoost = () => {
    setIsBoosting(true)
    setSpeedKmh(78)
    setTimeout(() => {
      setIsBoosting(false)
      setSpeedKmh(45)
    }, 2200)
  }

  // Interactive 3D Cursor Steering Parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isDraggingRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    // Real steering yaw, pitch & banking roll
    const yaw = (x / (rect.width / 2)) * 12 // max 12 deg yaw
    const pitch = -(y / (rect.height / 2)) * 7 // max 7 deg pitch
    const roll = (x / (rect.width / 2)) * 2.5 // vehicle banking into turn
    const panX = (x / (rect.width / 2)) * 14 // camera pan in pixels

    setSteer({ yaw, pitch, roll, panX })
  }

  const handleMouseLeave = () => {
    if (!isDraggingRef.current) {
      setSteer({ yaw: 0, pitch: 0, roll: 0, panX: 0 })
      setSelectedPin(null)
    }
  }

  // Touch Swipe Controls
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

    const yaw = Math.max(-20, Math.min(20, deltaX * 0.14))
    const pitch = Math.max(-8, Math.min(8, -deltaY * 0.08))
    const roll = yaw * 0.2
    const panX = yaw * 1.1

    setSteer({ yaw, pitch, roll, panX })
  }

  const handleTouchEnd = () => {
    isDraggingRef.current = false
    setSteer({ yaw: 0, pitch: 0, roll: 0, panX: 0 })
  }

  // Interactive Cargo Hotspot Pins on Loaded Recyclables
  const cargoPins = [
    {
      id: 'copper',
      name: 'Copper Coil Wire',
      rate: '₹520/kg',
      position: 'top-[22%] right-[36%]',
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
      position: 'top-[20%] left-[44%]',
      color: 'bg-amber-600',
    },
    {
      id: 'truck',
      name: 'Tata Ace Gold • AP 16 TX 4920',
      rate: 'Zero Pickup Fee',
      position: 'bottom-[28%] right-[28%]',
      color: 'bg-primary-green',
    },
  ]

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full aspect-video rounded-3xl overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.6)] border border-white/20 select-none cursor-grab active:cursor-grabbing bg-black/40 ${className}`}
      aria-label="Real Indian commercial scrap truck driving on a scenic road surrounded by lush trees in Vijayawada"
    >
      {/* 3D Perspective Stage */}
      <div
        className="w-full h-full relative overflow-hidden"
        style={{
          perspective: '1400px',
        }}
      >
        {/* Dynamic 3D Moving Vehicle & Nature Scene Card */}
        <div
          className={`relative w-full h-full transition-transform duration-200 ease-out preserve-3d ${
            isBoosting ? 'animate-truck-boost' : 'animate-truck-road-driving'
          }`}
          style={{
            transform: `perspective(1400px) rotateX(${steer.pitch}deg) rotateY(${steer.yaw}deg) rotateZ(${steer.roll}deg) translateX(${steer.panX}px) scale(${
              isBoosting ? 1.08 : 1
            })`,
          }}
        >
          {/* 1. Photorealistic Complete Real Scenario: 16:9 Perfect Fit */}
          <img
            src="/images/scrap-truck-nature.jpg"
            alt="Real Scrap Mitra Tata Ace Commercial Truck AP 16 TX 4920 driving actively along a road surrounded by lush banyan trees and greenery in Vijayawada"
            className="w-full h-full object-cover object-center pointer-events-none transition-transform duration-500 scale-103"
            style={{
              filter: headlightsOn
                ? 'brightness(1.06) contrast(1.07) saturate(1.05)'
                : 'brightness(0.94) contrast(1.02) saturate(0.98)',
            }}
          />

          {/* 2. Real-Time Moving Road Motion Blur & Asphalt Speed Lines (Underneath Truck) */}
          <div className="absolute bottom-0 left-0 right-0 h-[38%] pointer-events-none overflow-hidden opacity-50 mix-blend-overlay">
            <div className="w-full h-full animate-road-surface-stream" />
          </div>

          {/* 3. Real Animated Spinning Wheel Blur Overlays on Active Tires */}
          {/* Front Wheel Spin */}
          <div
            className="absolute bottom-[9%] left-[48%] w-18 h-18 rounded-full pointer-events-none mix-blend-overlay opacity-85 animate-wheel-spin"
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(0,0,0,0.65) 65%, transparent 100%)',
            }}
          />
          {/* Rear Wheel Spin */}
          <div
            className="absolute bottom-[17%] left-[32%] w-16 h-16 rounded-full pointer-events-none mix-blend-overlay opacity-80 animate-wheel-spin"
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(0,0,0,0.65) 65%, transparent 100%)',
            }}
          />

          {/* 4. Active High-Beam Headlight Illumination Beam */}
          {headlightsOn && (
            <div
              className="absolute bottom-[23%] right-[12%] w-[48%] h-48 pointer-events-none transform -translate-y-1/2 opacity-85 mix-blend-screen"
              style={{
                background:
                  'radial-gradient(ellipse at left, rgba(254, 240, 138, 0.95) 0%, rgba(254, 240, 138, 0.45) 45%, transparent 80%)',
                transform: `translateY(-30%) rotate(${steer.pitch * 0.4}deg)`,
              }}
            />
          )}

          {/* 5. Shimmering Sunlight Rays (God Rays) Filtering through Green Tree Canopy */}
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none mix-blend-screen opacity-45 animate-sunbeam-shimmer"
            style={{
              background:
                'radial-gradient(circle at 16% 14%, rgba(254, 243, 199, 0.85) 0%, rgba(254, 240, 138, 0.25) 50%, transparent 80%)',
            }}
          />

          {/* 6. Real Drifting Wind Leaves Blowing Past the Truck */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <span className="absolute top-[26%] left-[8%] text-emerald-300 text-lg opacity-85 animate-leaf-drift-1">🍃</span>
            <span className="absolute top-[38%] left-[35%] text-emerald-400 text-sm opacity-80 animate-leaf-drift-2">🌿</span>
            <span className="absolute top-[16%] left-[64%] text-lime-300 text-xs opacity-85 animate-leaf-drift-3">🍃</span>
            <span className="absolute top-[48%] left-[78%] text-emerald-200 text-sm opacity-75 animate-leaf-drift-1">🍃</span>
            <span className="absolute top-[22%] left-[88%] text-emerald-400 text-xs opacity-70 animate-leaf-drift-2">🌿</span>
          </div>

          {/* 7. Speed Rush Streaks (Active during "Drive Out" boost) */}
          {isBoosting && (
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/15 to-transparent animate-speed-lines mix-blend-screen" />
          )}

          {/* 8. Interactive Specular Sunlight Reflection Gliding Across Emerald Cab */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
            style={{
              background: `radial-gradient(circle at ${50 + steer.yaw * 2.2}% ${
                50 - steer.pitch * 2.8
              }%, rgba(255,255,255,0.85) 0%, transparent 65%)`,
            }}
          />

          {/* 9. Interactive Floating Cargo Pins on Scrap Payload */}
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
                {/* Glowing Pulse Dot */}
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pin.color}`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${pin.color} border-2 border-white shadow-lg`}
                  />
                </span>

                {/* Tooltip Card */}
                {isSelected && (
                  <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-black/90 backdrop-blur-md border border-white/25 text-white text-xs font-bold whitespace-nowrap shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-150 z-30">
                    <div className="flex items-center gap-1.5">
                      <span>{pin.name}</span>
                      <span className="text-action-orange">{pin.rate}</span>
                    </div>
                    <div className="w-2 h-2 bg-black/90 border-r border-b border-white/25 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Floating Telemetry Overlay: Live Route & Speedometer */}
      <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white tracking-wider uppercase shadow-xl">
          <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Vijayawada Active Route • AP 16 TX 4920</span>
        </div>

        {/* Live Driving Speedometer */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white shadow-xl">
          <Gauge className="w-3.5 h-3.5 text-action-orange" />
          <span>{speedKmh} km/h</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
        </div>
      </div>

      {/* Bottom Floating Interactive Toolbar */}
      <div className="absolute bottom-3 inset-x-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="text-[11px] font-medium text-white/90 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-md flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary-green" />
          <span>Move mouse to steer truck & explore trees</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Toggle Headlight Beams */}
          <button
            type="button"
            onClick={() => setHeadlightsOn(!headlightsOn)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-md transition-all cursor-pointer active:scale-95 border ${
              headlightsOn
                ? 'bg-amber-400 text-black border-amber-300 shadow-amber-500/30'
                : 'bg-black/60 text-white/80 border-white/15 hover:bg-black/80'
            }`}
            title="Toggle Truck Headlight Beams"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{headlightsOn ? 'Beams ON' : 'Beams OFF'}</span>
          </button>

          {/* Drive Out 3D / Acceleration Surge */}
          <button
            type="button"
            onClick={triggerBoost}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-[11px] font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20 ${
              isBoosting
                ? 'bg-action-orange animate-pulse'
                : 'bg-primary-green hover:bg-primary-green-dark'
            }`}
            title="Accelerate truck forward towards screen"
          >
            {isBoosting ? <Wind className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
            <span>{isBoosting ? 'Driving Out!' : 'Drive Out 3D'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
