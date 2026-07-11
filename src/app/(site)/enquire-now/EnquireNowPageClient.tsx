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
import { Check, Compass, Send, WhatsApp } from "@/icons";
import {
  ACCOMMODATION_PREFERENCE_OPTIONS,
  ENQUIRE_PROGRAM_OPTIONS,
} from "@/lib/enquire-programs";
import { openMailtoFallback, submitLead } from "@/lib/leads/submit-lead";
import { fadeUp, reducedTransition } from "@/lib/motion";
import {
  DEFAULT_PHONE_COUNTRY_ISO,
  formatFullPhone,
  getPhoneCountry,
} from "@/lib/phone-countries";

const CONTACT_EMAIL = "hello@nirvanayogaschoolindia.com";
const ENQUIRE_HERO_IMAGE = "/img/retreat-venue/private/2.webp";

const ENQUIRY_STEPS = [
  {
    step: "01",
    title: "Share your details",
    body: "Tell us which program interests you, your preferred dates, and room preference.",
  },
  {
    step: "02",
    title: "Ashram coordinator replies",
    body: "We respond within 24 hours by email or WhatsApp with dates, fees, and next steps.",
  },
  {
    step: "03",
    title: "Reserve your place",
    body: "Confirm your batch and accommodation to secure your spot in Tapovan, Rishikesh.",
  },
] as const;

type EnquireNowPageClientProps = {
  /** Pre-filled program from `?program=` query string */
  initialProgram?: string;
  /** Pre-filled accommodation from `?accommodation=` query string */
  initialAccommodation?: string;
};

/**
 * Enquiry form page for residential YTT, online courses, and retreats.
 *
 * @param props - Optional URL pre-fill values
 */
