import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { gsap } from 'gsap'

import { RESOURCES, type ResourceCategory, type ResourceItem } from '../data/resources'
import toile from '../imports/resources-toile.jpg'
import seal from '../imports/resources-seal.png'
import paper from '../imports/resources-paper.png'

import './ResourcesPage.css'

/* =================================================================
   /resources — الأدلة والنشرات
   A switch (الأدلة · النشرات), then that kind's releases as sealed
   envelopes, two side by side. Tap one and its sheet opens over the
   page (the details, read, download); X or Escape closes it.
   /resources?tab=النشرات opens on the bulletins (none yet: it says so).
   Everything is written in data/resources.ts.
   ================================================================= */

const TABS: ResourceCategory[] = ['الأدلة', 'النشرات']
const INTRO: Record<ResourceCategory, string> = {
  الأدلة: 'أدلة عملية تساعدك في اختيار تخصصك وبناء مهاراتك.',
  النشرات: 'نشرات مسار الدورية وإصداراتها الخاصة.',
}

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const svg = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
)
const ICON = {
  read: svg(
    <>
      <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>,
  ),
  down: svg(<path d="M12 4v11M7 10l5 5 5-5M5 20h14" />),
  close: svg(<path d="M6 6l12 12M18 6L6 18" />),
}

/* ---------- the opened sheet ---------- */

/* the paper and the seal are loaded and decoded once, ahead of time; the
   sheet waits for them so the writing never shows before its white paper */
const loading = new Map<string, Promise<void>>()
const loaded = new Set<string>()
function loadImage(src: string) {
  let p = loading.get(src)
  if (!p) {
    const img = new Image()
    img.src = src
    p = (img.decode ? img.decode() : new Promise<void>((ok) => (img.onload = () => ok())))
      .catch(() => {})
      .then(() => {
        loaded.add(src)
      })
    loading.set(src, p)
  }
  return p
}
const paperReady = () => loaded.has(paper) && loaded.has(seal)

