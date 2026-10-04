import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import logo from '../imports/photo_5778249941649133394_x.png'
import { qr } from './qr'
import './TeamShare.css'

/* =================================================================
   "شارك شراكتك مع مسار" — the image a partner or a sponsor shares on
   its own accounts: its logo beside Masar's, what it is to Masar
   (شريك مساحة، راعي…), and a QR code to the partners page.
   ================================================================= */

export type ShareFormat = 'story' | 'post'
export type PartnerLike = { name: string; logo: string; role: string; kind: 'partner' | 'sponsor' }

const SIZE: Record<ShareFormat, [number, number]> = { story: [1080, 1920], post: [1080, 1350] }

const C = {
  navy: '#07111b',
  ink: '#132436',
  sky: '#9fd8f5',
  muted: '#8d9aa6',
  slate: '#3d5468',
  cream: '#ece6da',
  paper: '#f3efe6',
}
const F = {
  head: (w: number, s: number) => `${w} ${s}px "IBM Plex Sans Arabic", sans-serif`,
  body: (w: number, s: number) => `${w} ${s}px "Cairo", sans-serif`,
  latin: (s: number) => `italic 500 ${s}px "Cormorant Garamond", serif`,
}

const images = new Map<string, Promise<HTMLImageElement>>()
const load = (src: string) => {
  if (!images.has(src))
    images.set(
      src,
      new Promise((ok, fail) => {
        const i = new Image()
        i.onload = () => ok(i)
        i.onerror = fail
        i.src = src
      }),
    )
  return images.get(src)!
}

const SCALE = 2
function layer(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = Math.ceil(w * SCALE)
  c.height = Math.ceil(h * SCALE)
  const x = c.getContext('2d')!
  x.scale(SCALE, SCALE)
  x.direction = 'rtl'
  return { c, x }
}

function fit(x: CanvasRenderingContext2D, t: string, font: (s: number) => string, size: number, max: number) {
  let s = size
  x.font = font(s)
  while (x.measureText(t).width > max && s > size * 0.55) {
    s -= 2
    x.font = font(s)
  }
  return s
}

function text(x: CanvasRenderingContext2D, t: string, cx: number, y: number, font: string, color: string, align: CanvasTextAlign = 'center') {
  x.font = font
  x.fillStyle = color
  x.textAlign = align
  x.fillText(t, cx, y)
}

function background(x: CanvasRenderingContext2D, W: number, H: number) {
  x.fillStyle = C.navy
  x.fillRect(0, 0, W, H)
  const g1 = x.createRadialGradient(W * 0.85, 0, 0, W * 0.85, 0, W * 1.05)
  g1.addColorStop(0, 'rgba(40,80,120,0.45)')
  g1.addColorStop(1, 'rgba(40,80,120,0)')
  x.fillStyle = g1
  x.fillRect(0, 0, W, H)
  const g2 = x.createRadialGradient(W * 0.12, H, 0, W * 0.12, H, W * 0.85)
  g2.addColorStop(0, 'rgba(159,216,245,0.09)')
  g2.addColorStop(1, 'rgba(159,216,245,0)')
  x.fillStyle = g2
  x.fillRect(0, 0, W, H)
}

/* what each kind is called, in Arabic (big) and in English (small, spaced) */
const TITLES: Record<string, [string, string]> = {
  'شريك مساحة': ['شريك المساحة', 'OFFICIAL VENUE PARTNER'],
  'شريك استراتيجي': ['الشريك الاستراتيجي', 'STRATEGIC PARTNER'],
  'شريك إعلامي': ['الشريك الإعلامي', 'OFFICIAL MEDIA PARTNER'],
  'شريك ضيافة': ['شريك الضيافة', 'OFFICIAL HOSPITALITY PARTNER'],
  راعي: ['الراعي الرسمي', 'OFFICIAL SPONSOR'],
}

/* spaced capitals, drawn letter by letter (canvas letterSpacing is not everywhere) */
function spaced(x: CanvasRenderingContext2D, t: string, cx: number, y: number, font: string, color: string, gap: number) {
  x.save()
  x.direction = 'ltr'
  x.font = font
  x.fillStyle = color
  x.textAlign = 'left'
  const widths = [...t].map((ch) => x.measureText(ch).width)
  const total = widths.reduce((a, b) => a + b, 0) + gap * (t.length - 1)
  let px = cx - total / 2
  ;[...t].forEach((ch, i) => {
    x.fillText(ch, px, y)
    px += widths[i] + gap
  })
  x.restore()
  return total
}

