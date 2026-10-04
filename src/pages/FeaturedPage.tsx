import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { FEATURED_DEPARTMENTS, MONTHS, type DepartmentId, type FeaturedPerson } from '../data/featuredMonths'

import PageHead from '../components/PageHead'
import calendarPhoto from '../imports/featured-seat-blue.jpg'
import pathPhoto from '../imports/featured-path.jpg'

/* the tickets' pictures: the two photos themselves, each ticket looking
   closely at one spot of them. x / y = the spot to centre (0–1 across and
   down the photo), zoom = how close (1 = the photo's full width).
   A person's own photo, when given, takes the place. */
const PATH_VIEWS = [
  { x: 0.56, y: 0.62, zoom: 1.7 }, // the walker and his shadow
  { x: 0.42, y: 0.5, zoom: 1.05 }, // the whole road of light
  { x: 0.52, y: 0.58, zoom: 2.5 }, // the walker, close
  { x: 0.62, y: 0.66, zoom: 1.35 },
]
const SEAT_VIEWS = [
  { x: 0.49, y: 0.83, zoom: 2.3 }, // the blue seat, close
  { x: 0.36, y: 0.32, zoom: 1.4 }, // the beam of light
  { x: 0.49, y: 0.74, zoom: 1.35 }, // the seat among the rows
  { x: 0.25, y: 0.1, zoom: 2.4 }, // the window
]
const PHOTO = {
  path: { src: pathPhoto, ratio: 1280 / 1048 },
  seat: { src: calendarPhoto, ratio: 1280 / 944 },
}

