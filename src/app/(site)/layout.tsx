import { SiteSessionProvider } from "@/components/auth/SiteSessionProvider";
import QuizLauncher from "@/components/quiz/QuizLauncher";
import DeferredChatWidget from "@/components/ui/DeferredChatWidget";
import Header from "@/components/ui/Header";
import JsonLd from "@/components/ui/JsonLd";
import OfferPopup from "@/components/ui/OfferPopup";
import WhatsAppFab from "@/components/ui/WhatsAppFab";
import {
  getGlobalFooter,
  getGlobalHeader,
  getSiteConfig,
} from "@/content/repositories/global-settings";
import { getOfferPopup } from "@/lib/cms/offer-popup";
import { hasActiveQuizQuestions } from "@/lib/quiz/questions";
import { getQuizSettings } from "@/lib/quiz/settings";
import { organizationGraph } from "@/lib/seo/structured-data";
import HideOnImmersive from "./HideOnImmersive";
import SiteFooterGate from "./SiteFooterGate";
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
      identity: {
        // WhatsApp links are contact channels, not profiles.
        sameAs: (footer.data?.social ?? [])
          .filter((s) => s.icon !== "whatsapp")
          .map((s) => s.href)
          .filter((href) => /^https?:\/\//.test(href)),
        email: siteConfig.data.contactEmail?.trim() || undefined,
        description:
          siteConfig.data.defaultSeo?.description?.trim() || undefined,
      },
      whatsappNumber:
        siteConfig.data.whatsappNumber?.replace(/\D/g, "") || FALLBACK_WHATSAPP,
    };
  } catch {
    return {
      header: null,
      footer: null,
      identity: {},
      whatsappNumber: FALLBACK_WHATSAPP,
    };
  }
}

/**
 * Public site shell — server-passed chrome + global FABs. Reads no cookies, so
 * pages below it can be statically cached; the signed-in account loads in the
 * browser via {@link SiteSessionProvider}.
 *
 * @param props - Nested page content
 */
export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [
    { header, footer, identity, whatsappNumber },
    quizSettings,
    offerPopup,
  ] = await Promise.all([loadSiteChrome(), getQuizSettings(), getOfferPopup()]);
  const quizOpen =
    quizSettings.live && (await hasActiveQuizQuestions().catch(() => false));

  return (
    <SiteSessionProvider>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": organizationGraph(identity),
        }}
      />
      <Header initialData={header} />
      <SiteMain>{children}</SiteMain>
      <SiteFooterGate initialData={footer} />
      <HideOnImmersive>
        <OfferPopup content={offerPopup} />
        <WhatsAppFab phone={whatsappNumber} />
        <DeferredChatWidget />
      </HideOnImmersive>
      {quizOpen ? (
        <QuizLauncher
          monthlyLimit={quizSettings.monthlyLimit}
          label={quizSettings.launcherLabel}
          tagline={quizSettings.launcherTagline}
          promptTitle={`${quizSettings.introTitle} ${quizSettings.introHighlight}`.trim()}
        />
      ) : null}
    </SiteSessionProvider>
  );
}