export default function EnquireNowPageClient({
  initialProgram = "",
  initialAccommodation = "",
}: EnquireNowPageClientProps) {
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
    program: initialProgram,
    startDate: "",
    accommodation: initialAccommodation,
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);

    const program = formData.program.trim();
    if (!program) return;

    if (!phoneNational.trim()) {
      setPhoneError("Please enter your phone number.");
      return;
    }

    setFormState("submitting");

    try {
      const country = getPhoneCountry(phoneCountryIso);
      const phone = formatFullPhone(country, phoneNational);
      const subject = `Enquiry: ${program}`;
      const body = [
        `Name: ${formData.name.trim()}`,
        `Email: ${formData.email.trim()}`,
        `Phone / WhatsApp: ${phone}`,
        `Program: ${program}`,
        formData.startDate.trim()
          ? `Preferred start: ${formData.startDate.trim()}`
          : null,
        formData.accommodation.trim()
          ? `Accommodation: ${formData.accommodation.trim()}`
          : null,
        "",
        formData.message.trim(),
      ]
        .filter(Boolean)
        .join("\n");

      const result = await submitLead({
        type: "enquiry",
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone,
        program,
        startDate: formData.startDate.trim() || undefined,
        accommodation: formData.accommodation.trim() || undefined,
        message: formData.message.trim(),
        source: "/enquire-now",
      });

      if (!result.stored) {
        openMailtoFallback({ to: CONTACT_EMAIL, subject, body });
      }

      setFormState("success");
    } catch {
      setFormState("error");
    }
  };

  return (
    <div className="bg-sand/15">
      <section className="relative min-h-[52svh] overflow-hidden bg-ink text-white pt-[var(--site-header-height,4.75rem)] lg:min-h-[58svh]">
        <Image
          src={ENQUIRE_HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div
          className="absolute inset-0 bg-linear-to-r from-ink/94 via-ink/60 to-ink/35"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-16 top-1/4 h-72 w-72 rounded-full bg-primary/20 blur-[100px]"
          aria-hidden="true"
        />

        <Container
          size="xl"
          className="relative z-10 flex min-h-[calc(52svh-var(--site-header-height,4.75rem))] flex-col justify-center py-12 sm:py-14 lg:min-h-[calc(58svh-var(--site-header-height,4.75rem))] lg:py-16"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="max-w-2xl space-y-5"
          >
            <span className="type-eyebrow font-semibold tracking-widest text-accent uppercase">
              Apply & Enquire
            </span>
            <h1 className="font-serif text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
              Begin your{" "}
              <span className="font-normal italic text-accent">enquiry</span>
            </h1>
            <p className="type-lead max-w-xl pt-1 font-sans text-base leading-relaxed text-white/82 sm:text-lg">
              Reserve your interest in yoga teacher training, retreats, or
              online courses. Our ashram team will guide you through dates,
              fees, and accommodation.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {[
                "Reply within 24 hours",
                "Yoga Alliance programs",
                "All-inclusive residential stays",
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
              <Button href="#enquire-form" variant="primary" size="md">
                Submit Enquiry
              </Button>
              <Button
                href="https://wa.me/918218564835"
                variant="outline-light"
                size="md"
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsApp size={16} className="mr-1.5" />
                Chat on WhatsApp
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>

      <section
        id="enquire-form"
        className="relative overflow-hidden bg-white py-16 sm:py-20 scroll-mt-[calc(var(--site-header-height,4.75rem)+0.5rem)]"
      >
        <Container size="xl">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-stretch lg:gap-14">
            <div className="flex lg:col-span-5">
              <div className="surface-card flex h-full w-full flex-col rounded-3xl p-6 sm:p-8 lg:p-9">
                <div className="shrink-0 space-y-2">
                  <span className="type-eyebrow block font-semibold uppercase text-primary">
                    How it works
                  </span>
                  <h2 className="font-serif text-2xl font-medium text-ink sm:text-3xl">
                    Your path to Rishikesh
                  </h2>
                  <p className="font-sans text-sm leading-relaxed text-muted">
                    Share a few details and our coordinators will help you
                    choose the right program, batch dates, and room type for
                    your stay in Tapovan.
                  </p>
                </div>

                <ol className="mt-8 flex flex-1 flex-col gap-4">
                  {ENQUIRY_STEPS.map((item) => (
                    <li
                      key={item.step}
                      className="surface-panel rounded-2xl p-4 sm:p-5"
                    >
                      <span className="type-eyebrow text-[10px] font-bold text-secondary">
                        {item.step}
                      </span>
                      <h3 className="mt-1 font-serif text-base font-medium text-ink">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 font-sans text-sm leading-relaxed text-muted">
                        {item.body}
                      </p>
                    </li>
                  ))}
                </ol>

                <a
                  href="https://maps.google.com/?q=Nirvana+Yoga+School+Rishikesh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group surface-panel mt-6 flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:border-secondary/25 hover:shadow-soft sm:p-5"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/5 transition-colors group-hover:bg-secondary/10">
                    <Compass size={20} className="text-secondary" />
                  </span>
                  <div className="min-w-0 space-y-1">
                    <h3 className="type-ui font-semibold text-ink">
                      Ashram in Tapovan
                    </h3>
                    <p className="font-sans text-sm text-muted">
                      Upper Tapovan, Rishikesh · Uttarakhand, India
                    </p>
                    <span className="inline-block pt-1 font-sans text-[11px] font-semibold text-secondary">
                      View on Google Maps →
                    </span>
                  </div>
                </a>
              </div>
            </div>

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
                      <div className="flex size-16 animate-bounce items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-xs">
                        <Check size={28} className="stroke-[3]" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-serif text-2xl font-medium text-ink">
                          Enquiry received!
                        </h3>
                        <p className="mx-auto max-w-sm font-sans text-sm leading-relaxed text-muted">
                          Thank you for your enquiry. Our ashram team will
                          review your details and reply by email or WhatsApp
                          within 24 hours.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormState("idle");
                          setFormData({
                            name: "",
                            email: "",
                            program: "",
                            startDate: "",
                            accommodation: "",
                            message: "",
                          });
                          setPhoneNational("");
                          setPhoneCountryIso(DEFAULT_PHONE_COUNTRY_ISO);
                          setPhoneError(null);
                        }}
                        className="type-ui rounded-full bg-secondary px-6 py-2.5 font-semibold text-white shadow-xs transition-colors hover:bg-secondary-dark"
                      >
                        Send Another Enquiry
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
                        <span className="type-eyebrow mb-1 block font-semibold uppercase text-primary">
                          Programme Enquiry
                        </span>
                        <h3 className="font-serif text-xl font-medium text-ink sm:text-2xl">
                          Tell us about your plans
                        </h3>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor="enquire-name"
                            className="font-sans text-xs font-semibold text-ink"
                          >
                            Full Name *
                          </label>
                          <input
                            id="enquire-name"
                            type="text"
                            required
                            placeholder="e.g. Elena Rostova"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full rounded-2xl border border-secondary/15 bg-white px-4 py-3 text-sm text-ink placeholder-muted/65 transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="enquire-email"
                            className="font-sans text-xs font-semibold text-ink"
                          >
                            Email Address *
                          </label>
                          <input
                            id="enquire-email"
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
                            className="w-full rounded-2xl border border-secondary/15 bg-white px-4 py-3 text-sm text-ink placeholder-muted/65 transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor="enquire-phone"
                            className="font-sans text-xs font-semibold text-ink"
                          >
                            WhatsApp / Phone *
                          </label>
                          <PhoneInput
                            id="enquire-phone"
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

                        <div className="space-y-2">
                          <label
                            htmlFor="enquire-program"
                            className="font-sans text-xs font-semibold text-ink"
                          >
                            Program of Interest *
                          </label>
                          <SearchableSelect
                            id="enquire-program"
                            required
                            value={formData.program}
                            onChange={(value) =>
                              setFormData({ ...formData, program: value })
                            }
                            options={ENQUIRE_PROGRAM_OPTIONS}
                            placeholder="Search or select a program…"
                            allowCustom
                          />
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor="enquire-start-date"
                            className="font-sans text-xs font-semibold text-ink"
                          >
                            Preferred Start Date
                          </label>
                          <input
                            id="enquire-start-date"
                            type="text"
                            placeholder="e.g. March 2026 or flexible"
                            value={formData.startDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                startDate: e.target.value,
                              })
                            }
                            className="w-full rounded-2xl border border-secondary/15 bg-white px-4 py-3 text-sm text-ink placeholder-muted/65 transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="enquire-accommodation"
                            className="font-sans text-xs font-semibold text-ink"
                          >
                            Accommodation Preference
                          </label>
                          <SearchableSelect
                            id="enquire-accommodation"
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
                        <label
                          htmlFor="enquire-message"
                          className="font-sans text-xs font-semibold text-ink"
                        >
                          Your Message *
                        </label>
                        <textarea
                          id="enquire-message"
                          required
                          rows={4}
                          placeholder="Share your yoga background, travel dates, or any questions about fees and inclusions…"
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              message: e.target.value,
                            })
                          }
                          className="w-full resize-none rounded-2xl border border-secondary/15 bg-white px-4 py-3 text-sm text-ink placeholder-muted/65 transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
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
                          className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-xs transition-all duration-300 hover:bg-primary-dark hover:shadow-soft"
                        >
                          {formState === "submitting" ? (
                            "Sending Enquiry..."
                          ) : (
                            <>
                              <span>Submit Enquiry</span>
                              <Send
                                size={14}
                                className="transition-transform group-hover:translate-x-0.5"
                              />
                            </>
                          )}
                        </button>

                        <p className="text-center font-sans text-xs leading-relaxed text-muted">
                          Prefer WhatsApp?{" "}
                          <a
                            href="https://wa.me/918218564835"
                            className="font-semibold text-secondary hover:text-secondary-dark"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Message us directly
                          </a>
                        </p>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <MapSection />
    </div>
  );
}
