"use client";

import { useMemo, useState } from "react";
import { DarkMediaHero } from "@/components/hero";
import {
  Container,
  PhoneInput,
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui";
import type {
  BookingAddon,
  BookingAddonsContent,
  BookingProgram,
  BookingType,
  PaymentMode,
} from "@/content/types/booking";
import type { BookingPageContent } from "@/content/types/dedicated-pages";
import {
  enrichBookingAddons,
  filterBookingAddonsForType,
  getAddonOptions,
  getSelectedOptionIdForGroup,
  isOptionAddon,
  resolveSelectedAddons,
  setAddonGroupSelection,
} from "@/lib/booking/addons";
import {
  calculateBookingPricing,
  formatUsd,
  PAYPAL_FEE_RATE,
} from "@/lib/booking/pricing";
import {
  getRoomOccupancy,
  requiresMultipleGuests,
} from "@/lib/booking/occupancy";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import { createEmptyBookingPageContent } from "@/lib/cms/structural-defaults";
import { optionalSectionHtmlId } from "@/lib/html-id";
import {
  DEFAULT_PHONE_COUNTRY_ISO,
  formatFullPhone,
  getPhoneCountry,
} from "@/lib/phone-countries";
import { PayPalCheckout } from "./PayPalCheckout";

type BookingFlowProps = {
  type: BookingType;
  programs: BookingProgram[];
  /** CMS booking page content */
  content?: BookingPageContent;
  /** Optional checkout add-ons from admin (`global_settings.bookingAddons`) */
  addons?: BookingAddonsContent | null;
  /**
   * Catalog used to resolve course add-on rooms.
   * Defaults to `programs`. Pass the course catalog on retreat booking.
   */
  addonCatalog?: BookingProgram[];
  paypalClientId: string | null;
  initialProgramSlug?: string;
  initialRoomType?: string;
  initialBatchDate?: string;
};

type FormState = {
  programSlug: string;
  roomType: string;
  batchDate: string;
  name: string;
  gender: string;
  secondGuestName: string;
  secondGuestGender: string;
  email: string;
  /** Empty until the guest chooses full payment or deposit */
  paymentMode: PaymentMode | "";
  referenceCode: string;
  hearAbout: string;
  selectedAddonIds: string[];
};

const BOOKING_STEPS = [
  "Program",
  "Your details",
  "Add-ons",
  "Payment",
] as const;

const GENDER_OPTIONS: SearchableSelectOption[] = [
  { value: "Female", label: "Female" },
  { value: "Male", label: "Male" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

const HEAR_ABOUT_OPTIONS: SearchableSelectOption[] = [
  { value: "Google search", label: "Google search" },
  { value: "Instagram", label: "Instagram" },
  { value: "Facebook", label: "Facebook" },
  { value: "YouTube", label: "YouTube" },
  {
    value: "Friend / family recommendation",
    label: "Friend / family recommendation",
  },
  { value: "Yoga Alliance", label: "Yoga Alliance" },
  { value: "Tripadvisor", label: "Tripadvisor" },
  { value: "Previous student", label: "Previous student" },
  { value: "Other", label: "Other" },
];

const PAYMENT_MODE_OPTIONS: SearchableSelectOption[] = [
  {
    value: "deposit_20",
    label: "Pay 20% deposit now, balance on arrival",
    hint: "Recommended — secure your spot with a smaller payment",
  },
  {
    value: "full",
    label: "Pay full amount now",
    hint: "Complete payment in one transaction",
  },
];

/**
 * Multi-step book-now flow (program → details → add-ons → PayPal).
 *
 * @param props - Booking type, catalog, add-ons, PayPal client id, and URL pre-fills
 */
export function BookingFlow({
  type,
  programs,
  content = createEmptyBookingPageContent(),
  addons = null,
  addonCatalog,
  paypalClientId,
  initialProgramSlug = "",
  initialRoomType = "",
  initialBatchDate = "",
}: BookingFlowProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({
    programSlug: initialProgramSlug,
    roomType: initialRoomType,
    batchDate: initialBatchDate,
    name: "",
    gender: "",
    secondGuestName: "",
    secondGuestGender: "",
    email: "",
    paymentMode: "",
    referenceCode: "",
    hearAbout: "",
    selectedAddonIds: [],
  });
  const [phoneCountryIso, setPhoneCountryIso] = useState(
    DEFAULT_PHONE_COUNTRY_ISO,
  );
  const [phoneNational, setPhoneNational] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  /** Expanded add-on accordion; undefined = first one open by default */
  const [openAddonId, setOpenAddonId] = useState<string | null | undefined>(
    undefined,
  );

  const selectedProgram = useMemo(
    () => programs.find((program) => program.slug === form.programSlug) ?? null,
    [programs, form.programSlug],
  );

  const availableAddons = useMemo(
    () =>
      enrichBookingAddons(
        filterBookingAddonsForType(type, addons, form.programSlug),
        addonCatalog ?? programs,
      ),
    [type, addons, form.programSlug, addonCatalog, programs],
  );

  const selectedAddons = useMemo(
    () => resolveSelectedAddons(availableAddons, form.selectedAddonIds),
    [availableAddons, form.selectedAddonIds],
  );

  const selectedRoom = useMemo(
    () =>
      selectedProgram?.rooms.find((room) => room.roomType === form.roomType) ??
      null,
    [selectedProgram, form.roomType],
  );

  const roomOccupancy = getRoomOccupancy(form.roomType);
  const needsSecondGuest = requiresMultipleGuests(form.roomType);

  const roomPriceUsd = selectedRoom?.priceUsd ?? 0;
  const addonsTotalUsd = selectedAddons.reduce(
    (sum, item) => sum + item.priceUsd,
    0,
  );

  const paymentChosen = form.paymentMode !== "";

  const pricing = useMemo(() => {
    if (!selectedRoom) return null;
    // Before a choice, price as full so the total is still shown.
    return calculateBookingPricing(
      roomPriceUsd + addonsTotalUsd,
      form.paymentMode || "full",
    );
  }, [selectedRoom, roomPriceUsd, addonsTotalUsd, form.paymentMode]);

  const programOptions = useMemo<SearchableSelectOption[]>(
    () =>
      programs.map((program) => ({
        value: program.slug,
        label: program.title,
        hint: program.duration,
      })),
    [programs],
  );

  const batchOptions = useMemo<SearchableSelectOption[]>(
    () =>
      selectedProgram?.batches.map((batch) => ({
        value: batch,
        label: batch,
      })) ?? [],
    [selectedProgram],
  );

  const roomOptions = useMemo<SearchableSelectOption[]>(
    () =>
      selectedProgram?.rooms.map((room) => ({
        value: room.roomType,
        label: room.roomType,
        hint: formatUsd(room.priceUsd),
      })) ?? [],
    [selectedProgram],
  );

  const programLabel = type === "course" ? "Course" : "Retreat";

  /**
   * Toggles a custom (manual) add-on.
   *
   * @param item - Manual add-on
   */
  function toggleManualAddon(item: BookingAddon) {
    setForm((prev) => {
      const selected = getSelectedOptionIdForGroup(item, prev.selectedAddonIds);
      return {
        ...prev,
        selectedAddonIds: setAddonGroupSelection(
          prev.selectedAddonIds,
          item,
          selected ? null : item.id,
        ),
      };
    });
  }

  /**
   * Selects or clears a room option under a course add-on.
   *
   * @param item - Course add-on
   * @param optionId - Room option id, or null to skip
   */
  function selectCourseAddonRoom(item: BookingAddon, optionId: string | null) {
    setForm((prev) => ({
      ...prev,
      selectedAddonIds: setAddonGroupSelection(
        prev.selectedAddonIds,
        item,
        optionId,
      ),
    }));
  }

  /**
   * Creates a pending booking and advances to the PayPal step.
   */
  async function createPendingBooking() {
    if (!selectedProgram || !selectedRoom || !pricing) {
      setError("Please complete program details.");
      return;
    }

    if (!phoneNational.trim()) {
      setPhoneError("Please enter your phone number.");
      return;
    }

    if (!paymentChosen) {
      setError("Please choose a payment option.");
      setStep(2);
      return;
    }

    setSubmitting(true);
    setError("");
    setPhoneError(null);

    const phoneCountry = getPhoneCountry(phoneCountryIso);
    const phone = formatFullPhone(phoneCountry, phoneNational);

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        programSlug: form.programSlug,
        programTitle: selectedProgram.title,
        roomType: form.roomType,
        batchDate: form.batchDate,
        duration: selectedProgram.duration,
        name: form.name,
        gender: form.gender,
        email: form.email,
        phone,
        country: phoneCountry.name,
        paymentMode: form.paymentMode,
        referenceCode: form.referenceCode,
        hearAbout: form.hearAbout,
        selectedAddonIds: form.selectedAddonIds,
        additionalGuests: needsSecondGuest
          ? [
              {
                name: form.secondGuestName.trim(),
                gender: form.secondGuestGender,
              },
            ]
          : [],
      }),
    });

    setSubmitting(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Could not save booking");
      return;
    }

    const body = (await response.json()) as { booking: { id: string } };
    setBookingId(body.booking.id);
    setStep(4);
  }

  if (success) {
    return (
      <section className="bg-white section-padding-y">
        <Container size="2xl">
          <div className="rounded-3xl border border-emerald-200 bg-white p-10 text-center shadow-card">
            <h1 className="type-h2 text-ink">Booking confirmed!</h1>
            <p className="mt-4 text-ink">
              Thank you, {form.name}. Your payment was received and our team
              will contact you shortly at {form.email}.
            </p>
            {pricing && form.paymentMode === "deposit_20" ? (
              <p className="mt-3 text-sm text-ink">
                Remaining balance of {formatUsd(pricing.remainingUsd)} is due on
                arrival at the school.
              </p>
            ) : null}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <>
      {shouldRenderSection(content.hero, true) ? (
        <DarkMediaHero
          id={optionalSectionHtmlId(content.hero._id)}
          image={content.hero.image}
          imageAlt=""
        >
          <Container
            size="2xl"
            className="relative z-10 flex min-h-[52svh] flex-col justify-center pb-12 pt-[calc(var(--site-header-height,4.75rem)+3rem)] sm:pb-14 sm:pt-[calc(var(--site-header-height,4.75rem)+3.5rem)] lg:min-h-[58svh] lg:pb-16 lg:pt-[calc(var(--site-header-height,4.75rem)+4rem)]"
          >
            <div className="max-w-2xl space-y-5">
              <span className="type-eyebrow text-white/80">
                {content.hero.eyebrow}
              </span>
              <h1 className="type-h1 text-white">{content.hero.title}</h1>
              <p className="type-body max-w-xl pt-1 text-white/85">
                {content.hero.lead}
              </p>
            </div>
          </Container>
        </DarkMediaHero>
      ) : null}

      <section className="bg-white section-padding-y">
        <Container size="2xl">
          {shouldRenderSection(
            content.stepsSection,
            content.steps.length > 0,
          ) ? (
            <ol
              id={optionalSectionHtmlId(content.stepsSection?._id)}
              className="mb-10 grid gap-4 sm:grid-cols-3"
            >
              {content.steps.map((item) => (
                <li
                  key={`${item.step}-${item.title}`}
                  className="surface-bordered p-5 shadow-card"
                >
                  <span className="type-eyebrow text-secondary">
                    {item.step}
                  </span>
                  <h2 className="type-h4 mt-1 text-ink">{item.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          ) : null}
          <div className="mb-8 flex flex-wrap gap-2">
            {BOOKING_STEPS.map((label, index) => {
              const stepNumber = index + 1;
              const active = step === stepNumber;
              const done = step > stepNumber;
              return (
                <span
                  key={label}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${active ? "bg-primary text-white" : done ? "bg-primary/10 text-primary" : "bg-white text-ink border border-ink/10"}`}
                >
                  {stepNumber}. {label}
                </span>
              );
            })}
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
            <div className="min-w-0 rounded-3xl border border-ink/8 bg-white p-6 shadow-card md:p-8">
              {step === 1 ? (
                <div className="space-y-5">
                  <div>
                    <h2 className="type-h3 text-ink">Program details</h2>
                    <p className="mt-1 text-sm text-ink">
                      Select your preferred {programLabel.toLowerCase()},
                      accommodation, and dates.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="booking-program"
                      className="text-sm font-medium leading-[1.4] text-ink"
                    >
                      Select {programLabel} *
                    </label>
                    <SearchableSelect
                      id="booking-program"
                      required
                      value={form.programSlug}
                      onChange={(value) =>
                        setForm({
                          ...form,
                          programSlug: value,
                          roomType: "",
                          batchDate: "",
                          secondGuestName: "",
                          secondGuestGender: "",
                          selectedAddonIds: [],
                        })
                      }
                      options={programOptions}
                      placeholder={`Search or select a ${programLabel.toLowerCase()}…`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="booking-date"
                      className="text-sm font-medium leading-[1.4] text-ink"
                    >
                      Select date *
                    </label>
                    <SearchableSelect
                      id="booking-date"
                      required
                      value={form.batchDate}
                      disabled={!selectedProgram}
                      onChange={(value) =>
                        setForm({ ...form, batchDate: value })
                      }
                      options={batchOptions}
                      placeholder={
                        selectedProgram
                          ? "Search or select a start date…"
                          : `Select a ${programLabel.toLowerCase()} first`
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="booking-room"
                      className="text-sm font-medium leading-[1.4] text-ink"
                    >
                      Room type *
                    </label>
                    <SearchableSelect
                      id="booking-room"
                      required
                      value={form.roomType}
                      disabled={!selectedProgram}
                      onChange={(value) =>
                        setForm({
                          ...form,
                          roomType: value,
                          secondGuestName: "",
                          secondGuestGender: "",
                        })
                      }
                      options={roomOptions}
                      placeholder={
                        selectedProgram
                          ? "Search or select accommodation…"
                          : `Select a ${programLabel.toLowerCase()} first`
                      }
                    />
                    {needsSecondGuest ? (
                      <p className="rounded-2xl border border-primary/15 bg-primary/5 px-3 py-2 text-xs leading-relaxed text-ink">
                        This room is for {roomOccupancy} people. You&apos;ll be
                        asked for both guests&apos; details on the next step.
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    className="booking-btn-primary"
                    disabled={
                      !form.programSlug || !form.batchDate || !form.roomType
                    }
                    onClick={() => setStep(2)}
                  >
                    Next step
                  </button>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-5">
                  <div>
                    <h2 className="type-h3 text-ink">
                      {needsSecondGuest
                        ? "Guest details"
                        : "Personal information"}
                    </h2>
                    <p className="mt-1 text-sm text-ink">
                      {needsSecondGuest
                        ? `This room is for ${roomOccupancy} people. Add details for both guests — guest 1 is the primary contact.`
                        : "Tell us how to reach you."}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {needsSecondGuest ? (
                      <div className="sm:col-span-2">
                        <p className="type-eyebrow text-primary">
                          Guest 1 — Primary contact
                        </p>
                      </div>
                    ) : null}
                    <div className="space-y-2 sm:col-span-2">
                      <label
                        htmlFor="booking-name"
                        className="text-sm font-medium leading-[1.4] text-ink"
                      >
                        {needsSecondGuest ? "Guest 1 name *" : "Name *"}
                      </label>
                      <input
                        id="booking-name"
                        className="booking-input"
                        value={form.name}
                        onChange={(event) =>
                          setForm({ ...form, name: event.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="booking-gender"
                        className="text-sm font-medium leading-[1.4] text-ink"
                      >
                        {needsSecondGuest ? "Guest 1 gender *" : "Gender *"}
                      </label>
                      <SearchableSelect
                        id="booking-gender"
                        required
                        value={form.gender}
                        onChange={(value) =>
                          setForm({ ...form, gender: value })
                        }
                        options={GENDER_OPTIONS}
                        placeholder="Select gender…"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="booking-email"
                        className="text-sm font-medium leading-[1.4] text-ink"
                      >
                        Email *
                      </label>
                      <input
                        id="booking-email"
                        type="email"
                        className="booking-input"
                        value={form.email}
                        onChange={(event) =>
                          setForm({ ...form, email: event.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label
                        htmlFor="booking-phone"
                        className="text-sm font-medium leading-[1.4] text-ink"
                      >
                        WhatsApp / Phone *
                      </label>
                      <PhoneInput
                        id="booking-phone"
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

                    {needsSecondGuest ? (
                      <>
                        <div className="sm:col-span-2 border-t border-ink/8 pt-4">
                          <p className="type-eyebrow text-primary">Guest 2</p>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <label
                            htmlFor="booking-second-guest-name"
                            className="text-sm font-medium leading-[1.4] text-ink"
                          >
                            Guest 2 name *
                          </label>
                          <input
                            id="booking-second-guest-name"
                            className="booking-input"
                            value={form.secondGuestName}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                secondGuestName: event.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <label
                            htmlFor="booking-second-guest-gender"
                            className="text-sm font-medium leading-[1.4] text-ink"
                          >
                            Guest 2 gender *
                          </label>
                          <SearchableSelect
                            id="booking-second-guest-gender"
                            required
                            value={form.secondGuestGender}
                            onChange={(value) =>
                              setForm({ ...form, secondGuestGender: value })
                            }
                            options={GENDER_OPTIONS}
                            placeholder="Select gender…"
                          />
                        </div>
                      </>
                    ) : null}

                    <div className="space-y-2 sm:col-span-2 border-t border-ink/8 pt-4">
                      <label
                        htmlFor="booking-payment-mode"
                        className="text-sm font-medium leading-[1.4] text-ink"
                      >
                        Payment mode *
                      </label>
                      <SearchableSelect
                        id="booking-payment-mode"
                        required
                        value={form.paymentMode}
                        onChange={(value) =>
                          setForm({
                            ...form,
                            paymentMode: value as PaymentMode,
                          })
                        }
                        options={PAYMENT_MODE_OPTIONS}
                        placeholder="Choose payment option"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="booking-reference"
                        className="text-sm font-medium leading-[1.4] text-ink"
                      >
                        Reference code
                      </label>
                      <input
                        id="booking-reference"
                        className="booking-input"
                        value={form.referenceCode}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            referenceCode: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="booking-hear-about"
                        className="text-sm font-medium leading-[1.4] text-ink"
                      >
                        How did you hear about us?
                      </label>
                      <SearchableSelect
                        id="booking-hear-about"
                        value={form.hearAbout}
                        onChange={(value) =>
                          setForm({ ...form, hearAbout: value })
                        }
                        options={HEAR_ABOUT_OPTIONS}
                        placeholder="Select an option…"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="booking-btn-secondary"
                      onClick={() => setStep(1)}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="booking-btn-primary"
                      disabled={
                        !form.name ||
                        !form.gender ||
                        !form.email ||
                        !phoneNational.trim() ||
                        !paymentChosen ||
                        (needsSecondGuest &&
                          (!form.secondGuestName.trim() ||
                            !form.secondGuestGender))
                      }
                      onClick={() => {
                        setError("");
                        setStep(3);
                      }}
                    >
                      Next step
                    </button>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-5">
                  <div>
                    <h2 className="type-h3 text-ink">Add-ons</h2>
                    <p className="mt-1 text-sm text-ink">
                      {addons?.intro?.trim() ||
                        "Optional extras for your stay. Skip if you do not need any."}
                    </p>
                  </div>

                  {availableAddons.length > 0 ? (
                    <ul className="space-y-3">
                      {availableAddons.map((item, index) => {
                        if (isOptionAddon(item)) {
                          const options = getAddonOptions(item);
                          const selectedOptionId = getSelectedOptionIdForGroup(
                            item,
                            form.selectedAddonIds,
                          );
                          const selectedOption = options.find(
                            (option) => option.id === selectedOptionId,
                          );
                          const open =
                            openAddonId === undefined
                              ? index === 0
                              : openAddonId === item.id;
                          const panelId = `addon-panel-${item.id}`;
                          return (
                            <li
                              key={item.id}
                              className={`overflow-hidden rounded-xl border transition-colors ${selectedOptionId ? "border-primary/40" : "border-ink/12"}`}
                            >
                              <button
                                type="button"
                                aria-expanded={open}
                                aria-controls={panelId}
                                className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors ${open ? "bg-ink/[0.07]" : "bg-ink/[0.035] hover:bg-ink/[0.06]"}`}
                                onClick={() =>
                                  setOpenAddonId(open ? null : item.id)
                                }
                              >
                                <span className="min-w-0">
                                  <span className="block text-sm font-semibold text-ink">
                                    {item.label}
                                  </span>
                                  {selectedOption ? (
                                    <span className="mt-0.5 block text-xs font-medium text-primary">
                                      Selected: {selectedOption.label} (+
                                      {formatUsd(selectedOption.priceUsd)})
                                    </span>
                                  ) : null}
                                </span>
                                <span
                                  aria-hidden
                                  className={`mt-1 shrink-0 text-xs text-ink transition-transform ${open ? "rotate-180" : ""}`}
                                >
                                  ▼
                                </span>
                              </button>
                              {open ? (
                                <fieldset
                                  id={panelId}
                                  className="space-y-1 bg-white px-4 py-3"
                                >
                                  <legend className="sr-only">
                                    Options for {item.label}
                                  </legend>
                                  {item.description ? (
                                    <p className="pb-1 text-sm text-ink">
                                      {item.description}
                                    </p>
                                  ) : null}
                                  {options.length === 0 ? (
                                    <p className="text-xs text-ink">
                                      No options available right now.
                                    </p>
                                  ) : (
                                    options.map((option) => (
                                      <label
                                        key={option.id}
                                        className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 hover:bg-sand/40"
                                      >
                                        <input
                                          type="radio"
                                          name={`addon-${item.id}`}
                                          className="h-4 w-4 shrink-0 accent-[var(--color-primary,#a32432)]"
                                          checked={
                                            selectedOptionId === option.id
                                          }
                                          onChange={() =>
                                            selectCourseAddonRoom(
                                              item,
                                              option.id,
                                            )
                                          }
                                        />
                                        <span className="text-sm text-ink">
                                          {option.label}{" "}
                                          <span className="text-ink/70">
                                            (+{formatUsd(option.priceUsd)})
                                          </span>
                                        </span>
                                      </label>
                                    ))
                                  )}
                                  {selectedOptionId ? (
                                    <button
                                      type="button"
                                      className="mt-1 px-1 text-xs font-medium text-primary underline-offset-2 hover:underline"
                                      onClick={() =>
                                        selectCourseAddonRoom(item, null)
                                      }
                                    >
                                      Remove this add-on
                                    </button>
                                  ) : null}
                                </fieldset>
                              ) : null}
                            </li>
                          );
                        }

                        const checked = Boolean(
                          getSelectedOptionIdForGroup(
                            item,
                            form.selectedAddonIds,
                          ),
                        );
                        return (
                          <li key={item.id}>
                            <label
                              className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition-colors ${checked ? "border-primary/40 bg-primary/5" : "border-ink/12 bg-ink/[0.035] hover:border-ink/20"}`}
                            >
                              <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 accent-[var(--color-primary,#a32432)]"
                                checked={checked}
                                onChange={() => toggleManualAddon(item)}
                              />
                              <span className="min-w-0 flex-1">
                                <span className="flex flex-wrap items-baseline justify-between gap-2">
                                  <span className="text-sm font-semibold text-ink">
                                    {item.label}
                                  </span>
                                  <span className="text-sm text-primary">
                                    +{formatUsd(item.priceUsd ?? 0)}
                                  </span>
                                </span>
                                {item.description ? (
                                  <span className="mt-1 block text-sm text-ink">
                                    {item.description}
                                  </span>
                                ) : null}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="rounded-2xl border border-ink/8 bg-sand/20 px-4 py-3 text-sm text-ink">
                      No optional add-ons are available for this booking right
                      now.
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="booking-btn-secondary"
                      onClick={() => setStep(2)}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="booking-btn-primary"
                      disabled={submitting}
                      onClick={() => void createPendingBooking()}
                    >
                      {submitting ? "Saving…" : "Continue to payment"}
                    </button>
                  </div>
                </div>
              ) : null}

              {step === 4 && bookingId ? (
                <div className="space-y-5">
                  <div>
                    <h2 className="type-h3 text-ink">Payment method</h2>
                    <p className="mt-1 text-sm text-ink">
                      Safe payment using PayPal, credit card, or debit card. A{" "}
                      {Math.round(PAYPAL_FEE_RATE * 100)}% processing fee
                      applies.
                    </p>
                  </div>

                  {paypalClientId ? (
                    <PayPalCheckout
                      clientId={paypalClientId}
                      bookingId={bookingId}
                      onSuccess={() => setSuccess(true)}
                      onError={setError}
                    />
                  ) : (
                    <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      PayPal is not configured yet. Set{" "}
                      <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> and PayPal
                      server credentials in <code>.env</code>.
                    </p>
                  )}

                  <button
                    type="button"
                    className="booking-btn-secondary"
                    onClick={() => setStep(3)}
                  >
                    Back
                  </button>
                </div>
              ) : null}

              {error ? (
                <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
            </div>

            <aside className="h-fit min-w-0 rounded-3xl border border-ink/8 bg-white p-6 shadow-card lg:sticky lg:top-[calc(var(--site-header-height,4.75rem)+1rem)]">
              <h3 className="type-h4 text-ink">Fee breakdown</h3>
              {pricing && selectedProgram ? (
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="shrink-0 text-ink">Program</dt>
                    <dd className="min-w-0 text-right text-ink">
                      {selectedProgram.title}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="shrink-0 text-ink">Room</dt>
                    <dd className="min-w-0 text-right text-ink">
                      {form.roomType || "—"}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="shrink-0 text-ink">Date</dt>
                    <dd className="min-w-0 whitespace-nowrap text-right text-ink">
                      {form.batchDate || "—"}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 border-t border-ink/8 pt-3">
                    <dt className="min-w-0 text-ink">
                      {type === "course" ? "Course price" : "Package price"}
                    </dt>
                    <dd className="shrink-0 whitespace-nowrap font-semibold tabular-nums text-ink">
                      {formatUsd(roomPriceUsd)}
                    </dd>
                  </div>
                  {selectedAddons.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4"
                    >
                      <dt className="min-w-0 text-ink">{item.label}</dt>
                      <dd className="shrink-0 whitespace-nowrap tabular-nums text-ink">
                        {formatUsd(item.priceUsd)}
                      </dd>
                    </div>
                  ))}
                  {selectedAddons.length > 0 || !paymentChosen ? (
                    <div className="flex items-start justify-between gap-4">
                      <dt className="min-w-0 text-ink">
                        {paymentChosen ? "Subtotal" : "Total"}
                      </dt>
                      <dd className="shrink-0 whitespace-nowrap font-semibold tabular-nums text-ink">
                        {formatUsd(pricing.fullAmountUsd)}
                      </dd>
                    </div>
                  ) : null}
                  {!paymentChosen ? (
                    <p className="border-t border-ink/8 pt-3 text-xs text-ink">
                      Choose a payment option to see the amount due now.
                    </p>
                  ) : null}
                  {paymentChosen ? (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <dt className="min-w-0 text-ink">
                          {form.paymentMode === "deposit_20"
                            ? "20% deposit"
                            : "Pay now"}
                        </dt>
                        <dd className="shrink-0 whitespace-nowrap tabular-nums text-ink">
                          {formatUsd(pricing.payNowUsd)}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <dt className="min-w-0 text-ink">PayPal fee (6%)</dt>
                        <dd className="shrink-0 whitespace-nowrap tabular-nums text-ink">
                          {formatUsd(pricing.paypalFeeUsd)}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-4 border-t border-ink/8 pt-3">
                        <dt className="min-w-0 font-semibold text-ink">
                          Total to pay now
                        </dt>
                        <dd className="shrink-0 whitespace-nowrap text-xl font-semibold tabular-nums text-primary">
                          {formatUsd(pricing.totalPayNowUsd)}
                        </dd>
                      </div>
                      {pricing.remainingUsd > 0 ? (
                        <p className="text-xs text-ink">
                          Remaining {formatUsd(pricing.remainingUsd)} due on
                          arrival.
                        </p>
                      ) : null}
                    </>
                  ) : null}
                </dl>
              ) : (
                <p className="mt-4 text-sm text-ink">
                  Select a program and room to see pricing.
                </p>
              )}
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
