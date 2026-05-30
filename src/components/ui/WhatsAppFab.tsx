import { WhatsApp } from "@/icons";

type Props = {
  phone: string;
  message?: string;
};

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
      className="fixed bottom-24 right-5 md:bottom-6 md:right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-transform duration-200"
    >
      <span className="sr-only">Chat with us on WhatsApp</span>
      <WhatsApp />
    </a>
  );
}
