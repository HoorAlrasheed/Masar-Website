import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import groupPhoto from '../imports/about-team.jpg'
/* the initiative's sessions and visits (the same photos as the news) */
import photoMedia from '../imports/experience-session-1.jpg' // جلسة الإعلام الرقمي
import photoRisk from '../imports/experience-session-3.jpg' // جلسة إدارة المخاطر
import photoData from '../imports/experience-session-4.jpg' // جلسة تحليل البيانات
import photoVenture from '../imports/experience-session-5.jpg' // جلسة الريادة
import photoSab from '../imports/experience-visit-1.jpg' // زيارة البنك السعودي الأول
import photoAcademy from '../imports/experience-visit-2.jpg' // زيارة الأكاديمية المالية
/* صور قصة مسار */
import storyIdea from '../imports/about-story-idea.jpg' // الفكرة: الكرسي والكتاب
import storySeat from '../imports/about-story-seat.jpg' // الفكرة: الكرسي في المسرح
import storyLaunch1 from '../imports/about-story-launch-1.jpg' // الانطلاقة: باقي يوم
import storyLaunch2 from '../imports/about-story-launch-2.jpg' // الانطلاقة: تعريف المبادرة
import storyMedia1 from '../imports/about-story-media-1.jpg' // اليوم: الأرقام الإعلامية (لينكدإن وإكس)
import storyMedia2 from '../imports/about-story-media-2.jpg' // اليوم: الأرقام الإعلامية (تيك توك وإنستقرام)

import PageHead from '../components/PageHead'
import './AboutPage.css'

gsap.registerPlugin(ScrollTrigger)

/* -----------------------------------------------------------------
   /about — عن مسار, told as one journey (phone first)

   intro     the title rises; the group photo grows from a card to the
             whole screen and the facts count up right under it; a small
             "discover our story" hint under the card says the page goes
             on, and fades away on the first scroll
   story     a pinned photo frame; the chapters (the idea, the launch,
             the programmes, today) scroll beneath it and each wipes in
             its own photo; a rail shows progress
   vision &  two stops on one rail — where we are going, then how we get
   mission   there. The rail fills as you read, each stop lights up, the
             vision's words brighten and the mission's three steps tick in
   goals     a network: مسار in the middle, six goals around it
   values    a dial: six values on a ring that turns to bring the chosen
             one to the top; the centre shows it
   join      a small panel whose outline draws itself, and the way to join
   A thin progress line at the top follows the whole journey.
   ----------------------------------------------------------------- */

const VALUES = [
  { title: 'المعرفة', desc: 'نؤمن أن المعرفة هي أساس كل إنجاز، ونسعى لتيسير الوصول إليها لجميع الطلاب.' },
  { title: 'التوجيه', desc: 'كل طالب يحتاج إلى من يساعده في رسم مساره الصحيح بوضوح وثقة.' },
  { title: 'المجتمع', desc: 'نبني مجتمعاً طلابياً داعماً يتشارك الفرص والخبرات والطموحات.' },
  { title: 'التميز', desc: 'نحتفي بالإنجاز ونشجع التميز الأكاديمي والمهني في كل صوره.' },
  { title: 'الأمانة', desc: 'نلتزم بالمصداقية والشفافية في تقديم المعلومات والتوجيه.' },
  { title: 'الطموح', desc: 'نؤمن بإمكانيات الطلاب غير المحدودة ونعمل على إطلاق طاقاتهم.' },
]

const GOALS = [
  'توجيه الطلاب نحو التخصصات والمسارات المهنية المناسبة',
  'تطوير المهارات الشخصية والمهنية من خلال برامج متخصصة',
  'ربط الطلاب بسوق العمل والفرص المهنية الحقيقية',
  'بناء مجتمع طلابي تشاركي يدعم التطور المستمر',
  'تكريم التميز وتشجيع الإنجاز الأكاديمي والمهني',
  'توفير موارد تعليمية رقمية شاملة لجميع الطلاب',
]

