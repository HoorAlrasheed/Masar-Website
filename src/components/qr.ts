/* =================================================================
   A small QR code maker (byte mode, error correction level M,
   versions 1–20), so the share images can carry a code that opens
   the person's card. Based on the standard QR algorithm.
   qr(text) → a square grid of booleans (true = dark).
   ================================================================= */

const ECC = [10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26]
const BLOCKS = [1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16]

const rawModules = (v: number) => {
  let r = (16 * v + 128) * v + 64
  if (v >= 2) {
    const n = Math.floor(v / 7) + 2
    r -= (25 * n - 10) * n - 55
    if (v >= 7) r -= 36
  }
  return r
}
const dataCodewords = (v: number) => Math.floor(rawModules(v) / 8) - ECC[v - 1] * BLOCKS[v - 1]

const mul = (x: number, y: number) => {
  let z = 0
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d)
    z ^= ((y >>> i) & 1) * x
  }
  return z & 0xff
}
function divisor(deg: number) {
  const r = new Array<number>(deg).fill(0)
  r[deg - 1] = 1
  let root = 1
  for (let i = 0; i < deg; i++) {
    for (let j = 0; j < deg; j++) {
      r[j] = mul(r[j], root)
      if (j + 1 < deg) r[j] ^= r[j + 1]
    }
    root = mul(root, 0x02)
  }
  return r
}
function remainder(data: number[], div: number[]) {
  const r = new Array<number>(div.length).fill(0)
  for (const b of data) {
    const f = b ^ (r.shift() as number)
    r.push(0)
    div.forEach((c, i) => (r[i] ^= mul(c, f)))
  }
  return r
}

const bit = (x: number, i: number) => ((x >>> i) & 1) !== 0

function alignment(v: number, size: number) {
  if (v === 1) return []
  const n = Math.floor(v / 7) + 2
  const step = v === 32 ? 26 : Math.ceil((v * 4 + 4) / (n * 2 - 2)) * 2
  const r = [6]
  for (let p = size - 7; r.length < n; p -= step) r.splice(1, 0, p)
  return r
}

