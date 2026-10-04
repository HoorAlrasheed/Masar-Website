import { Link } from 'react-router-dom'

import { SOCIALS } from '../data/contact'
import SocialIcon from './SocialIcon'

import './Footer.css'

/* -----------------------------------------------------------------
   FOOTER — designed mobile-first.
   Order (RTL, from the right):
   1) عن مسار   2) استكشف        ← side by side
   3) تابع مسار — the accounts, then the تواصل معنا button (/contact)
   4) one centered copyright line
   The whole footer sits on its own raised panel (rounded top, hairline
   edge), so it reads as the END of the site, not as one more section.
   ----------------------------------------------------------------- */

const LINK_GROUPS = [
  {
    title: 'عن مسار',
    links: [
      { label: 'عن مسار', to: '/about' },
      { label: 'فريق مسار', to: '/team' },
      { label: 'الشركاء والرعاة', to: '/partners' },
    ],
  },
  {
    title: 'استكشف',
    links: [
      { label: 'برامجنا', to: '/programs' },
      { label: 'الإعلانات والمستجدات', to: '/news' },
      { label: 'الأدلة والنشرات', to: '/resources' },
      { label: 'مميز الشهر', to: '/featured' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="ftx">
      <div className="ftx-panel">
      <div className="ftx-glow" aria-hidden="true" />

      <div className="ftx-inner">
        <div className="ftx-top">
          <nav className="ftx-links" aria-label="روابط الموقع">
            {LINK_GROUPS.map((group) => (
              <div className="ftx-group" key={group.title}>
                <p className="ftx-title">{group.title}</p>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} className="ftx-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="ftx-contact">
            <p className="ftx-title">تابع مسار</p>

            <ul className="ftx-socials">
              {SOCIALS.map((s) => (
                <li key={s.key}>
                  <a href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`مسار على ${s.label}`}
                    className="ftx-social"
                  >
                    <SocialIcon name={s.key} />
                  </a>
                </li>
              ))}
            </ul>

            <Link to="/contact" className="ftx-cta">
              تواصل معنا
            </Link>
          </div>
        </div>

        <div className="ftx-bottom">
          <p>© ١٤٤٧ مبادرة مسار — جميع الحقوق محفوظة</p>
        </div>
      </div>
      </div>
    </footer>
  )
}