/* =================================================================
   الشركاء والرعاة — the ONLY file to edit when a partner or sponsor
   is added.

   إضافة شريك:
   1. حط الشعار في  src/imports  (صورة مربعة أفضل)
   2. استورده أول الملف مثل الشعارين تحت
   3. أضف سطر في PARTNERS:
        { name: 'اسم الجهة', category: 'شريك إعلامي', logo: logoName },
      category لازم تكون وحدة من الأربع:
        'شريك استراتيجي' | 'شريك إعلامي' | 'شريك ضيافة' | 'شريك مساحة'

   إضافة راعي (الرعاة بدون أنواع):
        { name: 'اسم الجهة', logo: logoName },

   والشريط المتحرك في الصفحة الرئيسية ياخذ الشعارات من هنا بعد:
   الشركاء بالسطر الأول، والرعاة بالسطر الثاني.
   ================================================================= */

import ncfbLogo from '../imports/partner-logo-1.png'
import t2Logo from '../imports/partner-logo-2.png'

export type PartnerCategory = 'شريك استراتيجي' | 'شريك إعلامي' | 'شريك ضيافة' | 'شريك مساحة'

export type Partner = {
  name: string
  category: PartnerCategory
  logo: string
}

export type Sponsor = {
  name: string
  logo: string
}

export const PARTNERS: Partner[] = [
  { name: 'T2 Business Simplified', category: 'شريك مساحة', logo: t2Logo },
]

export const SPONSORS: Sponsor[] = [
  { name: 'المركز الوطني للمنشآت العائلية', logo: ncfbLogo },
]