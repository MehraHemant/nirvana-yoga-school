import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact Us | Nirvana Yoga School Rishikesh India",
  description:
    "Reach out to Nirvana Yoga School in Rishikesh, India. Get in touch with our ashram team to ask about residential yoga teacher training, retreats, and airport taxi transfers.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