/* how many tickets stand in a row: 2 on a phone, 4 on a wide screen */
function useColumns() {
  const q = '(min-width: 720px)'
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const on = () => setWide(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return wide ? 4 : 2
}

/* the picture for the i-th ticket: road and seat set like a chessboard, so
   no two neighbours (side by side or one above the other) share a photo */
function artFor(i: number, cols: number) {
  const row = Math.floor(i / cols)
  const kind = (row + (i % cols)) % 2 ? 'seat' : 'path'
  const n = Math.floor(i / 2)
  const view = (kind === 'path' ? PATH_VIEWS : SEAT_VIEWS)[n % 4]
  const photo = PHOTO[kind]
  /* the frame is 4:3; the photo is laid at zoom × the frame's width */
  const w = view.zoom * 100
  const h = w * photo.ratio * (4 / 3)
  const left = Math.min(0, Math.max(100 - w, 50 - view.x * w))
  const top = Math.min(0, Math.max(100 - h, 50 - view.y * h))
  return { src: photo.src, style: { width: `${w}%`, height: `${h}%`, left: `${left}%`, top: `${top}%` } as CSSProperties }
}
import './FeaturedPage.css'

/* -----------------------------------------------------------------
   /featured — متميزو الشهر (phone first)
   1) the month as a calendar page: the month's number, its name, its
      days — and a heart on the last day, the day we celebrate
   2) the departments as small chips to filter by (الكل first)
   3) each person as a ticket: their letter (or photo), name, committee,
      department and why they stood out; the stub carries their number
   4) an empty ticket waiting for next month — "your name could be here"
   /featured?month=2026-09 opens on a given month.
   Everything to edit lives in src/data/featuredMonths.ts
   ----------------------------------------------------------------- */

const AR = '٠١٢٣٤٥٦٧٨٩'
const ar = (n: number | string) => String(n).replace(/\d/g, (d) => AR[+d])
const two = (n: number) => ar(String(n).padStart(2, '0'))
const initial = (name: string) => name.trim().replace(/^ال/, '').charAt(0)

/* the same line under every name — the team's leaders are thanked for leading */
const MEMBER_LINE = 'تقديرًا لتفاعلٍ مميز وعطاءٍ مستمر طوال الشهر.'
const LEADER_LINE = 'تقديرًا لقيادةٍ ملهمة وأثرٍ واضح في الفريق.'

const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
const WEEK = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']

/* 'YYYY-MM' → the month's facts */
function monthInfo(id: string) {
  const [y, m] = id.split('-').map(Number)
  const year = y || 2026
  const mon = (m || 1) - 1
  const days = new Date(year, mon + 1, 0).getDate()
  const first = new Date(year, mon, 1).getDay() // 0 = Sunday
  const next = new Date(year, mon + 1, 1)
  return { year, mon, name: MONTH_NAMES[mon], days, first, nextName: MONTH_NAMES[next.getMonth()] }
}

/* ---------- icons ---------- */
const Heart = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 20.5S3.5 15.3 3.5 9.2A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8.5 2.2c0 6.1-8.5 11.3-8.5 11.3Z" />
  </svg>
)
const Chevron = ({ dir }: { dir: 'prev' | 'next' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={dir === 'prev' ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'} />
  </svg>
)
const LinkedIn = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6.5 9.5V18M6.5 6.2v.1M10.5 18v-5a3 3 0 0 1 6 0v5M10.5 9.5V18" />
  </svg>
)

/* ================================================================
   the calendar page — after the reference: the month's number at the
   top, its name standing down the side, a photo beside them, the
   week's names between two rules, the days below. The last day has
   a heart drawn round it.
   ================================================================ */

const EN_MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']

function Calendar({ id, canPrev, canNext, onPrev, onNext }: { id: string; canPrev: boolean; canNext: boolean; onPrev: () => void; onNext: () => void }) {
  const m = monthInfo(id)
  const cells: (number | null)[] = [...Array(m.first).fill(null), ...Array.from({ length: m.days }, (_, i) => i + 1)]
  while (cells.length % 7) cells.push(null)

  return (
    <div className="ftc ft-in">
      <div className="ftc-page" key={id}>
        <div className="ftc-top">
          <div className="ftc-side">
            <span className="ftc-no">{String(m.mon + 1).padStart(2, '0')}</span>
            <span className="ftc-en">{EN_MONTHS[m.mon]}</span>
          </div>
          <figure className="ftc-photo">
            <img src={calendarPhoto} alt="" />
            <figcaption>
              {m.name} {ar(m.year)}
            </figcaption>
          </figure>
        </div>

        <div className="ftc-week">
          {WEEK.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="ftc-grid" role="grid" aria-label={`تقويم ${m.name} ${ar(m.year)}`}>
          {cells.map((d, i) =>
            d === m.days ? (
              <span key={i} className="ftc-day ftc-day--heart" role="gridcell" aria-label={`${d} — يوم التكريم`}>
                <svg viewBox="0 0 48 44" aria-hidden="true">
                  <path d="M24 40C12 32 4 25 4 15.5 4 9 9 4.5 15 4.5c4 0 7 2.2 9 5.6 2-3.4 5-5.6 9-5.6 6 0 11 4.5 11 11C44 25 36 32 24 40Z" />
                </svg>
                <b>{d}</b>
              </span>
            ) : (
              <span key={i} className="ftc-day" role="gridcell">
                {d ?? ''}
              </span>
            ),
          )}
        </div>

        <p className="ftc-foot">
          <span>يوم التكريم</span>
          <i aria-hidden="true" />
          <span>
            {ar(m.days)} {m.name}
          </span>
        </p>
      </div>

      {canPrev || canNext ? (
        <div className="ftc-switch">
          <button type="button" onClick={onPrev} disabled={!canPrev} aria-label="الشهر السابق">
            <Chevron dir="prev" />
          </button>
          <span>
            {m.name} {ar(m.year)}
          </span>
          <button type="button" onClick={onNext} disabled={!canNext} aria-label="الشهر التالي">
            <Chevron dir="next" />
          </button>
        </div>
      ) : null}
    </div>
  )
}

/* ================================================================
   a person's ticket — after the reference: the picture at the top
   with two small dots on its corners, the date between a long rule,
   the name in large type, a dotted tear, then "التذكرة" with the
   reason and a barcode
   ================================================================ */

type Row = FeaturedPerson & { dept: string; id: DepartmentId }

/* a barcode that is the same for the same name */
function Barcode({ seed }: { seed: string }) {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  const bars: { x: number; w: number }[] = []
  let x = 0
  while (x < 58) {
    h = Math.imul(h ^ (h >>> 13), 2654435761)
    const w = 0.6 + (Math.abs(h) % 3) * 0.55
    bars.push({ x, w })
    x += w + 0.7 + (Math.abs(h >> 4) % 3) * 0.45
  }
  return (
    <svg className="ftt-code" viewBox="0 0 60 22" preserveAspectRatio="none" aria-hidden="true">
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y="0" width={b.w} height="22" />
      ))}
    </svg>
  )
}

