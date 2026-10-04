import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { ADVISORS, DEPARTMENTS, DIRECT_COMMITTEES, LEADERSHIP, type Committee, type Person } from '../data/team'
import logo from '../imports/photo_5778249941649133394_x.png'
import paper from '../imports/resources-paper.png'
import seal from '../imports/resources-seal.png'
import toile from '../imports/resources-toile.jpg'

import { qr } from './qr'
import './TeamShare.css'

/* =================================================================
   "شارك وجودك في فريق مسار" — from a person's card on /team:
   - a ready image with their name and place in the team, in one of
     three designs (the team badge, the sealed letter, the team ticket),
     as a story or a post — they pick, then share
   - a direct link that opens the team page on their card (/team?m=…)
   - quick share to LinkedIn, X, WhatsApp, and a ready caption
   ================================================================= */

export type Member = { person: Person; title: string; department?: string; committee?: string }

/* everyone in the team, with the same titles the chart shows */
export function roster(): Member[] {
  const out: Member[] = []
  const L = LEADERSHIP
  const top = 'الإدارة العليا'
  out.push({ person: L.president, title: L.president.role || 'رئيس المبادرة', department: top })
  out.push({ person: L.deputy, title: L.deputy.role || 'نائب رئيس المبادرة', department: top })
  ADVISORS.forEach((a) => out.push({ person: a, title: a.role || 'مستشار المبادرة', department: top }))
  const committee = (c: Committee, department: string) => {
    if (c.lead) out.push({ person: c.lead, title: c.lead.role || 'قائد اللجنة', department, committee: c.name })
    if (c.deputy) out.push({ person: c.deputy, title: c.deputy.role || 'نائب اللجنة', department, committee: c.name })
    c.members.forEach((m) => out.push({ person: m, title: m.role || 'عضو', department, committee: c.name }))
  }
  DEPARTMENTS.forEach((d) => {
    out.push({ person: d.lead, title: d.lead.role || 'قائد الإدارة', department: d.name })
    out.push({ person: d.deputy, title: d.deputy.role || 'نائب الإدارة', department: d.name })
    d.committees.forEach((c) => committee(c, d.name))
  })
  DIRECT_COMMITTEES.forEach((c) => committee(c, top))
  return out
}

/* a short, steady key for a person (from their name), so their link
   stays short instead of a long run of encoded Arabic letters */
