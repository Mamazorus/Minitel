import { useState, useEffect, useRef, useMemo } from 'react'
import './App.css'
import MinitelScene from './components/MinitelScene'

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
  // ── INTRODUCTION ──────────────────────────────────────────────
  {
    id: 'intro',
    yearLabel: '*',
    displayDate: 'HISTOIRE DU NUMERIQUE',
    phase: 'mono',
    pages: [
      {
        title: 'MINITEL\n1982 - 2012',
        lines: [
          'Vous vous apprêtez à découvrir',
          'l\'histoire du premier réseau',
          'de services en ligne grand public',
          'au monde.',
          '',
          'Trente ans avant les réseaux sociaux,',
          'vingt ans avant Amazon,',
          'la France avait déjà tout inventé.',
          '',
          'Scroll pour commencer.',
          '',
          '[SUITE]',
        ],
      },
    ],
  },

  // ── PARTIE 1, CONTEXTE (1977) ─────────────────────────────────
  {
    id: 'contexte',
    yearLabel: '1977',
    displayDate: '1977, 1978',
    phase: 'mono',
    pages: [
      {
        title: 'LA FRANCE\nA LA TRAINE',
        lines: [
          'Nous sommes en 1977.',
          '',
          'Pendant que les Etats-Unis bâtissent',
          'les fondations d\'Internet,',
          'la France accuse un retard inquiétant',
          'en matière de micro-informatique.',
          '',
          'Un homme décide d\'agir :',
          'Gérard Théry,',
          'directeur général des télécommunications.',
          '',
          'Son programme : « l\'informatique pour tous ».',
          'Ce sera une priorité nationale.',
        ],
      },
      {
        title: 'LE MOT\nTELEMATIQUE',
        lines: [
          'En 1978, Simon Nora et Alain Minc',
          'publient un rapport fondateur :',
          'L\'informatisation de la société.',
          '',
          'Première apparition du mot',
          'TELEMATIQUE,',
          'contraction de téléphone',
          'et informatique.',
          '',
          'Un mot. Une idée.',
          'Une révolution en marche.',
          '',
          '1973 : la France développe Cyclades.',
          'Arpanet deviendra Internet.',
          'Cyclades sera abandonné.',
        ],
      },
    ],
  },

  // ── PARTIE 2, GENESE (1974, 1983) ────────────────────────────
  {
    id: 'genese',
    yearLabel: '1974',
    displayDate: '1974, 1983',
    phase: 'mono',
    pages: [
      {
        title: 'LE TIC-TAC\nDE 1974',
        lines: [
          'Salon SICOB, 1974.',
          '',
          'Un terminal est présenté :',
          'le TIC-TAC',
          ', Terminal Intégré Comportant',
          '  Téléviseur et Appel au Clavier.',
          '',
          'L\'idée est révolutionnaire.',
          'Fusionner télécoms et informatique',
          'dans un seul objet.',
          '',
          'Le TIC-TAC ne décolle jamais.',
          'Le concept, lui, survit.',
        ],
      },
      {
        title: 'VELIZY,\nLE LABORATOIRE',
        lines: [
          '1980, Saint-Malo.',
          'Premier annuaire électronique',
          'testé en conditions réelles.',
          '',
          '1981, Vélizy-Villacoublay.',
          '2 500 foyers reçoivent un décodeur',
          'surnommé le « chauffe-plat ».',
          'Sur leur téléviseur : vingt services.',
          '',
          '1983, Ille-et-Vilaine.',
          'Déploiement à grande échelle.',
          'La presse, d\'abord hostile,',
          'devient progressivement favorable.',
          '',
          '> 120 000 terminaux fin 1983',
        ],
      },
    ],
  },

  // ── LANCEMENT (1982, 1984) ─────────────────────────────────────
  {
    id: 'lancement',
    yearLabel: '1982',
    displayDate: '1982, 1984',
    phase: 'mono',
    pages: [
      {
        title: 'LE TERMINAL\nGRATUIT',
        lines: [
          '15 juin 1982.',
          'France Télécom déploie le Minitel',
          'à l\'échelle nationale.',
          '',
          'La décision est unique en Europe :',
          'le terminal est offert gratuitement',
          'en échange de l\'annuaire papier.',
          '',
          'L\'annuaire électronique compte',
          'déjà 13 millions de numéros.',
          '',
          'De 120 000 à 531 000 terminaux',
          'en moins d\'un an.',
        ],
      },
      {
        title: 'LE SYSTEME\nKIOSQUE',
        lines: [
          'En 1984 naît le système kiosque :',
          'on paye ce qu\'on consulte,',
          'au temps passé.',
          '',
          'Ce modèle libère les fournisseurs.',
          'L\'offre explose.',
          '',
          '> 145 services, jan. 1984',
          '> 2 074 services, jan. 1986',
          '> 23 000 services, années 90',
          '',
          'Première infrastructure nationale',
          'de services en ligne au monde.',
        ],
      },
    ],
  },

  // ── PARTIE 3, AGE D'OR (1984, 1993) ───────────────────────────
  {
    id: 'apogee',
    yearLabel: '1986',
    displayDate: '1984, 1993',
    phase: 'color',
    pages: [
      {
        title: 'L\'AGE D\'OR\nDU 3615',
        lines: [
          '3615.',
          'Quatre chiffres.',
          'Une adresse. Une époque.',
          '',
          '> 3614 ULLA, rencontres',
          '> 3615 SNCF, trains',
          '> 3617 BANQUE, compte',
          '> 3615 METEO, bulletins',
          '',
          'Le Minitel génère 7 milliards',
          'de francs de chiffre d\'affaires.',
          'La France est en avance',
          'sur le reste du monde.',
        ],
      },
      {
        title: 'LES\nMESSAGERIES',
        lines: [
          'En 1990, les messageries roses',
          'représentent la moitié',
          'des appels du réseau.',
          '',
          'Anonyme. Accessible depuis chez soi.',
          'Affranchi du regard social.',
          'Une liberté nouvelle.',
          '',
          'La publicité s\'empare du phénomène.',
          'Des slogans fleurissent partout.',
          '',
          'De 120 000 à 6,5 millions',
          'de terminaux en dix ans.',
          '+146 % entre 1984 et 1985.',
        ],
      },
    ],
  },

  // ── PARTIE 4, DECLIN (1993, 2001) ────────────────────────────
  {
    id: 'declin',
    yearLabel: '1993',
    displayDate: '1993, 2001',
    phase: 'color',
    pages: [
      {
        title: 'L\'ANNEE\nDE BASCULE',
        lines: [
          '1993.',
          '',
          'C\'est l\'année où apparaît',
          'le World Wide Web.',
          '',
          'La même année, pour la première fois,',
          'le nombre de terminaux Minitel',
          'commence à décroître.',
          '',
          'Ce n\'est pas une coïncidence.',
          '',
          'Le Web apporte ce que le Minitel',
          'ne peut pas donner :',
          'la liberté de navigation.',
        ],
      },
      {
        title: 'LA TENTATIVE\nI-MINITEL',
        lines: [
          'A partir de 1998, France Télécom',
          'tente une ultime stratégie :',
          'relier le Minitel à Internet.',
          '',
          '> 500 000 téléchargements',
          '> 250 000 utilisateurs / mois',
          '',
          'Mais les données sur les terminaux',
          'physiques cessent d\'être publiées.',
          '',
          'En 2001 :',
          '15 millions accèdent au Minitel.',
          'Seulement 9 millions à Internet.',
          '',
          'Le Minitel est encore là.',
          'Mais il vieillit.',
        ],
      },
    ],
  },

  // ── PARTIE 5, HERITAGE (2001, 2011) ──────────────────────────
  {
    id: 'heritage',
    yearLabel: '2001',
    displayDate: '2001, 2011',
    phase: 'color',
    pages: [
      {
        title: 'CE QU\'IL\nA INVENTE',
        lines: [
          'Avant Amazon. Avant PayPal.',
          '',
          'Le Minitel permettait déjà',
          'de réserver un billet de train,',
          'd\'acheter en ligne,',
          'de consulter son compte bancaire.',
          '',
          'La SNCF y trouvait encore en 2001',
          'un canal plus rentable',
          'que n\'importe quel site web.',
          '',
          'Le e-commerce n\'est pas né',
          'avec Internet.',
          'Il est né avec le 3615 SNCF.',
        ],
      },
      {
        title: 'CE QU\'ON\nA PERDU',
        lines: [
          'Ce que les derniers utilisateurs',
          'regrettaient le plus ?',
          '',
          'Sa simplicité.',
          '',
          'Pas de mise à jour.',
          'Pas de mot de passe.',
          'Pas de publicité.',
          'Un clavier, un écran, un service.',
          '',
          'Et l\'anonymat de l\'utilisateur.',
          'Aucun profil. Aucune traçabilité.',
          '',
          'C\'est exactement ce que',
          'des millions d\'internautes',
          'réclament aujourd\'hui.',
        ],
      },
    ],
  },

  // ── EXTINCTION (2012) ─────────────────────────────────────────
  {
    id: 'extinction',
    yearLabel: '2012',
    displayDate: '30 juin 2012',
    phase: 'modern',
    pages: [
      {
        title: 'EXTINCTION\nDU RESEAU',
        lines: [
          'Le 30 juin 2012 à minuit, France Télécom coupe les derniers serveurs Télétel.',
          '',
          'Après 38 ans de service, 9 millions de terminaux déployés et plus de 26 000 services créés, le Minitel s\'éteint définitivement.',
          '',
          'Il aura précédé Amazon de 13 ans, Google de 16 ans et Facebook de 22 ans. Premier réseau de services en ligne grand public au monde, il reste une anomalie dans l\'histoire du numérique : un système centralisé, fiable, rentable, adopté massivement bien avant qu\'Internet n\'existe.',
          '',
          'Sa disparition marque moins une défaite technologique qu\'un choix de société. Le Web, ouvert et gratuit, l\'a emporté. Mais pendant trois décennies, le Minitel avait déjà inventé ce que le monde entier allait découvrir après lui.',
          '',
          '« Usagers et prestataires préféraient le laisser mourir en douceur… »',
          '- Gonzalez & Jouve, Flux, 2002',
          '',
          '> FIN DE SESSION',
          '> CONNEXION TERMINEE_',
        ],
      },
    ],
  },
]

