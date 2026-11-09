import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ScrapHero3DProps {
  className?: string
}

export const ScrapHero3D: React.FC<ScrapHero3DProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const width = mount.clientWidth || 400
    const height = mount.clientHeight || 340

    // Scene & Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1000)
    camera.position.set(6.2, 4.2, 7.8)
    camera.lookAt(0, 0.6, 0)

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    mount.appendChild(renderer.domElement)

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.4)
    sunLight.position.set(8, 14, 7)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 1024
    sunLight.shadow.mapSize.height = 1024
    sunLight.shadow.bias = -0.0004
    scene.add(sunLight)

    const rimLight = new THREE.DirectionalLight(0x34d399, 1.4)
    rimLight.position.set(-6, 4, -5)
    scene.add(rimLight)

    const orangeAccent = new THREE.PointLight(0xfb923c, 2.2, 8)
    orangeAccent.position.set(2, 2.5, 3)
    scene.add(orangeAccent)

    // Root Group
    const rootGroup = new THREE.Group()
    scene.add(rootGroup)

    // --- Circular Floating Pedestal ---
    const platformGeo = new THREE.CylinderGeometry(4.2, 4.4, 0.28, 48)
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x0f2b20,
      roughness: 0.5,
      metalness: 0.2,
    })
    const platform = new THREE.Mesh(platformGeo, platformMat)
    platform.position.y = -0.14
    platform.receiveShadow = true
    rootGroup.add(platform)

    // Radiant Neon Ring
    const ringGeo = new THREE.RingGeometry(3.6, 3.85, 48)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.01
    rootGroup.add(ring)

    // Outer Orange Accent Ring
    const outerRingGeo = new THREE.RingGeometry(4.0, 4.08, 48)
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    })
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat)
    outerRing.rotation.x = -Math.PI / 2
    outerRing.position.y = 0.015
    rootGroup.add(outerRing)

    // --- 3D Scrap Truck Model ---
    const truckGroup = new THREE.Group()
    rootGroup.add(truckGroup)
    truckGroup.position.set(0.1, 0.2, 0.2)

    // Chassis
    const chassisGeo = new THREE.BoxGeometry(3.5, 0.22, 1.6)
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x18221d, roughness: 0.8 })
    const chassis = new THREE.Mesh(chassisGeo, chassisMat)
    chassis.position.y = 0.45
    chassis.castShadow = true
    truckGroup.add(chassis)

    // Green Truck Cab
    const cabGeo = new THREE.BoxGeometry(1.2, 1.3, 1.55)
    const cabMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Vibrant Emerald
      roughness: 0.25,
      metalness: 0.35,
    })
    const cab = new THREE.Mesh(cabGeo, cabMat)
    cab.position.set(1.05, 1.15, 0)
    cab.castShadow = true
    truckGroup.add(cab)

    // Glass Windshield
    const windshieldGeo = new THREE.BoxGeometry(0.06, 0.55, 1.35)
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xbfdbfe,
      roughness: 0.05,
      metalness: 0.9,
      transparent: true,
      opacity: 0.8,
    })
    const windshield = new THREE.Mesh(windshieldGeo, glassMat)
    windshield.position.set(1.66, 1.3, 0)
    truckGroup.add(windshield)

    // Side Windows
    const sideWinGeo = new THREE.BoxGeometry(0.55, 0.45, 1.59)
    const sideWin = new THREE.Mesh(sideWinGeo, glassMat)
    sideWin.position.set(1.05, 1.3, 0)
    truckGroup.add(sideWin)

    // Chrome Bumper & Radiator Grill
    const bumperGeo = new THREE.BoxGeometry(0.25, 0.28, 1.75)
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, metalness: 0.9, roughness: 0.15 })
    const bumper = new THREE.Mesh(bumperGeo, chromeMat)
    bumper.position.set(1.7, 0.5, 0)
    truckGroup.add(bumper)

    const grillGeo = new THREE.BoxGeometry(0.06, 0.35, 0.9)
    const grillMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 })
    const grill = new THREE.Mesh(grillGeo, grillMat)
    grill.position.set(1.68, 0.85, 0)
    truckGroup.add(grill)

    // Glowing LED Headlights
    const lightGeo = new THREE.BoxGeometry(0.08, 0.22, 0.28)
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0xffedd5,
      emissive: 0xffedd5,
      emissiveIntensity: 1.2,
    })
    const leftLight = new THREE.Mesh(lightGeo, ledMat)
    leftLight.position.set(1.68, 0.8, 0.52)
    const rightLight = new THREE.Mesh(lightGeo, ledMat)
    rightLight.position.set(1.68, 0.8, -0.52)
    truckGroup.add(leftLight, rightLight)

    // Cargo Bed (Dark Forest Green with Orange Railings)
    const bedGeo = new THREE.BoxGeometry(2.15, 0.95, 1.55)
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      roughness: 0.35,
      metalness: 0.25,
    })
    const bed = new THREE.Mesh(bedGeo, bedMat)
    bed.position.set(-0.6, 1.05, 0)
    bed.castShadow = true
    truckGroup.add(bed)

    // Action Orange Bed Trim
    const railGeo = new THREE.BoxGeometry(2.2, 0.08, 1.6)
    const railMat = new THREE.MeshStandardMaterial({ color: 0xe87524, roughness: 0.3, metalness: 0.5 })
    const rail = new THREE.Mesh(railGeo, railMat)
    rail.position.set(-0.6, 1.55, 0)
    truckGroup.add(rail)

    // Scrap Stacks inside Bed
    const scrapBox1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.5, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 })
    )
    scrapBox1.position.set(-0.8, 1.5, 0.3)
    scrapBox1.rotation.y = 0.2
    truckGroup.add(scrapBox1)

    const scrapBox2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.45, 0.65),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 })
    )
    scrapBox2.position.set(-0.4, 1.5, -0.3)
    scrapBox2.rotation.y = -0.3
    truckGroup.add(scrapBox2)

    // 6 Treaded Wheels with Chrome Hubcaps
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 28)
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 })
    const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.33, 16)

    const wheelPositions = [
      [1.05, 0.38, 0.88],
      [1.05, 0.38, -0.88],
      [-0.45, 0.38, 0.88],
      [-0.45, 0.38, -0.88],
      [-1.25, 0.38, 0.88],
      [-1.25, 0.38, -0.88],
    ]

    const wheels: THREE.Mesh[] = []
    wheelPositions.forEach(([x, y, z]) => {
      const tire = new THREE.Mesh(wheelGeo, tireMat)
      tire.rotation.x = Math.PI / 2
      tire.position.set(x, y, z)
      tire.castShadow = true

      const rim = new THREE.Mesh(rimGeo, chromeMat)
      tire.add(rim)

      truckGroup.add(tire)
      wheels.push(tire)
    })

    // --- Floating Orbiting 3D Scrap Materials ---
    // 1. Floating Cardboard Box
    const cardBoxGroup = new THREE.Group()
    const boxGeo = new THREE.BoxGeometry(0.75, 0.7, 0.75)
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.8,
    })
    const cardBox = new THREE.Mesh(boxGeo, boxMat)
    cardBox.castShadow = true
    cardBoxGroup.add(cardBox)

    const tapeGeo = new THREE.BoxGeometry(0.78, 0.12, 0.16)
    const tapeMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.5 })
    const tape = new THREE.Mesh(tapeGeo, tapeMat)
    tape.position.y = 0.36
    cardBoxGroup.add(tape)

    cardBoxGroup.position.set(-2.5, 1.8, 1.4)
    rootGroup.add(cardBoxGroup)

    // 2. Reflective Metallic Aluminium Can
    const canGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.7, 24)
    const canMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Glossy Cyan-Blue
      metalness: 0.9,
      roughness: 0.15,
    })
    const can = new THREE.Mesh(canGeo, canMat)
    can.position.set(-2.6, 1.1, -1.5)
    can.rotation.set(0.6, 0.3, -0.5)
    can.castShadow = true
    rootGroup.add(can)

    // 3. Glowing Metallic Copper Coil Torus
    const copperGeo = new THREE.TorusGeometry(0.38, 0.13, 16, 32)
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xe87524,
      metalness: 0.92,
      roughness: 0.2,
      emissive: 0x7c2d12,
      emissiveIntensity: 0.25,
    })
    const copper = new THREE.Mesh(copperGeo, copperMat)
    copper.position.set(2.6, 1.6, -1.2)
    copper.rotation.set(1.1, 0.4, 0.6)
    copper.castShadow = true
    rootGroup.add(copper)

    // 4. Translucent Emerald Glass Bottle
    const bottleGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.75, 20)
    const bottleMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.8,
      roughness: 0.08,
      metalness: 0.4,
    })
    const bottle = new THREE.Mesh(bottleGeo, bottleMat)
    bottle.position.set(2.4, 1.2, 1.5)
    bottle.rotation.set(-0.3, 0.6, 0.2)
    bottle.castShadow = true
    rootGroup.add(bottle)

    // --- Floating Eco Dust / Sparkle Particles ---
    const particleCount = 40
    const particleGeo = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 7
      positions[i * 3 + 1] = Math.random() * 3.5 + 0.2
      positions[i * 3 + 2] = (Math.random() - 0.5) * 7
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const particleMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.08,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    })
    const particleSystem = new THREE.Points(particleGeo, particleMat)
    rootGroup.add(particleSystem)

    // --- Mouse & Touch Interaction (Interactive Spin & Drag) ---
    let isDragging = false
    let prevPointerX = 0
    let dragVelocity = 0

    const onPointerDown = (clientX: number) => {
      isDragging = true
      prevPointerX = clientX
    }

    const onPointerMove = (clientX: number) => {
      if (!isDragging) return
      const delta = clientX - prevPointerX
      prevPointerX = clientX
      dragVelocity = delta * 0.008
      rootGroup.rotation.y += dragVelocity
    }

    const onPointerUp = () => {
      isDragging = false
    }

    // Mouse listeners
    const handleMouseDown = (e: MouseEvent) => onPointerDown(e.clientX)
    const handleMouseMove = (e: MouseEvent) => onPointerMove(e.clientX)
    const handleMouseUp = () => onPointerUp()

    // Touch listeners (Mobile friendly!)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) onPointerDown(e.touches[0].clientX)
    }
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) onPointerMove(e.touches[0].clientX)
    }
    const handleTouchEnd = () => onPointerUp()

    mount.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    mount.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd)

    // Animation Loop
    let animId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Friction & Auto-Rotation
      if (!isDragging) {
        dragVelocity *= 0.95
        rootGroup.rotation.y += dragVelocity + 0.003
      }

      // Gentle truck suspension bob
      truckGroup.position.y = 0.2 + Math.sin(elapsed * 2.5) * 0.035
      truckGroup.rotation.z = Math.sin(elapsed * 2.5) * 0.012

      // Floating items wave animation
      cardBoxGroup.position.y = 1.8 + Math.sin(elapsed * 1.8) * 0.14
      cardBoxGroup.rotation.y += 0.012
      cardBoxGroup.rotation.x = Math.sin(elapsed * 1.2) * 0.1

      can.position.y = 1.1 + Math.cos(elapsed * 2.1) * 0.12
      can.rotation.y += 0.018

      copper.position.y = 1.6 + Math.sin(elapsed * 1.6 + 1) * 0.14
      copper.rotation.z += 0.015

      bottle.position.y = 1.2 + Math.cos(elapsed * 1.9 + 0.6) * 0.1
      bottle.rotation.y += 0.012

      // Wheels rotation
      wheels.forEach((w) => {
        w.rotation.z = -elapsed * 1.4
      })

      // Particle float
      particleSystem.rotation.y = elapsed * 0.05

      // Pulsing neon ring
      ring.scale.setScalar(1 + Math.sin(elapsed * 2.5) * 0.02)

      renderer.render(scene, camera)
    }

    animate()

    // Responsive Resize Handler
    const handleResize = () => {
      if (!mount) return
      const newW = mount.clientWidth
      const newH = mount.clientHeight
      camera.aspect = newW / newH
      camera.updateProjectionMatrix()
      renderer.setSize(newW, newH)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      mount.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      mount.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animId)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-[280px] sm:h-[350px] lg:h-[420px] flex items-center justify-center select-none overflow-hidden cursor-grab active:cursor-grabbing ${className}`}
      aria-label="Interactive 3D Scrap Truck Simulation (Drag to rotate)"
    />
  )
}
