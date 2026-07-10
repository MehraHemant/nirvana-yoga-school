import { Footer, Header } from "@/components";
import MobileStickyBar from "@/components/ui/MobileStickyBar";
import WhatsAppFab from "@/components/ui/WhatsAppFab";
import SiteMain from "./SiteMain";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <SiteMain>{children}</SiteMain>
      <Footer />
      <WhatsAppFab phone="919876543210" />
      <MobileStickyBar />
    </>
  );
}
