/* =================================================================
   مميز الشهر — the ONLY file to edit each month.
   1) Replace the photo file:  src/imports/featured-of-month.jpg
      (keep the same file name, or change the import below).
   2) Update the fields below.
   ================================================================= */

import featuredImage from '../imports/featured-of-month.jpg'

export const FEATURED = {
  /** Full name, shown under the photo and in the details page */
  fullName: 'حور ياسر الرشيد',

  /** Department / role, shown in the details page */
  department: 'نائبة مبادرة مسار',

  /** Full LinkedIn profile link */
  linkedin:
    'https://www.linkedin.com/in/hoor-alrasheed-676b27331?utm_source=share_via&utm_content=profile&utm_medium=member_ios',

  image: featuredImage,

  /** Where the person stands in the photo, as a % from the LEFT edge
      (0 = far left, 50 = center, 100 = far right). The thread of light,
      the reveal slit and the mobile crop all aim at this point.
      For this month's photo the person is at about 73. */
  focusX: 73,
}