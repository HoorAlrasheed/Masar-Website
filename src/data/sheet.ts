/* =================================================================
   روابط الشيتات — أربعة شيتات، وكل شيت فيه نفس الكود (masar-sheet.gs)
   - PARTNERS: ورقة «طلب شراكة» + ورقة «طلب رعاية»  (صفحة الشركاء والرعاة)
   - JOIN:     التقديم على مسار                   (انضم إلى مسار)
   - SESSIONS: حجز جلسة توجيه                     (انضم إلى مسار)
   - PROGRAMS: التسجيل في البرامج، كل برنامج في ورقة باسمه
   الأوراق تنفتح من نفسها أول مرة يوصلها طلب.
   الرابط ينسخ من برمجة التطبيقات (Apps Script) بعد «نشر» وينتهي بـ /exec
   لين ما ينحط الرابط، النموذج يقول «تم الإرسال» بس ما يوصل شي.
   ================================================================= */

export const SHEETS = {
  PARTNERS: 'https://script.google.com/macros/s/AKfycbztI-7gF_0KoegMCD3Sc09zoEE7QmeORzlKYtj8vD47Zfoks7zIcj3JWVQVUOEyTTPqBQ/exec', // ← رابط شيت «طلبات الشراكة والرعاية»
  JOIN: 'https://script.google.com/macros/s/AKfycbyQ9k7G6882pgBlUijXgDu3Pa1PGMoegwOUOyv8BFpo3HvnUmFIUrFz5AaLiplF_Bcf6Q/exec', // ← رابط شيت «التقديم على مسار»
  SESSIONS: 'https://script.google.com/macros/s/AKfycbztGJ4gFZkNNliuQFyVXfrzH98DpeyuEsCgscBGd9FFuxMRbPbHEN0ttGvy9X2Ocj8yVg/exec', // ← رابط شيت «حجز جلسات التوجيه»
  PROGRAMS: 'https://script.google.com/macros/s/AKfycbz_D-YtMhsnAje2v4zlt6A42DktJ1PwI1QhUAy2dYyzy2VLHs4f5Xlh-yYOXemDBr4I/exec', // ← رابط شيت «التسجيل في البرامج»
}

/** sends one form as a new row in the tab called `tab` of the sheet at `url` */
export async function sendToSheet(url: string, tab: string, form: HTMLFormElement) {
  const data = new URLSearchParams()
  const order: string[] = []
  new FormData(form).forEach((v, k) => {
    data.append(k, String(v))
    if (!order.includes(k)) order.push(k)
  })
  data.append('sheet', tab)
  data.append('_order', order.join('|'))
  if (!url) return
  /* Apps Script answers from another domain, so the reply can't be read
     ("no-cors"); reaching it without a network error is enough */
  await fetch(url, { method: 'POST', mode: 'no-cors', body: data })
}