/* a short hairline with a small diamond in the middle */
function rule(x: CanvasRenderingContext2D, cx: number, y: number, w: number, k: number, color: string) {
  x.fillStyle = color
  x.fillRect(cx - w / 2, y, w / 2 - 14 * k, 1.5)
  x.fillRect(cx + 14 * k, y, w / 2 - 14 * k, 1.5)
  x.save()
  x.translate(cx, y + 0.75)
  x.rotate(Math.PI / 4)
  x.fillRect(-5 * k, -5 * k, 10 * k, 10 * k)
  x.restore()
}

/* the double hairline frame with its corner marks — like a certificate */
function frame(x: CanvasRenderingContext2D, W: number, H: number, k: number) {
  const a = 46 * k
  const b = 60 * k
  x.strokeStyle = 'rgba(159,216,245,0.32)'
  x.lineWidth = 1.5
  x.strokeRect(a, a, W - a * 2, H - a * 2)
  x.strokeStyle = 'rgba(159,216,245,0.14)'
  x.strokeRect(b, b, W - b * 2, H - b * 2)
  /* corner marks */
  x.strokeStyle = 'rgba(159,216,245,0.75)'
  x.lineWidth = 2.5
  const L = 38 * k
  for (const [cx, cy, dx, dy] of [
    [a, a, 1, 1],
    [W - a, a, -1, 1],
    [a, H - a, 1, -1],
    [W - a, H - a, -1, -1],
  ]) {
    x.beginPath()
    x.moveTo(cx, cy + dy * L)
    x.lineTo(cx, cy)
    x.lineTo(cx + dx * L, cy)
    x.stroke()
  }
}

/* one logo on a clean white plate */
function plate(x: CanvasRenderingContext2D, img: HTMLImageElement | null, cx: number, cy: number, s: number, k: number, inset = 0) {
  x.save()
  x.shadowColor = 'rgba(0,0,0,0.45)'
  x.shadowBlur = 50 * k
  x.shadowOffsetY = 22 * k
  x.beginPath()
  x.roundRect(cx - s / 2, cy - s / 2, s, s, 18 * k)
  x.fillStyle = '#ffffff'
  x.fill()
  x.restore()
  if (!img) return
  x.save()
  x.beginPath()
  x.roundRect(cx - s / 2, cy - s / 2, s, s, 18 * k)
  x.clip()
  const room = s - inset * 2
  const r = inset ? Math.min(room / img.width, room / img.height) : Math.max(s / img.width, s / img.height)
  x.drawImage(img, cx - (img.width * r) / 2, cy - (img.height * r) / 2, img.width * r, img.height * r)
  x.restore()
}

