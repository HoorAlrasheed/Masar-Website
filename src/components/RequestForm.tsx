import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'

import { SHEETS, sendToSheet } from '../data/sheet'

import PageHead from './PageHead'

import './RequestForm.css'

/* =================================================================
   The partnership and sponsorship request pages share this one form;
   each page only passes its own words and choices.
   NOTE: like the contact form, it only shows a confirmation for now —
   it isn't connected to a sending service yet.
   ================================================================= */

export type RequestFormConfig = {
  crumb: string
  title: string
  intro: string
  detailsTitle: string
  choiceLabel: string
  choices: string[]
  orgTypes: string[]
  messagePlaceholder: string
  submit: string
  thanks: string
}

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const Icon = {
  back: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  ),
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
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
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

export default function RequestForm({ c }: { c: RequestFormConfig }) {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)
  const [choice, setChoice] = useState('')
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el || reduced()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.rqf-in', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 })
    }, el)
    return () => ctx.revert()
  }, [sent])

  /* once sent, jump to the top so the confirmation is the first thing seen.
     Done after the page has re-drawn (the form is replaced by a short card),
     and the phone keyboard is closed first so nothing pulls the page back. */
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
      await sendToSheet(SHEETS.PARTNERS, c.title, e.currentTarget)
      setSent(true)
    } catch {
      setFailed(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="rqf" ref={root}>
      <div className="rqf-wrap">
        {/* header */}
        {/* the same heading as the other pages (فريق مسار, الشركاء والرعاة…) */}
        <div className="rqf-top">
          <PageHead label="الشركاء والرعاة" title={c.title} sub={c.intro} />
        </div>

        <div className="rqf-card rqf-in">
          {sent ? (
            <div className="rqf-sent" role="status">
              <span className="rqf-sent-mark">{Icon.check}</span>
              <h2 className="rqf-sent-title">تم إرسال طلبك بنجاح</h2>
              <p className="rqf-sent-text">{c.thanks}</p>
              <Link to="/partners" className="rqf-btn rqf-btn--outline">
                العودة إلى الشركاء والرعاة
              </Link>
            </div>
          ) : (
            <form className="rqf-form" onSubmit={submit}>
              <Section num="01" title="معلومات الجهة">
                <div className="rqf-fields">
                  <label className="rqf-field">
                    <span>
                      اسم الجهة أو المؤسسة <b>*</b>
                    </span>
                    <input required name="اسم الجهة" type="text" placeholder="الاسم الرسمي للجهة" autoComplete="organization" />
                  </label>
                  <label className="rqf-field">
                    <span>
                      نوع الجهة <b>*</b>
                    </span>
                    <span className="rqf-select">
                      <select required name="نوع الجهة" defaultValue="">
                        <option value="" disabled>
                          اختر نوع الجهة
                        </option>
                        {c.orgTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      {Icon.chevron}
                    </span>
                  </label>
                </div>
              </Section>

              <Section num="02" title="بيانات التواصل">
                <div className="rqf-fields">
                  <label className="rqf-field">
                    <span>
                      اسم المسؤول عن التواصل <b>*</b>
                    </span>
                    <input required name="اسم المسؤول" type="text" placeholder="الاسم الكامل" autoComplete="name" />
                  </label>
                  <label className="rqf-field">
                    <span>
                      البريد الإلكتروني الرسمي <b>*</b>
                    </span>
                    <input required name="البريد الإلكتروني" type="email" placeholder="example@org.com" dir="ltr" autoComplete="email" inputMode="email" />
                  </label>
                  <label className="rqf-field">
                    <span>
                      رقم الجوال <b>*</b>
                    </span>
                    <input required name="رقم الجوال" type="tel" placeholder="05XXXXXXXX" dir="ltr" autoComplete="tel" inputMode="tel" />
                  </label>
                </div>
              </Section>

              <Section num="03" title={c.detailsTitle}>
                <div className="rqf-field">
                  <span>
                    {c.choiceLabel} <b>*</b>
                  </span>
                  <div className="rqf-chips" role="radiogroup">
                    {c.choices.map((t) => (
                      <label key={t} className="rqf-chip" data-on={choice === t || undefined}>
                        <input type="radio" name={c.choiceLabel} value={t} required checked={choice === t} onChange={() => setChoice(t)} />
                        <span className="rqf-chip-mark">{Icon.check}</span>
                        {t}
                      </label>
                    ))}
                  </div>
                </div>
                <label className="rqf-field">
                  <span>رسالة إضافية أو تفاصيل أخرى</span>
                  <textarea name="الرسالة" rows={4} placeholder={c.messagePlaceholder} />
                </label>
              </Section>

              <div className="rqf-actions rqf-in">
                {failed ? <p className="rqf-error" role="alert">تعذّر الإرسال، تأكد من اتصالك بالإنترنت وحاول مرة أخرى.</p> : null}
                <button type="submit" className="rqf-btn rqf-btn--solid" disabled={sending} aria-busy={sending}>
                  {sending ? 'جارٍ الإرسال…' : c.submit}
                  {sending ? null : Icon.send}
                </button>
                <Link to="/partners" className="rqf-cancel">
                  إلغاء والعودة
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}