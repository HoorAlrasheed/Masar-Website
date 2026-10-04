import { useLayoutEffect, useRef, useState } from 'react'
import type React from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { FEATURED } from '../data/featured'

import './FeaturedSection.css'

const IMAGE_ALT = 'صورة مميز الشهر في مبادرة مسار'

gsap.registerPlugin(ScrollTrigger)

/* -----------------------------------------------------------------
   SECTION 06 — مميز الشهر (Spotlight)
   Story: "من الأثر إلى الضوء".
   1) BRIDGE — as the partners wall leaves, it dims and slows down
      ("the house lights go down"), and a single thread of the same sky
      light used by the road in "عن مسار" draws itself downward.
   2) STAGE — the thread lands exactly on the person in the photo and
      opens as a vertical slit of light, which then widens to reveal
      the whole scene (grayscale → color, slow focus pull).
   3) Centered under the photo, the featured name. Clicking it opens a
      full-screen details "page" — the exact same pattern as the
      experiences section (fixed layer, same flat tone, round × to
      close, page underneath locked) — no route change.
   4) A last trace of the light draws along the seam into the footer.

   The background stays the site's flat #07111b — only light changes.
   MONTHLY UPDATE: edit src/data/featured.ts and swap the photo —
   nothing in this file needs touching.
   ----------------------------------------------------------------- */


// Two lines. `lit` marks the word that gets the light.
const QUOTE_LINES = [
  [{ w: 'بعض' }, { w: 'الخطوات…' }],
  [{ w: 'تُضيء', lit: true }, { w: 'الطريق' }, { w: 'للجميع' }],
]

// The slit of light opens exactly on the person (see focusX in data/featured.ts)
const FX = Math.min(98, Math.max(2, FEATURED.focusX))
const SLIT = `inset(0% ${(100 - FX - 0.4).toFixed(2)}% 0% ${FX}%)`
const focusStyle = { '--ftr-x': `${FX}%` } as React.CSSProperties

