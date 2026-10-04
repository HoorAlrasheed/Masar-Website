/* =================================================================
   متميزو الشهر — the ONLY file to edit each month.

   To add a new month: copy the whole block of the latest month, paste
   it at the TOP of MONTHS (the first month is the one shown first),
   then change its id, honours and people.
   Everything else follows the id ('2026-10') by itself: the calendar's
   number and name, its days, the heart on the month's last day (30, 31,
   28 or 29), the date on every ticket, «قد يكون اسمك هنا في …» with the
   next month's name, and the arrows to go back to earlier months.

   Each person:
     { name: 'الاسم', committee: 'لجنة ...', leader: true (للقادة فقط، وإلا احذفيها),
       linkedin: 'رابط لينكدإن أو اتركه فاضي', image: '/featured/photo.jpg' أو '' }
   - the line under each name is the same for everyone:
       members: «تقديرًا لتفاعلٍ مميز وعطاءٍ مستمر طوال الشهر.»
       leaders (leader: true): «تقديرًا لقيادةٍ ملهمة وأثرٍ واضح في الفريق.»
     (reason: '...' still works if a person ever needs their own line)
   - image: put the photo in public/featured, or leave '' (then the first
     letter of the name is shown)
   - a department with no one this month: leave its list empty  []
   ================================================================= */

export type FeaturedPerson = {
  name: string
  committee: string
  /** a leader is thanked for leading their team */
  leader?: boolean
  /** optional: a line of their own instead of the usual one */
  reason?: string
  linkedin?: string
  image?: string
}

export type DepartmentId = 'hr' | 'pr' | 'media' | 'planning' | 'tech'

export type FeaturedMonth = {
  /** optional: departments and committees honoured as a whole */
  honours?: FeaturedHonours
  /** short and unique, used in the link: year-month, e.g. '2026-10' */
  id: string
  /** optional: just for whoever edits this file — the page reads the month
      and year from the id */
  label?: string
  people: Record<DepartmentId, FeaturedPerson[]>
}

/* the departments and committees that stood out together this month */
export type FeaturedHonours = {
  departments: DepartmentId[]
  committees: { name: string; dept: DepartmentId }[]
}

/* the five stations on the map — order and names (all in Masar's sky) */
export const FEATURED_DEPARTMENTS: { id: DepartmentId; name: string; short: string; color: string }[] = [
  { id: 'hr', name: 'إدارة الموارد البشرية', short: 'الموارد البشرية', color: '#9fd8f5' },
  { id: 'pr', name: 'إدارة العلاقات العامة', short: 'العلاقات العامة', color: '#9fd8f5' },
  { id: 'media', name: 'إدارة الإعلام', short: 'الإعلام', color: '#9fd8f5' },
  { id: 'planning', name: 'إدارة التخطيط والتنظيم', short: 'التخطيط والتنظيم', color: '#9fd8f5' },
  { id: 'tech', name: 'لجنة المنصات والحلول التقنية', short: 'التقنية', color: '#9fd8f5' },
]

