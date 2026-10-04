import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { gsap } from 'gsap'

import { SHEETS, sendToSheet } from '../data/sheet'

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

/* the five details both forms ask for */
function AboutYou() {
  return (
    <Section num="01" title="بياناتك">
      <div className="rqf-fields">
        <Field label="الاسم" required>
          <input required name="الاسم" type="text" placeholder="الاسم الكامل" autoComplete="name" />
        </Field>
        <Field label="البريد الإلكتروني" required>
          <input required name="البريد الإلكتروني" type="email" placeholder="بريدك الجامعي" dir="ltr" autoComplete="email" inputMode="email" />
        </Field>
        <Field label="رقم الجوال" required>
          <input required name="رقم الجوال" type="tel" placeholder="05XXXXXXXX" dir="ltr" autoComplete="tel" inputMode="tel" />
        </Field>
        <Field label="الرقم الجامعي" required>
          <input required name="الرقم الجامعي" type="text" placeholder="رقمك الجامعي" dir="ltr" inputMode="numeric" />
        </Field>
        <Field label="التخصص" required>
          <input required name="التخصص" type="text" placeholder="تخصصك الدراسي" />
        </Field>
      </div>
    </Section>
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