export default function FeaturedSection() {
  const root = useRef<HTMLElement>(null)
  const nameRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  /* ---------------- scroll story ---------------- */
  useLayoutEffect(() => {
    const el = root.current
    if (!el) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      el.classList.add('ftr--static')
      return
    }

    const q = <T extends Element>(s: string) => el.querySelector(s) as T | null

    const ctx = gsap.context(() => {
      /* 1) partners wall: lights down + slow down as we leave it.
         Touches only inline opacity + the CSS animations' playbackRate,
         both fully reversed by scrolling back up. */
      const wall = document.querySelector<HTMLElement>('.prt-wall')
      if (wall) {
        const tracks = Array.from(wall.querySelectorAll<HTMLElement>('.prt-track'))
        gsap.fromTo(
          wall,
          { opacity: 1 },
          {
            opacity: 0.22,
            ease: 'none',
            // Only once the wall itself is on its way OUT (its bottom edge
            // has passed 40% of the screen) — never while it's still the
            // thing being looked at.
            scrollTrigger: {
              trigger: wall,
              start: 'bottom 40%',
              end: 'bottom top',
              scrub: true,
              onUpdate: (self) => {
                const rate = 1 - self.progress * 0.8
                tracks.forEach((t) => {
                  try {
                    t.getAnimations().forEach((a) => (a.playbackRate = rate))
                  } catch {
                    /* older browsers: skip the slow-down, keep the dim */
                  }
                })
              },
            },
          }
        )
      }

      /* 2) ambient: edges darken, a soft glow gathers where the light lands */
      gsap.fromTo(
        q('.ftr-ambient'),
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 10%', scrub: true },
        }
      )

      /* 3) the thread of light draws down, its head travels with it */
      const bridge = q<HTMLElement>('.ftr-bridge')
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: bridge, start: 'top 85%', end: 'bottom 62%', scrub: 0.6 },
        })
        .fromTo(q('.ftr-thread-line'), { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0)
        .fromTo(q('.ftr-thread-head'), { top: '0%', opacity: 0 }, { top: '100%', opacity: 1, duration: 1 }, 0)
        .fromTo(
          q('.ftr-label'),
          { opacity: 0, x: 18 },
          { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' },
          0.3
        )

      /* 4) the stage: slit of light on the person → the whole scene */
      const stage = q<HTMLElement>('.ftr-stage')
      const words = el.querySelectorAll('.ftr-word')
      gsap
        .timeline({
          scrollTrigger: { trigger: stage, start: 'top 62%', end: 'top 8%', scrub: 0.8 },
        })
        .fromTo(
          q('.ftr-reveal'),
          { clipPath: SLIT },
          { clipPath: SLIT, duration: 0.12, ease: 'none' },
          0
        )
        .to(q('.ftr-reveal'), { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power2.inOut' }, 0.12)
        // grayscale → color is a crossfade of a pre-filtered copy (opacity
        // only, GPU) instead of animating `filter` every frame, which is
        // heavy on phones
        .fromTo(
          q('.ftr-parallax'),
          { scale: 1.16 },
          { scale: 1, duration: 1.25, ease: 'power2.out' },
          0
        )
        .fromTo(q('.ftr-img-mono'), { opacity: 1 }, { opacity: 0, duration: 1.1, ease: 'power1.inOut' }, 0.1)
        .fromTo(q('.ftr-slit'), { opacity: 1 }, { opacity: 0, duration: 0.5, ease: 'power1.out' }, 0.35)
        .fromTo(
          words,
          { yPercent: 70, opacity: 0, rotateX: 40 },
          { yPercent: 0, opacity: 1, rotateX: 0, stagger: 0.07, duration: 0.4, ease: 'power3.out' },
          0.75
        )
        .fromTo(q('.ftr-corner'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 1.1)

      /* 5) the name: rises in once the scene is lit */
      gsap
        .timeline({
          scrollTrigger: { trigger: q('.ftr-name'), start: 'top 92%', end: 'top 70%', scrub: 0.8 },
        })
        .fromTo(q('.ftr-name'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0)
        .fromTo(
          el.querySelectorAll('.ftr-name-rule'),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.8, ease: 'power2.inOut' },
          0.2
        )

      /* 7) subtle cursor parallax (fine pointers only) */
      if (window.matchMedia('(pointer: fine)').matches && stage) {
        const img = q('.ftr-parallax')
        const glow = q('.ftr-follow')
        const xImg = gsap.quickTo(img, 'x', { duration: 0.9, ease: 'power3.out' })
        const yImg = gsap.quickTo(img, 'y', { duration: 0.9, ease: 'power3.out' })
        const xG = gsap.quickTo(glow, 'xPercent', { duration: 1.2, ease: 'power3.out' })
        const yG = gsap.quickTo(glow, 'yPercent', { duration: 1.2, ease: 'power3.out' })
        const move = (e: PointerEvent) => {
          const r = stage.getBoundingClientRect()
          const nx = (e.clientX - r.left) / r.width - 0.5
          const ny = (e.clientY - r.top) / r.height - 0.5
          xImg(nx * -14)
          yImg(ny * -10)
          xG(nx * 40)
          yG(ny * 40)
        }
        const leave = () => {
          xImg(0)
          yImg(0)
          xG(0)
          yG(0)
        }
        stage.addEventListener('pointermove', move)
        stage.addEventListener('pointerleave', leave)
        return () => {
          stage.removeEventListener('pointermove', move)
          stage.removeEventListener('pointerleave', leave)
        }
      }
    }, el)

    return () => {
      ctx.revert()
      document
        .querySelectorAll<HTMLElement>('.prt-track')
        .forEach((t) => t.getAnimations?.().forEach((a) => (a.playbackRate = 1)))
    }
  }, [])

  /* ---------------- details "page" ----------------
     Same body-lock technique as the experiences overlay: pin the body
     with position:fixed (iOS-safe), restore the exact scroll on close. */
  useLayoutEffect(() => {
    if (!open) return

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

    closeRef.current?.focus({ preventScroll: true })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('keydown', onKey)
      style.position = prev.position
      style.top = prev.top
      style.left = prev.left
      style.right = prev.right
      style.width = prev.width
      style.overflow = prev.overflow
      window.scrollTo(0, scrollY)
      // While the body was pinned, scroll read as 0 and every scrubbed
      // animation eased back toward its start. Snap them straight to the
      // restored position so nothing visibly replays after closing.
      ScrollTrigger.update()
      ScrollTrigger.getAll().forEach((st) => {
        const tween = st.getTween() as unknown
        if (tween && typeof (tween as gsap.core.Tween).progress === 'function') {
          ;(tween as gsap.core.Tween).progress(1)
        }
      })
      nameRef.current?.focus({ preventScroll: true })
    }
  }, [open])

  const details = (
    <div className={`ftr-details ${open ? 'is-open' : ''}`}
      style={focusStyle}
      role="dialog"
      aria-modal="true"
      aria-label="تفاصيل مميز الشهر"
      aria-hidden={!open}
    >
      <button ref={closeRef}
        type="button"
        className="ftr-details-close"
        onClick={() => setOpen(false)}
        aria-label="إغلاق"
        tabIndex={open ? 0 : -1}
      >
        ×
      </button>

      <div className="ftr-details-panel">
        <div className="ftr-details-image">
          <img src={FEATURED.image} alt={IMAGE_ALT} draggable={false} />
        </div>

        <div className="ftr-details-content">
          <span className="ftr-details-kind">مميز الشهر</span>
          <h3 className="ftr-details-title">{FEATURED.fullName}</h3>

          <div className="ftr-details-row">
            <span className="ftr-details-tag">الإدارة</span>
            <p className="ftr-details-value">{FEATURED.department}</p>
          </div>

          <a className="ftr-details-link"
            href={FEATURED.linkedin}
            target="_blank"
            rel="noreferrer"
            tabIndex={open ? 0 : -1}
          >
            <span className="ftr-in">in</span>
            <span>LinkedIn</span>
            {/* Same drawn arrow as the experiences cards — a text glyph
                like ↗ renders as a colored emoji on iOS. */}
            <i className="ftr-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L11 6M5 12L11 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </i>
          </a>
        </div>
      </div>
    </div>
  )

  return (
    <section ref={root} className="ftr" style={focusStyle} aria-labelledby="ftr-quote">
      <div className="ftr-ambient" aria-hidden="true" />

      <div className="ftr-frame">
        {/* ---- the bridge: a thread of light leaving the partners wall ---- */}
        <div className="ftr-bridge" aria-hidden="true">
          <div className="ftr-thread">
            <span className="ftr-thread-line" />
            <span className="ftr-thread-head">
              <i />
            </span>
          </div>
          <p className="ftr-label">
            <span>مميز الشهر</span>
            <small>MASAR / SPOTLIGHT</small>
          </p>
        </div>

        {/* ---- the stage ---- */}
        <div className="ftr-stage">
          <div className="ftr-reveal">
            <div className="ftr-parallax">
              <img className="ftr-img"
                src={FEATURED.image}
                alt={IMAGE_ALT}
                loading="lazy"
                draggable={false}
              />
              <img className="ftr-img ftr-img-mono"
                src={FEATURED.image}
                alt=""
                aria-hidden="true"
                loading="lazy"
                draggable={false}
              />
            </div>
            <div className="ftr-shade" aria-hidden="true" />
            <div className="ftr-follow" aria-hidden="true" />
          </div>

          <span className="ftr-slit" aria-hidden="true" />

          <h2 id="ftr-quote" className="ftr-quote">
            {QUOTE_LINES.map((line, li) => (
              <span className="ftr-line" key={li}>
                {line.map(({ w, lit }, i) => (
                  <span className="ftr-word-mask" key={i}>
                    <span className={`ftr-word ${lit ? 'is-lit' : ''}`}>{w}</span>
                  </span>
                ))}
              </span>
            ))}
          </h2>

          <span className="ftr-corner" aria-hidden="true">
            MASAR — 06
          </span>
        </div>

        {/* ---- the featured name, centered under the scene ---- */}
        <div className="ftr-name-wrap">
          <button ref={nameRef}
            type="button"
            className="ftr-name"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <span className="ftr-name-eyebrow">
              <span className="ftr-name-rule" aria-hidden="true" />
              مميز هذا الشهر
              <span className="ftr-name-rule" aria-hidden="true" />
            </span>
            <span className="ftr-name-row">
              <span className="ftr-name-text">{FEATURED.fullName}</span>
              <span className="ftr-name-cta" aria-hidden="true">
                <span className="ftr-name-plus" />
              </span>
            </span>
            <span className="ftr-name-underline" aria-hidden="true" />
          </button>
        </div>
      </div>


      {typeof document !== 'undefined' ? createPortal(details, document.body) : null}
    </section>
  )
}
