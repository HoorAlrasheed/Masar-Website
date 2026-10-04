import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'

import { OFFICIAL_EMAIL, SOCIALS } from '../data/contact'
import SocialIcon from '../components/SocialIcon'

import './ContactPage.css'

/* -----------------------------------------------------------------
   /contact — تواصل مع مسار (mobile-first, one calm centered column)
   1) title + one line
   2) the accounts — logos only, each opens the account directly
   3) the official email (opens the mail app) + a short usage note
   4) the form
   5) one quiet line pointing to the dedicated join / partnership /
      sponsorship pages, so this form never reads as their replacement
   NOTE: the form only shows a confirmation — it isn't connected to a
   sending service yet (same as the previous footer form).
   ----------------------------------------------------------------- */

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSent(true)
  }

  return (
    <main className="cnt">
      <div className="cnt-glow" aria-hidden="true" />

      <div className="cnt-inner">
        <header className="cnt-head">
          <h1 className="cnt-title">تواصل مع مسار</h1>
          <p className="cnt-intro">للتواصل العام والرسمي مع مبادرة مسار، يسعدنا سماعك.</p>
        </header>

        {/* accounts — logos only */}
        <ul className="cnt-socials" aria-label="حسابات مسار">
          {SOCIALS.map((s) => (
            <li key={s.key}>
              <a href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`مسار على ${s.label}`}
                className="cnt-social"
              >
                <SocialIcon name={s.key} />
              </a>
            </li>
          ))}
        </ul>

        {/* official email */}
        <div className="cnt-mail">
          <a href={`mailto:${OFFICIAL_EMAIL}`} className="cnt-mail-link">
            <SocialIcon name="mail" />
            <span dir="ltr">{OFFICIAL_EMAIL}</span>
          </a>
          <p className="cnt-note">
            البريد الرسمي مخصص للاستفسارات الرسمية والتعاون والشراكات والرعاية المتعلقة بمبادرة مسار.
          </p>
        </div>

        {/* form */}
        <section className="cnt-card" aria-label="نموذج التواصل">
          {sent ? (
            <div className="cnt-sent" role="status">
              <span className="cnt-sent-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M5 12.5L10 17.5L19 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h2 className="cnt-sent-title">تم استلام رسالتك</h2>
              <p className="cnt-sent-text">شكرًا لتواصلك مع مسار.</p>
            </div>
          ) : (
            <form className="cnt-form" onSubmit={handleSubmit}>
              <label className="cnt-field">
                <span>الاسم</span>
                <input required type="text" autoComplete="name" />
              </label>
              <label className="cnt-field">
                <span>البريد الإلكتروني</span>
                <input required type="email" autoComplete="email" inputMode="email" dir="ltr" />
              </label>
              <label className="cnt-field">
                <span>رسالتك</span>
                <textarea required rows={5} />
              </label>
              <button type="submit" className="cnt-submit">
                إرسال الرسالة
              </button>
            </form>
          )}
        </section>

        <p className="cnt-routes">
          للانضمام أو الشراكة أو الرعاية، تفضّل بزيارة صفحاتها:
          <span className="cnt-routes-links">
          <Link to="/join" state={{ from: '/contact', label: 'تواصل معنا' }}>الانضمام</Link>
          <span aria-hidden="true"> · </span>
          <Link to="/partners/partnership-request" state={{ from: '/contact', label: 'تواصل معنا' }}>الشراكة</Link>
          <span aria-hidden="true"> · </span>
          <Link to="/partners/sponsorship-request" state={{ from: '/contact', label: 'تواصل معنا' }}>الرعاية</Link>
          </span>
        </p>
      </div>
    </main>
  )
}