/* newest month first */
export const MONTHS: FeaturedMonth[] = [
  {
    id: '2026-09',
    label: 'سبتمبر ٢٠٢٦',
    honours: {
      departments: ['hr', 'pr'],
      committees: [
        { name: 'لجنة الشراكات', dept: 'pr' },
        { name: 'لجنة الاستقطاب', dept: 'hr' },
      ],
    },
    people: {
      hr: [
        { name: 'رهف ملهي العريفي', committee: 'رئيسة إدارة الموارد البشرية', leader: true, linkedin: 'https://www.linkedin.com/in/rahaf-alarifi-187712402', image: '' },
        { name: 'جنى عبدالله العصيمي', committee: 'نائبة رئيسة إدارة الموارد البشرية', leader: true, linkedin: 'https://www.linkedin.com/in/jana-alosaimi-46bb0338a', image: '' },
        { name: 'دينا عبدالرحمن المطيري', committee: 'قائدة لجنة الاستقطاب', leader: true, linkedin: '', image: '' },
        { name: 'رولا فهد البقمي', committee: 'لجنة الاستقطاب', linkedin: '', image: '' },
        { name: 'لين خالد الشهري', committee: 'لجنة الاستقطاب', linkedin: 'https://www.linkedin.com/in/leen-alshehri-05427438a', image: '' },
        { name: 'زهراء امير الشخص', committee: 'لجنة الاستقطاب', linkedin: '', image: '' },
        { name: 'نوره ماجد السحيباني', committee: 'لجنة الاستقطاب', linkedin: '', image: '' },
        { name: 'فيصل محمد أباحسين', committee: 'لجنة المتابعة', linkedin: 'https://www.linkedin.com/in/faisal-abahussain-784a74382', image: '' },
        { name: 'فرح مسفر العتيبي', committee: 'لجنة المتابعة', linkedin: 'https://www.linkedin.com/in/%D9%81%D8%B1%D8%AD-%D8%A7%D9%84%D8%B9%D8%AA%D9%8A%D8%A8%D9%8A-2a8364384', image: '' },
      ],
      pr: [
        { name: 'راكان خالد العتيبي', committee: 'رئيس إدارة العلاقات العامة', leader: true, linkedin: 'https://www.linkedin.com/in/rakan-alotaibi-a941ab376', image: '' },
        { name: 'جود عبدالعزيز البراك', committee: 'قائدة لجنة الشراكات', leader: true, linkedin: 'https://www.linkedin.com/in/joudaz', image: '' },
        { name: 'ميس تركي الشهري', committee: 'نائبة قائدة لجنة التعاونات', leader: true, linkedin: 'https://www.linkedin.com/in/mays-alshehri-13846733a', image: '' },
        { name: 'همس عادل العنزي', committee: 'لجنة الشراكات', linkedin: 'https://www.linkedin.com/in/hams-alanzi-152173390', image: '' },
        { name: 'خالد حمدان الشمري', committee: 'لجنة الشراكات', linkedin: 'https://www.linkedin.com/in/khalid-alshammari-3553932ab', image: '' },
        { name: 'فواز فرحان العنزي', committee: 'لجنة التعاونات', linkedin: '', image: '' },
      ],
      media: [
        { name: 'عبدالله عبدالمجيد العتيق', committee: 'نائب قائد لجنة التسويق وكتابة المحتوى', leader: true, linkedin: 'https://www.linkedin.com/in/abdullahalateeq72', image: '' },
        { name: 'ليان مصلح العتيبي', committee: 'لجنة التغطيات والمونتاج', linkedin: 'https://www.linkedin.com/in/layan-al-otaibi-b7522734a', image: '' },
        { name: 'جليان عايد العنزي', committee: 'لجنة التصاميم والهوية البصرية', linkedin: 'https://www.linkedin.com/in/%D8%AC%D9%88%D9%84%D9%8A%D8%A7%D9%86-%D8%A7%D9%84%D8%B9%D9%86%D8%B2%D9%8A-7a5a91422', image: '' },
      ],
      planning: [
        { name: 'سالم حسن آل صغير', committee: 'نائب رئيسة إدارة التخطيط والتنظيم', leader: true, linkedin: 'https://www.linkedin.com/in/salim-alsaghir', image: '' },
        { name: 'هدى فلاح الدلبحي', committee: 'قائدة لجنة التنظيم', leader: true, linkedin: 'https://www.linkedin.com/in/houda-aldalbahi-36bb63384', image: '' },
        { name: 'مها محمد السعيدان', committee: 'لجنة التخطيط', linkedin: '', image: '' },
        { name: 'رند حسين الشرهان', committee: 'لجنة التخطيط', linkedin: '', image: '' },
        { name: 'رنيم عمر التويجري', committee: 'لجنة التخطيط', linkedin: 'https://www.linkedin.com/in/raneem-altwaijri-7398b52b0', image: '' },
        { name: 'مها عبداللطيف السهيل', committee: 'لجنة التنظيم', linkedin: 'https://www.linkedin.com/in/maha-abdullatif-52735b3a8', image: '' },
        { name: 'وصايف عبدالعزيز الجبالي', committee: 'لجنة التنظيم', linkedin: 'https://www.linkedin.com/in/wosayf-abdulaziz-87b100325', image: '' },
        { name: 'شادن الرشود', committee: 'لجنة التنظيم', linkedin: 'https://www.linkedin.com/in/shaden-alrshood-738a3b3a7', image: '' },
      ],
      tech: [],
    },
  },
]