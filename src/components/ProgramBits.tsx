import { useState, type ReactElement } from 'react'

/* Small shared pieces for the programmes list (/programs) and a
   programme's page (/programs/:id). */

export type ProgramStatus = 'open' | 'soon' | 'closed'

const AR = '٠١٢٣٤٥٦٧٨٩'
export const toArabic = (n: number) => String(Math.round(n)).replace(/\d/g, (d) => AR[+d])

/* the place's Google Maps link: the programme's own mapUrl if it has one,
   otherwise a Maps search for the place's name */
export const mapLink = (p: { location: string; mapUrl?: string }) =>
  p.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.location)}`

/* registration status — the short badge, and the button's words */
export const STATUS: Record<ProgramStatus, { badge: string; action: string }> = {
  open: { badge: 'التسجيل مفتوح', action: 'التسجيل في البرنامج' },
  soon: { badge: 'قريبًا', action: 'يفتح التسجيل قريبًا' },
  closed: { badge: 'منتهي', action: 'انتهى التسجيل' },
}

/* each type gets its own abstract artwork (no photos needed) */
export const TYPE_ART: Record<string, string> = {
  'جلسات حوارية': 'talk',
  معسكرات: 'camp',
  هاكاثونات: 'hack',
  زيارات: 'visit',
  'ورش العمل': 'work',
}

/* the thumbnail: a photo (the guest, or the place) when the programme has
   one, otherwise an abstract composition for its type with its mark — and
   the status badge in the corner either way */
export function ProgramArt({
  category,
  status,
  image,
  className = '',
}: {
  category: string
  status: ProgramStatus
  image?: string
  className?: string
}) {
  /* if the photo's path is wrong or the file is missing, fall back to the
     artwork instead of showing a broken image */
  const [broken, setBroken] = useState<string | null>(null)
  const photo = image && image.trim() && broken !== image ? image.trim() : ''

  return (
    <div className={`prg-art ${className}`} data-art={photo ? 'photo' : (TYPE_ART[category] ?? 'talk')} aria-hidden="true">
      {photo ? (
        <>
          <img className="prg-art-img" src={photo} alt="" loading="lazy" decoding="async" onError={() => setBroken(photo)} />
          <span className="prg-art-tint" />
        </>
      ) : (
        <>
          <span className="prg-art-shape prg-art-shape--a" />
          <span className="prg-art-shape prg-art-shape--b" />
          <span className="prg-art-mark">{TYPE_MARKS[category]}</span>
        </>
      )}
      <span className="prg-badge" data-status={status}>
        {STATUS[status].badge}
      </span>
    </div>
  )
}

/* one small line-mark per type of programme */
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const TYPE_MARKS: Record<string, ReactElement> = {
  /* two speech bubbles */
  'جلسات حوارية': (
    <svg viewBox="0 0 24 24">
      <path d="M4 5H15V13H8L5 16V13H4Z" {...S} />
      <path d="M18 9H20V17H19V20L16 17H11V16" {...S} />
    </svg>
  ),
  /* a tent */
  معسكرات: (
    <svg viewBox="0 0 24 24">
      <path d="M3 20L12 5L21 20Z" {...S} />
      <path d="M12 20L9.5 14H14.5Z" {...S} />
    </svg>
  ),
  /* code brackets */
  هاكاثونات: (
    <svg viewBox="0 0 24 24">
      <path d="M8 7L3 12L8 17M16 7L21 12L16 17M13.5 5L10.5 19" {...S} />
    </svg>
  ),
  /* a building */
  زيارات: (
    <svg viewBox="0 0 24 24">
      <path d="M5 20V5H14V20M14 10H19V20M3 20H21M8 8.5H11M8 12H11M8 15.5H11" {...S} />
    </svg>
  ),
  /* a pencil on a sheet */
  'ورش العمل': (
    <svg viewBox="0 0 24 24">
      <path d="M5 4H14L18 8V20H5Z" {...S} />
      <path d="M8.5 12H14.5M8.5 15.5H12.5" {...S} />
    </svg>
  ),
}

/* small line icons used across the two pages */
export const ICONS: Record<string, ReactElement> = {
  date: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M4 10H20M9 3V7M15 3V7" />
    </svg>
  ),
  time: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8V12L15 14" />
    </svg>
  ),
  place: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21C12 21 5 14.5 5 9.5A7 7 0 0 1 19 9.5C19 14.5 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  ),
  who: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20C5 16 8 14 12 14S19 16 19 20" />
    </svg>
  ),
  speaker: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11A6 6 0 0 0 18 11M12 17V21M9 21H15" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16L20 20" />
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7H14M18 7H20M4 17H8M12 17H20" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6L18 18M18 6L6 18" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5M11 6L5 12L11 18" />
    </svg>
  ),
  back: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12H19M13 6L19 12L13 18" />
    </svg>
  ),
  share: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="17" cy="6" r="2.5" />
      <circle cx="7" cy="12" r="2.5" />
      <circle cx="17" cy="18" r="2.5" />
      <path d="M9.2 10.8L14.8 7.2M9.2 13.2L14.8 16.8" />
    </svg>
  ),
  empty: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M4 10H20M9 3V7M15 3V7M9.5 14.5L14.5 14.5" />
    </svg>
  ),
}

/* ---------- partner links ----------
   A partner shares a programme's own page with its name on the end:
     /programs/3?ref=stc
   The visitor lands on that programme itself. The name is kept for the
   visit (even if they go back to the list), and "سجّل الآن" carries it
   with the programme's title to the join form, which writes both in the
   sheet (البرنامج + المصدر). */
const REF_KEY = 'masar-ref'

export function partnerRef(search: URLSearchParams): string {
  const here = (search.get('ref') || '').trim().slice(0, 60)
  try {
    if (here) sessionStorage.setItem(REF_KEY, here)
    return here || sessionStorage.getItem(REF_KEY) || ''
  } catch {
    return here
  }
}

export function joinLink(program: string, ref: string) {
  const q = new URLSearchParams({ program })
  if (ref) q.set('ref', ref)
  return `/join?${q.toString()}`
}