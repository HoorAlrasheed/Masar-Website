/* =================================================================
   خط ثمانية — تحميل مدمج
   الخط ما يُستضاف كملف مستقل: بياناته مشفّرة داخل ملفات الموقع،
   وتنفك هنا في الذاكرة وتنضاف للمتصفح مباشرة (حسب شرط ترخيص ثمانية).

   العناوين  ← Thmanyah Serif Display
   النصوص    ← Thmanyah Sans
   أسماء الخطوط القديمة بالموقع تشير الحين لثمانية، فما احتجنا
   نعدّل أي ملف تصميم ثاني.
   ================================================================= */

const KEY = [0x6d, 0x61, 0x73, 0x61, 0x72, 0x2d, 0x31, 0x34, 0x34, 0x37, 0x9f, 0xd8, 0xf5, 0x07, 0x11, 0x1b]

const SERIF = ['IBM Plex Sans Arabic', 'Amiri', 'Cormorant Garamond', 'Bodoni Moda']
const SANS = ['Cairo']

const FACES: [key: string, families: string[], weight: string][] = [
  ['d3', SERIF, '100 300'],
  ['d4', SERIF, '400'],
  ['d5', SERIF, '500'],
  ['d7', SERIF, '600 900'],
  ['s3', SANS, '100 300'],
  ['s4', SANS, '400'],
  ['s5', SANS, '500'],
  ['s7', SANS, '600 900'],
]

function decode(b64: string): ArrayBuffer {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i) ^ KEY[i % KEY.length]
  return out.buffer
}

export default async function loadThmanyah(): Promise<void> {
  try {
    /* لو ملف الخط مو موجود (مثلًا نسخة GitHub العامة)، يكمل الموقع بالخط الاحتياطي بدون أخطاء */
    const found = import.meta.glob<{ default: Record<string, string> }>('./thmanyahData.ts')
    const loader = Object.values(found)[0]
    if (!loader) return
    const { default: D } = await loader()
    const loading: Promise<FontFace>[] = []
    for (const [key, families, weight] of FACES) {
      const data = decode(D[key])
      for (const family of families) {
        const face = new FontFace(family, data, { weight, display: 'swap' })
        document.fonts.add(face)
        loading.push(face.load())
      }
    }
    await Promise.all(loading)
  } catch {
    /* لو صار أي خطأ، يكمل الموقع بالخط الاحتياطي بدل ما يتعطل */
  }
}
