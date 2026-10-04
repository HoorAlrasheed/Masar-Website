import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import experienceSession1 from '../imports/experience-session-1.jpg'
import experienceSession2 from '../imports/experience-session-2.jpg'
import experienceSession3 from '../imports/experience-session-3.jpg'
import experienceSession4 from '../imports/experience-session-4.jpg'
import experienceSession5 from '../imports/experience-session-5.jpg'
import experienceVisit1 from '../imports/experience-visit-1.jpg'
import experienceVisit2 from '../imports/experience-visit-2.jpg'
import experienceVisit3 from '../imports/experience-visit-3.jpg'

import './ExperiencesSection.css'

gsap.registerPlugin(ScrollTrigger)

type Guest = { name: string; role: string }

type SessionExperience = {
  id: string
  kind: 'session'
  image: string
  title: string
  moderator?: Guest
  guests: Guest[]
  about: string
  location: string
}

type VisitExperience = {
  id: string
  kind: 'visit'
  image: string
  title: string
  aboutPlace: string
  about: string
  location: string
}

type Experience = SessionExperience | VisitExperience

/* -----------------------------------------------------------------
   REAL DATA — مسار's actual 7 experiences, transcribed from the
   provided session/visit ads. A handful of obvious OCR typos in the
   source text (e.g. stray/garbled letters) were lightly corrected for
   readability; no facts, names, or figures were changed or invented.
   ----------------------------------------------------------------- */
