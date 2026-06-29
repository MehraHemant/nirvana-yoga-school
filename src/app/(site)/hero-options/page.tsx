import type { Metadata } from "next";
import CourseHeroShowcase from "@/components/courses/CourseHeroShowcase";

export const metadata: Metadata = {
  title: "Hero Options",
  robots: { index: false },
};

// Sample data matching the 200h course
const PHOTOS = [
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1593811160657-8443f7660669?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1528319725582-ddc096101511?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop&q=85",
];

const VIDEO_IDS = ["PH2fv7TtRfc", "RqG48joKLp8", "Rcqr1gSe2uE", "TYal8a3zGow"];

export default function HeroOptionsPage() {
  return (
    <CourseHeroShowcase
      title="200 Hour Hatha Ashtanga Vinyasa Yoga Teacher Training in Rishikesh India"
      eyebrow="Yoga Alliance Certified"
      photos={PHOTOS}
      videoIds={VIDEO_IDS}
      fee="From $649 USD"
      duration="25 Days"
      level="Beginner to Intermediate"
      certification="RYT-200, Yoga Alliance"
    />
  );
}
