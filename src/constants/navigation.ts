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
  { type: "link", label: "HOME", href: "/" },
  {
    type: "dropdown",
    label: "YOGA COURSES",
    items: [
      {
        label:
          "200 Hour Hatha Ashtanga Vinyasa Yoga Teacher Training in Rishikesh India",
        href: "/200-hour-yoga-teacher-training-in-rishikesh-india",
      },
      {
        label:
          "200 Hour Ayurveda Hatha Yoga Teacher Training in Rishikesh, India",
        href: "/200-hour-ayurveda-yoga-teacher-training-in-rishikesh-india",
      },
      {
        label:
          "200 Hour Meditation Yoga Nidra & Hatha Yoga Teacher Training in Rishikesh India",
        href: "/200-hour-meditation-teacher-training-in-rishikesh-india",
      },
      {
        label:
          "200 Hour Kundalini Hatha Yoga Teacher Training in Rishikesh India",
        href: "/200-hour-kundalini-yoga-teacher-training-in-rishikesh-india",
      },
      {
        label:
          "300 Hour Hatha Ashtanga Vinyasa Ayurveda Yoga Therapy Teacher Training In Rishikesh India",
        href: "/300-hour-yoga-teacher-training-in-rishikesh-india",
      },
      {
        label:
          "500 Hour Hatha Ashtanga Vinyasa Ayurveda Yoga Therapy Teacher Training in Rishikesh, India",
        href: "/500-hour-yoga-teacher-training-in-rishikesh-india",
      },
      {
        label: "Yin Yoga Teacher Training in Rishikesh India",
        href: "/yin-yoga-teacher-training-in-rishikesh-india",
      },
      {
        label: "Sound Healing Course in Rishikesh India",
        href: "/sound-healing-course-in-rishikesh-india",
      },
      {
        label:
          "Kirtan, Vocal & Instrumental Music Training in Rishikesh, India",
        href: `${SITE}/kirtan-vocal-and-instrumental-music-training`,
        external: true,
      },
      {
        label: "SEE ALL OTHER COURSES",
        href: `${SITE}/yoga-teacher-training-in-rishikesh-india`,
        external: true,
      },
    ],
  },
  {
    type: "dropdown",
    label: "ONLINE COURSES",
    href: `${SITE}/online-yoga-teacher-training-courses`,
    external: true,
    items: [
      {
        label:
          "200 Hour Online Hatha Ashtanga Vinyasa Yoga Teacher Training Course",
        href: `${SITE}/200-hour-online-yoga-teacher-training`,
        external: true,
      },
      {
        label: "200 Hour Online Ayurveda & Hatha Yoga Teacher Training Course",
        href: `${SITE}/online-200-hour-ayurveda-yoga-teacher-training-course`,
        external: true,
      },
      {
        label:
          "200 Hour Online Meditation Yoga Nidra & Hatha Yoga Teacher Training Course",
        href: `${SITE}/online-200-hour-meditation-yoga-nidra-teacher-training-course`,
        external: true,
      },
      {
        label: "100 Hour Online Yin Yoga Teacher Training Course",
        href: `${SITE}/online-100-hour-yin-yoga-teacher-training-course`,
        external: true,
      },
      {
        label: "SEE ALL OTHER ONLINE COURSES",
        href: `${SITE}/online-yoga-teacher-training-courses`,
        external: true,
      },
    ],
  },
  {
    type: "dropdown",
    label: "RETREATS",
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
  {
    type: "link",
    label: "TEACHERS",
    href: `${SITE}/teacher`,
    external: true,
  },
  {
    type: "dropdown",
    label: "VENUE",
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
    label: "BLOG",
    href: `${SITE}/blog`,
    external: true,
  },
  {
    type: "link",
    label: "CONTACT",
    href: `${SITE}/contact`,
    external: true,
  },
];

export const SIGN_IN_URL =
  "https://onlinecourses.nirvanayogaschoolindia.com/users/sign_in";
