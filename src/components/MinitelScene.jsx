import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import '../styles/MinitelScene.css'

export default function MinitelScene({ onComplete }) {
  const containerRef = useRef(null)
  const scrollTarget = useRef(0)
  const scrollCurrent = useRef(0)
  const completed = useRef(false)

  useEffect(() => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.9))
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5)
    dirLight.position.set(5, 5, 5)
    scene.add(dirLight)

    const loader = new GLTFLoader()
    loader.load(
      '/Minitel.glb',
      (gltf) => {
        const minitel = gltf.scene
        minitel.scale.set(4, 4, 4)
        minitel.position.set(0, -0.1, 0)
        scene.add(minitel)
      },
      undefined,
      (error) => console.error('Erreur chargement modèle:', error)
    )

    const handleWheel = (e) => {
      scrollTarget.current += e.deltaY * 0.0003
      scrollTarget.current = Math.max(0, Math.min(1, scrollTarget.current))
    }

    // Support tactile mobile
    let touchStartY = 0
    const handleTouchStart = (e) => { touchStartY = e.touches[0].clientY }
    const handleTouchMove = (e) => {
      const delta = touchStartY - e.touches[0].clientY
      touchStartY = e.touches[0].clientY
      scrollTarget.current += delta * 0.0006
      scrollTarget.current = Math.max(0, Math.min(1, scrollTarget.current))
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    const lerp = (a, b, t) => a + (b - a) * t
    const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

    const RADIUS = 4

    const animate = () => {
      requestAnimationFrame(animate)

      scrollCurrent.current = lerp(scrollCurrent.current, scrollTarget.current, 0.06)
      const p = scrollCurrent.current

      // Phase 1 (0 → 0.5) : orbite 360° autour du Minitel
      if (p <= 0.5) {
        const t = easeInOut(p / 0.5)
        const angle = t * Math.PI * 2
        camera.position.set(
          Math.sin(angle) * RADIUS,
          0.3,
          Math.cos(angle) * RADIUS
        )
        camera.lookAt(0, 0, 0)
      }
      // Phase 2 (0.5 → 1) : monte + zoom vers l'écran
      else {
        const t = easeInOut((p - 0.5) / 0.5)
        camera.position.set(
          0,
          lerp(0.3, 0.86, t),
          lerp(RADIUS, 0, t)
        )
        camera.lookAt(0, 0, 0)
      }

      // Déclenche la transition quand on arrive dans l'écran
      if (p >= 0.98 && !completed.current) {
        completed.current = true
        onComplete?.()
      }

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('resize', handleResize)
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div className="minitel-scene-container">
      <div ref={containerRef} className="canvas-container" />
      <div className="scroll-hint">
        <span>↓ SCROLL ↓</span>
      </div>
    </div>
  )
}
