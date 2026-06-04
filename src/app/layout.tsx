import type { Metadata } from "next";
import "./globals.css";
import { Footer, Header } from "@/components";
import MobileStickyBar from "@/components/ui/MobileStickyBar";
import WhatsAppFab from "@/components/ui/WhatsAppFab";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.nirvanayogaschoolindia.com"),
  title: {
    default: "Nirvana Yoga School | Yoga Teacher Training in Rishikesh, India",
    template: "%s · Nirvana Yoga School",
  },
  description:
    "Yoga Alliance certified 200, 300 & 500-hour teacher training in Rishikesh, India. Authentic Hatha, Ashtanga, Kundalini & Ayurveda taught on the banks of the Ganga.",
  keywords: [
    "yoga teacher training Rishikesh",
    "200 hour YTT India",
    "300 hour YTT India",
    "500 hour YTT India",
    "Yoga Alliance certified",
    "Hatha Yoga",
    "Ashtanga Vinyasa",
    "Kundalini Yoga",
    "Ayurveda",
    "Panchakarma",
  ],
  authors: [{ name: "Nirvana Yoga School" }],
  openGraph: {
    type: "website",
    siteName: "Nirvana Yoga School",
    title: "Nirvana Yoga School | Yoga Teacher Training in Rishikesh, India",
    description:
      "Authentic, Yoga Alliance certified teacher trainings on the banks of the Ganga. Hatha, Ashtanga, Kundalini, Meditation & Ayurveda.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nirvana Yoga School · Rishikesh, India",
    description:
      "Yoga Alliance certified 200/300/500-hour teacher trainings on the banks of the Ganga.",
  },
  icons: {
    icon: "/favicon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased scroll-smooth"
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col bg-sand text-ink">
        <Header />
        <main className="relative flex-1">{children}</main>
        <Footer />
        <WhatsAppFab phone="919876543210" />
        <MobileStickyBar />
      </body>
    </html>
  );
}
