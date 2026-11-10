import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RotateCw, Lightbulb, Gauge, Trees, Wind } from 'lucide-react'

interface ScrapHero3DProps {
  className?: string
}

export const ScrapHero3D: React.FC<ScrapHero3DProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [speedKmh, setSpeedKmh] = useState(45)
  const [isBoosting, setIsBoosting] = useState(false)
  const [headlightsOn, setHeadlightsOn] = useState(true)

  // Ref callbacks for outside-loop interactions
  const triggerBoostRef = useRef<() => void>(() => {})
  const toggleHeadlightsRef = useRef<() => void>(() => {})

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const width = mount.clientWidth || 560
    const height = mount.clientHeight || 460

    // 1. Scene & Deep Atmospheric Fog
    const scene = new THREE.Scene()
    // Emerald fog seamlessly blends highway into the hero banner background
    scene.fog = new THREE.Fog(0x022c1d, 16, 52)

    // 2. Dynamic 3D Chase Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(2.6, 2.3, 6.8)
    camera.lookAt(0, 0.9, -3.5)

    // 3. WebGL Renderer
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

    // 4. Lighting: Golden Sunlight & Forest Atmosphere
    const ambientLight = new THREE.AmbientLight(0xdcfce7, 1.4)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xfef3c7, 3.2)
    sunLight.position.set(12, 18, 10)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 1024
    sunLight.shadow.mapSize.height = 1024
    sunLight.shadow.bias = -0.0003
    scene.add(sunLight)

    const forestBacklight = new THREE.DirectionalLight(0x10b981, 1.8)
    forestBacklight.position.set(-10, 8, -15)
    scene.add(forestBacklight)

    // 5. MOVING HIGHWAY ROADWAY & GRASS CURBS
    const roadGroup = new THREE.Group()
    scene.add(roadGroup)

    // Asphalt Main Surface
    const roadGeo = new THREE.PlaneGeometry(6.4, 80)
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x18201a,
      roughness: 0.85,
      metalness: 0.1,
    })
    const road = new THREE.Mesh(roadGeo, roadMat)
    road.rotation.x = -Math.PI / 2
    road.position.set(0, 0, -15)
    road.receiveShadow = true
    roadGroup.add(road)

    // Green Grass Verges (Left & Right)
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x0f3e2a,
      roughness: 0.9,
    })

    const grassLeft = new THREE.Mesh(new THREE.PlaneGeometry(12, 80), grassMat)
    grassLeft.rotation.x = -Math.PI / 2
    grassLeft.position.set(-9.2, -0.02, -15)
    grassLeft.receiveShadow = true
    roadGroup.add(grassLeft)

    const grassRight = new THREE.Mesh(new THREE.PlaneGeometry(12, 80), grassMat)
    grassRight.rotation.x = -Math.PI / 2
    grassRight.position.set(9.2, -0.02, -15)
    grassRight.receiveShadow = true
    roadGroup.add(grassRight)

    // Scrolling Center Dashed Road Lines
    const dashLines: THREE.Mesh[] = []
    const dashGeo = new THREE.PlaneGeometry(0.18, 2.2)
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 }) // Yellow Center Stripe

    for (let i = 0; i < 16; i++) {
      const dash = new THREE.Mesh(dashGeo, dashMat)
      dash.rotation.x = -Math.PI / 2
      dash.position.set(0, 0.015, -45 + i * 5)
      roadGroup.add(dash)
      dashLines.push(dash)
    }

    // White Outer Shoulder Stripes
    const whiteLineGeo = new THREE.PlaneGeometry(0.12, 80)
    const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 })
    const lineLeft = new THREE.Mesh(whiteLineGeo, whiteLineMat)
    lineLeft.rotation.x = -Math.PI / 2
    lineLeft.position.set(-3.0, 0.012, -15)
    const lineRight = new THREE.Mesh(whiteLineGeo, whiteLineMat)
    lineRight.rotation.x = -Math.PI / 2
    lineRight.position.set(3.0, 0.012, -15)
    roadGroup.add(lineLeft, lineRight)

    // 6. RUSHING 3D TREES & GREENERY (Lush Banyan / Tropical Forest)
    const trees: THREE.Group[] = []
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.9 })
    const foliageDarkMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.85 })
    const foliageMedMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.8 })
    const foliageLightMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.75 })

    const createTree = (side: 'left' | 'right', zPos: number) => {
      const tree = new THREE.Group()
      const xBase = side === 'left' ? -5.2 - Math.random() * 2.5 : 5.2 + Math.random() * 2.5
      tree.position.set(xBase, 0, zPos)

      // Trunk
      const trunkHeight = 3.2 + Math.random() * 1.5
      const trunkGeo = new THREE.CylinderGeometry(0.22, 0.35, trunkHeight, 10)
      const trunk = new THREE.Mesh(trunkGeo, treeTrunkMat)
      trunk.position.y = trunkHeight / 2
      trunk.castShadow = true
      tree.add(trunk)

      // Multi-Layered Lush Canopy (3 overlapping organic foliage spheres)
      const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6 + Math.random() * 0.4, 1), foliageDarkMat)
      crown1.position.y = trunkHeight + 0.6
      crown1.castShadow = true
      tree.add(crown1)

      const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4 + Math.random() * 0.3, 1), foliageMedMat)
      crown2.position.set(0.4, trunkHeight + 1.2, 0.2)
      crown2.castShadow = true
      tree.add(crown2)

      const crown3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1 + Math.random() * 0.3, 1), foliageLightMat)
      crown3.position.set(-0.3, trunkHeight + 1.8, -0.2)
      crown3.castShadow = true
      tree.add(crown3)

      scene.add(tree)
      trees.push(tree)
    }

    // Populate 28 trees lining both sides of the roadway
    for (let i = 0; i < 14; i++) {
      createTree('left', -50 + i * 5.2)
      createTree('right', -48 + i * 5.2)
    }

    // 7. DRIFTING GREEN LEAF PARTICLES IN THE WIND
    const leafCount = 35
    const leaves: THREE.Mesh[] = []
    const leafGeo = new THREE.PlaneGeometry(0.18, 0.24)
    const leafMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    })

    for (let i = 0; i < leafCount; i++) {
      const leaf = new THREE.Mesh(leafGeo, leafMat)
      leaf.position.set((Math.random() - 0.5) * 8, 0.8 + Math.random() * 3.5, -40 + Math.random() * 45)
      leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      scene.add(leaf)
      leaves.push(leaf)
    }

    // 8. THE REALISTIC SCRAP MITRA COMMERCIAL TRUCK (Tata Ace Style)
    const truckRoot = new THREE.Group()
    scene.add(truckRoot)
    truckRoot.position.set(0, 0, 0)

    const truckBody = new THREE.Group()
    truckRoot.add(truckBody)

    // Materials
    const emeraldCabMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Metallic Emerald Green
      metalness: 0.45,
      roughness: 0.18,
    })

    const chassisSteelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.65,
      roughness: 0.55,
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
      roughness: 0.9,
      metalness: 0.08,
    })

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.05,
      metalness: 0.92,
      transparent: true,
      opacity: 0.85,
    })

    // Chassis Frame
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.22, 3.9), chassisSteelMat)
    chassis.position.set(0, 0.52, 0)
    chassis.castShadow = true
    truckBody.add(chassis)

    // Exhaust Pipe with Chrome Tip
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 12), chromeMat)
    exhaust.rotation.x = Math.PI / 2
    exhaust.position.set(0.88, 0.4, 0.3)
    truckBody.add(exhaust)

    // Commercial Cab Body (Lower & Sloped Upper)
    const cabLower = new THREE.Mesh(new THREE.BoxGeometry(1.64, 1.15, 1.35), emeraldCabMat)
    cabLower.position.set(0, 1.1, -1.25)
    cabLower.castShadow = true
    truckBody.add(cabLower)

    const cabUpper = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.42, 1.1), emeraldCabMat)
    cabUpper.position.set(0, 1.8, -1.15)
    cabUpper.castShadow = true
    truckBody.add(cabUpper)

    // Curved Windshield
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.68, 0.06), glassMat)
    windshield.position.set(0, 1.42, -1.94)
    windshield.rotation.x = 0.2
    truckBody.add(windshield)

    // Dual Wiper Blades
    const wiperMat = new THREE.MeshStandardMaterial({ color: 0x0f172a })
    const wiperL = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.03), wiperMat)
    wiperL.position.set(-0.32, 1.3, -1.98)
    wiperL.rotation.z = -0.5
    const wiperR = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.03), wiperMat)
    wiperR.position.set(0.32, 1.3, -1.98)
    wiperR.rotation.z = -0.5
    truckBody.add(wiperL, wiperR)

    // Chrome Radiator Grille & Gold Emblem
    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.42, 0.08), bumperMat)
    grille.position.set(0, 0.92, -1.96)
    truckBody.add(grille)

    for (let i = -0.12; i <= 0.12; i += 0.08) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.03, 0.09), chromeMat)
      slat.position.set(0, 0.92 + i, -1.97)
      truckBody.add(slat)
    }

    const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16), chromeMat)
    badge.rotation.x = Math.PI / 2
    badge.position.set(0, 0.92, -2.01)
    truckBody.add(badge)

    // Front Bumper with Fog Lamps
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.32, 0.22), bumperMat)
    bumper.position.set(0, 0.46, -1.96)
    bumper.castShadow = true
    truckBody.add(bumper)

    // License Plate "AP 16 TX 4920" (Vijayawada)
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.14, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 })
    )
    plate.position.set(0, 0.42, -2.09)
    truckBody.add(plate)

    // Dual Headlights & Volumetric Beam Cones
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 4.0,
    })

    const lightConeMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const headlightCones: THREE.Mesh[] = []

    const addHeadlight = (xPos: number) => {
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 16), headlightMat)
      lens.rotation.x = Math.PI / 2
      lens.position.set(xPos, 0.88, -2.0)
      truckBody.add(lens)

      // Active Beam Cone projected forward onto the asphalt road
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.7, 5.2, 20, 1, true), lightConeMat)
      cone.rotation.x = Math.PI / 2 - 0.12
      cone.position.set(xPos, 0.65, -4.6)
      truckBody.add(cone)
      headlightCones.push(cone)
    }

    addHeadlight(-0.62)
    addHeadlight(0.62)

    // Side Mirrors on Extended Arms
    const mirrorArmMat = new THREE.MeshStandardMaterial({ color: 0x1f2937 })
    const addMirror = (xPos: number) => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.36, 8), mirrorArmMat)
      arm.rotation.z = xPos > 0 ? -Math.PI / 3 : Math.PI / 3
      arm.position.set(xPos > 0 ? 0.95 : -0.95, 1.4, -1.68)
      truckBody.add(arm)

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.32, 0.08), bumperMat)
      head.position.set(xPos > 0 ? 1.12 : -1.12, 1.44, -1.68)
      truckBody.add(head)
    }
    addMirror(1)
    addMirror(-1)

    // High-Sided Steel Scrap Cargo Bed
    const cargoBed = new THREE.Group()
    truckBody.add(cargoBed)

    const bedFloor = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.12, 2.45), chassisSteelMat)
    bedFloor.position.set(0, 0.65, 0.72)
    bedFloor.castShadow = true
    cargoBed.add(bedFloor)

    // Corrugated Side Walls
    const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.95, 2.45), emeraldCabMat)
    wallL.position.set(-0.84, 1.15, 0.72)
    wallL.castShadow = true
    cargoBed.add(wallL)

    const wallR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.95, 2.45), emeraldCabMat)
    wallR.position.set(0.84, 1.15, 0.72)
    wallR.castShadow = true
    cargoBed.add(wallR)

    const tailgate = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.95, 0.08), emeraldCabMat)
    tailgate.position.set(0, 1.15, 1.94)
    tailgate.castShadow = true
    cargoBed.add(tailgate)

    // Yellow & Green Reflective Safety Hazard Stripes
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    for (let z = -0.3; z <= 1.6; z += 0.35) {
      const sL = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.08, 0.18), stripeMat)
      sL.position.set(-0.885, 0.72, z)
      sL.rotation.y = 0.3
      cargoBed.add(sL)

      const sR = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.08, 0.18), stripeMat)
      sR.position.set(0.885, 0.72, z)
      sR.rotation.y = -0.3
      cargoBed.add(sR)
    }

    // REALISTIC RECYCLABLE SCRAP PAYLOAD (Stacked in bed)
    const cardboardMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 })
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 })
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xea580c, metalness: 0.9, roughness: 0.25 })
    const aluMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.92, roughness: 0.15 })

    // Cardboard boxes
    const box1 = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.55, 0.65), cardboardMat)
    box1.position.set(-0.3, 1.0, 0.4)
    box1.rotation.y = 0.15
    box1.castShadow = true
    cargoBed.add(box1)

    const box2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.48, 0.6), cardboardMat)
    box2.position.set(0.3, 0.95, 1.15)
    box2.rotation.y = -0.2
    box2.castShadow = true
    cargoBed.add(box2)

    // Tied Newspapers bundle
    const bundle = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.38, 0.75), paperMat)
    bundle.position.set(0.35, 0.9, 0.35)
    bundle.rotation.y = -0.1
    bundle.castShadow = true
    cargoBed.add(bundle)

    // Copper Coil on top
    const copperCoil = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.07, 14, 28), copperMat)
    copperCoil.rotation.x = Math.PI / 2 - 0.2
    copperCoil.position.set(-0.25, 1.4, 0.4)
    cargoBed.add(copperCoil)

    // Aluminum extruded pipes
    for (let i = 0; i < 3; i++) {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 12), aluMat)
      pipe.rotation.x = Math.PI / 2 + 0.1 * (i - 1)
      pipe.position.set(0.1 + i * 0.15, 1.25 + i * 0.05, 0.8)
      cargoBed.add(pipe)
    }

    // 4 HIGH-SPEED SPINNING COMMERCIAL WHEELS
    const wheels: THREE.Group[] = []
    const frontWheelPivots: THREE.Group[] = []

    const createWheel = (xPos: number, zPos: number, isFront: boolean) => {
      const pivot = new THREE.Group()
      pivot.position.set(xPos, 0.5, zPos)
      truckBody.add(pivot)
      if (isFront) frontWheelPivots.push(pivot)

      const wheelMesh = new THREE.Group()
      pivot.add(wheelMesh)
      wheels.push(wheelMesh)

      // Rubber Tire with tread rim
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.3, 24), rubberMat)
      tire.rotation.z = Math.PI / 2
      tire.castShadow = true
      wheelMesh.add(tire)

      // Chrome Rim
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.31, 20), chromeMat)
      rim.rotation.z = Math.PI / 2
      wheelMesh.add(rim)

      // Hubcap & Lug Nuts
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.33, 12), chassisSteelMat)
      hub.rotation.z = Math.PI / 2
      wheelMesh.add(hub)

      for (let i = 0; i < 5; i++) {
        const ang = (i * Math.PI * 2) / 5
        const lug = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 6), chromeMat)
        lug.rotation.z = Math.PI / 2
        lug.position.set(0, Math.cos(ang) * 0.2, Math.sin(ang) * 0.2)
        wheelMesh.add(lug)
      }
    }

    createWheel(-0.88, -1.22, true) // Front Left
    createWheel(0.88, -1.22, true)  // Front Right
    createWheel(-0.88, 1.18, false) // Rear Left
    createWheel(0.88, 1.18, false)  // Rear Right

    // 9. INTERACTIVE STEERING & MOTION PHYSICS
    let targetSteerX = 0
    let currentSteerX = 0
    let boostProgress = 0
    let isBoostingActive = false

    const handlePointerMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect()
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      targetSteerX = nx * 1.5 // Lane position between -1.5m and +1.5m
    }

    const handlePointerLeave = () => {
      targetSteerX = 0
    }

    mount.addEventListener('mousemove', handlePointerMove)
    mount.addEventListener('mouseleave', handlePointerLeave)

    // Touch support for steering
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = mount.getBoundingClientRect()
        const nx = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1
        targetSteerX = nx * 1.5
      }
    }
    mount.addEventListener('touchmove', handleTouchMove, { passive: true })

    // Boost Trigger function
    const triggerBoost = () => {
      isBoostingActive = true
      boostProgress = 0
      setIsBoosting(true)
      setSpeedKmh(72)
      setTimeout(() => {
        isBoostingActive = false
        setIsBoosting(false)
        setSpeedKmh(45)
      }, 2200)
    }

    triggerBoostRef.current = triggerBoost

    // Toggle Headlights function
    toggleHeadlightsRef.current = () => {
      headlightCones.forEach((c) => {
        c.visible = !c.visible
      })
      setHeadlightsOn(headlightCones[0].visible)
    }

    // 10. REAL-TIME 60 FPS DRIVING SIMULATION LOOP
    let animId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Base driving speed (surges during boost)
      let roadSpeed = 0.42
      if (isBoostingActive) {
        boostProgress += 0.02
        roadSpeed = 0.42 + Math.sin(Math.min(1, boostProgress) * Math.PI) * 0.55
      }

      // A. SCROLL ROAD DASHES (Creates true forward road motion!)
      dashLines.forEach((dash) => {
        dash.position.z += roadSpeed
        if (dash.position.z > 12) {
          dash.position.z -= 75
        }
      })

      // B. MOVE 3D TREES PAST TRUCK (Lush roadside forest rushes by!)
      trees.forEach((tree) => {
        tree.position.z += roadSpeed * 0.95
        if (tree.position.z > 12) {
          tree.position.z -= 72
        }
      })

      // C. DRIFT GREEN LEAVES
      leaves.forEach((leaf, idx) => {
        leaf.position.z += roadSpeed * 1.15
        leaf.position.y += Math.sin(elapsed * 2 + idx) * 0.015
        leaf.position.x += Math.cos(elapsed * 1.5 + idx) * 0.012
        leaf.rotation.x += 0.04
        leaf.rotation.y += 0.03
        if (leaf.position.z > 10) {
          leaf.position.z -= 55
          leaf.position.x = (Math.random() - 0.5) * 8
        }
      })

      // D. SPIN TRUCK WHEELS
      wheels.forEach((w) => {
        w.rotation.x -= roadSpeed * 2.2
      })

      // E. INTERACTIVE STEERING SMOOTHING
      currentSteerX += (targetSteerX - currentSteerX) * 0.08
      truckRoot.position.x = currentSteerX

      // Steer front wheels towards turn direction
      const steerAngle = (targetSteerX - currentSteerX) * 0.6
      frontWheelPivots.forEach((p) => {
        p.rotation.y = -steerAngle
      })

      // Vehicle Chassis Body Roll & Banking
      truckBody.rotation.z = -steerAngle * 0.22
      truckBody.rotation.y = steerAngle * 0.15

      // F. SUSPENSION BUMP & VIBRATION PHYSICS
      const suspensionBob = Math.sin(elapsed * 14) * 0.012 + Math.sin(elapsed * 7) * 0.018
      truckBody.position.y = suspensionBob
      truckBody.rotation.x = Math.sin(elapsed * 12) * 0.008

      // G. "DRIVE OUT TOWARDS SCREEN" FORWARD ACCELERATION
      if (isBoostingActive) {
        // Truck charges forward in Z towards camera!
        const surgeZ = Math.sin(Math.min(1, boostProgress) * Math.PI) * 1.8
        truckRoot.position.z = surgeZ
        // Dynamic camera tracking
        camera.position.y = 2.3 + Math.sin(boostProgress * Math.PI) * 0.2
      } else {
        truckRoot.position.z += (0 - truckRoot.position.z) * 0.1
        camera.position.y += (2.3 - camera.position.y) * 0.05
      }

      renderer.render(scene, camera)
    }

    animate()

    // Resize Handler
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
      mount.removeEventListener('mousemove', handlePointerMove)
      mount.removeEventListener('mouseleave', handlePointerLeave)
      mount.removeEventListener('touchmove', handleTouchMove)
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
      className={`relative w-full h-full min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] xl:min-h-[560px] flex items-center justify-center select-none overflow-hidden ${className}`}
      aria-label="Real 3D Interactive Scrap Collection Truck driving actively along a road surrounded by lush trees"
    >
      {/* 3D WebGL Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full flex items-center justify-center cursor-ew-resize active:cursor-grabbing"
      />

      {/* Top Floating Badge: Eco Avenue Status */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white tracking-wider uppercase shadow-xl">
          <Trees className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Vijayawada Tree Avenue • AP 16 TX 4920</span>
        </div>

        {/* Live Driving Speedometer */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white shadow-xl">
          <Gauge className="w-3.5 h-3.5 text-action-orange" />
          <span>{speedKmh} km/h</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
        </div>
      </div>

      {/* Bottom Floating Interactive Toolbar */}
      <div className="absolute bottom-3 inset-x-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="text-[11px] font-medium text-white/80 bg-black/55 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-md">
          ↔ Move mouse left/right to steer truck across lanes
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Toggle Headlights Button */}
          <button
            type="button"
            onClick={() => toggleHeadlightsRef.current()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-md transition-all cursor-pointer active:scale-95 border ${
              headlightsOn
                ? 'bg-amber-400 text-black border-amber-300 shadow-amber-500/30'
                : 'bg-black/50 text-white/80 border-white/15 hover:bg-black/70'
            }`}
            title="Toggle Truck Headlight Beams"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{headlightsOn ? 'Beams ON' : 'Beams OFF'}</span>
          </button>

          {/* Drive Out / Boost Button */}
          <button
            type="button"
            onClick={() => triggerBoostRef.current()}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white text-[11px] font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20 ${
              isBoosting
                ? 'bg-action-orange animate-pulse'
                : 'bg-primary-green hover:bg-primary-green-dark'
            }`}
            title="Accelerate truck forward towards screen"
          >
            {isBoosting ? <Wind className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
            <span>{isBoosting ? 'Zooming Out!' : 'Drive Out 3D'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