/* a short name for each goal — shown on the network */
const GOAL_NAMES = ['التخصص', 'المهارات', 'سوق العمل', 'المجتمع', 'التميز', 'الموارد']

const VISION = 'أن يكون لكل طالب مسارٌ مهني واضح، يعرف وجهته ويثق بخطواته، وأن يجد بين يديه من المعرفة والموارد والتوجيه ما يعينه على تحقيق طموحاته الأكاديمية والمهنية، ليغدو أثرًا فاعلًا في مجتمعه ووطنه.'

/* the mission, as written — split into its promise and its three verbs */
const MISSION_LEAD = 'تقديم بيئة داعمة ومحفزة تمكّن الطلاب من:'
const MISSION_VERBS = ['اكتشاف إمكاناتهم', 'وتطوير مهاراتهم', 'وبناء مساراتهم المستقبلية بثقة واقتدار.']

/* how it began — the story, in chapters */
const CHAPTERS = [
  {
    tag: 'الفكرة',
    title: 'فجوة لاحظناها',
    text: 'لاحظ المؤسسون أن كثيراً من الطلاب يفتقرون إلى التوجيه الكافي في اختيار تخصصاتهم وتطوير مهاراتهم.',
    img: storyIdea,
    small: storySeat,
    smallPos: 'center bottom',
    lift: true, // بالجوال: الصورة تنتهي فوق البطاقة عشان ما تغطي الكرسي الأحمر
  },
  {
    tag: '١٤٤٧',
    title: 'الانطلاقة',
    text: 'انطلقت مبادرة مسار لتصبح واحدة من أبرز المبادرات الطلابية في المجال المهني والأكاديمي.',
    img: storyLaunch1,
    small: storyLaunch2,
    whole: true, // المنشور اللي بالورقة البيج يبان كامل بدون قص
    imgPos: 'center 52%', // المربع الأزرق: الصورة تعبّي المربع، والورقة «1 day to go» بالنص
  },
  {
    tag: 'المنهج',
    title: 'برامج متنوعة',
    text: 'برامج تغطي التوجيه المهني وتطوير المهارات والتشبيك المهني، بشكل منهجي ومنظم.',
    img: photoSab,
    small: photoData,
  },
  {
    tag: 'اليوم',
    title: 'أثر يكبر',
    text: 'اليوم، يستفيد من مسار أكثر من ٢٥٠ طالباً عبر برامجها المتنوعة.',
    img: storyMedia1,
    small: storyMedia2,
    whole: true,
    imgPos: 'center top', // المربع الأزرق: يبان العنوان والأرقام الأولى
  },
]

const P = { pathLength: 1, stroke: 'currentColor', fill: 'none' } as const
const VALUE_MARKS: Record<string, ReactElement> = {
  المعرفة: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="24" strokeWidth="1.2" {...P} opacity="0.4" />
      <circle cx="32" cy="32" r="14" strokeWidth="1.3" {...P} opacity="0.75" />
      <circle cx="32" cy="32" r="4.5" fill="currentColor" />
    </svg>
  ),
  التوجيه: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M10 54C24 48 30 38 36 28S48 12 54 10" strokeWidth="1.5" strokeLinecap="round" {...P} />
      <path d="M44 10H54V20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...P} />
      <circle cx="10" cy="54" r="3.5" fill="currentColor" />
    </svg>
  ),
  المجتمع: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 14L14 40H50L32 14ZM32 14V54M14 40L32 54L50 40" strokeWidth="1.2" strokeLinejoin="round" {...P} opacity="0.65" />
      <circle cx="32" cy="14" r="4" fill="currentColor" />
      <circle cx="14" cy="40" r="3.5" fill="currentColor" />
      <circle cx="50" cy="40" r="3.5" fill="currentColor" />
      <circle cx="32" cy="54" r="3" fill="currentColor" />
    </svg>
  ),
  التميز: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 6L58 32L32 58L6 32Z" strokeWidth="1.1" {...P} opacity="0.4" />
      <path d="M32 18L46 32L32 46L18 32Z" strokeWidth="1.3" {...P} opacity="0.8" />
      <circle cx="32" cy="32" r="4" fill="currentColor" />
    </svg>
  ),
  الأمانة: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="12" y="12" width="40" height="40" rx="4" strokeWidth="1.1" {...P} opacity="0.4" />
      <path d="M32 20L44 32L32 44L20 32Z" strokeWidth="1.3" {...P} opacity="0.8" />
      <circle cx="32" cy="32" r="3.5" fill="currentColor" />
    </svg>
  ),
  الطموح: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M8 54H20V44H32V32H44V20H56" strokeWidth="1.5" strokeLinejoin="round" {...P} opacity="0.8" />
      <path d="M46 8H56V18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...P} />
      <circle cx="56" cy="20" r="3.5" fill="currentColor" />
    </svg>
  ),
}


