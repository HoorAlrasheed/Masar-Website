import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactElement } from 'react'
import { createPortal } from 'react-dom'
import { Link, useSearchParams } from 'react-router-dom'
import { gsap } from 'gsap'

import { ADVISORS, DEPARTMENTS, DIRECT_COMMITTEES, LEADERSHIP, type Committee, type Person } from '../data/team'

import { ShareSheet, memberKey, roster } from '../components/TeamShare'
import './TeamPage.css'

/* -----------------------------------------------------------------
   /team — فريق مسار (phone first)
   - the whole organisation as a top-down chart inside a frame that
     zooms and pans (two fingers / drag / the − + buttons); it opens
     showing the whole chart
   - each committee: its name, then its lead, its deputy (if any) and a
     "members" box that opens /team?committee=<id>
   - tapping any person opens their card over the page (like مميز الشهر):
     photo or initial, title, name, department, committee, LinkedIn
   All names live in src/data/team.ts.
   ----------------------------------------------------------------- */

/* one committee column; every branch is a whole number of these, so the
   spacing is even everywhere and the middle department sits exactly
   under the leadership */
const COL = 220

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const AR = '٠١٢٣٤٥٦٧٨٩'
const ar = (n: number) => String(n).replace(/\d/g, (d) => AR[+d])
const countLabel = (n: number) => (n === 1 ? 'عضو واحد' : n === 2 ? 'عضوان' : n <= 10 ? `${ar(n)} أعضاء` : `${ar(n)} عضوًا`)

/* first letter for the round badge ("الجوهره" → "ج") */
const initial = (name: string) => name.trim().replace(/^ال/, '').charAt(0)

type Opened = { person: Person; title: string; department?: string; committee?: string }

const ICON: Record<string, ReactElement> = {
  dept: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20V8L12 4L20 8V20M9 20V15H15V20" />
    </svg>
  ),
  comm: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="9" r="3" />
      <circle cx="16" cy="10" r="2.5" />
      <path d="M3.5 19C4 16 6.5 14.5 9 14.5S14 16 14.5 19M14 15C16.5 14.7 19 15.8 20 18.5" />
    </svg>
  ),
  go: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 6L9 12L15 18" />
    </svg>
  ),
  back: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12H19M13 6L19 12L13 18" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6L18 18M18 6L6 18" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5M5 12L11 6M5 12L11 18" />
    </svg>
  ),
}

/* ================================================================
   small pieces
   ================================================================ */

function Avatar({ person, className = '' }: { person: Person; className?: string }) {
  const [broken, setBroken] = useState(false)
  const img = person.image?.trim()
  return (
    <span className={`tm-av ${className}`} aria-hidden="true">
      {img && !broken ? <img src={img} alt="" loading="lazy" onError={() => setBroken(true)} /> : initial(person.name)}
    </span>
  )
}

function PersonNode({ person, title, onOpen, big = false }: { person: Person; title: string; onOpen: () => void; big?: boolean }) {
  return (
    <button type="button" className={`tm-node tm-person${big ? ' tm-person--big' : ''}`} onClick={onOpen} aria-label={`${person.name}، ${title}، عرض البطاقة`}>
      <Avatar person={person} />
      <span className="tm-node-text">
        <span className="tm-node-name">{person.name}</span>
        <span className="tm-node-role">{title}</span>
      </span>
      {/* a small sign that the box opens the person's card */}
      <span className="tm-more" aria-hidden="true">
        {ICON.go}
      </span>
    </button>
  )
}

/* ================================================================
   the chart
   ================================================================ */