export function qr(text: string): boolean[][] {
  const bytes = Array.from(new TextEncoder().encode(text))

  /* the smallest version that fits */
  let v = 1
  for (; v <= 20; v++) {
    const bits = 4 + (v < 10 ? 8 : 16) + bytes.length * 8
    if (bits <= dataCodewords(v) * 8) break
  }
  if (v > 20) v = 20
  const cap = dataCodewords(v) * 8

  /* the data bits */
  const bb: number[] = []
  const put = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bb.push((val >>> i) & 1)
  }
  put(4, 4)
  put(bytes.length, v < 10 ? 8 : 16)
  bytes.forEach((b) => put(b, 8))
  put(0, Math.min(4, cap - bb.length))
  put(0, (8 - (bb.length % 8)) % 8)
  for (let pad = 0xec; bb.length < cap; pad ^= 0xec ^ 0x11) put(pad, 8)
  const data: number[] = []
  for (let i = 0; i < bb.length; i += 8) data.push(parseInt(bb.slice(i, i + 8).join(''), 2))

  /* error correction, in blocks, interleaved */
  const nb = BLOCKS[v - 1]
  const ecl = ECC[v - 1]
  const raw = Math.floor(rawModules(v) / 8)
  const short = nb - (raw % nb)
  const shortLen = Math.floor(raw / nb)
  const div = divisor(ecl)
  const blocks: number[][] = []
  for (let i = 0, k = 0; i < nb; i++) {
    const dat = data.slice(k, k + shortLen - ecl + (i < short ? 0 : 1))
    k += dat.length
    const ec = remainder(dat, div)
    if (i < short) dat.push(0)
    blocks.push(dat.concat(ec))
  }
  const all: number[] = []
  for (let i = 0; i < blocks[0].length; i++)
    blocks.forEach((b, j) => {
      if (i !== shortLen - ecl || j >= short) all.push(b[i])
    })

  /* the grid */
  const size = v * 4 + 17
  const m: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
  const fn: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
  const set = (x: number, y: number, d: boolean) => {
    m[y][x] = d
    fn[y][x] = true
  }
  for (let i = 0; i < size; i++) {
    set(6, i, i % 2 === 0)
    set(i, 6, i % 2 === 0)
  }
  const finder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const d = Math.max(Math.abs(dx), Math.abs(dy))
        const x = cx + dx
        const y = cy + dy
        if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4)
      }
  }
  finder(3, 3)
  finder(size - 4, 3)
  finder(3, size - 4)
  const al = alignment(v, size)
  al.forEach((a, i) =>
    al.forEach((b, j) => {
      if ((i === 0 && j === 0) || (i === 0 && j === al.length - 1) || (i === al.length - 1 && j === 0)) return
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(a + dx, b + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
    }),
  )
  const format = (mask: number) => {
    const d = (0 << 3) | mask /* level M = 0 */
    let r = d
    for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537)
    const bits = ((d << 10) | r) ^ 0x5412
    for (let i = 0; i <= 5; i++) set(8, i, bit(bits, i))
    set(8, 7, bit(bits, 6))
    set(8, 8, bit(bits, 7))
    set(7, 8, bit(bits, 8))
    for (let i = 9; i < 15; i++) set(14 - i, 8, bit(bits, i))
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(bits, i))
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(bits, i))
    set(8, size - 8, true)
  }
  format(0)
  if (v >= 7) {
    let r = v
    for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25)
    const bits = (v << 12) | r
    for (let i = 0; i < 18; i++) {
      const a = size - 11 + (i % 3)
      const b = Math.floor(i / 3)
      set(a, b, bit(bits, i))
      set(b, a, bit(bits, i))
    }
  }

  /* the codewords, zigzag */
  let i = 0
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5
    for (let vert = 0; vert < size; vert++)
      for (let j = 0; j < 2; j++) {
        const x = right - j
        const up = ((right + 1) & 2) === 0
        const y = up ? size - 1 - vert : vert
        if (!fn[y][x] && i < all.length * 8) {
          m[y][x] = bit(all[i >>> 3], 7 - (i & 7))
          i++
        }
      }
  }

  /* pick the mask that reads best */
  const masked = (k: number) => {
    const g = m.map((r) => r.slice())
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        if (fn[y][x]) continue
        const inv = [
          (x + y) % 2 === 0,
          y % 2 === 0,
          x % 3 === 0,
          (x + y) % 3 === 0,
          (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
          ((x * y) % 2) + ((x * y) % 3) === 0,
          (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
          (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
        ][k]
        if (inv) g[y][x] = !g[y][x]
      }
    return g
  }
  const penalty = (g: boolean[][]) => {
    let p = 0
    let dark = 0
    for (let a = 0; a < size; a++) {
      let rr = 1
      let rc = 1
      for (let b = 0; b < size; b++) {
        if (g[a][b]) dark++
        if (b > 0) {
          if (g[a][b] === g[a][b - 1]) rr++
          else {
            if (rr >= 5) p += rr - 2
            rr = 1
          }
          if (g[b][a] === g[b - 1][a]) rc++
          else {
            if (rc >= 5) p += rc - 2
            rc = 1
          }
        }
        if (a > 0 && b > 0 && g[a][b] === g[a - 1][b] && g[a][b] === g[a][b - 1] && g[a][b] === g[a - 1][b - 1]) p += 3
      }
      if (rr >= 5) p += rr - 2
      if (rc >= 5) p += rc - 2
    }
    p += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10
    return p
  }
  let best = 0
  let bestP = Infinity
  for (let k = 0; k < 8; k++) {
    format(k)
    const p = penalty(masked(k))
    if (p < bestP) {
      bestP = p
      best = k
    }
  }
  format(best)
  return masked(best)
}
