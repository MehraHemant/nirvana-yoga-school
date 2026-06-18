export interface CourseSyllabusSection {
  title: string;
  description: string;
  subtopics: string[];
}

export interface CourseScheduleItem {
  time: string;
  activity: string;
}

export interface CoursePricingOption {
  roomType: string;
  price: string;
  description: string;
  features: string[];
}

export interface CourseFAQItem {
  question: string;
  answer: string;
}

export interface CourseData {
  slug: string;
  title: string;
  subtitle: string;
  level: string;
  duration: string;
  certification: string;
  fee: string;
  image: string;
  certBadge: string;
  heroImages?: string[];
  overview: string;
  highlights: string[];
  syllabusDescription: string;
  syllabus: CourseSyllabusSection[];
  scheduleDescription: string;
  schedule: CourseScheduleItem[];
  pricingDescription: string;
  pricing: CoursePricingOption[];
  inclusions: string[];
  exclusions: string[];
  faqs: CourseFAQItem[];
}

const SITE = "https://www.nirvanayogaschoolindia.com";

export const COURSES_DATA: Record<string, CourseData> = {
  "200-hour-yoga-teacher-training-in-rishikesh-india": {
    slug: "200-hour-yoga-teacher-training-in-rishikesh-india",
    title: "200 Hour Hatha, Ashtanga & Vinyasa Yoga Teacher Training",
    subtitle:
      "Our flagship Yoga Alliance certified residential teacher training in the yoga capital of the world.",
    level: "Beginner to Intermediate",
    duration: "25 Days",
    certification: "RYT-200, Yoga Alliance",
    fee: "From 649 USD",
    image:
      "https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=1200&auto=format&fit=crop&q=80",
    certBadge: `${SITE}/img/ryt200.webp`,
    heroImages: [
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/DSC01558.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6821981f671d8.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6821971ac7faf.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6821971ac8220.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6821971ac7cc5.webp",
    ],
    overview:
      "This 200-Hour Yoga Teacher Training is a comprehensive, life-transforming program designed for those who want to deepen their personal practice and gain the skills, confidence, and certification required to teach yoga globally. Anchored in traditional Hatha, dynamic Ashtanga, and flow-based Vinyasa, this course bridges ancient lineage with modern instruction under the guidance of Himalayan masters.",
    highlights: [
      "Ashtanga Vinyasa Primary Series layout & self-practice",
      "Traditional Hatha Yoga alignment & sequencing principles",
      "Comprehensive Yoga Anatomy, Physiology & Bio-mechanics",
      "Patanjali Yoga Sutras & historical lineage deep dive",
    ],
    syllabusDescription:
      "Our curriculum is structured to cover the 5 core elements of Yoga Alliance standards, ensuring a holistic understanding of both the art and science of yoga.",
    syllabus: [
      {
        title: "Asana Practice & Alignment",
        description:
          "Focus on primary series of Ashtanga Vinyasa and traditional Hatha Yoga. Learn correct alignment, keys to posture adjustments, and modifications.",
        subtopics: [
          "Sun Salutations (Surya Namaskar A & B)",
          "Standing, Sitting, & Inverted Asanas",
          "Hands-on adjustments & alignment workshops",
          "Preventing injuries & utilizing yoga props",
        ],
      },
      {
        title: "Pranayama & Shatkarma (Breathing & Cleansing)",
        description:
          "Explore the science of breath control and purification techniques to prepare the body and mind for deeper meditation.",
        subtopics: [
          "Nadi Shodhana, Kapalbhati, Bhastrika & Ujjayi",
          "Bandhas (Energy locks): Jalandhara, Uddiyana, Mula",
          "Jala Neti and Sutra Neti cleansing processes",
          "Pranic energy channels (Nadis) & Prana Vayus",
        ],
      },
      {
        title: "Yoga Anatomy & Physiology",
        description:
          "Study the physiological effects of yoga on the human skeletal, muscular, respiratory, cardiovascular, and nervous systems.",
        subtopics: [
          "Skeletal and muscular systems in relation to Asana",
          "Biomechanics of stretching and joint movement",
          "The physiology of breathing and yogic relaxation",
          "Anatomy of the energetic body: Chakras and Nadis",
        ],
      },
      {
        title: "Yoga Philosophy & Ethics",
        description:
          "Delve into the foundational texts and philosophy that underpin the spiritual practice of yoga.",
        subtopics: [
          "Introduction to Patanjali's Yoga Sutras (Eight Limbs of Yoga)",
          "Overview of Bhagavad Gita and Hatha Yoga Pradipika",
          "Karma, Dharma, and the concept of Liberation (Moksha)",
          "Yogic lifestyle, ethics, and code of conduct for teachers",
        ],
      },
      {
        title: "Teaching Methodology & Practicum",
        description:
          "Develop the practical skills required to lead, cue, and manage a professional yoga class with confidence.",
        subtopics: [
          "Art of sequencing Hatha and Vinyasa Flow classes",
          "Classroom environment, voice modulation, and presence",
          "Business aspect of yoga and marketing yourself",
          "Teaching practice sessions with feedback from lead instructors",
        ],
      },
    ],
    scheduleDescription:
      "Our day is structured to immerse you fully in the yogic lifestyle, balancing physical practice, theory, and meditative silence.",
    schedule: [
      {
        time: "06:00 AM – 07:30 AM",
        activity: "Traditional Hatha Yoga Practice",
      },
      {
        time: "07:45 AM – 08:45 AM",
        activity: "Pranayama, Kriya & Mantra Chanting",
      },
      { time: "09:00 AM – 09:30 AM", activity: "Sattvic Organic Breakfast" },
      {
        time: "10:00 AM – 11:00 AM",
        activity: "Yoga Anatomy / Physiology Lectures",
      },
      {
        time: "11:15 AM – 12:15 PM",
        activity: "Yoga Philosophy & Lineage Discussion",
      },
      { time: "01:00 PM – 01:45 PM", activity: "Nutritious Vegetarian Lunch" },
      {
        time: "03:30 PM – 04:30 PM",
        activity: "Alignment, Adjustment & Teaching Methodology",
      },
      {
        time: "04:45 PM – 06:15 PM",
        activity: "Ashtanga Vinyasa Flow Practice",
      },
      {
        time: "06:30 PM – 07:30 PM",
        activity: "Meditation, Yoga Nidra & Kirtan",
      },
      { time: "07:45 PM – 08:30 PM", activity: "Vegetarian Dinner & Rest" },
    ],
    pricingDescription:
      "We offer all-inclusive packages that cover tuition, certification, excursions, meals, and accommodation. Select the room style that best fits your comfort and budget.",
    pricing: [
      {
        roomType: "Triple Sharing Room",
        price: "$649 USD",
        description:
          "Shared room with two fellow students. Ideal for budget-conscious travelers wishing to build strong community bonds.",
        features: [
          "Attached private bathroom",
          "Free High-speed Wi-Fi",
          "3 Organic vegetarian meals daily",
          "Weekly laundry service access",
        ],
      },
      {
        roomType: "Double Sharing Room",
        price: "$749 USD",
        description:
          "Shared room with one student. Features spacious setup, comfortable beds, and study desks.",
        features: [
          "Attached bathroom with hot shower",
          "Spacious wardrobe",
          "3 Organic vegetarian meals daily",
          "Weekly excursions included",
        ],
      },
      {
        roomType: "Private Standard Room",
        price: "$899 USD",
        description:
          "Your own private room. Perfect for those who value quiet reflection, study, and deep rest after an intensive day.",
        features: [
          "Fully private room & bathroom",
          "Study table and chair",
          "3 Organic vegetarian meals daily",
          "All excursions and study kits",
        ],
      },
      {
        roomType: "Private Deluxe Room (with Balcony)",
        price: "$1099 USD",
        description:
          "Premium private room with an attached balcony offering scenic mountain/river views. Very spacious layout.",
        features: [
          "Private balcony with seating",
          "Spacious premium bathroom",
          "Air conditioning / Heater",
          "3 Organic vegetarian meals daily",
          "All course materials & activities",
        ],
      },
    ],
    inclusions: [
      "24 nights of comfortable accommodation in Rishikesh",
      "3 freshly cooked organic vegetarian meals daily (excluding Sundays)",
      "Official Yoga Alliance RYT-200 certificate upon successful completion",
      "Comprehensive course manuals, textbook, and Shatkarma cleansing kit",
      "Weekly local outdoor excursions (Temple visits, Ganga Aarti, Waterfall trek)",
      "Complimentary pickup from Dehradun Airport (DED) or Haridwar Railway Station",
      "Access to high-speed Wi-Fi throughout the campus",
    ],
    exclusions: [
      "International flights and travel visa expenses",
      "Travel insurance (highly recommended)",
      "Personal expenses (laundry, additional snacks, spa treatments)",
      "Sunday meals (students are encouraged to dine at local cafes to support the community)",
    ],
    faqs: [
      {
        question: "Is this course suitable for beginners?",
        answer:
          "Yes! While having a few months of yoga practice is beneficial, our course starts with the absolute fundamentals of alignments and theories, making it accessible to beginners. It is also deep enough to challenge intermediate practitioners.",
      },
      {
        question: "Is the certificate recognized worldwide?",
        answer:
          "Absolutely. Nirvana Yoga School is a Registered Yoga School (RYS) with Yoga Alliance USA. Upon graduation, you can register as a Registered Yoga Teacher (RYT-200), which is recognized worldwide.",
      },
      {
        question: "What is Sattvic food like?",
        answer:
          "Sattvic food is fresh, organic, vegetarian food prepared without onions, garlic, and excessive spice. It is designed to sustain energy, promote digestion, and support mental clarity during intensive physical practice.",
      },
      {
        question: "Are there any health requirements?",
        answer:
          "The course is physically demanding. If you have chronic conditions, joint injuries, or are pregnant, please consult your doctor first and inform our admissions team so our instructors can support you with modifications.",
      },
    ],
  },
  "200-hour-ayurveda-yoga-teacher-training-in-rishikesh-india": {
    slug: "200-hour-ayurveda-yoga-teacher-training-in-rishikesh-india",
    title: "200 Hour Ayurveda & Hatha Yoga Teacher Training",
    subtitle:
      "Integrate the sister sciences of Yoga and Ayurveda to heal the body, calm the mind, and teach holistically.",
    level: "Beginner to Intermediate",
    duration: "25 Days",
    certification: "RYT-200, Yoga Alliance",
    fee: "From 649 USD",
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=1200&auto=format&fit=crop&q=80",
    certBadge: `${SITE}/img/ryt200.webp`,
    heroImages: [
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6731f98b36553.jpg",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6821d49c27ae1.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6821d49c276f6.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6821d716526a4.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/DSC00068.webp",
    ],
    overview:
      "This unique program combines the physical practice and philosophy of Hatha Yoga with the ancient medical wisdom of Ayurveda. You will learn to recognize different body constitutions (Doshas), utilize Ayurvedic nutrition, understand cleansing treatments, and structure yoga practices that promote individual constitution balancing and healing.",
    highlights: [
      "Introduction to the Five Elements and the Tridosha Theory",
      "Ayurvedic nutrition, spice therapies, and cooking basics",
      "Therapeutic Hatha Yoga sequencing for Vata, Pitta, and Kapha",
      "Practical introduction to Panchakarma therapies & home remedies",
    ],
    syllabusDescription:
      "A balanced blend of traditional yoga teacher training curriculum and core concepts of Ayurvedic medicine.",
    syllabus: [
      {
        title: "Ayurveda Foundations & Tridoshas",
        description:
          "Deep dive into Ayurvedic philosophy, history, and constitutional analysis.",
        subtopics: [
          "Understanding Prakriti (birth constitution) and Vikriti (imbalance state)",
          "Vata, Pitta, and Kapha: Physical, mental, and emotional characteristics",
          "The concepts of Agni (digestive fire), Ama (toxins), and Dhatus (tissues)",
          "Daily routines (Dinacharya) and seasonal routines (Ritucharya)",
        ],
      },
      {
        title: "Ayurvedic Nutrition & Cooking",
        description:
          "Learn how to select, combine, and cook foods according to seasons and individual body types.",
        subtopics: [
          "The Six Tastes (Shad Rasa) and their post-digestive effects",
          "Spices as medicine: qualities and therapeutic uses",
          "Designing a personal Ayurvedic diet plan",
          "Hands-on cooking class for standard Ayurvedic dishes (Kitchari, herbal decoctions)",
        ],
      },
      {
        title: "Ayurveda Yoga Therapy",
        description:
          "Learn to adapt Hatha Yoga practices therapeutically according to Doshas and imbalances.",
        subtopics: [
          "Sequencing Asanas to pacify specific Doshas",
          "Pranayama and meditation techniques mapped to energetic types",
          "Addressing common ailments (indigestion, insomnia, stress, joint pain) through yoga & herbs",
          "Creating customized client consultation profiles",
        ],
      },
      {
        title: "Hatha Yoga Practice & Methodology",
        description:
          "Full foundations of Hatha Yoga to meet RYT-200 requirements.",
        subtopics: [
          "Surya Namaskar & classical Hatha postures",
          "Yogic philosophy, Patanjali's Eight Limbs",
          "Anatomy and physiology of the human body",
          "Teaching practice, class sequencing, and cueing",
        ],
      },
    ],
    scheduleDescription:
      "Timetable balances active morning physical practices, afternoon lectures on Ayurveda, cooking sessions, and evening restorative practices.",
    schedule: [
      {
        time: "06:00 AM – 07:30 AM",
        activity: "Hatha Asana & Ayurvedic Sequencing",
      },
      {
        time: "07:45 AM – 08:45 AM",
        activity: "Pranayama, Mantra Chanting & Cleansing",
      },
      {
        time: "09:00 AM – 09:30 AM",
        activity: "Ayurvedic Breakfast (Sattvic & Nutritious)",
      },
      {
        time: "10:00 AM – 11:00 AM",
        activity: "Ayurveda Core Theory (Tridoshas & Dhatus)",
      },
      {
        time: "11:15 AM – 12:15 PM",
        activity: "Ayurvedic Herbology / Pharmacology Lectures",
      },
      { time: "01:00 PM – 01:45 PM", activity: "Balanced Vegetarian Lunch" },
      {
        time: "03:30 PM – 04:30 PM",
        activity: "Ayurvedic Lifestyle, Dinacharya & Nutrition",
      },
      {
        time: "04:45 PM – 06:15 PM",
        activity: "Restorative/Therapeutic Yoga Practice",
      },
      {
        time: "06:30 PM – 07:30 PM",
        activity: "Meditation & Yoga Nidra for Nervous System",
      },
      { time: "07:45 PM – 08:30 PM", activity: "Vegetarian Dinner & Rest" },
    ],
    pricingDescription:
      "Packages include course materials, organic meals, full accommodation, and practical Ayurvedic assessment kits.",
    pricing: [
      {
        roomType: "Triple Sharing Room",
        price: "$649 USD",
        description:
          "Shared room with attached bathroom. Affordable option to experience community and group study.",
        features: [
          "Attached bathroom",
          "High-speed Wi-Fi",
          "3 Ayurvedic meals daily",
          "Weekly laundry service access",
        ],
      },
      {
        roomType: "Double Sharing Room",
        price: "$749 USD",
        description:
          "Shared room with one other student. Cozy, clean, and spacious.",
        features: [
          "Attached bathroom with hot water",
          "Individual wardrobe & desk",
          "3 Ayurvedic meals daily",
          "Weekly excursions included",
        ],
      },
      {
        roomType: "Private Standard Room",
        price: "$899 USD",
        description:
          "Private room. Highly recommended to absorb the profound learnings and keep a balanced daily routine.",
        features: [
          "Fully private room & bathroom",
          "Study table",
          "3 Ayurvedic meals daily",
          "All excursions and herb starter kits",
        ],
      },
      {
        roomType: "Private Deluxe Room (with Balcony)",
        price: "$1099 USD",
        description:
          "Premium private room with balcony. Stunning view of mountains, premium bedding, and airflow.",
        features: [
          "Private balcony",
          "Air conditioning",
          "Ayurvedic wellness assessment",
          "3 Organic vegetarian meals daily",
          "All materials",
        ],
      },
    ],
    inclusions: [
      "24 nights of accommodation in our serene ashram",
      "3 Ayurvedic, freshly cooked vegetarian meals daily (excluding Sundays)",
      "Yoga Alliance RYT-200 certificate upon successful completion",
      "Ayurveda textbooks, guides, and diagnostic starter kits",
      "One complimentary Ayurvedic Abhyanga massage session at our spa",
      "Weekly local outdoor excursions (Temple visits, Ganga Aarti, Trek)",
      "Complimentary pickup from Dehradun Airport (DED) or Haridwar station",
      "Access to high-speed Wi-Fi",
    ],
    exclusions: [
      "Airfare and Indian Visa",
      "Travel insurance",
      "Personal shopping and items of personal nature",
      "Sunday meals",
    ],
    faqs: [
      {
        question: "Do I need prior knowledge of Ayurveda?",
        answer:
          "No, this course is designed as a foundational course. We start from the absolute basics, explaining the terminology and fundamental elements step by step.",
      },
      {
        question: "Will I be qualified as an Ayurvedic doctor?",
        answer:
          "No. This course certifies you as a Yoga Teacher (RYT-200) with a heavy specialization in Ayurveda. You will be qualified to consult on lifestyle, daily routines, nutrition, and yoga therapy, but not to diagnose or treat medical diseases as a licensed physician.",
      },
      {
        question: "Is the food strictly vegetarian?",
        answer:
          "Yes. In accordance with yogic and Ayurvedic principles, all food is strictly vegetarian (and mostly vegan-friendly), freshly cooked, and low in oil/chili to help maintain physical lightness.",
      },
    ],
  },
  "200-hour-meditation-teacher-training-in-rishikesh-india": {
    slug: "200-hour-meditation-teacher-training-in-rishikesh-india",
    title: "200 Hour Meditation, Yoga Nidra & Hatha Yoga Teacher Training",
    subtitle:
      "Journey inward. Master mindfulness, mantra, yogic sleep, and classical Hatha to guide others toward deep inner peace.",
    level: "Beginner to Intermediate",
    duration: "25 Days",
    certification: "RYT-200, Yoga Alliance",
    fee: "From 649 USD",
    image:
      "https://images.unsplash.com/photo-1528319725582-ddc096101511?w=1200&auto=format&fit=crop&q=80",
    certBadge: `${SITE}/img/ryt200.webp`,
    heroImages: [
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/DSC09790.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_673ae78851cd0.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6822f33c604e1.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6822f33c5f966.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_673ae70852cba.webp",
    ],
    overview:
      "This specialized program is designed for practitioners who wish to explore the meditative depths of yoga. Beyond learning physical postures, you will delve deeply into mindfulness, mantra chanting, chakra work, and Yoga Nidra (deep psychic sleep). You will learn how to guide these powerful practices, holding space for emotional release, healing, and spiritual growth.",
    highlights: [
      "Mastery of active, passive, and sound-based meditation techniques",
      "Deep study of Yoga Nidra states, theory, and script-writing",
      "Detailed chakra energy system and Kundalini philosophy",
      "Yogic psychology and mechanisms of stress reduction",
    ],
    syllabusDescription:
      "A curriculum deeply anchored in meditation, breathwork, and the energetic body alongside foundational yoga teaching methodology.",
    syllabus: [
      {
        title: "Meditation Techniques & Science",
        description:
          "Practice and master a wide variety of ancient and modern meditation methods.",
        subtopics: [
          "Silent sitting (Vipassana) and Mindfulness",
          "Mantra meditation (Japa) and Sound meditations",
          "Chakra & Kundalini active meditations",
          "Scientific research on meditation & brain wave states",
        ],
      },
      {
        title: "Yoga Nidra (Psychic Sleep)",
        description:
          "Understand the layers of consciousness and learn to guide restorative Yoga Nidra sessions.",
        subtopics: [
          "The concept of Pancha Kosha (Five Sheaths of being)",
          "Structuring and writing customized Yoga Nidra scripts",
          "Sankalpa (Resolves) and its subconscious impact",
          "Guiding groups for sleep restoration and trauma release",
        ],
      },
      {
        title: "Pranayama & Energetic Anatomy",
        description:
          "Study how breathing practices regulate the nervous system and control life-force energy.",
        subtopics: [
          "Pranayama techniques: Nadis, Ida, Pingala, and Sushumna",
          "Clearing blocks in the Nadis (energy channels)",
          "The science of Mudras (hand gestures) and Bandhas (locks)",
          "Experiential Chakra healing and sound activation",
        ],
      },
      {
        title: "Hatha Yoga & Teaching Pedagogy",
        description:
          "Physical practice and methodology to ensure a well-rounded teaching certification.",
        subtopics: [
          "Gentle Hatha & Yin postures to prepare the body for sitting",
          "Yogic philosophy and Patanjali's Yoga Sutras",
          "Instructional skills, voice modulation, and trauma-informed cueing",
          "Creating mindfulness workshops and retreat schedules",
        ],
      },
    ],
    scheduleDescription:
      "This schedule incorporates significant quiet periods, silent walks, and multiple guided meditation and mantra sessions daily.",
    schedule: [
      {
        time: "06:00 AM – 07:15 AM",
        activity: "Mantra Chanting & Guided Morning Meditation",
      },
      {
        time: "07:30 AM – 08:45 AM",
        activity: "Gentle Hatha / Asana Practice",
      },
      { time: "09:00 AM – 09:30 AM", activity: "Sattvic Organic Breakfast" },
      {
        time: "10:00 AM – 11:00 AM",
        activity: "Yogic Psychology / Philosophy Lectures",
      },
      {
        time: "11:15 AM – 12:15 PM",
        activity: "Yoga Nidra Theory & Script Workshop",
      },
      { time: "01:00 PM – 01:45 PM", activity: "Nutritious Vegetarian Lunch" },
      {
        time: "03:30 PM – 04:30 PM",
        activity: "Anatomy of breathing, Chakras & Mudras",
      },
      {
        time: "04:45 PM – 06:15 PM",
        activity: "Yin Yoga & Restorative Asana Practice",
      },
      {
        time: "06:30 PM – 07:30 PM",
        activity: "Active / Kundalini Meditation & Sound Bath",
      },
      { time: "07:45 PM – 08:30 PM", activity: "Vegetarian Dinner & Rest" },
    ],
    pricingDescription:
      "Packages include comfortable rooms, vegetarian meals, study materials, and access to all meditation tools (pillows, mats, sound bowls).",
    pricing: [
      {
        roomType: "Triple Sharing Room",
        price: "$649 USD",
        description:
          "Clean shared room with attached bathroom. Connect with a community of spiritual seekers.",
        features: [
          "Attached bathroom",
          "High-speed Wi-Fi",
          "3 Organic vegetarian meals daily",
          "Weekly laundry service access",
        ],
      },
      {
        roomType: "Double Sharing Room",
        price: "$749 USD",
        description:
          "Shared room with one roommate. Comfortable and spacious layout.",
        features: [
          "Attached bathroom with hot shower",
          "Spacious wardrobe & desk",
          "3 Organic vegetarian meals daily",
          "Weekly excursions included",
        ],
      },
      {
        roomType: "Private Standard Room",
        price: "$899 USD",
        description:
          "Private room. Strongly recommended to maintain the silence and introspection required for meditation study.",
        features: [
          "Fully private room & bathroom",
          "Quiet study corner",
          "3 Organic vegetarian meals daily",
          "All excursions and study kits",
        ],
      },
      {
        roomType: "Private Deluxe Room (with Balcony)",
        price: "$1099 USD",
        description:
          "Premium private room. High quality linens, air conditioning, and a private balcony overlooking green hills.",
        features: [
          "Private balcony",
          "Air conditioning",
          "Private consultation",
          "3 Organic vegetarian meals daily",
          "All materials",
        ],
      },
    ],
    inclusions: [
      "24 nights of accommodation in our quiet facility",
      "3 freshly cooked organic vegetarian meals daily (excluding Sundays)",
      "Official Yoga Alliance RYT-200 certificate with Meditation focus",
      "Curriculum manuals, meditation guides, and journals",
      "Weekly local excursions (Himalayan cave meditation, Ganga Aarti, Trek)",
      "Free pickup from Dehradun Airport (DED) or Haridwar station",
      "High-speed Wi-Fi",
    ],
    exclusions: [
      "Airfare and Visa expenses",
      "Travel insurance",
      "Sunday meals",
      "Personal items",
    ],
    faqs: [
      {
        question: "Is it difficult to sit for a long time?",
        answer:
          "Yes, sitting for long periods is a common challenge. We teach proper posture setup, use props (cushions, blocks, chairs), and incorporate gentle physical yoga (Hatha/Yin) to open up the hips and lower back.",
      },
      {
        question: "Will I learn how to design a Meditation script?",
        answer:
          "Yes. Our Yoga Nidra and Meditation pedagogy sessions guide you on how to write scripts, select music or sound bowls, regulate your voice, and pace the sessions for maximum stress relief.",
      },
      {
        question: "What should I wear?",
        answer:
          "Loose, comfortable clothing made of natural fibers (cotton or linen) is highly recommended. White or light-colored clothing is traditional and helps reflect energy during meditation, but is not mandatory.",
      },
    ],
  },
  "200-hour-kundalini-yoga-teacher-training-in-rishikesh-india": {
    slug: "200-hour-kundalini-yoga-teacher-training-in-rishikesh-india",
    title: "200 Hour Kundalini & Hatha Yoga Teacher Training",
    subtitle:
      "Awaken your latent energy. Master Kriyas, Chakras, Pranayama, and Mantra to guide powerful energetic shifts.",
    level: "Beginner to Intermediate",
    duration: "25 Days",
    certification: "RYT-200, Yoga Alliance",
    fee: "From 649 USD",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80",
    certBadge: `${SITE}/img/ryt200.webp`,
    heroImages: [
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_673c4aa931fd0.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_673c49bf258b3.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6738a7540dc3f.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6738a7540d004.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_673c49bf25af5.webp",
    ],
    overview:
      "This intensive Kundalini and Hatha Teacher Training program explores the energetic and mystical dimensions of yoga. You will learn dynamic Kriyas (action sequences), deep breathwork, sound healing mantras, and chakra activations. Grounded in safe, authentic lineage teachings, you will learn how to awaken Kundalini energy safely and guide others through powerful breakthroughs.",
    highlights: [
      "Safe, structured Kundalini awakening theory & practices",
      "Mantra chanting, sacred sounds (Naad Yoga), and Mudras",
      "Chakra alignments, Granthis (energy knots) & Bandha keys",
      "Classical Hatha Yoga to build a strong, stable physical container",
    ],
    syllabusDescription:
      "A deep curriculum detailing energetic physiology, mantra recitation, and pranayama alongside the standard teacher training requirements.",
    syllabus: [
      {
        title: "Kundalini Kriyas & Practices",
        description:
          "Learn and practice dynamic Kriyas containing breath, movement, and focus to activate cosmic energy.",
        subtopics: [
          "Understanding the structure of a Kundalini class",
          "Kriyas for detox, nervous system strength, and chakra balance",
          "Pranayama practices specifically for energy activation (breath of fire, etc.)",
          "Integrating sound therapy and Gongs into Kundalini practice",
        ],
      },
      {
        title: "Chakras, Nadis & Energetic Anatomy",
        description:
          "Study the detailed maps of the human subtle body and how to clear blockages.",
        subtopics: [
          "The 7 major Chakras and the 8th aura field",
          "Ida, Pingala, and Sushumna Nadis (energy channels)",
          "The three Granthis (spiritual knots) and how to untie them",
          "The five Pranas (Vayus) governing energy flow in the body",
        ],
      },
      {
        title: "Sacred Mantras & Naad Yoga",
        description:
          "Harness the power of sound vibration to calm the mind and shift cellular frequency.",
        subtopics: [
          "Adi Mantra, Mangala Charan Mantra, and Seed (Beej) Mantras",
          "The science of sound (Naad) and how it affects the endocrine system",
          "Chanting sessions with harmonium and tabla accompaniment",
          "Guiding mantra meditations for healing and shielding energy",
        ],
      },
      {
        title: "Hatha Yoga & Teaching Pedagogy",
        description:
          "Establish a stable, grounded physical practice to support the intense energetic work of Kundalini.",
        subtopics: [
          "Classical Hatha poses for hip opening and spinal flexibility",
          "Foundational yoga philosophy (Patanjali's Yoga Sutras)",
          "Voice projection, classroom boundaries, and managing emotional releases",
          "Planning 90-minute class sequences and workshops",
        ],
      },
    ],
    scheduleDescription:
      "The day starts early with energy activations, followed by lectures on subtle anatomy, mantra sessions, and active Kundalini classes.",
    schedule: [
      {
        time: "06:00 AM – 07:30 AM",
        activity: "Kundalini Kriyas & Breathwork Practice",
      },
      {
        time: "07:45 AM – 08:45 AM",
        activity: "Mantra, Sound Healing & Gong Bath",
      },
      { time: "09:00 AM – 09:30 AM", activity: "Sattvic Organic Breakfast" },
      {
        time: "10:00 AM – 11:00 AM",
        activity: "Subtle Anatomy (Chakras & Nadis) Lectures",
      },
      { time: "11:15 AM – 12:15 PM", activity: "Yogic Philosophy & Texts" },
      { time: "01:00 PM – 01:45 PM", activity: "Nutritious Vegetarian Lunch" },
      {
        time: "03:30 PM – 04:30 PM",
        activity: "Teaching Methodology & Class Setup",
      },
      {
        time: "04:45 PM – 06:15 PM",
        activity: "Traditional Hatha Yoga Practice",
      },
      {
        time: "06:30 PM – 07:30 PM",
        activity: "Chakra Meditation & Silent Reflection",
      },
      { time: "07:45 PM – 08:30 PM", activity: "Vegetarian Dinner & Rest" },
    ],
    pricingDescription:
      "All packages are comprehensive and include accommodation, organic meals, manuals, and a meditation shawl.",
    pricing: [
      {
        roomType: "Triple Sharing Room",
        price: "$649 USD",
        description:
          "Shared room with attached bathroom. Connect with kindred spirits on the path of awakening.",
        features: [
          "Attached bathroom",
          "High-speed Wi-Fi",
          "3 Organic vegetarian meals daily",
          "Weekly laundry service access",
        ],
      },
      {
        roomType: "Double Sharing Room",
        price: "$749 USD",
        description:
          "Shared room with one other student. Cozy, clean, and spacious layout.",
        features: [
          "Attached bathroom with hot shower",
          "Spacious wardrobe & desk",
          "3 Organic vegetarian meals daily",
          "Weekly excursions included",
        ],
      },
      {
        roomType: "Private Standard Room",
        price: "$899 USD",
        description:
          "Private room. Highly recommended to allow private integration of intense energetic practices.",
        features: [
          "Fully private room & bathroom",
          "Quiet study corner",
          "3 Organic vegetarian meals daily",
          "All excursions and study kits",
        ],
      },
      {
        roomType: "Private Deluxe Room (with Balcony)",
        price: "$1099 USD",
        description:
          "Premium private room. Excellent ventilation, air conditioning, and balcony facing Himalayan forests.",
        features: [
          "Private balcony",
          "Air conditioning",
          "Energetic evaluation consult",
          "3 Organic vegetarian meals daily",
          "All materials",
        ],
      },
    ],
    inclusions: [
      "24 nights of comfortable accommodation",
      "3 freshly cooked organic vegetarian meals daily (excluding Sundays)",
      "Official Yoga Alliance RYT-200 certificate (Kundalini & Hatha)",
      "Detailed Kundalini manual, textbooks, and white meditation shawl",
      "Weekly local excursions (Cave meditation, Ganga Aarti, Trek)",
      "Free pickup from Dehradun Airport (DED) or Haridwar station",
      "High-speed Wi-Fi",
    ],
    exclusions: [
      "Airfare and Visa expenses",
      "Travel insurance",
      "Sunday meals",
      "Personal items",
    ],
    faqs: [
      {
        question: "Is Kundalini yoga dangerous?",
        answer:
          "No, when taught by qualified masters in a structured, step-by-step manner. We emphasize grounding practices (Hatha), slow progress, and safe techniques, preventing the 'overheating' of the nervous system.",
      },
      {
        question: "Why do we wear white during Kundalini yoga?",
        answer:
          "White clothing is believed to expand the magnetic field (Aura) by several feet and reflect negative energy. While not strictly mandatory, it is highly recommended to wear white or light pastel colors during class.",
      },
      {
        question: "What is a Kriya?",
        answer:
          "A Kriya is a specific sequence of posture (Asana), breath (Pranayama), sound (Mantra), and locks (Bandhas) that works in unison to produce a specific energetic state or heal specific systems.",
      },
    ],
  },
  "300-hour-yoga-teacher-training-in-rishikesh-india": {
    slug: "300-hour-yoga-teacher-training-in-rishikesh-india",
    title: "300 Hour Hatha, Ashtanga, Vinyasa & Ayurveda Teacher Training",
    subtitle:
      "Advance your practice. Take the next step in your teaching journey, mastering advanced adjustments, therapy, and philosophy.",
    level: "Intermediate to Advanced",
    duration: "29 Days",
    certification: "RYT-300, Yoga Alliance",
    fee: "From 899 USD",
    image:
      "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=1200&auto=format&fit=crop&q=80",
    certBadge: `${SITE}/img/ryt300.webp`,
    heroImages: [
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/DSC01476.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6821a356b7660.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6821a356b6987.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6821a3f2d91f9.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6821a356b7920.webp",
    ],
    overview:
      "Elevate your teaching career with our Advanced 300-Hour Yoga Teacher Training. Designed for RYT-200 graduates, this intensive program deepens your physical mastery of advanced Hatha and Ashtanga (Intermediate Series), refines your hands-on adjustment skills, and integrates Ayurveda therapy, anatomy analysis, and deep Sanskrit texts.",
    highlights: [
      "Mastery of Ashtanga Vinyasa Second Series (Nadi Shodhana)",
      "Advanced hands-on adjustments, alignments, and injury management",
      "Practical integration of Ayurveda therapy for client wellness",
      "In-depth analysis of the Patanjali Yoga Sutras & Upanishads",
    ],
    syllabusDescription:
      "An advanced curriculum focused on professional teaching enhancement, therapeutics, philosophy, and advanced physical practices.",
    syllabus: [
      {
        title: "Advanced Asana & Alignments",
        description:
          "Study and practice advanced variations of classical postures and master the Ashtanga Second Series.",
        subtopics: [
          "Ashtanga Vinyasa Intermediate Series postures",
          "Advanced Hatha Yoga arm balances, backbends, and inversions",
          "Therapeutic sequencing for alignment corrections",
          "Biomechanics of advanced adjustments: safety first",
        ],
      },
      {
        title: "Yoga Philosophy: Deep Texts",
        description:
          "Move beyond the basics to study key Sanskrit texts and philosophical systems in detail.",
        subtopics: [
          "Comprehensive study of Upanishads and Bhagavad Gita chapters",
          "Deep dive into Patanjali's Yoga Sutras (Samadhi and Sadhana Pada)",
          "Introduction to Sanskrit terms, pronunciation, and mantra chanting",
          "Schools of Indian Philosophy (Darshanas) - Samkhya and Vedanta",
        ],
      },
      {
        title: "Yoga Anatomy & Physiology: Therapeutics",
        description:
          "Learn how to apply anatomical knowledge to prevent injury and treat structural issues.",
        subtopics: [
          "Analyzing posture alignment issues in students",
          "Anatomy of deep backbends and hip openers",
          "The nervous and endocrine systems in relation to pranayama & meditation",
          "Yogic physical therapy: Restoring joints and spine health",
        ],
      },
      {
        title: "Advanced Ayurveda & Wellness Consultations",
        description:
          "Learn how to integrate Ayurvedic counseling into your yoga teacher toolkit.",
        subtopics: [
          "Advanced constitutional diagnosis (Tridosha analysis)",
          "Recommending herbs, diets, and routines for client imbalances",
          "Ayurvedic massage (Abhyanga) strokes and Marma point basics",
          "Structuring therapeutic yoga programs for health issues",
        ],
      },
    ],
    scheduleDescription:
      "This advanced routine is physically and mentally rigorous, focusing on deep self-study, research, and intensive morning/evening practices.",
    schedule: [
      {
        time: "06:00 AM – 07:45 AM",
        activity: "Advanced Hatha & Vinyasa Practice",
      },
      {
        time: "08:00 AM – 09:00 AM",
        activity: "Pranayama, Mudras & Bandha Mastery",
      },
      { time: "09:15 AM – 09:45 AM", activity: "Sattvic Organic Breakfast" },
      {
        time: "10:15 AM – 11:30 AM",
        activity: "Advanced Yoga Philosophy & Upanishads",
      },
      {
        time: "11:45 AM – 01:00 PM",
        activity: "Yoga Anatomy & Therapeutic Adaptations",
      },
      {
        time: "01:15 PM – 02:00 PM",
        activity: "Vegetarian Lunch & Self-Study",
      },
      {
        time: "03:30 PM – 04:45 PM",
        activity: "Advanced Adjustments & Teaching Practicum",
      },
      {
        time: "05:00 PM – 06:45 PM",
        activity: "Ashtanga Vinyasa Second Series Practice",
      },
      {
        time: "07:00 PM – 08:00 PM",
        activity: "Advanced Meditation, Kirtan & Satsang",
      },
      { time: "08:15 PM – 09:00 PM", activity: "Vegetarian Dinner & Rest" },
    ],
    pricingDescription:
      "Packages are all-inclusive, covering advanced manuals, comfortable single/shared accommodation, organic meals, and field excursions.",
    pricing: [
      {
        roomType: "Triple Sharing Room",
        price: "$899 USD",
        description:
          "Shared room with attached bathroom. Affordable option to experience community and group study.",
        features: [
          "Attached private bathroom",
          "Free High-speed Wi-Fi",
          "3 Organic vegetarian meals daily",
          "Weekly laundry service access",
        ],
      },
      {
        roomType: "Double Sharing Room",
        price: "$999 USD",
        description:
          "Double occupancy room. Clean, comfortable, and offers a study environment.",
        features: [
          "Attached bathroom",
          "Study table",
          "3 Organic vegetarian meals daily",
          "Weekly excursions included",
        ],
      },
      {
        roomType: "Private Standard Room",
        price: "$1199 USD",
        description:
          "Your own private room. Ideal for the deep contemplation, reading, and rest required during advanced training.",
        features: [
          "Fully private room & bathroom",
          "Spacious desk",
          "3 Organic vegetarian meals daily",
          "All study kits and materials",
        ],
      },
      {
        roomType: "Private Deluxe Room (with Balcony)",
        price: "$1399 USD",
        description:
          "Premium private room. Features air conditioning, soft mattress, writing desk, and balcony with beautiful mountain view.",
        features: [
          "Private balcony",
          "Air conditioning",
          "Personal consultation with Lead Trainer",
          "3 Organic vegetarian meals daily",
        ],
      },
    ],
    inclusions: [
      "28 nights of comfortable accommodation in Rishikesh",
      "3 freshly cooked organic vegetarian meals daily (excluding Sundays)",
      "Official Yoga Alliance RYT-500 eligible certificate (with your prior RYT-200)",
      "Comprehensive advanced manuals, textbooks, and Sanskrit guides",
      "Weekly local outdoor excursions (Himalayan Temple Trek, Ganga Aarti)",
      "Complimentary pickup from Dehradun Airport (DED) or Haridwar Station",
      "High-speed Wi-Fi",
    ],
    exclusions: [
      "International flights and travel visa expenses",
      "Travel insurance",
      "Personal expenses",
      "Sunday meals",
    ],
    faqs: [
      {
        question:
          "Can I take this course if I don't have a 200-Hour certificate?",
        answer:
          "You can attend the training for your own personal growth and receive a completion certificate, but to register as an RYT-500 with Yoga Alliance, you must hold a registered 200-Hour certificate (RYT-200) from any Yoga Alliance approved school.",
      },
      {
        question: "What is the Ashtanga Second Series?",
        answer:
          "Also known as Nadi Shodhana (Nerve Cleansing), it focuses on deep twists, backbends, and leg-behind-head poses. It is designed to clear the energetic pathways. We teach modifications so you can learn it safely.",
      },
      {
        question: "Is the teaching practicum mandatory?",
        answer:
          "Yes. In the 300-Hour training, we focus heavily on refining your voice, correction skills, and teaching style. You will lead several classes and receive direct constructive feedback from our master teachers.",
      },
    ],
  },
  "500-hour-yoga-teacher-training-in-rishikesh-india": {
    slug: "500-hour-yoga-teacher-training-in-rishikesh-india",
    title: "500 Hour Comprehensive Hatha, Ashtanga & Ayurveda Teacher Training",
    subtitle:
      "The ultimate yogic journey. A comprehensive 59-day training merging beginner foundations with advanced mastery.",
    level: "Beginner to Advanced",
    duration: "59 Days",
    certification: "RYT-500, Yoga Alliance",
    fee: "From 1449 USD",
    image:
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1200&auto=format&fit=crop&q=80",
    certBadge: `${SITE}/img/ryt500.webp`,
    heroImages: [
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/DSC01305.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6739e9446403f.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6739e5cd5ec18.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6739e5cd5efdd.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6739e5cd5f37a.webp",
    ],
    overview:
      "Our 500-Hour Yoga Teacher Training is the most comprehensive program available, merging the foundational 200-Hour and advanced 300-Hour trainings into a single, continuous 59-day transformation. Perfect for those seeking complete immersion, you will transition from beginner alignment theories to mastering advanced postures, deep philosophy, and therapeutic clinical Ayurveda applications.",
    highlights: [
      "Complete curriculum from foundational alignments to advanced postures",
      "Dual focus: Ashtanga Vinyasa Primary and Intermediate (Second) Series",
      "Clinical Ayurveda, marma massage, and therapeutic diagnosis",
      "In-depth studies of Sanskrit, Chanting, Upanishads & Hatha texts",
    ],
    syllabusDescription:
      "A massive, deep-dive curriculum spanning two months, designed to build a master-level teacher.",
    syllabus: [
      {
        title: "Complete Asana Alignment & Sequencing",
        description:
          "Step-by-step physical development covering over 120 key yoga postures.",
        subtopics: [
          "Traditional Hatha and Vinyasa Flow sequencing",
          "Ashtanga Primary (Chikitsa) and Intermediate (Nadi Shodhana) series",
          "Advanced adjustments, props, and modification strategies",
          "Teaching styles: from restorative to intensive power flow",
        ],
      },
      {
        title: "Pranayama, Shatkarma & Meditation Mastery",
        description:
          "Deep practice of breath science, purification methods, and meditative states.",
        subtopics: [
          "Traditional purification (Kriyas): Neti, Dhauti, Nauli, Basti, Kapalbhati, Trataka",
          "Advanced breath control practices with WaitKumbhaka (retention)",
          "Silent sitting (Vipassana), Mantra, and active meditation methods",
          "Yoga Nidra design and therapeutic applications",
        ],
      },
      {
        title: "Comprehensive Anatomy, Physiology & Bio-mechanics",
        description:
          "Gain a profound understanding of the human body's structure and response to yoga.",
        subtopics: [
          "Musculoskeletal system, joint mechanics, and spinal safety",
          "Anatomy of breathing, blood flow, and nervous system regulation",
          "Therapeutic application of yoga for rehabilitation",
          "Energetic anatomy: Chakra centers, Nadis, and Kundalini dynamics",
        ],
      },
      {
        title: "Ayurveda & Holistic Lifestyle",
        description:
          "Study Ayurvedic medicine as the sister science of yoga to design balanced lifestyles.",
        subtopics: [
          "Doshas (Vata, Pitta, Kapha) and individual assessment techniques",
          "Ayurvedic food guidelines, nutrition, and daily rituals",
          "Marma points and basic Abhyanga massage techniques",
          "Managing chronic conditions using specific Ayurvedic diets & yoga",
        ],
      },
      {
        title: "Yogic Philosophy, Scriptures & Sanskrit",
        description:
          "Deep study of the scriptures that give yoga its spiritual depth.",
        subtopics: [
          "Patanjali's Yoga Sutras - word by word translation & study",
          "Bhagavad Gita, Hatha Yoga Pradipika, Gheranda Samhita",
          "Introduction to Sanskrit grammar, chanting, and meaning",
          "The business, marketing, and ethical commitments of yoga",
        ],
      },
    ],
    scheduleDescription:
      "A multi-phased 59-day schedule that builds stamina gradually, transitioning from foundations to advanced practices with dedicated rest days.",
    schedule: [
      {
        time: "06:00 AM – 07:30 AM",
        activity: "Morning Asana Practice (Hatha/Vinyasa)",
      },
      {
        time: "07:45 AM – 08:45 AM",
        activity: "Pranayama, Cleansing & Chanting",
      },
      { time: "09:00 AM – 09:30 AM", activity: "Nutritious Sattvic Breakfast" },
      {
        time: "10:00 AM – 11:30 AM",
        activity: "Yoga Philosophy & Scripture Studies",
      },
      {
        time: "11:45 AM – 01:00 PM",
        activity: "Yoga Anatomy & Physiology Lectures",
      },
      { time: "01:15 PM – 02:00 PM", activity: "Organic Vegetarian Lunch" },
      {
        time: "03:30 PM – 04:45 PM",
        activity: "Alignment, Adjustment & Teaching Workshop",
      },
      {
        time: "05:00 PM – 06:30 PM",
        activity: "Ashtanga Vinyasa Series Practice",
      },
      {
        time: "06:45 PM – 07:45 PM",
        activity: "Evening Meditation, Nidra or Sound Healing",
      },
      { time: "08:00 PM – 08:45 PM", activity: "Vegetarian Dinner & Rest" },
    ],
    pricingDescription:
      "Includes 58 nights of accommodation, all vegetarian meals, complete set of books/manuals, field trips, and two certificates.",
    pricing: [
      {
        roomType: "Triple Sharing Room",
        price: "$1449 USD",
        description:
          "Shared room with attached bathroom. The most economical way to experience this two-month life transformation.",
        features: [
          "Attached bathroom",
          "High-speed Wi-Fi",
          "3 Meals daily",
          "Weekly laundry service access",
        ],
      },
      {
        roomType: "Double Sharing Room",
        price: "$1649 USD",
        description:
          "Double occupancy room. Clean, comfortable setup with desk and wardrobes.",
        features: [
          "Attached bathroom",
          "Study space",
          "3 Meals daily",
          "Weekly excursions included",
        ],
      },
      {
        roomType: "Private Standard Room",
        price: "$1999 USD",
        description:
          "Private room with private bathroom. Highly recommended for a two-month stay to ensure quiet study and personal integration space.",
        features: [
          "Fully private room & bathroom",
          "Spacious study corner",
          "3 Meals daily",
          "Full study material pack",
        ],
      },
      {
        roomType: "Private Deluxe Room (with Balcony)",
        price: "$2399 USD",
        description:
          "Premium private room with air conditioning, premium mattress, study desk, and scenic balcony view.",
        features: [
          "Private balcony",
          "Air conditioning / Heater",
          "Personal wellness review",
          "3 Meals daily",
          "All activities",
        ],
      },
    ],
    inclusions: [
      "58 nights of comfortable accommodation in our green campus",
      "3 freshly cooked organic vegetarian meals daily (excluding Sundays)",
      "Official RYT-500 Yoga Alliance certificate upon completion",
      "Full library of manuals, textbooks, Sanskrit materials, and Shatkarma kit",
      "Weekly local outdoor excursions (River rafting, Temples, Ashrams)",
      "Two complimentary Ayurvedic massage sessions at our spa",
      "Complimentary pickup from Dehradun Airport (DED)",
      "High-speed Wi-Fi",
    ],
    exclusions: [
      "Airfare and Visa expenses",
      "Travel insurance",
      "Personal items",
      "Sunday meals",
    ],
    faqs: [
      {
        question: "Do I need to be advanced to join the 500-Hour training?",
        answer:
          "No. The 500-Hour course is structured in phases. The first month focuses on the solid foundations of alignments, basics of philosophy, and anatomy (200-Hour level). The second month builds upon that base to cover advanced postures, therapeutics, and scripture details (300-Hour level).",
      },
      {
        question: "Can I take a break between the two months?",
        answer:
          "Yes, you can split the training and complete the 300-Hour module at a later date. However, taking the course continuously as a 59-day program ensures a profound mental and physical focus that yields maximum transformation.",
      },
      {
        question: "What happens if I get sick during the training?",
        answer:
          "We have an on-call Ayurvedic doctor and close proximity to clinics. Our kitchen can prepare specialized food (soups, herbal teas), and our instructors will help you modify practices or catch up on theory lectures once you recover.",
      },
    ],
  },
  "yin-yoga-teacher-training-in-rishikesh-india": {
    slug: "yin-yoga-teacher-training-in-rishikesh-india",
    title: "Yin Yoga Teacher Training",
    subtitle:
      "Find your stillness. Master the science of deep connective tissues, meridian energy pathways, and passive asanas.",
    level: "All Levels (Beginners welcome)",
    duration: "7 Days",
    certification: "YACEP, Yoga Alliance",
    fee: "From 499 USD",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=80",
    certBadge: `${SITE}/img/ryt200.webp`,
    heroImages: [
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_687def2995ba1.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_6853b9d3f09f23.81733684.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_687def2993ec8.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_687def299427c.webp",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_687def2994db6.webp",
    ],
    overview:
      "Our 50-Hour / 100-Hour Yin Yoga Teacher Training is a specialized immersion into the quiet, restorative side of yoga. Unlike active Yang styles, Yin Yoga focuses on holding passive floor postures for several minutes to target the deep connective tissues (fascia, ligaments, and joints) and stimulate the flow of energy (Prana/Qi) along meridian lines. Guided by senior anatomy and meditation teachers, this course will equip you to teach Yin with anatomical precision and mindful awareness.",
    highlights: [
      "Anatomy of Yin: skeletal variation, fascia, tension vs compression",
      "Meridian Theory & Chinese Medicine: energy flow (Qi) and organ health",
      "Guiding mindfulness, somatic cues, and deep silent holdings",
      "Sequencing Yin classes for stress relief, joint mobility, & meditation",
    ],
    syllabusDescription:
      "A specialized curriculum combining modern biomechanics (fascia study) with ancient Chinese energetic meridians.",
    syllabus: [
      {
        title: "The Anatomy & Biomechanics of Yin",
        description:
          "Learn how skeletal differences determine range of motion, and study the science of fascia.",
        subtopics: [
          "Fascia structure, hydration, and response to passive stretching",
          "Understanding tension vs compression in joints",
          "Anatomy of the hips, pelvis, and spine in Yin postures",
          "Safe use of props (bolsters, blocks, blankets) for all bodies",
        ],
      },
      {
        title: "Meridian Theory & Energy Channels",
        description:
          "Study Traditional Chinese Medicine (TCM) concepts and map them to physical postures.",
        subtopics: [
          "The 12 primary meridian channels and their associated organs",
          "Yin/Yang theory: balancing dynamic activity and stillness",
          "Targeting meridians in sequences (e.g. Kidney/Urinary Bladder for fear/anxiety)",
          "Connecting Meridians to the Indian Chakra system",
        ],
      },
      {
        title: "Yin Postures & Teaching Methodology",
        description:
          "Master the 26 classical Yin postures, their variations, and instructions.",
        subtopics: [
          "Analysis of target areas for each major Yin posture",
          "Guiding the mind during silence: cueing mindfulness & breath",
          "Sequencing Yin classes based on seasons, organs, or chakras",
          "Creating a safe, welcoming, and quiet environment",
        ],
      },
    ],
    scheduleDescription:
      "A balanced timetable of theory lectures on anatomy/meridians, alignment labs, and two deep Yin sessions daily.",
    schedule: [
      {
        time: "06:30 AM – 08:00 AM",
        activity: "Morning Yin Yoga Practice & Mindfulness",
      },
      { time: "08:15 AM – 09:00 AM", activity: "Pranayama & Quiet Meditation" },
      { time: "09:15 AM – 09:45 AM", activity: "Sattvic Vegetarian Breakfast" },
      {
        time: "10:15 AM – 11:30 AM",
        activity: "Anatomy of Fascia & Joints Lecture",
      },
      {
        time: "11:45 AM – 01:00 PM",
        activity: "Traditional Chinese Medicine & Meridians",
      },
      { time: "01:15 PM – 02:00 PM", activity: "Nutritious Vegetarian Lunch" },
      {
        time: "03:30 PM – 04:45 PM",
        activity: "Yin Posture Analysis & Prop Setup Lab",
      },
      {
        time: "05:00 PM – 06:30 PM",
        activity: "Evening Restorative Yin Session",
      },
      {
        time: "06:45 PM – 07:45 PM",
        activity: "Guided Meditation / Sound Bath",
      },
      { time: "08:00 PM – 08:45 PM", activity: "Vegetarian Dinner & Rest" },
    ],
    pricingDescription:
      "Packages include course materials, organic vegetarian meals, high-speed Wi-Fi, excursions, and accommodation.",
    pricing: [
      {
        roomType: "Triple Sharing Room",
        price: "$499 USD",
        description:
          "Shared room setup. Excellent for budget-conscious practitioners wanting a short immersion.",
        features: [
          "Attached bathroom",
          "High-speed Wi-Fi",
          "3 Organic meals daily",
          "All study manuals",
        ],
      },
      {
        roomType: "Double Sharing Room",
        price: "$599 USD",
        description:
          "Shared room with one other student. Cozy, clean, and quiet.",
        features: [
          "Attached bathroom",
          "Study desk",
          "3 Organic meals daily",
          "Weekly excursions",
        ],
      },
      {
        roomType: "Private Standard Room",
        price: "$699 USD",
        description:
          "Your own private room. Ideal for integrating the quiet, introspective teachings of Yin Yoga.",
        features: [
          "Private room & bathroom",
          "Spacious desk",
          "3 Organic meals daily",
          "All excursions and kits",
        ],
      },
      {
        roomType: "Private Deluxe Room (with Balcony)",
        price: "$799 USD",
        description:
          "Premium private room with balcony. Mountain air, deluxe bedding, and air conditioning.",
        features: [
          "Private balcony",
          "Air conditioning",
          "3 Organic vegetarian meals daily",
          "All course materials",
        ],
      },
    ],
    inclusions: [
      "6 nights of comfortable accommodation in Rishikesh",
      "3 freshly cooked organic vegetarian meals daily",
      "Official Yoga Alliance YACEP certificate (Continuing Education)",
      "Yin Yoga manual, sequence guides, and meridian maps",
      "One local outdoor excursion (Waterfall hike or Ganga Aarti visit)",
      "Complimentary pickup from Dehradun Airport (DED)",
      "High-speed Wi-Fi access",
    ],
    exclusions: [
      "Airfare and Visa expenses",
      "Travel insurance",
      "Personal items",
      "Sunday meals",
    ],
    faqs: [
      {
        question:
          "What is the difference between Yin Yoga and Restorative Yoga?",
        answer:
          "Yin Yoga aims to stretch the connective tissues, joints, and fascia, applying gentle 'stress' to strengthen them, using minimal props. Restorative Yoga aims to support the body completely with props, ensuring zero muscle strain, to heal and reset the nervous system.",
      },
      {
        question: "Is this course open to non-teachers?",
        answer:
          "Yes! Many students join our Yin Yoga training solely to deepen their personal practice, learn skeletal anatomy, and experience a week of deep stillness and restoration in Rishikesh.",
      },
      {
        question: "Will I receive a certificate?",
        answer:
          "Yes, this course counts as a Continuing Education course. You will receive a Yoga Alliance YACEP certificate, which you can log on your Yoga Alliance registry profile.",
      },
    ],
  },
  "sound-healing-course-in-rishikesh-india": {
    slug: "sound-healing-course-in-rishikesh-india",
    title: "Sound Healing Course",
    subtitle:
      "Harness the power of vibration. Learn to play Tibetan singing bowls, gongs, and tuning forks to heal and restore harmony.",
    level: "All Levels (Beginners welcome)",
    duration: "7 Days",
    certification: "Nirvana Sound Academy Certificate",
    fee: "From 499 USD",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80",
    certBadge: `${SITE}/img/ryt200.webp`, // default badge or similar
    heroImages: [
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_696e3718e0f84.jpg",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_696e375e5829d.jpg",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_696e375e5855d.jpg",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_696e375e5878f.jpg",
      "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/img_696e375e589c9.jpg",
    ],
    overview:
      "Step into the magical world of sound resonance. Our Sound Healing Course teaches you the theoretical foundations and practical skills to conduct individual and group sound bath sessions. You will learn to work with Tibetan Singing Bowls, crystal bowls, Gongs, Tingshas, and Shamanic drums, understanding how brain wave entrainment and vibration restore health, dissolve stress, and align energy centers (Chakras).",
    highlights: [
      "Mastery of Tibetan Singing Bowl striking, rimming, and placement",
      "Guiding group Sound Baths and private chakra alignment sessions",
      "The physics of sound, resonance, entrainment, and brain wave states",
      "Playing Gongs, therapeutic tuning forks, and wind chimes",
    ],
    syllabusDescription:
      "A practical, experiential curriculum mapping the science of acoustics to the spiritual healing art of sacred vibrations.",
    syllabus: [
      {
        title: "Tibetan Singing Bowls: Basics & Placements",
        description:
          "Learn how to select, play, and place singing bowls on the body.",
        subtopics: [
          "History, metals, and sound profiles of handmade Tibetan bowls",
          "Striking and rimming techniques: achieving pure, sustained tones",
          "Placing bowls on the body (Chakras) for localized vibration healing",
          "Diagnosing energetic blockages using sound feedback",
        ],
      },
      {
        title: "Advanced Instruments & Gong Play",
        description:
          "Expand your sound toolkit with Gongs, Crystal Bowls, and therapeutic chimes.",
        subtopics: [
          "Gong playing techniques: mallet selection, patterns, and safety",
          "Crystal singing bowls: pure sine waves and binaural beats",
          "Tuning forks: meridian point activation and physical healing",
          "Integrating wind chimes, Shamanic drums, and rainsticks",
        ],
      },
      {
        title: "Conducting Sessions & Client Care",
        description:
          "Learn how to structure sound experiences, hold space, and manage group energy.",
        subtopics: [
          "Designing a 60-minute group Sound Bath from start to finish",
          "Setting up the room, acoustic layouts, and client comfort",
          "Contraindications of sound healing (pregnancy, epilepsy, metal implants)",
          "The business of sound healing: pricing, marketing, and workshops",
        ],
      },
    ],
    scheduleDescription:
      "A highly hands-on schedule focused on instrument practice, sound bath design, and group resonance sessions.",
    schedule: [
      {
        time: "07:00 AM – 08:00 AM",
        activity: "Mantra Chanting & Breathwork for Sound Healers",
      },
      { time: "08:15 AM – 09:15 AM", activity: "Morning Gentle Yoga Stretch" },
      { time: "09:30 AM – 10:00 AM", activity: "Sattvic Organic Breakfast" },
      {
        time: "10:30 AM – 12:00 PM",
        activity: "The Science of Sound, Frequency & Brainwaves",
      },
      {
        time: "12:15 PM – 01:15 PM",
        activity: "Tibetan Singing Bowl Placement & Technique Lab",
      },
      { time: "01:30 PM – 02:15 PM", activity: "Balanced Vegetarian Lunch" },
      {
        time: "03:30 PM – 05:00 PM",
        activity: "Gong, Tuning Fork & Crystal Bowl Lab",
      },
      {
        time: "05:15 PM – 06:30 PM",
        activity: "Practicum: Conducting Group Sound Baths",
      },
      {
        time: "06:45 PM – 07:45 PM",
        activity: "Evening Sound Meditation & Relaxation",
      },
      { time: "08:00 PM – 08:45 PM", activity: "Vegetarian Dinner & Rest" },
    ],
    pricingDescription:
      "Packages include high-quality instrument kits for use during course, manuals, organic food, and accommodation.",
    pricing: [
      {
        roomType: "Triple Sharing Room",
        price: "$499 USD",
        description:
          "Shared room. Ideal for learning in a group setting and sharing sound feedback sessions.",
        features: [
          "Attached bathroom",
          "High-speed Wi-Fi",
          "3 Organic meals daily",
          "Manual and course certificate",
        ],
      },
      {
        roomType: "Double Sharing Room",
        price: "$599 USD",
        description:
          "Shared room with one other classmate. Comfortable and quiet setup.",
        features: [
          "Attached bathroom",
          "Study space",
          "3 Organic meals daily",
          "Weekly excursions",
        ],
      },
      {
        roomType: "Private Standard Room",
        price: "$699 USD",
        description:
          "Your own private room. Strongly recommended to rest your ears and mind after hours of sound vibration studies.",
        features: [
          "Private room & bathroom",
          "Spacious study corner",
          "3 Organic meals daily",
          "All excursions",
        ],
      },
      {
        roomType: "Private Deluxe Room (with Balcony)",
        price: "$799 USD",
        description:
          "Premium private room with air conditioning, desk, private bathroom, and balcony with garden/forest views.",
        features: [
          "Private balcony",
          "Air conditioning",
          "3 Organic meals daily",
          "All materials",
        ],
      },
    ],
    inclusions: [
      "6 nights of accommodation in our quiet campus",
      "3 freshly cooked organic vegetarian meals daily",
      "Nirvana Sound Academy Sound Healer Certificate",
      "Printed Sound Healing manual and sequencing worksheets",
      "Full access to professional quality bowls, gongs, and instruments during class",
      "Weekly local outdoor excursions (Ganga Aarti, Temple trek)",
      "Complimentary pickup from Dehradun Airport (DED)",
      "High-speed Wi-Fi",
    ],
    exclusions: [
      "Airfare and Visa expenses",
      "Travel insurance",
      "Sunday meals",
      "Personal items",
      "Purchase of personal singing bowls (available for purchase at school shop)",
    ],
    faqs: [
      {
        question: "Do I need to be a musician to take this course?",
        answer:
          "Not at all. You don't need any musical background. Sound healing works with frequency, resonance, and intention rather than complex melodies or music sheets. We teach you simple, powerful playing techniques.",
      },
      {
        question: "Can I buy the instruments at the school?",
        answer:
          "Yes. We have a selection of certified handmade Tibetan singing bowls, crystal bowls, and chimes available at our academy store. We will help you select the exact frequencies that match your energy.",
      },
      {
        question: "Are there any contraindications?",
        answer:
          "Yes. Sound healing is highly safe, but direct placements of bowls should be avoided on individuals with cardiac pacemakers, severe epilepsy, metallic implants, or during the first trimester of pregnancy. We cover these safety precautions in detail.",
      },
      {
        question: "Are there any contraindications?",
        answer:
          "Yes. Sound healing is highly safe, but direct placements of bowls should be avoided on individuals with cardiac pacemakers, severe epilepsy, metallic implants, or during the first trimester of pregnancy. We cover these safety precautions in detail.",
      },
    ],
  },
};
