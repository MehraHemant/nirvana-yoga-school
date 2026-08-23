"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { DarkMediaHero } from "@/components/hero";
import { MapSection } from "@/components/home";
import type { SearchableSelectOption } from "@/components/ui";
import {
  Button,
  Container,
  PhoneInput,
  SearchableSelect,
} from "@/components/ui";
import type { EnquirePageContent } from "@/content/types/dedicated-pages";
import type { SiteMapContent } from "@/content/types/shared-sections";
import { Check, Compass, Send, WhatsApp } from "@/icons";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import { createEmptyEnquirePageContent } from "@/lib/cms/structural-defaults";
import { ACCOMMODATION_PREFERENCE_OPTIONS } from "@/lib/enquire-programs";
import { optionalSectionHtmlId, resolveSectionHtmlId } from "@/lib/html-id";
import { openMailtoFallback, submitLead } from "@/lib/leads/submit-lead";
import { fadeUp, reducedTransition } from "@/lib/motion";
import {
  DEFAULT_PHONE_COUNTRY_ISO,
  formatFullPhone,
  getPhoneCountry,
} from "@/lib/phone-countries";

const CONTACT_EMAIL = "hello@nirvanayogaschoolindia.com";

type EnquireNowPageClientProps = {
  /** Pre-filled program from `?program=` query string */
  initialProgram?: string;
  /** Pre-filled accommodation from `?accommodation=` query string */
  initialAccommodation?: string;
  /** CMS content_data for /enquire-now */
  content?: EnquirePageContent;
  /** Shared site map embed from CMS */
  siteMap?: SiteMapContent | null;
  /** Program dropdown options loaded from Postgres on the server */
  programOptions: SearchableSelectOption[];
};

/**
 * Enquiry form page for residential YTT, online courses, and retreats.
 *
 * @param props - Optional URL pre-fill values, CMS content, and shared map
 */
export default function EnquireNowPageClient({
  initialProgram = "",
  initialAccommodation = "",
  content = createEmptyEnquirePageContent(),
  siteMap = null,
  programOptions,
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

  const formHtmlId = resolveSectionHtmlId("enquire-form", content.form._id);
  const stepsHtmlId = optionalSectionHtmlId(content.stepsSection?._id);
  const heroHtmlId = optionalSectionHtmlId(content.hero._id);

  return (
    <div className="bg-white">
      <DarkMediaHero id={heroHtmlId} image={content.hero.image} imageAlt="">
        <Container
          size="xl"
          className="relative z-10 flex min-h-[52svh] flex-col justify-center pb-12 pt-[calc(var(--site-header-height,4.75rem)+3rem)] sm:pb-14 sm:pt-[calc(var(--site-header-height,4.75rem)+3.5rem)] lg:min-h-[58svh] lg:pb-16 lg:pt-[calc(var(--site-header-height,4.75rem)+4rem)]"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="max-w-2xl space-y-5"
          >
            <span className="type-eyebrow font-semibold tracking-widest text-white/80 uppercase">
              {content.hero.eyebrow}
            </span>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
              {content.hero.title}
            </h1>
            <p className="type-lead max-w-xl pt-1 text-base leading-relaxed text-white/85 sm:text-lg">
              {content.hero.lead}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {[
                "Reply within 24 hours",
                "Yoga Alliance programs",
                "All-inclusive residential stays",
              ].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/20 bg-ink/20 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm"
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button href={`#${formHtmlId}`} variant="primary" size="md">
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
      </DarkMediaHero>

      <section
        id={formHtmlId}
        className="relative overflow-hidden bg-white py-16 sm:py-20 scroll-mt-[calc(var(--site-header-height,4.75rem)+0.5rem)]"
      >
        <Container size="xl">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-stretch lg:gap-14">
            <div id={stepsHtmlId} className="flex lg:col-span-5">
              <div className="surface-card flex h-full w-full flex-col rounded-3xl p-6 sm:p-8 lg:p-9">
                <div className="shrink-0 space-y-2">
                  <span className="type-eyebrow block font-semibold uppercase text-primary">
                    {content.form.eyebrow}
                  </span>
                  <h2 className="text-2xl font-bold text-ink sm:text-3xl">
                    {content.form.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-ink">
                    {content.form.lead}
                  </p>
                </div>

                <ol className="mt-8 flex flex-1 flex-col gap-4">
                  {content.steps.map((item) => (
                    <li
                      key={item.step}
                      className="surface-panel rounded-2xl p-4 sm:p-5"
                    >
                      <span className="type-eyebrow text-[10px] font-bold text-secondary">
                        {item.step}
                      </span>
                      <h3 className="mt-1 text-base font-bold text-ink">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink">
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
                    <h3 className="type-ui font-bold text-ink">
                      Ashram in Tapovan
                    </h3>
                    <p className="text-sm text-ink">
                      Upper Tapovan, Rishikesh · Uttarakhand, India
                    </p>
                    <span className="inline-block pt-1 text-[11px] font-semibold text-secondary">
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
                        <Check size={28} className="stroke-3" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-ink">
                          Enquiry received!
                        </h3>
                        <p className="mx-auto max-w-sm text-sm leading-relaxed text-ink">
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
                        <h3 className="text-xl font-bold text-ink sm:text-2xl">
                          Tell us about your plans
                        </h3>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor="enquire-name"
                            className="text-xs font-semibold text-ink"
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
                            className="text-xs font-semibold text-ink"
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
                            className="text-xs font-semibold text-ink"
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
                            className="text-xs font-semibold text-ink"
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
                            options={programOptions}
                            placeholder="Search or select a program…"
                            allowCustom
                          />
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor="enquire-start-date"
                            className="text-xs font-semibold text-ink"
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
                            className="text-xs font-semibold text-ink"
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
                          className="text-xs font-semibold text-ink"
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
                            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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
                              <span>{content.form.submitLabel}</span>
                              <Send
                                size={14}
                                className="transition-transform group-hover:translate-x-0.5"
                              />
                            </>
                          )}
                        </button>

                        <p className="text-center text-xs leading-relaxed text-ink">
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

      {content.map.show !== false &&
      shouldRenderSection(siteMap, Boolean(siteMap?.embedUrl?.trim())) &&
      siteMap ? (
        <MapSection
          content={siteMap}
          htmlId={resolveSectionHtmlId("location", content.map._id)}
        />
      ) : null}
    </div>
  );
}
