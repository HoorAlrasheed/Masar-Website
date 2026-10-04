import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import { gsap } from 'gsap'

import { NEWS, type NewsCategory, type NewsItem } from '../data/news'

import './NewsPage.css'

/* =================================================================
   /news      — الإعلانات والمستجدات, every item printed as a ticket
   /news/:id  — the ticket opened in full

   Each kind of news has its own ticket stock (colour), so the page
   reads like a small collection of event tickets.
   Everything is written in data/news.ts.
   ================================================================= */

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ticket stocks: muted blues from navy to mist, never bright — the
   tickets take turns, like a printed set */
type Stock = { paper: string; ink: string; soft: string; line: string }
const STOCKS: Stock[] = [
  { paper: '#8ea3b7', ink: '#132436', soft: '#2f465b', line: 'rgba(19,36,54,.22)' }, // dusty blue
  { paper: '#3d5468', ink: '#ece6da', soft: '#b3c1cd', line: 'rgba(236,230,218,.24)' }, // muted navy
  { paper: '#b7c5d1', ink: '#132436', soft: '#45596b', line: 'rgba(19,36,54,.2)' }, // mist
  { paper: '#62798f', ink: '#f0eadf', soft: '#d0d9e1', line: 'rgba(240,234,223,.26)' }, // slate blue
]
const stockOf = (item: NewsItem) => STOCKS[Math.max(0, NEWS.indexOf(item)) % STOCKS.length]
const vars = (st: Stock) => ({ '--tk-paper': st.paper, '--tk-ink': st.ink, '--tk-soft': st.soft, '--tk-line': st.line }) as CSSProperties

const MONTHS = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة']
const toLatin = (s: string) => s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))

/* "١٠ محرم ١٤٤٧" → { day: '10', month: 'محرم', year: '1447' } */
function splitDate(date: string) {
  const t = toLatin(date).trim()
  const day = (t.match(/^\d+/) ?? [''])[0]
  const year = (t.match(/\d+$/) ?? [''])[0]
  const month = MONTHS.find((m) => t.includes(m)) ?? t.replace(day, '').replace(year, '').trim()
  return { day: day ? day.padStart(2, '0') : '؟؟', month, year }
}

/* a barcode that is always the same for the same ticket */
function Barcode({ seed, vertical }: { seed: number; vertical?: boolean }) {
  let x = 0
  let s = seed * 9301 + 49297
  const bars: { x: number; w: number }[] = []
  while (x < 118) {
    s = (s * 9301 + 49297) % 233280
    const w = 1 + (s % 3)
    bars.push({ x, w })
    s = (s * 9301 + 49297) % 233280
    x += w + 1 + (s % 3)
  }
  return (
    <svg className={vertical ? 'tk-bar tk-bar--v' : 'tk-bar'} viewBox={vertical ? '0 0 40 120' : '0 0 120 40'} preserveAspectRatio="none" aria-hidden="true">
      {bars.map((b, i) =>
        vertical ? <rect key={i} x="0" y={b.x} width="40" height={b.w} fill="currentColor" /> : <rect key={i} x={b.x} y="0" width={b.w} height="40" fill="currentColor" />,
      )}
    </svg>
  )
}

function Picture({ item }: { item: NewsItem }) {
  return (
    <span className="tk-pic">
      {item.image ? (
        <img src={item.image} alt="" loading="lazy" draggable={false} style={item.focus ? { objectPosition: item.focus } : undefined} />
      ) : (
        <span className="tk-pic-empty" aria-hidden="true" />
      )}
      <i className="tk-hole tk-hole--a" aria-hidden="true" />
      <i className="tk-hole tk-hole--b" aria-hidden="true" />
    </span>
  )
}

/* a ticket on the list: a wide picture band, then one printed line of
   details — the date, the title, the barcode */
/* a ticket for something not announced yet: the picture is hidden,
   a "قريبًا" stamp sits on it, and it does not open */
function TeaserTicket({ item }: { item: NewsItem }) {
  const d = splitDate(item.date)
  return (
    <div className="tk tk--teaser" style={vars(stockOf(item))} aria-label={`${item.title}. ${item.summary}`}>
      <span className="tk-band">
        {item.image ? <img src={item.image} alt="" draggable={false} /> : <span className="tk-band-empty" aria-hidden="true" />}
        <span className="tk-stamp" aria-hidden="true">
          قريبًا
        </span>
      </span>
      <span className="tk-row">
        <span className="tk-day">
          <b>{d.day}</b>
          <span>
            {d.month}
            <small>{d.year}</small>
          </span>
        </span>
        <span className="tk-mid">
          <span className="tk-title">{item.title}</span>
          <span className="tk-kind">{item.summary}</span>
        </span>
        <span className="tk-code tk-code--hidden">
          <Barcode seed={item.id} />
          <small>— — — —</small>
        </span>
      </span>
    </div>
  )
}

