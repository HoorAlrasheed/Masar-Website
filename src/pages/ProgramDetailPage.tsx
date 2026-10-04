import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { gsap } from 'gsap'

import { programs } from '../data'
import { NEWS } from '../data/news'
import { joinLink, mapLink, partnerRef, type ProgramStatus } from '../components/ProgramBits'
import typewriter from '../imports/typewriter.jpg'

import './ProgramDetail.css'

/* -----------------------------------------------------------------
   /programs/:id — one programme, typed on a sheet coming out of a
   typewriter: what it is, its details, what it covers; then the
   register button and the share icons under the machine.
   /programs/5   — a programme from data/index.ts
   /programs/e8  — an event that already happened, from data/news.ts
                   (its sheet lists what it covered, from its highlights)
   Everything is written in data/index.ts (programs).
   ----------------------------------------------------------------- */

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const AR = '٠١٢٣٤٥٦٧٨٩'
const ar = (n: number) => String(n).replace(/\d/g, (d) => AR[+d])
const PAST_ORD = ['أولًا', 'ثانيًا', 'ثالثًا', 'رابعًا', 'خامسًا', 'سادسًا', 'سابعًا', 'ثامنًا']
const ORDINAL = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن']

const STATE: Record<ProgramStatus, { line: string; button: string }> = {
  open: { line: 'التسجيل مفتوح', button: 'سجّل الآن' },
  soon: { line: 'يفتح التسجيل قريبًا', button: 'يفتح التسجيل قريبًا' },
  closed: { line: 'انتهت الفعالية', button: 'أُغلق التسجيل' },
}

const svg = (d: ReactNode, fill = false) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
)
const SHARE = {
  whatsapp: svg(
    <path d="M12 2.2a9.7 9.7 0 0 0-8.3 14.8L2.4 21.6l4.7-1.2A9.7 9.7 0 1 0 12 2.2Zm0 17.7c-1.5 0-2.9-.4-4.1-1.1l-.3-.2-2.8.7.8-2.7-.2-.3A8 8 0 1 1 12 19.9Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.6.3 2.7 2.7 0 0 0-.8 2c0 1.2.9 2.3 1 2.5.1.2 1.7 2.6 4.1 3.6 1.5.7 2.1.7 2.9.6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.4-.3Z" />,
    true,
  ),
  x: svg(<path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.9 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />, true),
  link: svg(
    <>
      <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.1 1.1" />
      <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.1-1.1" />
    </>,
  ),
  check: svg(<path d="M5 12.5l4.5 4.5L19 7.5" />),
  arrow: svg(<path d="M14.5 6.5L9 12l5.5 5.5" />),
}

/* what the sheet shows, whether it is a programme or a past event */
type Sheet = {
  kind: string
  name: string
  status: ProgramStatus
  date: string
  about: string[]
  rows: { label: string; value: string; map?: string }[]
  topics: string[]
  share: string
}

