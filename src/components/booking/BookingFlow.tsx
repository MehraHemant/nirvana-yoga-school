"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Container,
  PhoneInput,
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui";
import type {
  BookingProgram,
  BookingType,
  PaymentMode,
} from "@/content/types/booking";
import {
  calculateBookingPricing,
  formatUsd,
  PAYPAL_FEE_RATE,
} from "@/lib/booking/pricing";
import {
  DEFAULT_PHONE_COUNTRY_ISO,
  formatFullPhone,
  getPhoneCountry,
} from "@/lib/phone-countries";
import { PayPalCheckout } from "./PayPalCheckout";

type BookingFlowProps = {
  type: BookingType;
  programs: BookingProgram[];
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
  email: string;
  paymentMode: PaymentMode;
  referenceCode: string;
  hearAbout: string;
};

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
 * Multi-step book-now flow matching the live site (program → details → PayPal).
 *
 * @param props - Booking type, catalog, PayPal client id, and URL pre-fills
 */
export function BookingFlow({
  type,
  programs,
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
    email: "",
    paymentMode: "deposit_20",
    referenceCode: "",
    hearAbout: "",
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

  const selectedProgram = useMemo(
    () => programs.find((program) => program.slug === form.programSlug) ?? null,
    [programs, form.programSlug],
  );

  const selectedRoom = useMemo(
    () =>
      selectedProgram?.rooms.find((room) => room.roomType === form.roomType) ??
      null,
    [selectedProgram, form.roomType],
  );

  const pricing = useMemo(() => {
    if (!selectedRoom) return null;
    return calculateBookingPricing(selectedRoom.priceUsd, form.paymentMode);
  }, [selectedRoom, form.paymentMode]);

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
  const heroImage =
    type === "course"
      ? "/img/retreat-venue/private/1.webp"
      : "/img/gallery/3-day-retreat/1.jpg";

  async function createPendingBooking() {
    if (!selectedProgram || !selectedRoom || !pricing) {
      setError("Please complete program details.");
      return;
    }

    if (!phoneNational.trim()) {
      setPhoneError("Please enter your phone number.");
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
    setStep(3);
  }

  if (success) {
    return (
      <section className="bg-paper py-20">
        <Container size="md">
          <div className="rounded-3xl border border-emerald-200 bg-white p-10 text-center shadow-card">
            <h1 className="font-serif text-3xl text-ink">Booking confirmed!</h1>
            <p className="mt-4 font-sans text-muted">
              Thank you, {form.name}. Your payment was received and our team
              will contact you shortly at {form.email}.
            </p>
            {pricing && form.paymentMode === "deposit_20" ? (
              <p className="mt-3 font-sans text-sm text-muted">
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
      <section className="relative min-h-[42svh] overflow-hidden bg-ink pt-(--site-header-height,4.75rem) text-white">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-linear-to-r from-ink/95 via-ink/70 to-ink/40" />
        <Container
          size="xl"
          className="relative z-10 flex min-h-[36svh] flex-col justify-center py-14"
        >
          <p className="type-eyebrow mb-3 text-accent">Booking</p>
          <h1 className="font-serif text-4xl font-medium md:text-5xl">
            Reserve Your Journey
          </h1>
          <p className="type-lead mt-4 max-w-2xl font-sans text-white/80">
            Begin your transformative yoga experience at Nirvana Yoga School.
            Pay securely with PayPal — 20% deposit or full payment.
          </p>
        </Container>
      </section>

      <section className="bg-paper py-16 md:py-20">
        <Container size="lg">
          <div className="mb-8 flex flex-wrap gap-2">
            {["Program", "Your details", "Payment"].map((label, index) => {
              const stepNumber = index + 1;
              const active = step === stepNumber;
              const done = step > stepNumber;
              return (
                <span
                  key={label}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                    active
                      ? "bg-primary text-white"
                      : done
                        ? "bg-secondary/10 text-secondary"
                        : "bg-white text-muted border border-ink/10"
                  }`}
                >
                  {stepNumber}. {label}
                </span>
              );
            })}
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
            <div className="rounded-3xl border border-ink/8 bg-white p-6 shadow-card md:p-8">
              {step === 1 ? (
                <div className="space-y-5">
                  <div>
                    <h2 className="font-serif text-2xl text-ink">
                      Program details
                    </h2>
                    <p className="mt-1 font-sans text-sm text-muted">
                      Select your preferred {programLabel.toLowerCase()},
                      accommodation, and dates.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="booking-program"
                      className="text-sm font-semibold text-ink"
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
                        })
                      }
                      options={programOptions}
                      placeholder={`Search or select a ${programLabel.toLowerCase()}…`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="booking-date"
                      className="text-sm font-semibold text-ink"
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
                      className="text-sm font-semibold text-ink"
                    >
                      Room type *
                    </label>
                    <SearchableSelect
                      id="booking-room"
                      required
                      value={form.roomType}
                      disabled={!selectedProgram}
                      onChange={(value) =>
                        setForm({ ...form, roomType: value })
                      }
                      options={roomOptions}
                      placeholder={
                        selectedProgram
                          ? "Search or select accommodation…"
                          : `Select a ${programLabel.toLowerCase()} first`
                      }
                    />
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
                    <h2 className="font-serif text-2xl text-ink">
                      Personal information
                    </h2>
                    <p className="mt-1 font-sans text-sm text-muted">
                      Tell us how to reach you.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <label
                        htmlFor="booking-name"
                        className="text-sm font-semibold text-ink"
                      >
                        Name *
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
                        className="text-sm font-semibold text-ink"
                      >
                        Gender *
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
                        className="text-sm font-semibold text-ink"
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
                        className="text-sm font-semibold text-ink"
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
                    <div className="space-y-2 sm:col-span-2">
                      <label
                        htmlFor="booking-payment-mode"
                        className="text-sm font-semibold text-ink"
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
                        placeholder="Select payment option…"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="booking-reference"
                        className="text-sm font-semibold text-ink"
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
                        className="text-sm font-semibold text-ink"
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
                        submitting ||
                        !form.name ||
                        !form.gender ||
                        !form.email ||
                        !phoneNational.trim()
                      }
                      onClick={() => void createPendingBooking()}
                    >
                      {submitting ? "Saving…" : "Continue to payment"}
                    </button>
                  </div>
                </div>
              ) : null}

              {step === 3 && bookingId ? (
                <div className="space-y-5">
                  <div>
                    <h2 className="font-serif text-2xl text-ink">
                      Payment method
                    </h2>
                    <p className="mt-1 font-sans text-sm text-muted">
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
                    onClick={() => setStep(2)}
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

            <aside className="h-fit rounded-3xl border border-ink/8 bg-white p-6 shadow-card">
              <h3 className="font-serif text-xl text-ink">Fee breakdown</h3>
              {pricing && selectedProgram ? (
                <dl className="mt-4 space-y-3 font-sans text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Program</dt>
                    <dd className="text-ink">{selectedProgram.title}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Room</dt>
                    <dd className="text-ink">{form.roomType || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Date</dt>
                    <dd className="text-ink">{form.batchDate || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-ink/8 pt-3">
                    <dt className="text-muted">Course price</dt>
                    <dd className="font-semibold text-ink">
                      {formatUsd(pricing.fullAmountUsd)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">
                      {form.paymentMode === "deposit_20"
                        ? "20% deposit"
                        : "Pay now"}
                    </dt>
                    <dd className="text-ink">{formatUsd(pricing.payNowUsd)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">PayPal fee (6%)</dt>
                    <dd className="text-ink">
                      {formatUsd(pricing.paypalFeeUsd)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-ink/8 pt-3">
                    <dt className="font-semibold text-ink">Total to pay now</dt>
                    <dd className="font-serif text-xl font-medium text-primary">
                      {formatUsd(pricing.totalPayNowUsd)}
                    </dd>
                  </div>
                  {pricing.remainingUsd > 0 ? (
                    <p className="text-xs text-muted">
                      Remaining {formatUsd(pricing.remainingUsd)} due on
                      arrival.
                    </p>
                  ) : null}
                </dl>
              ) : (
                <p className="mt-4 font-sans text-sm text-muted">
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
