import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import hero1 from '../imports/hero-1.jpg'
import hero2 from '../imports/hero-2.jpg'
import hero3 from '../imports/hero-3.jpg'
import hero4 from '../imports/hero-4.jpg'
import hero5 from '../imports/hero-5.jpg'
import hero6 from '../imports/hero-6.jpg'
import hero7 from '../imports/hero-7.jpg'

import AboutSection from '../components/AboutSection'
import StatsSection from '../components/StatsSection'
import ExperiencesSection from '../components/ExperiencesSection'
import PartnersSection from '../components/PartnersSection'
import FeaturedSection from '../components/FeaturedSection'

gsap.registerPlugin(ScrollTrigger)

const images = [
  hero1,
  hero2,
  hero3,
  hero4,
  hero5,
  hero6,
  hero7,
]

const heroText = [
  {
    eyebrow: 'MASAR / 01',
    small: 'طريقك يبدأ بخطوة',
    line1: 'ابنِ',
    line2: 'مسارك',
    description: 'نفتح لك الطريق نحو مسار مهني وأكاديمي أوضح.',
    align: 'right',
  },
  {
    eyebrow: 'MASAR / 02',
    small: 'اكتشف ما يناسبك',
    line1: 'اكتشف',
    line2: 'اتجاهك',
    description: 'مساحات وتجارب تساعدك على فهم الخيارات من حولك.',
    align: 'left',
  },
  {
    eyebrow: 'MASAR / 03',
    small: 'المعرفة تصنع الفرق',
    line1: 'تعلّم',
    line2: 'بوضوح',
    description: 'خبرات وتجارب تختصر عليك الكثير من الطريق.',
    align: 'right',
  },
  {
    eyebrow: 'MASAR / 04',
    small: 'من الفكرة إلى التجربة',
    line1: 'جرّب',
    line2: 'مسارك',
    description: 'برامج وفعاليات تضعك أقرب إلى واقع المجالات.',
    align: 'left',
  },
  {
    eyebrow: 'MASAR / 05',
    small: 'الفرص حولك',
    line1: 'طوّر',
    line2: 'مهاراتك',
    description: 'اكتشف الفرص والمهارات التي يحتاجها سوق العمل.',
    align: 'right',
  },
  {
    eyebrow: 'MASAR / 06',
    small: 'خطوتك القادمة',
    line1: 'شارك',
    line2: 'تجربتك',
    description: 'نساعدك على تحويل المعرفة إلى خطوة حقيقية.',
    align: 'left',
  },
  {
    eyebrow: 'MASAR / 07',
    small: 'مستقبلك يبدأ الآن',
    line1: 'انطلق',
    line2: 'نحو مستقبلك',
    description: 'لأن وضوح المسار يصنع فرقًا في الرحلة.',
    align: 'right',
  },
]

// Each hero item is a single, self-contained package: its own image, its
// own short tile "label", and its own full "title" (line1 + line2, from
// heroText). The label is intentionally NOT the same string as the title —
// it's what a box shows when it's holding this item; the title is what the
// MAIN section shows when this item is the active one.
//
// Indexes 1-6 reuse the exact labels the project already had on the tiles
// (اكتشف / تعلّم / جرّب / طوّر / شارك / انطلق). Index 0 (the item that starts
// out in MAIN) previously had no tile label defined anywhere, since it was
// never expected to land on a tile — but with a real swap, it eventually
// will, so it needs one too. Rather than inventing new copy, it reuses its
// own existing headline word ("ابنِ") as its label.
const LABELS = ['ابنِ', 'اكتشف', 'تعلّم', 'جرّب', 'طوّر', 'شارك', 'انطلق']

const heroItems = images.map((image, i) => ({
  image,
  label: LABELS[i],
  ...heroText[i],
}))