// ── Helpers de pagination ───────────────────────────────────────

function buildFlatPages(chapters) {
  return chapters.flatMap((ch, chIdx) =>
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
}

// Découpe automatiquement les pages dont le contenu dépasse maxLines lignes
function autoPaginate(chapters, maxLines) {
  return chapters.map(ch => ({
    ...ch,
    pages: ch.pages.flatMap(pg => {
      if (pg.lines.length <= maxLines) return [pg]
      const pages = []
      let remaining = [...pg.lines]
      while (remaining.length > 0) {
        let cutAt = Math.min(maxLines, remaining.length)
        // Couper de préférence à une ligne vide pour un split propre
        for (let i = cutAt - 1; i >= Math.floor(maxLines / 2); i--) {
          if (remaining[i] === '') { cutAt = i; break }
        }
        pages.push({ ...pg, lines: remaining.slice(0, cutAt) })
        remaining = remaining.slice(cutAt)
        while (remaining.length > 0 && remaining[0] === '') remaining.shift()
      }
      return pages
    })
  }))
}

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
function TopNav({ chapterIdx, totalChapters, pageInChapter, totalPagesInChapter, phase, onShowAll, onRestart }) {
  if (phase === 'modern') {
    return (
      <nav className="top-nav--modern">
        <span className="page-counter">
          <span className="counter-label">Chapitre</span>
          <span className="counter-num">{chapterIdx + 1}/{totalChapters}</span>
          {totalPagesInChapter > 1 && (
            <span className="counter-subpage">{pageInChapter + 1}/{totalPagesInChapter}</span>
          )}
        </span>
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
      <button className="restart-btn" onClick={onRestart} aria-label="Retour au début">{'<<'}</button>
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
function Timeline({ chapters, currentChapterIdx, phase, onNavigate, chapterStart }) {
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
          onClick={() => onNavigate(chapterStart[i])}
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
function PageContent({ page, isActive, onRestart }) {
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
      {page.phase === 'modern' && onRestart && (
        <button className="html-back-btn" onClick={onRestart}>&lt;&lt; Retour au debut</button>
      )}
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
function AllPagesOverlay({ chapters, currentChapterIdx, phase, onNavigate, onClose, chapterStart }) {
  return (
    <div className={`all-pages-overlay phase-${phase}`} onClick={onClose}>
      <div className="all-pages-inner" onClick={(e) => e.stopPropagation()}>
        <div className="all-pages-header">
          <span>NAVIGATION - {chapters.length} CHAPITRES</span>
          <button className="close-btn" onClick={onClose} aria-label="Fermer">
            {phase === 'modern' ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : 'X'}
          </button>
        </div>

        {chapters.map((ch, i) => (
          <button
            key={ch.id}
            className={`all-pages-item${i === currentChapterIdx ? ' active' : ''}`}
            onClick={() => {
              onNavigate(chapterStart[i])
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

// ── CRT Boot Screen ────────────────────────────────────────────
function CRTBoot({ onComplete }) {
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 1600)
    const t2 = setTimeout(onComplete, 2300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className={`crt-boot${fading ? ' crt-boot--fading' : ''}`} aria-hidden="true">
      <div className="crt-boot__scanlines" />
      <div className="crt-boot__vignette" />
      <div className="crt-boot__line" />
      <div className="crt-boot__glow" />
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────
function App() {
  // ── Scène 3D intro ──────────────────────────────────────────
  const [showScene, setShowScene] = useState(true)
  const [fadeOut, setFadeOut]   = useState(false)
  const [showBoot, setShowBoot] = useState(false)

  // ── Pagination dynamique selon la hauteur du viewport ────────
  const getMaxLines = () => window.innerHeight < 700 ? 7 : 12
  const [maxLines, setMaxLines] = useState(getMaxLines)
  useEffect(() => {
    const onResize = () => setMaxLines(prev => {
      const next = getMaxLines()
      return next !== prev ? next : prev
    })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const chapters      = useMemo(() => autoPaginate(CHAPTERS, maxLines), [maxLines])
  const flatPages     = useMemo(() => buildFlatPages(chapters), [chapters])
  const chapterStart  = useMemo(() => chapters.map((_, i) => flatPages.findIndex(p => p.chapterIdx === i)), [chapters, flatPages])
  const modernFlatIdx = useMemo(() => flatPages.findIndex(p => p.phase === 'modern'), [flatPages])

  const [currentFlatIdx, setCurrentFlatIdx] = useState(0)
  const [showOverlay, setShowOverlay] = useState(false)
  const sectionsRef = useRef([])
  const scrollContainerRef = useRef(null)
  const crtOverlayRef = useRef(null)

  const currentPage    = flatPages[currentFlatIdx]
  const currentPhase   = currentPage?.phase ?? 'intro'
  const currentChapterIdx = currentPage?.chapterIdx ?? 0

  // Applique le translateY sur le CRT overlay selon la position de scroll
  const applyCRTTransform = (scrollTop, h) => {
    if (modernFlatIdx < 0 || !crtOverlayRef.current) return
    const modernStart = modernFlatIdx * h
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
      setCurrentFlatIdx(Math.min(idx, flatPages.length - 1))
      // Anime le CRT overlay entre la dernière page pré-modern et la page modern
      if (modernFlatIdx >= 0 && crtOverlayRef.current) {
        const modernStart = modernFlatIdx * h
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
  }, [flatPages, modernFlatIdx])

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
      setCurrentFlatIdx(Math.min(idx, flatPages.length - 1))
      applyCRTTransform(scrollTop, h)
    }
  }

  const handleSceneComplete = () => {
    setFadeOut(true)
    setShowBoot(true)
    setTimeout(() => setShowScene(false), 700)
  }

  const handleBootComplete = () => setShowBoot(false)

  const handleRestart = () => {
    scrollToFlatPage(0)
    setShowBoot(false)
    setFadeOut(false)
    setShowScene(true)
  }

  return (
    <>
      {/* ── Scène 3D en overlay ── */}
      {showScene && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          opacity: fadeOut ? 0 : 1,
          transition: 'opacity 0.7s ease',
          pointerEvents: fadeOut ? 'none' : 'auto',
        }}>
          <MinitelScene onComplete={handleSceneComplete} />
        </div>
      )}

      {/* ── Animation démarrage CRT ── */}
      {showBoot && <CRTBoot onComplete={handleBootComplete} />}

      {/* ── Scrollytelling (toujours monté en dessous) ── */}
      <div className="app">
        <CRTOverlay phase={currentPhase} overlayRef={crtOverlayRef} />

        <TopNav
          chapterIdx={currentChapterIdx}
          totalChapters={chapters.length}
          pageInChapter={currentPage?.pageInChapter ?? 0}
          totalPagesInChapter={currentPage?.totalPagesInChapter ?? 1}
          phase={currentPhase}
          onShowAll={() => setShowOverlay(true)}
          onRestart={handleRestart}
        />

        {showOverlay && (
          <AllPagesOverlay
            chapters={chapters}
            currentChapterIdx={currentChapterIdx}
            phase={currentPhase}
            onNavigate={scrollToFlatPage}
            onClose={() => setShowOverlay(false)}
            chapterStart={chapterStart}
          />
        )}

        <div
          className="scroll-container"
          ref={scrollContainerRef}
          style={(showScene || showBoot) ? { overflow: 'hidden' } : {}}
        >
          {flatPages.map((page, i) => (
            <section
              key={page.id}
              className={`page-section phase-${page.phase}`}
              ref={(el) => (sectionsRef.current[i] = el)}
            >
              <PageContent page={page} isActive={currentFlatIdx === i && !showScene && !showBoot} onRestart={handleRestart} />
            </section>
          ))}
        </div>

        <Timeline
          chapters={chapters}
          currentChapterIdx={currentChapterIdx}
          phase={currentPhase}
          onNavigate={scrollToFlatPage}
          chapterStart={chapterStart}
        />
      </div>
    </>
  )
}

export default App
