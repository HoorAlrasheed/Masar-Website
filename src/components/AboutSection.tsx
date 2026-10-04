import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import './AboutSection.css'

gsap.registerPlugin(ScrollTrigger)

/* ---------------------------------------------------------------
   Artboard geometry — single source of truth.
   The section is an artboard with a fixed aspect ratio. Every point
   below is in artboard units, and CSS positions the HTML pieces with
   the same numbers (as %), so the SVG path and the text always align.

   The road is ONE uniform wave: crest (right) → trough (left) → crest…
   with the same amplitude and the same wavelength from start to exit,
   so it reads as a single rhythm instead of a path that changes its
   mind halfway through.
   pts[0]  = start, under the title (a crest)
   ST      = indices (into pts) that are stations — الحيرة / المعرفة / الخطوة
   last pt = exit at the bottom edge (leads into the next section)
   --------------------------------------------------------------- */
type Pt = [number, number]
type Layout = { w: number; h: number; pts: Pt[] }

const DESKTOP: Layout = {
  w: 1440,
  h: 3060,
  pts: [
    [1060, 660],
    [760, 1060],
    [1060, 1460],
    [760, 1860],
    [1060, 2260],
    [760, 2660],
    [1060, 3060],
  ],
}

const MOBILE: Layout = {
  w: 400,
  h: 2120,
  pts: [
    [350, 560],
    [270, 820],
    [350, 1080],
    [270, 1340],
    [350, 1600],
    [270, 1860],
    [350, 2120],
  ],
}

/** the three stations sit on alternating points of the same wave */
const ST = [1, 3, 5]

/** Smooth S-curves with vertical tangents at every point — equal spacing
    in y and equal amplitude in x keeps every hump identical. */
