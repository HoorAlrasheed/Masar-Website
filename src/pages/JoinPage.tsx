import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { gsap } from 'gsap'

import { SHEETS, sendToSheet } from '../data/sheet'
import { DEPARTMENTS, DIRECT_COMMITTEES } from '../data/team'

import PageHead from '../components/PageHead'

import '../components/RequestForm.css'
import './JoinPage.css'

/* =================================================================
   /join — انضم إلى مسار
   Two forms behind one switch: applying to join, and booking a
   guidance session. Same look as the partnership/sponsorship forms
   (components/RequestForm.css). Both send to the requests sheet.
   /join?tab=session opens straight on the session form.
   ================================================================= */

type Tab = 'apply' | 'session'

const SESSION_TYPES = ['توجيه مهني', 'توجيه أكاديمي', 'مراجعة السيرة الذاتية', 'تطوير المهارات']

const STATUSES = ['طالب', 'غير ذلك']

const Chevron = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
)

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const Icon = {
  send: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5L10 17.5L19 7.5" />
    </svg>
  ),
}

function Section({ num, title, children }: { num: string; title: string; children: ReactNode }) {
  return (
    <fieldset className="rqf-sec rqf-in">
      <legend className="rqf-sec-head">
        <span className="rqf-sec-num">{num}</span>
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="rqf-field">
      <span>
        {label} {required ? <b>*</b> : null}
      </span>
      {children}
    </label>
  )
}

/* ---------- checks for the ID, email and phone ---------- */

/* Arabic-Indic digits (٠١٢ / ۰۱۲) → 0-9, then keep digits only */
const onlyDigits = (s: string) =>
  s
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\D/g, '')

const checkId = (v: string) => {
  if (!v) return 'رقم الهوية مطلوب'
  if (v.length !== 10) return `رقم الهوية 10 أرقام، كتبت ${v.length}`
  if (v[0] !== '1' && v[0] !== '2') return 'رقم الهوية يبدأ بـ 1 أو 2'
  return ''
}

const checkPhone = (v: string) => {
  if (!v) return 'رقم الجوال مطلوب'
  if (!v.startsWith('05')) return 'رقم الجوال يبدأ بـ 05'
  if (v.length !== 10) return `رقم الجوال 10 أرقام، كتبت ${v.length}`
  return ''
}

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/
const checkEmail = (v: string) => {
  if (!v) return 'البريد الإلكتروني مطلوب'
  if (/[؀-ۿ]/.test(v)) return 'البريد الإلكتروني يُكتب بالأحرف الإنجليزية'
  if (!v.includes('@')) return 'البريد الإلكتروني ناقص علامة @'
  if (!EMAIL_RE.test(v)) return 'تأكد من كتابة البريد كاملًا، مثل: name@gmail.com'
  return ''
}

/* common providers — a domain one or two letters off gets a «did you mean» */
const DOMAINS = ['gmail.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'yahoo.com', 'live.com', 'outlook.sa', 'hotmail.sa']
const distance = (a: string, b: string) => {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return row[b.length]
}
const suggestEmail = (v: string) => {
  const at = v.lastIndexOf('@')
  if (at < 1) return ''
  const domain = v.slice(at + 1).toLowerCase()
  if (!domain || DOMAINS.includes(domain) || domain.endsWith('.edu.sa')) return ''
  let best = ''
  let bestD = 3
  for (const d of DOMAINS) {
    const dist = distance(domain, d)
    if (dist < bestD) {
      bestD = dist
      best = d
    }
  }
  return best ? v.slice(0, at + 1) + best : ''
}

/* one input that cleans what is typed, explains mistakes in Arabic under the
   field once the person leaves it, and blocks sending until it's right */
function CheckedInput({
  clean,
  check,
  suggest,
  ...props
}: {
  clean: (s: string) => string
  check: (s: string) => string
  suggest?: (s: string) => string
} & InputHTMLAttributes<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)
  const msg = check(value)
  const hint = suggest && !msg ? suggest(value) : ''

  useEffect(() => {
    ref.current?.setCustomValidity(msg)
  }, [msg])

  return (
    <>
      <input
        {...props}
        ref={ref}
        value={value}
        className={touched && msg ? 'is-bad' : undefined}
        onChange={(e) => setValue(clean(e.target.value))}
        onBlur={() => setTouched(true)}
        onInvalid={() => setTouched(true)}
      />
      {touched && msg ? <small className="rqf-note">{msg}</small> : null}
      {hint ? (
        <small className="rqf-note rqf-note-tip">
          هل تقصد{' '}
          <button type="button" dir="ltr" onClick={() => setValue(hint)}>
            {hint}
          </button>
          ؟
        </small>
      ) : null}
    </>
  )
}

