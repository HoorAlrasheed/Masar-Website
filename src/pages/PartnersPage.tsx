import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { gsap } from 'gsap'

import { PARTNERS, SPONSORS, type PartnerCategory } from '../data/partners'

import PageHead from '../components/PageHead'
import { PartnerShareSheet, partnerKey, type PartnerLike } from '../components/PartnerShare'
import './PartnersPage.css'

/* =================================================================
   /partners — الشركاء والرعاة
   Same structure as before: a header, a bar with two tabs, the
   partners grouped by their four kinds, the sponsors in one grid
   (no kinds), and a closing call that follows the open tab.
   /partners?tab=sponsors opens straight on the sponsors.
   ================================================================= */

type Tab = 'partners' | 'sponsors'

const CATEGORIES: { name: PartnerCategory; desc: string }[] = [
  { name: 'شريك مساحة', desc: 'الجهات التي توفر المساحات والمرافق لتنفيذ فعاليات مسار.' },
  { name: 'شريك استراتيجي', desc: 'الجهات التي تدعم مسار استراتيجيًا وتشارك في توجيه مسيرتها.' },
  { name: 'شريك إعلامي', desc: 'الجهات الإعلامية التي تتولى التغطية ونشر المحتوى.' },
  { name: 'شريك ضيافة', desc: 'الجهات التي تقدم خدمات الضيافة لفعاليات ولقاءات مسار.' },
]

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const two = (n: number) => String(n).padStart(2, '0')

const arrow = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 6l-6 6 6 6" />
  </svg>
)

const star = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3.5l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.4l-5.1 2.7 1-5.6-4.1-4 5.7-.8z" />
  </svg>
)

const shareIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12M7.5 7.5L12 3l4.5 4.5" />
    <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
  </svg>
)

type ShareProps = { onShare: (p: PartnerLike) => void; hl: string | null }

/* one logo: the plate, the name, and a way for the partner to share it */
function Logo({ partner, onShare, hl }: { partner: PartnerLike } & ShareProps) {
  const on = hl === partnerKey(partner.name)
  const ref = useRef<HTMLDivElement>(null)
  /* opened from a shared link: the page settles on this logo */
  useEffect(() => {
    if (!on) return
    const t = window.setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500)
    return () => window.clearTimeout(t)
  }, [on])
  return (
    <div className="prp-logo prp-in" ref={ref} data-hl={on ? '' : undefined}>
      <span className="prp-plate">
        <img src={partner.logo} alt={partner.name} loading="lazy" draggable={false} />
      </span>
      <span className="prp-logo-name">{partner.name}</span>
      <button type="button" className="prp-share" onClick={() => onShare(partner)} aria-label={`شارك ${partner.name}`}>
        {shareIcon}
        شارك
      </button>
    </div>
  )
}

function PartnersTab({ onShare, hl }: ShareProps) {
  return (
    <div className="prp-cats">
      {CATEGORIES.map((cat, i) => {
        const items = PARTNERS.filter((p) => p.category === cat.name)
        return (
          <section className="prp-cat" key={cat.name} aria-labelledby={`prp-cat-${i}`}>
            <div className="prp-cat-head prp-in">
              <span className="prp-cat-num">{two(i + 1)}</span>
              <div>
                <h2 className="prp-cat-title" id={`prp-cat-${i}`}>
                  {cat.name}
                </h2>
                <p className="prp-cat-desc">{cat.desc}</p>
              </div>
            </div>

            {items.length ? (
              <div className="prp-grid">
                {items.map((p) => (
                  <Logo key={p.name} partner={{ name: p.name, logo: p.logo, role: p.category, kind: 'partner' }} onShare={onShare} hl={hl} />
                ))}
              </div>
            ) : (
              <p className="prp-cat-empty prp-in">لم يُضَف شركاء لهذا التصنيف بعد</p>
            )}
          </section>
        )
      })}
    </div>
  )
}

