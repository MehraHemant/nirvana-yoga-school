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
  originalPrice?: string;
  description: string;
  features: string[];
  image?: string;
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
        title: "Traditional Hatha Yoga",
        description:
          "Detailed study of Traditional Hatha Yoga including traditional practices and teachings.",
        subtopics: [
          "Historical contexts of hatha yoga",
          "Surya Namaskar (Sun Salutation)",
          "Chandra Namaskar (Moon Salutation)",
          "Pawan Muktasana series A, B, C",
          "Asanas (Postures)",
          "Standing Asanas",
          "Vajrasana Group of Asanas",
          "Backward Bending Asanas",
          "Forward Bending Asanas",
          "Spinal Twisting Asanas",
          "Balancing Asanas",
          "Inverted Asanas",
          "Relaxation Asanas",
          "Sequences",
          "Standing Sequence",
          "Kneeling Sequence",
          "Sitting Sequence",
          "Pronation Sequence",
          "Supination Sequence",
          "Inversion Sequence",
          "Twisting Sequence",
          "Hip-Opening Sequence",
          "Forward Bending Sequence",
          "Back Bending Sequence",
        ],
      },
      {
        title: "Ashtanga Vinyasa Yoga",
        description:
          "Detailed study of Ashtanga Vinyasa Yoga including traditional practices and teachings.",
        subtopics: [
          "Historical contexts of Ashtanga Vinyasa yoga including different asanas.",
          "Ashtanga Primary series Asanas with the asana alignment & adjustment, variations, contraindications, breathing techniques and their benefits",
          "Surya Namaskar A (Sun salutation A) - 9 Vinyasas",
          "Surya Namaskar B (Sun salutation B) - 17 Vinyasas",
          "Standing asana series",
          "Sitting asana series",
          "Closing sequesnce",
          "Understanding & practice of Vinyasa Flow",
        ],
      },
      {
        title: "Alignment & Adjustment",
        description:
          "Detailed study of Alignment & Adjustment including traditional practices and teachings.",
        subtopics: [
          "Aspects of Yoga Alignment",
          "Various Principles of Hands-Adjustments",
          "Practical lessons on Alignments & Adjustment of various Asanas",
        ],
      },
      {
        title: "Pranayama / Breathing Practices",
        description:
          "Detailed study of Pranayama / Breathing Practices including traditional practices and teachings.",
        subtopics: [
          "Historical contexts of pranayama & subtle body.",
          "Understanding of pranayama effects on your body.",
          "Four Aspects of Pranayama",
          "The Pranic Body",
          "Five Major Pranas & Five Minor Pranas",
          "Nadis - Channels of Prana",
          "Ida Pingala and Sushumna",
          "Location of the Nadis",
          "Basic Understanding of Chakras",
          "Different Types of Pranayama Practices",
          "Abdominal (or diaphragmatic) breathing",
          "Thoracic Breathing",
          "Clavicular Breathing",
          "Yogic Breathing",
          "Nadi Shodhana Pranayama/ Alternate Nostril Breathing",
          "Sheetali Pranayama/ Cooling Breath",
          "Sheetkari Pranayama",
          "Bhramari Pranayama",
          "Ujjayi Breathing",
          "Bhastrika Pranayama",
          "Kapalbhati Pranayama/ Frontal brain cleansing breath",
          "Surya Bhedi Pranayama",
          "Chandra Bhedi Pranayama",
        ],
      },
      {
        title: "Mudras & Bandhas",
        description:
          "Detailed study of Mudras & Bandhas including traditional practices and teachings.",
        subtopics: [
          "Mudras (Hand Gestures)",
          "Five Element Theory",
          "Jnana Mudra (Psychic Gesture of Knowledge)",
          "Chin Mudra (Psychic Gesture of Consciousness",
          "Hridaya Mudra (Heart Gesture)",
          "Shoonya Mudra (Gesture of Emptiness)",
          "Apan Mudra (Digestion Gesture)",
          "Prana Mudra (Invocation of energy)",
          "Vayu Mudra (Gesture of Air)",
          "Prithvi Mudra (Gesture of Earth)",
          "Buddhi Mudra (Gesture of Intellect)",
          "Bandhas (Energy Lock)",
          "Jalandhara Bandha (throat lock)",
          "Moola Bandha (perineum contraction)",
          "Uddiyana Bandha (abdominal contraction)",
          "Maha Bandha (the great lock)",
        ],
      },
      {
        title: "Shatkarma (Cleansing techniques)",
        description:
          "Detailed study of Shatkarma (Cleansing techniques) including traditional practices and teachings.",
        subtopics: ["Jalaneti", "Rubber neti", "Netra Shudhi (Eye cleansing)"],
      },
      {
        title: "Meditation",
        description:
          "Detailed study of Meditation including traditional practices and teachings.",
        subtopics: [
          "History and philosophy of meditation.",
          "What is Meditation",
          "Preparation for Meditation",
          "Asanas for Meditation",
          "Mudra & Bandhas for Meditation",
          "Different Types of Meditation Practices",
          "Mantra Meditation",
          "Guided Meditation",
          "Mindfulness Meditation",
          "Loving Kindness Meditation",
          "Inner Silence Meditation",
          "Progressive Muscle Relaxation Meditation",
          "Art Meditation",
          "Breath Awareness Meditation",
          "Emotional Awareness Meditation",
          "Raisin Meditation",
          "Trataka Meditation",
          "Chakra Meditation",
          "Yoga Nidra",
        ],
      },
      {
        title: "Mantra Chanting",
        description:
          "Detailed study of Mantra Chanting including traditional practices and teachings.",
        subtopics: [
          "Mantra Practice with their meaning",
          "Ganesh Mantra",
          "Mahāmṛtyunjaya Mantra",
          "Invocation to Guru",
          "Shanti (Peace) Mantras",
          "Pranayama Mantra",
          "Universal Peace Mantra",
          "Invocation to Patanjali",
          "Hare Krishna Maha Mantra",
        ],
      },
      {
        title: "Yoga Anatomy, Physiology & Biomechanics",
        description:
          "Detailed study of Yoga Anatomy, Physiology & Biomechanics including traditional practices and teachings.",
        subtopics: [
          "Anatomy & Physiology",
          "Levels of structural complexities",
          "Skeletal System",
          "Muscular System",
          "Nervous System",
          "Endocrine System",
          "Respiratory System",
          "Cardiovascular System",
          "Digestive System",
          "Biomechanics",
          "Force",
          "Joint Movements",
          "Safe Movements",
        ],
      },
      {
        title: "History, Yoga Philosophy & Ethics",
        description:
          "Detailed study of History, Yoga Philosophy & Ethics including traditional practices and teachings.",
        subtopics: [
          "History of Yoga",
          "Origination & Meaning of Yoga",
          "Different type of Yoga",
          "Gyana Yoga, Karma Yoga, Bhakti Yoga, Hatha Yoga, Raja Yoga",
          "The Eight Limbs of Yoga",
          "Understanding of Patanjali Yoga Sutras",
          "Understanding Bhagavad Gita",
        ],
      },
      {
        title: "Ayurveda",
        description:
          "Detailed study of Ayurveda including traditional practices and teachings.",
        subtopics: [
          "Panchamahabhutas (The Five Element Theory)",
          "The Human Constitution - Vata, Pitta, Kapha",
          "The Three Gunas - Sattva, Rajas, Tamas",
        ],
      },
      {
        title: "Teaching Methodology",
        description:
          "Detailed study of Teaching Methodology including traditional practices and teachings.",
        subtopics: [
          "Sequencing",
          "Pace",
          "Environment & ambiance of a yoga class",
          "Yoga Cues",
        ],
      },
      {
        title: "Teaching Practice",
        description:
          "Detailed study of Teaching Practice including traditional practices and teachings.",
        subtopics: [
          "Teaching/guiding a yoga class",
          "Command over teaching yoga",
          "Essential skills for teaching a yoga class",
          "Mentoring and feedback",
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
      "All-inclusive packages covering tuition, Yoga Alliance certification, meals, accommodation, and excursions. Choose the room style that best fits your comfort and budget.",
    pricing: [
      {
        roomType: "4-Shared Dorm with Balcony",
        price: "699 USD",
        originalPrice: "932 USD",
        description:
          "Budget-friendly dorm room shared with 3 fellow students. Balcony access, attached bathroom, and all essentials included.",
        features: [
          "Shared balcony access",
          "Attached bathroom",
          "3 organic vegetarian meals daily",
          "All course materials included",
        ],
      },
      {
        roomType: "2-Shared Room with Balcony",
        price: "949 USD",
        originalPrice: "1265 USD",
        description:
          "Twin-sharing room with balcony — comfortable beds, spacious layout, and a great community experience.",
        features: [
          "Private/shared balcony",
          "Attached bathroom with hot shower",
          "3 organic vegetarian meals daily",
          "Weekly excursions included",
        ],
      },
      {
        roomType: "Private Room with Balcony",
        price: "1249 USD",
        originalPrice: "1665 USD",
        description:
          "Your own private room with balcony. Perfect for quiet reflection and deep rest after intensive training.",
        features: [
          "Private balcony",
          "Fully private bathroom",
          "3 organic vegetarian meals daily",
          "All excursions & study kits",
        ],
      },
      {
        roomType: "Private Double Balcony Room (2 people)",
        price: "1798 USD",
        originalPrice: "2397 USD",
        description:
          "Premium private double room with balcony — ideal for couples or friends attending together.",
        features: [
          "Private balcony with seating",
          "Spacious premium bathroom",
          "3 organic vegetarian meals daily",
          "All course materials & activities",
        ],
      },
      {
        roomType: "Without Accommodation",
        price: "599 USD",
        originalPrice: "798 USD",
        description:
          "Tuition-only package. Ideal for students arranging their own accommodation nearby in Rishikesh.",
        features: [
          "Full course tuition",
          "Yoga Alliance certification",
          "All study materials included",
          "Daily yoga & meditation classes",
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
        title: "Ayurveda",
        description:
          "Detailed study of Ayurveda including traditional practices and teachings.",
        subtopics: [
          "Introduction to Ayurveda",
          "5-Elements Concept - Ether(Akash), Air (Vayu), Fire (Agni), Water (Jal), and Earth (Prithvi)",
          "3-Dosha Concepts (Vata, Pitta, Kapha)",
          "Prakriti - Doshic Personality",
          "Ayurvedic Diet & Nutrition",
          "Treatments in Ayurveda",
          "Ayurvedic Physiology (Agni, Kosha, Tissue, Digestive process)",
          "Tissue Formation. Digestive Process - OJUS & AMA",
          "Ayurvedic Lifestyle (Sadvritta)",
          "Utensils for Cooking & Serving in Ayurveda",
          "Diseases in Ayurveda",
          "Disease Wise Food Guidance (Common Ailments)",
          "Diagnosis in Ayurveda - 10 Fold & 8 Fold Examination",
          "3 types of Diagnosis",
          "Home Remedies",
          "Yoga & Pranayam according to Ayurveda",
          "Exquisite Gift Ideas Inspired by Ayurveda",
          "Balancing Doshas - Addressing Imbalance",
          "Essential Medicines in Ayurveda (Ayurvedic Pharmacy)",
        ],
      },
      {
        title: "Traditional Hatha Yoga",
        description:
          "Detailed study of Traditional Hatha Yoga including traditional practices and teachings.",
        subtopics: [
          "Historical contexts of hatha yoga",
          "Surya Namaskar (Sun Salutation)",
          "Chandra Namaskar (Moon Salutation)",
          "Pawan Muktasana series A, B, C",
          "Asanas (Postures)",
          "Standing Asanas",
          "Vajrasana Group of Asanas",
          "Backward Bending Asanas",
          "Forward Bending Asanas",
          "Spinal Twisting Asanas",
          "Balancing Asanas",
          "Inverted Asanas",
          "Relaxation Asanas",
          "Sequences",
          "Standing Sequence",
          "Kneeling Sequence",
          "Sitting Sequence",
          "Pronation Sequence",
          "Supination Sequence",
          "Inversion Sequence",
          "Twisting Sequence",
          "Hip-Opening Sequence",
          "Forward Bending Sequence",
          "Back Bending Sequence",
        ],
      },
      {
        title: "Mantra Chanting",
        description:
          "Detailed study of Mantra Chanting including traditional practices and teachings.",
        subtopics: [
          "Mantra Practice with their meaning",
          "Ganesh Mantra",
          "Mahāmṛtyunjaya Mantra",
          "Invocation to Guru",
          "Shanti (Peace) Mantras",
          "Pranayama Mantra",
          "Universal Peace Mantra",
          "Invocation to Patanjali",
          "Hare Krishna Maha Mantra",
        ],
      },
      {
        title: "Alignment & Adjustment",
        description:
          "Detailed study of Alignment & Adjustment including traditional practices and teachings.",
        subtopics: [
          "Aspects of Yoga Alignment",
          "Various Principles of Hands-Adjustments",
          "Practical lessons on Alignments & Adjustment of various Asanas",
        ],
      },
      {
        title: "Pranayama/ Breathing Practices",
        description:
          "Detailed study of Pranayama/ Breathing Practices including traditional practices and teachings.",
        subtopics: [
          "Historical contexts of pranayama & subtle body.",
          "Understanding of pranayama effects on your body.",
          "Four Aspects of Pranayama",
          "The Pranic Body",
          "Five Major Pranas & Five Minor Pranas",
          "Nadis - Channels of Prana",
          "Ida Pingala and Sushumna",
          "Location of the Nadis",
          "Basic Understanding of Chakras",
          "Different Types of Pranayama Practices",
          "Abdominal (or diaphragmatic) breathing",
          "Thoracic Breathing",
          "Clavicular Breathing",
          "Yogic Breathing",
          "Nadi Shodhana Pranayama/ Alternate Nostril Breathing",
          "Sheetali Pranayama/ Cooling Breath",
          "Sheetkari Pranayama",
          "Bhramari Pranayama",
          "Ujjayi Breathing",
          "Bhastrika Pranayama",
          "Kapalbhati Pranayama/ Frontal brain cleansing breath",
          "Surya Bhedi Pranayama",
          "Chandra Bhedi Pranayama",
        ],
      },
      {
        title: "Meditation",
        description:
          "Detailed study of Meditation including traditional practices and teachings.",
        subtopics: [
          "History and philosophy of meditation.",
          "What is Meditation",
          "Preparation for Meditation",
          "Asanas for Meditation",
          "Mudra & Bandhas for Meditation",
          "Different Types of Meditation Practices",
          "Mantra Meditation",
          "Guided Meditation",
          "Mindfulness Meditation",
          "Loving Kindness Meditation",
          "Inner Silence Meditation",
          "Progressive Muscle Relaxation Meditation",
          "Art Meditation",
          "Breath Awareness Meditation",
          "Emotional Awareness Meditation",
          "Raisin Meditation",
          "Trataka Meditation",
          "Chakra Meditation",
          "Yoga Nidra",
        ],
      },
      {
        title: "Mudras & Bandhas",
        description:
          "Detailed study of Mudras & Bandhas including traditional practices and teachings.",
        subtopics: [
          "Mudras (Hand Gestures)",
          "Five Element Theory",
          "Jnana Mudra (Psychic Gesture of Knowledge)",
          "Chin Mudra (Psychic Gesture of Consciousness",
          "Hridaya Mudra (Heart Gesture)",
          "Shoonya Mudra (Gesture of Emptiness)",
          "Apan Mudra (Digestion Gesture)",
          "Prana Mudra (Invocation of energy)",
          "Vayu Mudra (Gesture of Air)",
          "Prithvi Mudra (Gesture of Earth)",
          "Buddhi Mudra (Gesture of Intellect)",
          "Bandhas (Energy Lock)",
          "Jalandhara Bandha (throat lock)",
          "Moola Bandha (perineum contraction)",
          "Uddiyana Bandha (abdominal contraction)",
          "Maha Bandha (the great lock)",
        ],
      },
      {
        title: "Shatkarma (Cleansing Techniques)",
        description:
          "Detailed study of Shatkarma (Cleansing Techniques) including traditional practices and teachings.",
        subtopics: ["Jalaneti", "Rubber Neti", "Netra Shudhi (Eye cleansing)"],
      },
      {
        title: "Yoga Anatomy, Physiology & Biomechanics",
        description:
          "Detailed study of Yoga Anatomy, Physiology & Biomechanics including traditional practices and teachings.",
        subtopics: [
          "Anatomy & Physiology",
          "Levels of structural complexities",
          "Skeletal System",
          "Muscular System",
          "Nervous System",
          "Endocrine System",
          "Respiratory System",
          "Cardiovascular System",
          "Digestive System",
          "Biomechanics",
          "Force",
          "Joint Movements",
          "Safe Movements",
        ],
      },
      {
        title: "History, Yoga Philosophy & Ethics",
        description:
          "Detailed study of History, Yoga Philosophy & Ethics including traditional practices and teachings.",
        subtopics: [
          "History of Yoga",
          "Origination & Meaning of Yoga",
          "Different type of Yoga",
          "Gyana Yoga, Karma Yoga, Bhakti Yoga, Hatha Yoga, Raja Yoga",
          "The Eight Limbs of Yoga",
          "Understanding of Patanjali Yoga Sutras",
          "Understanding Bhagavad Gita",
        ],
      },
      {
        title: "Teaching Methodology",
        description:
          "Detailed study of Teaching Methodology including traditional practices and teachings.",
        subtopics: [
          "Sequencing",
          "Pace",
          "Environment & ambiance of a yoga class",
          "Yoga Cues",
        ],
      },
      {
        title: "Teaching Practice",
        description:
          "Detailed study of Teaching Practice including traditional practices and teachings.",
        subtopics: [
          "Teaching/guiding a yoga class",
          "Command over teaching yoga",
          "Essential skills for teaching a yoga class",
          "Mentoring and feedback",
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
        title: "Meditation",
        description:
          "Detailed study of Meditation including traditional practices and teachings.",
        subtopics: [
          "History and philosophy of meditation.",
          "What is Meditation",
          "Preparation for Meditation",
          "Asanas for Meditation",
          "Mudra & Bandhas for Meditation",
          "Different Types of Meditation Practices",
          "Mantra Meditation",
          "Guided Meditation",
          "Mindfulness Meditation",
          "Loving Kindness Meditation",
          "Inner Silence Meditation",
          "Progressive Muscle Relaxation Meditation",
          "Art Meditation",
          "Breath Awareness Meditation",
          "Emotional Awareness Meditation",
          "Raisin Meditation",
          "Trataka Meditation",
          "Chakra Meditation",
        ],
      },
      {
        title: "Yoga Nidra",
        description:
          "Detailed study of Yoga Nidra including traditional practices and teachings.",
        subtopics: [
          "The Art of Relaxation",
          "Yoga Nidra: History & Origin",
          "Yoga Nidra in Tantra",
          "The Science & Anatomy of Yoga Nidra",
          "Yoga Nidra and the Brain",
          "4 Brain States: Beta, Alpha, Theta, Delta",
          "Sleeps, Dreams, and Yoga Nidra",
          "Benefits of Yoga Nidra",
          "States of Consciousness",
          "Yoga Nidra and Visualisation",
          "Different Levels of Yoga Nidra",
          "Layers of Existence",
          "Therapeutic Applications",
          "Yoga Nidra as Meditation",
          "How to Practice and Teach Yoga Nidra",
          "Yoga Nidra for Children",
          "Relation between Yoga Nidra & Ashtanga Yoga",
          "Yoga Nidra & Hypnosis",
          "Chakras, Senses and Yoga Nidra",
        ],
      },
      {
        title: "Mantra Chanting",
        description:
          "Detailed study of Mantra Chanting including traditional practices and teachings.",
        subtopics: [
          "Mantra Practice with their meaning",
          "Ganesh Mantra",
          "Mahāmṛtyunjaya Mantra",
          "Invocation to Guru",
          "Shanti (Peace) Mantras",
          "Pranayama Mantra",
          "Universal Peace Mantra",
          "Invocation to Patanjali",
          "Hare Krishna Maha Mantra",
        ],
      },
      {
        title: "Traditional Hatha Yoga",
        description:
          "Detailed study of Traditional Hatha Yoga including traditional practices and teachings.",
        subtopics: [
          "Historical contexts of hatha yoga",
          "Surya Namaskar (Sun Salutation)",
          "Chandra Namaskar (Moon Salutation)",
          "Pawan Muktasana series A, B, C",
          "Asanas (Postures)",
          "Standing Asanas",
          "Vajrasana Group of Asanas",
          "Backward Bending Asanas",
          "Forward Bending Asanas",
          "Spinal Twisting Asanas",
          "Balancing Asanas",
          "Inverted Asanas",
          "Relaxation Asanas",
          "Sequences",
          "Standing Sequence",
          "Kneeling Sequence",
          "Sitting Sequence",
          "Pronation Sequence",
          "Supination Sequence",
          "Inversion Sequence",
          "Twisting Sequence",
          "Hip-Opening Sequence",
          "Forward Bending Sequence",
          "Back Bending Sequence",
        ],
      },
      {
        title: "Pranayama / Breathing Practices",
        description:
          "Detailed study of Pranayama / Breathing Practices including traditional practices and teachings.",
        subtopics: [
          "Historical contexts of pranayama & subtle body.",
          "Understanding of pranayama effects on your body.",
          "Four Aspects of Pranayama",
          "The Pranic Body",
          "Five Major Pranas & Five Minor Pranas",
          "Nadis - Channels of Prana",
          "Ida Pingala and Sushumna",
          "Location of the Nadis",
          "Basic Understanding of Chakras",
          "Different Types of Pranayama Practices",
          "Abdominal (or diaphragmatic) breathing",
          "Thoracic Breathing",
          "Clavicular Breathing",
          "Yogic Breathing",
          "Nadi Shodhana Pranayama/ Alternate Nostril Breathing",
          "Sheetali Pranayama/ Cooling Breath",
          "Sheetkari Pranayama",
          "Bhramari Pranayama",
          "Ujjayi Breathing",
          "Bhastrika Pranayama",
          "Kapalbhati Pranayama/ Frontal brain cleansing breath",
          "Surya Bhedi Pranayama",
          "Chandra Bhedi Pranayama",
        ],
      },
      {
        title: "Shatkarma (Cleansing Techniques)",
        description:
          "Detailed study of Shatkarma (Cleansing Techniques) including traditional practices and teachings.",
        subtopics: ["Jalaneti", "Rubber neti", "Netra Shudhi (Eye cleansing)"],
      },
      {
        title: "Mudras & Bandhas",
        description:
          "Detailed study of Mudras & Bandhas including traditional practices and teachings.",
        subtopics: [
          "Mudras (Hand Gestures)",
          "Five Element Theory",
          "Jnana Mudra (Psychic Gesture of Knowledge)",
          "Chin Mudra (Psychic Gesture of Consciousness",
          "Hridaya Mudra (Heart Gesture)",
          "Shoonya Mudra (Gesture of Emptiness)",
          "Apan Mudra (Digestion Gesture)",
          "Prana Mudra (Invocation of energy)",
          "Vayu Mudra (Gesture of Air)",
          "Prithvi Mudra (Gesture of Earth)",
          "Buddhi Mudra (Gesture of Intellect)",
          "Bandhas (Energy Lock)",
          "Jalandhara Bandha (throat lock)",
          "Moola Bandha (perineum contraction)",
          "Uddiyana Bandha (abdominal contraction)",
          "Maha Bandha (the great lock)",
        ],
      },
      {
        title: "Yoga Anatomy, Physiology & Biomechanics",
        description:
          "Detailed study of Yoga Anatomy, Physiology & Biomechanics including traditional practices and teachings.",
        subtopics: [
          "Anatomy & Physiology",
          "Levels of structural complexities",
          "Skeletal System",
          "Muscular System",
          "Nervous System",
          "Endocrine System",
          "Respiratory System",
          "Cardiovascular System",
          "Digestive System",
          "Biomechanics",
          "Force",
          "Joint Movements",
          "Safe Movements",
        ],
      },
      {
        title: "History, Yoga Philosophy & Ethics",
        description:
          "Detailed study of History, Yoga Philosophy & Ethics including traditional practices and teachings.",
        subtopics: [
          "History of Yoga",
          "Origination & Meaning of Yoga",
          "Different type of Yoga",
          "Gyana Yoga, Karma Yoga, Bhakti Yoga, Hatha Yoga, Raja Yoga",
          "The Eight Limbs of Yoga",
          "Understanding of Patanjali Yoga Sutras",
          "Understanding Bhagavad Gita",
        ],
      },
      {
        title: "Teaching Methodology",
        description:
          "Detailed study of Teaching Methodology including traditional practices and teachings.",
        subtopics: [
          "Sequencing",
          "Pace",
          "Environment & ambiance of a meditation class",
          "Meditation scripts",
        ],
      },
      {
        title: "Teaching Practice",
        description:
          "Detailed study of Teaching Practice including traditional practices and teachings.",
        subtopics: [
          "Teaching/guiding a meditation class",
          "Command over teaching meditation & yoga",
          "Essential skills for teaching a meditation class",
          "Mentoring and feedback",
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
        title: "Mantra Chanting",
        description:
          "Detailed study of Mantra Chanting including traditional practices and teachings.",
        subtopics: [
          "Different types of Mantra Chanting for Kundalini practice",
          "Chakra Beej Mantra for each Chakra",
        ],
      },
      {
        title: "Kundalini Asanas",
        description:
          "Detailed study of Kundalini Asanas including traditional practices and teachings.",
        subtopics: [
          "Asanas for Root Chakra (Mooladhara Chakra)",
          "Asanas for Sacral Chakra (Swadhisthana Chakra)",
          "Asanas for Solar Plexus Chakra (Manipura Chakra)",
          "Asanas for Heart Chakra (Anahata Chakra)",
          "Asanas for Throat Chakra (Vishuddha Chakra)",
          "Asanas for Third Eye Chakra (Ajna Chakra)",
          "Asanas for Crown Chakra (Sahasrara Chakra)",
        ],
      },
      {
        title: "Kundalini Pranayama",
        description:
          "Detailed study of Kundalini Pranayama including traditional practices and teachings.",
        subtopics: [
          "Four Aspects of Pranayama",
          "The Pranic Body",
          "Five Major Pranas & Five Minor Pranas",
          "Nadis - Channels of Prana",
          "Ida Pingala and Sushumna",
          "Location of the Nadis",
          "Kundalini Pranayama Practices",
          "Different Types of Pranayama for Kundalini Chakras",
          "Shat-Karmas (Purification process)",
        ],
      },
      {
        title: "Kundalini Meditatio",
        description:
          "Detailed study of Kundalini Meditatio including traditional practices and teachings.",
        subtopics: [
          "Different types Meditations",
          "Practices & Process for each Kundalini Chakra Activation",
          "Yoga Nidra Practices",
        ],
      },
      {
        title: "Mudras & Bandhas",
        description:
          "Detailed study of Mudras & Bandhas including traditional practices and teachings.",
        subtopics: [
          "Hasta (hand mudras)",
          "Mana (head mudras)",
          "Kaya (postural mudras)",
          "Adhara (perineal mudras)",
          "Jalandhara Bandha (throat lock)",
          "Moola Bandha (perineum contraction)",
          "Uddiyana Bandha (abdominal contraction)",
          "Maha Bandha (the great lock)",
        ],
      },
      {
        title: "Alignment & Adjustment",
        description:
          "Detailed study of Alignment & Adjustment including traditional practices and teachings.",
        subtopics: [
          "Aspects of Yoga Alignment",
          "Various Principles of Hands-Adjustments",
          "Practical lessons on Alignments & Adjustment of various Asanas",
        ],
      },
      {
        title: "Anatomy, Physiology & Biomechanics",
        description:
          "Detailed study of Anatomy, Physiology & Biomechanics including traditional practices and teachings.",
        subtopics: [
          "Kundalini Anatomy",
          "Skeletal System",
          "Muscular System",
          "Nervous System",
          "Endocrine system",
          "Respiratory System",
          "Cardiovascular System",
          "Digestive System",
          "Force",
          "Joint Movements",
          "Safe Movements",
        ],
      },
      {
        title: "Yoga & Kundalini Philosophy",
        description:
          "Detailed study of Yoga & Kundalini Philosophy including traditional practices and teachings.",
        subtopics: [
          "History of Yoga",
          "What is Kundalini?",
          "History of Kundalini",
          "Understanding of the Chakras",
          "Introduction to Patanjali Yoga Sutras",
          "Introduction to Bhagavad Gita",
          "Eight Limbs of Yoga",
        ],
      },
      {
        title: "Ayurveda",
        description:
          "Detailed study of Ayurveda including traditional practices and teachings.",
        subtopics: [
          "Panchamahabhutas (The Five Element Theory)",
          "The Human Constitution (Prakruti) - Vata, Pitta, Kapha",
          "The Three Gunas - Sattva, Rajas, Tamas",
        ],
      },
      {
        title: "Teaching Methodology",
        description:
          "Detailed study of Teaching Methodology including traditional practices and teachings.",
        subtopics: [
          "Sequencing",
          "Pace",
          "Environment",
          "Cueing",
          "Teaching Practice",
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
        title: "Teaching Teachniques of Asana practice",
        description:
          "Detailed study of Teaching Teachniques of Asana practice including traditional practices and teachings.",
        subtopics: [
          "Practice & Teaching techniques of advanced yoga poses",
          "Minute to major teaching details",
          "Advanced variations of poses",
          "Class planning, sequencing & managing",
        ],
      },
      {
        title: "Hatha Yoga",
        description:
          "Detailed study of Hatha Yoga including traditional practices and teachings.",
        subtopics: [
          "Traditional Sun Salutation - Extended practice",
          "Deeper understanding of Hatha Yoga",
          "Advanced Standing asanas",
          "Advanced Kneeling asanas",
          "Advanced Sitting asanas",
          "Advanced Forward bending asanas",
          "Advanced Backward bending asanas",
          "Advanced Twisting asanas",
          "Advanced Arm balancing asanas",
          "Hip openig asanas",
          "Advanced Prone asnanas",
          "Advanced Supine asanas",
          "Advanced Inversion asanas",
          "Advanced Balancing asanas",
        ],
      },
      {
        title: "Ashtanga Vinyasa Yoga",
        description:
          "Detailed study of Ashtanga Vinyasa Yoga including traditional practices and teachings.",
        subtopics: [
          "Ashtanga Secondary(Intermediate) series with the asana alignment & adjustment, variations, contraindications, breathing techniques and their benefits",
          "Surya Namaskar A (Sun salutation A) - 9 Vinyasas",
          "Surya Namaskar B (Sun salutation B) - 17 Vinyasas",
          "Ashtanga secondary(intermediate) series",
        ],
      },
      {
        title: "Pranayama (Breathing Practices)",
        description:
          "Detailed study of Pranayama (Breathing Practices) including traditional practices and teachings.",
        subtopics: [
          "Introdcution of Bandhas to Pranayama Practices",
          "Nadi Shodhana Pranayama - Advanced practice",
          "Kapalbhati Pranayam - - Advanced practice",
          "Sheetali Pranayama - Advanced practice",
          "Sheetkari Pranayama - Advanced practice",
          "Brahmari Pranayama - Advanced practice",
          "Ujjayi Pranayama - Advanced practice",
          "Bhastrika Pranayama - Advanced practice",
          "Moorchaa Pranayama - Advanced practice",
          "Surya Bedhi Pranayama - Advanced practice",
          "Chandra Bedhi Pranayama - Advanced practice",
          "Pranayama Teaching Methodology",
          "Practicing Pranayama Teaching",
        ],
      },
      {
        title: "Mudra (Hand Gestures)",
        description:
          "Detailed study of Mudra (Hand Gestures) including traditional practices and teachings.",
        subtopics: [
          "Unmani Mudra",
          "Vipareeta Karani Mudra",
          "Pashinee Mudra",
          "Tadagi Mudra",
          "Prana Mudra",
          "Yoga Mudra",
          "Manduki Mudra",
          "Maha Mudra",
          "Maha Bheda Mudra",
          "Maha Vedha Mudra",
          "Ashwini Mudra",
          "Vajroli Mudra",
        ],
      },
      {
        title: "Bandha (Energy Lock)",
        description:
          "Detailed study of Bandha (Energy Lock) including traditional practices and teachings.",
        subtopics: [
          "Introduction to Bandha",
          "Bandhas & Granthis",
          "Jalandhara Bandha",
          "Moola Bandha",
          "Uddiyana Bandha",
          "Maha Bandha",
        ],
      },
      {
        title: "Shatkarma (Cleansing techniques)",
        description:
          "Detailed study of Shatkarma (Cleansing techniques) including traditional practices and teachings.",
        subtopics: [
          "Jalaneti(Respiratiry cleansing)",
          "Rubber neti(Respiratiry cleansing)",
          "Netra Shudhi (Eye cleansing)",
          "Shankaprakshalana kriya (Digestive cleaning)",
        ],
      },
      {
        title: "Meditation",
        description:
          "Detailed study of Meditation including traditional practices and teachings.",
        subtopics: [
          "Philosophy & Psychology of Meditation",
          "Postures for Meditation",
          "Sukhasana (Easy pose)",
          "Padmasana (Lotus pose)",
          "Arddha Padmasana (Half lotus pose)",
          "Vajrasana (Thunderbolt pose)",
          "Bhadrasana (Gracious pose)",
          "Siddhasana (Accomplished pose)",
          "Swastikasana (Auspicious pose)",
          "Developing concentration techniques",
          "Anatomy & Meditation",
          "Meditation Teaching Methodolody",
          "Practing Guided meditation",
          "Advancing from the 200 hour Meditation Practices",
          "Om Meditation - Advanced",
          "Body awareness meditation",
          "Japa Meditation",
          "Yoga Nidra Meditation",
          "Mindfulness meditation",
          "Walking meditation",
          "Eating meditation",
          "Breathing meditation",
          "Mantra meditation",
          "Kundalini Chakra meditation",
          "Trataka meditation",
          "Buddhist meditation",
          "Zen/Dynamic meditation",
          "Adapting different methodology for meditation.",
        ],
      },
      {
        title: "Yoga Therapy",
        description:
          "Detailed study of Yoga Therapy including traditional practices and teachings.",
        subtopics: [
          "Foundation Yoga Therapy",
          "Introduction",
          "Pancha Koshas",
          "Tri Gunas",
          "The concept of Health (Arogya & Svasthya)",
          "Pancha Mahabhoot",
          "Concept of Diseases",
          "Decoding Stress as per Yoga & Bhagwad Geeta",
          "Psycho-Somatic Diseases",
          "Integrated Approach of Yoga Therapy",
          "Annamaya Kosha (Physical Body)",
          "Diet Exercise",
          "Asanas",
          "Kriyas",
          "Pranayama Kosha (Pranic Body)",
          "Manomaya Kosha (Mental Body)",
          "Vijnanmaya Kosha (Intellectual Body)",
          "Anandamaya Kosha (Bliss Body)",
        ],
      },
      {
        title: "History, Yoga Philosophy & Ethics",
        description:
          "Detailed study of History, Yoga Philosophy & Ethics including traditional practices and teachings.",
        subtopics: [
          "Deeper understanding Patanjali Sutras",
          "Deeper understanding of Bhagavad Gita",
          "Deeper understanding of Yoga pradipika",
          "Deeper understanding of Upanishads & Vedas",
          "Yoga Alliance Ethical Commitment: Scope & Code of Conduct",
          "Understanding and taking responsibility to increase equity in yoga",
          "Consideration of Accountability",
          "Introspection of how yoga ethics can be correlated with teaching and practising",
        ],
      },
      {
        title: "Ayurveda",
        description:
          "Detailed study of Ayurveda including traditional practices and teachings.",
        subtopics: [
          "Introduction to Ayurveda",
          "5-Elements Concept - Ether(Akash), Air (Vayu), Fire (Agni), Water (Jal), and Earth (Prithvi)",
          "3-Dosha Concepts (Vata, Pitta, Kapha)",
          "Prakriti - Doshic Personality",
          "Ayurvedic Diet & Nutrition",
          "Treatments in Ayurveda",
          "Ayurvedic Physiology (Agni, Kosha, Tissue, Digestive process)",
          "Tissue Formation. Digestive Process - OJUS & AMA",
          "Ayurvedic Lifestyle (Sadvritta)",
          "Utensils for Cooking & Serving in Ayurveda",
          "Diseases in Ayurveda",
          "Disease Wise Food Guidance (Common Ailments)",
          "Diagnosis in Ayurveda - 10 Fold & 8 Fold Examination",
          "3 types of Diagnosis",
          "Home Remedies",
          "Yoga & Pranayam according to Ayurveda",
          "Exquisite Gift Ideas Inspired by Ayurveda",
          "Balancing Doshas - Addressing Imbalance",
          "Essential Medicines in Ayurveda (Ayurvedic Pharmacy)",
        ],
      },
      {
        title: "Teaching Methodology",
        description:
          "Detailed study of Teaching Methodology including traditional practices and teachings.",
        subtopics: [
          "Teaching yoga sequences, adjustments and alignment",
          "Pace of yoga",
          "Ambiance of a yoga class",
          "Cues in a yoga class (physical, verbal, visual instructions and demonstrations)",
          "Class management",
        ],
      },
      {
        title: "Teaching Practice",
        description:
          "Detailed study of Teaching Practice including traditional practices and teachings.",
        subtopics: [
          "Teaching/guiding a yoga class",
          "Command over teaching yoga",
          "Essential skills for teaching a yoga class",
          "Mentoring and feedback",
        ],
      },
      {
        title: "Professional Development",
        description:
          "Detailed study of Professional Development including traditional practices and teachings.",
        subtopics: [
          "Knowledge about other yoga associations and Yoga Alliance certifying system",
          "Ethical Pledge: Scope, Code of Conduct and Equity",
          "Lifetime learning and Education",
          "Professionalism, cleanliness & time management",
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
        title: "Traditional Hatha Yoga",
        description:
          "Detailed study of Traditional Hatha Yoga including traditional practices and teachings.",
        subtopics: [
          "Historical contexts of hatha yoga",
          "Pawan muktasana series 1, 2 & 3",
          "Traditional Surya Namaskara (Sun Salutation)",
          "Standing asana series - Basic to Advanced",
          "Kneeling asana series - Basic to Advanced",
          "Sitting asana series - Basic to Advanced",
          "Forward bending asana series - Basic to Advanced",
          "Backward bending asana series - Basic to Advanced",
          "Twisting asana series - Basic to Advanced",
          "Arm balancing asana series - Basic to Advanced",
          "Prone asana series - Basic to Advanced",
          "Supine asana series - Basic to Advanced",
          "Inversion asana series - Basic to Advanced",
          "Balancing asana series - Basic to Advanced",
          "Relaxing asana series - Basic to Advanced",
        ],
      },
      {
        title: "Ashtanga Vinyasa Yoga",
        description:
          "Detailed study of Ashtanga Vinyasa Yoga including traditional practices and teachings.",
        subtopics: [
          "Historical contexts of Ashtanga Vinyasa yoga including different asanas.",
          "Ashtanga Primary series Asanas with the asana alignment & adjustment, variations, contraindications, breathing techniques, and their benefits",
          "Surya Namaskar A (Sun salutation A) - 9 Vinyasas",
          "Surya Namaskar B (Sun salutation B) - 17 Vinyasas",
          "Standing asana series",
          "Sitting asana series",
          "Closing sequence",
          "Understanding & practice of Vinyasa Flow",
          "Ashtanga Secondary(Intermediate) series with the asana alignment & adjustment, variations, contraindications, breathing techniques and their benefits",
        ],
      },
      {
        title: "Teaching Techniques, Alignment & Adjustment",
        description:
          "Detailed study of Teaching Techniques, Alignment & Adjustment including traditional practices and teachings.",
        subtopics: [
          "Practice & Teaching techniques of advanced yoga pose",
          "Minute-to-major teaching details",
          "Advanced variations of poses",
          "Correction technquies",
          "Class planning, sequencing & managing",
        ],
      },
      {
        title: "Pranayama (Breathwork)",
        description:
          "Detailed study of Pranayama (Breathwork) including traditional practices and teachings.",
        subtopics: [
          "Historical contexts of pranayama & subtle body.",
          "Understanding of pranayama effects on your body.",
          "Meaning & explanation of Pranayama terms",
          "Sequence of Pranayama with alternatives & Adaptations",
          "Natural Breathing",
          "Abdominal Breathing",
          "Thoracic Breathing",
          "Clavicular Breathing",
          "Yogic Breathing",
          "Different type of Pranayama",
          "Kapalbhati Pranayama - Basic to advanced",
          "Nadi sodhana Pranayama - Basic to advanced",
          "Ujjayi Pranayama - Basic to advanced",
          "Bhastrika pranayama - Basic to advanced",
          "Brahmari pranayama - Basic to advanced",
          "Surya Bhedi Pranayama - Basic to advanced",
          "Chandra Bedhi Pranayama - Basic to advanced",
          "Sheetali Pranayama - Basic to advanced",
          "Sheetkari Pranayama - Basic to advanced",
          "Understanding the importance of prana vayus, nadis, chakras, kleshas, and koshas.",
          "Introduction of Bandhas to Pranayama Practices",
          "Pranayama Teaching Methodology",
          "Practicing Pranayama Teaching",
        ],
      },
      {
        title: "Mudra (Hand Gestures)",
        description:
          "Detailed study of Mudra (Hand Gestures) including traditional practices and teachings.",
        subtopics: [
          "Introduction to Mudra",
          "Five groups of Yoga Mudras",
          "Jnana and Chin Mudras",
          "Yoni Mudra",
          "Bhairava Mudra",
          "Hridaya Mudra",
          "Shambhavi Mudra",
          "Khechari Mudra",
          "Kaki Mudra",
          "Bhujangini Mudra",
          "Bhoochari Mudra",
          "Akashi Mudra",
          "Shanmuki Mudra",
          "Unmani Mudra",
          "Vipareeta Karani Mudra",
          "Pashinee Mudra",
          "Tadagi Mudra",
          "Prana Mudra",
          "Yoga Mudra",
          "Manduki Mudra",
          "Maha Mudra",
          "Maha Bheda Mudra",
          "Ashwini Mudra Mudra",
          "Vajroli Mudra Mudra",
        ],
      },
      {
        title: "Bandhas (Energy Locks)",
        description:
          "Detailed study of Bandhas (Energy Locks) including traditional practices and teachings.",
        subtopics: [
          "Introduction to Bandha",
          "Bandhas & Granthis",
          "Jalandhara Bandha",
          "Moola Bandha",
          "Uddiyana Bandha",
          "Maha Bandha",
        ],
      },
      {
        title: "Shatkarma (Cleansing techniques)",
        description:
          "Detailed study of Shatkarma (Cleansing techniques) including traditional practices and teachings.",
        subtopics: [
          "Jalaneti(Respiratory cleansing)",
          "Rubber neti (Respiratory cleansing)",
          "Netra Shudhi (Eye cleansing)",
          "shankaprakshalana kriya (Digestive cleaning)",
        ],
      },
      {
        title: "Meditation & Mantra Chanting",
        description:
          "Detailed study of Meditation & Mantra Chanting including traditional practices and teachings.",
        subtopics: [
          "History and philosophy of meditation",
          "Postures for Meditation",
          "Sukhasana (Easy pose)",
          "Padmasana (Lotus pose)",
          "Arddha Padmasana (Half lotus pose)",
          "Vajrasana (Thunderbolt pose)",
          "Bhadrasana (Gracious pose)",
          "Siddhasana (Accomplished pose)",
          "Swastikasana (Auspicious pose)",
          "Mantra Chanting",
          "The science behind mantra chanting.",
          "Different Mantra chanting practice with their meaning",
          "Vibrations and truce methods for chanting.",
          "Important terms in Meditation.",
          "Different Types of Meditation Practices",
          "Om Meditation",
          "Body awareness meditation",
          "Mindfulness meditation",
          "Walking meditation",
          "Eating meditation",
          "Breathing meditation",
          "Mantra meditation",
          "Kundalini Chakra meditation",
          "Trataka meditation",
          "Buddhist meditation",
          "Zen/Dynamic meditation",
          "Adapting different methodologies for meditation",
          "Developing concentration techniques",
          "Anatomy & Meditation",
          "Meditation Teaching Methodology",
          "Practicing Guided meditation",
        ],
      },
      {
        title: "Yoga Anatomy, Physiology & Biomechanics",
        description:
          "Detailed study of Yoga Anatomy, Physiology & Biomechanics including traditional practices and teachings.",
        subtopics: [
          "Anatomy & Physiology",
          "Musculoskeletal System",
          "Respiratory System",
          "Cardiovascular System",
          "Nervous System",
          "Endocrine System",
          "Digestion System",
          "Connection between body systerms and yoga.",
          "Biomechanics - Basic to Advanced",
          "Force",
          "Types Of Joint Movements",
          "Joint Stability",
          "Safe Movement",
          "Contraindications, Alignment, & Adjustments",
        ],
      },
      {
        title: "Yoga Therapy",
        description:
          "Detailed study of Yoga Therapy including traditional practices and teachings.",
        subtopics: [
          "Introduction to Yoga Therapy",
          "Practical Application of Yoga practice in Yoga Therapy",
          "Therapeutic benefits of Hatha Yoga",
          "Yoga Therapy for various health disorders",
          "Head & Neck",
          "Cardiovascular system",
          "The respiratory system",
          "Gastro-Intestinal Tract",
          "Joints & Musculo-SKeletal system",
          "Urogenital system",
          "Integration of Yoga Therapy with Pranayama & Meditation",
        ],
      },
      {
        title: "History, Yoga Philosophy & Ethics",
        description:
          "Detailed study of History, Yoga Philosophy & Ethics including traditional practices and teachings.",
        subtopics: [
          "Definition and principles of Yoga",
          "Different types of yoga",
          "Important factors in yoga",
          "Connection between meditation, pranayama, and asana",
          "Deeper understanding Patanjali Sutras",
          "A deeper understanding of the Bhagavad Gita",
          "A deeper understanding of Upanishads & Vedas",
          "Relation between yoga philosophy and practices",
          "Knowledge of the Yoga Sutras or other related yogic ethical principles",
          "Yoga Alliance Ethical Commitment: Scope & Code of Conduct",
          "Understanding and taking responsibility to increase equity in yoga",
          "Consideration of Accountability",
          "Introspection of how yoga ethics can be correlated with teaching and practicing",
        ],
      },
      {
        title: "Ayurveda",
        description:
          "Detailed study of Ayurveda including traditional practices and teachings.",
        subtopics: [
          "Introduction to Ayurveda",
          "5-Elements Concept - Ether(Akash), Air (Vayu), Fire (Agni), Water (Jal), and Earth (Prithvi)",
          "3-Dosha Concepts (Vata, Pitta, Kapha)",
          "Prakriti - Doshic Personality",
          "Ayurvedic Diet & Nutrition",
          "Treatments in Ayurveda",
          "Ayurvedic Physiology (Agni, Kosha, Tissue, Digestive process)",
          "Tissue Formation. Digestive Process - OJUS & AMA",
          "Ayurvedic Lifestyle (Sadvritta)",
          "Utensils for Cooking & Serving in Ayurveda",
          "Diseases in Ayurveda",
          "Disease Wise Food Guidance (Common Ailments)",
          "Diagnosis in Ayurveda - 10 Fold & 8 Fold Examination",
          "3 types of Diagnosis",
          "Home Remedies",
          "Yoga & Pranayam according to Ayurveda",
          "Exquisite Gift Ideas Inspired by Ayurveda",
          "Balancing Doshas - Addressing Imbalance",
          "Essential Medicines in Ayurveda (Ayurvedic Pharmacy)",
        ],
      },
      {
        title: "Teaching Methodology",
        description:
          "Detailed study of Teaching Methodology including traditional practices and teachings.",
        subtopics: [
          "Teaching yoga sequences, adjustments, and alignment",
          "Pace of yoga",
          "Ambiance of a yoga class",
          "Cues in a yoga class (physical, verbal, visual instructions and demonstrations)",
          "Class management",
        ],
      },
      {
        title: "Teaching Practice",
        description:
          "Detailed study of Teaching Practice including traditional practices and teachings.",
        subtopics: [
          "Teaching/guiding a yoga class",
          "Command over teaching yoga",
          "Essential skills for teaching a yoga class",
          "Mentoring and feedback",
        ],
      },
      {
        title: "Professional Development",
        description:
          "Detailed study of Professional Development including traditional practices and teachings.",
        subtopics: [
          "Knowledge about other yoga associations and Yoga Alliance certifying system",
          "Ethical Pledge: Scope, Code of Conduct, and Equity",
          "Lifetime Learning and Education",
          "Professionalism, cleanliness & time management",
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
        title: "Yin Yoga Asanas",
        description:
          "Detailed study of Yin Yoga Asanas including traditional practices and teachings.",
        subtopics: [
          "Chest-Opening Asanas",
          "Standing Forward Bending Asanas",
          "Seated Forward Bending Asana",
          "Hip Joint Asanas",
          "Dragon Cycle Asanas",
          "Supine Asanas",
          "Sitting & Kneeling Asanas",
          "Inversion Asanas",
          "SLateral Flexion Twisting Asanas",
          "Hip-Opening Asanas",
          "Restorative Asanas",
        ],
      },
      {
        title: "Yin Yoga Sequences",
        description:
          "Detailed study of Yin Yoga Sequences including traditional practices and teachings.",
        subtopics: [
          "Gentle Stretch Full Body Sequence",
          "Hip-Opening Sequence",
          "Spinal Sequence",
          "Wall Sequence",
          "Back-Bending Sequence",
          "Chair Sequence",
          "Upper Body Sequence",
          "Yin Yoga for Pregnancy",
          "Kidney, Liver & Gall Bladder Sequence",
          "Stomach & Spleen Sequence",
        ],
      },
      {
        title: "Yin Meditation",
        description:
          "Detailed study of Yin Meditation including traditional practices and teachings.",
        subtopics: [
          "Foundational concepts",
          "Body awareness & Scanning",
          "Yin Meditation Poses",
          "Guided Meditation",
          "Different types of YinMeditation",
          "Yoga Nidra",
        ],
      },
      {
        title: "Yin Pranayama",
        description:
          "Detailed study of Yin Pranayama including traditional practices and teachings.",
        subtopics: [
          "Breath Rates & Notes for Pranayama Practice",
          "Yin & Yang Types of Breathing",
          "Benefits of Pranayama",
          "Yin-Yang Breathing (Chandra/Surya Bhedan)",
          "Other Yin Pranayama Techniques",
          "Different types of Yin Pranayama Practices",
          "Yin Mudras",
          "Yang Practices",
        ],
      },
      {
        title: "Yin Yoga Philosophy",
        description:
          "Detailed study of Yin Yoga Philosophy including traditional practices and teachings.",
        subtopics: [
          "Pancha Kosha (5 Koshas)",
          "History of Yin Yoga",
          "8 Limbs of Yin Yoga",
          "Do’s and Dont's of Yin Yoga",
          "Introduction to Hatha Yoga",
          "Origin of Yin Yoga",
          "Need for Yin Yoga",
          "Yin & Yang Tissues",
          "Things to consider before practicing Yin Yoga",
        ],
      },
      {
        title: "Yin Meridian",
        description:
          "Detailed study of Yin Meridian including traditional practices and teachings.",
        subtopics: [
          "Connective Tissues",
          "Types of Meridian",
          "Center-line Meridian",
          "Principle Meridian",
          "Stomach & Spleen",
          "Small Intestine & Heart",
          "Urinary Bladder & Kidney",
          "Pericardium & Triple Warmer",
          "Liver & Gall Bladder",
          "Lung & Large Intestine",
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
        title: "Philosophy & Science of Sound Healing",
        description:
          "Detailed study of Philosophy & Science of Sound Healing including traditional practices and teachings.",
        subtopics: [
          "Journey into the ancient roots of India, Nepal, and Tibet to learn how sound has been used for centuries to heal the human mind.",
        ],
      },
      {
        title: "Power of Singing Bowls",
        description:
          "Detailed study of Power of Singing Bowls including traditional practices and teachings.",
        subtopics: [
          "Learn the secret of singing bowls, the special tools of sound therapy and how their vibrations bring positivity to mind and body.",
        ],
      },
      {
        title: "Professional Training",
        description:
          "Detailed study of Professional Training including traditional practices and teachings.",
        subtopics: [
          "Be an expert at the art of playing bowls for self-healing and conducting group sessions with techniques that are safe and effective.",
        ],
      },
      {
        title: "Guided by Professional",
        description:
          "Detailed study of Guided by Professional including traditional practices and teachings.",
        subtopics: [
          "Enjoy interactive sessions filled with science, philosophies, demonstrations, hands-on practice, and open Q&A for the therapy.",
        ],
      },
      {
        title: "Chakra Balancing with Sound",
        description:
          "Detailed study of Chakra Balancing with Sound including traditional practices and teachings.",
        subtopics: [
          "Discover how sound can clear all blockages and balance chakras, leaving the mind more relaxed and centred.",
        ],
      },
      {
        title: "Healing Sound Massage",
        description:
          "Detailed study of Healing Sound Massage including traditional practices and teachings.",
        subtopics: [
          "Offer a unique massage through sound that recharges energy at the cellular level and brings complete renewal.",
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
