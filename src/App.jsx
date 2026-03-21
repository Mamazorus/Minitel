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

// ── Chapter + page data ────────────────────────────────────────
// Chaque chapitre a une date et peut contenir plusieurs pages.
// Le scroll avance page par page ; la timeline reste sur la date du chapitre.
const CHAPTERS = [
  {
    id: 'intro',
    yearLabel: '◦',
    displayDate: 'HISTOIRE DU NUMERIQUE',
    phase: 'intro',
    pages: [
      {
        title: 'MINITEL',
        lines: [
          '1982 — 2012',
          '',
          'Le premier reseau de services',
          'en ligne grand public au monde.',
          '',
          'Trente ans d\'une aventure',
          'numerique singuliere.',
          '',
          '↓',
        ],
      },
    ],
  },
  {
    id: 0,
    yearLabel: '1974',
    displayDate: '1970 — 1974',
    phase: 'mono',
    pages: [
      {
        title: 'LA NAISSANCE\nDU MINITEL',
        lines: [
          'Depuis le debut des annees 1970,',
          'le Centre National des Etudes de',
          'Telecommunication (CNET) travaille',
          'à la modernisation du telephone',
          'français, à l\'invention et au test',
          'de nouvelles fonctionnalites.',
        ],
      },
    ],
  },
  {
    id: 1,
    yearLabel: '1978',
    displayDate: '1978 — 1980',
    phase: 'mono',
    pages: [
      {
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
        ],
      },
      {
        title: 'L\'EXPERIENCE\nDE VELIZY',
        lines: [
          '> annuaire electronique',
          '> meteo et actualites',
          '> messagerie et petites annonces',
          '',
          'Le bilan est sans appel — positif.',
        ],
      },
    ],
  },
  {
    id: 2,
    yearLabel: '1982',
    displayDate: '1982',
    phase: 'mono',
    pages: [
      {
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
      },
    ],
  },
  {
    id: 3,
    yearLabel: '1985',
    displayDate: '1985 — 1991',
    phase: 'color',
    pages: [
      {
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
        ],
      },
      {
        title: 'L\'APOGEE\nDU RESEAU',
        lines: [
          'Le Minitel genère 7 milliards',
          'de francs de chiffre d\'affaires.',
          'La France est en avance',
          'sur le reste du monde.',
        ],
      },
    ],
  },
  {
    id: 4,
    yearLabel: '1996',
    displayDate: '1996 — 2000',
    phase: 'color',
    pages: [
      {
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
      },
    ],
  },
  {
    id: 5,
    yearLabel: '2012',
    displayDate: '30 juin 2012',
    phase: 'modern',
    pages: [
      {
        title: 'EXTINCTION\nDU RESEAU',
        lines: [
          'Le 30 juin 2012 à minuit, France Telecom coupe les derniers serveurs Teletel.',
          '',
          'Après 38 ans de service, 9 millions de terminaux deployes et plus de 26 000 services crees, le Minitel s\'eteint definitivement.',
          '',
          'Il aura precede Amazon de 13 ans, Google de 16 ans et Facebook de 22 ans. Premier reseau de services en ligne grand public au monde, il reste une anomalie dans l\'histoire du numerique : un systeme centralise, fiable, rentable, adopte massivement bien avant que l\'internet n\'existe.',
          '',
          'Sa disparition marque moins une defaite technologique qu\'un choix de societe. Le Web, ouvert et gratuit, l\'a emporte. Mais pendant trois decennies, le Minitel avait deja invente ce que le monde entier allait decouvrir apres lui : le commerce en ligne, la messagerie instantanee, les petites annonces numeriques.',
          '',
          '> FIN DE SESSION',
          '> CONNEXION TERMINEE_',
        ],
      },
    ],
  },
]

