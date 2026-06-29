import { Footer, Header } from "@/components";
import MobileStickyBar from "@/components/ui/MobileStickyBar";
import WhatsAppFab from "@/components/ui/WhatsAppFab";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main className="relative flex-1">{children}</main>
      <Footer />
      <WhatsAppFab phone="919876543210" />
      <MobileStickyBar />
    </>
  );
}
