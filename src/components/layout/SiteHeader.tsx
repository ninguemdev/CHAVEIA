import { useEffect, useState } from 'react'
import { useAuth } from '../../context/auth'
import { UserMenu } from '../auth/UserMenu'

type SiteHeaderProps = {
  subtitle?: string
}

type HeaderLink = {
  href: string
  label: string
  requiresSession?: boolean
  requiresCreator?: boolean
  requiresAdmin?: boolean
}

const publicLinks: HeaderLink[] = [
  { href: '#home', label: 'Inicio' },
  { href: '#dashboard', label: 'Dashboard', requiresSession: true },
  { href: '#/torneios', label: 'Torneios' },
  { href: '#/minhas-inscricoes', label: 'Inscricoes', requiresSession: true },
  { href: '#/admin', label: 'Admin', requiresAdmin: true },
]

function normalizeHash(hash: string) {
  return hash.replace(/^#/, '') || 'home'
}

function getCreateTournamentHref(session: unknown, canCreateTournaments: boolean) {
  if (canCreateTournaments) return '#/torneios/novo'
  return session ? '#/solicitar-criacao-torneio' : '#/login'
}

function isCurrentRoute(currentHash: string, href: string) {
  const current = normalizeHash(currentHash)
  const target = normalizeHash(href)

  if (target === 'home') return current === 'home' || current === '/'
  if (target === '/torneios') return current === '/torneios'
  return current === target
}

export function SiteHeader({ subtitle = 'torneios e e-sports' }: SiteHeaderProps) {
  const { session, isAdmin, canCreateTournaments } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isHeaderHidden, setIsHeaderHidden] = useState(false)
  const [currentHash, setCurrentHash] = useState(() => window.location.hash || '#home')

  useEffect(() => {
    function handleHashChange() {
      setCurrentHash(window.location.hash || '#home')
      setIsMobileMenuOpen(false)
      setIsHeaderHidden(false)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
        setIsHeaderHidden(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const mobileHeaderQuery = window.matchMedia('(max-width: 39.999rem)')
    let lastScrollY = window.scrollY
    let ticking = false

    function updateHeaderVisibility() {
      const currentScrollY = window.scrollY
      const delta = currentScrollY - lastScrollY

      if (!mobileHeaderQuery.matches) {
        setIsHeaderHidden(false)
      } else if (isMobileMenuOpen || currentScrollY < 16) {
        setIsHeaderHidden(false)
      } else if (delta > 8 && currentScrollY > 96) {
        setIsHeaderHidden(true)
      } else if (delta < -8) {
        setIsHeaderHidden(false)
      }

      lastScrollY = Math.max(currentScrollY, 0)
      ticking = false
    }

    function handleScroll() {
      if (ticking) return

      ticking = true
      window.requestAnimationFrame(updateHeaderVisibility)
    }

    function handleViewportChange() {
      lastScrollY = window.scrollY
      if (!mobileHeaderQuery.matches) setIsHeaderHidden(false)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    mobileHeaderQuery.addEventListener('change', handleViewportChange)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      mobileHeaderQuery.removeEventListener('change', handleViewportChange)
    }
  }, [isMobileMenuOpen])

  const links = [
    ...publicLinks,
    {
      href: isAdmin ? '#/admin/pedidos' : '#/meus-pedidos',
      label: 'Pedidos',
      requiresSession: true,
    },
  ]

  const visibleLinks = links.filter((link) => {
    if (link.requiresAdmin) return isAdmin
    if (link.requiresCreator) return canCreateTournaments
    if (link.requiresSession) return Boolean(session)
    return true
  })

  return (
    <header className={isHeaderHidden ? 'app-header is-scroll-hidden' : 'app-header'}>
      <a className="brand" href="#home">
        <span>
          <span className="brand-title">CHAVEIA</span>
          <span className="brand-subtitle">{subtitle}</span>
        </span>
      </a>

      <button
        className="nav-toggle"
        type="button"
        aria-controls="primary-navigation"
        aria-expanded={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen((current) => !current)}
      >
        Menu
      </button>

      <nav
        className={isMobileMenuOpen ? 'primary-nav is-open' : 'primary-nav'}
        id="primary-navigation"
        aria-label="Navegacao principal"
      >
        {visibleLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            aria-current={isCurrentRoute(currentHash, link.href) ? 'page' : undefined}
          >
            {link.label}
          </a>
        ))}
        <a
          className="button button-primary nav-action"
          href={getCreateTournamentHref(session, canCreateTournaments)}
        >
          Novo torneio
        </a>
      </nav>

      <UserMenu />
    </header>
  )
}
