/* =================================================================
   فريق مسار — the ONLY file to edit when the team changes.

   Every person is written like this:
     { name: 'الاسم', role: 'المنصب', linkedin: 'رابط لينكدإن', image: '' }
   - linkedin: the full link, or '' (then the LinkedIn button is hidden)
   - image: '/team/photo-name.jpg' (put the photo in public/team), or ''
     (then the first letter of the name is shown)
   - a committee with no deputy:  deputy: null
   - members only need a name; their title is "عضو" unless you add role
   ================================================================= */

export type Person = {
  name: string
  role?: string
  linkedin?: string
  image?: string
}

export type Committee = {
  id: string
  name: string
  lead: Person | null
  deputy: Person | null
  members: Person[]
}

export type Department = {
  id: string
  name: string
  lead: Person
  deputy: Person
  committees: Committee[]
}

/* ---------- الإدارة العليا ---------- */
export const LEADERSHIP = {
  president: { name: 'موسى فايح العتيبي', role: 'رئيس المبادرة', linkedin: 'https://www.linkedin.com/in/mosa-alotaibi-053402328', image: '' },
  deputy: { name: 'حور ياسر الرشيد', role: 'نائبة رئيس المبادرة', linkedin: 'https://www.linkedin.com/in/hoor-alrasheed-676b27331', image: '' },
}

/* ---------- مستشارو المبادرة (shown at the bottom of the chart) ---------- */
export const ADVISORS: Person[] = [
  { name: 'هيا شافي ال شافي', role: 'مستشارة المبادرة', linkedin: '', image: '' },
  { name: 'فيصل علي الحماد', role: 'مستشار المبادرة', linkedin: '', image: '' },
]

