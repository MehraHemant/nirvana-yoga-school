export type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type NavItem =
  | {
      type: "link";
      label: string;
      href: string;
      external?: boolean;
    }
  | {
      type: "dropdown";
      label: string;
      href?: string;
      external?: boolean;
      items: NavLink[];
    };

const SITE = "https://www.nirvanayogaschoolindia.com";

/** Primary nav — mirrored from nirvanayogaschoolindia.com header (2026-05-26). */
export const PRIMARY_NAV: NavItem[] = [
  { type: "link", label: "Home", href: "/" },
  {
    type: "dropdown",
    label: "Yoga Courses",
    items: [
      {
        label: "200 Hour Hatha Ashtanga Vinyasa YTT",
        href: `${SITE}/200-hour-yoga-teacher-training-in-rishikesh-india`,
        external: true,
      },
      {
        label: "200 Hour Ayurveda & Hatha YTT",
        href: `${SITE}/200-hour-ayurveda-yoga-teacher-training-in-rishikesh-india`,
        external: true,
      },
      {
        label: "200 Hour Meditation, Yoga Nidra & Hatha YTT",
        href: `${SITE}/200-hour-meditation-teacher-training-in-rishikesh-india`,
        external: true,
      },
      {
        label: "200 Hour Kundalini & Hatha YTT",
        href: `${SITE}/200-hour-kundalini-yoga-teacher-training-in-rishikesh-india`,
        external: true,
      },
      {
        label: "300 Hour Advanced YTT",
        href: `${SITE}/300-hour-yoga-teacher-training-in-rishikesh-india`,
        external: true,
      },
      {
        label: "500 Hour Master's YTT",
        href: `${SITE}/500-hour-yoga-teacher-training-in-rishikesh-india`,
        external: true,
      },
      {
        label: "Yin Yoga Teacher Training",
        href: `${SITE}/yin-yoga-teacher-training-in-rishikesh-india`,
        external: true,
      },
      {
        label: "Sound Healing Course",
        href: `${SITE}/sound-healing-course-in-rishikesh-india`,
        external: true,
      },
      {
        label: "See all other courses",
        href: `${SITE}/yoga-teacher-training-in-rishikesh-india`,
        external: true,
      },
    ],
  },
  {
    type: "dropdown",
    label: "Online Courses",
    href: `${SITE}/online-yoga-teacher-training-courses`,
    external: true,
    items: [
      {
        label: "200 Hour Online Hatha Ashtanga Vinyasa YTT",
        href: `${SITE}/200-hour-online-yoga-teacher-training`,
        external: true,
      },
      {
        label: "200 Hour Online Ayurveda & Hatha YTT",
        href: `${SITE}/online-200-hour-ayurveda-yoga-teacher-training-course`,
        external: true,
      },
      {
        label: "200 Hour Online Meditation & Yoga Nidra YTT",
        href: `${SITE}/online-200-hour-meditation-yoga-nidra-teacher-training-course`,
        external: true,
      },
      {
        label: "100 Hour Online Yin Yoga YTT",
        href: `${SITE}/online-100-hour-yin-yoga-teacher-training-course`,
        external: true,
      },
      {
        label: "See all other online courses",
        href: `${SITE}/online-yoga-teacher-training-courses`,
        external: true,
      },
    ],
  },
  {
    type: "dropdown",
    label: "Retreats",
    items: [
      {
        label: "3-Day Yoga Meditation Ayurveda Wellness Retreat",
        href: `${SITE}/3-day-yoga-retreat-in-rishikesh-india`,
        external: true,
      },
      {
        label: "5-Day Yoga Meditation Ayurveda Wellness Retreat",
        href: `${SITE}/5-day-yoga-retreat-in-rishikesh-india`,
        external: true,
      },
      {
        label: "7-Day Yoga Meditation Ayurveda Wellness Retreat",
        href: `${SITE}/7-day-yoga-retreat-in-rishikesh-india`,
        external: true,
      },
    ],
  },
  { type: "link", label: "Teachers", href: "#teachers" },
  {
    type: "dropdown",
    label: "Venue",
    items: [
      {
        label: "Course Venue",
        href: `${SITE}/gallery`,
        external: true,
      },
      {
        label: "Retreat Venue",
        href: `${SITE}/retreat-venue`,
        external: true,
      },
    ],
  },
  {
    type: "link",
    label: "Blog",
    href: `${SITE}/blog`,
    external: true,
  },
  { type: "link", label: "Contact", href: "#contact" },
];

export const SIGN_IN_URL =
  "https://onlinecourses.nirvanayogaschoolindia.com/users/sign_in";
