/* registration: 'open' = التسجيل مفتوح, 'soon' = قريبًا, 'closed' = التسجيل مغلق */
export type ProgramStatus = 'open' | 'soon' | 'closed'

export type Program = {
  id: number
  title: string
  status: ProgramStatus
  category: string
  date: string
  time: string
  location: string
  mapUrl?: string
  targetAudience: string
  speaker: string
  topics: string[]
  description: string
  image: string
}

/* =================================================================
   البرامج والفعاليات الحالية (اللي تسجيلها مفتوح أو قريب).
   حاليًا ما فيه برامج، فصفحة الفعاليات والبرامج تعرض في كل بوكس
   آخر حدث صار من نوعه (من ملف news.ts) والباقي «قريبًا».

   إضافة برنامج: انسخي البلوك اللي تحت (بدون علامات // في أول كل سطر)
   والصقيه داخل القائمة بين [ و ] ثم غيّري بياناته:

  {
    id: 1,
    title: 'جلسة حوارية: عنوان الجلسة',
    status: 'open',            // 'open' التسجيل مفتوح · 'soon' قريبًا · 'closed' منتهي
    category: 'جلسات حوارية',  // 'جلسات حوارية' · 'ورش العمل' · 'هاكاثونات' · 'زيارات'
    date: '١٥ أكتوبر ٢٠٢٦',
    time: '٤:٠٠ م – ٦:٠٠ م',
    location: 'اسم المكان — الرياض',
    mapUrl: '',                // رابط الموقع في قوقل ماب
    targetAudience: 'طلاب المرحلة الجامعية',
    speaker: 'اسم الضيف — صفته',
    topics: ['محور أول', 'محور ثاني', 'محور ثالث'],
    description: 'وصف قصير للبرنامج.',
    image: '',                 // '/programs/اسم-الصورة.jpg' — إذا تُركت فاضية تظهر الرسمة
  },
   ================================================================= */
export const programs: Program[] = []

export const news = [
  {
    id: 1,
    title: 'مسار تُطلق برنامجها الجديد لتطوير مهارات الطلاب للفصل الدراسي القادم',
    category: 'إعلان',
    date: '١٠ محرم ١٤٤٧',
    summary: 'أعلنت مبادرة مسار عن إطلاق برنامجها الجديد المتكامل الذي يهدف إلى تطوير مهارات الطلاب خلال الفصل القادم.',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=500&fit=crop&auto=format',
    featured: true,
  },
  {
    id: 2,
    title: 'فتح باب التسجيل في معسكر مهارات القيادة',
    category: 'فتح تسجيل',
    date: '٥ محرم ١٤٤٧',
    summary: 'يسرّ مسار الإعلان عن فتح باب التسجيل في معسكر مهارات القيادة المقرر إقامته نهاية رمضان.',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop&auto=format',
    featured: false,
  },
  {
    id: 3,
    title: 'نتائج هاكاثون الحلول التقنية — الفوز لفريق ألفا',
    category: 'نتيجة نشاط',
    date: '١ محرم ١٤٤٧',
    summary: 'اختُتم هاكاثون الحلول التقنية بفوز فريق ألفا بالمركز الأول بمشروعهم لتحسين تجربة الطلاب.',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop&auto=format',
    featured: false,
  },
  {
    id: 4,
    title: 'مسار تُكرّم مميزي الشهر في حفل خاص',
    category: 'خبر',
    date: '٢٥ ذو الحجة ١٤٤٦',
    summary: 'نظّمت مبادرة مسار حفل تكريم للطلاب المتميزين تقديراً لإنجازاتهم الأكاديمية والمهنية البارزة.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&auto=format',
    featured: false,
  },
]

export const team = [
  { id: 1, name: 'أحمد بن عبدالله الشمري', position: 'مدير مبادرة مسار', department: 'الإدارة العليا', role: 'الإشراف العام على المبادرة وتحديد توجهاتها الاستراتيجية.' },
  { id: 2, name: 'حور الرشيد', position: 'نائبة مبادرة مسار', department: 'الإدارة العليا', role: 'دعم الإدارة العليا والإشراف على تنفيذ المبادرات.' },
  { id: 3, name: 'فيصل بن خالد الدوسري', position: 'مسؤول البرامج', department: 'إدارة البرامج والأنشطة', role: 'التخطيط والتنفيذ لجميع برامج المبادرة وفعالياتها.' },
  { id: 4, name: 'تركي بن ناصر البقمي', position: 'منسق الفعاليات', department: 'إدارة البرامج والأنشطة', role: 'تنسيق الفعاليات والأنشطة الميدانية.' },
  { id: 5, name: 'عبدالرحمن بن سعد القحطاني', position: 'مسؤول التواصل والإعلام', department: 'إدارة التواصل والإعلام', role: 'إدارة حسابات التواصل الاجتماعي وإنتاج المحتوى الرقمي.' },
  { id: 6, name: 'محمد بن فهد الزهراني', position: 'مصمم الهوية البصرية', department: 'إدارة التواصل والإعلام', role: 'تصميم المواد البصرية والحفاظ على هوية المبادرة المرئية.' },
  { id: 7, name: 'يوسف بن عمر المطيري', position: 'مسؤول التقنية', department: 'إدارة التقنية', role: 'الإشراف على الأنظمة الرقمية وتقنية المعلومات.' },
  { id: 8, name: 'راشد بن علي الحربي', position: 'مسؤول الشراكات', department: 'إدارة الشراكات', role: 'بناء شراكات مع الجهات والشركات وإدارة العلاقات الخارجية.' },
]

