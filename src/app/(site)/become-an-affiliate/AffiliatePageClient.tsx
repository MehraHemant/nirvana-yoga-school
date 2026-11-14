"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type FormEvent, type ReactNode, useId, useState } from "react";
import { DarkMediaHero } from "@/components/hero";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import {
  Button,
  Container,
  PhoneInput,
  SearchableSelect,
  SectionHeader,
} from "@/components/ui";
import FAQSection from "@/components/ui/FAQSection";
import type {
  AffiliatePageContent,
  AffiliateStepIconKey,
} from "@/content/types/dedicated-pages";
import type { SiteConfig } from "@/content/types/global-settings";
import type { ReviewsContent } from "@/content/types/shared-sections";
import { Check, Link, Send, User, Users, Wallet, WhatsApp } from "@/icons";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import { createEmptyAffiliatePageContent } from "@/lib/cms/structural-defaults";
import { optionalSectionHtmlId, resolveSectionHtmlId } from "@/lib/html-id";
import { openMailtoFallback, submitLead } from "@/lib/leads/submit-lead";
import { fadeUp, reducedTransition } from "@/lib/motion";
import {
  DEFAULT_PHONE_COUNTRY_ISO,
  formatFullPhone,
  getPhoneCountry,
} from "@/lib/phone-countries";
import { resolveContactEmail, whatsAppLink } from "@/lib/site-contact";

type AffiliatePageClientProps = {
  content?: AffiliatePageContent;
  reviews?: ReviewsContent | null;
  siteConfig?: SiteConfig | null;
};

const INPUT_CLASS =
  "w-full rounded-2xl border border-secondary/15 bg-white px-4 py-3 text-sm text-ink placeholder-muted/65 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-colors";

const LABEL_CLASS = "text-xs font-medium leading-[1.4] text-ink";

const AUDIENCE_OPTIONS = [
  "Under 1,000",
  "1,000 – 10,000",
  "10,000 – 50,000",
  "50,000 – 100,000",
  "100,000+",
  "I teach / refer students in person",
].map((value) => ({ value, label: value }));

const INTEREST_OPTIONS = ["Online courses", "In-person courses", "Both"];

/**
 * Step icon for a "how it works" card.
 *
 * @param key - CMS icon key
 */
function StepIcon({ iconKey }: { iconKey: AffiliateStepIconKey }) {
  const size = 26;
  switch (iconKey) {
    case "user":
      return <User size={size} />;
    case "link":
      return <Link size={size} />;
    case "code":
      return (
        <span aria-hidden className="text-2xl font-semibold leading-none">
          #
        </span>
      );
    case "share":
      return <Send size={size} />;
    case "users":
      return <Users size={size} />;
    case "wallet":
      return <Wallet size={size} />;
  }
}

/**
 * Whole-dollar USD.
 *
 * @param value - Amount
 */