function CommitteeBranch({ c, department, open, width }: { c: Committee; department?: string; open: (o: Opened) => void; width: number }) {
  const at = (p: Person, fallback: string) => () => open({ person: p, title: p.role || fallback, department, committee: c.name })
  return (
    <li style={{ width }}>
      <div className="tm-node tm-comm">
        <span className="tm-ic">{ICON.comm}</span>
        <span className="tm-node-name">{c.name}</span>
      </div>
      <div className="tm-leaves">
        {c.lead && <PersonNode person={c.lead} title={c.lead.role || 'قائد اللجنة'} onOpen={at(c.lead, 'قائد اللجنة')} />}
        {c.deputy && <PersonNode person={c.deputy} title={c.deputy.role || 'نائب اللجنة'} onOpen={at(c.deputy, 'نائب اللجنة')} />}
        <Link to={`/team?committee=${c.id}`} className="tm-node tm-members">
          <span className="tm-node-text">
            <span className="tm-node-name">الأعضاء</span>
            <span className="tm-node-role">{countLabel(c.members.length)}</span>
          </span>
          <span className="tm-go">{ICON.go}</span>
        </Link>
      </div>
    </li>
  )
}

function Chart({ open }: { open: (o: Opened) => void }) {
  const L = LEADERSHIP
  const top = (p: Person, fallback: string) => () => open({ person: p, title: p.role || fallback, department: 'الإدارة العليا' })

  /* the chart is laid out left-to-right (simpler connector maths), so the
     branches are reversed to read right-to-left */
  const branches = [
    ...DEPARTMENTS.map((d) => (
      <li key={d.id} style={{ width: Math.max(2, d.committees.length) * COL }}>
        <div className="tm-chain">
          <div className="tm-node tm-dept">
            <span className="tm-ic">{ICON.dept}</span>
            <span className="tm-node-name">{d.name}</span>
          </div>
          <i />
          <PersonNode person={d.lead} title={d.lead.role || 'قائد الإدارة'} onOpen={() => open({ person: d.lead, title: d.lead.role || 'قائد الإدارة', department: d.name })} />
          <i />
          <PersonNode person={d.deputy} title={d.deputy.role || 'نائب الإدارة'} onOpen={() => open({ person: d.deputy, title: d.deputy.role || 'نائب الإدارة', department: d.name })} />
        </div>
        <ul>
          {[...d.committees].reverse().map((c) => (
            <CommitteeBranch key={c.id} c={c} department={d.name} open={open} width={COL} />
          ))}
        </ul>
      </li>
    )),
    ...DIRECT_COMMITTEES.map((c) => <CommitteeBranch key={c.id} c={c} department="الإدارة العليا" open={open} width={2 * COL} />),
  ].reverse()

  return (
    <div className="tm-org">
      <ul>
        <li>
          <div className="tm-chain">
            <div className="tm-duo">
              <PersonNode big person={L.deputy} title={L.deputy.role || 'نائب رئيس المبادرة'} onOpen={top(L.deputy, 'نائب رئيس المبادرة')} />
              <span className="tm-duo-link" aria-hidden="true" />
              <PersonNode big person={L.president} title={L.president.role || 'رئيس المبادرة'} onOpen={top(L.president, 'رئيس المبادرة')} />
            </div>
          </div>
          <ul>{branches}</ul>
        </li>
      </ul>

      {ADVISORS.length > 0 && (
        <div className="tm-advisors">
          <span className="tm-advisors-label">
            <i />
            مستشارو المبادرة
            <i />
          </span>
          <div className="tm-advisors-row">
            {ADVISORS.map((a) => (
              <PersonNode big key={a.name} person={a} title={a.role || 'مستشار المبادرة'} onOpen={top(a, 'مستشار المبادرة')} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ================================================================
   zoom + pan frame
   ================================================================ */

type View = { x: number; y: number; s: number }
const MAX_SCALE = 1.6
const BAR = 64 // room kept for the zoom bar at the bottom

function ZoomFrame({ children }: { children: ReactElement }) {
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLDivElement>(null)
  const view = useRef<View>({ x: 0, y: 0, s: 1 })
  const fitScale = useRef(1)
  const [pct, setPct] = useState(100)
  const [height, setHeight] = useState<number | undefined>(undefined)

  const apply = useCallback((v: View, animate = false) => {
    const el = canvas.current
    const st = stage.current
    if (!el || !st) return
    /* keep at least part of the chart on screen */
    const W = st.clientWidth
    const H = st.clientHeight - BAR
    const cw = el.offsetWidth * v.s
    const ch = el.offsetHeight * v.s
    const pad = 48
    v.x = cw <= W ? Math.min(Math.max(v.x, 0), W - cw) : Math.min(Math.max(v.x, W - cw - pad), pad)
    v.y = ch <= H ? Math.min(Math.max(v.y, 0), H - ch) : Math.min(Math.max(v.y, H - ch - pad), pad)
    view.current = v
    el.style.transition = animate && !reduced() ? 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)' : 'none'
    el.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.s})`
    setPct(Math.round(v.s * 100))
  }, [])

  const fit = useCallback(
    (animate = false) => {
      const el = canvas.current
      const st = stage.current
      if (!el || !st) return
      const W = st.clientWidth
      const H = st.clientHeight - BAR
      const s = Math.min((W - 16) / el.offsetWidth, (H - 16) / el.offsetHeight, 1)
      fitScale.current = s
      apply({ s, x: (W - el.offsetWidth * s) / 2, y: (H - el.offsetHeight * s) / 2 }, animate)
    },
    [apply]
  )

  const zoomAt = useCallback(
    (px: number, py: number, factor: number, animate = false) => {
      const v = view.current
      const s = Math.min(Math.max(v.s * factor, fitScale.current * 0.9), MAX_SCALE)
      const k = s / v.s
      apply({ s, x: px - (px - v.x) * k, y: py - (py - v.y) * k }, animate)
    },
    [apply]
  )

  /* size the frame to the chart: as tall as the chart needs at its
     "fit the width" size, within sensible limits, then fit */
  useLayoutEffect(() => {
    const st = stage.current
    const el = canvas.current
    if (!st || !el) return
    /* the frame runs from where it starts down to the bottom of the
       screen (with a small margin), so there is no empty space under it */
    const size = () => {
      const top = st.getBoundingClientRect().top + window.scrollY
      setHeight(Math.round(Math.max(window.innerHeight - top - 16, 420)))
    }
    size()
    const ro = new ResizeObserver(() => {
      size()
      requestAnimationFrame(() => fit())
    })
    ro.observe(st)
    /* orientation / window size changes; small changes from the phone's
       address bar showing and hiding are ignored so the chart doesn't jump */
    let lastH = window.innerHeight
    const onResize = () => {
      if (Math.abs(window.innerHeight - lastH) < 90) return
      lastH = window.innerHeight
      size()
    }
    window.addEventListener('resize', onResize)
    document.fonts?.ready.then(() => {
      size()
      requestAnimationFrame(() => fit())
    })
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [fit])

  useLayoutEffect(() => {
    fit()
  }, [height, fit])

  /* pointers: one finger / mouse drags, two fingers pinch */
  useEffect(() => {
    const st = stage.current
    if (!st) return
    const pts = new Map<number, { x: number; y: number }>()
    let start: { view: View; dist: number; mid: { x: number; y: number }; p: { x: number; y: number } } | null = null
    let moved = false

    const local = (e: { clientX: number; clientY: number }) => {
      const r = st.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const begin = () => {
      const list = [...pts.values()]
      const a = list[0]
      const b = list[1] ?? a
      start = {
        view: { ...view.current },
        dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        p: a,
      }
    }
    const down = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return
      if ((e.target as HTMLElement).closest('.tm-zoom')) return
      pts.set(e.pointerId, local(e))
      if (pts.size === 1) moved = false
      begin()
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
      window.addEventListener('pointercancel', up)
    }
    const move = (e: PointerEvent) => {
      if (!pts.has(e.pointerId) || !start) return
      pts.set(e.pointerId, local(e))
      const list = [...pts.values()]
      if (list.length >= 2) {
        moved = true
        const [a, b] = list
        const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
        const s = Math.min(Math.max(start.view.s * (dist / start.dist), fitScale.current * 0.9), MAX_SCALE)
        const k = s / start.view.s
        apply({ s, x: mid.x - (start.mid.x - start.view.x) * k, y: mid.y - (start.mid.y - start.view.y) * k })
      } else {
        const p = list[0]
        const dx = p.x - start.p.x
        const dy = p.y - start.p.y
        if (Math.abs(dx) + Math.abs(dy) > 6) moved = true
        if (moved) apply({ s: start.view.s, x: start.view.x + dx, y: start.view.y + dy })
      }
      if (moved) st.dataset.dragging = ''
    }
    const up = (e: PointerEvent) => {
      pts.delete(e.pointerId)
      if (pts.size) begin()
      else {
        start = null
        delete st.dataset.dragging
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        window.removeEventListener('pointercancel', up)
      }
    }
    /* a drag must not also open the person under the finger */
    const click = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault()
        e.stopPropagation()
        moved = false
      }
    }
    /* trackpad pinch (ctrl + wheel) zooms; a plain wheel still scrolls the page */
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return
      e.preventDefault()
      const p = local(e)
      zoomAt(p.x, p.y, Math.exp(-e.deltaY * 0.01))
    }

    st.addEventListener('pointerdown', down)
    st.addEventListener('click', click, true)
    st.addEventListener('wheel', wheel, { passive: false })
    return () => {
      st.removeEventListener('pointerdown', down)
      st.removeEventListener('click', click, true)
      st.removeEventListener('wheel', wheel)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [apply, zoomAt])

  const center = () => {
    const st = stage.current
    return st ? { x: st.clientWidth / 2, y: (st.clientHeight - BAR) / 2 } : { x: 0, y: 0 }
  }

  return (
    <div className="tm-stage" ref={stage} style={{ height }}>
      <div className="tm-canvas" ref={canvas}>
        {children}
      </div>

      <div className="tm-zoom">
        <button type="button" aria-label="تصغير" onClick={() => zoomAt(center().x, center().y, 1 / 1.3, true)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 12H18" />
          </svg>
        </button>
        <span className="tm-zoom-pct" aria-live="polite">
          {ar(pct)}٪
        </span>
        <button type="button" aria-label="تكبير" onClick={() => zoomAt(center().x, center().y, 1.3, true)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 12H18M12 6V18" />
          </svg>
        </button>
        <button type="button" className="tm-zoom-fit" onClick={() => fit(true)}>
          الهيكل كامل
        </button>
      </div>
    </div>
  )
}

/* ================================================================
   the person's card (over the page, no route change)
   ================================================================ */

function PersonCard({ opened, onClose }: { opened: Opened | null; onClose: () => void }) {
  const [last, setLast] = useState<Opened | null>(opened)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [sharing, setSharing] = useState(false)
  const stopSharing = useCallback(() => setSharing(false), [])
  if (opened && opened !== last) setLast(opened)
  if (!opened && sharing) setSharing(false)
  const o = opened ?? last
  const isOpen = !!opened

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus({ preventScroll: true })
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', key)
    }
  }, [isOpen, onClose])

  if (typeof document === 'undefined' || !o) return null
  /* the person's own LinkedIn if it has been added; until then, a LinkedIn
     people search for their name */
  const own = o.person.linkedin?.trim()
  const link = own || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(o.person.name)}`
  const t = isOpen ? 0 : -1

  return createPortal(
    <div className="tm-card-layer" data-open={isOpen ? '' : undefined} aria-hidden={!isOpen}>
      <div className="tm-card-dim" onClick={onClose} />
      <div className="tm-card" role="dialog" aria-modal="true" aria-label={o.person.name}>
        <div className="tm-card-band" aria-hidden="true">
          <svg viewBox="0 0 360 110" preserveAspectRatio="none">
            <path d="M-10 92 C 70 92, 110 40, 190 46 S 300 20, 370 8" />
            <path d="M-10 104 C 80 102, 130 62, 200 64 S 310 42, 370 30" />
          </svg>
        </div>

        <button ref={closeRef} type="button" className="tm-card-close" onClick={onClose} aria-label="إغلاق" tabIndex={t}>
          {ICON.close}
        </button>

        <div className="tm-card-head">
          <Avatar person={o.person} className="tm-av--card" />
          <span className="tm-card-role">{o.title}</span>
          <h2 className="tm-card-name">{o.person.name}</h2>
        </div>

        {(o.department || o.committee) && (
          <dl className="tm-card-info">
            {o.department && (
              <div>
                <span className="tm-card-ic">{ICON.dept}</span>
                <dt>الإدارة</dt>
                <dd>{o.department}</dd>
              </div>
            )}
            {o.committee && (
              <div>
                <span className="tm-card-ic">{ICON.comm}</span>
                <dt>اللجنة</dt>
                <dd>{o.committee}</dd>
              </div>
            )}
          </dl>
        )}

        <a className="tm-card-link" href={link} target="_blank" rel="noreferrer" tabIndex={t}>
          <span className="tm-in" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="7" cy="6.8" r="1.7" />
              <rect x="5.5" y="9.6" width="3" height="9.4" rx="0.6" />
              <path d="M10.8 9.6H13.7V10.9C14.2 10 15.3 9.3 16.8 9.3C19.4 9.3 20.3 11 20.3 13.6V19H17.3V14.3C17.3 13.1 17 12.2 15.8 12.2C14.6 12.2 13.9 13.1 13.9 14.3V19H10.8Z" />
            </svg>
          </span>
          <span className="tm-card-link-text">
            <span dir="ltr">LinkedIn</span>
            <small>{own ? 'عرض الملف الشخصي' : 'البحث عن الملف الشخصي'}</small>
          </span>
          <i className="tm-card-arrow">{ICON.arrow}</i>
        </a>

        {/* a ready image and link to share their place in the team */}
        <button type="button" className="tm-card-share" onClick={() => setSharing(true)} tabIndex={t}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v12M7.5 7.5L12 3l4.5 4.5" />
            <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
          </svg>
          شارك وجودك في فريق مسار
        </button>
      </div>
      {sharing && isOpen && <ShareSheet member={o} onClose={stopSharing} />}
    </div>,
    document.body
  )
}

/* ================================================================
   a committee's members (/team?committee=<id>)
   ================================================================ */

function findCommittee(id: string) {
  for (const d of DEPARTMENTS) {
    const c = d.committees.find((x) => x.id === id)
    if (c) return { c, department: d.name }
  }
  const c = DIRECT_COMMITTEES.find((x) => x.id === id)
  return c ? { c, department: 'الإدارة العليا' } : null
}

function MembersView({ id, open }: { id: string; open: (o: Opened) => void }) {
  const found = findCommittee(id)
  const cols = useRef<HTMLDivElement>(null)

  /* the middle line stops at the centre of the lowest box */
  useLayoutEffect(() => {
    const el = cols.current
    if (!el) return
    const fit = () => {
      const lasts = [...el.querySelectorAll<HTMLElement>('.tm-mcol > li:last-child')]
      if (!lasts.length) return
      const box = el.getBoundingClientRect()
      const lowest = Math.max(...lasts.map((li) => {
        const r = li.getBoundingClientRect()
        return r.top + r.height / 2
      }))
      el.style.setProperty('--tm-spine-end', `${Math.max(0, box.bottom - lowest)}px`)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [id])
  if (!found) {
    return (
      <div className="tm-wrap">
        <Link to="/team" className="tm-back tm-in-anim">
          {ICON.back}
          فريق مسار
        </Link>
        <p className="tm-missing">اللجنة غير موجودة</p>
      </div>
    )
  }
  const { c, department } = found
  const at = (p: Person, fallback: string) => () => open({ person: p, title: p.role || fallback, department, committee: c.name })

  return (
    <div className="tm-wrap">
      <Link to="/team" className="tm-back tm-in-anim">
        {ICON.back}
        فريق مسار
      </Link>
      <h1 className="tm-title tm-in-anim">أعضاء {c.name}</h1>
      <p className="tm-sub tm-in-anim">
        {department} · {countLabel(c.members.length)}
      </p>

      {/* the committee as a small tree: its name, the lead, the deputy
          (if any), then the members in two columns, each hanging from its
          own line */}
      <div className="tm-mtree">
        <div className="tm-mtree-top tm-in-anim">
          <div className="tm-node tm-comm">
            <span className="tm-ic">{ICON.comm}</span>
            <span className="tm-node-name">{c.name}</span>
          </div>
          {c.lead && (
            <>
              <i />
              <PersonNode big person={c.lead} title={c.lead.role || 'قائد اللجنة'} onOpen={at(c.lead, 'قائد اللجنة')} />
            </>
          )}
          {c.deputy && (
            <>
              <i />
              <PersonNode big person={c.deputy} title={c.deputy.role || 'نائب اللجنة'} onOpen={at(c.deputy, 'نائب اللجنة')} />
            </>
          )}
          <i />
        </div>

        <div className="tm-mcols" ref={cols}>
          {[c.members.slice(0, Math.ceil(c.members.length / 2)), c.members.slice(Math.ceil(c.members.length / 2))].map((col, k) => (
            <ul key={k} className="tm-mcol">
              {col.map((m) => (
                <li key={m.name} className="tm-tile-in">
                  <PersonNode person={m} title={m.role || 'عضو'} onOpen={at(m, 'عضو')} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   page
   ================================================================ */

export default function TeamPage() {
  const root = useRef<HTMLElement>(null)
  const [params] = useSearchParams()
  const committee = params.get('committee')
  const [opened, setOpened] = useState<Opened | null>(null)
  const close = useCallback(() => setOpened(null), [])

  /* /team?m=<name> opens the page on that person's card (the shared link) */
  const shared = params.get('m')
  useEffect(() => {
    if (!shared) return
    const found = roster().find((r) => memberKey(r.person.name) === shared || r.person.name === shared)
    if (found) setOpened(found)
  }, [shared])

  /* each view starts at the top */
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [committee])

  /* entrance */
  useLayoutEffect(() => {
    const el = root.current
    if (!el || reduced()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.tm-in-anim', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.07, delay: 0.1 })
      gsap.fromTo('.tm-tile-in', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.03, delay: 0.3 })
      gsap.fromTo('.tm-org .tm-node', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.008, delay: 0.25 })
    }, el)
    return () => ctx.revert()
  }, [committee])

  /* on the team pages the navbar logo steps aside (its place is kept,
     so the menu button does not move) */
  useLayoutEffect(() => {
    document.body.classList.add('tm-page')
    return () => document.body.classList.remove('tm-page')
  }, [])

  return (
    <main ref={root} className={committee ? 'tm' : 'tm tm--chart'}>
      {committee ? (
        <MembersView id={committee} open={setOpened} />
      ) : (
        <>
          <div className="tm-wrap tm-head tmh">
            <p className="tmh-label tm-in-anim">فريق مسار</p>
            <h1 className="tmh-title tm-in-anim">الهيكل التنظيمي للمبادرة</h1>
            <span className="tmh-tear tm-in-anim" aria-hidden="true" />
            <p className="tmh-sub tm-in-anim">اضغط على أي اسم لعرض بطاقته</p>
          </div>
          <div className="tm-wrap tm-wrap--wide tm-in-anim">
            <ZoomFrame>
              <Chart open={setOpened} />
            </ZoomFrame>
          </div>
        </>
      )}

      <PersonCard opened={opened} onClose={close} />
    </main>
  )
}