function Ticket({ p, no, month, i, day, art }: { p: Row; no: number; month: { id: string }; i: number; day: number; art: ReturnType<typeof artFor> }) {
  const [y, m] = month.id.split('-')
  return (
    <li className="ftt" data-tone={(no + Math.floor((no - 1) / 2)) % 2 ? 'a' : 'b'} style={{ '--d': `${Math.min(i, 8) * 0.06}s` } as CSSProperties}>
      <article className="ftt-in">
        {/* the ticket's picture: the person's own photo, or a spot of the page's two photos */}
        <div className="ftt-head">
          {p.image ? (
            <img className="ftt-head-art" src={p.image} alt="" loading="lazy" />
          ) : (
            <span className="ftt-head-frame">
              <img className="ftt-head-art ftt-head-art--zoom" src={art.src} alt="" loading="lazy" style={art.style} />
            </span>
          )}
          <span className="ftt-head-heart" aria-hidden="true">
            <Heart />
          </span>
        </div>

        <div className="ftt-date" dir="ltr">
          <span>{day}</span>
          <i aria-hidden="true" />
          <span>
            {m}
            <small>{y}</small>
          </span>
        </div>

        <h3 className="ftt-name">{p.name}</h3>
        <p className="ftt-meta">
          {p.committee}
          <br />
          {p.dept}
        </p>

        <div className="ftt-foot">
          <div>
            <p className="ftt-kind">
              <i aria-hidden="true" />
              متميز الشهر
            </p>
            <p className="ftt-reason">{p.reason || (p.leader ? LEADER_LINE : MEMBER_LINE)}</p>
          </div>
          <Barcode seed={`${p.name}${no}`} />
        </div>

        {p.linkedin ? (
          <a className="ftt-link" href={p.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`لينكدإن ${p.name}`}>
            <LinkedIn />
          </a>
        ) : null}
        <span className="ftt-no" dir="ltr">
          No. {String(no).padStart(2, '0')}
        </span>
      </article>
    </li>
  )
}

/* ================================================================
   page
   ================================================================ */

