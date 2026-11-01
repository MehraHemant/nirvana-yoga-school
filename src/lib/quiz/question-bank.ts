import type { QuizCategoryId } from "@/content/types/quiz-categories";

/** One seeded multiple-choice question. `correctIndex` is the right option. */
export type QuizBankQuestion = {
  id: string;
  category: QuizCategoryId;
  prompt: string;
  options: readonly [string, string, string, string];
  /** Zero-based index of the correct option. Options are not shuffled. */
  correctIndex: 0 | 1 | 2 | 3;
};

/**
 * Canonical questions added to the bank. Existing rows are left in place;
 * these insert only when their id is missing.
 */
export const QUIZ_QUESTION_BANK: readonly QuizBankQuestion[] = [
  {
    id: "quiz-yoga-meaning",
    category: "yoga-basics",
    prompt: "What does the word “Yoga” commonly mean?",
    options: ["Competition", "Union", "Exercise", "Relaxation"],
    correctIndex: 1,
  },
  {
    id: "quiz-mountain-pose",
    category: "yoga-poses",
    prompt: "Which pose is commonly known as the Mountain Pose?",
    options: ["Tadasana", "Bhujangasana", "Balasana", "Trikonasana"],
    correctIndex: 0,
  },
  {
    id: "quiz-yoga-sutras",
    category: "yoga-philosophy",
    prompt: "Which ancient text contains the Yoga Sutras?",
    options: [
      "Bhagavad Gita",
      "Yoga Sutras of Patanjali",
      "Ramayana",
      "Upanishads only",
    ],
    correctIndex: 1,
  },
  {
    id: "quiz-ytt-purpose",
    category: "yoga-teacher-training",
    prompt: "What is the main purpose of yoga teacher training?",
    options: [
      "To learn only difficult poses",
      "To develop teaching skills and yoga knowledge",
      "To become a doctor",
      "To learn dance",
    ],
    correctIndex: 1,
  },
  {
    id: "quiz-200-hour-ttc",
    category: "200-hour-ttc",
    prompt:
      "What is a 200-hour yoga teacher training course commonly designed to provide?",
    options: [
      "Beginner-level teacher training foundation",
      "Advanced medical training",
      "Music certification",
      "Fitness nutrition degree",
    ],
    correctIndex: 0,
  },
  {
    id: "quiz-300-hour-ttc",
    category: "300-hour-ttc",
    prompt:
      "A 300-hour yoga teacher training course is generally intended for whom?",
    options: [
      "Complete beginners only",
      "People with prior yoga teacher training",
      "Professional singers",
      "Massage therapists only",
    ],
    correctIndex: 1,
  },
  {
    id: "quiz-500-hour-ttc",
    category: "500-hour-ttc",
    prompt:
      "What does a 500-hour yoga teacher training program generally represent?",
    options: [
      "A short meditation session",
      "A comprehensive yoga teacher training pathway",
      "A one-day workshop",
      "A sound healing session",
    ],
    correctIndex: 1,
  },
  {
    id: "quiz-yin-characteristic",
    category: "yin-yoga",
    prompt: "What is a common characteristic of Yin Yoga?",
    options: [
      "Fast-paced jumping",
      "Holding poses for longer periods",
      "Continuous running",
      "Rapid weightlifting",
    ],
    correctIndex: 1,
  },
  {
    id: "quiz-yin-tissue",
    category: "yin-yoga",
    prompt:
      "Which type of tissue is Yin Yoga commonly intended to target through sustained, gentle holds?",
    options: [
      "Only the skin",
      "Connective tissues",
      "Hair follicles",
      "Fingernails",
    ],
    correctIndex: 1,
  },
  {
    id: "quiz-sound-instrument",
    category: "sound-healing",
    prompt: "Which instrument is commonly used in sound healing sessions?",
    options: [
      "Tibetan singing bowl",
      "Electric guitar only",
      "Drum kit only",
      "Flute only",
    ],
    correctIndex: 0,
  },
  {
    id: "quiz-sound-bath",
    category: "sound-healing",
    prompt: "What is a common goal of a sound bath session?",
    options: [
      "Competitive training",
      "Relaxation and mindful listening",
      "Muscle building",
      "Speed improvement",
    ],
    correctIndex: 1,
  },
  {
    id: "quiz-kirtan",
    category: "kirtan",
    prompt: "What is Kirtan most commonly associated with?",
    options: [
      "Call-and-response devotional singing",
      "Silent running",
      "Weight training",
      "Painting",
    ],
    correctIndex: 0,
  },
  {
    id: "quiz-mantra",
    category: "mantra-chanting",
    prompt: "What is a mantra?",
    options: [
      "A type of yoga mat",
      "A repeated word, sound or phrase used in practice",
      "A breathing machine",
      "A gym exercise",
    ],
    correctIndex: 1,
  },
  {
    id: "quiz-meditation-aim",
    category: "meditation",
    prompt: "What is a common aim of mindfulness meditation?",
    options: [
      "To eliminate all thoughts permanently",
      "To pay attention to the present moment",
      "To increase running speed",
      "To improve flexibility only",
    ],
    correctIndex: 1,
  },
  {
    id: "quiz-chakras-count",
    category: "chakras",
    prompt:
      "In traditional yogic systems, how many major chakras are commonly described?",
    options: ["3", "5", "7", "12"],
    correctIndex: 2,
  },
  {
    id: "quiz-core-muscles",
    category: "yoga-anatomy",
    prompt:
      "Which muscle group plays an important role in stabilizing the core?",
    options: [
      "Abdominal muscles",
      "Finger muscles only",
      "Jaw muscles",
      "Ear muscles",
    ],
    correctIndex: 0,
  },
  {
    id: "quiz-retreat-feature",
    category: "yoga-retreats",
    prompt: "What is a common feature of a yoga retreat?",
    options: [
      "Yoga and relaxation activities",
      "Only shopping tours",
      "Only business meetings",
      "Competitive gaming",
    ],
    correctIndex: 0,
  },
  {
    id: "quiz-3-day-benefit",
    category: "3-day-yoga-meditation",
    prompt:
      "What is a potential benefit of a short yoga and meditation retreat?",
    options: [
      "An introduction to a mindful routine",
      "Guaranteed permanent stress removal",
      "Guaranteed weight loss",
      "Instant yoga certification",
    ],
    correctIndex: 0,
  },
  {
    id: "quiz-5-day-activity",
    category: "5-day-yoga-meditation",
    prompt: "Which activity may be included in a five-day yoga retreat?",
    options: [
      "Guided meditation",
      "Only online gaming",
      "Only vehicle driving",
      "Competitive swimming only",
    ],
    correctIndex: 0,
  },
  {
    id: "quiz-7-day-goal",
    category: "7-day-yoga-meditation",
    prompt: "What is a useful goal for a week-long yoga retreat?",
    options: [
      "Building a consistent yoga and meditation routine",
      "Mastering every yoga pose",
      "Becoming a certified doctor",
      "Learning every language",
    ],
    correctIndex: 0,
  },
];
