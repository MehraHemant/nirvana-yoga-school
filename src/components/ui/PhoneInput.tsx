"use client";

import { getPhoneCountry, sanitizeNationalNumber } from "@/lib/phone-countries";
import CountryCodeSelect from "./CountryCodeSelect";

export type PhoneInputProps = {
  /** `id` for the national number field — country select uses `${id}-country` */
  id: string;
  /** ISO country code for the dial-code selector */
  countryIso: string;
  /** National number digits (without country code) */
  nationalNumber: string;
  /** Called when the user picks a different country */
  onCountryChange: (iso2: string) => void;
  /** Called when the national number changes (digits only) */
  onNationalNumberChange: (value: string) => void;
  /** Optional validation message shown below the field */
  error?: string | null;
  /** Whether the field is required in the parent form */
  required?: boolean;
  /** Disables both controls */
  disabled?: boolean;
  /** Extra classes on the outer wrapper */
  className?: string;
};

/**
 * International phone field with searchable country-code dropdown.
 *
 * @param props - Controlled country + national number state
 */
export default function PhoneInput({
  id,
  countryIso,
  nationalNumber,
  onCountryChange,
  onNationalNumberChange,
  error = null,
  required = false,
  disabled = false,
  className = "",
}: PhoneInputProps) {
  const country = getPhoneCountry(countryIso);
  const errorId = `${id}-error`;

  const handleNumberChange = (raw: string) => {
    onNationalNumberChange(sanitizeNationalNumber(raw));
  };

  const borderClass = error
    ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-200"
    : "border-secondary/15 focus-within:border-secondary focus-within:ring-secondary";

  return (
    <div className={className}>
      <div
        className={`relative flex rounded-2xl border bg-white transition-colors focus-within:ring-1 ${borderClass}`}
      >
        <CountryCodeSelect
          id={`${id}-country`}
          value={countryIso}
          onChange={onCountryChange}
          disabled={disabled}
        />

        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          disabled={disabled}
          value={nationalNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder={
            country.iso2 === "OTHER" ? "Include country code" : "Phone number"
          }
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3 font-sans text-sm text-ink placeholder-muted/65 focus:outline-none"
        />
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 font-sans text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
