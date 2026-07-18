/**
 * Default CMS documents for dedicated routes — mirrors current hardcoded copy.
 */

import type {
  BookingPageContent,
  ContactPageContent,
  EnquirePageContent,
  HomePageContent,
} from "@/content/types/dedicated-pages";
import { REVIEWS } from "@/data/reviews";
import { LIVE_SITE } from "@/lib/live-site";

/** Default homepage FAQ cards (string URLs only). */
const DEFAULT_HOME_FAQS = [
  {
    question: "How much does yoga teacher training cost in India?",
    answer:
      "Yoga teacher training in India typically costs between $700 and $1,800. At Nirvana, our 200-hour course starts at $649 all-inclusive — covering accommodation, three sattvic meals a day, course manual, excursions and Yoga Alliance certification.",
    image:
      "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=1200&auto=format&fit=crop&q=80",
    tag: "Pricing",
  },
  {
    question: "Which certification is best for yoga teachers?",
    answer:
      "Yoga Alliance USA is the most widely recognised yoga certification in the world. We offer RYT 200, RYT 300, and RYT 500-hour programs — all meeting international standards so you can teach confidently anywhere.",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=80",
    tag: "Certification",
  },
  {
    question: "Do I need prior yoga experience to join?",
    answer:
      "No advanced experience is required for our 200-hour foundational course. An open heart, basic familiarity with yoga, and the willingness to commit fully are all you need. Our courses gently guide you from the ground up.",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=80",
    tag: "Prerequisites",
  },
  {
    question: "What kind of food do you serve?",
    answer:
      "Three nourishing sattvic vegetarian meals daily, prepared fresh with Ayurvedic balance and cold-pressed sunflower oil. Vegan and gluten-free options are available on request — just let us know at registration.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&auto=format&fit=crop&q=80",
    tag: "Nutrition",
  },
  {
    question: "Why is Rishikesh called the yoga capital of the world?",
    answer:
      "Rishikesh is where ancient sages first practiced and taught yoga, on the banks of the Ganges and beneath the Himalayas. To this day seekers come here to feel its radiant spiritual energy and deep yogic culture firsthand.",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80",
    tag: "Heritage",
  },
  {
    question: "What does a typical day look like?",
    answer:
      "Days begin around 6am with meditation and pranayama, followed by Hatha or Ashtanga practice, breakfast, philosophy and anatomy classes, lunch, rest, alignment workshops, evening practice, satsang or kirtan, and dinner. Sundays are reserved for excursions and rest.",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80",
    tag: "Daily Vibe",
  },
];

