import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import './StatsSection.css'

gsap.registerPlugin(ScrollTrigger)

type Stat = {
  value: number
  suffix?: string
  label: string
  note: string
}

/* -----------------------------------------------------------------
   REAL DATA — مسار's actual figures. The list can still grow or
   shrink freely — the spine, the stagger, and the counters all adapt
   to however many items are here.
   ----------------------------------------------------------------- */
const STATS: Stat[] = [
  {
    value: 124,
    suffix: '+',
    label: 'أعضاء مسار',
    note: 'عضوًا في مسار.',
  },
  {
    value: 1000,
    suffix: '+',
    label: 'المستفيدون',
    note: 'مستفيد من مسار.',
  },
  {
    value: 7000,
    suffix: '+',
    label: 'ساعات العمل والعطاء',
    note: 'ساعة من العطاء والعمل.',
  },
  {
    value: 15,
    suffix: '+',
    label: 'البرامج والفعاليات',
    note: 'برنامجًا وفعالية.',
  },
]

export default function StatsSection() {
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
        calm: '(prefers-reduced-motion: reduce)',
        motion: '(prefers-reduced-motion: no-preference)',
      },
      (ctx) => {
        const { calm } = ctx.conditions as { calm: boolean }
        const cleanups: Array<() => void> = []

        const eyebrowEl = one<HTMLElement>('.ms-eyebrow')
        const titleEl = one<HTMLElement>('.ms-title')
        const spineEl = one<HTMLElement>('.ms-spine-line')
        const rowEls = all<HTMLElement>('.ms-row')
        const nodeEls = all<HTMLElement>('.ms-node')
        const numEls = all<HTMLElement>('.ms-num')

        // The eyebrow ("بالأرقام") and the big headline ("أثرٌ يُقاس،
        // ومساراتٌ تُبنى") are ALWAYS visible, full opacity, right where
        // they sit in the layout — never animated in. They're the first
        // thing that tells someone scrolling past that there's a whole
        // section here, so they shouldn't be hidden/faded while everything
        // else beneath them is still playing its reveal. Only the spine,
        // the stat rows, and the counters still do the on-scroll build.
        if (eyebrowEl) gsap.set(eyebrowEl, { clearProps: 'all' })
        if (titleEl) gsap.set(titleEl, { clearProps: 'all' })

        const showFinal = () => {
          if (spineEl) gsap.set(spineEl, { clearProps: 'all' })
          gsap.set(rowEls, { clearProps: 'all' })
          gsap.set(nodeEls, { clearProps: 'all' })
          numEls.forEach((num) => {
            const target = Number(num.dataset.target || '0')
            num.textContent = target.toLocaleString('en-US')
          })
        }

        if (calm) {
          showFinal()
          return
        }

        try {
          if (!spineEl || !rowEls.length) {
            throw new Error('skip-stats')
          }

          /* ---------------------------------------------------------
             A cinematic build that REPLAYS every time the section is
             scrolled into view (scroll away, then back down into it
             again → it plays again from the top, counters included).
             Every tween below is a `fromTo`, so `tl.restart()` always
             replays the whole sequence cleanly from its hidden/zero
             starting state — never "from wherever it happened to be
             last", which is what would make a restarted counter look
             like it starts already at its final number. It's still a
             single directed sequence (spine → stats stagger → counters
             → settle), just one that can run more than once. The
             eyebrow/title are no longer part of this timeline at all —
             see above, they're always on.
             --------------------------------------------------------- */
          gsap.set(spineEl, { scaleY: 0, transformOrigin: '50% 0%' })
          gsap.set(rowEls, { opacity: 0, y: 30 })
          gsap.set(nodeEls, { opacity: 0, scale: 0 })
          numEls.forEach((num) => {
            num.textContent = '0'
          })

          const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } })

          tl.fromTo(spineEl, { scaleY: 0 }, { scaleY: 1, duration: 1.1, ease: 'power2.inOut' }, 0)

          // ↓↓↓ The one number to tune if the count-up feels too fast/slow.
          // How long EACH number takes to climb from 0 to its final
          // value, in seconds. All four numbers start counting up at the
          // very same moment (COUNT_START, below) — together, not one
          // after another — as soon as the section scrolls into view.
          const COUNT_DURATION = 1.5
          const COUNT_START = 0.55 // when ALL counters start, in the timeline

          rowEls.forEach((row, i) => {
            const at = 0.55 + i * 0.18
            tl.fromTo(row, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, at)
            const node = nodeEls[i]
            if (node) {
              tl.fromTo(node, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }, at)
            }

            const num = one<HTMLElement>('.ms-num', row)
            if (num) {
              const target = Number(num.dataset.target || '0')
              const counter = { val: 0 }
              tl.fromTo(
                counter,
                { val: 0 },
                {
                  val: target,
                  duration: COUNT_DURATION,
                  // Linear, not eased: an ease-out front-loads most of
                  // the change early then crawls for the rest of the
                  // duration. That's barely noticeable on a big number
                  // like 7000 (each visible tick is a tiny fraction of
                  // the total), but on a small target like 15 it means
                  // jumping to ~9-10 almost instantly and then limping
                  // through 11, 12, 13... for the rest of the animation
                  // — reading as "stuck" instead of counting up. A
                  // steady linear pace ticks visibly the whole time,
                  // for every number regardless of its size.
                  ease: 'none',
                  onUpdate: () => {
                    num.textContent = Math.round(counter.val).toLocaleString('en-US')
                  },
                },
                COUNT_START
              )
            }
          })

          const replay = () => tl.restart()

          const trigger = ScrollTrigger.create({
            trigger: el,
            start: 'top 72%',
            end: 'bottom 20%',
            onEnter: replay,
            onEnterBack: replay,
          })
          cleanups.push(() => trigger.kill())
          cleanups.push(() => tl.kill())

          let everStarted = false
          tl.eventCallback('onStart', () => {
            everStarted = true
          })
          const safety = window.setTimeout(() => {
            if (everStarted) return
            console.warn('[StatsSection] safety timeout fired — the scroll-triggered build never started, forcing final state.')
            showFinal()
          }, 8000)
          cleanups.push(() => window.clearTimeout(safety))
        } catch (err) {
          if (!(err instanceof Error && err.message === 'skip-stats')) {
            console.error('[StatsSection] entrance failed to set up:', err)
          }
          showFinal()
        }

        return () => cleanups.forEach((fn) => fn())
      }
    )

    return () => mm.revert()
  }, [])

  return (
    <section ref={root} className="ms" aria-labelledby="ms-title">
      <div className="ms-scene">
        <div className="ms-head">
          <p className="ms-eyebrow">
            بالأرقام
          </p>
          <h2 id="ms-title" className="ms-title">
            أثرٌ يُقاس، ومساراتٌ تُبنى
          </h2>
        </div>

        <div className="ms-track">
          <i className="ms-spine-line" aria-hidden="true" />

          {STATS.map((s, i) => (
            <div className={`ms-row ${i % 2 === 0 ? 'ms-row--a' : 'ms-row--b'}`} key={i}>
              <div className="ms-row-content">
                <p className="ms-label">{s.label}</p>
                <div className="ms-value">
                  <span className="ms-num" data-target={s.value}>
                    0
                  </span>
                  {s.suffix && <span className="ms-affix">{s.suffix}</span>}
                </div>
                <p className="ms-note">{s.note}</p>
              </div>

              <i className="ms-node" aria-hidden="true" />

              <div className="ms-row-spacer" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}