function design(x: CanvasRenderingContext2D, W: number, H: number, story: boolean, p: PartnerLike, logos: { partner: HTMLImageElement | null; masar: HTMLImageElement | null }, url: string) {
  const k = story ? 1 : 0.82
  const cx = W / 2
  /* the vertical rhythm, for each size */
  const Y = story
    ? { latin: 250, intro: 330, logos: 640, name: 980, rule: 1050, title: 1165, of: 1255, line: 1360, foot: 1560 }
    : { latin: 170, intro: 230, logos: 440, name: 680, rule: 732, title: 812, of: 888, line: 960, foot: 1080 }
  const [ar, en] = TITLES[p.role] || [p.role, p.kind === 'sponsor' ? 'OFFICIAL SPONSOR' : 'OFFICIAL PARTNER']

  frame(x, W, H, k)

  /* one long, quiet path of light across the page — Masar's line */
  x.save()
  const g = x.createLinearGradient(0, 0, W, 0)
  g.addColorStop(0, 'rgba(159,216,245,0)')
  g.addColorStop(0.5, 'rgba(159,216,245,0.22)')
  g.addColorStop(1, 'rgba(159,216,245,0)')
  x.strokeStyle = g
  x.lineWidth = 1.5
  x.beginPath()
  x.moveTo(-20, Y.logos + 260 * k)
  x.bezierCurveTo(W * 0.3, Y.logos + 120 * k, W * 0.62, Y.logos + 300 * k, W + 20, Y.logos + 60 * k)
  x.stroke()
  x.restore()

  /* the English line, then the Arabic opening */
  spaced(x, en, cx, Y.latin, `500 ${22 * k}px "Cormorant Garamond", serif`, 'rgba(159,216,245,0.85)', 7 * k)
  text(x, 'بكل فخرٍ واعتزاز', cx, Y.intro, F.body(500, 30 * k), 'rgba(255,255,255,0.72)')

  /* the two logos, side by side, a hairline between them */
  const ps = (story ? 300 : 260) * k
  const gap = (story ? 210 : 190) * k
  plate(x, logos.partner, cx + gap, Y.logos, ps, k)
  plate(x, logos.masar, cx - gap, Y.logos, ps, k, ps * 0.14)
  x.fillStyle = 'rgba(159,216,245,0.45)'
  x.fillRect(cx - 0.75, Y.logos - ps * 0.42, 1.5, ps * 0.84)

  /* who, and what they are to Masar */
  const ns = fit(x, p.name, (s) => F.head(600, s), 60 * k, W - 260 * k)
  text(x, p.name, cx, Y.name, F.head(600, ns), '#ffffff')
  rule(x, cx, Y.rule, 300 * k, k, 'rgba(159,216,245,0.6)')
  text(x, ar, cx, Y.title, F.head(700, fit(x, ar, (s) => F.head(700, s), 84 * k, W - 240 * k)), C.sky)
  text(x, 'لمبادرة مسار', cx, Y.of, F.head(500, 40 * k), '#ffffff')
  const line = p.kind === 'sponsor' ? 'إيمانًا بأن دعم الطلاب اليوم يصنع قادة الغد' : 'شراكةٌ تفتح للطلاب طريقًا نحو مستقبلٍ مهنيٍّ أوضح'
  text(x, line, cx, Y.line, F.body(400, fit(x, line, (s) => F.body(400, s), 30 * k, W - 260 * k)), 'rgba(255,255,255,0.6)')

  /* the foot: a discreet code, the initiative and the address */
  const fy = Y.foot
  x.fillStyle = 'rgba(159,216,245,0.18)'
  x.fillRect(120 * k, fy, W - 240 * k, 1.5)
  const qs = (story ? 150 : 128) * k
  const ql = 120 * k
  const qt = fy + 50 * k
  x.beginPath()
  x.roundRect(ql, qt, qs, qs, 10 * k)
  x.fillStyle = '#eef3f6'
  x.fill()
  const q = qr(url)
  const pad = 9 * k
  const cell = (qs - pad * 2) / q.length
  x.fillStyle = C.ink
  q.forEach((row, ry) =>
    row.forEach((on, rx) => {
      if (on) x.fillRect(ql + pad + rx * cell, qt + pad + ry * cell, cell + 0.4, cell + 0.4)
    }),
  )
  const right = W - 120 * k
  text(x, 'مبادرة مسار', right, qt + 48 * k, F.head(600, 36 * k), '#ffffff', 'right')
  text(x, p.kind === 'sponsor' ? 'شكرًا لرعايتكم' : 'شكرًا لشراكتكم', right, qt + 96 * k, F.body(500, 26 * k), 'rgba(159,216,245,0.85)', 'right')
  x.direction = 'ltr'
  const host = typeof window !== 'undefined' ? `${window.location.host}/partners` : ''
  text(x, host, right, qt + 138 * k, F.body(400, 22 * k), C.muted, 'right')
  x.direction = 'rtl'
}

export async function drawPartner(p: PartnerLike, format: ShareFormat, url: string) {
  const [W, H] = SIZE[format]
  const story = format === 'story'
  await Promise.all(
    [F.head(700, 84), F.head(600, 60), F.head(500, 40), F.body(500, 30), F.body(400, 30), `500 22px "Cormorant Garamond", serif`].map((f) =>
      document.fonts.load(f).catch(() => undefined),
    ),
  )
  const [partnerImg, masarImg] = await Promise.all([p.logo, logo].map((s) => load(s).catch(() => null)))
  const { c, x } = layer(W, H)
  background(x, W, H)
  design(x, W, H, story, p, { partner: partnerImg, masar: masarImg }, url)
  return c.toDataURL('image/jpeg', 0.94)
}

/* ---------- the link that opens the partners page on this logo ---------- */

