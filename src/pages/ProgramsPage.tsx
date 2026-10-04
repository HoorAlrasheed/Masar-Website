import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { gsap } from 'gsap'

import { programs, type Program } from '../data'
import { NEWS, type NewsCategory, type NewsItem } from '../data/news'
import { ICONS, ProgramArt, joinLink, mapLink, partnerRef, type ProgramStatus } from '../components/ProgramBits'

import './ProgramsPage.css'
import './ProgramsSlices.css'

/* =================================================================
   /programs — الفعاليات والبرامج
   One box of slices per kind of programme (جلسات حوارية, ورش العمل…),
   one under the other. In each box the cover carries the kind's name
   sideways, then every programme is a slice with its name on its side.
   Each box opens on its last slice (the one on the left); tap another
   slice and it widens instead.
   A box always has at least 4 slices: the empty ones say "قريبًا".
   The events of each kind that already happened (from the news) fill
   the box too, newest on the left — so adding a new one moves the rest
   one slice to the right.
   Everything is written in data/index.ts (programs).
   ================================================================= */

/* the boxes, in this order — add a kind here to give it its own box
   (a kind with no programmes yet shows a box of "قريبًا") */
const GROUPS = ['جلسات حوارية', 'زيارات', 'هاكاثونات', 'ورش العمل']

/* how many slices a box shows (besides its cover). It always keeps the
   newest: when a new event is added it takes the last slice (on the
   left, the one that opens), the one before it moves one slice to the
   right, and the oldest drops out of the box. Empty places say "قريبًا". */
const SLICES = 4

/* which kind of news (in data/news.ts) is a past event of which box */
const PAST: Record<string, NewsCategory> = {
  'جلسات حوارية': 'جلسة حوارية',
  زيارات: 'زيارة',
  هاكاثونات: 'هاكاثون',
  'ورش العمل': 'ورشة عمل',
}
/* the events of a kind that already happened, oldest first
   (news.ts lists the newest first) */
const pastEvents = (kind: string) => {
  const c = PAST[kind]
  return c ? NEWS.filter((n) => n.category === c && !n.teaser).reverse() : []
}

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* each box has its own family of colours. All four are made the same way
   (the same softness and the same four steps from light on the right to
   dark on the left); only the colour moves, one even step per box, from
   blue through blue-grey to purple — so the page reads as one gradient */
type Stock = { paper: string; ink: string; soft: string; line: string }
const light = (paper: string, soft: string): Stock => ({ paper, ink: '#132436', soft, line: 'rgba(19,36,54,.2)' })
const dark = (paper: string, soft: string): Stock => ({ paper, ink: '#f0eadf', soft, line: 'rgba(240,234,223,.24)' })
const FAMILIES: Stock[][] = [
  /* blue */
  [light('#c5d3dd', '#405f77'), light('#97b0c4', '#30485a'), dark('#68869c', '#d7e2ea'), dark('#415c71', '#b6c9d8')],
  /* blue-grey */
  [light('#c8d0da', '#465872'), light('#9baabf', '#344255'), dark('#6f7f95', '#d9dfe8'), dark('#47566c', '#b9c5d4')],
  /* grey-lavender */
  [light('#c8cdda', '#465272'), light('#9ba5bf', '#343d55'), dark('#6f7995', '#d9dde8'), dark('#47516c', '#b9c1d4')],
  /* purple */
  [light('#c6c8dc', '#424776'), light('#989cc3', '#323558'), dark('#6a6f9a', '#d8dae9'), dark('#434770', '#b7bad7')],
]
/* the last slice (on the left) is always the darkest, whatever the count */
const stockAt = (family: number, i: number, count: number) => {
  const f = FAMILIES[family % FAMILIES.length]
  return f[Math.max(0, f.length - count + i) % f.length]
}
const vars = (st: Stock, i: number) =>
  ({ '--sl-paper': st.paper, '--sl-ink': st.ink, '--sl-soft': st.soft, '--sl-line': st.line, zIndex: i + 2 }) as CSSProperties

/* the ended ones first, the open ones last — so the slice that opens
   (the last one) is the most current */
const ORDER: Record<ProgramStatus, number> = { closed: 0, soon: 1, open: 2 }

const AR = '٠١٢٣٤٥٦٧٨٩'
const ar = (n: number) => String(n).padStart(2, '0').replace(/\d/g, (d) => AR[+d])

/* how many programmes a box holds, said the Arabic way */
const count = (n: number) =>
  n === 0 ? 'قريبًا' : n === 1 ? 'برنامج واحد' : n === 2 ? 'برنامجان' : n <= 10 ? `${ar(n)} برامج` : `${ar(n)} برنامجًا`

/* 'جلسة حوارية: التخطيط المهني المبكر' → kind + name */
function splitTitle(title: string, category: string) {
  const i = title.indexOf(':')
  return i > 0 ? { kind: title.slice(0, i).trim(), name: title.slice(i + 1).trim() } : { kind: category, name: title }
}

/* ---------- one box: a kind of programme ---------- */