/* the details every form asks for; a student is asked for the university,
   anyone else for what they do instead */
function AboutYou() {
  const [status, setStatus] = useState('')
  return (
    <Section num="01" title="بياناتك">
      <div className="rqf-fields">
        <Field label="الاسم" required>
          <input required name="الاسم" type="text" placeholder="الاسم الكامل" autoComplete="name" />
        </Field>
        <Field label="رقم الهوية الوطنية" required>
          <CheckedInput
            required
            name="الهوية الوطنية"
            type="text"
            placeholder="10 أرقام"
            dir="ltr"
            inputMode="numeric"
            clean={(s) => onlyDigits(s).slice(0, 10)}
            check={checkId}
          />
        </Field>
        <Field label="البريد الإلكتروني" required>
          <CheckedInput
            required
            name="البريد الإلكتروني"
            type="text"
            placeholder="name@gmail.com"
            dir="ltr"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            clean={(s) => s.replace(/\s/g, '')}
            check={checkEmail}
            suggest={suggestEmail}
          />
        </Field>
        <Field label="رقم الجوال" required>
          <CheckedInput
            required
            name="رقم الجوال"
            type="tel"
            placeholder="05XXXXXXXX"
            dir="ltr"
            autoComplete="tel"
            inputMode="numeric"
            clean={(s) => {
              let d = onlyDigits(s)
              if (d.startsWith('9665')) d = '0' + d.slice(3)
              else if (d.startsWith('5')) d = '0' + d
              return d.slice(0, 10)
            }}
            check={checkPhone}
          />
        </Field>
        <div className="rqf-field">
          <span>
            هل أنت طالب؟ <b>*</b>
          </span>
          <div className="rqf-chips" role="radiogroup">
            {STATUSES.map((t) => (
              <label key={t} className="rqf-chip" data-on={status === t || undefined}>
                <input type="radio" name="الصفة" value={t} required checked={status === t} onChange={() => setStatus(t)} />
                <span className="rqf-chip-mark">{Icon.check}</span>
                {t}
              </label>
            ))}
          </div>
        </div>
        {status === 'طالب' ? (
          <>
            <Field label="اسم الجامعة" required>
              <input required name="الجامعة" type="text" placeholder="الجامعة التي تدرس فيها" />
            </Field>
            <Field label="الرقم الجامعي" required>
              <input required name="الرقم الجامعي" type="text" placeholder="رقمك الجامعي" dir="ltr" inputMode="numeric" />
            </Field>
            <Field label="التخصص" required>
              <input required name="التخصص" type="text" placeholder="تخصصك الدراسي" />
            </Field>
          </>
        ) : status ? (
          <Field label="حدّد صفتك" required>
            <input required name="الصفة الأخرى" type="text" placeholder="مثال: خريج، موظف..." />
          </Field>
        ) : null}
      </div>
    </Section>
  )
}

/* which department and committee the applicant wants to join */
/* departments, plus «إدارة التقنية» which holds the tech committee */
const PLACEMENTS = [
  ...DEPARTMENTS.map((d) => ({ id: d.id, name: d.name, sheetName: d.name, committees: d.committees })),
  { id: 'tech-dept', name: 'إدارة التقنية', sheetName: 'إدارة التقنية', committees: DIRECT_COMMITTEES },
]

