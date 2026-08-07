import Footer from "@/components/layout/Footer";
import DeferredChatWidget from "@/components/ui/DeferredChatWidget";
import Header from "@/components/ui/Header";
import MobileStickyBar from "@/components/ui/MobileStickyBar";
import WhatsAppFab from "@/components/ui/WhatsAppFab";
import {
  getGlobalFooter,
  getGlobalHeader,
  getSiteConfig,
} from "@/content/repositories/global-settings";
import SiteMain from "./SiteMain";

const FALLBACK_WHATSAPP = "919876543210";

/**
 * Loads header, footer, and site config once for the public shell.
 */
async function loadSiteChrome() {
  try {
    const [header, footer, siteConfig] = await Promise.all([
      getGlobalHeader(),
      getGlobalFooter(),
      getSiteConfig(),
    ]);
    return {
      header: header.data,
      footer: footer.data,
      whatsappNumber:
        siteConfig.data.whatsappNumber?.replace(/\D/g, "") || FALLBACK_WHATSAPP,
    };
  } catch {
    return {
      header: null,
      footer: null,
      whatsappNumber: FALLBACK_WHATSAPP,
    };
  }
}

/**
 * Public site shell — server-passed chrome + global FABs.
 *
 * @param props - Nested page content
 */
export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { header, footer, whatsappNumber } = await loadSiteChrome();

  return (
    <>
      <Header initialData={header} />
      <SiteMain>{children}</SiteMain>
      <Footer initialData={footer} />
      <WhatsAppFab phone={whatsappNumber} />
      <DeferredChatWidget />
      <MobileStickyBar />
    </>
  );
}