const EXPERIENCES: Experience[] = [
  {
    id: 'session-1',
    kind: 'session',
    image: experienceSession1,
    title: 'الإعلام الرقمي',
    moderator: {
      name: 'غازي العتيبي',
      role: 'مشرف عمليات الرصد والتقارير الإعلامية، مختص في التحليل الإعلامي والإعلام الرقمي.',
    },
    guests: [
      {
        name: 'علي الزهراني',
        role: 'خبير تحليل البيانات الإعلامية ومقاييس الرأي العام، ومتخصص في بناء منصات الرصد الإعلامي وإعداد التقارير الاستراتيجية.',
      },
      {
        name: 'تركي المطيري',
        role: 'مسؤول تنمية قطاع الإعلام الرقمي، وخبير في التحول الرقمي والتقنيات الناشئة والذكاء الاصطناعي.',
      },
    ],
    about:
      'فضاءُ التأثير.. وصناعةُ التغيير. في عصرٍ تُصاغ فيه القوة عبر المنصات، تأخذكم "مبادرة مسار" لكشف كواليس القوة واستيعاب موازينها الرقمية؛ لنحلل معًا أثر إعلام المال في الأسواق، ونحترف هندسة المستقبل بتقنيات الذكاء الاصطناعي، وصولًا إلى سيادة الحقيقة وتمكين الكوادر لصدارة المشهد الإعلامي.',
    location: 'مساحة T2',
  },
  {
    id: 'session-2',
    kind: 'session',
    image: experienceSession2,
    title: 'المنشآت العائلية',
    guests: [
      {
        name: 'سهيل التميمي',
        role: 'نائب الرئيس التنفيذي للمركز الوطني للمنشآت العائلية. دكتوراه في علوم المالية ومحلل مالي معتمد.',
      },
    ],
    about:
      'استدامةُ الإرث.. وآفاقُ التمكين. برؤية تطمح لصناعة الأثر، تصطحبكم "مبادرة مسار" في رحلة تستنطق واقع المنشآت العائلية وتحدياتها؛ لنكشف معًا عن آفاق التخصص في مجالات المالية والحوكمة والاستراتيجيات، ونرسم ببصيرة قانونية سبل حماية العراقة، وبأدوات تقييم تضمن النماء.',
    location: 'مساحة كوريتش',
  },
  {
    id: 'session-3',
    kind: 'session',
    image: experienceSession3,
    title: 'إدارة المخاطر',
    guests: [
      {
        name: 'ليث عكاري',
        role: 'خبير في إدارة المخاطر المالية، ومتخصص في استراتيجيات الاستثمار والتحليل المالي. حاصل على شهادتي CMSA وFMVA.',
      },
    ],
    about:
      'ركيزةُ الثبات في مَهبِّ التحديات. بين طموح التوسع ومخاوف التراجع؛ تأخذكم "مبادرة مسار" في رحلةٍ تستكشف فنون إدارة المخاطر وكيفية احتوائها بذكاء؛ لنعبر معًا تحديات الاستثمار والاقتصاد، وتُرسَّخ أسس الحماية في القطاعات المالية والمؤسسية.',
    location: 'مساحة كوريتش',
  },
  {
    id: 'session-4',
    kind: 'session',
    image: experienceSession4,
    title: 'تحليل البيانات',
    guests: [
      {
        name: 'عائض القحطاني',
        role: 'الرئيس التنفيذي لمنصة "أرقامي"، وخبير النمذجة الإحصائية والتحليلات التنبؤية المدعومة بالذكاء الاصطناعي، وأستاذ مساعد في قسم الإحصاء بجامعة الملك سعود.',
      },
    ],
    about:
      'من أبجدية التحليل إلى لغة التنبؤ. بين دقة التحليل وبراعة التنبؤ، تُصنع فرص المستقبل. تدعوكم "مبادرة مسار" لرحلة في جوهر البيانات؛ حيث تلتقي قيمة الشهادة بالذكاء التنبؤي، لنبني معًا مسارًا تديره الأرقام ويرسمه الذكاء.',
    location: 'مساحة لمبة',
  },
  {
    id: 'session-5',
    kind: 'session',
    image: experienceSession5,
    title: 'الريادة والمنتجات الاستثمارية',
    guests: [
      {
        name: 'فارس حموده',
        role: 'رئيس قسم تطوير المنتجات في العربي كابيتال، والرئيس السابق لقسم الأصول في ثروات.',
      },
      {
        name: 'وليد النوح',
        role: 'المؤسس والرئيس التنفيذي لشركة حفظ الثروات القابضة، والرئيس التنفيذي السابق لشركة محمد الحبيب العقارية.',
      },
    ],
    about:
      'من الفكرة إلى بناء القيمة. بخطى واثقة نحو صناعة المستقبل، وتحت ظلال "مبادرة مسار"؛ ندعوكم لحوارٍ يتقصّى أثر التقنية في الشركات الناشئة، ويكشف عن فلسفة الابتكار في عصرنا الرقمي.',
    location: 'مساحة هب',
  },
  {
    id: 'visit-1',
    kind: 'visit',
    image: experienceVisit1,
    title: 'البنك السعودي الأول (SAB)',
    aboutPlace:
      'البنك السعودي الأول (SAB) هو أحد البنوك السعودية الرائدة، ويقدم مجموعة متكاملة من الخدمات المصرفية للأفراد والشركات، إلى جانب الحلول المالية والاستثمارية. ويعمل البنك على دعم نمو الاقتصاد السعودي والمساهمة في تحقيق مستهدفات رؤية المملكة 2030.',
    about:
      'زيارة تعريفية تهدف إلى التعرّف عن قرب على بيئة العمل في القطاع المصرفي، واستكشاف طبيعة المجالات والمسارات المهنية داخل البنك، والاستفادة من تجارب المختصين وخبراتهم.',
    location: 'البنك السعودي الأول (SAB)',
  },
  {
    id: 'visit-2',
    kind: 'visit',
    image: experienceVisit2,
    title: 'الأكاديمية المالية',
    aboutPlace:
      'الأكاديمية المالية جهة حكومية مستقلة تُعنى بتنمية وتطوير القدرات البشرية في القطاع المالي، وتشمل مجالاتها البنوك والتمويل والتأمين والسوق المالية. وتقدم برامج تدريبية وشهادات وحلولًا مهنية تهدف إلى تطوير المهارات ورفع جاهزية الكوادر في القطاع المالي.',
    about:
      'زيارة تعريفية إلى الأكاديمية المالية للتعرّف على طبيعة العمل في القطاع المالي، واستكشاف المسارات المهنية المرتبطة بالمجال، والتعرّف على دور الأكاديمية في تطوير مهارات وكفاءات العاملين والمهتمين بالقطاع المالي.',
    location: 'الأكاديمية المالية',
  },
  {
    id: 'visit-3',
    kind: 'visit',
    image: experienceVisit3,
    title: 'متحف صقر الجزيرة للطيران',
    aboutPlace:
      'متحف صقر الجزيرة للطيران في الرياض صرحٌ يوثّق تاريخ الطيران في المملكة ومسيرة القوات الجوية الملكية السعودية، وتضم قاعاته طائراتٍ ومعروضاتٍ تروي حكاية السماء السعودية منذ بداياتها.',
    about:
      'زيارة تعريفية إلى متحف صقر الجزيرة للطيران، تأمّل فيها المشاركون مسيرة الطيران في المملكة عن قرب، في جولةٍ جمعت بين عبق التاريخ وأفق المستقبل.',
    location: 'متحف صقر الجزيرة للطيران',
  },
]