/* the open slice's foot: the date, the place (opens Google Maps), and the
   registration button — "سجّل الآن" while open, otherwise what it is */
const ACTION: Record<ProgramStatus, string> = { open: 'سجّل الآن', soon: 'قريبًا', closed: 'أُغلق التسجيل' }

function Facts({ date, place, mapUrl, status, on, details, join = '/join' }: { date: string; place?: string; mapUrl?: string; status: ProgramStatus; on: boolean; details: string; join?: string }) {
  return (
    <div className="psl-facts">
      {/* one line: the date on the right, the place on its left */}
      <div className="psl-facts-row">
        <p className="psl-fact">
          {ICONS.date}
          <span>{date}</span>
        </p>
        {place && (
          <p className="psl-fact">
            {ICONS.place}
            <a
              href={mapLink({ location: place, mapUrl })}
              target="_blank"
              rel="noopener noreferrer"
              className="psl-map"
              tabIndex={on ? 0 : -1}
              onClick={(e) => e.stopPropagation()}
            >
              {place}
            </a>
          </p>
        )}
      </div>
      {/* two buttons: the details always, and registration beside it */}
      <div className="psl-btns">
        <Link to={details} className="psl-btn psl-btn--details" tabIndex={on ? 0 : -1}>
          التفاصيل
        </Link>
        {status === 'open' ? (
          <Link to={join} className="psl-btn" tabIndex={on ? 0 : -1}>
            {ACTION.open}
          </Link>
        ) : (
          <span className="psl-btn" aria-disabled="true">
            {ACTION[status]}
          </span>
        )}
      </div>
    </div>
  )
}

type Slice = { program: Program } | { past: NewsItem } | null

