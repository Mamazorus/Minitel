import { useState, useEffect, useRef } from 'react'
import './App.css'

// ── Minitel 8-color palette ────────────────────────────────────
const COLOR_MAP = {
  NOIR:    { display: '#333333', swatch: '#111111' },
  ROUGE:   { display: '#ff4040', swatch: '#ff0000' },
  VERT:    { display: '#00ff00', swatch: '#00ff00' },
  JAUNE:   { display: '#ffff00', swatch: '#ffff00' },
  BLEU:    { display: '#4488ff', swatch: '#0000ff' },
  MAGENTA: { display: '#ff44ff', swatch: '#ff00ff' },
  CYAN:    { display: '#00ffff', swatch: '#00ffff' },
  BLANC:   { display: '#ffffff', swatch: '#ffffff' },
}

// ── Page content data ──────────────────────────────────────────
const PAGES = [
  {
    id: 0,
    yearLabel: '1974',
    displayDate: '1970 — 1974',
    title: 'LA NAISSANCE\nDU MINITEL',
    lines: [
      'Depuis le debut des annees 1970,',
      'le Centre National des Etudes de',
      'Telecommunication (CNET) travaille',
      'à la modernisation du telephone',
      'français, à l\'invention et au test',
      'de nouvelles fonctionnalites.',
    ],
    phase: 'mono',
  },
  {
    id: 1,
    yearLabel: '1978',
    displayDate: '1978 — 1980',
    title: 'L\'EXPERIENCE\nDE VELIZY',
    lines: [
      'Le gouvernement lance une experience',
      'grandeur nature à Velizy-Villacoublay.',
      '',
      '2 500 foyers volontaires reçoivent',
      'gratuitement un terminal Minitel.',
      'Pour la première fois, des familles',
      'ordinaires accèdent à des services',
      'en ligne depuis leur domicile :',
      '',
      '> annuaire electronique',
      '> meteo et actualites',
      '> messagerie et petites annonces',
      '',
      'Le bilan est sans appel — positif.',
    ],
    phase: 'mono',
  },
  {
    id: 2,
    yearLabel: '1982',
    displayDate: '1982',
    title: 'LE LANCEMENT\nOFFICIEL',
    lines: [
      'Le 15 juin 1982, France Telecom',
      'deploie le Minitel à l\'echelle',
      'nationale. Chaque abonne au',
      'telephone peut obtenir un terminal',
      'gratuitement en echange de',
      'l\'annuaire papier.',
      '',
      'L\'annuaire electronique compte',
      'dejà 13 millions de numeros.',
      '',
      'C\'est la première infrastructure',
      'nationale de services en ligne',
      'au monde.',
    ],
    phase: 'mono',
  },
  {
    id: 3,
    yearLabel: '1985',
    displayDate: '1985 — 1991',
    title: 'L\'APOGEE\nDU RESEAU',
    lines: [
      'Le reseau Teletel compte plus de',
      '6 millions de terminaux actifs.',
      '25 000 services references.',
      '',
      '> 3614 ULLA  — rencontres',
      '> 3615 SNCF  — reservation trains',
      '> 3617 BANQUE — consultation compte',
      '> 3615 METEO — bulletins regionaux',
      '',
      'Le Minitel genère 7 milliards',
      'de francs de chiffre d\'affaires.',
      'La France est en avance',
      'sur le reste du monde.',
    ],
    phase: 'color',
  },
  {
    id: 4,
    yearLabel: '1996',
    displayDate: '1996 — 2000',
    title: 'INTERNET\nARRIVE',
    lines: [
      'Le World Wide Web debarque en',
      'France. Gratuit, ouvert, mondial.',
      '',
      'Le Minitel resiste : il reste',
      'plus simple, plus fiable,',
      'et son modèle de facturation',
      'à la minute est dejà rode.',
      '',
      'Mais les internautes augmentent',
      'chaque annee. Le combat est inegal.',
      '',
      '1999 : France Telecom lance',
      'le Minitel sur internet — trop tard.',
    ],
    phase: 'color',
  },
  {
    id: 5,
    yearLabel: '2012',
    displayDate: '30 juin 2012',
    title: 'EXTINCTION\nDU RESEAU',
    lines: [
      'À minuit, France Telecom coupe',
      'les derniers serveurs Teletel.',
      '',
      'Après 38 ans de service,',
      '9 millions de terminaux deployes',
      'et plus de 26 000 services crees,',
      'le Minitel s\'eteint definitivement.',
      '',
      'Il aura precede Amazon, Google',
      'et Facebook de plus de 10 ans.',
      '',
      '> FIN DE SESSION',
      '> CONNEXION TERMINEE_',
    ],
    phase: 'mono',
  },
]