/** Default homepage content_data document. */
export const DEFAULT_HOME_PAGE_CONTENT: HomePageContent = {
  kind: "home",
  hero: {
    badge: "Yoga Alliance Certified · India",
    titleLead: "Where ancient yoga meets the soul of the",
    titleAccent: "Himalayas",
    ctaLabel: "Explore Courses",
    ctaHref: "#courses",
    marqueeItems: [
      "5.0 ★ Google Reviews",
      "Yoga Alliance Certified",
      "5,000+ Students Trained",
      "50+ Countries Reached",
      "5.0 ★ Tripadvisor",
      "RYT 200 · 300 · 500",
    ],
    mobileTrust: [
      { value: "5.0★", label: "Rated" },
      { value: "5,000+", label: "Students" },
      { value: "50+", label: "Countries" },
    ],
    video: {
      mobileSrc: "/videos/videomobile.mp4",
      mobilePoster: "/videos/videomobile-poster.webp",
      desktopSrc: "/videos/videodesktop.mp4",
      desktopPoster: "/videos/videodesktop-poster.webp",
    },
  },
  welcome: {
    eyebrow: "Yoga Alliance Certified · India",
    title: "Welcome to Nirvana — a sanctuary for the soul in Rishikesh",
    lead: "Nestled in Tapovan, our ashram blends traditional Hatha, Ashtanga, and Vinyasa with sattvic living, philosophy, and the living presence of the Ganga.",
    highlights: [
      "Yoga Alliance RYS-200 · 300 · 500",
      "Residential & online programs",
      "Sattvic meals & ashram living",
      "Excursions, kirtan & Ganga aarti",
    ],
    rotatingStats: [
      { value: "10+", label: "Courses" },
      { value: "20+", label: "Teachers" },
      { value: "10+", label: "Years Experienced Teachers" },
      { value: "5", label: "Star Rating" },
    ],
    ctaLabel: "Discover our story",
    ctaHref: "/about-us",
    images: [
      {
        src: `${LIVE_SITE}/img/home/banner_3.webp`,
        alt: "Yoga practice at Nirvana Yoga School",
      },
      {
        src: `${LIVE_SITE}/img/home/banner_2.webp`,
        alt: "Sunrise yoga by the Ganges",
      },
      {
        src: `${LIVE_SITE}/img/home/banner_1.webp`,
        alt: "Meditation session at Nirvana Yoga School",
      },
    ],
    vision: {
      label: "01 / Our Vision",
      body: "Our vision is to share timeless yogic wisdom with sincerity, care, and devotion. From every breath, posture, and chant, we invite you into a life that feels complete, serene, and deeply aligned — rooted in tradition yet respectful of every individual journey.",
    },
    promise: {
      label: "02 / Our Promise",
      body: "Whether you join us for a foundational training or a deeper immersion, our intention remains steady: to hold the space for meaningful transformation. We welcome seekers from around the globe to walk with us on this journey — not as students but as co-travellers.",
    },
  },
  video: {
    eyebrow: "Watch",
    title: "Life inside the ashram",
    description: "A glimpse of practice, community, and the Himalayan valley.",
    youtubeUrls: [
      "https://youtu.be/PH2fv7TtRfc",
      "https://youtu.be/RqG48joKLp8",
      "https://youtu.be/Rcqr1gSe2uE",
      "https://youtu.be/TYal8a3zGow",
    ],
  },
  gallery: {
    eyebrow: "Campus & Culture",
    title: "Moments from Nirvana",
    description:
      "A glimpse into the daily rhythm, organic meals, clean accommodations, sacred ceremonies, and outdoor excursions that make up your yoga teacher training journey.",
    lightboxTitle: "Life at Nirvana",
    categories: [
      { id: "all", label: "All Images" },
      { id: "practice", label: "Yoga & Practice" },
      { id: "campus", label: "Campus & Food" },
      { id: "life", label: "Excursions & Life" },
    ],
    items: [
      {
        src: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&auto=format&fit=crop&q=80",
        alt: "Excursion in 200-Hour YTTC",
        title: "Weekend Excursions",
        category: "life",
      },
      {
        src: "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=800&auto=format&fit=crop&q=80",
        alt: "Opening ceremony of yoga teacher training course",
        title: "Opening Fire Ceremony (Havan)",
        category: "life",
      },
      {
        src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80",
        alt: "Beach yoga in Rishikesh",
        title: "Ganga Beach Yoga Sessions",
        category: "practice",
      },
      {
        src: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80",
        alt: "Food at Nirvana yoga school, Rishikesh",
        title: "Nourishing Sattvic Food",
        category: "campus",
      },
      {
        src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80",
        alt: "Hatha yoga class of 200-hour yoga teacher training",
        title: "Traditional Hatha Yoga Class",
        category: "practice",
      },
      {
        src: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&auto=format&fit=crop&q=80",
        alt: "Pranayama (breathwork) practice class",
        title: "Pranayama & Breathwork",
        category: "practice",
      },
      {
        src: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&auto=format&fit=crop&q=80",
        alt: "Trataka meditation",
        title: "Trataka (Candle Gazing)",
        category: "practice",
      },
      {
        src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80",
        alt: "Private balcony room accommodation at Nirvana yoga school",
        title: "Private Balcony Room",
        category: "campus",
      },
      {
        src: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&auto=format&fit=crop&q=80",
        alt: "Shatkarma practice in 200 hour Yoga TTC",
        title: "Shatkarma (Yogic Cleansing)",
        category: "practice",
      },
      {
        src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80",
        alt: "Student celebration at Nirvana yoga school",
        title: "Kirtan & Celebration",
        category: "life",
      },
      {
        src: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&auto=format&fit=crop&q=80",
        alt: "Sound healing session",
        title: "Sacred Sound Healing",
        category: "practice",
      },
      {
        src: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&auto=format&fit=crop&q=80",
        alt: "Dinner at Nirvana yoga school",
        title: "Sattvic Vegetarian Buffet",
        category: "campus",
      },
      {
        src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
        alt: "Sunrise excursion during yoga course in Rishikesh",
        title: "Himalayan Sunrise Excursion",
        category: "life",
      },
      {
        src: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&auto=format&fit=crop&q=80",
        alt: "Outdoor yoga class",
        title: "Outdoor Yoga Sessions",
        category: "practice",
      },
      {
        src: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80",
        alt: "4-sharing dorm accommodation",
        title: "Spacious Dorm Accommodation",
        category: "campus",
      },
      {
        src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80",
        alt: "Yoga philosophy class",
        title: "Yoga Philosophy & Satsang",
        category: "practice",
      },
      {
        src: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&auto=format&fit=crop&q=80",
        alt: "Certification ceremony of yoga teacher training course",
        title: "Graduation Ceremony",
        category: "life",
      },
      {
        src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=80",
        alt: "Outdoor yoga philosophy class",
        title: "Outdoor Philosophy Discussion",
        category: "practice",
      },
      {
        src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
        alt: "Candle light dinner at Nirvana yoga school",
        title: "Special Candlelight Dinner",
        category: "campus",
      },
      {
        src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop&q=80",
        alt: "Ganga beach yoga",
        title: "Yoga by the River Ganges",
        category: "practice",
      },
      {
        src: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800&auto=format&fit=crop&q=80",
        alt: "Dining hall of Nirvana yoga school, Rishikesh",
        title: "Community Dining Hall",
        category: "campus",
      },
      {
        src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
        alt: "Certification ceremony of 300-hour yoga teacher training",
        title: "Graduation Celebration",
        category: "life",
      },
      {
        src: "https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?w=800&auto=format&fit=crop&q=80",
        alt: "Yoga Nidra session",
        title: "Yoga Nidra & Relaxation",
        category: "practice",
      },
      {
        src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80",
        alt: "Ashtanga Vinyasa yoga practice session",
        title: "Ashtanga Vinyasa Flow",
        category: "practice",
      },
      {
        src: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop&q=80",
        alt: "2-sharing balcony room accommodation",
        title: "Shared Room with Balcony",
        category: "campus",
      },
      {
        src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80",
        alt: "Students of Nirvana yoga school, India",
        title: "Global Yogic Community",
        category: "life",
      },
      {
        src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80",
        alt: "Students of Nirvana yoga school, Rishikesh",
        title: "Lifetime Connections",
        category: "life",
      },
      {
        src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80",
        alt: "Yoga anatomy class",
        title: "Functional Yoga Anatomy",
        category: "practice",
      },
    ],
  },
  whyRishikesh: {
    eyebrow: "The Yoga Capital of the World",
    title: "Why learn yoga in",
    titleAccent: "Rishikesh",
    description: "— where earth, sky, and spirit meet",
    youtubeUrl: "https://www.youtube.com/watch?v=_NOezBf-LYs",
    trustLogos: [
      {
        src: "/images/logos/yoga-alliance.png",
        alt: "Yoga Alliance Certified",
      },
      {
        src: "/images/logos/ayush.png",
        alt: "Ministry of AYUSH, Government of India",
      },
      {
        src: "/images/logos/yai.png",
        alt: "Yoga Alliance International",
      },
    ],
    sutras: [
      {
        title: "A Sacred Rhythm",
        body: "There is a sacred rhythm in Rishikesh that cannot be explained but must be felt. It lives in the crispness of the morning air, hums in the silence between the ringing of temple bells, and moves rhythmically in the gentle flow of the river Ganga. For centuries, seekers from all over the world have come here in the drawing of something beyond words. To learn yoga in Rishikesh is to become part of that ancient stream of wisdom, healing, and inner peace.",
      },
      {
        title: "Remembering Who You Are",
        body: "Yoga in India is another way of remembering who you truly are. Sitting here in the serene Himalayan foothills and being immersed in the spiritual undercurrent of this holy land, your yoga practice transcends the physical. The asanas start to stir something within; the breathing turns from unconscious to a prayer; the meditation deepens into stillness, as if the very mountains are meditating with you.",
      },
      {
        title: "The Sages' Presence",
        body: "The energy of this land holds the memory of sages who walked here before us — those silent saints who sat by the river and dissolved the limits between self and universe. When you sit beside the Ganga at sunrise or bring your voice in chanting, you find yourself feeling light, clear, and alive. It isn't a spell — it's presence, and Rishikesh can bring you home to it.",
      },
    ],
    closingInvitation:
      "So come… for we warmly invite you to experience it yourself. Walk with us on the banks of this sacred river. Breathe with the mountains. Let Rishikesh remind you of your wholeness, of your stillness, and the vast, beautiful peace that lies within you.",
    videoCard: {
      eyebrow: "Guru Ji's Wisdom",
      title: "Spiritual Guidance with Gurudev",
      speakerTag: "Gurudev Dhruvaji",
      speakerSubtitle: "Founder & Spiritual Master · Nirvana Yoga School",
    },
  },
  courses: {
    eyebrow: "Residential YTT in Rishikesh, India",
    title: "Yoga Teacher Training in Rishikesh.",
    description:
      "Beyond mere certifications — life-changing journeys into the heart of yoga. Yoga Alliance-accredited programs blending ancient wisdom with holistic guidance.",
    cards: [
      {
        title: "200 Hour Hatha, Ashtanga & Vinyasa Yoga Teacher Training",
        duration: "25 Days",
        level: "Beginner to Intermediate",
        certification: "RYT-200, Yoga Alliance",
        fee: "649 USD",
        image:
          "https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&auto=format&fit=crop&q=80",
        certBadge: `${LIVE_SITE}/img/ryt200.webp`,
        href: "/course/200-hour-yoga-teacher-training-in-rishikesh-india",
        highlights: [
          "Ashtanga Primary Series",
          "Traditional Hatha",
          "Adjustment & Alignment",
          "Pranayama & Bandhas",
        ],
      },
      {
        title: "200 Hour Ayurveda & Hatha Yoga Teacher Training",
        duration: "25 Days",
        level: "Beginner to Intermediate",
        certification: "RYT-200, Yoga Alliance",
        fee: "649 USD",
        image:
          "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&auto=format&fit=crop&q=80",
        certBadge: `${LIVE_SITE}/img/ryt200.webp`,
        href: "/course/200-hour-ayurveda-yoga-teacher-training-in-rishikesh-india",
        highlights: [
          "Ayurvedic Constitution (Prakriti)",
          "Panchakarma Basics",
          "Ayurvedic Nutrition",
          "Therapeutic Hatha Yoga",
        ],
      },
      {
        title:
          "200 Hour Meditation, Yoga Nidra & Hatha Yoga Teacher Training",
        duration: "25 Days",
        level: "Beginner to Intermediate",
        certification: "RYT-200, Yoga Alliance",
        fee: "649 USD",
        image:
          "https://images.unsplash.com/photo-1528319725582-ddc096101511?w=800&auto=format&fit=crop&q=80",
        certBadge: `${LIVE_SITE}/img/ryt200.webp`,
        href: "/course/200-hour-meditation-teacher-training-in-rishikesh-india",
        highlights: [
          "Meditation Techniques",
          "Yoga Nidra Scripting",
          "Chakra & Kundalini Theory",
          "Shatkarma Cleansings",
        ],
      },
      {
        title: "200 Hour Kundalini & Hatha Yoga Teacher Training",
        duration: "25 Days",
        level: "Beginner to Intermediate",
        certification: "RYT-200, Yoga Alliance",
        fee: "649 USD",
        image:
          "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80",
        certBadge: `${LIVE_SITE}/img/ryt200.webp`,
        href: "/course/200-hour-kundalini-yoga-teacher-training-in-rishikesh-india",
        highlights: [
          "Kriya & Energy Channels",
          "Chakra Activation",
          "Mantra & Sound Healing",
          "Kundalini Tantra Philosophy",
        ],
      },
      {
        title:
          "300 Hour Hatha, Ashtanga, Vinyasa & Ayurveda Teacher Training",
        duration: "29 Days",
        level: "Intermediate to Advanced",
        certification: "RYT-300, Yoga Alliance",
        fee: "From 899 USD",
        image:
          "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&auto=format&fit=crop&q=80",
        certBadge: `${LIVE_SITE}/img/ryt300.webp`,
        href: "/course/300-hour-yoga-teacher-training-in-rishikesh-india",
        highlights: [
          "Advanced Asanas & Adjustments",
          "Advanced Ayurveda Therapy",
          "Yoga Sutra Deep Dive",
          "Teaching Methodology",
        ],
      },
      {
        title:
          "500 Hour Comprehensive Hatha, Ashtanga & Ayurveda Teacher Training",
        duration: "59 Days",
        level: "Beginner to Advanced",
        certification: "RYT-500, Yoga Alliance",
        fee: "From 1449 USD",
        image:
          "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&auto=format&fit=crop&q=80",
        certBadge: `${LIVE_SITE}/img/ryt500.webp`,
        href: "/course/500-hour-yoga-teacher-training-in-rishikesh-india",
        highlights: [
          "Master Class Pedagogy",
          "Complete Sanskrit Studies",
          "Clinical Ayurveda Application",
          "Intensive Meditation Retreat",
        ],
      },
    ],
  },
  yogaAlliance: {
    eyebrow: "Globally Accredited RYS",
    title: "Yoga Alliance Certification — Globally Recognized Credentials",
    description: "RYS 200, 300, and 500 pathways recognised worldwide.",
    badgeLabel: "Yoga Alliance USA",
    sealEyebrow: "Official Standards",
    sealTitle: "RYS 200 • RYS 300 • RYS 500 Registered",
    lead: "Nirvana Yoga School is a registered yoga school (RYS 200, 300, 500) situated in Rishikesh, certified by Yoga Alliance USA.",
    body: "Our credentials allow you to teach yoga with confidence anywhere in the world. Each curriculum is designed carefully with proper traditional knowledge, safety standards, and personal transformation. Here, certification is more than just paper—you truly live and become a yogi.",
    certifications: [
      {
        hours: "200",
        title: "RYS 200 Certification",
        level: "Foundational Path",
        description:
          "Ideal for students who are new to yoga or wish to expand their knowledge of the discipline. The principles of yoga philosophy, anatomy, asana, pranayama, meditation, and teaching methodology are covered. Build a safe, effective, and confidence-driven teaching foundation.",
        href: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85",
        iconKey: "leaf",
      },
      {
        hours: "300",
        title: "RYS 300 Certification",
        level: "Advanced Training",
        description:
          "For yogis who have already completed an RYS 200 course and wish to deepen their teaching skills. This curriculum delves into advanced yoga sequencing, adjustments, therapeutic applications, and alignment, enabling you to teach with deep authority and experience.",
        href: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1600&q=85",
        iconKey: "compass",
      },
      {
        hours: "500",
        title: "RYS 500 Certification",
        level: "Master Teacher Path",
        description:
          "A comprehensive combination of RYS 200 and RYS 300 courses. This course offers extensive study and practice covering beginner to advanced levels. Graduate with the highest level of yoga teacher credentials possible and be fully prepared to teach globally.",
        href: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1600&q=85",
        iconKey: "certificate",
      },
    ],
  },
  teachersTeaser: {
    eyebrow: "Our Faculty",
    title: "Learn from traditional teachers",
    description:
      "Meet the mentors who guide practice, philosophy, and teaching skills on every residential and online path.",
    ctaLabel: "Meet All Gurus",
    ctaHref: "/teacher",
  },
  testimonials: {
    eyebrow: "Testimonials",
    title: "What Students Say About Nirvana Yoga School",
    description:
      "Read the authentic transformation stories of practitioners from all corners of the globe who completed their lineages here.",
    reviews: REVIEWS.map((r) => ({ ...r })),
  },
  map: {
    eyebrow: "Visit",
    title: "Find us in Tapovan, Rishikesh",
    description: "Nirvana Yoga School — steps from the Ganga.",
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958!2d78.317539!3d30.134671!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390917086b26bdc1%3A0x2b53a8c169c9e93c!2sNirvana%20Yoga%20School!5e1!3m2!1sen!2sin!4v1718600000000!5m2!1sen!2sin",
    iframeTitle: "Nirvana Yoga School — Tapovan, Rishikesh",
    show: true,
  },
  faqs: {
    eyebrow: "Questions, answered",
    title: "Frequently asked",
    faqs: DEFAULT_HOME_FAQS,
  },
  finalCta: {
    pill: "Limited spots · 25% early-bird saving",
    title: "Your journey begins",
    titleAccent: "when you arrive.",
    lead: "Reach out today — we'll answer every question and help you choose the path that's right for you. No pressure, only presence.",
    primaryLabel: "Apply Now",
    primaryHref: "#courses",
    secondaryLabel: "Chat on WhatsApp",
    secondaryHref: "https://wa.me/918218564835",
    image:
      "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=2000&auto=format&fit=crop&q=80",
    imageAlt: "Sunrise yoga practice on the banks of the Ganges",
  },
  seo: {
    organization: {
      sameAs: [
        "https://www.instagram.com/nirvanayogaschool",
        "https://www.facebook.com/nirvanayogaschool",
        "https://www.youtube.com/@nirvanayogaschool",
      ],
    },
    localBusiness: {
      priceRange: "$649 - $1449",
      streetAddress: "Tapovan",
      addressLocality: "Rishikesh",
      addressRegion: "Uttarakhand",
      postalCode: "249192",
      addressCountry: "IN",
      ratingValue: "5.0",
      reviewCount: "500",
    },
  },
};

