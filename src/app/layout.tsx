import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import { getSiteConfig } from "@/content/repositories/global-settings";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const noeDisplay = localFont({
  src: [
    {
      path: "../../public/fonts/NoeDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-noe",
  display: "swap",
});

const FALLBACK_SITE_URL = "https://www.nirvanayogaschoolindia.com";
const FALLBACK_SITE_NAME = "Nirvana Yoga School";
const FALLBACK_TITLE =
  "Nirvana Yoga School | Yoga Teacher Training in Rishikesh, India";
const FALLBACK_DESCRIPTION =
  "Yoga Alliance certified 200, 300 & 500-hour teacher training in Rishikesh, India. Authentic Hatha, Ashtanga, Kundalini & Ayurveda taught on the banks of the Ganga.";

/**
 * Builds root metadata from Site config when available.
 *
 * @returns Next.js metadata for the document head
 */
export async function generateMetadata(): Promise<Metadata> {
  let siteName = FALLBACK_SITE_NAME;
  let siteUrl = FALLBACK_SITE_URL;
  let title = FALLBACK_TITLE;
  let description = FALLBACK_DESCRIPTION;
  let ogImage = "";

  try {
    const { data } = await getSiteConfig();
    siteName = data.siteName?.trim() || siteName;
    siteUrl = data.siteUrl?.trim() || siteUrl;
    title = data.defaultSeo?.title?.trim() || title;
    description = data.defaultSeo?.description?.trim() || description;
    ogImage = data.defaultSeo?.ogImage?.trim() || "";
  } catch {
    // DB unavailable during build / missing row — keep hardcoded fallbacks.
  }

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s · ${siteName}`,
    },
    description,
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
    authors: [{ name: siteName }],
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      locale: "en_US",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    icons: {
      icon: "/favicon.png",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Root HTML shell — fonts and document structure.
 *
 * @param props - Nested app content
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${noeDisplay.variable} h-full antialiased scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col bg-white text-ink">
        {children}
      </body>
    </html>
  );
}