/* one small line-icon per goal */
const GOAL_MARKS: ReactElement[] = [
  /* التخصصات — a compass */
  <svg viewBox="0 0 32 32" aria-hidden="true" key="g1">
    <circle cx="16" cy="16" r="12" strokeWidth="1.3" {...P} />
    <path d="M20.5 11.5L17.6 17.6L11.5 20.5L14.4 14.4Z" strokeWidth="1.3" strokeLinejoin="round" {...P} />
  </svg>,
  /* المهارات — rising steps */
  <svg viewBox="0 0 32 32" aria-hidden="true" key="g2">
    <path d="M5 26H27" strokeWidth="1.3" strokeLinecap="round" {...P} />
    <path d="M8 26V19H13V26M14 26V14H19V26M20 26V8H25V26" strokeWidth="1.3" strokeLinejoin="round" {...P} />
  </svg>,
  /* سوق العمل — a briefcase */
  <svg viewBox="0 0 32 32" aria-hidden="true" key="g3">
    <rect x="5" y="10" width="22" height="15" rx="3" strokeWidth="1.3" {...P} />
    <path d="M12 10V8A2 2 0 0 1 14 6H18A2 2 0 0 1 20 8V10M5 16H27" strokeWidth="1.3" {...P} />
  </svg>,
  /* المجتمع — people together */
  <svg viewBox="0 0 32 32" aria-hidden="true" key="g4">
    <circle cx="16" cy="11" r="4" strokeWidth="1.3" {...P} />
    <path d="M9 25C9 20.6 12.1 18 16 18S23 20.6 23 25" strokeWidth="1.3" strokeLinecap="round" {...P} />
    <circle cx="7" cy="14" r="2.6" strokeWidth="1.2" {...P} />
    <circle cx="25" cy="14" r="2.6" strokeWidth="1.2" {...P} />
  </svg>,
  /* التميز — a medal */
  <svg viewBox="0 0 32 32" aria-hidden="true" key="g5">
    <circle cx="16" cy="19" r="7" strokeWidth="1.3" {...P} />
    <path d="M12 12.8L9 5H14L16 10L18 5H23L20 12.8" strokeWidth="1.3" strokeLinejoin="round" {...P} />
    <path d="M16 16L17 18.2L19.3 18.4L17.5 19.9L18.1 22.2L16 21L13.9 22.2L14.5 19.9L12.7 18.4L15 18.2Z" strokeWidth="1" strokeLinejoin="round" {...P} />
  </svg>,
  /* الموارد الرقمية — an open book */
  <svg viewBox="0 0 32 32" aria-hidden="true" key="g6">
    <path d="M16 9C13 7 9 6.5 5 7V24C9 23.5 13 24 16 26C19 24 23 23.5 27 24V7C23 6.5 19 7 16 9Z" strokeWidth="1.3" strokeLinejoin="round" {...P} />
    <path d="M16 9V26" strokeWidth="1.3" {...P} />
  </svg>,
]

/* ---------- helpers ---------- */

