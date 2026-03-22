import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import '../styles/MinitelScene.css'

export default function MinitelScene({ onComplete, onNavigate }) {
  const containerRef  = useRef(null)
  const fadeRef       = useRef(null)
  const scrollTarget  = useRef(0)
  const scrollCurrent = useRef(0)
  const completed     = useRef(false)
  const progressBarRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.9
    containerRef.current.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.06))

    const keyLight = new THREE.DirectionalLight(0xfff0e0, 3.5)
    keyLight.position.set(4, 7, 3)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(2048, 2048)
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 30
    keyLight.shadow.radius = 8
    keyLight.shadow.bias = -0.001
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xa0c0ff, 0.4)
    fillLight.position.set(-4, -2, 2)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6)
    rimLight.position.set(0, 3, -5)
    scene.add(rimLight)

    const loader = new GLTFLoader()
    loader.load(
      '/Minitel.glb',
      (gltf) => {
        const minitel = gltf.scene
        minitel.scale.set(4, 4, 4)
        minitel.position.set(0, -0.1, 0)
        minitel.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true
            node.receiveShadow = true
          }
        })
        scene.add(minitel)
      },
      undefined,
      (error) => console.error('Erreur chargement modèle:', error)
    )

    const handleWheel = (e) => {
      scrollTarget.current += e.deltaY * 0.00025
      scrollTarget.current = Math.max(0, Math.min(1, scrollTarget.current))
    }

    let touchStartY = 0
    const handleTouchStart = (e) => { touchStartY = e.touches[0].clientY }
    const handleTouchMove = (e) => {
      const delta = touchStartY - e.touches[0].clientY
      touchStartY = e.touches[0].clientY
      scrollTarget.current += delta * 0.0005
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

    const lerp    = (a, b, t) => a + (b - a) * t
    const clamp01 = (t) => Math.max(0, Math.min(1, t))
    const easeInOut  = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    const easeInOut3 = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    // Seuils
    const ORBIT_END  = 0.62   // fin de l'orbite 360°
    const FADE_START = 0.84   // début du fondu noir
    const FADE_END   = 0.96   // entièrement noir → transition

    const RADIUS = 4.7

    // Position de départ : directement en face
    camera.position.set(0, 1.6, RADIUS)
    camera.lookAt(0, 0.2, 0)

    const animate = () => {
      requestAnimationFrame(animate)

      scrollCurrent.current = lerp(scrollCurrent.current, scrollTarget.current, 0.05)
      const p = scrollCurrent.current

      // Barre de progression
      if (progressBarRef.current) {
        const barP = clamp01(p / FADE_START)
        progressBarRef.current.style.transform = `scaleX(${barP})`
      }

      // Fondu noir
      const fadeT = clamp01((p - FADE_START) / (FADE_END - FADE_START))
      if (fadeRef.current) {
        fadeRef.current.style.opacity = fadeT
      }

      if (fadeT >= 1 && !completed.current) {
        completed.current = true
        onComplete?.()
      }

      // Phase 1 (0 → ORBIT_END) : orbite 360° autour du Minitel
      if (p <= ORBIT_END) {
        const t = easeInOut(p / ORBIT_END)
        // Démarre en face (2*PI = 0), fait un tour complet, revient en face (0)
        const angle = lerp(Math.PI * 2, 0, t)
        const camY  = lerp(1.8, 0.9, t)   // descend progressivement pendant l'orbite
        const lookY = lerp(0.2, 0.35, t)

        camera.position.set(Math.sin(angle) * RADIUS, camY, Math.cos(angle) * RADIUS)
        camera.lookAt(0, lookY, 0)
      }
      // Phase 2 (ORBIT_END → FADE_END) : dolly droit dans l'écran
      else {
        const t = easeInOut3(clamp01((p - ORBIT_END) / (FADE_END - ORBIT_END)))
        const camZ  = lerp(RADIUS, 1.0, t)
        const camY  = lerp(0.9, 0.5, t)
        const lookY = lerp(0.35, 0.5, t)

        camera.position.set(0, camY, camZ)
        camera.lookAt(0, lookY, 0)
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

      {/* Fondu noir avant transition */}
      <div className="scene-fade" ref={fadeRef} />

      {/* Backdrop — toujours dans le DOM, opacity pilotée par CSS */}
      <div
        className={`scene-menu-backdrop ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Wrapper unique qui s'étend */}
      <div className={`scene-nav-wrapper ${menuOpen ? 'open' : ''}`}>

        {/* Barre toujours visible */}
        <div className="scene-nav">
          <div className="scene-nav__logo">
            <span className="scene-nav__logo-text">ministory</span>
          </div>

          <div className="scene-nav__links">
            <button className="scene-nav__link" onClick={() => onNavigate?.(1)}>1974</button>
            <button className="scene-nav__link" onClick={() => onNavigate?.(2)}>1977</button>
            <button className="scene-nav__link" onClick={() => onNavigate?.(3)}>1980</button>
            <button className="scene-nav__link" onClick={() => onNavigate?.(4)}>1986</button>
            <button className="scene-nav__link" onClick={() => onNavigate?.(5)}>1993</button>
            <button className="scene-nav__link" onClick={() => onNavigate?.(6)}>2001</button>
            <button className="scene-nav__link" onClick={() => onNavigate?.(7)}>2012</button>
          </div>

          <button className="scene-nav__cta" onClick={() => onComplete?.()}>Explorer</button>

          <button className="scene-nav__burger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <span className={`burger-line ${menuOpen ? 'open' : ''}`} />
            <span className={`burger-line ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>

        {/* Contenu du menu — révélé par l'extension du wrapper */}
        <div className="scene-nav-menu">
          <nav className="scene-nav-menu__links">
            <button className="scene-nav-menu__link" onClick={() => { setMenuOpen(false); onNavigate?.(1) }}>1974</button>
            <button className="scene-nav-menu__link" onClick={() => { setMenuOpen(false); onNavigate?.(2) }}>1977</button>
            <button className="scene-nav-menu__link" onClick={() => { setMenuOpen(false); onNavigate?.(3) }}>1980</button>
            <button className="scene-nav-menu__link" onClick={() => { setMenuOpen(false); onNavigate?.(4) }}>1986</button>
            <button className="scene-nav-menu__link" onClick={() => { setMenuOpen(false); onNavigate?.(5) }}>1993</button>
            <button className="scene-nav-menu__link" onClick={() => { setMenuOpen(false); onNavigate?.(6) }}>2001</button>
            <button className="scene-nav-menu__link" onClick={() => { setMenuOpen(false); onNavigate?.(7) }}>2012</button>
          </nav>
          <div className="scene-nav-menu__divider" />
          <button className="scene-nav-menu__cta" onClick={() => { setMenuOpen(false); onComplete?.() }}>Explorer</button>
        </div>

      </div>

      <div className="scene-progress">
        <div className="scene-progress__track">
          <div className="scene-progress__bar" ref={progressBarRef} />
        </div>
      </div>
    </div>
  )
}