/* a short, steady key from the name, so the link stays short */
export const partnerKey = (name: string) => {
  let h = 0x811c9dc5
  for (const ch of name.trim()) {
    h ^= ch.codePointAt(0)!
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(36)
}
export const partnerLink = (p: PartnerLike) =>
  `${typeof window !== 'undefined' ? window.location.origin : ''}/partners?${p.kind === 'sponsor' ? 'tab=sponsors&' : ''}p=${partnerKey(p.name)}`

/* ---------- the sheet ---------- */

const svg = (d: ReactNode, fill = false) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
)
const I = {
  close: svg(<path d="M6 6l12 12M18 6L6 18" />),
  down: svg(<path d="M12 4v11M7 10l5 5 5-5M5 20h14" />),
  share: svg(
    <>
      <path d="M12 3v12M7.5 7.5L12 3l4.5 4.5" />
      <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
    </>,
  ),
  link: svg(
    <>
      <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.1 1.1" />
      <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.1-1.1" />
    </>,
  ),
  check: svg(<path d="M5 12.5l4.5 4.5L19 7.5" />),
  copy: svg(
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
    </>,
  ),
  in: svg(
    <path d="M6.9 8.6H3.6V20h3.3V8.6ZM5.3 3.4a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8ZM20.4 13.3c0-3.1-1.7-4.9-4.3-4.9-1.6 0-2.6.9-3.1 1.6V8.6H9.8V20h3.3v-5.9c0-1.5.6-2.6 2-2.6s1.9 1 1.9 2.6V20h3.4v-6.7Z" />,
    true,
  ),
  x: svg(<path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.9 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />, true),
  wa: svg(
    <path d="M12 2.2a9.7 9.7 0 0 0-8.3 14.8L2.4 21.6l4.7-1.2A9.7 9.7 0 1 0 12 2.2Zm0 17.7c-1.5 0-2.9-.4-4.1-1.1l-.3-.2-2.8.7.8-2.7-.2-.3A8 8 0 1 1 12 19.9Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.6.3 2.7 2.7 0 0 0-.8 2c0 1.2.9 2.3 1 2.5.1.2 1.7 2.6 4.1 3.6 1.5.7 2.1.7 2.9.6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.4-.3Z" />,
    true,
  ),
}