function Ticket({ item }: { item: NewsItem }) {
  const d = splitDate(item.date)
  return (
    <Link to={`/news/${item.id}`} className="tk" style={vars(stockOf(item))}>
      <span className="tk-more" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 6.5L9 12l5.5 5.5" />
        </svg>
      </span>
      <span className="tk-band">
        {item.image ? (
          <img src={item.image} alt="" loading="lazy" draggable={false} style={item.focus ? { objectPosition: item.focus } : undefined} />
        ) : (
          <span className="tk-band-empty" aria-hidden="true" />
        )}
      </span>
      <span className="tk-row">
        <span className="tk-day">
          <b>{d.day}</b>
          <span>
            {d.month}
            <small>{d.year}</small>
          </span>
        </span>
        <span className="tk-mid">
          <span className="tk-title">{item.title}</span>
          <span className="tk-kind">{item.category}</span>
        </span>
        <span className="tk-code">
          <Barcode seed={item.id} />
          <small>{`0${item.id}4${item.id}7 ${d.year} ${String(item.id).padStart(4, '0')}`}</small>
        </span>
      </span>
    </Link>
  )
}

/* ---------- one ticket in full ---------- */

function Article({ item }: { item: NewsItem }) {
  const root = useRef<HTMLElement>(null)
  const d = splitDate(item.date)
  const body = item.body?.length ? item.body : [item.summary]
  const style = vars(stockOf(item))

  /* while reading a ticket, the navbar logo steps aside */
  useLayoutEffect(() => {
    document.body.classList.add('tk-reading')
    return () => document.body.classList.remove('tk-reading')
  }, [])

  useLayoutEffect(() => {
    const el = root.current
    if (!el || reduced()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.tk-open', { opacity: 0, y: 40, rotate: -2 }, { opacity: 1, y: 0, rotate: 0, duration: 0.9, ease: 'power3.out' })
    }, el)
    return () => ctx.revert()
  }, [item.id])

  return (
    <main className="tkp" ref={root}>
      <div className="tkp-wrap">
        <Link to="/news" className="tkp-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
          كل الإعلانات
        </Link>

        <article className="tk-open" style={style}>
          <Picture item={item} />
          <div className="tk-open-head">
            <span className="tk-date">
              <b>{d.day}</b>
              <i aria-hidden="true" />
              <span>
                {d.month}
                <small>{d.year}</small>
              </span>
            </span>
            <span className="tk-kind">{item.category}</span>
          </div>
          <h1 className="tk-open-title">{item.title}</h1>
          <div className="tk-open-body">
            {body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="tk-open-stub">
            <span className="tk-stub-text">
              <span className="tk-org">مبادرة مسار</span>
              <span className="tk-no">No. {String(item.id).padStart(4, '0')}</span>
            </span>
            <Barcode seed={item.id} />
          </div>
        </article>
      </div>
    </main>
  )
}

/* ---------- the page ---------- */

export default function NewsPage() {
  const { id } = useParams()
  const opened = id ? NEWS.find((n) => String(n.id) === id && !n.teaser) : undefined
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el || opened || reduced()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.tkp-head > *', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 })
      /* the tickets are dealt onto the table, one after another */
      gsap.fromTo(
        '.tk',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, delay: 0.25 },
      )
    }, el)
    return () => ctx.revert()
  }, [opened])

  if (opened) return <Article item={opened} />

  return (
    <main className="tkp" ref={root}>
      <div className="tkp-wrap">
        <div className="tkp-head">
          <p className="tkp-label">الإعلانات والمستجدات</p>
          <h1 className="tkp-title">تذكرتك إلى كل جديد في مسار</h1>
          <span className="tkp-tear" aria-hidden="true" />
          <p className="tkp-sub">اضغط على أي تذكرة لتقرأ تفاصيلها</p>
        </div>

        {NEWS.length ? (
          <div className="tk-list">
            {NEWS.map((n) => (n.teaser ? <TeaserTicket key={n.id} item={n} /> : <Ticket key={n.id} item={n} />))}
          </div>
        ) : (
          <p className="tkp-empty">لا توجد إعلانات الآن، وستظهر هنا عند نشرها.</p>
        )}
      </div>
    </main>
  )
}