export const memberKey = (name: string) => {
  let h = 0x811c9dc5
  for (const ch of name.trim()) {
    h ^= ch.codePointAt(0)!
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(36)
}

/* the link that opens the team page on this person's card */
export const memberLink = (m: Member) =>
  `${typeof window !== 'undefined' ? window.location.origin : ''}/team?m=${memberKey(m.person.name)}`

/* ---------- the image, drawn on a canvas ---------- */

export type Format = 'story' | 'post'
export type Design = 'badge' | 'letter' | 'ticket'
export const DESIGNS: { id: Design; label: string }[] = [
  { id: 'badge', label: 'بطاقة العضوية' },
  { id: 'letter', label: 'الخطاب المختوم' },
  { id: 'ticket', label: 'تذكرة الفريق' },
]
const SIZE: Record<Format, [number, number]> = { story: [1080, 1920], post: [1080, 1350] }

/* the site's colours */
const C = {
  navy: '#07111b',
  ink: '#132436',
  sky: '#9fd8f5',
  muted: '#8d9aa6',
  mist: '#b7c5d1',
  dusty: '#8ea3b7',
  slate: '#3d5468',
  slate2: '#62798f',
  soft: '#45596b',
  cream: '#ece6da',
}
const F = {
  plex: (w: number, s: number) => `${w} ${s}px "IBM Plex Sans Arabic", sans-serif`,
  cairo: (w: number, s: number) => `${w} ${s}px "Cairo", sans-serif`,
  amiri: (w: number, s: number, italic = false) => `${italic ? 'italic ' : ''}${w} ${s}px "Amiri", serif`,
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

/* every layer is drawn at twice its size, so the saved image stays sharp
   on phones and after the apps compress it; drawing code still works in
   the normal sizes */
const SCALE = 2
type Layer = HTMLCanvasElement & { lw: number; lh: number }
function layer(w: number, h: number) {
  const c = document.createElement('canvas') as Layer
  c.width = Math.ceil(w * SCALE)
  c.height = Math.ceil(h * SCALE)
  c.lw = w
  c.lh = h
  const x = c.getContext('2d')!
  x.scale(SCALE, SCALE)
  x.direction = 'rtl'
  x.textBaseline = 'alphabetic'
  return { c, x }
}

/* the navy logo, recoloured */
function tinted(img: HTMLImageElement, w: number, color: string) {
  const h = (img.height / img.width) * w
  const { c, x } = layer(w, h)
  x.drawImage(img, 0, 0, w, h)
  x.globalCompositeOperation = 'source-in'
  x.fillStyle = color
  x.fillRect(0, 0, w, h)
  return c
}

/* shrink the font until the text fits the width */
function fit(x: CanvasRenderingContext2D, text: string, font: (s: number) => string, size: number, max: number) {
  let s = size
  x.font = font(s)
  while (x.measureText(text).width > max && s > size * 0.6) {
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

function barcode(x: CanvasRenderingContext2D, seed: number, left: number, top: number, w: number, h: number, color: string) {
  let s = seed * 9301 + 49297
  let p = 0
  x.fillStyle = color
  while (p < w) {
    s = (s * 9301 + 49297) % 233280
    const bw = (1 + (s % 3)) * (w / 120)
    x.fillRect(left + p, top, bw, h)
    s = (s * 9301 + 49297) % 233280
    p += bw + (1 + (s % 3)) * (w / 120)
  }
}

/* the two flowing lines used on the cards across the site */
function waves(x: CanvasRenderingContext2D, l: number, t: number, w: number, h: number, color: string, lw: number) {
  x.strokeStyle = color
  x.lineWidth = lw
  for (const d of [0, 0.11]) {
    x.beginPath()
    x.moveTo(l - 10, t + h * (0.86 + d))
    x.bezierCurveTo(l + w * 0.22, t + h * (0.86 + d), l + w * 0.36, t + h * (0.46 + d), l + w * 0.58, t + h * (0.5 + d))
    x.bezierCurveTo(l + w * 0.8, t + h * (0.54 + d), l + w * 0.9, t + h * (0.24 + d), l + w + 10, t + h * (0.14 + d))
    x.stroke()
  }
}

/* "فريق مسار" with a short line on each side */
function label(x: CanvasRenderingContext2D, t: string, cx: number, y: number, s: number) {
  text(x, t, cx, y, F.cairo(600, s), C.sky)
  const w = x.measureText(t).width
  x.fillStyle = 'rgba(159,216,245,0.5)'
  x.fillRect(cx + w / 2 + s * 0.6, y - s * 0.34, s * 1.6, Math.max(2, s / 16))
  x.fillRect(cx - w / 2 - s * 2.2, y - s * 0.34, s * 1.6, Math.max(2, s / 16))
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

type Ctx = { m: Member; no: string; logo: HTMLImageElement | null; paper: HTMLImageElement | null; seal: HTMLImageElement | null; toile: HTMLImageElement | null }

/* the lines under the name: the department and the committee */
const placeOf = (m: Member) => [m.department && m.department !== 'الإدارة العليا' ? m.department : 'الإدارة العليا', m.committee].filter(Boolean) as string[]

/* ---------- 1. the team badge on its lanyard ---------- */
function badge(x: CanvasRenderingContext2D, W: number, H: number, story: boolean, d: Ctx) {
  const k = story ? 1 : 0.8
  const cw = 700 * k
  const ch = 980 * k
  const cx = W / 2
  const top = story ? 560 : 300

  /* the lanyard and its clip */
  const sg = x.createLinearGradient(cx - 55 * k, 0, cx + 55 * k, 0)
  sg.addColorStop(0, '#2c445b')
  sg.addColorStop(0.5, '#4d6c88')
  sg.addColorStop(1, '#2c445b')
  x.fillStyle = sg
  x.fillRect(cx - 55 * k, -10, 110 * k, top - 70 * k)
  x.save()
  x.translate(cx, (top - 70 * k) / 2)
  x.rotate(Math.PI / 2)
  x.direction = 'ltr'
  text(x, 'MASAR  ·  مسار  ·  MASAR  ·  مسار  ·  MASAR  ·  مسار', 0, 9 * k, F.cairo(600, 26 * k), 'rgba(223,232,238,0.42)')
  x.direction = 'rtl'
  x.restore()
  const mg = x.createLinearGradient(0, top - 96 * k, 0, top - 20 * k)
  mg.addColorStop(0, '#dfe6eb')
  mg.addColorStop(1, '#8d9aa6')
  x.fillStyle = mg
  x.beginPath()
  x.roundRect(cx - 46 * k, top - 100 * k, 92 * k, 74 * k, 14 * k)
  x.fill()
  x.strokeStyle = '#9aa8b3'
  x.lineWidth = 8 * k
  x.beginPath()
  x.roundRect(cx - 16 * k, top - 40 * k, 32 * k, 66 * k, 16 * k)
  x.stroke()

  /* the card, drawn flat then laid down tilted */
  const { c, x: y } = layer(cw, ch)
  y.beginPath()
  y.roundRect(0, 0, cw, ch, 34 * k)
  y.fillStyle = C.mist
  y.fill()
  y.save()
  y.clip()
  const bh = 300 * k
  const bg = y.createLinearGradient(0, 0, cw, bh)
  bg.addColorStop(0, C.slate)
  bg.addColorStop(1, C.slate2)
  y.fillStyle = bg
  y.fillRect(0, 0, cw, bh)
  waves(y, 0, 0, cw, bh, 'rgba(236,230,218,0.16)', 3 * k)
  y.restore()
  /* the slot for the clip */
  y.globalCompositeOperation = 'destination-out'
  y.beginPath()
  y.roundRect(cw / 2 - 70 * k, 30 * k, 140 * k, 24 * k, 12 * k)
  y.fill()
  y.globalCompositeOperation = 'source-over'
  if (d.logo) {
    const l = tinted(d.logo, 230 * k, '#eef3f6')
    y.drawImage(l, cw / 2 - l.lw / 2, 92 * k, l.lw, l.lh)
  }
  text(y, 'فريق مسار', cw / 2, 92 * k + 128 * k + 34 * k, F.cairo(600, 24 * k), 'rgba(236,230,218,0.72)')
  /* the initial */
  y.beginPath()
  y.arc(cw / 2, bh, 80 * k, 0, Math.PI * 2)
  y.fillStyle = C.ink
  y.fill()
  y.lineWidth = 9 * k
  y.strokeStyle = C.mist
  y.stroke()
  text(y, d.m.person.name.trim().charAt(0), cw / 2, bh + 26 * k, F.plex(600, 70 * k), C.sky)
  /* who */
  let py = bh + 150 * k
  text(y, 'من صُنّاع الأثر في مسار', cw / 2, py, F.cairo(600, 24 * k), C.soft)
  py += 82 * k
  const ns = fit(y, d.m.person.name, (s) => F.plex(600, s), 60 * k, cw - 90 * k)
  text(y, d.m.person.name, cw / 2, py, F.plex(600, ns), C.ink)
  py += 56 * k
  y.font = F.cairo(600, 28 * k)
  const rw = y.measureText(d.m.title).width + 56 * k
  y.beginPath()
  y.roundRect(cw / 2 - rw / 2, py, rw, 52 * k, 26 * k)
  y.fillStyle = C.ink
  y.fill()
  text(y, d.m.title, cw / 2, py + 36 * k, F.cairo(600, 28 * k), C.sky)
  /* the rows */
  py += 104 * k
  const rows: [string, string][] = [['الإدارة', placeOf(d.m)[0]]]
  if (d.m.committee) rows.push(['اللجنة', d.m.committee])
  y.setLineDash([8 * k, 7 * k])
  y.strokeStyle = 'rgba(19,36,54,0.28)'
  y.lineWidth = 2
  const line = (yy: number) => {
    y.beginPath()
    y.moveTo(50 * k, yy)
    y.lineTo(cw - 50 * k, yy)
    y.stroke()
  }
  line(py)
  rows.forEach(([a, b]) => {
    text(y, a, cw - 54 * k, py + 48 * k, F.cairo(400, 24 * k), C.soft, 'right')
    const vs = fit(y, b, (s) => F.plex(600, s), 27 * k, cw * 0.6)
    text(y, b, 54 * k, py + 48 * k, F.plex(600, vs), C.ink, 'left')
    py += 74 * k
    line(py)
  })
  y.setLineDash([])
  /* barcode and number */
  barcode(y, Number(d.no), 52 * k, ch - 92 * k, 270 * k, 50 * k, C.ink)
  y.direction = 'ltr'
  text(y, `No. ${d.no}`, cw - 52 * k, ch - 50 * k, F.latin(26 * k), C.soft, 'right')

  x.save()
  x.translate(cx, top + ch / 2)
  x.rotate(-0.03)
  x.shadowColor = 'rgba(0,0,0,0.6)'
  x.shadowBlur = 70 * k
  x.shadowOffsetY = 34 * k
  x.drawImage(c, -cw / 2, -ch / 2, cw, ch)
  x.restore()
}

/* ---------- 2. the sealed letter over its envelope ---------- */
function letter(x: CanvasRenderingContext2D, W: number, H: number, story: boolean, d: Ctx) {
  const k = story ? 1 : 0.74
  const cx = W / 2
  label(x, 'فريق مسار', cx, (story ? 150 : 110) * k + (story ? 0 : 0), 34 * k)

  /* the envelope */
  const ew = 900 * k
  const eh = (story ? 540 : 600) * k
  const ey = story ? 1130 : 760
  x.save()
  x.shadowColor = 'rgba(0,0,0,0.7)'
  x.shadowBlur = 70 * k
  x.shadowOffsetY = 36 * k
  x.beginPath()
  x.roundRect(cx - ew / 2, ey, ew, eh, 10 * k)
  x.fillStyle = '#e9ebec'
  x.fill()
  x.restore()
  x.save()
  x.beginPath()
  x.roundRect(cx - ew / 2, ey, ew, eh, 10 * k)
  x.clip()
  if (d.toile) {
    const r = Math.max(ew / d.toile.width, eh / d.toile.height)
    x.drawImage(d.toile, cx - (d.toile.width * r) / 2, ey + eh / 2 - (d.toile.height * r) / 2, d.toile.width * r, d.toile.height * r)
  }
  x.strokeStyle = 'rgba(255,255,255,0.5)'
  x.lineWidth = 2
  x.beginPath()
  x.moveTo(cx - ew / 2, ey + eh)
  x.lineTo(cx, ey + eh * 0.42)
  x.lineTo(cx + ew / 2, ey + eh)
  x.stroke()
  x.restore()

  /* the sheet */
  const pw = 780 * k
  const ph = pw * (810 / 580)
  const { c, x: y } = layer(pw, ph)
  if (d.paper) y.drawImage(d.paper, 0, 0, pw, ph)
  else {
    y.fillStyle = '#eef0f1'
    y.fillRect(pw * 0.05, ph * 0.12, pw * 0.9, ph * 0.84)
  }
  const tx = pw / 2
  let ty = ph * 0.3
  text(y, 'من صُنّاع الأثر في مسار', tx, ty, F.cairo(600, 26 * k), '#5a6b7b')
  ty += 96 * k
  const ns = fit(y, d.m.person.name, (s) => F.amiri(700, s), 66 * k, pw * 0.74)
  text(y, d.m.person.name, tx, ty, F.amiri(700, ns), '#142231')
  ty += 66 * k
  text(y, d.m.title, tx, ty, F.amiri(400, 38 * k, true), C.slate)
  ty += 52 * k
  y.fillStyle = 'rgba(20,34,49,0.4)'
  y.fillRect(tx - 75 * k, ty, 150 * k, 2)
  ty += 70 * k
  text(y, 'حيث تتلاقى الطموحات، وتتحوّل الخطوات إلى أثر', tx, ty, F.plex(400, fit(y, 'حيث تتلاقى الطموحات، وتتحوّل الخطوات إلى أثر', (s) => F.plex(400, s), 30 * k, pw * 0.74)), '#2b3a48')
  for (const p of placeOf(d.m)) {
    ty += 54 * k
    const s = fit(y, p, (s) => F.plex(400, s), 28 * k, pw * 0.72)
    text(y, p, tx, ty, F.plex(400, s), '#45596b')
  }
  y.direction = 'ltr'
  text(y, 'MASAR', pw * 0.16, ph * 0.86, F.latin(26 * k), 'rgba(20,34,49,0.5)', 'left')
  text(y, `No. ${d.no}`, pw * 0.84, ph * 0.86, F.latin(26 * k), 'rgba(20,34,49,0.5)', 'right')
  y.direction = 'rtl'
  if (d.seal) {
    const sw = pw * 0.41
    const sh = sw * (d.seal.height / d.seal.width)
    y.save()
    y.translate(pw * 0.495, ph * 0.124)
    y.rotate(-0.1)
    y.shadowColor = 'rgba(0,0,0,0.35)'
    y.shadowBlur = 16 * k
    y.shadowOffsetY = 8 * k
    y.drawImage(d.seal, -sw / 2, -sh / 2, sw, sh)
    y.restore()
  }
  x.save()
  x.translate(cx, (story ? 250 : 175) + ph / 2)
  x.rotate(-0.026)
  x.shadowColor = 'rgba(0,0,0,0.55)'
  x.shadowBlur = 60 * k
  x.shadowOffsetY = 30 * k
  x.drawImage(c, -pw / 2, -ph / 2, pw, ph)
  x.restore()
}

/* ---------- 3. the team ticket ---------- */
function ticket(x: CanvasRenderingContext2D, W: number, H: number, story: boolean, d: Ctx) {
  const k = story ? 1 : 0.78
  const cx = W / 2
  const head = story ? 200 : 120
  label(x, 'فريق مسار', cx, head, 34 * k)
  text(x, 'تذكرتي إلى فريق مسار', cx, head + 86 * k, F.plex(500, 54 * k), '#ffffff')

  const tw = 840 * k
  const th = 1060 * k
  const { c, x: y } = layer(tw, th)
  y.beginPath()
  y.roundRect(0, 0, tw, th, 8 * k)
  y.fillStyle = C.dusty
  y.fill()
  const band = { l: 22 * k, t: 22 * k, w: tw - 44 * k, h: 420 * k }
  y.save()
  y.beginPath()
  y.roundRect(band.l, band.t, band.w, band.h, 12 * k)
  y.clip()
  const g = y.createLinearGradient(band.l, band.t, band.l + band.w, band.t + band.h)
  g.addColorStop(0, C.slate)
  g.addColorStop(1, C.ink)
  y.fillStyle = g
  y.fillRect(band.l, band.t, band.w, band.h)
  waves(y, band.l, band.t, band.w, band.h, 'rgba(236,230,218,0.15)', 3 * k)
  y.restore()
  if (d.logo) {
    const l = tinted(d.logo, 290 * k, '#eef3f6')
    y.drawImage(l, tw / 2 - l.lw / 2, band.t + 120 * k, l.lw, l.lh)
  }
  text(y, 'فريق مسار', tw / 2, band.t + band.h - 70 * k, F.cairo(600, 26 * k), 'rgba(236,230,218,0.62)')
  /* who */
  let py = band.t + band.h + 90 * k
  text(y, 'من صُنّاع الأثر في مسار', tw / 2, py, F.cairo(600, 26 * k), '#2f465b')
  py += 92 * k
  const ns = fit(y, d.m.person.name, (s) => F.plex(600, s), 66 * k, tw - 100 * k)
  text(y, d.m.person.name, tw / 2, py, F.plex(600, ns), C.ink)
  py += 66 * k
  text(y, d.m.title, tw / 2, py, F.cairo(600, 34 * k), '#2f465b')
  /* the perforation */
  const ry = th - 230 * k
  y.setLineDash([12 * k, 10 * k])
  y.strokeStyle = 'rgba(19,36,54,0.3)'
  y.lineWidth = 4 * k
  y.beginPath()
  y.moveTo(50 * k, ry)
  y.lineTo(tw - 50 * k, ry)
  y.stroke()
  y.setLineDash([])
  /* the stub: where, then the barcode */
  const place = placeOf(d.m)
  text(y, place.length > 1 ? 'الإدارة · اللجنة' : 'الإدارة', tw - 50 * k, ry + 80 * k, F.cairo(400, 24 * k), '#2f465b', 'right')
  place.forEach((p, i) => {
    const s = fit(y, p, (s) => F.plex(600, s), 30 * k, tw * 0.52)
    text(y, p, tw - 50 * k, ry + (126 + i * 46) * k, F.plex(600, s), C.ink, 'right')
  })
  barcode(y, Number(d.no), 50 * k, ry + 50 * k, 250 * k, 110 * k, C.ink)
  y.direction = 'ltr'
  text(y, `No. ${d.no}`, 50 * k, ry + 196 * k, F.latin(24 * k), '#2f465b', 'left')
  /* the bites: four corners and the two half-moons on the perforation */
  y.globalCompositeOperation = 'destination-out'
  for (const [bx, by] of [
    [0, 0],
    [tw, 0],
    [0, th],
    [tw, th],
    [0, ry],
    [tw, ry],
  ]) {
    y.beginPath()
    y.arc(bx, by, 34 * k, 0, Math.PI * 2)
    y.fill()
  }
  y.globalCompositeOperation = 'source-over'

  x.save()
  x.translate(cx, head + 190 * k + th / 2)
  x.rotate(-0.035)
  x.shadowColor = 'rgba(0,0,0,0.55)'
  x.shadowBlur = 70 * k
  x.shadowOffsetY = 36 * k
  x.drawImage(c, -tw / 2, -th / 2, tw, th)
  x.restore()
}

/* the invitation at the foot of every image: a QR code that opens the
   person's card in the team chart, and the words that say so */
function invite(x: CanvasRenderingContext2D, W: number, H: number, k: number, url: string) {
  const pw = 900 * k
  const ph = 236 * k
  const pl = (W - pw) / 2
  const pt = H - ph - 74 * k
  x.beginPath()
  x.roundRect(pl, pt, pw, ph, 28 * k)
  x.fillStyle = 'rgba(159,216,245,0.06)'
  x.fill()
  x.lineWidth = 2
  x.strokeStyle = 'rgba(159,216,245,0.24)'
  x.stroke()

  /* the code, dark on a light tile so every phone can read it */
  const q = qr(url)
  const qs = ph - 44 * k
  const ql = pl + 22 * k
  const qt = pt + 22 * k
  x.beginPath()
  x.roundRect(ql, qt, qs, qs, 16 * k)
  x.fillStyle = '#eef3f6'
  x.fill()
  const pad = 12 * k
  const cell = (qs - pad * 2) / q.length
  x.fillStyle = C.ink
  q.forEach((row, ry) =>
    row.forEach((on, rx) => {
      if (on) x.fillRect(ql + pad + rx * cell, qt + pad + ry * cell, cell + 0.4, cell + 0.4)
    }),
  )

  /* the words */
  const right = pl + pw - 40 * k
  const maxw = pw - qs - 100 * k
  let ty = pt + 70 * k
  x.direction = 'rtl'
  const a = 'اسمي ضمن هيكل فريق مسار'
  text(x, a, right, ty, F.cairo(600, fit(x, a, (s) => F.cairo(600, s), 30 * k, maxw)), C.sky, 'right')
  ty += 62 * k
  const b = 'امسح الرمز لتشاهده على الموقع'
  text(x, b, right, ty, F.plex(500, fit(x, b, (s) => F.plex(500, s), 38 * k, maxw)), '#ffffff', 'right')
  ty += 54 * k
  x.direction = 'ltr'
  const host = typeof window !== 'undefined' ? `${window.location.host}/team` : ''
  text(x, host, right, ty, F.cairo(400, fit(x, host, (s) => F.cairo(400, s), 26 * k, maxw)), C.muted, 'right')
  x.direction = 'rtl'
}

export async function draw(m: Member, design: Design, format: Format, no: number, url: string) {
  const [W, H] = SIZE[format]
  const story = format === 'story'
  await Promise.all(
    [
      F.plex(600, 60),
      F.plex(500, 50),
      F.plex(400, 30),
      F.cairo(600, 30),
      F.cairo(400, 26),
      F.amiri(700, 60),
      F.amiri(400, 38, true),
      F.latin(26),
    ].map((f) => document.fonts.load(f).catch(() => undefined)),
  )
  const [logoImg, paperImg, sealImg, toileImg] = await Promise.all([logo, paper, seal, toile].map((s) => load(s).catch(() => null)))

  const { c, x } = layer(W, H)
  background(x, W, H)
  const d: Ctx = { m, no: String(no).padStart(4, '0'), logo: logoImg, paper: paperImg, seal: sealImg, toile: toileImg }

  /* the design is drawn full size, then set in the room above the invitation */
  const art = layer(W, H)
  if (design === 'badge') badge(art.x, W, H, story, d)
  else if (design === 'letter') letter(art.x, W, H, story, d)
  else ticket(art.x, W, H, story, d)
  const k = story ? 1 : 0.86
  const room = H - (236 + 74 + (story ? 40 : 10)) * k
  const sc = room / H
  x.drawImage(art.c, (W - W * sc) / 2, 0, W * sc, H * sc)
  invite(x, W, H, k, url)
  return c.toDataURL('image/jpeg', 0.94)
}

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

export function ShareSheet({ member, onClose }: { member: Member; onClose: () => void }) {
  const [design, setDesign] = useState<Design>('badge')
  const [format, setFormat] = useState<Format>('story')
  const [src, setSrc] = useState('')
  const [done, setDone] = useState<'link' | 'text' | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const link = memberLink(member)
  /* the place: the committee if there is one, otherwise the department
     (the top leadership is shown by its title alone) */
  const place = member.committee || (member.department !== 'الإدارة العليا' ? member.department : '')
  /* "قائدة اللجنة" + "لجنة الشراكات" reads as "قائدة لجنة الشراكات" */
  const role =
    member.committee && /اللجنة$/.test(member.title)
      ? member.title.replace(/اللجنة$/, member.committee)
      : member.department && member.department !== 'الإدارة العليا' && /الإدارة$/.test(member.title)
        ? member.title.replace(/الإدارة$/, member.department)
        : `${member.title}${place ? ` في ${place}` : ''}`
  const caption = [
    'لكلِّ طريقٍ أثر، ولكلِّ أثرٍ من يصنعه.',
    `وأنا جزءٌ من مبادرة مسار — ${role}؛ حيث تتلاقى الطموحات، وتتحوّل الخطوات إلى أثر.`,
    '',
    `اسمي ضمن هيكل الفريق: ${link}`,
  ].join('\n')

  useEffect(() => {
    let alive = true
    setSrc('')
    const no = roster().findIndex((r) => r.person.name === member.person.name) + 1
    draw(member, design, format, no || 1, link).then((u) => alive && setSrc(u))
    return () => {
      alive = false
    }
  }, [member, design, format, link])

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

  const fileName = `masar-${design}-${format}.jpg`
  /* the phone's own share sheet with the image, when the browser allows it */
  const canShareFile = typeof navigator !== 'undefined' && 'canShare' in navigator
  const shareImage = async () => {
    try {
      const blob = await (await fetch(src)).blob()
      const file = new File([blob], fileName, { type: 'image/jpeg' })
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text: caption })
      else window.open(src, '_blank')
    } catch {
      /* closed the share sheet */
    }
  }

  /* LinkedIn, WhatsApp and X: a link can only carry text, so on phones the image goes
     through the phone's share sheet (pick WhatsApp or X there, and the image
     and the words go together); where that is not possible, the image is
     saved first so it can be attached, and the app opens with the words */
  const [hint, setHint] = useState(false)
  /* LinkedIn's share window drops the image, so LinkedIn has its own two
     steps: save the image to the phone, then open the LinkedIn app on a new
     post with the words written — and pick the image there */
  const [li, setLi] = useState(false)
  /* the LinkedIn app's own address opens the app itself, from any browser
     (LinkedIn does not let it carry words, so they are copied first, to
     paste in the new post); without the app, the website opens on a new
     post with the words written in it */
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
  /* the download: a real file link (not the image text itself), so phones
     show "عرض / تنزيل" and both work */
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
  /* the image as a file, ready before any tap (iOS only opens the share
     sheet straight from a tap, with nothing slow in between) */
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

  /* imageOnly (LinkedIn): LinkedIn's share window turns a link in the words
     into a link card and drops the image — so it gets the image with the
     words but without the link (the QR code on the image leads to the site);
     the full words are also copied, in case they are needed */
  const viaApp = (imageOnly: boolean) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!src) return
    e.preventDefault()
    const href = e.currentTarget.href
    if (imageOnly) navigator.clipboard?.writeText(caption).catch(() => undefined)
    if (file && navigator.canShare?.({ files: [file] })) {
      navigator.share({ files: [file], text: imageOnly ? caption.split('\n').slice(0, 2).join('\n') : caption }).catch(() => undefined)
      if (imageOnly) {
        setHint(true)
        window.setTimeout(() => setHint(false), 8000)
      }
      return
    }
    const a = document.createElement('a')
    a.href = src
    a.download = fileName
    a.click()
    setHint(true)
    window.setTimeout(() => setHint(false), 8000)
    window.open(href, '_blank', 'noopener')
  }

  return createPortal(
    <div className="tsh-layer" role="dialog" aria-modal="true" aria-label="شارك وجودك في فريق مسار">
      <div className="tsh-dim" onClick={onClose} />
      <div className="tsh">
        <button ref={closeRef} type="button" className="tsh-close" onClick={onClose} aria-label="إغلاق">
          {I.close}
        </button>
        <p className="tsh-label">شارك وجودك في فريق مسار</p>
        <p className="tsh-hint">اختر التصميم الذي يعجبك، ثم حمّله أو شاركه</p>

        <div className="tsh-designs" role="radiogroup" aria-label="التصميم">
          {DESIGNS.map((d) => (
            <button key={d.id} type="button" role="radio" aria-checked={design === d.id} className="tsh-design" onClick={() => setDesign(d.id)}>
              <span className={`tsh-glyph tsh-glyph--${d.id}`} aria-hidden="true">
                <i />
              </span>
              {d.label}
            </button>
          ))}
        </div>

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
          {src ? <img src={src} alt={`صورة ${member.person.name} في فريق مسار`} /> : <span className="tsh-wait" />}
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
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`} target="_blank" rel="noopener noreferrer" aria-label="إكس" onClick={viaApp(false)}>
            {I.x}
          </a>
          <a href={`https://wa.me/?text=${encodeURIComponent(caption)}`} target="_blank" rel="noopener noreferrer" aria-label="واتساب" onClick={viaApp(false)}>
            {I.wa}
          </a>
          <button type="button" onClick={() => copy('link')} aria-label="نسخ رابط بطاقتك" data-done={done === 'link' ? '' : undefined}>
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
          {hint ? 'النص منسوخ — الصقه في المنشور' : done === 'link' ? 'تم نسخ رابط بطاقتك' : 'الرابط يفتح صفحة الفريق على بطاقتك مباشرة'}
        </p>
      </div>
    </div>,
    document.body,
  )
}