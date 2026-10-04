import RequestForm from '../components/RequestForm'

/* /partners/sponsorship-request — طلب رعاية
   The look lives in components/RequestForm; only the words are here. */

export default function SponsorshipRequestPage() {
  return (
    <RequestForm
      c={{
        crumb: 'طلب رعاية',
        title: 'طلب رعاية',
        intro: 'نرحب بالجهات الراغبة في دعم مبادرة مسار ورعاية فعالياتها وبرامجها. أكمل النموذج أدناه وسيتواصل معك الفريق.',
        detailsTitle: 'تفاصيل الرعاية',
        choiceLabel: 'نوع الدعم المقترح',
        choices: ['دعم مالي', 'دعم عيني', 'دعم خدمي', 'أخرى'],
        orgTypes: ['شركة خاصة', 'جهة حكومية', 'مؤسسة أكاديمية', 'منظمة غير ربحية', 'أخرى'],
        messagePlaceholder: 'اذكر أي تفاصيل إضافية حول طبيعة الدعم المقترح أو الفعاليات التي تودّون رعايتها...',
        submit: 'إرسال طلب الرعاية',
        thanks: 'شكرًا لدعمكم مبادرة مسار. سيقوم فريقنا بمراجعة طلبكم والتواصل معكم.',
      }}
    />
  )
}