export default function FeaturedPage() {
  const root = useRef<HTMLElement>(null)
  const [params, setParams] = useSearchParams()
  const [dept, setDept] = useState<DepartmentId | 'all'>('all')
  const cols = useColumns()

  const monthIndex = Math.max(0, MONTHS.findIndex((m) => m.id === params.get('month')))
  const month = MONTHS[monthIndex]

  const rows: Row[] = useMemo(() => {
    if (!month) return []
    return FEATURED_DEPARTMENTS.flatMap((d) => (month.people[d.id] ?? []).map((p) => ({ ...p, dept: d.short, id: d.id })))
  }, [month])

  const counts = useMemo(
    () => Object.fromEntries(FEATURED_DEPARTMENTS.map((d) => [d.id, month?.people[d.id]?.length ?? 0])) as Record<DepartmentId, number>,
    [month],
  )

  const shown =
    dept === 'all'
      ? rows.map((p, i) => ({ p, no: i + 1 }))
      : rows.map((p, i) => ({ p, no: i + 1 })).filter((r) => r.p.id === dept)

  /* a new month starts at the top, on all departments */
  useEffect(() => {
    setDept('all')
  }, [month?.id])

  /* pieces fade in once as they are reached */
  useEffect(() => {
    const el = root.current
    if (!el) return
    const items = el.querySelectorAll<HTMLElement>('.ft-in:not([data-in]), .ftt:not([data-in])')
    if (!('IntersectionObserver' in window)) {
      items.forEach((i) => (i.dataset.in = ''))
      return
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            ;(e.target as HTMLElement).dataset.in = ''
            io.unobserve(e.target)
          }
        }),
      { rootMargin: '0px 0px -8% 0px' },
    )
    items.forEach((i) => io.observe(i))
    return () => io.disconnect()
  }, [month?.id, dept])

  if (!month) {
    return (
      <main ref={root} className="ft">
        <div className="ft-wrap">
          <PageHead label="نحتفي بالعطاء" title="متميزو الشهر" sub="سيتم الإعلان عن متميزي الشهر قريبًا." />
        </div>
      </main>
    )
  }

  const info = monthInfo(month.id)
  const go = (i: number) => setParams({ month: MONTHS[i].id })

  return (
    <main ref={root} className="ft" data-head="d">
      <div className="ft-wrap">
        <PageHead label="نحتفي بالعطاء" title="متميزو الشهر" sub="أسماءٌ صنعت فرقًا هذا الشهر، فاستحقت أن تُكتب هنا." />

        {/* MONTHS is newest first: "previous" is further down the list */}
        <Calendar
          id={month.id}
          canPrev={monthIndex < MONTHS.length - 1}
          canNext={monthIndex > 0}
          onPrev={() => go(monthIndex + 1)}
          onNext={() => go(monthIndex - 1)}
        />

        {/* the departments and committees honoured as a whole */}
        {month.honours && (month.honours.departments.length || month.honours.committees.length) ? (
          <section className="ft-team ft-in" aria-label="التميز الجماعي">
            <p className="ft-team-label">تميّزٌ جماعي</p>
            <h2 className="ft-team-title">فرقٌ صنعت الفرق معًا</h2>
            <div className="ft-team-grid">
              {month.honours.departments.map((id, i) => {
                const d = FEATURED_DEPARTMENTS.find((x) => x.id === id)
                return d ? (
                  <article className="ft-honour" data-tone={i % 2 ? 'b' : 'a'} key={id}>
                    <p className="ft-honour-kind">
                      <Heart />
                      الإدارة المتميزة
                    </p>
                    <h3 className="ft-honour-name">{d.name}</h3>
                    <p className="ft-honour-foot" dir="ltr">
                      <span>{info.days}</span>
                      <i aria-hidden="true" />
                      <span>{month.id.split('-')[1]}</span>
                    </p>
                  </article>
                ) : null
              })}
              {month.honours.committees.map((c, i) => {
                const d = FEATURED_DEPARTMENTS.find((x) => x.id === c.dept)
                return (
                  <article className="ft-honour" data-tone={i % 2 ? 'a' : 'b'} key={c.name}>
                    <p className="ft-honour-kind">
                      <Heart />
                      اللجنة المتميزة
                    </p>
                    <h3 className="ft-honour-name">{c.name}</h3>
                    <p className="ft-honour-sub">{d?.name}</p>
                    <p className="ft-honour-foot" dir="ltr">
                      <span>{info.days}</span>
                      <i aria-hidden="true" />
                      <span>{month.id.split('-')[1]}</span>
                    </p>
                  </article>
                )
              })}
            </div>
          </section>
        ) : null}

        {/* the departments */}
        <div className="ft-chips ft-in" role="tablist" aria-label="الإدارات">
          <button type="button" role="tab" aria-selected={dept === 'all'} onClick={() => setDept('all')}>
            الكل <small>{ar(rows.length)}</small>
          </button>
          {FEATURED_DEPARTMENTS.map((d) => (
            <button key={d.id} type="button" role="tab" aria-selected={dept === d.id} onClick={() => setDept(d.id)} disabled={!counts[d.id]}>
              {d.short} <small>{ar(counts[d.id])}</small>
            </button>
          ))}
        </div>

        {/* the people */}
        {shown.length ? (
          <ol className="ft-tickets" key={`${month.id}-${dept}`}>
            {shown.map(({ p, no }, i) => (
              <Ticket key={`${p.name}-${no}`} p={p} no={no} month={month} i={i} day={info.days} art={artFor(i, cols)} />
            ))}
          </ol>
        ) : (
          <p className="ft-empty">لا يوجد متميزون لهذه الإدارة في {info.name} {ar(info.year)}.</p>
        )}

        {/* the seat kept for next month */}
        <div className="ft-next ft-in">
          <span className="ft-next-heart">
            <Heart />
          </span>
          <p className="ft-next-kicker">التكريم القادم · {ar(monthInfo(shiftId(month.id)).days)} {info.nextName}</p>
          <h2 className="ft-next-title">قد يكون اسمك هنا في {info.nextName}</h2>
          <p className="ft-next-text">كلُّ جهدٍ صادقٍ يُرى، وكلُّ أثرٍ يُكتب. اصنع فرقك هذا الشهر، ودع اسمك يُروى في آخر أيامه.</p>
          <Link to="/team" className="ft-next-cta">
            تعرّف على فريق مسار
          </Link>
        </div>
      </div>
    </main>
  )
}

/* the id of the month after a 'YYYY-MM' id */
function shiftId(id: string) {
  const [y, m] = id.split('-').map(Number)
  const d = new Date(y || 2026, m || 1, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}