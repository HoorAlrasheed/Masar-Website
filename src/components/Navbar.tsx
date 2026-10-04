import { useEffect, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../imports/photo_5778249941649133394_x.png'

import './Navbar.css'

const navLinks = [
  { label: 'الرئيسية', path: '/' },
  { label: 'عن مسار', path: '/about' },
  { label: 'البرامج والفعاليات', path: '/programs' },
  { label: 'فريق مسار', path: '/team' },
  { label: 'الإعلانات والمستجدات', path: '/news' },
  { label: 'الأدلة والنشرات', path: '/resources' },
  { label: 'مميز الشهر', path: '/featured' },
  { label: 'الشركاء والرعاة', path: '/partners' },
]

/* the side menu has one more row: "تواصل معنا", right under the partners */
const menuLinks = [...navLinks, { label: 'تواصل معنا', path: '/contact' }]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)

    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const isHome = location.pathname === '/'
  /* pages where the logo at the top right steps aside (the menu stays on the left) */
  const NO_LOGO = ['/about', '/news', '/featured', '/partners', '/join', '/partners/partnership-request', '/partners/sponsorship-request', '/contact']
  /* came to /join from the home page or "عن مسار": a way back to that page, in the logo's place */
  const path = location.pathname.replace(/\/+$/, '')
  /* the partnership / sponsorship request pages always lead back to "الشركاء والرعاة", on the same tab */
  const toPartners = path === '/partners/partnership-request' || path === '/partners/sponsorship-request'
  const came = location.state as { from?: string; label?: string } | null
  const back = path === '/join' ? came : toPartners ? (came?.from ? came : { from: path.endsWith('sponsorship-request') ? '/partners?tab=sponsors' : '/partners', label: 'الشركاء والرعاة' }) : null
  const hideLogo = NO_LOGO.includes(location.pathname.replace(/\/+$/, '')) || location.pathname.startsWith('/news/')

  // mobile menu: lock the page behind it and close on Escape
  useEffect(() => {
    if (!menuOpen) return
    const html = document.documentElement
    const prevHtml = html.style.overflow
    const prevBody = document.body.style.overflow
    html.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      html.style.overflow = prevHtml
      document.body.style.overflow = prevBody
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <header className={`
        fixed inset-x-0 top-0 z-50
        transition-all duration-500
        ${
          menuOpen
            ? 'bg-[#07111b] border-b border-white/[0.06]'
            : scrolled
            ? 'bg-[#07111C]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_10px_40px_rgba(0,0,0,0.18)]'
            : 'bg-transparent border-b border-transparent'
        }
      `}
    >
      <div className="relative mx-auto flex h-[82px] w-[min(calc(100%-40px),1280px)] items-center justify-between">
        {back?.from ? (
          <Link to={back.from}
            className="nv-back"
            onClick={(e) => {
              /* came from one of our pages: straight back to it, as it was */
              /* opened straight from a link (no page of ours behind it): just follow the link */
              if (!came?.from) return
              e.preventDefault()
              navigate(-1)
            }}
            aria-label={`رجوع إلى ${back.label || 'الصفحة السابقة'}`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12H19M13 6L19 12L13 18" />
            </svg>
            <span>{back.label || 'رجوع'}</span>
          </Link>
        ) : !isHome && (
          <Link to="/"
            className="relative z-10 flex items-center"
            aria-label="مبادرة مسار"
            aria-hidden={hideLogo || undefined}
            tabIndex={hideLogo ? -1 : undefined}
            style={hideLogo ? { visibility: 'hidden', pointerEvents: 'none' } : undefined}
          >
            <img src={logo}
              alt="مبادرة مسار"
              className="h-11 w-auto object-contain"
            />
          </Link>
        )}

        <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
          {navLinks.map((link) => (
            <Link key={link.path}
              to={link.path}
              className={`
                relative py-3
                text-[12px] xl:text-[13px]
                font-medium
                transition-colors duration-300
                ${
                  isActive(link.path)
                    ? 'text-white'
                    : 'text-white/65 hover:text-white'
                }
              `}
            >
              {link.label}

              <span className={`
                  absolute bottom-0 right-0 h-px
                  bg-[#6BB9E8]
                  transition-all duration-300
                  ${isActive(link.path) ? 'w-full' : 'w-0'}
                `}
              />
            </Link>
          ))}

          <Link to="/join"
            className="
              mr-2 inline-flex h-10 items-center justify-center
              border border-[#6BB9E8]/70
              bg-[#6BB9E8]
              px-5
              text-[12px] font-bold text-[#06111B]
              transition-all duration-300
              hover:bg-[#A8DCFA]
              hover:-translate-y-0.5
              hover:shadow-[0_8px_30px_rgba(107,185,232,0.18)]
            "
          >
            انضم إلى مسار
          </Link>
        </nav>

        <button type="button"
          onClick={() => setMenuOpen((value) => !value)}
          style={
            isHome
              ? {
                  position: 'absolute',
                  left: 0,
                  right: 'auto',
                }
              : undefined
          }
          className={`nvm-toggle lg:hidden ${menuOpen ? 'is-open' : ''}`}
          aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={menuOpen}
          aria-controls="nvm-menu"
        >
          <span className="nvm-toggle-lines" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </button>
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <div id="nvm-menu"
            className={`nvm ${menuOpen ? 'is-open' : ''}`}
            aria-hidden={!menuOpen}
          >
            <div className="nvm-glow" aria-hidden="true" />

            <nav className="nvm-inner" aria-label="القائمة">
              <ul className="nvm-list">
                {menuLinks.map((link, i) => (
                  <li key={link.path} style={{ '--i': i } as CSSProperties}>
                    <Link to={link.path}
                      tabIndex={menuOpen ? 0 : -1}
                      className={`nvm-link ${isActive(link.path) ? 'is-active' : ''}`}
                      aria-current={isActive(link.path) ? 'page' : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="nvm-foot" style={{ '--i': menuLinks.length } as CSSProperties}>
                <Link to="/join" className="nvm-join" tabIndex={menuOpen ? 0 : -1}>
                  انضم إلى مسار
                </Link>
              </div>
            </nav>
          </div>,
          document.body
        )}
    </header>
  )
}