const N = EXPERIENCES.length
const ANGLE_STEP = 360 / N

/* -----------------------------------------------------------------
   Angle per card around the ring — generated from EXPERIENCES' own
   order, not hand-picked per id, so adding an 8th, 20th, or 30th
   experience to the array later just works: the first item sits at
   the front (0°), then each following item alternates to the
   immediate-left / immediate-right slot outward from center. With
   today's 7 items that reproduces exactly the arrangement originally
   asked for (session-1 front, session-2 its left neighbor, visit-1
   its right neighbor, the rest filling outward) — it's just computed
   instead of listed by name now, so the same pattern holds at any N.

   Note on sign: with this component's transform order
   (rotateY(eff) then translateZ(radius)), a POSITIVE angle lands the
   card on the RIGHT of center and a NEGATIVE angle on the LEFT — the
   opposite of what "angle increases to the left" might suggest.
   ----------------------------------------------------------------- */
const ANGLES: Record<string, number> = Object.fromEntries(
  EXPERIENCES.map((exp, i) => {
    const pair = Math.ceil(i / 2) // 0, 1, 1, 2, 2, 3, 3, 4, 4, ...
    const sign = i % 2 === 1 ? -1 : 1 // odd index -> left, even (>0) -> right
    return [exp.id, sign * pair * ANGLE_STEP]
  }),
)

/* the ring's physical order (by angle, ascending) — what Prev/Next
   step through, since that's what's spatially adjacent on the orbit */
const RING_ORDER = Object.keys(ANGLES)
  .map((id) => ({ id, angle: ANGLES[id] }))
  .sort((a, b) => a.angle - b.angle)
  .map((x) => x.id)

const norm180 = (deg: number) => {
  let a = deg % 360
  if (a > 180) a -= 360
  if (a < -180) a += 360
  return a
}

const shortestDelta = (from: number, to: number) => {
  let d = (to - from) % 360
  if (d > 180) d -= 360
  if (d < -180) d += 360
  return d
}

const AUTO_ROTATE_DEG_PER_SEC = 2.6 // slow, calm, cinematic