// ── Données dérivées ───────────────────────────────────────────
// Liste plate de toutes les pages pour le scroll
const FLAT_PAGES = CHAPTERS.flatMap((ch, chIdx) =>
  ch.pages.map((pg, pgIdx) => ({
    id: `${ch.id}-${pgIdx}`,
    chapterIdx: chIdx,
    pageInChapter: pgIdx,
    totalPagesInChapter: ch.pages.length,
    yearLabel: ch.yearLabel,
    displayDate: ch.displayDate,
    phase: ch.phase,
    title: pg.title,
    lines: pg.lines,
  }))
)

// Index (dans FLAT_PAGES) de la première page de chaque chapitre
const CHAPTER_START = CHAPTERS.map((ch) =>
  FLAT_PAGES.findIndex((p) => p.chapterIdx === CHAPTERS.indexOf(ch))
)

// Index de la première page modern (pour l'animation de vignette au scroll)
const MODERN_FLAT_IDX = FLAT_PAGES.findIndex((p) => p.phase === 'modern')

// ── CRT Overlay ────────────────────────────────────────────────
function CRTOverlay({ phase, overlayRef }) {
  const showFlicker = phase === 'mono' || phase === 'color'
  return (
    <div className={`crt-overlay phase-${phase}`} ref={overlayRef} aria-hidden="true">
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
function TopNav({ chapterIdx, totalChapters, pageInChapter, totalPagesInChapter, phase, onShowAll }) {
  if (phase === 'modern') {
    return (
      <nav className="top-nav--modern">
        <button className="burger-btn" onClick={onShowAll} aria-label="Menu">
          <span />
          <span />
          <span />
        </button>
      </nav>
    )
  }

  return (
    <nav className={`top-nav phase-${phase}`}>
      <span className="page-counter">
        <span className="counter-label">Chapitre</span>
        <span className="counter-num">{chapterIdx + 1}/{totalChapters}</span>
        {totalPagesInChapter > 1 && (
          <span className="counter-subpage">{pageInChapter + 1}/{totalPagesInChapter}</span>
        )}
      </span>
      <button className="all-pages-btn" onClick={onShowAll}>
        Toutes les pages
      </button>
    </nav>
  )
}

// ── Timeline ───────────────────────────────────────────────────
function Timeline({ chapters, currentChapterIdx, phase, onNavigate }) {
  const timelineRef = useRef(null)

  useEffect(() => {
    const container = timelineRef.current
    const el = container?.querySelector('.active')
    if (!container || !el) return
    const scrollLeft = el.offsetLeft - container.clientWidth / 2 + el.offsetWidth / 2
    container.scrollTo({ left: scrollLeft, behavior: 'instant' })
  }, [currentChapterIdx])

  return (
    <div className={`timeline phase-${phase}`} ref={timelineRef}>
      {chapters.map((ch, i) => (
        <button
          key={ch.id}
          className={`timeline-item${i === currentChapterIdx ? ' active' : ''}`}
          onClick={() => onNavigate(CHAPTER_START[i])}
        >
          {ch.yearLabel}
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

    // Phase moderne (2012) : pas d'effet machine à écrire, affichage immédiat
    if (page.phase === 'modern') {
      setRevealedChars(totalChars)
      return
    }

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

        {allRevealed && isActive && page.phase !== 'intro' && page.phase !== 'modern' && (
          <span className="cursor">█</span>
        )}
      </div>
    </div>
  )
}

// ── All Pages Overlay ──────────────────────────────────────────
function AllPagesOverlay({ chapters, currentChapterIdx, phase, onNavigate, onClose }) {
  return (
    <div className={`all-pages-overlay phase-${phase}`} onClick={onClose}>
      <div className="all-pages-inner" onClick={(e) => e.stopPropagation()}>
        <div className="all-pages-header">
          <span>NAVIGATION — {chapters.length} CHAPITRES</span>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {chapters.map((ch, i) => (
          <button
            key={ch.id}
            className={`all-pages-item${i === currentChapterIdx ? ' active' : ''}`}
            onClick={() => {
              onNavigate(CHAPTER_START[i])
              onClose()
            }}
          >
            <span className="item-year">{ch.yearLabel}</span>
            <span className="item-title">
              {ch.pages[0].title.replace('\n', ' ')}
            </span>
            {ch.pages.length > 1 && (
              <span className="item-pages">{ch.pages.length}p</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────
function App() {
  const [currentFlatIdx, setCurrentFlatIdx] = useState(0)
  const [showOverlay, setShowOverlay] = useState(false)
  const sectionsRef = useRef([])
  const scrollContainerRef = useRef(null)
  const crtOverlayRef = useRef(null)

  const currentPage    = FLAT_PAGES[currentFlatIdx]
  const currentPhase   = currentPage?.phase ?? 'intro'
  const currentChapterIdx = currentPage?.chapterIdx ?? 0

  // Applique le translateY sur le CRT overlay selon la position de scroll
  const applyCRTTransform = (scrollTop, h) => {
    if (MODERN_FLAT_IDX < 0 || !crtOverlayRef.current) return
    const modernStart = MODERN_FLAT_IDX * h
    const progress = (scrollTop - (modernStart - h)) / h
    const clamped = Math.max(0, Math.min(1, progress))
    if (clamped >= 1 || clamped <= 0) {
      crtOverlayRef.current.style.transform = ''
    } else {
      crtOverlayRef.current.style.transform = `translateY(-${clamped * h}px)`
    }
  }

  // Track which section is in view via scroll position
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const onScroll = () => {
      const h = container.clientHeight
      const scrollTop = container.scrollTop
      const idx = Math.round(scrollTop / h)
      setCurrentFlatIdx(Math.min(idx, FLAT_PAGES.length - 1))
      // Anime le CRT overlay entre la dernière page pré-modern et la page modern
      if (MODERN_FLAT_IDX >= 0 && crtOverlayRef.current) {
        const modernStart = MODERN_FLAT_IDX * h
        const progress = (scrollTop - (modernStart - h)) / h
        const clamped = Math.max(0, Math.min(1, progress))
        if (clamped >= 1) {
          // Laisse le CSS !important prendre le relais (pas d'inline style)
          crtOverlayRef.current.style.transform = ''
        } else if (clamped <= 0) {
          crtOverlayRef.current.style.transform = ''
        } else {
          crtOverlayRef.current.style.transform = `translateY(-${clamped * h}px)`
        }
      }
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

  const scrollToFlatPage = (idx) => {
    const container = scrollContainerRef.current
    if (container) {
      const h = container.clientHeight
      const scrollTop = idx * h
      container.scrollTo({ top: scrollTop, behavior: 'instant' })
      setCurrentFlatIdx(Math.min(idx, FLAT_PAGES.length - 1))
      applyCRTTransform(scrollTop, h)
    }
  }

  return (
    <div className="app">
      {/* CRT visual effect */}
      <CRTOverlay phase={currentPhase} overlayRef={crtOverlayRef} />

      {/* Top bar */}
      <TopNav
        chapterIdx={currentChapterIdx}
        totalChapters={CHAPTERS.length}
        pageInChapter={currentPage?.pageInChapter ?? 0}
        totalPagesInChapter={currentPage?.totalPagesInChapter ?? 1}
        phase={currentPhase}
        onShowAll={() => setShowOverlay(true)}
      />

      {/* Navigation overlay */}
      {showOverlay && (
        <AllPagesOverlay
          chapters={CHAPTERS}
          currentChapterIdx={currentChapterIdx}
          phase={currentPhase}
          onNavigate={scrollToFlatPage}
          onClose={() => setShowOverlay(false)}
        />
      )}

      {/* Scrollable content */}
      <div className="scroll-container" ref={scrollContainerRef}>
        {FLAT_PAGES.map((page, i) => (
          <section
            key={page.id}
            className={`page-section phase-${page.phase}`}
            ref={(el) => (sectionsRef.current[i] = el)}
          >
            <PageContent page={page} isActive={currentFlatIdx === i} />
          </section>
        ))}
      </div>

      {/* Bottom timeline */}
      <Timeline
        chapters={CHAPTERS}
        currentChapterIdx={currentChapterIdx}
        phase={currentPhase}
        onNavigate={scrollToFlatPage}
      />
    </div>
  )
}

export default App