// ── CRT Overlay ────────────────────────────────────────────────
function CRTOverlay({ phase }) {
  const showFlicker = phase === 'mono' || phase === 'color'
  return (
    <div className="crt-overlay" aria-hidden="true">
      <div className="crt-scanlines" />
      <div className="crt-vignette" />
      {showFlicker && <div className="crt-glow" />}
      {showFlicker && <div className="crt-flicker" />}
      {/* Grain anime — feTurbulence avec seed qui change en continu */}
      <svg className="crt-grain" xmlns="http://www.w3.org/2000/svg">
        <filter id="grain-filter" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="3" stitchTiles="stitch">
            <animate
              attributeName="seed"
              values="0;17;53;8;91;34;72;45;26;63;11;88;50"
              dur="0.35s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-filter)" opacity="0.09" />
      </svg>
    </div>
  )
}

// ── Top Navigation ─────────────────────────────────────────────
function TopNav({ currentIdx, total, phase, onShowAll }) {
  return (
    <nav className={`top-nav phase-${phase}`}>
      <span className="page-counter">
        <span className="counter-label">Page</span>
        <span className="counter-num">{currentIdx + 1}/{total}</span>
      </span>
      <button className="all-pages-btn" onClick={onShowAll}>
        Toute les pages
      </button>
    </nav>
  )
}

// ── Timeline ───────────────────────────────────────────────────
function Timeline({ pages, currentIdx, phase, onNavigate }) {
  const timelineRef = useRef(null)

  useEffect(() => {
    const container = timelineRef.current
    const el = container?.querySelector('.active')
    if (!container || !el) return
    // Centre la touche active dans le carousel
    const scrollLeft = el.offsetLeft - container.clientWidth / 2 + el.offsetWidth / 2
    container.scrollTo({ left: scrollLeft, behavior: 'instant' })
  }, [currentIdx])

  return (
    <div className={`timeline phase-${phase}`} ref={timelineRef}>
      {pages.map((p, i) => (
        <button
          key={p.id}
          className={`timeline-item${i === currentIdx ? ' active' : ''}`}
          onClick={() => onNavigate(i)}
        >
          {p.yearLabel}
        </button>
      ))}
    </div>
  )
}

// ── Color Grid Line (8-color palette) ──────────────────────────
function ColorGridLine({ words }) {
  return (
    <span className="color-grid-line">
      {words.map((word) => {
        const col = COLOR_MAP[word] || { display: '#fff', swatch: '#fff' }
        return (
          <span key={word} className="color-item">
            <span
              className="color-swatch"
              style={{ background: col.swatch }}
            />
            <span className="color-word" style={{ color: col.display }}>
              {word}
            </span>
          </span>
        )
      })}
    </span>
  )
}