function Sheet({ item, onClose }: { item: ResourceItem; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(paperReady)

  useEffect(() => {
    if (ready) return
    let alive = true
    Promise.all([loadImage(paper), loadImage(seal)]).then(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [ready])

  /* lock the page behind it, close on Escape */
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  /* the whole sheet (dim + paper) fades in once, quickly, when the paper's
     picture is ready. Nothing moves or scales, so the phone draws the seal
     and the paper once — before, it drew them one way while moving and
     another way when they stopped, which made the seal change shape */
  useLayoutEffect(() => {
    const el = root.current
    if (!el || !ready || reduced()) return
    const tw = gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: 'power1.out', clearProps: 'opacity' })
    return () => {
      tw.kill()
    }
  }, [ready])

  const rows = [
    { label: 'النوع', value: item.category === 'الأدلة' ? 'دليل' : 'نشرة' },
    { label: 'الإصدار', value: item.date },
    ...(item.pages ? [{ label: 'عدد الصفحات', value: item.pages }] : []),
  ]

  return createPortal(
    <div className="rsx-layer" ref={root} style={ready ? undefined : { opacity: 0 }} role="dialog" aria-modal="true" aria-label={item.title} onClick={onClose}>
      <button type="button" className="rsx-x" onClick={onClose} aria-label="إغلاق">
        {ICON.close}
      </button>

      <article className="rsx-paper" style={ready ? undefined : { visibility: 'hidden' }} onClick={(e) => e.stopPropagation()}>
        <img className="rsx-paper-img" src={paper} alt="" draggable={false} decoding="sync" />
        <img className="rsx-paper-seal" src={seal} alt="" draggable={false} decoding="sync" />

        <div className="rsx-paper-text">
          <span className="rsx-sub">{item.subcategory}</span>
          <h2 className="rsx-title">{item.title}</h2>
          <p className="rsx-script">إصدار {item.date}</p>
          <p className="rsx-desc">{item.description}</p>

          <dl className="rsx-rows">
            {rows.map((r) => (
              <div key={r.label}>
                <dt>{r.label}</dt>
                <dd>{r.value}</dd>
              </div>
            ))}
          </dl>

          {item.file ? (
            <div className="rsx-acts">
              <a href={item.file} target="_blank" rel="noopener noreferrer">
                {ICON.read}
                قراءة
              </a>
              <a href={item.file} download>
                {ICON.down}
                تحميل
              </a>
            </div>
          ) : (
            <p className="rsx-soon">يُتاح هذا الإصدار قريبًا</p>
          )}
        </div>
      </article>
    </div>,
    document.body,
  )
}

/* ---------- a sealed envelope ---------- */

function Envelope({ item, i, onOpen }: { item: ResourceItem; i: number; onOpen: () => void }) {
  return (
    <button type="button" className="rsx-item" onClick={onOpen} aria-label={`افتح ${item.title}`}>
      <span className="rsx-env" style={{ '--toile': `url(${toile})`, '--r': `${i % 2 ? 8 : -10}deg` } as CSSProperties}>
        <span className="rsx-folds" aria-hidden="true" />
        <span className="rsx-flap" aria-hidden="true">
          <i />
        </span>
        <img className="rsx-seal" src={seal} alt="" draggable={false} />
        <span className="rsx-lbl" aria-hidden="true">
          <span>MASAR</span>
          <span>{item.date}</span>
        </span>
      </span>
      <span className="rsx-cap">
        <small>{item.subcategory}</small>
        <b>{item.title}</b>
      </span>
    </button>
  )
}

/* ---------- the page ---------- */

export default function ResourcesPage() {
  const [params, setParams] = useSearchParams()
  const asked = params.get('tab') as ResourceCategory | null
  const tab: ResourceCategory = asked && TABS.includes(asked) ? asked : 'الأدلة'
  const [open, setOpen] = useState<ResourceItem | null>(null)

  /* get the paper and the seal ready while the page is read, so the first
     envelope opens at once instead of waiting for the pictures */
  useEffect(() => {
    loadImage(paper)
    loadImage(seal)
  }, [])
  const close = useCallback(() => setOpen(null), [])
  const root = useRef<HTMLElement>(null)

  const go = (t: ResourceCategory) => setParams(t === 'الأدلة' ? {} : { tab: t }, { replace: true })
  const items = RESOURCES.filter((r) => r.category === tab)

  /* the navbar logo steps aside on this page (the menu stays on the left) */
  useLayoutEffect(() => {
    document.body.classList.add('rsx-page')
    return () => document.body.classList.remove('rsx-page')
  }, [])

  useLayoutEffect(() => {
    const el = root.current
    if (!el || reduced()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.rsx-head > *, .rsx-tabs', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 })
    }, el)
    return () => ctx.revert()
  }, [])

  /* the envelopes are laid down one after another on every switch */
  useLayoutEffect(() => {
    const el = root.current
    if (!el || reduced()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.rsx-item, .rsx-empty', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, delay: 0.15 })
    }, el)
    return () => ctx.revert()
  }, [tab])

  return (
    <main className="rsx" ref={root}>
      <div className="rsx-wrap">
        <div className="rsx-head">
          <p className="rsx-label">الأدلة والنشرات</p>
          <h1 className="rsx-h1">إصدارات مسار بين يديك</h1>
          <span className="rsx-tear" aria-hidden="true" />
          <p className="rsx-hsub">اضغط على أي ظرف لتفتحه</p>
        </div>

        <div className="rsx-tabs" role="tablist" aria-label="الأدلة والنشرات" data-i={TABS.indexOf(tab)}>
          <span className="rsx-tabs-pill" aria-hidden="true" />
          {TABS.map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => go(t)}>
              {t}
            </button>
          ))}
        </div>
        <p className="rsx-intro">{INTRO[tab]}</p>

        {items.length ? (
          <div className="rsx-grid" key={tab}>
            {items.map((r, i) => (
              <Envelope key={r.title} item={r} i={i} onOpen={() => setOpen(r)} />
            ))}
          </div>
        ) : (
          <p className="rsx-empty" key={tab}>
            لا توجد {tab === 'الأدلة' ? 'أدلة' : 'نشرات'} الآن، وستظهر هنا عند صدورها.
          </p>
        )}
      </div>

      {open && <Sheet item={open} onClose={close} />}
    </main>
  )
}