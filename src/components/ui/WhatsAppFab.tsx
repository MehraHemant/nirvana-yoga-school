import { WhatsApp } from "@/icons";

type Props = {
  /** Digits-only WhatsApp number from Site config */
  phone: string;
  message?: string;
};

/**
 * Floating WhatsApp chat button. Phone comes from Site config in the site layout.
 *
 * @param props - Phone number and optional prefilled message
 */
export default function WhatsAppFab({
  phone,
  message = "Namaste! I'd like to know more about your yoga teacher training programs.",
}: Props) {
  const url = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(
    message,
  )}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[calc(1.25rem+var(--mobile-cta-height,0px))] left-3.5 z-40 rounded-full bg-[#25D366] p-3 text-white shadow-2xl transition-transform duration-200 hover:scale-110 active:scale-95 md:bottom-20 md:left-6 md:p-4"
    >
      <span className="sr-only">Chat with us on WhatsApp</span>
      <WhatsApp />
    </a>
  );
}