const AR = '٠١٢٣٤٥٦٧٨٩'
const toArabic = (n: number) => String(Math.round(n)).replace(/\d/g, (d) => AR[+d])
const idx = (i: number) => toArabic(i).padStart(2, '٠')

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- the goals network ---------- */

const NET = { w: 360, h: 330, cx: 180, cy: 165, r: 116 }
const NODES = GOALS.map((_, i) => {
  const a = ((-90 + i * 60) * Math.PI) / 180
  return { x: NET.cx + NET.r * Math.cos(a), y: NET.cy + NET.r * Math.sin(a) }
})

/* how often the goals and the values move on by themselves */
const AUTO_MS = 2500

function GoalsNetwork() {
  const [active, setActive] = useState(0)
  /* moves to the next goal every 2.5 s while on screen — a tap picks a goal and it carries on from there */
  const [inView, setInView] = useState(false)
  const netBox = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = netBox.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useLayoutEffect(() => {
    if (!inView) return
    const t = window.setTimeout(() => {
      setActive((a) => (a + 1) % GOALS.length)
    }, AUTO_MS)
    return () => window.clearTimeout(t)
  })
  const pickGoal = (i: number) => setActive(i)
  return (
    <div className="abp-net" ref={netBox}>
      <svg className="abp-net-svg" viewBox={`0 0 ${NET.w} ${NET.h}`} role="group" aria-label="أهداف مسار">
        {/* faint ring the goals sit on */}
        <circle cx={NET.cx} cy={NET.cy} r={NET.r} className="abp-net-ring" />
        {/* links from the centre */}
        {NODES.map((n, i) => (
          <line key={`l${i}`}
            x1={NET.cx}
            y1={NET.cy}
            x2={n.x}
            y2={n.y}
            pathLength={1}
            className={`abp-net-link ${i === active ? 'is-on' : ''}`}
          />
        ))}
        {/* the centre */}
        <circle cx={NET.cx} cy={NET.cy} r="30" className="abp-net-core" />
        <text x={NET.cx} y={NET.cy + 5} className="abp-net-core-text">
          مسار
        </text>
        {/* the six goals */}
        {NODES.map((n, i) => {
          const below = n.y > NET.cy + 1
          const side = Math.abs(n.y - NET.cy) < 70
          return (
            <g key={`n${i}`}
              className={`abp-net-node ${i === active ? 'is-on' : ''}`}
              role="button"
              tabIndex={0}
              aria-pressed={i === active}
              aria-label={GOALS[i]}
              onClick={() => pickGoal(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  pickGoal(i)
                }
              }}
            >
              {/* a bigger invisible target for the finger */}
              <circle cx={n.x} cy={n.y} r="26" className="abp-net-hit" />
              <circle cx={n.x} cy={n.y} r="16" className="abp-net-halo" />
              <circle cx={n.x} cy={n.y} r="6" className="abp-net-dot" />
              <text x={n.x} y={side ? (below ? n.y + 32 : n.y - 22) : below ? n.y + 34 : n.y - 24} className="abp-net-name">
                {GOAL_NAMES[i]}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="abp-net-panel" aria-live="polite">
        <span className="abp-net-num">
          {idx(active + 1)} <em>/ {idx(GOALS.length)}</em>
        </span>
        <p className="abp-net-text" key={active}>
          {GOALS[active]}
        </p>
      </div>
    </div>
  )
}

/* ---------- vision & mission: two stops on one rail ---------- */

/* each part opens with the same heading as the page itself (PageHead):
   the label between two lines, the title, the torn line, the hint */
function SecHead({ label, title, hint }: { label: string; title: string; hint: string }) {
  return (
    <div className="phd abp-sechead">
      <p className="phd-label">{label}</p>
      <h2 className="phd-title">{title}</h2>
      <span className="phd-tear" aria-hidden="true" />
      <p className="phd-sub">{hint}</p>
    </div>
  )
}

/* ---------- story: one composed board, turned chapter by chapter ---------- */

const ORDINAL = ['الأول', 'الثاني', 'الثالث', 'الرابع']

function Story() {
  const [on, setOn] = useState(0)
  const touch = useRef(0)
  const c = CHAPTERS[on]

  const pick = (i: number) => setOn((i + CHAPTERS.length) % CHAPTERS.length)

  return (
    <div className="abt-story">
      <div
        className="abt-scomp"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touch.current
          if (Math.abs(dx) > 40) pick(on + (dx < 0 ? 1 : -1))
        }}
      >
        {/* the dark linen panel, with the chapter's photo */}
        <div className="abt-cpanel abt-spanel">
          <p className="abt-cpanel-corner">قصة مسار</p>
          <span className="abt-snum" aria-hidden="true">
            {toArabic(on + 1)}
          </span>
          <figure className="abt-cphoto abt-sphoto">
            {/* كل صور الفصول محمّلة من البداية، ويظهر بس صورة الفصل الحالي — فالتنقل فوري بدون تعليق */}
            {CHAPTERS.map((ch, i) => (
              <img key={i} src={ch.img} alt="" className={i === on ? 'is-on' : undefined} style={'imgPos' in ch ? { objectPosition: ch.imgPos } : undefined} />
            ))}
          </figure>
          <p className="abt-cpanel-line">الفصل {ORDINAL[on]}</p>
        </div>
        {/* the paper panel, with a second photo */}
        <div className="abt-cpaper abt-spaper" aria-hidden="true">
          <figure className={`abt-cphoto abt-cphoto--small${'lift' in c ? ' is-lift' : ''}`}>
            {CHAPTERS.map((ch, i) => (
              <img key={i} src={ch.small} alt="" className={[i === on ? 'is-on' : '', 'whole' in ch ? 'is-whole' : ''].join(' ').trim() || undefined} style={'smallPos' in ch ? { objectPosition: ch.smallPos } : undefined} />
            ))}
          </figure>
        </div>
        {/* the chapter itself, on its card */}
        <div className="abt-ticket abt-sticket" aria-live="polite">
          <div className="abt-ticket-in" key={on}>
            <p className="abt-ticket-kicker">
              الفصل {ORDINAL[on]} · {c.tag}
            </p>
            <p className="abt-ticket-title">{c.title}</p>
            <p className="abt-ticket-text">{c.text}</p>
            <p className="abt-ticket-foot">
              <span>مبادرة مسار</span>
              <span>
                {idx(on + 1)} / {idx(CHAPTERS.length)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* arrows to turn the chapters (as on the home page's past work) */}
      <div className="abt-snav">
        <button type="button" className="abt-snav-btn" onClick={() => pick(on - 1)} aria-label="الفصل السابق">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="abt-snav-count">
          <b>{idx(on + 1)}</b> / {idx(CHAPTERS.length)}
        </span>
        <button type="button" className="abt-snav-btn" onClick={() => pick(on + 1)} aria-label="الفصل التالي">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* the four stations of the story, on one line */}
      <div className="abt-stations" style={{ '--p': on / (CHAPTERS.length - 1) } as CSSProperties}>
        <span className="abt-stations-line" aria-hidden="true">
          <i />
        </span>
        {CHAPTERS.map((ch, i) => (
          <button key={ch.title} type="button" className="abt-station" data-on={i === on || undefined} data-past={i < on || undefined} aria-pressed={i === on} onClick={() => pick(i)}>
            <span className="abt-station-dot" aria-hidden="true" />
            <span className="abt-station-tag">{ch.tag}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------- vision & mission: postcards that turn over ---------- */

const TURN = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function Postcard({ img, word, kicker, children }: { img: string; word: string; kicker: string; children: ReactNode }) {
  const [back, setBack] = useState(false)
  return (
    <button type="button" className="abt-post" data-back={back || undefined} aria-pressed={back} aria-label={`${word} — اضغط لقلب البطاقة`} onClick={() => setBack((b) => !b)}>
      <span className="abt-post-inner">
        <span className="abt-post-face abt-post-front">
          <img src={img} alt="" loading="lazy" />
          <span className="abt-post-word">
            <small>{kicker}</small>
            {word}
          </span>
          <span className="abt-post-turn">
            {TURN}
            اقلب البطاقة
          </span>
        </span>
        <span className="abt-post-face abt-post-back">
          <span className="abt-post-head">
            <span>
              <small>{kicker}</small>
              <b>{word}</b>
            </span>
            <span className="abt-post-stamp">
              <img src={img} alt="" loading="lazy" />
            </span>
          </span>
          <span className="abt-post-body">{children}</span>
          <span className="abt-post-sign">
            <span>مبادرة مسار</span>
            <span>١٤٤٧</span>
          </span>
        </span>
      </span>
    </button>
  )
}

/* ---------- the values dial ---------- */

const DIAL_R = 124 // radius of the ring the six values sit on (in a 320 box)

function ValuesDial() {
  const [active, setActive] = useState(0)
  const [inView, setInView] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const [angle, setAngle] = useState(0)

  /* turns on its own (every 2.5 s) while it is on screen — a tap picks a value and it carries on from there */
  useLayoutEffect(() => {
    const el = box.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (!inView) return
    const t = window.setTimeout(() => {
      go((active + 1) % VALUES.length)
    }, AUTO_MS)
    return () => window.clearTimeout(t)
  })

  const go = (i: number) => {
    /* the ring turns so the chosen value arrives at the top — the short way round */
    const base = -i * 60
    setAngle((cur) => base + Math.round((cur - base) / 360) * 360)
    setActive(i)
  }

  /* the centre's mark draws itself each time the value changes */
  useLayoutEffect(() => {
    const el = box.current?.querySelector('.abp-dial-mark')
    if (!el || reduced()) return
    const t = gsap.fromTo(
      el.querySelectorAll('[pathLength]'),
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: 0.08, delay: 0.2 }
    )
    return () => {
      t.kill()
    }
  }, [active])

  const v = VALUES[active]

  return (
    <div className="abp-dial-wrap" ref={box}>
      <div className="abp-dial">
        {/* the pointer at the top */}
        <span className="abp-dial-pointer" aria-hidden="true" />
        <div className="abp-dial-ring" style={{ transform: `rotate(${angle}deg)` }}>
          {VALUES.map((item, i) => {
            const a = ((i * 60 - 90) * Math.PI) / 180
            return (
              <button key={item.title}
                type="button"
                className="abp-dial-item"
                data-on={i === active ? '' : undefined}
                aria-pressed={i === active}
                aria-label={item.title}
                style={{
                  left: `calc(50% + ${Math.cos(a) * DIAL_R}px)`,
                  top: `calc(50% + ${Math.sin(a) * DIAL_R}px)`,
                }}
                onClick={() => {
                  go(i)
                }}
              >
                {/* counter-turns so the icon stays upright */}
                <span className="abp-dial-icon" style={{ transform: `rotate(${-angle}deg)` }}>
                  {VALUE_MARKS[item.title]}
                </span>
              </button>
            )
          })}
        </div>
        <div className="abp-dial-core">
          <span className="abp-dial-mark">{VALUE_MARKS[v.title]}</span>
          <span className="abp-dial-name" key={v.title}>
            {v.title}
          </span>
          <span className="abp-dial-count">
            {idx(active + 1)} / {idx(VALUES.length)}
          </span>
        </div>
      </div>
      <p className="abp-dial-desc" key={v.desc} aria-live="polite">
        {v.desc}
      </p>
    </div>
  )
}

/* =================================================================== */

export default function AboutPage() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    if (reduced()) {
      el.setAttribute('data-static', '')
      return
    }

    ScrollTrigger.config({ ignoreMobileResize: true })

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el)

      /* ---- the whole journey: one thin progress line ---- */
      gsap.fromTo(
        '.abp-progress i',
        { scaleX: 0 },
        { scaleX: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.3 } }
      )

      /* ---- the labels: their short line draws, then the words slide in ---- */
      q('.abp-label').forEach((lab) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: lab, start: 'top 90%', once: true } })
        tl.fromTo(lab.querySelector('i'), { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power2.out' })
        tl.fromTo(lab, { '--abp-lab': 0 }, { '--abp-lab': 1, duration: 0.6, ease: 'power2.out' }, 0.2)
      })

      /* ---- intro ---- */

      const stage = el.querySelector<HTMLElement>('.abp-zoom-stick')
      const shot = el.querySelector<HTMLElement>('.abp-zoom-shot')
      const cardClip = () => {
        if (!stage || !shot) return 'inset(20% 6% 45% 6% round 20px)'
        const s = stage.getBoundingClientRect()
        const p = shot.getBoundingClientRect()
        const side = Math.max(16, p.left - s.left + 16)
        return `inset(${p.top - s.top}px ${side}px ${s.bottom - p.bottom}px ${side}px round 20px)`
      }
      gsap
        .timeline({
          scrollTrigger: { trigger: '.abp-zoom', start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true },
        })
        .fromTo('.abp-zoom-frame', { clipPath: cardClip }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', ease: 'power2.inOut', duration: 1, immediateRender: true })
        .fromTo('.abp-zoom-shot img', { scale: 1.12 }, { scale: 1, ease: 'power2.inOut', duration: 1 }, 0)
        .to('.abp-cue', { opacity: 0, y: -10, duration: 0.12, ease: 'none' }, 0)
        .fromTo('.abp-zoom-rule', { scaleX: 0 }, { scaleX: 1, ease: 'power2.out', duration: 0.35 }, 0.62)
        .fromTo('.abp-zoom-fact', { y: 26, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.35 }, 0.7)
        .to({}, { duration: 0.3 })

      /* the facts count up as they arrive */
      ScrollTrigger.create({
        trigger: '.abp-zoom',
        start: () => `top+=${window.innerHeight * 0.7} top`,
        once: true,
        onEnter: () => {
          q('[data-count]').forEach((n, i) => {
            const target = Number(n.dataset.count)
            const s = { v: Number(n.dataset.from ?? 0) }
            gsap.to(s, {
              v: target,
              duration: 1.6,
              delay: i * 0.1,
              ease: 'power3.out',
              onUpdate: () => {
                n.textContent = toArabic(s.v)
              },
            })
          })
        },
      })

      /* ---- goals: the links draw out from the centre, the goals appear ---- */
      gsap
        .timeline({ scrollTrigger: { trigger: '.abp-net', start: 'top 75%', once: true } })
        .fromTo('.abp-net-core', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.6, ease: 'back.out(2)' })
        .fromTo('.abp-net-ring', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.2)
        .fromTo('.abp-net-link', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.out', stagger: 0.1 }, 0.3)
        .fromTo('.abp-net-node', { opacity: 0, scale: 0.4, transformOrigin: 'center', transformBox: 'fill-box' }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)', stagger: 0.1 }, 0.6)
        .fromTo('.abp-net-panel', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 1.1)

      /* ---- values: the dial arrives, its six values settle onto the ring ---- */
      gsap
        .timeline({ scrollTrigger: { trigger: '.abp-dial', start: 'top 80%', once: true } })
        .fromTo('.abp-dial', { rotate: -30, scale: 0.9, opacity: 0 }, { rotate: 0, scale: 1, opacity: 1, duration: 1.1, ease: 'power3.out' })
        .fromTo('.abp-dial-item', { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.07 }, 0.3)

    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <main ref={root} className="abp">
      <div className="abp-progress" aria-hidden="true">
        <i />
      </div>

      {/* ============ intro ============ */}
      <section className="abp-hero">
        <PageHead label="عن مسار" title="من نحن؟" sub="مبادرة طلابية تساعدك أن ترى الطريق قبل أن تخطو فيه." />
      </section>

      <section className="abp-zoom" aria-label="فريق مسار">
        <div className="abp-zoom-stick">
          <div className="abp-zoom-frame">
            <div className="abp-zoom-bg" aria-hidden="true" />
            <div className="abp-zoom-shot">
              <img src={groupPhoto} alt="فريق مسار في إحدى الجلسات" />
            </div>
          </div>

          {/* tells the visitor the page goes on — gone as soon as they scroll */}
          <div className="abp-cue" aria-hidden="true">
            <span>اكتشف قصتنا</span>
            <i />
          </div>

          <dl className="abp-zoom-facts">
            <span className="abp-zoom-rule" aria-hidden="true" />
            <div className="abp-zoom-fact">
              <dd className="abp-num">
                <span data-count="1447" data-from="1400">١٤٤٧</span>
              </dd>
              <dt>عام التأسيس</dt>
            </div>
            <div className="abp-zoom-fact">
              <dd className="abp-num">
                <span data-count="250">٢٥٠</span>
                <em>+</em>
              </dd>
              <dt>طالبًا يستفيدون من برامجنا</dt>
            </div>
            <div className="abp-zoom-fact">
              <dd className="abp-num">
                <span data-count="6">٦</span>
              </dd>
              <dt>قيم نعمل بها</dt>
            </div>
          </dl>
        </div>
      </section>

      {/* ============ story ============ */}
      <section className="abp-how">
        <div className="abp-wrap">
          <SecHead label="كيف بدأنا" title="قصة مسار" hint="اسحب الصورة أو استخدم الأسهم للتنقل بين الفصول" />
          <Story />
        </div>
      </section>

      {/* ============ vision & mission ============ */}
      <section className="abp-vm-sec">
        <div className="abp-wrap">
          <SecHead label="الرؤية والرسالة" title="إلى أين نمضي، وكيف نصل" hint="اضغط على البطاقة لتقلبها" />
          <div className="abt-posts">
            <Postcard img={photoMedia} word="رؤيتنا" kicker="إلى أين نمضي">
              <span className="abt-post-text">{VISION}</span>
            </Postcard>
            <Postcard img={photoAcademy} word="رسالتنا" kicker="وكيف نصل">
              <span className="abt-post-text">{MISSION_LEAD}</span>
              <span className="abt-post-steps">
                {MISSION_VERBS.map((v, i) => (
                  <span key={v}>
                    <i>{toArabic(i + 1)}</i>
                    {v.replace(/^و/, '').replace(/\.$/, '')}
                  </span>
                ))}
              </span>
            </Postcard>
          </div>
        </div>
      </section>

      {/* ============ goals ============ */}
      <section className="abp-goals">
        <div className="abp-wrap">
          <SecHead label="ما نسعى إليه" title="أهداف تلتقي في مسار واحد" hint="اضغط على أي هدف" />
          <GoalsNetwork />
        </div>
      </section>

      {/* ============ values ============ */}
      <section className="abp-values">
        <div className="abp-wrap">
          <SecHead label="ما يميزنا" title="ست قيم نعمل بها" hint="اضغط على أي قيمة" />
          <ValuesDial />
        </div>
      </section>

      {/* ============ join: an open envelope, its letter rising out ============ */}
      <section className="abp-join-sec abt-join-env">
        <div className="abt-env">
          <span className="abt-env-back" aria-hidden="true" />
          <div className="abt-letter">
            <div className="abt-letter-in">
              <p className="abt-letter-kicker">كن جزءًا من مسار</p>
              <p className="abt-letter-line">
                في كلِّ طالبٍ طريقٌ ينتظر أن يُكتشف،
                <br />
                وفي مسار نمضي معك خطوةً بخطوة،
                <br />
                حتى يغدو الطموحُ أثرًا يُرى.
              </p>
              <Link to="/join" state={{ from: '/about', label: 'عن مسار' }} className="abt-letter-cta">
                انضم إلى مسار
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 12H5M11 6L5 12L11 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
          <span className="abt-env-front" aria-hidden="true" />
        </div>
      </section>
    </main>
  )
}