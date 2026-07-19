import type { ExamCertificationContent } from "@/content/types/shared-sections";

/** Default global exam and certification content. */
export const DEFAULT_EXAM_CERTIFICATION: ExamCertificationContent = {
  live: true,
  eyebrow: "Evaluation & Alignment",
  title: "Exam & Certification Process",
  description:
    "Yoga teaching is a skill that is given due relevance at Nirvana Yoga School. It is recognized that yoga is not just something one learns; it is actually something that one lives and breathes into existence.",
  steps: [
    {
      title: "Applied Practical Exam",
      tag: "Practical Evaluation",
      description:
        "Your growth will be tested in an applied practical exam wherein you must demonstrate your knowledge of asanas, pranayama, meditation, sequencing, and safe alignment, as well as care and clarity in guiding others.",
      image:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Written Examinations",
      tag: "Theoretical Evaluation",
      description:
        "You will be subjected to written examinations representing your understanding of the core areas of yoga philosophy, anatomy, breathwork, meditation, and the vast knowledge on which authentic teaching rests.",
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Classroom Participation",
      tag: "Daily Engagement",
      description:
        "Your classroom participation and active engagement throughout the yoga teacher training in India will be observed gently, as how you show up - with presence, enthusiasm, and openness, is equally important as what you know.",
      image:
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Teaching Seat Assessment",
      tag: "Final Practice",
      description:
        "Being the last chance to teach, an assessment will let you slip into the teacher’s seat, working your way through all of your learning and receiving nurturing critiques to grow from.",
      image:
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Attendance & Consistency",
      tag: "Yogic Discipline",
      description:
        "Attendance and sincere participation in all activities of the yoga teacher training in Rishikesh are plenty enough requirements for certification, for Yoga is as much about discipline and consistency as inspiration.",
      image:
        "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80",
    },
  ],
  certificates: [
    {
      title: "Hatha Ashtanga Vinyasa YTTC Certificate",
      subtitle: "Yoga Alliance USA Accredited Course Certificate",
      image:
        "https://www.nirvanayogaschoolindia.com/img/certificate/200h-hatha-ashtanga-yttc-certificate.webp",
    },
    {
      title: "Nirvana Yoga School Certificate",
      subtitle: "Official Institutional Graduation Certificate",
      image:
        "https://www.nirvanayogaschoolindia.com/img/certificate/200-nirvana-yttc-certificate.webp",
    },
  ],
};