export function PartnerShareSheet({ partner, onClose }: { partner: PartnerLike; onClose: () => void }) {
  const [format, setFormat] = useState<ShareFormat>('story')
  const [src, setSrc] = useState('')
  const [done, setDone] = useState<'link' | 'text' | null>(null)
  const [hint, setHint] = useState(false)
  const [li, setLi] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  const sponsor = partner.kind === 'sponsor'
  const link = partnerLink(partner)
  const [title] = TITLES[partner.role] || [partner.role]
  const caption = [
    sponsor
      ? `بكل فخرٍ واعتزاز، نعلن رعايتنا لمبادرة مسار؛ إيمانًا بأن دعم الطلاب اليوم يصنع قادة الغد.`
      : `بكل فخرٍ واعتزاز، نعلن شراكتنا مع مبادرة مسار بصفتنا ${title}؛ لنفتح للطلاب طريقًا نحو مستقبلٍ مهنيٍّ أوضح.`,
    'معًا، نصنع أثرًا يبقى.',
    '',
    `${sponsor ? 'رعاة' : 'شركاء'} مبادرة مسار: ${link}`,
  ].join('\n')

  useEffect(() => {
    let alive = true
    setSrc('')
    drawPartner(partner, format, link).then((u) => alive && setSrc(u))
    return () => {
      alive = false
    }
  }, [partner, format, link])

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', key, true)
    return () => window.removeEventListener('keydown', key, true)
  }, [onClose])

  const copy = async (what: 'link' | 'text') => {
    try {
      await navigator.clipboard.writeText(what === 'link' ? link : caption)
      setDone(what)
      window.setTimeout(() => setDone(null), 1800)
    } catch {
      /* the browser refused */
    }
  }

  const fileName = `masar-${sponsor ? 'sponsor' : 'partner'}-${format}.jpg`
  /* the image as a file, ready before any tap (iOS only opens the share sheet straight from a tap) */
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState('')
  useEffect(() => {
    if (!file) {
      setFileUrl('')
      return
    }
    const u = URL.createObjectURL(file)
    setFileUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [file])
  useEffect(() => {
    let alive = true
    setFile(null)
    if (src)
      fetch(src)
        .then((r) => r.blob())
        .then((bl) => alive && setFile(new File([bl], fileName, { type: 'image/jpeg' })))
        .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [src, fileName])

  const canShareFile = typeof navigator !== 'undefined' && 'canShare' in navigator
  const shareImage = async () => {
    try {
      if (file && navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text: caption })
      else window.open(src, '_blank')
    } catch {
      /* closed the share sheet */
    }
  }
  const download = () => {
    if (!src) return
    const a = document.createElement('a')
    a.href = fileUrl || src
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
  }
  const saveImage = () => {
    if (!src) return
    if (file && navigator.canShare?.({ files: [file] })) {
      navigator.share({ files: [file] }).catch(() => undefined)
      return
    }
    download()
  }
  const openLinkedIn = () => {
    navigator.clipboard?.writeText(caption).catch(() => undefined)
    setHint(true)
    window.setTimeout(() => setHint(false), 8000)
    const web = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(caption)}`
    const t = window.setTimeout(() => {
      if (document.visibilityState === 'visible') window.location.href = web
    }, 1600)
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.visibilityState === 'hidden') window.clearTimeout(t)
      },
      { once: true },
    )
    window.location.href = 'linkedin://'
  }
  /* X and WhatsApp: on phones the image and the words go through the phone's
     own share sheet; elsewhere the image is saved and the app opens with the words */
  const viaApp = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!src) return
    e.preventDefault()
    const href = e.currentTarget.href
    if (file && navigator.canShare?.({ files: [file] })) {
      navigator.share({ files: [file], text: caption }).catch(() => undefined)
      return
    }
    download()
    setHint(true)
    window.setTimeout(() => setHint(false), 8000)
    window.open(href, '_blank', 'noopener')
  }

  return createPortal(
    <div className="tsh-layer" role="dialog" aria-modal="true" aria-label={sponsor ? 'شارك رعايتك لمسار' : 'شارك شراكتك مع مسار'}>
      <div className="tsh-dim" onClick={onClose} />
      <div className="tsh">
        <button ref={closeRef} type="button" className="tsh-close" onClick={onClose} aria-label="إغلاق">
          {I.close}
        </button>
        <p className="tsh-label">{sponsor ? 'شارك رعايتك لمسار' : 'شارك شراكتك مع مسار'}</p>
        <p className="tsh-hint">صورة رسمية جاهزة باسم {partner.name}، حمّلها أو شاركها على حساباتكم</p>

        <div className="tsh-switch" role="tablist" aria-label="مقاس الصورة" data-i={format === 'story' ? 0 : 1}>
          <span className="tsh-pill" aria-hidden="true" />
          <button type="button" role="tab" aria-selected={format === 'story'} onClick={() => setFormat('story')}>
            ستوري
          </button>
          <button type="button" role="tab" aria-selected={format === 'post'} onClick={() => setFormat('post')}>
            بوست
          </button>
        </div>

        <div className="tsh-preview" data-format={format}>
          {src ? <img src={src} alt={`${partner.name} — ${title} لمبادرة مسار`} /> : <span className="tsh-wait" />}
        </div>

        <div className="tsh-main">
          <a className="tsh-btn" href={fileUrl || undefined} download={fileName} aria-disabled={!fileUrl}>
            {I.down}
            تحميل الصورة
          </a>
          {canShareFile && (
            <button type="button" className="tsh-btn tsh-btn--ghost" onClick={shareImage} disabled={!src}>
              {I.share}
              مشاركة
            </button>
          )}
        </div>

        <div className="tsh-row">
          <button type="button" aria-label="لينكدإن" aria-expanded={li} data-done={li ? '' : undefined} onClick={() => setLi((v) => !v)}>
            {I.in}
          </button>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`} target="_blank" rel="noopener noreferrer" aria-label="إكس" onClick={viaApp}>
            {I.x}
          </a>
          <a href={`https://wa.me/?text=${encodeURIComponent(caption)}`} target="_blank" rel="noopener noreferrer" aria-label="واتساب" onClick={viaApp}>
            {I.wa}
          </a>
          <button type="button" onClick={() => copy('link')} aria-label="نسخ الرابط" data-done={done === 'link' ? '' : undefined}>
            {done === 'link' ? I.check : I.link}
          </button>
        </div>

        {li && (
          <ol className="tsh-li">
            <li>
              <span>١</span>
              <p>
                احفظ الصورة في جهازك
                <small>من القائمة اختر «حفظ الصورة»</small>
              </p>
              <button type="button" onClick={saveImage} disabled={!src}>
                {I.down}
                حفظ
              </button>
            </li>
            <li>
              <span>٢</span>
              <p>
                افتح تطبيق لينكدإن، والنص منسوخ
                <small>اضغط «نشر»، الصق النص، وأرفق الصورة</small>
              </p>
              <button type="button" onClick={openLinkedIn}>
                {I.in}
                فتح
              </button>
            </li>
          </ol>
        )}

        <div className="tsh-caption">
          <p>
            {caption
              .split('\n')
              .slice(0, 2)
              .map((l) => (
                <span key={l}>{l}</span>
              ))}
          </p>
          <button type="button" onClick={() => copy('text')}>
            {done === 'text' ? I.check : I.copy}
            {done === 'text' ? 'تم النسخ' : 'نسخ النص'}
          </button>
        </div>
        <p className="tsh-note" aria-live="polite">
          {hint ? 'النص منسوخ — الصقه في المنشور' : done === 'link' ? 'تم نسخ الرابط' : 'الرابط يفتح صفحة الشركاء والرعاة على شعاركم مباشرة'}
        </p>
      </div>
    </div>,
    document.body,
  )
}