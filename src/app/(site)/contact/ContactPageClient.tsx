"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { MapSection } from "@/components/home";
import {
  Button,
  Container,
  PhoneInput,
  SearchableSelect,
} from "@/components/ui";
import {
  Check,
  Compass,
  Send,
  WhatsApp,
} from "@/icons";
import { ACCOMMODATION_PREFERENCE_OPTIONS } from "@/lib/enquire-programs";
import { fadeUp, reducedTransition } from "@/lib/motion";
import {
  DEFAULT_PHONE_COUNTRY_ISO,
  formatFullPhone,
  getPhoneCountry,
} from "@/lib/phone-countries";

const CONTACT_EMAIL = "hello@nirvanayogaschoolindia.com";
const CONTACT_HERO_IMAGE = "/img/retreat-venue/private/1.webp";

export default function ContactPageClient() {
  const prefersReduced = useReducedMotion() ?? false;
  const [formState, setFormState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [phoneCountryIso, setPhoneCountryIso] = useState(
    DEFAULT_PHONE_COUNTRY_ISO,
  );
  const [phoneNational, setPhoneNational] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    accommodation: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);

    const subject = formData.subject.trim();
    if (!subject) return;

    if (!phoneNational.trim()) {
      setPhoneError("Please enter your phone number.");
      return;
    }

    setFormState("submitting");

    try {
      const country = getPhoneCountry(phoneCountryIso);
      const phone = formatFullPhone(country, phoneNational);
      const body = [
        `Name: ${formData.name.trim()}`,
        `Email: ${formData.email.trim()}`,
        `Phone / WhatsApp: ${phone}`,
        formData.accommodation.trim()
          ? `Accommodation preference: ${formData.accommodation.trim()}`
          : null,
        "",
        formData.message.trim(),
      ]
        .filter(Boolean)
        .join("\n");

      const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
      setFormState("success");
    } catch {
      setFormState("error");
    }
  };

  const contactDetails = [
    {
      title: "Ashram Location",
      value: "Tapovan, Rishikesh, Uttarakhand 249137, India",
      href: "https://maps.google.com/?q=Nirvana+Yoga+School+Rishikesh",
      icon: <Compass size={20} className="text-secondary" />,
      actionText: "View on Google Maps →",
    },
    {
      title: "WhatsApp & Call Support",
      value: "+91 82185 64835",
      href: "https://wa.me/918218564835",
      icon: <WhatsApp size={20} className="text-secondary" />,
      actionText: "Chat on WhatsApp →",
    },
    {
      title: "Direct Email Support",
      value: "hello@nirvanayogaschoolindia.com",
      href: "mailto:hello@nirvanayogaschoolindia.com",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-5 h-5 text-secondary"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
          />
        </svg>
      ),
      actionText: "Send email support →",
    },
  ];

  return (
    <div className="bg-sand/15">
      {/* 1. Hero */}
      <section className="relative min-h-[52svh] overflow-hidden bg-ink text-white pt-[var(--site-header-height,4.75rem)] lg:min-h-[58svh]">
        <Image
          src={CONTACT_HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div
          className="absolute inset-0 bg-linear-to-r from-ink/92 via-ink/55 to-ink/30"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-16 top-1/4 h-72 w-72 rounded-full bg-primary/20 blur-[100px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-secondary/25 blur-[90px]"
          aria-hidden="true"
        />

        <Container
          size="xl"
          className="relative z-10 flex min-h-[calc(52svh-var(--site-header-height,4.75rem))] flex-col justify-center py-12 sm:py-14 lg:min-h-[calc(58svh-var(--site-header-height,4.75rem))] lg:py-16"
        >
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="max-w-2xl space-y-5"
            >
              <span className="type-eyebrow font-semibold tracking-widest text-accent uppercase">
                Get In Touch
              </span>
              <h1 className="font-serif text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
                We are here to support{" "}
                <span className="font-normal italic text-accent">
                  your journey
                </span>
              </h1>
              <p className="type-lead max-w-xl pt-1 font-sans text-base leading-relaxed text-white/82 sm:text-lg">
                Questions about yoga teacher training, retreats, accommodation,
                or travel to Rishikesh? Our ashram team replies within 24 hours.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  "Tapovan, Rishikesh",
                  "Reply within 24 hours",
                  "WhatsApp support",
                ].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1 font-sans text-xs font-medium text-white/90 backdrop-blur-sm"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button href="#contact-form" variant="primary" size="md">
                  Send a Message
                </Button>
                <Button
                  href="https://wa.me/918218564835"
                  variant="outline-light"
                  size="md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chat on WhatsApp
                </Button>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* 2. Main Content splitting Grid */}
      <section
        id="contact-form"
        className="relative overflow-hidden bg-white py-16 sm:py-20 scroll-mt-[calc(var(--site-header-height,4.75rem)+0.5rem)]"
      >
        <Container size="xl">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-stretch lg:gap-14">
            {/* Left Column: Direct Contact Info (col-span-5) */}
            <div className="flex lg:col-span-5">
              <div className="surface-card flex h-full w-full flex-col rounded-3xl p-6 sm:p-8 lg:p-9">
                <div className="shrink-0 space-y-2">
                  <span className="type-eyebrow block font-semibold uppercase text-primary">
                    Contact Details
                  </span>
                  <h2 className="font-serif text-2xl font-medium text-ink sm:text-3xl">
                    Connect with Nirvana
                  </h2>
                  <p className="font-sans text-sm leading-relaxed text-muted">
                    Whether you are planning your travel arrival to Tapovan or
                    inquiring about syllabus details, we look forward to
                    greeting you.
                  </p>
                </div>

                <div className="mt-6 flex flex-1 flex-col gap-3">
                  {contactDetails.map((detail) => (
                    <a
                      key={detail.title}
                      href={detail.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group surface-panel flex flex-1 items-center rounded-2xl p-4 transition-all duration-300 hover:border-secondary/25 hover:shadow-soft sm:p-5"
                    >
                      <div className="flex w-full gap-4">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/5 transition-colors group-hover:bg-secondary/10">
                          {detail.icon}
                        </span>
                        <div className="min-w-0 space-y-1">
                          <h3 className="type-ui font-semibold text-ink">
                            {detail.title}
                          </h3>
                          <p className="wrap-break-word font-sans text-sm leading-relaxed text-ink/80">
                            {detail.value}
                          </p>
                          <span className="inline-block pt-1 font-sans text-[11px] font-semibold text-secondary">
                            {detail.actionText}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form (col-span-7) */}
            <div className="flex lg:col-span-7">
              <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-secondary/10 bg-white p-8 shadow-card transition-all duration-300 hover:shadow-soft sm:p-10">
                <AnimatePresence mode="wait">
                  {formState === "success" ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={reducedTransition(prefersReduced, {
                        duration: 0.35,
                      })}
                      className="flex flex-1 flex-col items-center justify-center space-y-5 py-16 text-center"
                    >
                      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-xs animate-bounce">
                        <Check size={28} className="stroke-[3]" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-serif text-2xl font-medium text-ink">
                          Inquiry Received!
                        </h3>
                        <p className="text-sm text-muted max-w-sm font-sans leading-relaxed mx-auto">
                          Thank you for reaching out. Our Ashram coordinators
                          will review your message and reply via email or
                          WhatsApp within 24 hours.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormState("idle");
                          setFormData({
                            name: "",
                            email: "",
                            subject: "",
                            accommodation: "",
                            message: "",
                          });
                          setPhoneNational("");
                          setPhoneCountryIso(DEFAULT_PHONE_COUNTRY_ISO);
                          setPhoneError(null);
                        }}
                        className="type-ui rounded-full bg-secondary px-6 py-2.5 font-semibold text-white shadow-xs hover:bg-secondary-dark transition-colors"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-1 flex-col space-y-6"
                    >
                      <div>
                        <span className="type-eyebrow text-primary font-semibold block uppercase mb-1">
                          Online Inquiry
                        </span>
                        <h3 className="font-serif text-xl sm:text-2xl font-medium text-ink">
                          Send a Message
                        </h3>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        {/* Name Input */}
                        <div className="space-y-2">
                          <label
                            htmlFor="name"
                            className="text-xs font-semibold text-ink font-sans"
                          >
                            Full Name *
                          </label>
                          <input
                            id="name"
                            type="text"
                            required
                            placeholder="e.g. Elena Rostova"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full rounded-2xl border border-secondary/15 bg-white px-4 py-3 text-sm text-ink placeholder-muted/65 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-colors"
                          />
                        </div>

                        {/* Email Input */}
                        <div className="space-y-2">
                          <label
                            htmlFor="email"
                            className="text-xs font-semibold text-ink font-sans"
                          >
                            Email Address *
                          </label>
                          <input
                            id="email"
                            type="email"
                            required
                            placeholder="e.g. elena@example.com"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            className="w-full rounded-2xl border border-secondary/15 bg-white px-4 py-3 text-sm text-ink placeholder-muted/65 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        {/* WhatsApp / Phone Input */}
                        <div className="space-y-2">
                          <label
                            htmlFor="phone"
                            className="text-xs font-semibold text-ink font-sans"
                          >
                            WhatsApp / Phone *
                          </label>
                          <PhoneInput
                            id="phone"
                            required
                            countryIso={phoneCountryIso}
                            nationalNumber={phoneNational}
                            onCountryChange={(iso) => {
                              setPhoneCountryIso(iso);
                              setPhoneError(null);
                            }}
                            onNationalNumberChange={(value) => {
                              setPhoneNational(value);
                              if (phoneError) setPhoneError(null);
                            }}
                            error={phoneError}
                          />
                        </div>

                        {/* Accommodation Preference */}
                        <div className="space-y-2">
                          <label
                            htmlFor="accommodation"
                            className="text-xs font-semibold text-ink font-sans"
                          >
                            Accommodation Preference
                          </label>
                          <SearchableSelect
                            id="accommodation"
                            value={formData.accommodation}
                            onChange={(value) =>
                              setFormData({
                                ...formData,
                                accommodation: value,
                              })
                            }
                            options={ACCOMMODATION_PREFERENCE_OPTIONS}
                            placeholder="Select room type…"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        {/* Subject */}
                        <label
                          htmlFor="subject"
                          className="text-xs font-semibold text-ink font-sans"
                        >
                          Subject *
                        </label>
                        <input
                          id="subject"
                          type="text"
                          required
                          placeholder="e.g. 200 Hour YTT dates in March"
                          value={formData.subject}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              subject: e.target.value,
                            })
                          }
                          className="w-full rounded-2xl border border-secondary/15 bg-white px-4 py-3 text-sm text-ink placeholder-muted/65 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-colors"
                        />
                      </div>

                      {/* Message Input */}
                      <div className="space-y-2">
                        <label
                          htmlFor="message"
                          className="text-xs font-semibold text-ink font-sans"
                        >
                          Your Message *
                        </label>
                        <textarea
                          id="message"
                          required
                          rows={4}
                          placeholder="Tell us about yourself, your yoga practice, or any specific questions you have..."
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              message: e.target.value,
                            })
                          }
                          className="w-full rounded-2xl border border-secondary/15 bg-white px-4 py-3 text-sm text-ink placeholder-muted/65 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-colors resize-none"
                        />
                      </div>

                      <div className="mt-auto space-y-4">
                        {formState === "error" && (
                          <p
                            role="alert"
                            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-700"
                          >
                            Something went wrong opening your email app. Please
                            email us directly at{" "}
                            <a
                              href={`mailto:${CONTACT_EMAIL}`}
                              className="font-semibold underline"
                            >
                              {CONTACT_EMAIL}
                            </a>
                            .
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={formState === "submitting"}
                          className="group flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-xs hover:bg-primary-dark transition-all duration-300 hover:shadow-soft cursor-pointer"
                        >
                          {formState === "submitting" ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Sending Inquiry...
                            </>
                          ) : (
                            <>
                              <span>Send Message</span>
                              <Send
                                size={14}
                                className="group-hover:translate-x-0.5 transition-transform"
                              />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. Location Map Section */}
      <MapSection />
    </div>
  );
}
