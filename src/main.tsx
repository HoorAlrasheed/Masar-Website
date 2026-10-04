import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import loadThmanyah from './fonts/loadThmanyah'

gsap.registerPlugin(ScrollTrigger)

const render = () =>
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )

/* ننتظر خط ثمانية قبل ما تبدأ الصفحة وحركاتها (بحد أقصى ثانيتين ونص) */
const fonts = loadThmanyah()
Promise.race([fonts, new Promise((r) => setTimeout(r, 2500))]).then(render)

/* لو تأخر الخط (نت بطيء) ونزل بعد ما بدأت الصفحة، تتغير مقاسات الكلام شوي —
   فنعيد حساب أماكن الحركات المرتبطة بالتمرير عشان تمشي صح */
fonts.then(() => window.setTimeout(() => ScrollTrigger.refresh(), 150))