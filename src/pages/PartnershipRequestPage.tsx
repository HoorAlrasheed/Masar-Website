import RequestForm from '../components/RequestForm'

/* /partners/partnership-request — طلب شراكة
   The look lives in components/RequestForm; only the words are here. */

export default function PartnershipRequestPage() {
  return (
    <RequestForm
      c={{
        crumb: 'طلب شراكة',
        title: 'طلب شراكة',
        intro: 'يسعدنا الترحيب بالجهات الراغبة في الشراكة مع مبادرة مسار. أكمل النموذج أدناه وسيتواصل معك الفريق.',
        detailsTitle: 'تفاصيل الشراكة',
        choiceLabel: 'نوع الشراكة المقترحة',
        choices: ['شريك استراتيجي', 'شريك إعلامي', 'شريك ضيافة', 'شريك مساحة', 'أخرى'],
        orgTypes: ['شركة خاصة', 'جهة حكومية', 'مؤسسة أكاديمية', 'جهة إعلامية', 'منظمة غير ربحية', 'أخرى'],
        messagePlaceholder: 'اذكر أي تفاصيل تودّون إضافتها حول طبيعة الشراكة المقترحة أو توقعاتكم منها...',
        submit: 'إرسال طلب الشراكة',
        thanks: 'شكرًا لاهتمامكم بالشراكة مع مبادرة مسار. سيقوم فريقنا بمراجعة طلبكم والتواصل معكم.',
      }}
    />
  )
}