export default function HomePage() {
  // `order` is the single source of truth for "what is where":
  // order[0]      -> index into heroItems currently shown in MAIN
  // order[1..6]   -> index into heroItems currently shown in box 1..6
  // Clicking box N swaps order[0] and order[N] in place. That's it — every
  // item always lives in exactly one slot, so navigating back and forth in
  // any sequence (1 -> 2 -> 1 -> 3 -> 5 -> 7 -> 2 -> 1, or any other order)
  // is always correct, with no reliance on remembering history or reloading.
  const [order, setOrder] = useState<number[]>([0, 1, 2, 3, 4, 5, 6])
  const [changing, setChanging] = useState(false)

  const heroRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const tilesRef = useRef<HTMLDivElement>(null)
  const tileRefs = useRef<Array<HTMLButtonElement | null>>([])

  const mainIndex = order[0]
  const currentItem = heroItems[mainIndex]

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power4.out' },
      })

      tl.fromTo(
        imageRef.current,
        { scale: 1.06 },
        { scale: 1, duration: 1.8 }
      )
        .fromTo(
          contentRef.current?.querySelectorAll('.hero-piece') || [],
          { y: 45, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.08 },
          '-=1.2'
        )
        .fromTo(
          tilesRef.current?.children || [],
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.08 },
          '-=0.6'
        )

      gsap.to(imageRef.current, {
        yPercent: 7,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })
    })

    return () => ctx.revert()
  }, [])

  // Swap: MAIN's background and the clicked box's background both crossfade
  // in place — nothing grows, nothing changes size or position, exactly like
  // the project's original transition. The only difference from before is
  // that the OLD main image doesn't just disappear: the state swap underneath
  // (order[0] <-> order[slotIndex + 1]) means it becomes the new content of
  // the clicked box, so it's genuinely still there, just parked in the box.
  const changeHero = (slotIndex: number) => {
    if (changing) return

    const tileEl = tileRefs.current[slotIndex]
    if (!tileEl) return

    setChanging(true)

    const pieces = contentRef.current?.querySelectorAll('.hero-piece')

    const tl = gsap.timeline({
      onComplete: () => setChanging(false),
    })

    // fade the main image, the clicked tile's background, and the text out together
    tl.to(imageRef.current, { opacity: 0.15, duration: 0.18, ease: 'power2.in' }, 0)
      .to(tileEl, { opacity: 0.15, duration: 0.18, ease: 'power2.in' }, 0)

    if (pieces && pieces.length) {
      tl.to(pieces, { opacity: 0, y: -12, duration: 0.18, ease: 'power2.in' }, 0)
    }

    // swap the state once everything is faded down, then fade it all back in
    // with the new content already in place — background changes, nothing resizes
    tl.call(() => {
      setOrder((prev) => {
        const next = [...prev]
        const tmp = next[0]
        next[0] = next[slotIndex + 1]
        next[slotIndex + 1] = tmp
        return next
      })
    })

    tl.to(imageRef.current, { opacity: 1, duration: 0.5, ease: 'power3.out' }, '>')
      .to(tileEl, { opacity: 1, duration: 0.5, ease: 'power3.out' }, '<')

    if (pieces && pieces.length) {
      tl.fromTo(
        pieces,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.04 },
        '<'
      )
    }
  }

  return (
    <main className="masar-home">
      <section ref={heroRef} className="masar-hero">
        <div className="masar-hero-image">
          <img ref={imageRef} src={currentItem.image} alt="" />
          <div className="masar-hero-bottom" />
        </div>

        <div className="masar-hero-frame">
          <div
            ref={contentRef}
            className={`masar-hero-content ${currentItem.align}`}
          >
            <div className="hero-piece masar-eyebrow">
              {currentItem.eyebrow}
            </div>

            <div className="hero-piece masar-small">
              {currentItem.small}
            </div>

            <h1 className="hero-piece masar-title">
              <span>{currentItem.line1}</span>
              <strong>{currentItem.line2}</strong>
            </h1>

            <p className="hero-piece masar-description">
              {currentItem.description}
            </p>

            <div className="hero-piece masar-actions">
              <Link to="/join" state={{ from: '/', label: 'الرئيسية' }} className="masar-main-btn">
                انضم إلى مسار
              </Link>

              <Link to="/about" className="masar-text-btn">
                اكتشف مسار
                <span>←</span>
              </Link>
            </div>
          </div>

          <div className="masar-counter">
            <span>0{mainIndex + 1}</span>
            <i />
            <span>07</span>
          </div>

          <div ref={tilesRef} className="masar-tiles">
            {order.slice(1).map((itemIndex, slot) => {
              const item = heroItems[itemIndex]
              return (
                <button
                  key={`box-${slot}`}
                  ref={(el) => {
                    tileRefs.current[slot] = el
                  }}
                  type="button"
                  onClick={() => changeHero(slot)}
                  disabled={changing}
                  className="masar-tile"
                  aria-label={`عرض ${item.label}`}
                  style={{
                    backgroundImage: `url(${item.image})`,
                  }}
                >
                  <span className="masar-tile-number">
                    0{slot + 2}
                  </span>

                  <span className="masar-tile-label">
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="masar-scroll">
            <span>SCROLL TO EXPLORE</span>
            <i />
          </div>
        </div>
      </section>

      <AboutSection />
      <StatsSection />
      <ExperiencesSection />
      <PartnersSection />
      <FeaturedSection />
    </main>
  )
}