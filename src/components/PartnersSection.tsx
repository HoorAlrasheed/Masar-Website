import { useEffect, useRef, useState } from 'react'

import { PARTNERS, SPONSORS } from '../data/partners'

import './PartnersSection.css'

/* -----------------------------------------------------------------
   SECTION 05 — شراكات مسار (Partners)
   Same header pattern as every other section (eyebrow + big headline,
   see .exp-head/.exp-eyebrow/.exp-title in ExperiencesSection.css —
   this reuses that exact visual language, not a new one), then a
   quiet, continuous "moving logo wall" underneath: two rows, one
   drifting left, one drifting right, forever — no carousel, no cards,
   no 3D.

   The two real logos sit together, first, in the TOP row — so the
   moment this section scrolls into view, they're the very first thing
   on screen, not buried somewhere mid-loop. Both rows only start
   moving once the wall actually scrolls into view (see the
   IntersectionObserver below) — that guarantees the logos are already
   sitting there, fully visible, the instant someone arrives, rather
   than wherever a continuously-running-since-page-load loop happened
   to be by the time they scrolled down to it.

   Only 2 real partner marks exist today. Rather than leaving visible
   gaps where the missing ones "should" be, each row is one packed,
   unbroken ring — real logos wherever they exist, "شريك قادم قريبًا"
   filling every other slot with the exact same spacing, dot-separated
   like a single continuous strip. Add a partner any time by turning
   one of the `{ kind: 'soon' }` entries into `{ kind: 'logo', ... }` —
   the ring re-loops itself automatically, no other code to touch.
   ----------------------------------------------------------------- */

type PartnerItem =
  | { kind: 'logo'; src: string; alt: string }
  | { kind: 'soon'; label: string }

// The logos come from src/data/partners.ts — the partners on the top
// row, the sponsors on the bottom one, each followed by two "قريبًا"
// fillers. Add a partner or a sponsor there and it appears here too.
const ROW_1: PartnerItem[] = [
  ...PARTNERS.map((p): PartnerItem => ({ kind: 'logo', src: p.logo, alt: p.name })),
  { kind: 'soon', label: 'شريك قادم قريبًا' },
  { kind: 'soon', label: 'شريك قادم قريبًا' },
]

const ROW_2: PartnerItem[] = [
  ...SPONSORS.map((s): PartnerItem => ({ kind: 'logo', src: s.logo, alt: s.name })),
  { kind: 'soon', label: 'راعٍ قادم قريبًا' },
  { kind: 'soon', label: 'راعٍ قادم قريبًا' },
]

function MarqueeRow({
  items,
  reverse,
  secondsPerItem,
  running,
}: {
  items: PartnerItem[]
  reverse: boolean
  // How many seconds it takes ONE slot to cross from entering on one
  // side to fully passing — the actual, size-independent "speed" dial.
  // Duration is computed FROM this below, instead of being a fixed
  // number, specifically so that stretching the ring wider (next) never
  // silently changes how fast any single item appears to move.
  secondsPerItem: number
  running: boolean
}) {
  // With as few as 1-4 real slots, laying the sequence out just TWICE
  // wouldn't come close to filling a wide screen — there'd be long
  // stretches of visible empty track between one lap of the ring and
  // the next, exactly the "gap" problem this section keeps running
  // into. So the base sequence (whatever it is — 4 slots today, more
  // as partners are added) repeats enough times first to comfortably
  // out-span any real screen width, and THAT extended sequence is what
  // gets laid out twice back-to-back for the seamless loop. The result
  // reads exactly like the "دائرة تدور" she asked for: the same items
  // circling past again and again, with the screen always full.
  //
  // Repeating the content 8x makes the track 8x wider — if the
  // animation duration stayed fixed, each item would then have to
  // cross that much more distance in the same time, i.e. move 8x
  // FASTER than intended (this is exactly the "ليش صارت سريعة" bug).
  // Scaling the duration by the same item count it took to build the
  // ring keeps the per-item speed constant no matter how many slots
  // — real or "قريبًا" — end up in it.
  const REPEATS = 8
  const extended = Array.from({ length: REPEATS }, () => items).flat()
  const doubled = [...extended, ...extended]
  const durationSec = secondsPerItem * extended.length

  return (
    <div className="prt-row" aria-hidden={false}>
      <div
        className={`prt-track ${reverse ? 'prt-track--reverse' : ''}`}
        style={{
          animationDuration: `${durationSec}s`,
          animationPlayState: running ? 'running' : 'paused',
        }}
      >
        {doubled.map((item, i) => {
          // Only the FIRST lap of the extended sequence is announced to
          // screen readers — every repeat after that (including the
          // whole second half used for the seamless loop) is decorative.
          const isDuplicate = i >= items.length
          return (
            <div className="prt-item" key={i} aria-hidden={isDuplicate}>
              {item.kind === 'logo' ? (
                <img src={item.src} alt={item.alt} className="prt-logo" loading="lazy" draggable={false} />
              ) : (
                <span className="prt-soon">{item.label}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function PartnersSection() {
  const wallRef = useRef<HTMLDivElement>(null)
  // Both tracks stay parked at their very first frame — logos already
  // sitting there, fully visible — until the wall actually scrolls
  // into view; only then do they start drifting. Once triggered, they
  // never pause again (same "once" pattern the other sections use for
  // their own scroll-triggered reveals).
  const [running, setRunning] = useState(false)

  useEffect(() => {
    const el = wallRef.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setRunning(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRunning(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="prt" aria-labelledby="prt-title">
      <div className="prt-scene">
        <div className="prt-head">
          <p className="prt-eyebrow">شركاء ورعاة مسار</p>
          <h2 id="prt-title" className="prt-title">
            من كل دعمٍ، نصنع أثرًا
          </h2>
        </div>
      </div>

      {/* Full-bleed, like the orbit stage above it — the rows need the
          whole viewport width to drift across, not the narrower centered
          column the heading sits in. */}
      <div className="prt-wall" role="group" aria-label="شركاء مسار" ref={wallRef}>
        <MarqueeRow items={ROW_1} reverse={false} secondsPerItem={5} running={running} />
        <MarqueeRow items={ROW_2} reverse secondsPerItem={5.5} running={running} />
      </div>
    </section>
  )
}