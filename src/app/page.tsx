import {
  CoursesSection,
  FAQSection,
  FinalCTASection,
  GallerySection,
  HeroSection,
  JsonLd,
  TeachersSection,
  TestimonialsSection,
  VideoSection,
  WelcomeSection,
  WhyRishikeshSection,
  YogaAllianceSection,
} from "@/components";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.nirvanayogaschoolindia.com/#org",
      name: "Nirvana Yoga School",
      url: "https://www.nirvanayogaschoolindia.com",
      logo: "https://www.nirvanayogaschoolindia.com/logo.png",
      sameAs: [
        "https://www.instagram.com/nirvanayogaschool",
        "https://www.facebook.com/nirvanayogaschool",
        "https://www.youtube.com/@nirvanayogaschool",
      ],
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://www.nirvanayogaschoolindia.com/#school",
      name: "Nirvana Yoga School",
      image: "https://www.nirvanayogaschoolindia.com/logo.png",
      priceRange: "$649 - $1449",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Tapovan",
        addressLocality: "Rishikesh",
        addressRegion: "Uttarakhand",
        postalCode: "249192",
        addressCountry: "IN",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5.0",
        reviewCount: "500",
        bestRating: "5",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How much does yoga teacher training cost in India?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yoga teacher training in India typically costs $700 to $1,800. At Nirvana, our 200-hour course starts at $649 all-inclusive — covering accommodation, meals, manual, excursions and Yoga Alliance certification.",
          },
        },
        {
          "@type": "Question",
          name: "Which certification is best for yoga teachers?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yoga Alliance USA is the most widely recognised certification. We offer RYT 200, RYT 300 and RYT 500-hour programs meeting international standards.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need prior yoga experience to join?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No advanced experience is required for our 200-hour foundational course. An open heart and basic yoga familiarity are enough — we guide you from the ground up.",
          },
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <>
      {/* Hero LCP — poster + video start downloading before paint */}
      <link
        rel="preload"
        as="image"
        href="/videos/videomobile-poster.webp"
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/videos/videodesktop-poster.webp"
        media="(min-width: 768px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        href="/videos/videomobile.mp4"
        as="video"
        type="video/mp4"
        media="(max-width: 767px)"
      />
      <link
        rel="preload"
        href="/videos/videodesktop.mp4"
        as="video"
        type="video/mp4"
        media="(min-width: 768px)"
      />
      <JsonLd data={jsonLd} />
      <HeroSection />
      <WelcomeSection />
      <VideoSection />
      <GallerySection />
      <WhyRishikeshSection />
      <CoursesSection />
      <YogaAllianceSection />
      <TeachersSection />
      {/* <RishikeshSection /> */}
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection />
    </>
  );
}
