import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ScrapAuth3DProps {
  className?: string
}

export const ScrapAuth3D: React.FC<ScrapAuth3DProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const width = mount.clientWidth || 240
    const height = mount.clientHeight || 150

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(0, 1.2, 4.5)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.0)
    scene.add(ambient)

    const direct = new THREE.DirectionalLight(0x6ee7b7, 2.0)
    direct.position.set(3, 5, 4)
    scene.add(direct)

    const directOrange = new THREE.DirectionalLight(0xfb923c, 1.5)
    directOrange.position.set(-3, -2, 3)
    scene.add(directOrange)

    const rootGroup = new THREE.Group()
    scene.add(rootGroup)

    // 1. Central 3D Recycling Torus Ring
    const ringGeo = new THREE.TorusGeometry(1.0, 0.18, 16, 40)
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.25,
      metalness: 0.4,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    rootGroup.add(ring)

    // 2. Inner Glowing Eco Core
    const coreGeo = new THREE.IcosahedronGeometry(0.45, 1)
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xe87524,
      roughness: 0.3,
      metalness: 0.6,
      emissive: 0x9a3412,
      emissiveIntensity: 0.4,
    })
    const core = new THREE.Mesh(coreGeo, coreMat)
    rootGroup.add(core)

    // 3. Orbiting Scrap Cube (Paper / Cardboard)
    const cubeGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35)
    const cubeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 })
    const cube = new THREE.Mesh(cubeGeo, cubeMat)
    rootGroup.add(cube)

    // 4. Orbiting Metal Cylinder (Can)
    const cylGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.38, 16)
    const cylMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.85, roughness: 0.2 })
    const cyl = new THREE.Mesh(cylGeo, cylMat)
    rootGroup.add(cyl)

    // 5. Orbiting Glass/Plastic Sphere
    const sphereGeo = new THREE.SphereGeometry(0.18, 16, 16)
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
      metalness: 0.4,
    })
    const sphere = new THREE.Mesh(sphereGeo, sphereMat)
    rootGroup.add(sphere)

    let animId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      ring.rotation.x = Math.sin(t * 0.8) * 0.3
      ring.rotation.y = t * 0.6

      core.rotation.x = t * 0.9
      core.rotation.y = t * 1.1

      // Orbiting materials
      const r = 1.35
      cube.position.set(Math.cos(t * 1.5) * r, Math.sin(t * 1.5) * 0.5, Math.sin(t * 1.5) * r)
      cube.rotation.x += 0.02
      cube.rotation.y += 0.03

      cyl.position.set(Math.cos(t * 1.5 + 2.1) * r, Math.sin(t * 1.5 + 2.1) * 0.5, Math.sin(t * 1.5 + 2.1) * r)
      cyl.rotation.z += 0.03

      sphere.position.set(Math.cos(t * 1.5 + 4.2) * r, Math.sin(t * 1.5 + 4.2) * 0.5, Math.sin(t * 1.5 + 4.2) * r)

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      if (!mount) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    return () => {
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
      className={`w-full h-[150px] sm:h-[180px] flex items-center justify-center select-none overflow-hidden ${className}`}
      aria-label="3D Scrap Mitra Recycling Emblem"
    />
  )
}