export const resources = [
  {
    id: 1,
    title: 'دليل التخصصات الهندسية',
    category: 'الأدلة',
    subcategory: 'دليل التخصصات',
    date: '١٤٤٦',
    description: 'دليل شامل يستعرض تخصصات الهندسة المتاحة وفرص العمل المرتبطة بكل تخصص في السوق السعودي.',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&auto=format',
  },
  {
    id: 2,
    title: 'دليل المهارات المطلوبة في سوق العمل',
    category: 'الأدلة',
    subcategory: 'دليل المهارات',
    date: '١٤٤٦',
    description: 'استعراض للمهارات التقنية والشخصية الأكثر طلباً في سوق العمل، مع توصيات عملية لاكتسابها.',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop&auto=format',
  },
  {
    id: 3,
    title: 'النشرة الفصلية — الفصل الثالث ١٤٤٦',
    category: 'النشرات',
    subcategory: 'النشرات الدورية',
    date: '١٤٤٦',
    description: 'نشرة مسار الفصلية تتضمن ملخص أنشطة الفصل الدراسي الثالث وأبرز الإنجازات والإحصاءات.',
    image: 'https://images.unsplash.com/photo-1568667256531-6db7f1d8d9ce?w=400&h=300&fit=crop&auto=format',
  },
  {
    id: 4,
    title: 'إصدار خاص: تقرير مسار السنوي',
    category: 'النشرات',
    subcategory: 'الإصدارات الخاصة',
    date: '١٤٤٦',
    description: 'التقرير السنوي الشامل لمبادرة مسار يستعرض مسيرة العام وأبرز ما حُقق من أهداف وإنجازات.',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop&auto=format',
  },
]

export const featuredStudents = [
  {
    id: 1,
    name: 'خالد بن إبراهيم السبيعي',
    major: 'هندسة الحاسب الآلي',
    month: 'محرم ١٤٤٧',
    achievement: 'حصل على منحة دراسية كاملة من إحدى الجامعات الأمريكية الرائدة في مجال الذكاء الاصطناعي.',
    story: 'استطاع خالد من خلال انضمامه لمسار تطوير مهاراته القيادية والتقنية، ليحقق حلمه بالالتحاق ببرنامج دراسات عليا دولية في تخصص الذكاء الاصطناعي.',
    current: true,
  },
  {
    id: 2,
    name: 'عبدالعزيز بن سعود الفهد',
    major: 'هندسة الروبوتات',
    month: 'ذو الحجة ١٤٤٦',
    achievement: 'فاز بالمركز الأول في مسابقة الروبوتات الوطنية.',
    story: '',
    current: false,
  },
  {
    id: 3,
    name: 'محمد بن عبدالله النغيمشي',
    major: 'علوم الحاسب',
    month: 'ذو القعدة ١٤٤٦',
    achievement: 'أسّس شركة ناشئة في مجال الذكاء الاصطناعي وأتمتة الأعمال.',
    story: '',
    current: false,
  },
]

export type PartnerCategory = 'شريك استراتيجي' | 'شريك إعلامي' | 'شريك ضيافة' | 'شريك مساحة'
export interface Partner {
  id: number
  nameAr: string
  name: string
  category: PartnerCategory
  logo?: string
}

export interface Sponsor {
  id: number
  nameAr: string
  name: string
  logo?: string
}

export const partners: Partner[] = [
  { id: 1, nameAr: 'الجهة الشريكة الاستراتيجية', name: '', category: 'شريك استراتيجي' },
  { id: 2, nameAr: 'الجهة الإعلامية الشريكة', name: '', category: 'شريك إعلامي' },
  { id: 3, nameAr: 'جهة الضيافة الشريكة', name: '', category: 'شريك ضيافة' },
  { id: 4, nameAr: 'جهة المساحة الشريكة', name: '', category: 'شريك مساحة' },
]

export const sponsors: Sponsor[] = []