/* ---------- الإدارات (right to left in the chart) ---------- */
export const DEPARTMENTS: Department[] = [
  {
    id: 'hr',
    name: 'إدارة الموارد البشرية',
    lead: { name: 'رهف ملهي العريفي', role: 'قائدة الإدارة', linkedin: 'https://www.linkedin.com/in/rahaf-alarifi-187712402', image: '' },
    deputy: { name: 'جنى عبدالله العصيمي', role: 'نائبة الإدارة', linkedin: 'https://www.linkedin.com/in/jana-alosaimi-46bb0338a', image: '' },
    committees: [
      {
        id: 'recruitment',
        name: 'لجنة الاستقطاب',
        lead: { name: 'دينا عبدالرحمن المطيري', role: 'قائدة اللجنة', linkedin: '', image: '' },
        deputy: null,
        members: [
          { name: 'زهراء امير الشخص', linkedin: '', image: '' },
          { name: 'نوره ماجد السحيباني', linkedin: '', image: '' },
          { name: 'رولا فهد البقمي', linkedin: '', image: '' },
          { name: 'لين خالد الشهري', linkedin: 'https://www.linkedin.com/in/leen-alshehri-05427438a', image: '' },
          { name: 'رغد فهد بن سدره', linkedin: 'https://www.linkedin.com/in/%D8%B1%D8%BA%D8%AF-%D8%A8%D9%86-%D8%B3%D8%AF%D8%B1%D9%87-2a5a98266', image: '' },
        ],
      },
      {
        id: 'follow-up',
        name: 'لجنة المتابعة',
        lead: { name: 'فجر فهد بن حسن', role: 'قائدة اللجنة', linkedin: 'https://www.linkedin.com/in/fajer-binhassan-3760b3313', image: '' },
        deputy: null,
        members: [
          { name: 'فرح مسفر العتيبي', linkedin: 'https://www.linkedin.com/in/%D9%81%D8%B1%D8%AD-%D8%A7%D9%84%D8%B9%D8%AA%D9%8A%D8%A8%D9%8A-2a8364384', image: '' },
          { name: 'نوف مسفر ال رشيد', linkedin: '', image: '' },
          { name: 'فيصل محمد أباحسين', linkedin: 'https://www.linkedin.com/in/faisal-abahussain-784a74382', image: '' },
          { name: 'أسامة عبدالعزيز الزومان', linkedin: '', image: '' },
          { name: 'رؤى عادل الغامدي', linkedin: 'https://www.linkedin.com/in/%D8%B1%D8%A4%D9%89-%D8%A7%D9%84%D8%BA%D8%A7%D9%85%D8%AF%D9%8A-77a423440', image: '' },
        ],
      },
    ],
  },
  {
    id: 'pr',
    name: 'إدارة العلاقات العامة',
    lead: { name: 'راكان خالد العتيبي', role: 'قائد الإدارة', linkedin: 'https://www.linkedin.com/in/rakan-alotaibi-a941ab376', image: '' },
    deputy: { name: 'عبدالرحمن علي القحطاني', role: 'نائب الإدارة', linkedin: '', image: '' },
    committees: [
      {
        id: 'partnerships',
        name: 'لجنة الشراكات',
        lead: { name: 'جود عبدالعزيز البراك', role: 'قائدة اللجنة', linkedin: 'https://www.linkedin.com/in/joudaz', image: '' },
        deputy: { name: 'غاده سيف القحطاني', role: 'نائبة اللجنة', linkedin: 'https://www.linkedin.com/in/ghada-alqahtani-3a2b773a8', image: '' },
        members: [
          { name: 'غدي شرف الصاملي', linkedin: '', image: '' },
          { name: 'جنى ابراهيم الصيخان', linkedin: 'https://www.linkedin.com/in/janalsaikhan', image: '' },
          { name: 'لطيفة عبدالسلام الحصين', linkedin: 'https://www.linkedin.com/in/latifah-alhusayn-170449425', image: '' },
          { name: 'لينا محمد الناهض', linkedin: 'https://www.linkedin.com/in/leena-alnahed-509a26288', image: '' },
          { name: 'جنان عبدالعزيز البراك', linkedin: '', image: '' },
          { name: 'همس عادل العنزي', linkedin: 'https://www.linkedin.com/in/hams-alanzi-152173390', image: '' },
          { name: 'رتاج خالد الحارثي', linkedin: 'https://www.linkedin.com/in/retaj-alharthi-251b6a323', image: '' },
          { name: 'خالد حمدان الشمري', linkedin: 'https://www.linkedin.com/in/khalid-alshammari-3553932ab', image: '' },
          { name: 'ريف علي الشهري', linkedin: '', image: '' },
          { name: 'الجوهرة بنت منصور السليطين', linkedin: '', image: '' },
          { name: 'عزام سعد الصليب', linkedin: '', image: '' },
          { name: 'عبدالرحمن علي العضاض', linkedin: '', image: '' },
          { name: 'دانية حزام الدوسري', linkedin: '', image: '' },
          { name: 'لطيفة عبدالعزيز العروان', linkedin: 'https://www.linkedin.com/in/latifa-alarwan', image: '' },
          { name: 'ليان عبدالعزيز بن عنيّق', linkedin: '', image: '' },
        ],
      },
      {
        id: 'collaborations',
        name: 'لجنة التعاونات',
        lead: null,
        deputy: { name: 'ميس تركي الشهري', role: 'نائبة اللجنة', linkedin: 'https://www.linkedin.com/in/mays-alshehri-13846733a', image: '' },
        members: [
          { name: 'العذوب عبدالعزيز بن نحيت', linkedin: '', image: '' },
          { name: 'نوف خالد سميحان المظيبري', linkedin: 'https://www.linkedin.com/in/nouf-almzybry-198513330', image: '' },
          { name: 'نوره عبدالعزيز الضويحي', linkedin: 'https://www.linkedin.com/in/noura-aldhuwaihi-928144339', image: '' },
          { name: 'جنى عبدالإله التونسي', linkedin: '', image: '' },
          { name: 'فيصل عبدالعزيز بن معمر', linkedin: '', image: '' },
          { name: 'عبدالله بدر العتيبي', linkedin: 'https://www.linkedin.com/in/abdullah-alotaibi-a68b69379', image: '' },
          { name: 'ندى خالد الكريداء', linkedin: 'https://www.linkedin.com/in/%D9%86%D8%AF%D9%89-%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D8%AF%D8%A7%D8%A1-037028387', image: '' },
          { name: 'سديم وليد الشقاري', linkedin: '', image: '' },
          { name: 'فواز فرحان العنزي', linkedin: '', image: '' },
          { name: 'بدرى سعود العتيبي', linkedin: 'https://www.linkedin.com/in/badra-al-atabi-2339b6387', image: '' },
          { name: 'عبدالعزيز خالد العتيبي', linkedin: '', image: '' },
        ],
      },
    ],
  },
  {
    id: 'media',
    name: 'إدارة الإعلام',
    lead: { name: 'ريماس ابراهيم الدريهم', role: 'قائدة الإدارة', linkedin: 'https://www.linkedin.com/in/remas-ibrahim-132529370', image: '' },
    deputy: { name: 'اروى منصور السالم', role: 'نائبة الإدارة', linkedin: '', image: '' },
    committees: [
      {
        id: 'coverage',
        name: 'لجنة التغطيات والمونتاج',
        lead: { name: 'لمى سليمان الساير', role: 'قائدة اللجنة', linkedin: '', image: '' },
        deputy: { name: 'لجين عبدالله العريفي', role: 'نائبة اللجنة', linkedin: 'https://www.linkedin.com/in/lujain-alarifi-8983a531b', image: '' },
        members: [
          { name: 'ليان مصلح العتيبي', linkedin: 'https://www.linkedin.com/in/layan-al-otaibi-b7522734a', image: '' },
          { name: 'العنود محمد الماضي', linkedin: 'https://www.linkedin.com/in/alanoud-almadhi-34643527b', image: '' },
          { name: 'رنيم ممدوح الزعاقي', linkedin: '', image: '' },
          { name: 'عصام حسن الحمدان', linkedin: 'https://www.linkedin.com/in/essam-al-hamdan-228568333', image: '' },
          { name: 'لمى محمد الماضي', linkedin: 'https://www.linkedin.com/in/lama-a-3b5802324', image: '' },
          { name: 'عبدالله نايف العنزي', linkedin: 'https://www.linkedin.com/in/abdullah-n-alenizi-207083363', image: '' },
        ],
      },
      {
        id: 'design',
        name: 'لجنة التصاميم والهوية البصرية',
        lead: { name: 'هند بدر المرسال', role: 'قائدة اللجنة', linkedin: 'https://www.linkedin.com/in/hind-bader-116884331', image: '' },
        deputy: null,
        members: [
          { name: 'جليان عايد العنزي', linkedin: 'https://www.linkedin.com/in/%D8%AC%D9%88%D9%84%D9%8A%D8%A7%D9%86-%D8%A7%D9%84%D8%B9%D9%86%D8%B2%D9%8A-7a5a91422', image: '' },
          { name: 'سمر مسعد الحربي', linkedin: 'https://www.linkedin.com/in/samar-alharbi-606278394', image: '' },
          { name: 'رند سعد الحوشان', linkedin: 'https://www.linkedin.com/in/r-h-358b042a3', image: '' },
          { name: 'صبا فهد الدوسري', linkedin: 'https://www.linkedin.com/in/seba-aldawsari-675a6a331', image: '' },
          { name: 'ليان خالد الشمري', linkedin: 'https://www.linkedin.com/in/layan-alshammari-%D9%84%D9%8A%D9%80%D8%A7%D9%86-%D8%A7%D9%84%D8%B4%D9%80%D9%85%D8%B1%D9%8A-834241260', image: '' },
          { name: 'ياسر ابراهيم اللاحم', linkedin: 'https://www.linkedin.com/in/yaser-allahim', image: '' },
        ],
      },
      {
        id: 'marketing',
        name: 'لجنة التسويق وكتابة المحتوى',
        lead: { name: 'رغد سامي الخالدي', role: 'قائدة اللجنة', linkedin: 'https://www.linkedin.com/in/raghad-alkhaldi-8525ab2b4', image: '' },
        deputy: { name: 'عبدالله عبدالمجيد العتيق', role: 'نائب اللجنة', linkedin: 'https://www.linkedin.com/in/abdullahalateeq72', image: '' },
        members: [
          { name: 'جمانه عبدالرحمن الخريجي', linkedin: '', image: '' },
          { name: 'انسام محمد الرشود', linkedin: 'https://www.linkedin.com/in/ansam-alrshoud-32199936a', image: '' },
          { name: 'جود فهد الحميد', linkedin: '', image: '' },
          { name: 'رهام منصور الدوسري', linkedin: '', image: '' },
          { name: 'غنام عبدالكريم الغنام', linkedin: '', image: '' },
          { name: 'نوف بندر الحبابي', linkedin: '', image: '' },
          { name: 'دانه خالد الغفيلي', linkedin: '', image: '' },
          { name: 'ريم سعدون العنزي', linkedin: '', image: '' },
          { name: 'ليان قيس المنقور', linkedin: 'https://www.linkedin.com/in/layan-almangour-6a560737b', image: '' },
          { name: 'دانة ماجد بن سلمه', linkedin: 'https://www.linkedin.com/in/danah-m-b05975340', image: '' },
          { name: 'عاليه سعد الرويس', linkedin: 'https://www.linkedin.com/in/aliyah-saad-50017a367', image: '' },
          { name: 'شوق عبدالله الحناكي', linkedin: 'https://www.linkedin.com/in/shoug-abdullah-843151383', image: '' },
          { name: 'خالد محمد الزعبي', linkedin: 'https://www.linkedin.com/in/%D8%AE%D8%A7%D9%84%D8%AF-%D8%A7%D9%84%D8%B2%D8%B9%D8%A8%D9%8A-9617503a9', image: '' },
          { name: 'جود بنت مرزوق المطيري', linkedin: '', image: '' },
          { name: 'شهد عبدالعزيز السلطان', linkedin: '', image: '' },
        ],
      },
    ],
  },
  {
    id: 'planning-org',
    name: 'إدارة التخطيط والتنظيم',
    lead: { name: 'نوره بنت النشمي العنزي', role: 'قائدة الإدارة', linkedin: '', image: '' },
    deputy: { name: 'سالم حسن آل صغير', role: 'نائب الإدارة', linkedin: 'https://www.linkedin.com/in/salim-alsaghir', image: '' },
    committees: [
      {
        id: 'planning',
        name: 'لجنة التخطيط',
        lead: { name: 'شهد مشعل اباحسين', role: 'قائدة اللجنة', linkedin: 'https://www.linkedin.com/in/shahad-abahussain-3b13b23a9', image: '' },
        deputy: null,
        members: [
          { name: 'ريما عبدالله ال مبارك', linkedin: 'https://www.linkedin.com/in/reema-abdullah-almubarak-520603338', image: '' },
          { name: 'عبدالمجيد نايف الزهراني', linkedin: 'https://www.linkedin.com/in/abdulmajeed-al-zahrani-67862920a', image: '' },
          { name: 'سعود يوسف العامر', linkedin: '', image: '' },
          { name: 'نوره حامد الشمري', linkedin: '', image: '' },
          { name: 'عبدالعزيز اسماعيل الدبيخي', linkedin: '', image: '' },
          { name: 'جود سعيد السعيد', linkedin: 'https://www.linkedin.com/in/joud-saeed-325534350', image: '' },
          { name: 'رند حسين الشرهان', linkedin: '', image: '' },
          { name: 'رنيم عمر التويجري', linkedin: 'https://www.linkedin.com/in/raneem-altwaijri-7398b52b0', image: '' },
          { name: 'مها محمد السعيدان', linkedin: '', image: '' },
          { name: 'رنا تركي ال خشيل', linkedin: 'https://www.linkedin.com/in/rana-alkhushail', image: '' },
          { name: 'تميم صالح السلامة', linkedin: 'https://www.linkedin.com/in/tamim-alsalamah-902017303', image: '' },
          { name: 'عبدالرحمن ريس الريس', linkedin: '', image: '' },
          { name: 'عبدالله عبدالمحسن الخميس', linkedin: 'https://www.linkedin.com/in/abdullah-alkhamis-3556b6384', image: '' },
          { name: 'هيا عبدالرحمن السلطان', linkedin: '', image: '' },
          { name: 'جنى عبد العزيز بن سعيد', linkedin: 'https://www.linkedin.com/in/jana-saeed-04473234a', image: '' },
          { name: 'وجد عبدالرحمن الغامدي', linkedin: 'https://www.linkedin.com/in/%D9%88%D8%AC%D8%AF-%D8%A7%D9%84%D8%BA%D8%A7%D9%85%D8%AF%D9%8A-7ba023440', image: '' },
          { name: 'طيف سعد الغامدي', linkedin: 'https://www.linkedin.com/in/taif-alghamdi-82b184329', image: '' },
          { name: 'نواف بن عبدالله آل رشود', linkedin: 'https://www.linkedin.com/in/nafalrshoud', image: '' },
          { name: 'ريما زياد الخليفة', linkedin: 'https://www.linkedin.com/in/reema-alkhalifah-455969284', image: '' },
          { name: 'ناصر عبدالعزيز ناصر بن عمهوج', linkedin: '', image: '' },
          { name: 'هتون منصور اللحيدان', linkedin: '', image: '' },
        ],
      },
      {
        id: 'organizing',
        name: 'لجنة التنظيم',
        lead: { name: 'هدى فلاح الدلبحي', role: 'قائدة اللجنة', linkedin: 'https://www.linkedin.com/in/houda-aldalbahi-36bb63384', image: '' },
        deputy: null,
        members: [
          { name: 'صبا بندر السويلم', linkedin: '', image: '' },
          { name: 'مها عبداللطيف السهيل', linkedin: 'https://www.linkedin.com/in/maha-abdullatif-52735b3a8', image: '' },
          { name: 'هيا خالد بن شايع', linkedin: 'https://www.linkedin.com/in/haya-alshaya-09a973296', image: '' },
          { name: 'علي يزيد الشنيفي', linkedin: '', image: '' },
          { name: 'ريما الركابي', linkedin: 'https://www.linkedin.com/in/reema-al-rukabi-a70502396', image: '' },
          { name: 'راكان تميم العمري', linkedin: 'https://www.linkedin.com/in/rakan-alamri-65a99b378', image: '' },
          { name: 'شادن الرشود', linkedin: 'https://www.linkedin.com/in/shaden-alrshood-738a3b3a7', image: '' },
          { name: 'يزيد محمد النعمان', linkedin: 'https://www.linkedin.com/in/yazid-alnoman-6b078a404', image: '' },
          { name: 'دانه عبدالعزيز محمد الشمالي', linkedin: 'https://www.linkedin.com/in/danah-alshmali-5029bb2a4', image: '' },
          { name: 'غادة سعد الشهري', linkedin: '', image: '' },
          { name: 'وصايف عبدالعزيز الجبالي', linkedin: 'https://www.linkedin.com/in/wosayf-abdulaziz-87b100325', image: '' },
          { name: 'عبدالله علي المهوس', linkedin: 'https://www.linkedin.com/in/abdullah-almhos-062307417', image: '' },
          { name: 'محمد سلطان القحطاني', linkedin: 'https://www.linkedin.com/in/mohammed-al-qahtani-a9822b3a9', image: '' },
          { name: 'لينا محمد التويجري', linkedin: 'https://www.linkedin.com/in/leena-mohammed-1aa585432', image: '' },
          { name: 'إبراهيم محمد اللحيدان', linkedin: '', image: '' },
        ],
      },
    ],
  },
]

/* ---------- لجان تتبع الإدارة العليا مباشرة ---------- */
export const DIRECT_COMMITTEES: Committee[] = [
  {
    id: 'tech',
    name: 'لجنة المنصات والحلول التقنية',
    lead: { name: 'الجوهره محمد الداعج', role: 'قائدة اللجنة', linkedin: 'https://www.linkedin.com/in/aljoharh-aldaej-485203345', image: '' },
    deputy: null,
    members: [
      { name: 'ريهام سلام الخميس', linkedin: 'https://www.linkedin.com/in/reham-alkhamees-19232a413', image: '' },
      { name: 'ليان عبدالله السلوم', linkedin: 'https://www.linkedin.com/in/layan-abdullah-503055432', image: '' },
      { name: 'اريام عطاالله الشيباني', linkedin: 'https://www.linkedin.com/in/aryamata', image: '' },
    ],
  },
]