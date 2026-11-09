import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Sparkles, RotateCw } from 'lucide-react'

interface ScrapHero3DProps {
  className?: string
}

export const ScrapHero3D: React.FC<ScrapHero3DProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const replayTriggerRef = useRef<() => void>(() => {})
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const width = mount.clientWidth || 560
    const height = mount.clientHeight || 460

    // 1. Scene & Perspective Camera Setup
    const scene = new THREE.Scene()
    // Perspective camera with wide 35° FOV for dramatic pop-out depth
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000)
    camera.position.set(5.8, 3.2, 7.6)
    camera.lookAt(0, 0.45, 0)

    // 2. High-Performance WebGL Renderer
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
    renderer.toneMappingExposure = 1.25
    mount.appendChild(renderer.domElement)

    // 3. Cinematic Studio Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4)
    scene.add(ambientLight)

    // Key Sun Light
    const sunLight = new THREE.DirectionalLight(0xfffaed, 3.0)
    sunLight.position.set(7, 13, 8)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 1024
    sunLight.shadow.mapSize.height = 1024
    sunLight.shadow.bias = -0.0003
    scene.add(sunLight)

    // Emerald Rim Light (back-edge separation)
    const emeraldRim = new THREE.DirectionalLight(0x34d399, 2.2)
    emeraldRim.position.set(-8, 5, -6)
    scene.add(emeraldRim)

    // Orange Accent Light (warm reflection from side)
    const orangeAccent = new THREE.PointLight(0xf97316, 2.8, 12)
    orangeAccent.position.set(3, 3, 4)
    scene.add(orangeAccent)

    // 4. Root Scene Hierarchy
    const rootGroup = new THREE.Group()
    scene.add(rootGroup)

    // --- Circular Showroom Turntable Pedestal ---
    const pedestalGeo = new THREE.CylinderGeometry(4.6, 4.9, 0.32, 52)
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0a1f16,
      roughness: 0.4,
      metalness: 0.35,
    })
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat)
    pedestal.position.y = -0.16
    pedestal.receiveShadow = true
    rootGroup.add(pedestal)

    // Glowing Emerald Neon Ring
    const neonRingGeo = new THREE.RingGeometry(4.0, 4.25, 52)
    const neonRingMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    })
    const neonRing = new THREE.Mesh(neonRingGeo, neonRingMat)
    neonRing.rotation.x = -Math.PI / 2
    neonRing.position.y = 0.015
    rootGroup.add(neonRing)

    // Outer Orange Track
    const orangeRingGeo = new THREE.RingGeometry(4.35, 4.45, 52)
    const orangeRingMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    })
    const orangeRing = new THREE.Mesh(orangeRingGeo, orangeRingMat)
    orangeRing.rotation.x = -Math.PI / 2
    orangeRing.position.y = 0.016
    rootGroup.add(orangeRing)

    // --- REALISTIC INDIAN COMMERCIAL SCRAP TRUCK ---
    const truckGroup = new THREE.Group()
    rootGroup.add(truckGroup)

    // Dynamic angles: truck faces diagonally forward so user sees front cab, headlights & loaded bed
    truckGroup.rotation.y = 0.42

    // Materials Library for Realistic Commercial Truck
    const cabPaintMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Tata / Leyland Commercial Emerald Green
      metalness: 0.4,
      roughness: 0.18,
    })

    const chassisSteelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.6,
      roughness: 0.6,
    })

    const bumperMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.75,
      metalness: 0.2,
    })

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.95,
      roughness: 0.1,
    })

    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.88,
      metalness: 0.08,
    })

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.05,
      metalness: 0.92,
      transparent: true,
      opacity: 0.85,
    })

    // 1. Heavy-Duty Steel Chassis Frame
    const chassisGeo = new THREE.BoxGeometry(4.1, 0.22, 1.7)
    const chassis = new THREE.Mesh(chassisGeo, chassisSteelMat)
    chassis.position.y = 0.52
    chassis.castShadow = true
    chassis.receiveShadow = true
    truckGroup.add(chassis)

    // Twin Frame Rails along the base
    const railGeo = new THREE.BoxGeometry(4.2, 0.18, 0.12)
    const railLeft = new THREE.Mesh(railGeo, chassisSteelMat)
    railLeft.position.set(0, 0.42, 0.6)
    const railRight = new THREE.Mesh(railGeo, chassisSteelMat)
    railRight.position.set(0, 0.42, -0.6)
    truckGroup.add(railLeft, railRight)

    // Exhaust Pipe & Silencer
    const exhaustGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 16)
    const exhaust = new THREE.Mesh(exhaustGeo, chromeMat)
    exhaust.rotation.x = Math.PI / 2
    exhaust.position.set(-0.3, 0.4, 0.92)
    truckGroup.add(exhaust)

    // Fuel Tank
    const fuelTankGeo = new THREE.CylinderGeometry(0.26, 0.26, 1.0, 20)
    const fuelTank = new THREE.Mesh(fuelTankGeo, chassisSteelMat)
    fuelTank.rotation.z = Math.PI / 2
    fuelTank.position.set(0.1, 0.46, -0.96)
    truckGroup.add(fuelTank)

    // 2. Commercial Truck Cabin
    // Lower Cab
    const cabLowerGeo = new THREE.BoxGeometry(1.42, 1.15, 1.68)
    const cabLower = new THREE.Mesh(cabLowerGeo, cabPaintMat)
    cabLower.position.set(1.24, 1.1, 0)
    cabLower.castShadow = true
    truckGroup.add(cabLower)

    // Upper Cab / Roof Visor
    const cabUpperGeo = new THREE.BoxGeometry(1.15, 0.42, 1.7)
    const cabUpper = new THREE.Mesh(cabUpperGeo, cabPaintMat)
    cabUpper.position.set(1.12, 1.8, 0)
    cabUpper.castShadow = true
    truckGroup.add(cabUpper)

    // Curved Aerodynamic Windshield
    const windshieldGeo = new THREE.BoxGeometry(0.06, 0.72, 1.5)
    const windshield = new THREE.Mesh(windshieldGeo, glassMat)
    windshield.position.set(1.94, 1.42, 0)
    windshield.rotation.z = -0.18
    truckGroup.add(windshield)

    // Dual Wiper Blades
    const wiperMat = new THREE.MeshStandardMaterial({ color: 0x0f172a })
    const wiperL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 0.03), wiperMat)
    wiperL.position.set(1.98, 1.3, 0.32)
    wiperL.rotation.z = 0.55
    const wiperR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 0.03), wiperMat)
    wiperR.position.set(1.98, 1.3, -0.32)
    wiperR.rotation.z = 0.55
    truckGroup.add(wiperL, wiperR)

    // Cab Interior: Steering Wheel visible through glass
    const steerGeo = new THREE.TorusGeometry(0.2, 0.03, 12, 24)
    const steer = new THREE.Mesh(steerGeo, chassisSteelMat)
    steer.position.set(1.45, 1.3, 0.38)
    steer.rotation.y = Math.PI / 2
    steer.rotation.x = 0.4
    truckGroup.add(steer)

    // Side Windows
    const sideWinGeo = new THREE.BoxGeometry(0.7, 0.5, 1.72)
    const sideWin = new THREE.Mesh(sideWinGeo, glassMat)
    sideWin.position.set(1.24, 1.42, 0)
    truckGroup.add(sideWin)

    // Large Commercial Side Mirrors with Tubular Brackets
    const mirrorBracketMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.7 })
    const mirrorHeadMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
    const mirrorFaceMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.98, roughness: 0.05 })

    const addMirror = (zPos: number) => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.38, 12), mirrorBracketMat)
      arm.rotation.x = Math.PI / 2
      arm.position.set(1.7, 1.42, zPos > 0 ? 0.98 : -0.98)
      truckGroup.add(arm)

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.16), mirrorHeadMat)
      head.position.set(1.7, 1.42, zPos > 0 ? 1.15 : -1.15)
      truckGroup.add(head)

      const face = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.28), mirrorFaceMat)
      face.position.set(1.65, 1.42, zPos > 0 ? 1.15 : -1.15)
      face.rotation.y = -Math.PI / 2
      truckGroup.add(face)
    }
    addMirror(1)
    addMirror(-1)

    // 5 Amber Roof Clearance Marker Lights
    const amberMarkerMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.8,
    })
    for (let i = -0.6; i <= 0.6; i += 0.3) {
      const marker = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.1), amberMarkerMat)
      marker.position.set(1.7, 1.98, i)
      truckGroup.add(marker)
    }

    // Chrome Radiator Grille
    const grilleBase = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.52, 1.3), bumperMat)
    grilleBase.position.set(1.97, 0.92, 0)
    truckGroup.add(grilleBase)

    for (let i = -0.18; i <= 0.18; i += 0.09) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.035, 1.22), chromeMat)
      slat.position.set(1.98, 0.92 + i, 0)
      truckGroup.add(slat)
    }

    // Golden Scrap Mitra Circular Badge on Grille
    const badgeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 20)
    const badgeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
    })
    const badge = new THREE.Mesh(badgeGeo, badgeMat)
    badge.rotation.z = Math.PI / 2
    badge.position.set(2.02, 0.92, 0)
    truckGroup.add(badge)

    // Rugged Matte Front Bumper
    const bumperGeo = new THREE.BoxGeometry(0.24, 0.32, 1.76)
    const bumper = new THREE.Mesh(bumperGeo, bumperMat)
    bumper.position.set(1.96, 0.46, 0)
    bumper.castShadow = true
    truckGroup.add(bumper)

    // Front License Plate: "AP 16 TX 4920" (Vijayawada Registration)
    const plateGeo = new THREE.BoxGeometry(0.04, 0.14, 0.6)
    const plateMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 })
    const plate = new THREE.Mesh(plateGeo, plateMat)
    plate.position.set(2.09, 0.42, 0)
    truckGroup.add(plate)

    // Dual Twin Front Headlights with Realistic Glass & Volumetric Light Beams
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 3.5,
      roughness: 0.1,
    })

    const lightConeMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const headlights: THREE.PointLight[] = []

    const addHeadlightAssembly = (zPos: number) => {
      // Chrome Reflector Cup
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.12, 20), chromeMat)
      cup.rotation.z = Math.PI / 2
      cup.position.set(1.98, 0.88, zPos)
      truckGroup.add(cup)

      // Emissive Lens
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 20), headlightMat)
      lens.rotation.z = Math.PI / 2
      lens.position.set(2.04, 0.88, zPos)
      truckGroup.add(lens)

      // Active Point Light Beaming from Headlight
      const pLight = new THREE.PointLight(0xfff7ed, 4.2, 7)
      pLight.position.set(2.3, 0.88, zPos)
      truckGroup.add(pLight)
      headlights.push(pLight)

      // Volumetric Light Cone Beaming Forward
      const coneGeo = new THREE.ConeGeometry(0.65, 3.8, 24, 1, true)
      const cone = new THREE.Mesh(coneGeo, lightConeMat)
      cone.rotation.z = -Math.PI / 2
      cone.position.set(3.8, 0.72, zPos)
      truckGroup.add(cone)
    }

    addHeadlightAssembly(0.62)
    addHeadlightAssembly(-0.62)

    // 3. Heavy-Duty Scrap Cargo Bed (The Load Carrier)
    const bedGroup = new THREE.Group()
    truckGroup.add(bedGroup)

    // Cargo Floor Bed
    const bedFloorGeo = new THREE.BoxGeometry(2.5, 0.14, 1.74)
    const bedFloor = new THREE.Mesh(bedFloorGeo, chassisSteelMat)
    bedFloor.position.set(-0.76, 0.65, 0)
    bedFloor.castShadow = true
    bedFloor.receiveShadow = true
    bedGroup.add(bedFloor)

    // Corrugated High Cargo Walls (Green exterior, steel interior)
    const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.95, 0.08), cabPaintMat)
    wallLeft.position.set(-0.76, 1.15, 0.85)
    wallLeft.castShadow = true
    bedGroup.add(wallLeft)

    const wallRight = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.95, 0.08), cabPaintMat)
    wallRight.position.set(-0.76, 1.15, -0.85)
    wallRight.castShadow = true
    bedGroup.add(wallRight)

    const frontBulkhead = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.05, 1.74), cabPaintMat)
    frontBulkhead.position.set(0.48, 1.2, 0)
    bedGroup.add(frontBulkhead)

    const rearTailgate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.95, 1.74), cabPaintMat)
    rearTailgate.position.set(-2.0, 1.15, 0)
    rearTailgate.castShadow = true
    bedGroup.add(rearTailgate)

    // High-Visibility Safety Hazard Stripes along Cargo Sides (Green & Yellow)
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    for (let x = -1.7; x <= 0.2; x += 0.35) {
      const sLeft = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.01), stripeMat)
      sLeft.position.set(x, 0.72, 0.895)
      sLeft.rotation.z = -0.3
      bedGroup.add(sLeft)

      const sRight = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.01), stripeMat)
      sRight.position.set(x, 0.72, -0.895)
      sRight.rotation.z = 0.3
      bedGroup.add(sRight)
    }

    // Rear Taillights (Red & Amber)
    const tailMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 2.0,
    })
    const amberTailMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.5,
    })

    const tLeft = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.22), tailMat)
    tLeft.position.set(-2.05, 0.65, 0.65)
    const tRight = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.22), tailMat)
    tRight.position.set(-2.05, 0.65, -0.65)
    bedGroup.add(tLeft, tRight)

    const indLeft = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.14), amberTailMat)
    indLeft.position.set(-2.05, 0.65, 0.45)
    const indRight = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.14), amberTailMat)
    indRight.position.set(-2.05, 0.65, -0.45)
    bedGroup.add(indLeft, indRight)

    // --- 4. REALISTIC SCRAP CARGO LOAD (In Bed) ---
    const scrapLoadGroup = new THREE.Group()
    truckGroup.add(scrapLoadGroup)

    const cardboardMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.85,
    })

    const newspaperMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.9,
    })

    const pipeAluMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.92,
      roughness: 0.15,
    })

    const copperWireMat = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      metalness: 0.92,
      roughness: 0.22,
    })

    // Stacked Cardboard Cartons
    const box1 = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.58, 0.68), cardboardMat)
    box1.position.set(-0.35, 1.0, 0.3)
    box1.rotation.y = 0.15
    box1.castShadow = true
    scrapLoadGroup.add(box1)

    const box2 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.5, 0.62), cardboardMat)
    box2.position.set(-1.15, 0.95, -0.28)
    box2.rotation.y = -0.25
    box2.castShadow = true
    scrapLoadGroup.add(box2)

    const box3 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.55), cardboardMat)
    box3.position.set(-0.42, 1.48, 0.25)
    box3.rotation.y = -0.1
    box3.castShadow = true
    scrapLoadGroup.add(box3)

    // Bundled Recycled Newspapers
    const paperBundle = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 0.55), newspaperMat)
    paperBundle.position.set(-1.25, 0.88, 0.35)
    paperBundle.rotation.y = 0.12
    paperBundle.castShadow = true
    scrapLoadGroup.add(paperBundle)

    // Scrap Metal Pipes (Poking over side slightly)
    for (let i = 0; i < 4; i++) {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 1.8, 16), pipeAluMat)
      pipe.rotation.z = Math.PI / 2 + 0.15 * (i - 1.5)
      pipe.rotation.y = 0.1 * i
      pipe.position.set(-0.7, 1.35 + i * 0.06, -0.4 + i * 0.18)
      pipe.castShadow = true
      scrapLoadGroup.add(pipe)
    }

    // Coiled Copper Tube / Wire
    const copperCoil = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.07, 14, 28), copperWireMat)
    copperCoil.rotation.x = Math.PI / 2 - 0.2
    copperCoil.position.set(-1.5, 1.25, 0.1)
    scrapLoadGroup.add(copperCoil)

    // 5. Four Detailed Commercial Rubber Wheels with Tread Rims
    const wheels: THREE.Group[] = []

    const createWheel = (xPos: number, zPos: number) => {
      const wheelGroup = new THREE.Group()
      wheelGroup.position.set(xPos, 0.5, zPos)

      // Tire (Dark Vulcanized Rubber with Tread Grooves)
      const tireGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.32, 28)
      const tire = new THREE.Mesh(tireGeo, rubberMat)
      tire.rotation.x = Math.PI / 2
      tire.castShadow = true
      wheelGroup.add(tire)

      // Chrome Rim
      const rimGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.33, 20)
      const rim = new THREE.Mesh(rimGeo, chromeMat)
      rim.rotation.x = Math.PI / 2
      wheelGroup.add(rim)

      // Hubcap Center
      const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.36, 16)
      const hub = new THREE.Mesh(hubGeo, chassisSteelMat)
      hub.rotation.x = Math.PI / 2
      wheelGroup.add(hub)

      // 5 Lug Nuts
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5
        const lug = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.38, 8), chromeMat)
        lug.rotation.x = Math.PI / 2
        lug.position.set(Math.cos(angle) * 0.22, Math.sin(angle) * 0.22, 0)
        wheelGroup.add(lug)
      }

      truckGroup.add(wheelGroup)
      wheels.push(wheelGroup)
    }

    // Front Wheels
    createWheel(1.22, 0.88)
    createWheel(1.22, -0.88)
    // Rear Wheels (Heavy-duty dual set)
    createWheel(-1.18, 0.88)
    createWheel(-1.18, -0.88)

    // --- 6. FLOATING ORBITING SCRAP HERO BADGES ---
    // Floating Cardboard Carton
    const floatBoxGroup = new THREE.Group()
    floatBoxGroup.position.set(-2.8, 2.2, 1.8)
    const fBox = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.65), cardboardMat)
    fBox.castShadow = true
    floatBoxGroup.add(fBox)
    // Eco Tape strip
    const tape = new THREE.Mesh(
      new THREE.BoxGeometry(0.66, 0.14, 0.66),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.3 })
    )
    floatBoxGroup.add(tape)
    rootGroup.add(floatBoxGroup)

    // Floating Soda Can (Aluminium)
    const canGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.58, 20)
    const canMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.88,
      roughness: 0.15,
    })
    const can = new THREE.Mesh(canGeo, canMat)
    can.position.set(2.8, 1.4, -2.2)
    can.rotation.z = 0.35
    can.rotation.x = -0.2
    rootGroup.add(can)

    // Floating Glowing Copper Torus
    const copperGeo = new THREE.TorusGeometry(0.38, 0.12, 16, 32)
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xc2410c,
      emissiveIntensity: 0.45,
    })
    const copper = new THREE.Mesh(copperGeo, copperMat)
    copper.position.set(-2.6, 1.8, -2.0)
    rootGroup.add(copper)

    // Floating Emerald Bottle (Glass)
    const bottleGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.62, 16)
    const bottleMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.82,
    })
    const bottle = new THREE.Mesh(bottleGeo, bottleMat)
    bottle.position.set(3.0, 2.0, 1.4)
    bottle.rotation.z = -0.25
    rootGroup.add(bottle)

    // 7. Ambient Sparkle & Dust Particle Cloud
    const particleCount = 60
    const particleGeo = new THREE.BufferGeometry()
    const particlePos = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 11
      particlePos[i * 3 + 1] = Math.random() * 5 + 0.2
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 11
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3))

    const particleMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.08,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // --- 8. "COMES OUT TOWARDS SCREEN" ENTRANCE ANIMATION CONTROLLER ---
    let startTime = performance.now()
    let isEntranceComplete = false

    // Function to trigger or replay the cinematic drive-out reveal
    const triggerDriveOut = () => {
      startTime = performance.now()
      isEntranceComplete = false
      // Reset position deep in Z-depth (behind the scene)
      truckGroup.position.set(-1.2, 0.15, -16.0)
      truckGroup.scale.set(0.3, 0.3, 0.3)
      truckGroup.rotation.y = 0.55

      // Dim floating items initially
      floatBoxGroup.scale.setScalar(0.01)
      can.scale.setScalar(0.01)
      copper.scale.setScalar(0.01)
      bottle.scale.setScalar(0.01)
    }

    // Connect replay trigger
    replayTriggerRef.current = triggerDriveOut
    triggerDriveOut()
    setIsReady(true)

    // 9. Interactive Pointer Drag & Touch 360° Controls
    let isDragging = false
    let prevPointerX = 0
    let prevPointerY = 0
    let dragVelocityX = 0
    let targetTiltX = 0
    let targetTiltY = 0

    const onPointerDown = (clientX: number, clientY: number) => {
      isDragging = true
      prevPointerX = clientX
      prevPointerY = clientY
      dragVelocityX = 0
    }

    const onPointerMove = (clientX: number, clientY: number) => {
      if (isDragging) {
        const deltaX = clientX - prevPointerX
        const deltaY = clientY - prevPointerY
        prevPointerX = clientX
        prevPointerY = clientY

        rootGroup.rotation.y += deltaX * 0.009
        dragVelocityX = deltaX * 0.009

        // Subtle vertical pitch tilt
        targetTiltX = Math.max(-0.25, Math.min(0.25, targetTiltX + deltaY * 0.005))
      } else {
        // Interactive cursor hover parallax
        const rect = mount.getBoundingClientRect()
        const nx = ((clientX - rect.left) / rect.width) * 2 - 1
        const ny = -(((clientY - rect.top) / rect.height) * 2 - 1)
        targetTiltY = nx * 0.18
        targetTiltX = -ny * 0.12
      }
    }

    const onPointerUp = () => {
      isDragging = false
    }

    const handleMouseDown = (e: MouseEvent) => onPointerDown(e.clientX, e.clientY)
    const handleMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY)
    const handleMouseUp = () => onPointerUp()

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY)
      }
    }
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }
    const handleTouchEnd = () => onPointerUp()

    mount.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    mount.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd)

    // 10. High-Fidelity Animation Loop
    let animId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const now = performance.now()
      const elapsed = clock.getElapsedTime()
      const animTime = (now - startTime) / 1000 // seconds

      // === STAGE 1: CINEMATIC "DRIVES OUT OF SCREEN" POP-OUT ===
      if (!isEntranceComplete) {
        const driveDuration = 2.2 // seconds
        const t = Math.min(1, animTime / driveDuration)

        // Custom Quintic Ease-Out curve for high-speed forward rush & smooth brake
        // f(t) = 1 - (1 - t)^4
        const easeOut = 1 - Math.pow(1 - t, 4)

        // Truck surges from far back (z: -16) to right in front of user (z: +0.25)
        const currentZ = -16.0 + easeOut * 16.25
        truckGroup.position.z = currentZ

        // Truck expands into view: scale surges from 0.3 to 1.05 for real pop-out
        const currentScale = 0.3 + easeOut * 0.75
        truckGroup.scale.set(currentScale, currentScale, currentScale)

        // As it charges forward, steer into 3/4 beauty angle
        truckGroup.rotation.y = 0.55 - easeOut * 0.15

        // Fast wheel spinning during entrance
        const spinSpeed = (1 - easeOut * 0.75) * 0.55
        wheels.forEach((w) => {
          w.rotation.x -= spinSpeed
        })

        // Front suspension brake compression: nose dips down as it brakes into foreground
        if (t > 0.65 && t < 0.95) {
          const brakeDip = Math.sin(((t - 0.65) / 0.3) * Math.PI) * 0.08
          truckGroup.rotation.z = -brakeDip
        } else {
          truckGroup.rotation.z = 0
        }

        // Floating scrap items expand outward into orbiting orbit
        floatBoxGroup.scale.setScalar(Math.min(1, easeOut * 1.1))
        can.scale.setScalar(Math.min(1, easeOut * 1.1))
        copper.scale.setScalar(Math.min(1, easeOut * 1.1))
        bottle.scale.setScalar(Math.min(1, easeOut * 1.1))

        if (t >= 1) {
          isEntranceComplete = true
        }
      } else {
        // Continuous gentle wheel roll
        wheels.forEach((w) => {
          w.rotation.x -= 0.04
        })
      }

      // === STAGE 2: INERTIAL ROTATION & SHOWCASE PHYSICS ===
      if (!isDragging) {
        dragVelocityX *= 0.94
        // Slow continuous turntable orbit
        rootGroup.rotation.y += dragVelocityX + 0.0028
        // Smooth tilt interpolation
        rootGroup.rotation.x += (targetTiltX - rootGroup.rotation.x) * 0.05
        rootGroup.rotation.z += (targetTiltY - rootGroup.rotation.z) * 0.05
      }

      // Idle Suspension Breathing (subtle organic float)
      truckGroup.position.y = 0.15 + Math.sin(elapsed * 2.6) * 0.035

      // Floating items orbital waves
      floatBoxGroup.position.y = 2.2 + Math.sin(elapsed * 1.8) * 0.18
      floatBoxGroup.rotation.y += 0.012
      floatBoxGroup.rotation.x = Math.sin(elapsed * 1.2) * 0.1

      can.position.y = 1.4 + Math.cos(elapsed * 2.2) * 0.16
      can.rotation.y += 0.02
      can.rotation.z = 0.35 + Math.sin(elapsed * 1.5) * 0.08

      copper.position.y = 1.8 + Math.sin(elapsed * 1.6 + 1.2) * 0.15
      copper.rotation.z += 0.018

      bottle.position.y = 2.0 + Math.cos(elapsed * 1.9 + 0.6) * 0.14
      bottle.rotation.y += 0.015

      // Particle system continuous drift
      particles.rotation.y = elapsed * 0.03
      particles.rotation.x = Math.sin(elapsed * 0.02) * 0.05

      // Glowing Neon Energy Pulse
      neonRing.scale.setScalar(1 + Math.sin(elapsed * 2.4) * 0.03)

      renderer.render(scene, camera)
    }

    animate()

    // 11. Responsive Resize Handler
    const handleResize = () => {
      if (!mount) return
      const nw = mount.clientWidth
      const nh = mount.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
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
    <div className={`relative w-full h-full min-h-[340px] sm:min-h-[420px] lg:min-h-[480px] xl:min-h-[520px] flex items-center justify-center select-none overflow-hidden ${className}`}>
      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        aria-label="3D Interactive Scrap Collection Truck – Driving towards you"
      />

      {/* Interactive Controls Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white tracking-wider uppercase shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-action-orange animate-pulse" />
        <span>3D Real Truck • Arrives at Doorstep</span>
      </div>

      <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="text-[11px] font-medium text-white/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-sm">
          ↺ Drag or swipe 360° to inspect
        </div>

        {isReady && (
          <button
            type="button"
            onClick={() => replayTriggerRef.current()}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-green hover:bg-primary-green-dark text-white text-[11px] font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
            title="Drive truck out towards screen again"
          >
            <RotateCw className="w-3 h-3" />
            <span>Drive Out 3D</span>
          </button>
        )}
      </div>
    </div>
  )
}