function usd(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

/**
 * Become-an-affiliate page — hero, how-it-works tabs, earnings calculator,
 * benefits, reviews, FAQs and a sign-up form that lands in Leads.
 *
 * @param props - CMS content, shared reviews and site contact config
 */
export default function AffiliatePageClient({
  content = createEmptyAffiliatePageContent(),
  reviews = null,
  siteConfig = null,
}: AffiliatePageClientProps) {
  const rate = content.commissionRate;
  const formHtmlId = resolveSectionHtmlId("affiliate-signup", content.form._id);
  const howHtmlId = resolveSectionHtmlId(
    "how-it-works",
    content.tracksSection._id,
  );
  const whatsAppHref = whatsAppLink(siteConfig);

  return (
    <div className="bg-white">
      {shouldRenderSection(content.hero, Boolean(content.hero.title)) ? (
        <AffiliateHero
          content={content}
          formHref={`#${formHtmlId}`}
          howHref={`#${howHtmlId}`}
        />
      ) : null}

      {content.stats.length > 0 ? <StatsBand stats={content.stats} /> : null}

      {shouldRenderSection(content.tracksSection, content.tracks.length > 0) ? (
        <HowItWorks content={content} htmlId={howHtmlId} />
      ) : null}

      {shouldRenderSection(
        content.calculator,
        content.calculator.programs.length > 0,
      ) ? (
        <EarningsCalculator
          content={content}
          rate={rate}
          formHref={`#${formHtmlId}`}
        />
      ) : null}

      {shouldRenderSection(
        content.benefitsSection,
        content.benefits.length > 0,
      ) ? (
        <Benefits content={content} />
      ) : null}

      {shouldRenderSection(
        content.reviews,
        Boolean(reviews && content.reviews.title),
      ) ? (
        <TestimonialsSection reviews={reviews} content={content.reviews} />
      ) : null}

      {shouldRenderSection(content.faqsSection, content.faqs.length > 0) ? (
        <FAQSection
          id={optionalSectionHtmlId(content.faqsSection._id) ?? "faq"}
          faqs={content.faqs}
          eyebrow={content.faqsSection.eyebrow}
          title={content.faqsSection.title}
          align="center"
        />
      ) : null}

      {shouldRenderSection(content.form, Boolean(content.form.title)) ? (
        <SignupSection
          content={content}
          htmlId={formHtmlId}
          contactEmail={resolveContactEmail(siteConfig)}
          whatsAppHref={whatsAppHref}
        />
      ) : null}
    </div>
  );
}

function AffiliateHero({
  content,
  formHref,
  howHref,
}: {
  content: AffiliatePageContent;
  formHref: string;
  howHref: string;
}) {
  const { hero } = content;
  return (
    <DarkMediaHero
      id={optionalSectionHtmlId(hero._id)}
      image={hero.image}
      imageAlt=""
    >
      <Container
        size="2xl"
        className="relative z-10 flex min-h-[64svh] flex-col justify-center pb-16 pt-[calc(var(--site-header-height,4.75rem)+3rem)] sm:pb-20 lg:min-h-[70svh] lg:pt-[calc(var(--site-header-height,4.75rem)+4rem)]"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-2xl space-y-5"
        >
          {hero.eyebrow ? (
            <span className="type-eyebrow text-white/80">{hero.eyebrow}</span>
          ) : null}
          <h1 className="type-h1 text-white">{hero.title}</h1>
          {hero.lead ? (
            <p className="type-body max-w-xl pt-1 text-white/85">{hero.lead}</p>
          ) : null}
          {hero.chips.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {hero.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/20 bg-ink/20 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3 pt-2">
            {hero.primaryCtaLabel ? (
              <Button href={formHref} variant="primary" size="md">
                {hero.primaryCtaLabel}
              </Button>
            ) : null}
            {hero.secondaryCtaLabel ? (
              <Button href={howHref} variant="outline-light" size="md">
                {hero.secondaryCtaLabel}
              </Button>
            ) : null}
          </div>
        </motion.div>
      </Container>
    </DarkMediaHero>
  );
}

function StatsBand({ stats }: { stats: AffiliatePageContent["stats"] }) {
  return (
    <section aria-label="Programme highlights" className="relative z-10">
      <Container size="2xl">
        <dl className="-mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-secondary/10 bg-secondary/10 shadow-card sm:-mt-12 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={`${stat.value}-${stat.label}`}
              className="flex flex-col items-center justify-center gap-1 bg-white px-4 py-5 text-center sm:py-6"
            >
              <dt className="order-2 text-xs font-medium uppercase tracking-wide text-ink/70">
                {stat.label}
              </dt>
              <dd className="order-1 text-2xl font-semibold text-primary sm:text-3xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

function HowItWorks({
  content,
  htmlId,
}: {
  content: AffiliatePageContent;
  htmlId: string;
}) {
  const { tracksSection } = content;
  const hasHeader = Boolean(tracksSection.title || tracksSection.eyebrow);

  return (
    <section
      id={htmlId}
      className="bg-white section-padding-y scroll-mt-[calc(var(--site-header-height,4.75rem)+0.5rem)]"
    >
      <Container size="2xl">
        {hasHeader ? (
          <SectionHeader
            eyebrow={tracksSection.eyebrow}
            title={tracksSection.title}
            description={tracksSection.lead}
            align="center"
          />
        ) : null}

        <div className={`space-y-8 lg:space-y-10 ${hasHeader ? "mt-10" : ""}`}>
          {content.tracks.map((track) => (
            <TrackBlock key={track.id} track={track} />
          ))}
        </div>
      </Container>
    </section>
  );
}

/**
 * One referral flow (online links / in-person codes) with its 4 steps.
 */
function TrackBlock({
  track,
}: {
  track: AffiliatePageContent["tracks"][number];
}) {
  const headingId = useId();
  const lastIndex = track.steps.length - 1;

  return (
    <article
      aria-labelledby={headingId}
      className="rounded-[2rem] border border-secondary/10 bg-surface-muted px-5 py-8 sm:px-10 sm:py-10"
    >
      <header className="mx-auto max-w-2xl text-center">
        <h3 id={headingId} className="type-h3 text-ink">
          {track.label}
        </h3>
        {track.title ? (
          <p className="mt-2 text-base font-semibold text-primary">
            {track.title}
          </p>
        ) : null}
        {track.description ? (
          <p className="mt-2 text-sm leading-relaxed text-ink/80">
            {track.description}
          </p>
        ) : null}
      </header>

      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {track.steps.map((step, index) => (
          <li
            key={`${track.id}-${step.title}`}
            className="flex flex-col items-center rounded-3xl border border-secondary/10 bg-white p-6 text-center lg:border-0 lg:bg-transparent lg:p-0"
          >
            {/* Icon row: the connector starts at this icon's right edge and
                ends at the next icon's left edge, vertically centred. */}
            <div className="relative flex w-full justify-center">
              {index < lastIndex ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-[calc(50%+2.5rem)] top-1/2 hidden h-0.5 w-[calc(100%-3.5rem)] -translate-y-1/2 bg-primary/40 lg:block"
                />
              ) : null}
              <span className="relative z-10 flex size-20 items-center justify-center rounded-full border-2 border-primary bg-white text-ink shadow-soft">
                <StepIcon iconKey={step.iconKey} />
                <span className="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {index + 1}
                </span>
              </span>
            </div>
            <h4 className="mt-4 type-ui font-semibold text-ink">
              {step.title}
            </h4>
            {step.body ? (
              <p className="mt-1.5 max-w-[16rem] text-sm leading-relaxed text-ink/80">
                {step.body}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </article>
  );
}

function EarningsCalculator({
  content,
  rate,
  formHref,
}: {
  content: AffiliatePageContent;
  rate: number;
  formHref: string;
}) {
  const { calculator } = content;
  const fieldId = useId();
  const [programIndex, setProgramIndex] = useState(0);
  const [referrals, setReferrals] = useState(3);
  const program = calculator.programs[programIndex] ?? calculator.programs[0];
  const perBooking = ((program?.feeUsd ?? 0) * rate) / 100;
  const monthly = perBooking * referrals;

  return (
    <section
      id={optionalSectionHtmlId(calculator._id) ?? "earnings"}
      className="bg-surface-muted section-padding-y"
    >
      <Container size="2xl">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
          <div className="min-w-0 lg:col-span-5">
            <SectionHeader
              eyebrow={calculator.eyebrow}
              title={calculator.title}
              description={calculator.lead}
            />
          </div>
          <div className="min-w-0 rounded-3xl border border-secondary/10 bg-white p-6 shadow-card sm:p-8 lg:col-span-7">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor={`${fieldId}-program`} className={LABEL_CLASS}>
                  Course your audience books
                </label>
                <select
                  id={`${fieldId}-program`}
                  className={INPUT_CLASS}
                  value={programIndex}
                  onChange={(event) =>
                    setProgramIndex(Number(event.target.value))
                  }
                >
                  {calculator.programs.map((option, index) => (
                    <option key={option.label} value={index}>
                      {option.label} — {usd(option.feeUsd)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor={`${fieldId}-count`} className={LABEL_CLASS}>
                  Bookings per month:{" "}
                  <strong className="text-primary">{referrals}</strong>
                </label>
                <input
                  id={`${fieldId}-count`}
                  type="range"
                  min={1}
                  max={20}
                  value={referrals}
                  onChange={(event) => setReferrals(Number(event.target.value))}
                  className="h-11 w-full accent-[var(--color-primary,#a32432)]"
                />
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-primary/5 p-4 text-center sm:p-5">
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-ink/70">
                  Per booking
                </dt>
                <dd className="mt-1 text-lg font-semibold text-ink sm:text-xl">
                  {usd(perBooking)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-ink/70">
                  Per month
                </dt>
                <dd className="mt-1 text-lg font-semibold text-primary sm:text-2xl">
                  {usd(monthly)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-ink/70">
                  Per year
                </dt>
                <dd className="mt-1 text-lg font-semibold text-ink sm:text-xl">
                  {usd(monthly * 12)}
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              {calculator.note ? (
                <p className="max-w-sm text-xs leading-relaxed text-ink/70">
                  {calculator.note}
                </p>
              ) : (
                <span />
              )}
              {content.hero.primaryCtaLabel ? (
                <Button href={formHref} variant="primary" size="sm">
                  {content.hero.primaryCtaLabel}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Benefits({ content }: { content: AffiliatePageContent }) {
  return (
    <section
      id={optionalSectionHtmlId(content.benefitsSection._id) ?? "why-join"}
      className="bg-white section-padding-y"
    >
      <Container size="2xl">
        <SectionHeader
          eyebrow={content.benefitsSection.eyebrow}
          title={content.benefitsSection.title}
          description={content.benefitsSection.lead}
          align="center"
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {content.benefits.map((benefit, index) => (
            <li
              key={benefit.title}
              className="group surface-card flex flex-col rounded-3xl p-6 transition-shadow duration-300 hover:shadow-soft sm:p-7"
            >
              <span className="text-3xl font-semibold text-primary/25 transition-colors group-hover:text-primary/60">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 type-ui font-semibold text-ink">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">
                {benefit.body}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

type FormState = "idle" | "submitting" | "success" | "error";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  interest: "",
  platform: "",
  profileUrl: "",
  audience: "",
  message: "",
};

function SignupSection({
  content,
  htmlId,
  contactEmail,
  whatsAppHref,
}: {
  content: AffiliatePageContent;
  htmlId: string;
  contactEmail: string;
  whatsAppHref: string;
}) {
  const { form } = content;
  const prefersReduced = useReducedMotion() ?? false;
  const fieldId = useId();
  const [state, setState] = useState<FormState>("idle");
  const [data, setData] = useState(EMPTY_FORM);
  const [phoneCountryIso, setPhoneCountryIso] = useState(
    DEFAULT_PHONE_COUNTRY_ISO,
  );
  const [phoneNational, setPhoneNational] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const platformOptions = form.platforms.map((value) => ({
    value,
    label: value,
  }));

  function set<K extends keyof typeof EMPTY_FORM>(key: K, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPhoneError(null);
    if (!phoneNational.trim()) {
      setPhoneError("Please enter your phone number.");
      return;
    }
    setState("submitting");

    const name = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();
    const phone = formatFullPhone(
      getPhoneCountry(phoneCountryIso),
      phoneNational,
    );
    const subject = "Affiliate sign-up";
    const message = [
      `Affiliate sign-up from ${name}`,
      data.interest ? `Interested in: ${data.interest}` : null,
      data.platform ? `Promotes on: ${data.platform}` : null,
      data.profileUrl.trim()
        ? `Profile / website: ${data.profileUrl.trim()}`
        : null,
      data.audience ? `Audience size: ${data.audience}` : null,
      data.message.trim() ? `\n${data.message.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const result = await submitLead({
        type: "contact",
        name,
        email: data.email.trim(),
        phone,
        subject,
        program: data.interest || undefined,
        message,
        source: "/become-an-affiliate",
      });
      if (!result.stored) {
        openMailtoFallback({
          to: contactEmail,
          subject,
          body: `${message}\nEmail: ${data.email.trim()}\nPhone: ${phone}`,
        });
      }
      setState("success");
    } catch {
      setState("error");
    }
  }

  return (
    <section
      id={htmlId}
      className="bg-surface-muted section-padding-y scroll-mt-[calc(var(--site-header-height,4.75rem)+0.5rem)]"
    >
      <Container size="2xl">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="min-w-0 space-y-6 lg:col-span-5">
            <SectionHeader
              eyebrow={form.eyebrow}
              title={form.title}
              description={form.lead}
            />
            <ul className="space-y-3">
              {[
                `${content.commissionRate}% commission on every booking`,
                ...content.hero.chips,
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Check size={12} className="stroke-[3]" />
                  </span>
                  <span className="text-ink">{point}</span>
                </li>
              ))}
            </ul>
            <a
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="surface-panel inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-ink transition-shadow hover:shadow-soft"
            >
              <WhatsApp size={20} />
              Questions first? Chat with us on WhatsApp
            </a>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl border border-secondary/10 bg-white p-6 shadow-card sm:p-10">
              <AnimatePresence mode="wait">
                {state === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={reducedTransition(prefersReduced, {
                      duration: 0.35,
                    })}
                    className="flex flex-col items-center justify-center space-y-4 py-14 text-center"
                    aria-live="polite"
                  >
                    <div className="flex size-16 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600">
                      <Check size={28} className="stroke-[3]" />
                    </div>
                    <h3 className="type-h3 text-ink">{form.successTitle}</h3>
                    <p className="mx-auto max-w-sm text-sm leading-relaxed text-ink">
                      {form.successBody}
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field label="First name *" htmlFor={`${fieldId}-first`}>
                        <input
                          id={`${fieldId}-first`}
                          required
                          autoComplete="given-name"
                          className={INPUT_CLASS}
                          value={data.firstName}
                          onChange={(e) => set("firstName", e.target.value)}
                        />
                      </Field>
                      <Field label="Last name *" htmlFor={`${fieldId}-last`}>
                        <input
                          id={`${fieldId}-last`}
                          required
                          autoComplete="family-name"
                          className={INPUT_CLASS}
                          value={data.lastName}
                          onChange={(e) => set("lastName", e.target.value)}
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field label="Email *" htmlFor={`${fieldId}-email`}>
                        <input
                          id={`${fieldId}-email`}
                          type="email"
                          required
                          autoComplete="email"
                          className={INPUT_CLASS}
                          value={data.email}
                          onChange={(e) => set("email", e.target.value)}
                        />
                      </Field>
                      <Field
                        label="WhatsApp / Phone *"
                        htmlFor={`${fieldId}-phone`}
                      >
                        <PhoneInput
                          id={`${fieldId}-phone`}
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
                      </Field>
                    </div>

                    <fieldset className="space-y-2">
                      <legend className={LABEL_CLASS}>
                        I want to refer students for *
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {INTEREST_OPTIONS.map((option) => (
                          <label
                            key={option}
                            className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-secondary ${data.interest === option ? "border-primary bg-primary/5 font-semibold text-primary" : "border-secondary/15 text-ink hover:border-secondary/30"}`}
                          >
                            <input
                              type="radio"
                              name={`${fieldId}-interest`}
                              value={option}
                              required
                              className="sr-only"
                              checked={data.interest === option}
                              onChange={() => set("interest", option)}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {platformOptions.length > 0 ? (
                        <Field
                          label="Where will you promote us?"
                          htmlFor={`${fieldId}-platform`}
                        >
                          <SearchableSelect
                            id={`${fieldId}-platform`}
                            value={data.platform}
                            onChange={(value) => set("platform", value)}
                            options={platformOptions}
                            placeholder="Choose a platform"
                          />
                        </Field>
                      ) : null}
                      <Field
                        label="Audience size"
                        htmlFor={`${fieldId}-audience`}
                      >
                        <SearchableSelect
                          id={`${fieldId}-audience`}
                          value={data.audience}
                          onChange={(value) => set("audience", value)}
                          options={AUDIENCE_OPTIONS}
                          placeholder="Choose a range"
                        />
                      </Field>
                    </div>

                    <Field
                      label="Profile, channel or website link"
                      htmlFor={`${fieldId}-url`}
                    >
                      <input
                        id={`${fieldId}-url`}
                        type="url"
                        inputMode="url"
                        placeholder="https://instagram.com/yourname"
                        className={INPUT_CLASS}
                        value={data.profileUrl}
                        onChange={(e) => set("profileUrl", e.target.value)}
                      />
                    </Field>

                    <Field
                      label="Anything else? (optional)"
                      htmlFor={`${fieldId}-message`}
                    >
                      <textarea
                        id={`${fieldId}-message`}
                        rows={3}
                        className={`${INPUT_CLASS} resize-none`}
                        value={data.message}
                        onChange={(e) => set("message", e.target.value)}
                      />
                    </Field>

                    {state === "error" ? (
                      <p
                        role="alert"
                        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                      >
                        Something went wrong. Please email us at{" "}
                        <a
                          href={`mailto:${contactEmail}`}
                          className="font-semibold underline"
                        >
                          {contactEmail}
                        </a>
                        .
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={state === "submitting"}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-xs transition-all duration-300 hover:bg-primary-dark hover:shadow-soft disabled:opacity-70"
                    >
                      {state === "submitting"
                        ? "Sending…"
                        : form.submitLabel || "Sign up"}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <label htmlFor={htmlFor} className={LABEL_CLASS}>
        {label}
      </label>
      {children}
    </div>
  );
}