export default function ExperiencesSection() {
  const root = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const orbitRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  // The visible picture+text layer inside each card, counter-rotated
  // against the card's own orbital rotation — see `render()`.
  const faceRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const [frontId, setFrontId] = useState<string>('session-1')
  const [openId, setOpenId] = useState<string | null>(null)
  const openIdRef = useRef<string | null>(null)
  openIdRef.current = openId

  // The overlay's CLOSE is a fade-out, so the panel's content must stay
  // mounted a little longer than `openId` itself (which flips to null the
  // instant the user clicks "close"). `displayId` lags behind on the way
  // out only, so the last-open experience keeps rendering while the
  // overlay fades, instead of popping away before the fade finishes.
  const [displayId, setDisplayId] = useState<string | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  // the auto-rotate ticker is set up once (see the effect below) and calls
  // a `render` closure captured at that time, so it can't read fresh React
  // state directly — this ref is what it compares against instead.
  const frontIdRef = useRef('session-1')

  const rotationRef = useRef(0) // current orbit rotation, degrees
  // true only while (a) the details overlay is open, or (b) a manual
  // rotate-to-card animation is actively running — never held paused for
  // a fixed "cooldown" period. The auto-rotation resumes the instant
  // either of those ends, so using the arrows or opening/closing a card
  // never leaves the orbit sitting frozen.
  const pausedRef = useRef(false)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const radiusRef = useRef(280)
  const calmRef = useRef(false)

  const frontIndexInData = useMemo(
    () => EXPERIENCES.findIndex((e) => e.id === frontId),
    [frontId]
  )
  const openExperience = useMemo(
    () => EXPERIENCES.find((e) => e.id === displayId) || null,
    [displayId]
  )

  const OVERLAY_FADE_MS = 500

  // Drives the lag described above: opening shows content immediately;
  // closing keeps it mounted for exactly as long as the CSS fade takes.
  useLayoutEffect(() => {
    if (openId) {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      setDisplayId(openId)
    } else if (displayId) {
      closeTimerRef.current = window.setTimeout(() => {
        setDisplayId(null)
        closeTimerRef.current = null
      }, OVERLAY_FADE_MS)
    }
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId])

  // While the overlay is open it should read as its own full screen, not
  // a page you can still scroll past — so the body is locked for as long
  // as it's visible (open, or still fading out).
  useLayoutEffect(() => {
    const shouldLock = Boolean(openId || displayId)
    if (!shouldLock) return

    // `body { overflow: hidden }` alone is exactly the pattern that
    // breaks touch-scrolling on iOS Safari inside a fixed, full-screen
    // overlay: iOS still treats the touch as trying to scroll the
    // (now-hidden) body and the whole page just refuses to move at
    // all, even though the overlay itself has its own overflow-y:auto.
    // Pinning the body with `position: fixed` instead removes it from
    // the scrollable document entirely, so there's nothing ambiguous
    // for iOS to try to scroll — the overlay becomes the only
    // scrollable surface, which it then handles correctly. The current
    // scroll position is preserved manually (position:fixed would
    // otherwise visually snap the page to the top) and restored on close.
    const scrollY = window.scrollY
    const { style } = document.body
    const prev = {
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
      overflow: style.overflow,
    }
    style.position = 'fixed'
    style.top = `-${scrollY}px`
    style.left = '0'
    style.right = '0'
    style.width = '100%'
    style.overflow = 'hidden'

    return () => {
      style.position = prev.position
      style.top = prev.top
      style.left = prev.left
      style.right = prev.right
      style.width = prev.width
      style.overflow = prev.overflow
      window.scrollTo(0, scrollY)
    }
  }, [openId, displayId])

  const render = () => {
    const rotation = rotationRef.current
    let bestId = frontIdRef.current
    let bestAbs = Infinity

    EXPERIENCES.forEach((exp) => {
      const cardEl = cardRefs.current[exp.id]
      if (!cardEl) return
      const eff = norm180(ANGLES[exp.id] + rotation)
      const rad = (eff * Math.PI) / 180
      const t = (1 + Math.cos(rad)) / 2 // 1 at front, 0 at back
      // Raising t to a power sharpens the falloff: the front card (t=1)
      // and far-back cards (t=0) land in the same place either way, but
      // the immediate neighbors — which sit at a fairly shallow angle
      // and so had a t close to 1 — now drop noticeably instead of
      // staying nearly as big/bright as the front card. Without this,
      // the front card and its neighbors read as near-equals (no clear
      // "main" card), which is what made the fan look cluttered/messy
      // with real photos instead of a clear one-card-forward focus.
      const tShaped = t ** 3
      const scale = 0.78 + 0.22 * tShaped
      // Cards past the ±90° mark are on the BACK half of the ring (the
      // side you'd only see if you could look through the front cards)
      // — hidden completely instead of lingering as faint shapes, so
      // only the front-facing arc of the orbit is ever visible, like
      // looking at a real merry-go-round from outside: you see the
      // cars facing you, not the ones around the back.
      const isBackHalf = Math.abs(eff) >= 90
      const opacity = isBackHalf ? 0 : 0.42 + 0.58 * tShaped
      const z = Math.round(t * 1000)

      // Position uses the exact same rotateY(eff) + translateZ(radius)
      // mechanism as before — proven to hit-test correctly (clicks land
      // exactly on the visible card) and to keep real orbit spacing.
      cardEl.style.transform = `translate(-50%, -50%) rotateY(${eff}deg) translateZ(${radiusRef.current}px) scale(${scale})`
      cardEl.style.opacity = `${opacity}`
      cardEl.style.zIndex = `${z}`
      cardEl.style.pointerEvents = !isBackHalf && t > 0.12 ? 'auto' : 'none'

      // No counter-rotation here: the face turns exactly WITH the outer
      // card's own angle, so each card keeps its real, natural tilt —
      // the concave, "inside of a cylinder" look of an actual rotating
      // 3D orbit, matching the reference the user asked to match,
      // rather than an artificially flattened card face.
      const faceEl = faceRefs.current[exp.id]
      if (faceEl) faceEl.style.transform = ''

      const abs = Math.abs(eff)
      if (abs < bestAbs) {
        bestAbs = abs
        bestId = exp.id
      }
    })

    if (bestId !== frontIdRef.current) {
      frontIdRef.current = bestId
      setFrontId(bestId)
    }
  }

  // gsap needs a plain object to tween a numeric value onto (a ref isn't
  // one on its own) — this small proxy bridges rotationRef and gsap.
  const rotationProxy = useRef({ v: 0 })

  const animateTo = (id: string, thenOpen: boolean) => {
    const delta = shortestDelta(rotationRef.current, -ANGLES[id])
    const to = rotationRef.current + delta
    tweenRef.current?.kill()
    rotationProxy.current.v = rotationRef.current
    // Pause auto-rotation only for the duration of this manual turn —
    // otherwise the ticker's own continuous rotation would keep adding
    // on top of this tween's target every frame, fighting it. The
    // instant the turn finishes, auto-rotation is free to continue
    // (unless this turn is opening details, which keeps it paused via
    // `openIdRef` for as long as the overlay stays up).
    pausedRef.current = true
    tweenRef.current = gsap.to(rotationProxy.current, {
      v: to,
      duration: calmRef.current ? 0.01 : 1.3,
      ease: 'power3.inOut',
      onUpdate: () => {
        rotationRef.current = rotationProxy.current.v
        render()
      },
      onComplete: () => {
        pausedRef.current = false
        if (thenOpen) setOpenId(id)
      },
    })
  }

  const handleCardClick = (id: string) => {
    if (id === frontId) {
      setOpenId(id)
    } else {
      animateTo(id, true)
    }
  }

  const handleNav = (dir: 1 | -1) => {
    const idx = RING_ORDER.indexOf(frontId)
    const nextId = RING_ORDER[(idx + dir + N) % N]
    animateTo(nextId, false)
  }

  const handleClose = () => {
    setOpenId(null)
    // Coming back from details, the orbit should already be gently
    // turning again, not sitting frozen — the ticker itself was already
    // skipping frames while `openId` was set, so un-pausing here is all
    // that's needed to let it continue immediately.
    pausedRef.current = false
  }

  useLayoutEffect(() => {
    const el = root.current
    const stage = stageRef.current
    const orbit = orbitRef.current
    if (!el || !stage || !orbit) return

    const mm = gsap.matchMedia()
    const cleanups: Array<() => void> = []

    mm.add(
      {
        calm: '(prefers-reduced-motion: reduce)',
        motion: '(prefers-reduced-motion: no-preference)',
        mobile: '(max-width: 767px)',
        desktop: '(min-width: 768px)',
      },
      (ctx) => {
        const { calm, mobile } = ctx.conditions as { calm: boolean; mobile: boolean }
        calmRef.current = calm

        const fit = () => {
          const w = stage.clientWidth
          // The stage is full-bleed (see JSX/CSS), so `w` is close to the
          // viewport width — cards are sized as a fraction of THAT, then
          // spread with a radius well beyond their own width so
          // neighbors actually separate instead of piling on the front
          // card (the earlier radius was ~1x the card width, which is
          // why cards used to overlap almost completely).
          const cardW = mobile ? w * 0.36 : Math.min(280, w * 0.2)

          // Radius scales with the angle between neighboring cards
          // instead of being a flat multiple of card width, so the
          // spacing stays correct as EXPERIENCES grows: more cards
          // means a smaller ANGLE_STEP, which on its own would crowd
          // neighbors together — a bigger radius compensates by
          // spreading that same small angle over more physical
          // distance. SPACING_MARGIN is the only hand-tuned number
          // here, calibrated once against today's 7 cards (where this
          // works out to ~1.28x card width, confirmed gap-free on
          // both mobile and desktop) and it holds at any N because
          // it's a ratio, not an absolute distance.
          const angleStepRad = (ANGLE_STEP * Math.PI) / 180
          const SPACING_MARGIN = 1.11
          radiusRef.current = (cardW / (2 * Math.sin(angleStepRad / 2))) * SPACING_MARGIN
          document.documentElement.style.setProperty('--exp-card-w', `${cardW}px`)
        }
        fit()
        window.addEventListener('resize', fit)
        cleanups.push(() => window.removeEventListener('resize', fit))

        rotationRef.current = 0
        render()

        const eyebrowEl = el.querySelector<HTMLElement>('.exp-eyebrow')
        const titleEl = el.querySelector<HTMLElement>('.exp-title')
        const navEl = el.querySelector<HTMLElement>('.exp-nav')

        const startAutoRotate = () => {
          if (calm) return
          const ticker = (_time: number, deltaMs: number) => {
            if (pausedRef.current || openIdRef.current) return
            rotationRef.current += (AUTO_ROTATE_DEG_PER_SEC * deltaMs) / 1000
            render()
          }
          gsap.ticker.add(ticker)
          cleanups.push(() => gsap.ticker.remove(ticker))
        }

        try {
          if (calm) {
            gsap.set([eyebrowEl, titleEl, orbit, navEl], { clearProps: 'all' })
            startAutoRotate()
            throw new Error('skip-reveal')
          }

          gsap.set(eyebrowEl, { opacity: 0, y: 18 })
          gsap.set(titleEl, { opacity: 0, y: 22 })
          gsap.set(orbit, { opacity: 0, scale: 0.86 })
          gsap.set(navEl, { opacity: 0, y: 14 })

          const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } })
          tl.to(eyebrowEl, { opacity: 1, y: 0, duration: 0.55 }, 0)
          tl.to(titleEl, { opacity: 1, y: 0, duration: 0.6 }, 0.1)
          tl.to(orbit, { opacity: 1, scale: 1, duration: 1.1, ease: 'power3.out' }, 0.25)
          tl.to(navEl, { opacity: 1, y: 0, duration: 0.5 }, 0.9)
          tl.eventCallback('onComplete', startAutoRotate)

          const trigger = ScrollTrigger.create({
            trigger: el,
            start: 'top 72%',
            once: true,
            onEnter: () => tl.play(),
          })
          cleanups.push(() => trigger.kill())
          cleanups.push(() => tl.kill())

          const safety = window.setTimeout(() => {
            if (tl.progress() > 0) return
            console.warn('[ExperiencesSection] safety timeout fired — forcing visible + starting auto-rotate.')
            tl.progress(1)
            startAutoRotate()
          }, 8000)
          cleanups.push(() => window.clearTimeout(safety))
        } catch (err) {
          if (!(err instanceof Error && err.message === 'skip-reveal')) {
            console.error('[ExperiencesSection] entrance failed to set up:', err)
            gsap.set([eyebrowEl, titleEl, orbit, navEl], { clearProps: 'all' })
            startAutoRotate()
          }
        }

        return () => cleanups.forEach((fn) => fn())
      }
    )

    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section ref={root} className="exp" aria-labelledby="exp-title">
      <div className="exp-scene">
        <div className="exp-head">
          <p className="exp-eyebrow">تجارب مسار</p>
          <h2 id="exp-title" className="exp-title">
            من كل تجربة، نصنع مسارًا
          </h2>
        </div>
      </div>

      {/* Full-bleed on purpose — the orbit needs the whole section's
          width to fan its cards out with real spacing, not just the
          narrower centered column the headline text sits in. */}
      <div className="exp-stage" ref={stageRef}>
        <div className="exp-orbit" ref={orbitRef}>
          {EXPERIENCES.map((exp) => {
              const isActive = exp.id === frontId
              return (
                <div
                  key={exp.id}
                  ref={(elNode) => {
                    cardRefs.current[exp.id] = elNode
                  }}
                  className={`exp-card ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleCardClick(exp.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={exp.kind === 'session' ? `جلسة حوارية: ${exp.title}` : `زيارة: ${exp.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleCardClick(exp.id)
                    }
                  }}
                >
                  {/* Counter-rotated against the outer card's orbital
                      angle (see render()) so the picture+text plane
                      stays close to flat — the outer box keeps the real
                      position/rotation math that click detection relies
                      on; only this inner layer's tilt is dampened. */}
                  <div
                    className="exp-card-face"
                    ref={(elNode) => {
                      faceRefs.current[exp.id] = elNode
                    }}
                    style={{ backgroundImage: `url(${exp.image})` }}
                  >
                    <i className="exp-card-shade" aria-hidden="true" />
                    <div className="exp-card-body">
                      <span className="exp-card-kind">
                        {exp.kind === 'session' ? 'جلسة حوارية' : 'زيارة'}
                      </span>
                      <span className="exp-card-title">{exp.title}</span>
                      {exp.kind === 'session' && (
                        <span className="exp-card-guest">
                          مع {exp.guests.map((g) => g.name).join(' و')}
                        </span>
                      )}
                    </div>
                    {/* A real drawn icon, not a text arrow character — on
                        iOS, unicode arrow glyphs like ↗ render through
                        Apple's color emoji font instead of plain text,
                        which is why it showed up looking like a little
                        colored emoji on the phone instead of a clean
                        white arrow. An inline SVG always renders exactly
                        as drawn, on every device. */}
                    <i className="exp-card-arrow" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M19 12H5M5 12L11 6M5 12L11 18"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </i>
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      <div className="exp-scene">
        <div className="exp-nav">
          <button
            type="button"
            className="exp-nav-btn"
            onClick={() => handleNav(1)}
            aria-label="التجربة السابقة"
          >
            ‹
          </button>

          <span className="exp-nav-count">
            <span className="exp-nav-count-current">
              {String(frontIndexInData + 1).padStart(2, '0')}
            </span>
            <span className="exp-nav-count-sep"> / </span>
            <span>{String(N).padStart(2, '0')}</span>
          </span>

          <button
            type="button"
            className="exp-nav-btn"
            onClick={() => handleNav(-1)}
            aria-label="التجربة التالية"
          >
            ›
          </button>
        </div>
      </div>

      <div className={`exp-details ${openId ? 'is-open' : ''}`}>
        {openExperience && (
          <div className="exp-details-panel">
            <button type="button" className="exp-details-close" onClick={handleClose} aria-label="إغلاق">
              ×
            </button>

            <div
              className="exp-details-image"
              style={{ backgroundImage: `url(${openExperience.image})` }}
            />

            <div className="exp-details-content">
              <span className="exp-details-kind">
                {openExperience.kind === 'session' ? 'جلسة حوارية' : 'زيارة'}
              </span>
              <h3 className="exp-details-title">{openExperience.title}</h3>

              {openExperience.kind === 'session' ? (
                <>
                  <div className="exp-details-guests">
                    {openExperience.moderator && (
                      <div className="exp-details-guest">
                        <span className="exp-details-guest-role-tag">المحاور</span>
                        <span className="exp-details-guest-name">{openExperience.moderator.name}</span>
                        <p className="exp-details-guest-bio">{openExperience.moderator.role}</p>
                      </div>
                    )}
                    {openExperience.guests.map((g) => (
                      <div className="exp-details-guest" key={g.name}>
                        <span className="exp-details-guest-name">{g.name}</span>
                        <p className="exp-details-guest-bio">{g.role}</p>
                      </div>
                    ))}
                  </div>
                  <p className="exp-details-about">{openExperience.about}</p>
                </>
              ) : (
                <>
                  <p className="exp-details-about">{openExperience.aboutPlace}</p>
                  <p className="exp-details-about">{openExperience.about}</p>
                </>
              )}

              <p className="exp-details-location">
                <span>الموقع:</span> {openExperience.location}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}