function SponsorsTab({ onShare, hl }: ShareProps) {
  return (
    <div className="prp-sponsors">
      <div className="prp-intro prp-in">
        <span className="prp-eyebrow">رعاة مسار</span>
        <h2 className="prp-intro-title">الرعاة</h2>
        <p className="prp-intro-text">الجهات التي تدعم مبادرة مسار وتُسهم في تحقيق أهدافها.</p>
      </div>

      {SPONSORS.length ? (
        <div className="prp-grid">
          {SPONSORS.map((s) => (
            <Logo key={s.name} partner={{ name: s.name, logo: s.logo, role: 'راعي', kind: 'sponsor' }} onShare={onShare} hl={hl} />
          ))}
        </div>
      ) : (
        <div className="prp-empty prp-in">
          <span className="prp-empty-icon">{star}</span>
          <p className="prp-empty-title">لم يُضَف رعاة بعد</p>
          <p className="prp-empty-text">ستظهر شعارات الرعاة هنا بمجرد إضافتها.</p>
        </div>
      )}
    </div>
  )
}

export default function PartnersPage() {
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'sponsors' ? 'sponsors' : 'partners'
  const body = useRef<HTMLDivElement>(null)
  const head = useRef<HTMLDivElement>(null)

  const go = (t: Tab) => setParams(t === 'partners' ? {} : { tab: t }, { replace: true })
  /* a shared link (?p=…) lights up that logo */
  const hl = params.get('p')
  const [sharing, setSharing] = useState<PartnerLike | null>(null)

  /* the header settles in once */
  useLayoutEffect(() => {
    const el = head.current
    if (!el || reduced()) return
    const ctx = gsap.context(() => {
    }, el)
    return () => ctx.revert()
  }, [])

  /* every time a tab opens, its content rises in, one piece after another */
  useLayoutEffect(() => {
    const el = body.current
    if (!el || reduced()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.prp-in', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.05, delay: 0.1 })
    }, el)
    return () => ctx.revert()
  }, [tab])

  const isPartners = tab === 'partners'

  return (
    <main className="prp">
      {/* header */}
      <div className="prp-head" ref={head}>
        <PageHead label="من يدعم مسار" title="الشركاء والرعاة" sub="نفخر بشراكاتنا مع مؤسسات وجهات تؤمن بأهمية تطوير الطلاب وتمكين الجيل القادم." />
      </div>

      {/* tab bar */}
      <div className="prp-bar">
        <div className="prp-wrap">
          <div className="prp-tabs" role="tablist" aria-label="الشركاء والرعاة" data-tab={tab}>
            <span className="prp-tabs-pill" aria-hidden="true" />
            <button type="button" role="tab" aria-selected={isPartners} onClick={() => go('partners')}>
              الشركاء
            </button>
            <button type="button" role="tab" aria-selected={!isPartners} onClick={() => go('sponsors')}>
              الرعاة
            </button>
          </div>
        </div>
      </div>

      {/* content */}
      <div className="prp-wrap prp-body" ref={body} key={tab}>
        {isPartners ? <PartnersTab onShare={setSharing} hl={hl} /> : <SponsorsTab onShare={setSharing} hl={hl} />}

        {/* call */}
        <div className="prp-cta prp-in">
          <h2 className="prp-cta-title">{isPartners ? 'كن شريكًا في مسار' : 'ادعم مسار كراعٍ'}</h2>
          <p className="prp-cta-text">
            {isPartners
              ? 'إذا كنت تمثل مؤسسة وتؤمن بأهمية تطوير الطلاب وتمكينهم، نسعد باستكشاف فرص الشراكة معك.'
              : 'تواصل معنا لمعرفة تفاصيل نظام الرعاية والمزايا المقدمة.'}
          </p>
          <Link to={isPartners ? '/partners/partnership-request' : '/partners/sponsorship-request'} className="prp-btn">
            {isPartners ? 'تواصل معنا للشراكة' : 'تواصل معنا للرعاية'}
            {arrow}
          </Link>
        </div>
      </div>
      {sharing && <PartnerShareSheet partner={sharing} onClose={() => setSharing(null)} />}
    </main>
  )
}