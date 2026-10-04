/* =================================================================
   مسار — official channels, shared by the Footer and the /contact page
   (one place to edit a handle or the email).
   ================================================================= */

export const OFFICIAL_EMAIL = 'masar@iu.edu.sa'

export type SocialKey = 'instagram' | 'x' | 'linkedin'

export const SOCIALS: Array<{ key: SocialKey; label: string; handle: string; href: string }> = [
  {
    key: 'instagram',
    label: 'Instagram',
    handle: '@masariniti',
    href: 'https://www.instagram.com/masariniti',
  },
  {
    key: 'x',
    label: 'X',
    handle: '@masariniti',
    href: 'https://x.com/masariniti?s=11',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    handle: 'مبادرة مسار',
    href: 'https://www.linkedin.com/company/masar-initiative-i-%D9%85%D8%A8%D8%A7%D8%AF%D8%B1%D8%A9-%D9%85%D8%B3%D8%A7%D8%B1',
  },
]