function Placement() {
  const [deptId, setDeptId] = useState('')
  const dept = PLACEMENTS.find((d) => d.id === deptId)
  const single = dept && dept.committees.length === 1 ? dept.committees[0].name : ''
  return (
    <>
      <Field label="الإدارة التي ترغب بالانضمام إليها" required>
        <span className="rqf-select">
          <select
            required
            value={deptId}
            onChange={(e) => setDeptId(e.target.value)}
          >
            <option value="" disabled>
              اختر الإدارة
            </option>
            {PLACEMENTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          {Chevron}
        </span>
        <input type="hidden" name="الإدارة" value={dept ? dept.sheetName : ''} />
      </Field>
      <Field label="اللجنة" required>
        <span className="rqf-select">
          <select required name="اللجنة" defaultValue={single} key={deptId} disabled={!dept}>
            <option value="" disabled>
              {dept ? 'اختر اللجنة' : 'اختر الإدارة أولًا'}
            </option>
            {dept?.committees.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          {Chevron}
        </span>
      </Field>
    </>
  )
}

export default function JoinPage() {
  const [params, setParams] = useSearchParams()
  /* keeps the "back to the page you came from" link when switching between the two tabs */
  const location = useLocation()
  const tab: Tab = params.get('tab') === 'session' ? 'session' : 'apply'
  /* "سجّل الآن" on a programme sends its title (and the partner, if the
     visitor came through one) — the form then registers for it */
  const program = (params.get('program') || '').trim()
  const ref = (params.get('ref') || '').trim()
  const [sent, setSent] = useState<Tab | null>(null)
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)
  const [sessionType, setSessionType] = useState('')
  const root = useRef<HTMLElement>(null)

  const go = (t: Tab) => {
    setFailed(false)
    setParams(t === 'apply' ? {} : { tab: t }, { replace: true, state: location.state })
  }

  useLayoutEffect(() => {
    const el = root.current
    if (!el || reduced()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.rqf-in', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07 })
    }, el)
    return () => ctx.revert()
  }, [tab, sent])

  /* after sending, jump to the top so the confirmation is seen first */
  useEffect(() => {
    if (!sent) return
    ;(document.activeElement as HTMLElement | null)?.blur()
    const id = requestAnimationFrame(() => {
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    })
    return () => cancelAnimationFrame(id)
  }, [sent])

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (sending) return
    setSending(true)
    setFailed(false)
    try {
      /* a programme's registration goes to its own sheet, in a tab named after it */
      if (program) await sendToSheet(SHEETS.PROGRAMS, program, e.currentTarget)
      else if (tab === 'apply') await sendToSheet(SHEETS.JOIN, 'التقديم على مسار', e.currentTarget)
      else await sendToSheet(SHEETS.SESSIONS, 'حجز جلسة توجيه', e.currentTarget)
      setSent(tab)
    } catch {
      setFailed(true)
    } finally {
      setSending(false)
    }
  }

  const isApply = tab === 'apply'
  const done = sent === tab

  return (
    <main className="rqf" ref={root}>
      <div className="rqf-wrap">
        {program ? (
          /* registering for one programme: the same header as /programs */
          <div className="jn-ph">
            <p className="jn-ph-label rqf-in">التسجيل في البرامج</p>
            <h1 className="jn-ph-title rqf-in">{program}</h1>
            <span className="jn-ph-tear rqf-in" aria-hidden="true" />
            <p className="jn-ph-sub rqf-in">أكمل بياناتك لتأكيد تسجيلك، وسيتواصل معك فريق مسار بتفاصيل الحضور.</p>
          </div>
        ) : (
          <>
            {/* the same heading as every other page */}
            <div className="rqf-top">
              <PageHead label="كن جزءًا من مسار" title="انضم إلى مسار" sub="سواء كنت تريد الانضمام إلى المبادرة أو حجز جلسة توجيه مخصصة، نحن هنا لمساعدتك." />
            </div>

            <div className="jn-tabs rqf-in" role="tablist" aria-label="انضم إلى مسار" data-tab={tab}>
              <span className="jn-tabs-pill" aria-hidden="true" />
              <button type="button" role="tab" aria-selected={isApply} onClick={() => go('apply')}>
                التقديم على مسار
              </button>
              <button type="button" role="tab" aria-selected={!isApply} onClick={() => go('session')}>
                حجز جلسة توجيه
              </button>
            </div>
          </>
        )}

        <div className="rqf-card" key={tab}>
          {done ? (
            <div className="rqf-sent rqf-in" role="status">
              <span className="rqf-sent-mark">{Icon.check}</span>
              <h2 className="rqf-sent-title">{program ? 'تم تسجيلك بنجاح' : isApply ? 'تم استلام طلبك' : 'تم استلام طلب الحجز'}</h2>
              <p className="rqf-sent-text">
                {program
                  ? `شكرًا على تسجيلك في ${program}. سيتواصل معك فريق مسار بتفاصيل الحضور.`
                  : isApply
                    ? 'شكرًا على تقديمك. سيراجع فريق مسار طلبك ويتواصل معك.'
                    : 'سيتواصل معك فريق مسار لتأكيد موعد الجلسة.'}
              </p>
            </div>
          ) : (
            <form className="rqf-form" onSubmit={submit}>
              {program ? (
                <>
                  <input type="hidden" name="البرنامج" value={program} />
                  <input type="hidden" name="المصدر" value={ref || 'الموقع'} />
                </>
              ) : null}
              {program ? null : (
              <p className="jn-lead rqf-in">
                {isApply
                  ? 'أكمل النموذج التالي وسيقوم فريق مسار بمراجعة طلبك والتواصل معك.'
                  : 'احجز جلسة توجيه مخصصة مع أحد متخصصي مسار لمساعدتك في رسم مسارك.'}
              </p>
              )}

              <AboutYou />

              {program ? null : isApply ? (
                <Section num="02" title="عن انضمامك">
                  <div className="rqf-fields">
                    <Placement />
                    <Field label="لماذا تريد الانضمام إلى مسار؟" required>
                      <textarea required name="لماذا تريد الانضمام" rows={4} placeholder="أخبرنا عن دوافعك وما تأمل تحقيقه..." />
                    </Field>
                    <Field label="مهاراتك وخبراتك">
                      <textarea name="المهارات والخبرات" rows={3} placeholder="اذكر مهاراتك وأي خبرات سابقة..." />
                    </Field>
                  </div>
                </Section>
              ) : (
                <Section num="02" title="تفاصيل الجلسة">
                  <div className="rqf-fields">
                    <div className="rqf-field">
                      <span>
                        نوع الجلسة <b>*</b>
                      </span>
                      <div className="rqf-chips" role="radiogroup">
                        {SESSION_TYPES.map((t) => (
                          <label key={t} className="rqf-chip" data-on={sessionType === t || undefined}>
                            <input type="radio" name="نوع الجلسة" value={t} required checked={sessionType === t} onChange={() => setSessionType(t)} />
                            <span className="rqf-chip-mark">{Icon.check}</span>
                            {t}
                          </label>
                        ))}
                      </div>
                    </div>
                    <Field label="الوقت المناسب">
                      <input name="الوقت المناسب" type="text" placeholder="مثال: الأحد ١٠ ص – ١٢ م" />
                    </Field>
                    <Field label="ملاحظات إضافية">
                      <textarea name="ملاحظات" rows={3} placeholder="أي تفاصيل إضافية تودّ مشاركتها..." />
                    </Field>
                  </div>
                </Section>
              )}

              <div className="rqf-actions rqf-in">
                {failed ? <p className="rqf-error" role="alert">تعذّر الإرسال، تأكد من اتصالك بالإنترنت وحاول مرة أخرى.</p> : null}
                <button type="submit" className="rqf-btn rqf-btn--solid" disabled={sending} aria-busy={sending}>
                  {sending ? 'جارٍ الإرسال…' : program ? 'تأكيد التسجيل' : isApply ? 'إرسال الطلب' : 'تأكيد الحجز'}
                  {sending ? null : Icon.send}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}