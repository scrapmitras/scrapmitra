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

    // Scene, Camera, Renderer
    const width = mount.clientWidth || 400
    const height = mount.clientHeight || 320

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000)
    camera.position.set(6, 4.5, 7.5)
    camera.lookAt(0, 0.5, 0)

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
    renderer.toneMappingExposure = 1.1
    mount.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.8)
    sunLight.position.set(8, 12, 6)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 1024
    sunLight.shadow.mapSize.height = 1024
    sunLight.shadow.camera.near = 0.5
    sunLight.shadow.camera.far = 25
    sunLight.shadow.camera.left = -6
    sunLight.shadow.camera.right = 6
    sunLight.shadow.camera.top = 6
    sunLight.shadow.camera.bottom = -6
    sunLight.shadow.bias = -0.0005
    scene.add(sunLight)

    const fillLight = new THREE.DirectionalLight(0x6ee7b7, 0.6)
    fillLight.position.set(-6, 3, -4)
    scene.add(fillLight)

    // Root Group
    const rootGroup = new THREE.Group()
    scene.add(rootGroup)

    // Ground Platform
    const platformGeo = new THREE.CylinderGeometry(4.2, 4.5, 0.25, 36)
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x113b2c,
      roughness: 0.6,
      metalness: 0.1,
    })
    const platform = new THREE.Mesh(platformGeo, platformMat)
    platform.position.y = -0.125
    platform.receiveShadow = true
    rootGroup.add(platform)

    // Ring Accent
    const ringGeo = new THREE.RingGeometry(3.6, 3.8, 36)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.01
    rootGroup.add(ring)

    // --- Scrap Truck ---
    const truckGroup = new THREE.Group()
    rootGroup.add(truckGroup)
    truckGroup.position.set(0.2, 0.2, 0.3)

    // Chassis
    const chassisGeo = new THREE.BoxGeometry(3.4, 0.2, 1.6)
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 })
    const chassis = new THREE.Mesh(chassisGeo, chassisMat)
    chassis.position.y = 0.4
    chassis.castShadow = true
    truckGroup.add(chassis)

    // Cab
    const cabGeo = new THREE.BoxGeometry(1.1, 1.2, 1.5)
    const cabMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Emerald Green
      roughness: 0.3,
      metalness: 0.2,
    })
    const cab = new THREE.Mesh(cabGeo, cabMat)
    cab.position.set(1.0, 1.05, 0)
    cab.castShadow = true
    truckGroup.add(cab)

    // Windshield
    const windshieldGeo = new THREE.BoxGeometry(0.08, 0.5, 1.3)
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.75,
    })
    const windshield = new THREE.Mesh(windshieldGeo, glassMat)
    windshield.position.set(1.56, 1.2, 0)
    truckGroup.add(windshield)

    // Side Windows
    const sideWinGeo = new THREE.BoxGeometry(0.5, 0.4, 1.54)
    const sideWin = new THREE.Mesh(sideWinGeo, glassMat)
    sideWin.position.set(1.0, 1.2, 0)
    truckGroup.add(sideWin)

    // Headlights
    const lightGeo = new THREE.BoxGeometry(0.08, 0.2, 0.3)
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfef08a,
      emissiveIntensity: 0.6,
    })
    const leftLight = new THREE.Mesh(lightGeo, lightMat)
    leftLight.position.set(1.56, 0.7, 0.5)
    const rightLight = new THREE.Mesh(lightGeo, lightMat)
    rightLight.position.set(1.56, 0.7, -0.5)
    truckGroup.add(leftLight, rightLight)

    // Front Bumper
    const bumperGeo = new THREE.BoxGeometry(0.2, 0.25, 1.7)
    const bumperMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.5 })
    const bumper = new THREE.Mesh(bumperGeo, bumperMat)
    bumper.position.set(1.6, 0.45, 0)
    truckGroup.add(bumper)

    // Cargo Bed Container
    const bedGeo = new THREE.BoxGeometry(2.1, 0.9, 1.5)
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x047857,
      roughness: 0.4,
      metalness: 0.3,
    })
    const bed = new THREE.Mesh(bedGeo, bedMat)
    bed.position.set(-0.55, 0.95, 0)
    bed.castShadow = true
    truckGroup.add(bed)

    // Bed Rail Trim
    const railGeo = new THREE.BoxGeometry(2.14, 0.08, 1.54)
    const railMat = new THREE.MeshStandardMaterial({ color: 0xe87524, roughness: 0.4 }) // Action Orange trim
    const rail = new THREE.Mesh(railGeo, railMat)
    rail.position.set(-0.55, 1.42, 0)
    truckGroup.add(rail)

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.32, 24)
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 })
    const rimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.33, 16)
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.8, roughness: 0.2 })

    const wheelPositions = [
      [1.0, 0.36, 0.85],
      [1.0, 0.36, -0.85],
      [-0.4, 0.36, 0.85],
      [-0.4, 0.36, -0.85],
      [-1.2, 0.36, 0.85],
      [-1.2, 0.36, -0.85],
    ]

    const wheels: THREE.Mesh[] = []
    wheelPositions.forEach(([x, y, z]) => {
      const tire = new THREE.Mesh(wheelGeo, tireMat)
      tire.rotation.x = Math.PI / 2
      tire.position.set(x, y, z)
      tire.castShadow = true

      const rim = new THREE.Mesh(rimGeo, rimMat)
      tire.add(rim)

      truckGroup.add(tire)
      wheels.push(tire)
    })

    // --- Floating Recyclables in Scene ---
    // 1. Cardboard Box
    const boxGeo = new THREE.BoxGeometry(0.7, 0.65, 0.7)
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0xc89658,
      roughness: 0.9,
    })
    const cardBox = new THREE.Mesh(boxGeo, boxMat)
    cardBox.position.set(-2.2, 1.6, 1.2)
    cardBox.rotation.set(0.3, 0.4, 0.1)
    cardBox.castShadow = true
    rootGroup.add(cardBox)

    // Tape on box
    const tapeGeo = new THREE.BoxGeometry(0.72, 0.1, 0.12)
    const tapeMat = new THREE.MeshStandardMaterial({ color: 0x926639 })
    const tape = new THREE.Mesh(tapeGeo, tapeMat)
    tape.position.y = 0.33
    cardBox.add(tape)

    // 2. Soda Can (Aluminium)
    const canGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.65, 20)
    const canMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9, // Metallic cyan blue
      metalness: 0.85,
      roughness: 0.2,
    })
    const can = new THREE.Mesh(canGeo, canMat)
    can.position.set(-2.4, 0.9, -1.3)
    can.rotation.set(0.5, 0.2, -0.4)
    can.castShadow = true
    rootGroup.add(can)

    // 3. Copper Spool (Non-ferrous metal)
    const torusGeo = new THREE.TorusGeometry(0.35, 0.12, 16, 28)
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Copper orange sheen
      metalness: 0.9,
      roughness: 0.25,
    })
    const copper = new THREE.Mesh(torusGeo, copperMat)
    copper.position.set(2.4, 1.4, -1.0)
    copper.rotation.set(1.2, 0.3, 0.5)
    copper.castShadow = true
    rootGroup.add(copper)

    // 4. PET Plastic Bottle
    const bottleGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.7, 16)
    const bottleMat = new THREE.MeshStandardMaterial({
      color: 0x6ee7b7,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      metalness: 0.3,
    })
    const bottle = new THREE.Mesh(bottleGeo, bottleMat)
    bottle.position.set(2.2, 1.1, 1.4)
    bottle.rotation.set(-0.4, 0.5, 0.2)
    bottle.castShadow = true
    rootGroup.add(bottle)

    // Mouse Tracking Parallax
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Animation Loop
    let animId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Smooth mouse follow
      targetX += (mouseX - targetX) * 0.05
      targetY += (mouseY - targetY) * 0.05

      rootGroup.rotation.y = THREE.MathUtils.degToRad(35) + targetX * 0.35
      rootGroup.rotation.x = targetY * 0.15

      // Gentle truck float / suspension bob
      truckGroup.position.y = 0.2 + Math.sin(elapsed * 2.5) * 0.04
      truckGroup.rotation.z = Math.sin(elapsed * 2.5) * 0.015

      // Floating scrap items animation
      cardBox.position.y = 1.6 + Math.sin(elapsed * 1.8) * 0.12
      cardBox.rotation.y += 0.01
      cardBox.rotation.x += 0.005

      can.position.y = 0.9 + Math.cos(elapsed * 2.0) * 0.1
      can.rotation.y += 0.015

      copper.position.y = 1.4 + Math.sin(elapsed * 1.5 + 1) * 0.12
      copper.rotation.z += 0.012

      bottle.position.y = 1.1 + Math.cos(elapsed * 1.7 + 0.5) * 0.09
      bottle.rotation.y += 0.01

      // Wheels rotation
      wheels.forEach((w) => {
        w.rotation.z = -elapsed * 1.2
      })

      renderer.render(scene, camera)
    }

    animate()

    // Resize Handler
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
      window.removeEventListener('mousemove', handleMouseMove)
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
      className={`relative w-full h-[280px] sm:h-[340px] lg:h-[400px] flex items-center justify-center select-none overflow-hidden ${className}`}
      aria-label="Interactive 3D Scrap Collection Vehicle and Materials"
    />
  )
}