/** Default contact page content_data document. */
export const DEFAULT_CONTACT_PAGE_CONTENT: ContactPageContent = {
  kind: "contact",
  hero: {
    image: "/img/retreat-venue/private/1.webp",
    eyebrow: "Get In Touch",
    title: "We are here to support your journey",
    lead: "Questions about yoga teacher training, retreats, accommodation, or travel to Rishikesh? Our ashram team replies within 24 hours.",
  },
  details: [
    {
      title: "Ashram Location",
      value: "Tapovan, Rishikesh, Uttarakhand 249137, India",
      href: "https://maps.google.com/?q=Nirvana+Yoga+School+Rishikesh",
      actionText: "View on Google Maps →",
      iconKey: "maps",
    },
    {
      title: "WhatsApp & Call Support",
      value: "+91 82185 64835",
      href: "https://wa.me/918218564835",
      actionText: "Chat on WhatsApp →",
      iconKey: "whatsapp",
    },
    {
      title: "Direct Email Support",
      value: "hello@nirvanayogaschoolindia.com",
      href: "mailto:hello@nirvanayogaschoolindia.com",
      actionText: "Send email support →",
      iconKey: "email",
    },
  ],
  form: {
    eyebrow: "Contact Details",
    title: "Connect with Nirvana",
    lead: "Whether you are planning your travel arrival to Tapovan or inquiring about syllabus details, we look forward to greeting you.",
    submitLabel: "Send Message",
  },
  map: { show: true },
};

