import type { ReactNode } from 'react'

import './PageHead.css'

/* =================================================================
   The heading at the top of a page — the same on every page
   (فريق مسار, الفعاليات والبرامج…): a small label between two lines,
   the title, the torn dashed line with its two dots, then a short line.
   ================================================================= */

export default function PageHead({ label, title, sub }: { label: string; title: ReactNode; sub?: ReactNode }) {
  return (
    <div className="phd">
      <p className="phd-label">{label}</p>
      <h1 className="phd-title">{title}</h1>
      <span className="phd-tear" aria-hidden="true" />
      {sub ? <p className="phd-sub">{sub}</p> : null}
    </div>
  )
}