// ── Page Content with typewriter reveal ────────────────────────
function PageContent({ page, isActive }) {
  const [revealedChars, setRevealedChars] = useState(0)
  const timersRef = useRef([])
  const intervalRef = useRef(null)

  // Date → Titre → Lignes — compteur unifie
  const dateLength  = page.displayDate ? page.displayDate.length : 0
  const titleLength = page.title.length

  // Virtual length per line (empty lines = 1 so cursor flows through)
  const lineLengths = page.lines.map(l =>
    typeof l === 'object' ? 1 : l === '' ? 1 : l.length
  )
  const totalLineChars = lineLengths.reduce((a, b) => a + b, 0)
  const lineOffsets = lineLengths.reduce((acc, _, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + lineLengths[i - 1])
    return acc
  }, [])

  const totalChars = dateLength + titleLength + totalLineChars

  useEffect(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    clearInterval(intervalRef.current)
    setRevealedChars(0)

    if (!isActive) return

    const t0 = setTimeout(() => {
      let count = 0
      intervalRef.current = setInterval(() => {
        count++
        setRevealedChars(count)
        if (count >= totalChars) clearInterval(intervalRef.current)
      }, 28) // ~35 chars/sec
    }, 300)

    timersRef.current.push(t0)

    return () => {
      timersRef.current.forEach(clearTimeout)
      clearInterval(intervalRef.current)
    }
  }, [isActive, page.id, totalChars])

  const allRevealed = revealedChars >= totalChars

  // Portion date
  const dateCharsRevealed  = Math.min(revealedChars, dateLength)
  const dateTyping         = revealedChars > 0 && revealedChars < dateLength

  // Portion titre (commence après la date)
  const titleCharsRevealed = Math.min(Math.max(0, revealedChars - dateLength), titleLength)
  const titleTyping        = revealedChars > dateLength && revealedChars < dateLength + titleLength

  // Portion lignes (commence après la date + le titre)
  const linesCharsRevealed = Math.max(0, revealedChars - dateLength - titleLength)

  return (
    <div className={`page-content phase-${page.phase}`}>
      {page.displayDate && (
        <div className="date-stamp">
          {page.displayDate.slice(0, dateCharsRevealed)}
          {dateTyping && page.phase !== 'intro' && (
            <span className="cursor cursor--typing">█</span>
          )}
        </div>
      )}
      <h1 className="page-title">
        {page.title.slice(0, titleCharsRevealed)}
        {titleTyping && page.phase !== 'intro' && (
          <span className="cursor cursor--typing">█</span>
        )}
      </h1>
      {page.subtitle && (
        <h2 className="page-subtitle">
          {page.subtitle}
        </h2>
      )}

      <div className="page-body">
        {page.lines.map((line, i) => {
          const offset = lineOffsets[i]
          const len = lineLengths[i]
          const charsIn = Math.max(0, linesCharsRevealed - offset)
          const started = charsIn > 0
          const isCurrentLine = started && linesCharsRevealed < offset + len

          const isEmpty = line === ''
          const isColorGrid = typeof line === 'object' && line.type === 'color-grid'

          let content
          if (isColorGrid) {
            content = started ? <ColorGridLine words={line.words} /> : null
          } else if (isEmpty) {
            content = null
          } else {
            content = (
              <span>
                {line.slice(0, charsIn)}
                {isCurrentLine && page.phase !== 'intro' && (
                  <span className="cursor cursor--typing">█</span>
                )}
              </span>
            )
          }

          return (
            <div
              key={i}
              className={[
                'text-line',
                started ? 'revealed' : '',
                isEmpty ? 'empty-line' : '',
              ].filter(Boolean).join(' ')}
            >
              {content}
            </div>
          )
        })}

        {allRevealed && isActive && page.phase !== 'intro' && (
          <span className="cursor">█</span>
        )}
      </div>
    </div>
  )
}

// ── All Pages Overlay ──────────────────────────────────────────
function AllPagesOverlay({ pages, currentIdx, phase, onNavigate, onClose }) {
  return (
    <div className={`all-pages-overlay phase-${phase}`} onClick={onClose}>
      <div className="all-pages-inner" onClick={(e) => e.stopPropagation()}>
        <div className="all-pages-header">
          <span>NAVIGATION — {pages.length} PAGES</span>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {pages.map((p, i) => (
          <button
            key={p.id}
            className={`all-pages-item${i === currentIdx ? ' active' : ''}`}
            onClick={() => {
              onNavigate(i)
              onClose()
            }}
          >
            <span className="item-year">{p.yearLabel}</span>
            <span className="item-title">
              {p.title.replace('\n', ' ')}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────
function App() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showOverlay, setShowOverlay] = useState(false)
  const sectionsRef = useRef([])
  const scrollContainerRef = useRef(null)

  const currentPhase = PAGES[currentIdx]?.phase ?? 'intro'

  // Track which section is in view via scroll position
  // (plus fiable que IntersectionObserver avec scroll-snap)
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const onScroll = () => {
      const idx = Math.round(container.scrollTop / container.clientHeight)
      setCurrentIdx(Math.min(idx, PAGES.length - 1))
    }

    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [])

  // Close overlay with Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setShowOverlay(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const scrollToPage = (idx) => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollTo({ top: idx * container.clientHeight, behavior: 'instant' })
    }
  }

  return (
    <div className="app">
      {/* CRT visual effect */}
      <CRTOverlay phase={currentPhase} />

      {/* Top bar */}
      <TopNav
        currentIdx={currentIdx}
        total={PAGES.length}
        phase={currentPhase}
        onShowAll={() => setShowOverlay(true)}
      />

      {/* Navigation overlay */}
      {showOverlay && (
        <AllPagesOverlay
          pages={PAGES}
          currentIdx={currentIdx}
          phase={currentPhase}
          onNavigate={scrollToPage}
          onClose={() => setShowOverlay(false)}
        />
      )}

      {/* Scrollable content */}
      <div className="scroll-container" ref={scrollContainerRef}>
        {PAGES.map((page, i) => (
          <section
            key={page.id}
            data-id={page.id}
            className={`page-section phase-${page.phase}`}
            ref={(el) => (sectionsRef.current[i] = el)}
          >
            <PageContent page={page} isActive={currentIdx === i} />
          </section>
        ))}
      </div>

      {/* Bottom timeline */}
      <Timeline
        pages={PAGES}
        currentIdx={currentIdx}
        phase={currentPhase}
        onNavigate={scrollToPage}
      />
    </div>
  )
}

export default App
