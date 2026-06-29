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
        href: "/kirtan-vocal-and-instrumental-music-training",
      },
      {
        label: "SEE ALL OTHER COURSES",
        href: "/yoga-teacher-training-in-rishikesh-india",
      },
    ],
  },
  {
    type: "dropdown",
    label: "ONLINE COURSES",
    href: "/online-yoga-teacher-training-courses",
    items: [
      {
        label:
          "200 Hour Online Hatha Ashtanga Vinyasa Yoga Teacher Training Course",
        href: "/200-hour-online-yoga-teacher-training",
      },
      {
        label: "200 Hour Online Ayurveda & Hatha Yoga Teacher Training Course",
        href: "/online-200-hour-ayurveda-yoga-teacher-training-course",
      },
      {
        label:
          "200 Hour Online Meditation Yoga Nidra & Hatha Yoga Teacher Training Course",
        href: "/online-200-hour-meditation-yoga-nidra-teacher-training-course",
      },
      {
        label: "100 Hour Online Yin Yoga Teacher Training Course",
        href: "/online-100-hour-yin-yoga-teacher-training-course",
      },
      {
        label: "SEE ALL OTHER ONLINE COURSES",
        href: "/online-yoga-teacher-training-courses",
      },
    ],
  },
  {
    type: "dropdown",
    label: "RETREATS",
    items: [
      {
        label: "3-Day Yoga Meditation Ayurveda Wellness Retreat",
        href: "/3-day-yoga-retreat-in-rishikesh-india",
      },
      {
        label: "5-Day Yoga Meditation Ayurveda Wellness Retreat",
        href: "/5-day-yoga-retreat-in-rishikesh-india",
      },
      {
        label: "7-Day Yoga Meditation Ayurveda Wellness Retreat",
        href: "/7-day-yoga-retreat-in-rishikesh-india",
      },
    ],
  },
  {
    type: "link",
    label: "TEACHERS",
    href: "/teacher",
  },
  {
    type: "dropdown",
    label: "VENUE",
    items: [
      {
        label: "Course Venue",
        href: "/gallery",
      },
      {
        label: "Retreat Venue",
        href: "/retreat-venue",
      },
    ],
  },
  {
    type: "link",
    label: "BLOG",
    href: "/blog",
  },
  {
    type: "link",
    label: "CONTACT",
    href: "/contact",
  },
];

export const SIGN_IN_URL =
  "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=1600&q=85";