function sheetOf(id = ''): Sheet | undefined {
  /* a past event: "e" + its id in news.ts */
  if (id.startsWith('e')) {
    const n = NEWS.find((x) => String(x.id) === id.slice(1) && !x.teaser)
    if (!n) return undefined
    return {
      kind: n.category,
      name: n.place ? n.title.replace(` في ${n.place}`, '').trim() : n.title,
      status: 'closed',
      date: n.date,
      /* what it covered is listed below on its own, so the paragraph that
         says it ("وتناولت …") is left out of the summary at the top */
      about: (n.body?.length ? n.body : [n.summary]).filter((t) => !(n.highlights?.length && t.trim().startsWith('وتناول'))),
      rows: [
        { label: 'التاريخ', value: n.date },
        ...(n.place ? [{ label: 'المكان', value: n.place, map: mapLink({ location: n.place, mapUrl: n.mapUrl }) }] : []),
      ],
      topics: n.highlights ?? [],
      share: n.title,
    }
  }
  const p = programs.find((x) => String(x.id) === id)
  if (!p) return undefined
  const i = p.title.indexOf(':')
  return {
    kind: i > 0 ? p.title.slice(0, i).trim() : p.category,
    name: i > 0 ? p.title.slice(i + 1).trim() : p.title,
    status: p.status,
    date: p.date,
    about: [p.description],
    rows: [
      { label: 'التاريخ', value: p.date },
      { label: 'الوقت', value: p.time },
      { label: 'المكان', value: p.location, map: mapLink(p) },
      { label: 'الفئة المستهدفة', value: p.targetAudience },
      { label: 'المتحدث', value: p.speaker },
    ].filter((r) => r.value),
    topics: p.topics,
    share: p.title,
  }
}

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>()
  const program = sheetOf(id)
  /* a partner's link (…?ref=stc) lands right here, on this programme */
  const [search] = useSearchParams()
  const ref = partnerRef(search)
  const root = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)

  /* the navbar logo steps aside here too (the menu stays on the left) */
  useLayoutEffect(() => {
    document.body.classList.add('pgt-page')
    return () => document.body.classList.remove('pgt-page')
  }, [])

  /* the sheet comes up out of the machine, then the lines appear */
  useLayoutEffect(() => {
    const el = root.current
    if (!el || !program || reduced()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.pgt-sheet', { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.4, ease: 'power3.out', delay: 0.1 })
      gsap.fromTo('.pgt-type', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'none', stagger: 0.09, delay: 0.7 })
      gsap.fromTo('.pgt-foot', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 1 })
    }, el)
    return () => ctx.revert()
  }, [program])

  if (!program) {
    return (
      <main className="pgt" ref={root}>
        <div className="pgt-wrap pgt-missing">
          <p>البرنامج غير موجود</p>
          <Link to="/programs" className="pgt-register">
            العودة للفعاليات والبرامج
          </Link>
        </div>
      </main>
    )
  }

  const { kind, name, rows } = program
  const year = (program.date.match(/[٠-٩\d]{4}/) ?? [''])[0]
  const ended = program.status === 'closed'

  const url = typeof window !== 'undefined' ? window.location.href : ''
  const text = `${program.share} — مبادرة مسار`
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* the browser refused — nothing to do */
    }
  }

  return (
    <main className="pgt" ref={root}>
      <div className="pgt-wrap">
        <Link to="/programs" className="pgt-back">
          {svg(<path d="M9 6l6 6-6 6" />)}
          كل البرامج
        </Link>

        <div className="pgt-scene">
          <p className="pgt-brand">MASAR · مبادرة مسار</p>

          {/* the sheet: it carries on the paper in the photo, upwards */}
          <article className="pgt-sheet">
            <div className="pgt-head pgt-type">
              <span>{kind}</span>
              <em>masar · {year || '2026'}</em>
            </div>

            <h1 className="pgt-title pgt-type">{name}</h1>
            <p className="pgt-state pgt-type" data-status={program.status}>
              {STATE[program.status].line}
            </p>

            <section className="pgt-block pgt-type">
              <h2 className="pgt-label">نبذة عن الفعالية</h2>
              {program.about.map((t, n) => (
                <p key={n} className="pgt-about">
                  {t}
                </p>
              ))}
            </section>

            <dl className="pgt-rows pgt-type">
              {rows.map((r) => (
                <div key={r.label}>
                  <dt>{r.label}</dt>
                  <dd>
                    {r.map ? (
                      <a href={r.map} target="_blank" rel="noopener noreferrer">
                        {r.value}
                      </a>
                    ) : (
                      r.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            {/* what it covers — or, once it has ended, what it covered */}
            {program.topics.length > 0 && (
              <section className="pgt-block pgt-type">
                <h2 className="pgt-label">{ended ? 'أبرز ما تناولته الفعالية' : 'محاور الفعالية'}</h2>
                <ol className="pgt-topics">
                  {program.topics.map((t, n) => (
                    <li key={t}>
                      <span>{ended ? (PAST_ORD[n] ?? ar(n + 1)) : `المحور ${ORDINAL[n] ?? ar(n + 1)}`}</span>
                      {t}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <p className="pgt-sign pgt-type">
              {ended ? 'إلى لقاء قادم' : 'نتطلّع إلى مشاركتكم'}
              <i aria-hidden="true" />
            </p>
          </article>

          <img className="pgt-machine" src={typewriter} alt="" aria-hidden="true" draggable={false} />
        </div>

        {/* under the machine: register, and share */}
        <div className="pgt-foot">
          {program.status === 'open' ? (
            <Link to={joinLink(program.share, ref)} className="pgt-register">
              <span>{STATE.open.button}</span>
              {SHARE.arrow}
            </Link>
          ) : (
            <span className="pgt-register" aria-disabled="true">
              {STATE[program.status].button}
            </span>
          )}

          <div className="pgt-share" aria-label="مشاركة">
            <span className="pgt-share-label">شارك الفعالية</span>
            <a href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`} target="_blank" rel="noopener noreferrer" aria-label="مشاركة في واتساب">
              {SHARE.whatsapp}
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="مشاركة في إكس"
            >
              {SHARE.x}
            </a>
            <button type="button" onClick={copy} aria-label={copied ? 'تم نسخ الرابط' : 'نسخ الرابط'} data-done={copied ? '' : undefined}>
              {copied ? SHARE.check : SHARE.link}
            </button>
          </div>
          <p className="pgt-copied" aria-live="polite">
            {copied ? 'تم نسخ الرابط' : ''}
          </p>
        </div>
      </div>
    </main>
  )
}