function Box({ name, items, family }: { name: string; items: Program[]; family: number }) {
  const [search] = useSearchParams()
  const ref = partnerRef(search)
  const sorted = [...items].sort((a, b) => ORDER[a.status] - ORDER[b.status])
  const past = pastEvents(name)
  const latest = past[past.length - 1]
  /* oldest to newest, right to left: what happened, then the programmes
     coming up — only the newest SLICES are kept, and the empty places
     come first (on the right), so the box opens on the newest */
  const filled: Slice[] = [...past.map((n) => ({ past: n })), ...sorted.map((program) => ({ program }))].slice(-SLICES)
  const empty = Math.max(0, SLICES - filled.length)
  const slices: Slice[] = [...Array<null>(empty).fill(null), ...filled]
  const [open, setOpen] = useState(slices.length - 1)

  /* the open programme keeps one fixed width while its slice glides open,
     so its photo and words stand still — the slice simply uncovers them */
  const box = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => {
      const c = el.querySelector<HTMLElement>('.psl-slice[data-on] .psl-clip')
      if (c && c.clientWidth) el.style.setProperty('--full-w', `${c.clientWidth}px`)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* every picture in the box is ready before its slice is opened */
  useLayoutEffect(() => {
    box.current?.querySelectorAll('img').forEach((img) => {
      img.loading = 'eager'
    })
  }, [])

  return (
    <section className="psl-box" ref={box} style={{ '--n': slices.length } as CSSProperties} aria-label={name}>
      <div className="psl-cover">
        <b>{name}</b>
        <small>{sorted.length ? count(sorted.length) : past.length ? 'آخر الأحداث' : 'قريبًا'}</small>
      </div>

      {slices.map((p, i) => {
        const on = open === i
        const no = String(i + 1).padStart(2, '0')
        const style = vars(stockAt(family, i, slices.length), i)

        /* an empty place: it says "soon" and opens to say so */
        if (!p) {
          return (
            <article key={`soon-${i}`} className="psl-slice psl-slice--soon" data-on={on ? '' : undefined} style={style} onClick={() => setOpen(i)}>
              <span className="psl-tab" aria-hidden="true">
                {no} //
              </span>
              <button type="button" className="psl-side" aria-expanded={on} aria-label={`${name}: قريبًا`} tabIndex={on ? -1 : 0}>
                <b>قريبًا</b>
                <small>يُعلن عنه</small>
              </button>
              <div className="psl-clip">
              <div className="psl-full psl-full--soon" aria-hidden={!on}>
                <span className="psl-code">PROGRAM_{no} //</span>
                <span className="psl-kind">{name}</span>
                <div className="psl-soon-art">
                  <span>قريبًا</span>
                </div>
                <p className="psl-desc">نجهّز برنامجًا جديدًا هنا، وسنعلن عنه في الإعلانات والمستجدات.</p>
              </div>
              </div>
            </article>
          )
        }

        /* an event of this kind that already happened (from data/news.ts) */
        if ('past' in p) {
          const n = p.past
          const last = n === latest
          const tag = last ? 'آخر حدث' : 'أُقيم'
          /* the place is shown under it, so the title drops "في مساحة …" */
          const title = n.place ? n.title.replace(` في ${n.place}`, '').trim() : n.title
          return (
            <article key={`past-${n.id}`} className="psl-slice" data-on={on ? '' : undefined} style={style} onClick={() => setOpen(i)}>
              <span className="psl-tab" aria-hidden="true">
                {no} //
              </span>
              <button type="button" className="psl-side" aria-expanded={on} aria-label={`${tag}: ${title}`} tabIndex={on ? -1 : 0}>
                <b>{title}</b>
                <small>{tag}</small>
              </button>
              <div className="psl-clip">
              <div className="psl-full" aria-hidden={!on}>
                <span className="psl-code">{last ? 'LAST_EVENT' : `EVENT_${no}`} //</span>
                <span className="psl-kind">{last ? `آخر حدث · ${n.category}` : n.category}</span>
                <h3 className="psl-name">
                  <Link to={`/programs/e${n.id}`} className="psl-open" tabIndex={on ? 0 : -1}>
                    {title}
                  </Link>
                </h3>
                <Link to={`/programs/e${n.id}`} className="psl-art-link" tabIndex={-1} aria-hidden="true">
                <div className="prg-art psl-art" aria-hidden="true">
                  {n.image ? (
                    <img className="prg-art-img" src={n.image} alt="" draggable={false} style={n.focus ? { objectPosition: n.focus } : undefined} />
                  ) : null}
                  <span className="prg-badge" data-status="closed">
                    أُقيم
                  </span>
                </div>
                </Link>
                <Facts date={n.date} place={n.place} mapUrl={n.mapUrl} status="closed" on={on} details={`/programs/e${n.id}`} />
              </div>
              </div>
            </article>
          )
        }

        const pr = p.program
        const t = splitTitle(pr.title, pr.category)
        return (
          <article key={pr.id} className="psl-slice" data-on={on ? '' : undefined} style={style} onClick={() => setOpen(i)}>
            <span className="psl-tab" aria-hidden="true">
              {no} //
            </span>

            {/* closed: the name printed sideways */}
            <button type="button" className="psl-side" aria-expanded={on} aria-label={`${t.kind}: ${t.name}`} tabIndex={on ? -1 : 0}>
              <b>{t.name}</b>
              <small>{t.kind}</small>
            </button>

            {/* open: the programme */}
            <div className="psl-clip">
            <div className="psl-full" aria-hidden={!on}>
              <span className="psl-code">PROGRAM_{no} //</span>
              <span className="psl-kind">{t.kind}</span>
              {/* the title and the picture open the programme's page */}
              <h3 className="psl-name">
                <Link to={`/programs/${pr.id}`} className="psl-open" tabIndex={on ? 0 : -1}>
                  {t.name}
                </Link>
              </h3>
              <Link to={`/programs/${pr.id}`} className="psl-art-link" tabIndex={-1} aria-hidden="true">
                <ProgramArt category={pr.category} status={pr.status} image={pr.image} className="psl-art" />
              </Link>
              <Facts date={pr.date} place={pr.location} mapUrl={pr.mapUrl} status={pr.status} on={on} details={`/programs/${pr.id}`} join={joinLink(pr.title, ref)} />
            </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}

/* ---------- the page ---------- */

export default function ProgramsPage() {
  const root = useRef<HTMLElement>(null)

  /* every kind in GROUPS, then any other kind found in the data */
  const kinds = [...GROUPS, ...Array.from(new Set(programs.map((p) => p.category))).filter((c) => !GROUPS.includes(c))]

  /* the navbar logo steps aside on this page (the menu stays on the left) */
  useLayoutEffect(() => {
    document.body.classList.add('psl-page')
    return () => document.body.classList.remove('psl-page')
  }, [])

  /* entrance: the header, then each box's slices stand up as it comes into view */
  useLayoutEffect(() => {
    const el = root.current
    if (!el || reduced()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.psl-head > *', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 })
    }, el)

    const boxes = Array.from(el.querySelectorAll<HTMLElement>('.psl-box'))
    boxes.forEach((b) => gsap.set(b.querySelectorAll('.psl-cover, .psl-slice'), { opacity: 0, y: 40 }))
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          io.unobserve(e.target)
          gsap.to(e.target.querySelectorAll('.psl-cover, .psl-slice'), { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 })
        })
      },
      { threshold: 0.15 },
    )
    boxes.forEach((b) => io.observe(b))

    return () => {
      io.disconnect()
      ctx.revert()
      boxes.forEach((b) => gsap.set(b.querySelectorAll('.psl-cover, .psl-slice'), { clearProps: 'opacity,transform' }))
    }
  }, [])

  return (
    <main className="psl" ref={root}>
      <div className="psl-wrap">
        <div className="psl-head">
          <p className="psl-label">الفعاليات والبرامج</p>
          <h1 className="psl-title">برامج تصنع لك مسارًا أوضح</h1>
          <span className="psl-tear" aria-hidden="true" />
          <p className="psl-sub">اضغط على أي شريحة لتفتحها</p>
        </div>

        <div className="psl-boxes">
          {kinds.map((k, i) => (
            <Box key={k} name={k} family={i} items={programs.filter((p) => p.category === k)} />
          ))}
        </div>
      </div>
    </main>
  )
}