/** Default enquire-now content_data document. */
export const DEFAULT_ENQUIRE_PAGE_CONTENT: EnquirePageContent = {
  kind: "enquire",
  hero: {
    image: "/img/retreat-venue/private/2.webp",
    eyebrow: "Apply & Enquire",
    title: "Begin your enquiry",
    lead: "Reserve your interest in yoga teacher training, retreats, or online courses. Our ashram team will guide you through dates, fees, and accommodation.",
  },
  steps: [
    {
      step: "01",
      title: "Share your details",
      body: "Tell us which program interests you, your preferred dates, and room preference.",
    },
    {
      step: "02",
      title: "Ashram coordinator replies",
      body: "We respond within 24 hours by email or WhatsApp with dates, fees, and next steps.",
    },
    {
      step: "03",
      title: "Reserve your place",
      body: "Confirm your batch and accommodation to secure your spot in Tapovan, Rishikesh.",
    },
  ],
  form: {
    eyebrow: "How it works",
    title: "Your path to Rishikesh",
    lead: "Share a few details and our coordinators will help you choose the right program, batch dates, and room type for your stay in Tapovan.",
    submitLabel: "Submit Enquiry",
  },
  map: { show: true },
};

/** Default booking page content_data document. */
export const DEFAULT_BOOKING_PAGE_CONTENT: BookingPageContent = {
  kind: "booking",
  hero: {
    image: "/img/retreat-venue/private/1.webp",
    eyebrow: "Booking",
    title: "Reserve Your Journey",
    lead: "Begin your transformative yoga experience at Nirvana Yoga School. Pay securely with PayPal — 20% deposit or full payment.",
  },
  steps: [
    {
      step: "01",
      title: "Choose your program",
      body: "Select your preferred course, start date, and accommodation.",
    },
    {
      step: "02",
      title: "Share your details",
      body: "Tell us how to contact you and choose your payment option.",
    },
    {
      step: "03",
      title: "Secure your place",
      body: "Pay a 20% deposit or the full fee securely with PayPal.",
    },
  ],
  form: {
    eyebrow: "Booking",
    title: "Reserve your place",
    lead: "Choose your program, accommodation, and preferred dates to continue.",
    submitLabel: "Continue to payment",
  },
  map: { show: false },
};