const buildPath = ({ pts }: Layout) =>
  pts.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x} ${y}`
    const [px, py] = pts[i - 1]
    const k = (y - py) / 2
    return `${d} C${px} ${py + k} ${x} ${y - k} ${x} ${y}`
  }, '')

const pct = (v: number, of: number) => +((v / of) * 100).toFixed(3)

/** alpha = resting opacity once a station is lit — clarity grows along
    the road. No blur: the word is always crisp, only dimmer or brighter. */
const STATIONS = [
  { word: 'الحيرة', note: 'حيث تتعدد الخيارات ويغيب الاتجاه.', alpha: 0.95 },
  { word: 'المعرفة', note: 'حيث تتضح المجالات ومتطلباتها بتجارب أهلها.', alpha: 0.95 },
  { word: 'الخطوة', note: 'حيث تبدأ بتجربة وفرصة حقيقية.', alpha: 0.95 },
]

const PATH_D = buildPath(DESKTOP)
const PATH_M = buildPath(MOBILE)

export default function AboutSection() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return

    const one = <T extends Element>(sel: string, from: ParentNode = el) =>
      from.querySelector(sel) as T
    const all = <T extends Element>(sel: string, from: ParentNode = el) =>
      Array.from(from.querySelectorAll(sel)) as T[]

    const mm = gsap.matchMedia()

    mm.add(
      {
        // gsap.matchMedia only runs when at least one condition matches,
        // so each axis has both of its states listed
        mobile: '(max-width: 767px)',
        desktop: '(min-width: 768px)',
        calm: '(prefers-reduced-motion: reduce)',
        motion: '(prefers-reduced-motion: no-preference)',
      },
      (ctx) => {
        const { mobile, calm } = ctx.conditions as { mobile: boolean; calm: boolean }
        const L = mobile ? MOBILE : DESKTOP
        const cleanups: Array<() => void> = []

        /* =================================================================
           0) SMOOTH SCROLL FOUNDATION — the diagnostic test (turning this
           off) did NOT fix the jump on your phone, which rules it out:
           restored to how it was, since it wasn't the cause.

           `allowNestedScroll: true` is the actual fix for a SEPARATE,
           later-discovered bug: normalizeScroll's touch handling is
           page-wide (not scoped to this section), and by default it
           captures every touch gesture on the page itself — including
           ones starting inside ExperiencesSection's fixed, full-screen
           details overlay. That silently blocked finger-swipes from
           scrolling the overlay's own content on a real iPhone (fixing
           the overlay's own CSS twice did nothing, because the real
           interception was happening here). This option tells
           normalizeScroll to detect a scrollable ancestor under the
           touch point and hand it the gesture instead of consuming it
           for the page.
           ================================================================= */
        /* UPDATE: normalizeScroll() is OFF. It replaced the phone's native
           momentum scrolling with JS-driven scrolling for the WHOLE page —
           a strong swipe stopped short instead of gliding on, so reaching
           the bottom took 3-4 swipes. ignoreMobileResize covers what it was
           protecting against (re-measuring when the mobile address bar
           shows/hides), without touching how the page scrolls. */
        ScrollTrigger.config({ ignoreMobileResize: true })

        /* =================================================================
           1) ENTRANCE — deliberately simple, after the SplitText+pin
           version kept producing a hard scroll "snap" on real phones
           (confirmed on an actual iPhone over a live tunnel, not just an
           emulator) no matter how the pin/scrub numbers were tuned, and
           turning off ScrollTrigger.normalizeScroll() didn't change it
           either. Rather than keep guessing at numbers around a fragile
           setup, this goes back to the plain, low-risk pattern: the label,
           the title, and the description each fade up as ONE block (no
           per-word splitting, no pin) on a single scrub-linked timeline.
           `scrub` (no pin) reads scroll position continuously and maps it
           straight to timeline progress — no play()/toggle moment, so nothing
           can "already be finished" before you scroll to it, and scrolling
           back up un-builds it the same way it built. This is far less
           likely to fight with real-device scroll/pin edge cases than the
           SplitText mask-reveal version was.
           ================================================================= */
        try {
          const labelEl = one<HTMLElement>('.ab-label')
          const labelLine = one<HTMLElement>('.ab-label i')
          const titleEl = one<HTMLElement>('.ab-title')
          const descEl = one<HTMLElement>('.ab-desc')

          if (calm || !labelEl || !titleEl || !descEl) {
            throw new Error('skip-to-visible')
          }

          // each title line rises out of its own mask (.ab-line has
          // overflow:hidden), one after another
          const lineEls = all<HTMLElement>('.ab-line > span')

          /* UPDATE — why the entrance used to be invisible:
             1) a 6s "safety" timer (counted from PAGE LOAD, not from
                reaching the section) forced everything visible — anyone
                who stayed on the hero for 6s+ never saw the entrance;
             2) the scroll window ended while the text was barely on
                screen.
             Now: explicit from→to values (so the reveal always plays,
             whatever state the text is in), a window that runs while the
             text is actually on screen, and a safety net that only fires
             if the ScrollTrigger itself failed to exist. */
          const entrance = gsap.timeline({
            defaults: { ease: 'power3.out' },
            scrollTrigger: {
              trigger: labelEl,
              start: 'top 95%',
              end: 'top 30%',
              scrub: 0.6,
            },
          })
            .fromTo(labelEl, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 }, 0)
            .fromTo(
              labelLine,
              { scaleX: 0, transformOrigin: '100% 50%' },
              { scaleX: 1, duration: 0.5 },
              0.1
            )
            .fromTo(
              lineEls,
              { yPercent: 105, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.18 },
              0.2
            )
            .fromTo(descEl, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6 }, 0.85)

          cleanups.push(() => entrance.scrollTrigger?.kill())
          cleanups.push(() => entrance.kill())

          if (!entrance.scrollTrigger) {
            // ScrollTrigger couldn't be created — never leave text hidden
            entrance.progress(1)
          }
        } catch (err) {
          if (!(err instanceof Error && err.message === 'skip-to-visible')) {
            console.error('[AboutSection] entrance reveal failed to set up:', err)
          }
          // Never hidden without a way back to visible: if anything above
          // threw, clear every inline style this block could have set so
          // the label/title/description end up as their original,
          // untouched, fully-visible selves.
          const labelEl = one<HTMLElement>('.ab-label')
          const labelLine = one<HTMLElement>('.ab-label i')
          const titleEl = one<HTMLElement>('.ab-title')
          const descEl = one<HTMLElement>('.ab-desc')
          if (labelEl) gsap.set(labelEl, { clearProps: 'all' })
          if (labelLine) gsap.set(labelLine, { clearProps: 'all' })
          if (titleEl) gsap.set(titleEl, { clearProps: 'all' })
          if (descEl) gsap.set(descEl, { clearProps: 'all' })
          all<HTMLElement>('.ab-line > span').forEach((n) => gsap.set(n, { clearProps: 'all' }))
        }

        /* =================================================================
           2) THE ROAD — the light that travels down and the three stations.
           Wrapped in try/catch: a problem here gets logged to the console
           instead of silently killing the entrance timeline set up above.
           ================================================================= */
        try {
          const svg = one<SVGSVGElement>(mobile ? '.ab-svg--m' : '.ab-svg--d')
          const track = one<SVGPathElement>('.ab-track', svg)
          const fill = one<SVGPathElement>('.ab-fill', svg)
          const zone = one<HTMLElement>('.ab-zone')
          const dot = one<HTMLElement>('.ab-dot')
          const dotCore = one<HTMLElement>('i', dot)
          const stations = all<HTMLElement>('.ab-st')

          if (!svg || !track || !fill || !zone || !dot || !dotCore || stations.length !== 3) {
            throw new Error('AboutSection: road markup incomplete, skipping road animation')
          }

          /* ---- stroke widths must follow the artboard scale ---- */
          // cached artboard size in px — the dot is moved with a transform
          // (its own GPU layer: no layout or repaint per frame)
          let boardW = svg.clientWidth || 1
          let boardH = svg.clientHeight || 1
          const fit = () => {
            boardW = svg.clientWidth || 1
            boardH = svg.clientHeight || 1
            const k = svg.clientWidth / L.w || 1
            track.style.strokeWidth = `${1.8 / k}`
            track.style.strokeDasharray = `0 ${11 / k}`
            fill.style.strokeWidth = `${1.4 / k}`
          }
          fit()
          ScrollTrigger.addEventListener('refreshInit', fit)
          cleanups.push(() => ScrollTrigger.removeEventListener('refreshInit', fit))

          /* ---- path geometry: y → length lookup (y is monotonic) ---- */
          const total = fill.getTotalLength()
          fill.style.strokeDasharray = `${total}`
          fill.style.strokeDashoffset = `${total}`

          const N = 300
          const lut = Array.from({ length: N + 1 }, (_, i) => {
            const len = (total * i) / N
            return { len, y: fill.getPointAtLength(len).y }
          })
          const lenAtY = (y: number) => {
            let lo = 0
            let hi = N
            while (hi - lo > 1) {
              const m = (lo + hi) >> 1
              if (lut[m].y < y) lo = m
              else hi = m
            }
            const a = lut[lo]
            const b = lut[hi]
            const t = Math.min(1, Math.max(0, (y - a.y) / (b.y - a.y || 1)))
            return a.len + (b.len - a.len) * t
          }

          const y0 = L.pts[0][1]
          const span = L.h - y0
          const thresholds = ST.map((i) => (L.pts[i][1] - y0) / span)

          // How much of the approach (as a fraction of the whole road) the
          // word spends rising in — it starts before the light gets there
          // and finishes right as it arrives, so word and light land
          // together. Lowered from 0.16: now that the dot tracks scroll
          // directly with no lag of its own, that head start read as the
          // word appearing well before the dot was actually close — 0.08
          // keeps the same "rises in, lands with the light" shape but over
          // a tighter window right before arrival instead of an early one.
          const LEAD = 0.08

          /* ---- one reveal timeline per station, scrubbed by hand below
             (no play()/reverse() — its progress is a direct function of
             how close the light is, so it always tracks the scroll) ---- */
          const reveals = stations.map((st, i) => {
            const { alpha } = STATIONS[i]
            const word = one<HTMLElement>('.ab-st-word', st)
            const note = one<HTMLElement>('.ab-st-note', st)
            const rule = one<HTMLElement>('.ab-rule', st)
            const node = one<HTMLElement>('.ab-node', st)

            return gsap
              .timeline({ paused: true, defaults: { ease: 'power3.out' } })
              .fromTo(
                word,
                {
                  yPercent: 55,
                  opacity: 0,
                  rotateX: 34,
                  transformPerspective: 900,
                  transformOrigin: '50% 100%',
                },
                { yPercent: 0, opacity: alpha, rotateX: 0, duration: 1.3 },
                0
              )
              .fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power2.inOut' }, 0.1)
              .fromTo(note, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0.55)
              .to(node, { backgroundColor: '#8fcdf0', borderColor: '#8fcdf0', scale: 1.35, duration: 0.7 }, 0)
          })

          stations.forEach((st) => {
            gsap.to(one('.ab-st-body', st), {
              y: -28,
              ease: 'none',
              scrollTrigger: { trigger: st, start: 'top bottom', end: 'bottom top', scrub: 1 },
            })
          })

          const state = { p: 0 }

          const render = () => {
            const len = lenAtY(y0 + state.p * span)
            const pt = fill.getPointAtLength(len)
            fill.style.strokeDashoffset = `${total - len}`
            dot.style.transform = `translate3d(${(pt.x / L.w) * boardW}px, ${(pt.y / L.h) * boardH}px, 0)`
            dot.style.opacity = state.p > 0.96 ? `${Math.max(0, (1 - state.p) / 0.04)}` : '1'
            dot.classList.toggle('is-idle', state.p < 0.01)

            // each word's reveal is scrubbed directly off the light's own
            // position: 0 while it's still LEAD away, 1 right as it lands
            thresholds.forEach((t, i) => {
              const local = (state.p - (t - LEAD)) / LEAD
              reveals[i].progress(Math.min(1, Math.max(0, local)))
            })
          }

          if (calm) {
            gsap.set(dotCore, { scale: 1 })
            fill.style.strokeDashoffset = '0'
            dot.style.opacity = '0'
            reveals.forEach((tl) => tl.progress(1))
          } else {
            gsap.set(dotCore, { scale: 0 })
            render()

            const glideTo = gsap.quickTo(state, 'p', {
              duration: 0.15,
              ease: 'power2.out',
              onUpdate: render,
            })

            ScrollTrigger.create({
              trigger: zone,
              start: 'top 62%',
              end: 'bottom 62%',
              // History: 0.7s and 0.25s of smoothing read as the dot
              // "hanging" behind the finger (that was with normalizeScroll's
              // JS-driven scroll). With native (momentum) scrolling back on phones, scroll
              // updates arrive unevenly — a very short glide (0.15s) turns
              // those uneven steps into smooth motion, while staying short
              // enough that the light never feels detached from the finger.
              onUpdate: (self) => {
                glideTo(self.progress)
              },
              onRefresh: (self) => {
                state.p = self.progress
                render()
              },
            })

            ScrollTrigger.create({
              trigger: zone,
              start: 'top 96%',
              once: true,
              onEnter: () => gsap.to(dotCore, { scale: 1, duration: 1.4, ease: 'power3.out' }),
            })
          }
        } catch (err) {
          // the header entrance above is already wired up and safe —
          // this only ever takes the road/dot/stations down with it
          console.error('[AboutSection] road animation failed to set up:', err)
        }

        return () => cleanups.forEach((fn) => fn())
      }
    )

    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    // Late-loading hero images can change the document's height after
    // ScrollTrigger has already measured it — refresh once more when
    // everything (including images) has actually finished loading, so
    // the entrance/road positions are computed against final layout.
    // Named + removed on cleanup: React 19 StrictMode runs this effect
    // twice in dev, and an uncleaned listener here would just quietly pile
    // up on every remount.
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)

    return () => {
      window.removeEventListener('load', onLoad)
      mm.revert()
    }
  }, [])

  return (
    <section ref={root} className="ab" aria-labelledby="ab-title">
      <div className="ab-atmo" aria-hidden="true">
        <i className="ab-glow ab-glow--a" />
        <i className="ab-glow ab-glow--b" />
        <i className="ab-glow ab-glow--c" />
      </div>

      <div className="ab-scene">
        <p className="ab-label" data-reveal>
          <i />
          عن مسار
        </p>

        <h2 id="ab-title" className="ab-title">
          <span className="ab-line ab-line--1">
            <span className="ab-line-text">نساعدك أن ترى</span>
          </span>
          <span className="ab-line ab-line--2">
            <span className="ab-way" data-reveal>
              الطريق
            </span>
          </span>
          <span className="ab-line ab-line--3">
            <span className="ab-line-text">قبل أن تخطو فيه</span>
          </span>
        </h2>

        <p className="ab-desc">
          <span className="ab-desc-text">
            مسار مبادرة تساعد الطلاب والخريجين على اكتشاف المسارات المهنية والأكاديمية،
            وفهم متطلباتها، والاستفادة من تجارب المختصين؛ لنحوّل الحيرة إلى معرفة،
            والمعرفة إلى خطوة.
          </span>
        </p>

        {/* the road: dotted route ahead + the lit part that follows the scroll */}
        {[
          { cls: 'ab-svg--d', l: DESKTOP, d: PATH_D },
          { cls: 'ab-svg--m', l: MOBILE, d: PATH_M },
        ].map(({ cls, l, d }) => (
          <svg
            key={cls}
            className={`ab-svg ${cls}`}
            viewBox={`0 0 ${l.w} ${l.h}`}
            aria-hidden="true"
            focusable="false"
          >
            <path className="ab-track" d={d} />
            <path className="ab-fill" d={d} />
          </svg>
        ))}

        <div
          className="ab-zone"
          style={
            {
              '--dzy': pct(DESKTOP.pts[0][1], DESKTOP.h),
              '--mzy': pct(MOBILE.pts[0][1], MOBILE.h),
            } as CSSProperties
          }
          aria-hidden="true"
        />

        <div className="ab-dot" aria-hidden="true">
          <i />
        </div>

        {STATIONS.map((s, i) => (
          <div
            key={s.word}
            className={`ab-st ab-st--${i + 1}`}
            style={
              {
                '--dx': pct(DESKTOP.pts[ST[i]][0], DESKTOP.w),
                '--dy': pct(DESKTOP.pts[ST[i]][1], DESKTOP.h),
                '--mx': pct(MOBILE.pts[ST[i]][0], MOBILE.w),
                '--my': pct(MOBILE.pts[ST[i]][1], MOBILE.h),
              } as CSSProperties
            }
          >
            <i className="ab-node" />
            <div className="ab-st-body">
              <span className="ab-st-word">{s.word}</span>
              <span className="ab-st-note">{s.note}</span>
              <i className="ab-rule" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}