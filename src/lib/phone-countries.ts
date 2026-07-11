/** Country metadata for international phone inputs. */
export type PhoneCountry = {
  /** ISO 3166-1 alpha-2 code */
  iso2: string;
  /** Display name */
  name: string;
  /** Country calling code without "+" */
  dialCode: string;
};

/** Curated list for international yoga-school inquiries — India first, then common origins. */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso2: "IN", name: "India", dialCode: "91" },
  { iso2: "US", name: "United States", dialCode: "1" },
  { iso2: "CA", name: "Canada", dialCode: "1" },
  { iso2: "GB", name: "United Kingdom", dialCode: "44" },
  { iso2: "AU", name: "Australia", dialCode: "61" },
  { iso2: "DE", name: "Germany", dialCode: "49" },
  { iso2: "FR", name: "France", dialCode: "33" },
  { iso2: "ES", name: "Spain", dialCode: "34" },
  { iso2: "IT", name: "Italy", dialCode: "39" },
  { iso2: "NL", name: "Netherlands", dialCode: "31" },
  { iso2: "BE", name: "Belgium", dialCode: "32" },
  { iso2: "CH", name: "Switzerland", dialCode: "41" },
  { iso2: "AT", name: "Austria", dialCode: "43" },
  { iso2: "SE", name: "Sweden", dialCode: "46" },
  { iso2: "NO", name: "Norway", dialCode: "47" },
  { iso2: "DK", name: "Denmark", dialCode: "45" },
  { iso2: "IE", name: "Ireland", dialCode: "353" },
  { iso2: "PT", name: "Portugal", dialCode: "351" },
  { iso2: "PL", name: "Poland", dialCode: "48" },
  { iso2: "RU", name: "Russia", dialCode: "7" },
  { iso2: "TR", name: "Turkey", dialCode: "90" },
  { iso2: "AE", name: "United Arab Emirates", dialCode: "971" },
  { iso2: "SA", name: "Saudi Arabia", dialCode: "966" },
  { iso2: "IL", name: "Israel", dialCode: "972" },
  { iso2: "SG", name: "Singapore", dialCode: "65" },
  { iso2: "MY", name: "Malaysia", dialCode: "60" },
  { iso2: "TH", name: "Thailand", dialCode: "66" },
  { iso2: "ID", name: "Indonesia", dialCode: "62" },
  { iso2: "PH", name: "Philippines", dialCode: "63" },
  { iso2: "VN", name: "Vietnam", dialCode: "84" },
  { iso2: "JP", name: "Japan", dialCode: "81" },
  { iso2: "KR", name: "South Korea", dialCode: "82" },
  { iso2: "CN", name: "China", dialCode: "86" },
  { iso2: "HK", name: "Hong Kong", dialCode: "852" },
  { iso2: "TW", name: "Taiwan", dialCode: "886" },
  { iso2: "NZ", name: "New Zealand", dialCode: "64" },
  { iso2: "ZA", name: "South Africa", dialCode: "27" },
  { iso2: "BR", name: "Brazil", dialCode: "55" },
  { iso2: "MX", name: "Mexico", dialCode: "52" },
  { iso2: "AR", name: "Argentina", dialCode: "54" },
  { iso2: "CL", name: "Chile", dialCode: "56" },
  { iso2: "CO", name: "Colombia", dialCode: "57" },
  { iso2: "EG", name: "Egypt", dialCode: "20" },
  { iso2: "NG", name: "Nigeria", dialCode: "234" },
  { iso2: "KE", name: "Kenya", dialCode: "254" },
  { iso2: "OTHER", name: "Other", dialCode: "" },
];

export const DEFAULT_PHONE_COUNTRY_ISO = "IN";

/**
 * Resolves country metadata by ISO code, falling back to India.
 *
 * @param iso2 - ISO 3166-1 alpha-2 code (or `OTHER`)
 * @returns Matching country entry
 */
export function getPhoneCountry(iso2: string): PhoneCountry {
  return (
    PHONE_COUNTRIES.find((country) => country.iso2 === iso2) ??
    PHONE_COUNTRIES.find(
      (country) => country.iso2 === DEFAULT_PHONE_COUNTRY_ISO,
    ) ??
    PHONE_COUNTRIES[0]
  );
}

/**
 * Strips non-digit characters from a national phone number.
 *
 * @param value - Raw user input
 * @returns Digits only
 */
export function sanitizeNationalNumber(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Builds an E.164-style phone string from country code and national digits.
 *
 * @param country - Selected country metadata
 * @param nationalDigits - Sanitized national number
 * @returns Full international number with leading `+`
 */
export function formatFullPhone(
  country: PhoneCountry,
  nationalDigits: string,
): string {
  if (country.iso2 === "OTHER") {
    return nationalDigits.startsWith("+")
      ? nationalDigits
      : `+${nationalDigits}`;
  }
  return `+${country.dialCode}${nationalDigits}`;
}

/**
 * Converts an ISO 3166-1 alpha-2 code to a flag emoji.
 *
 * @param iso2 - Two-letter country code (or `OTHER`)
 * @returns Flag emoji, or a globe for unknown/other
 */
export function isoToFlag(iso2: string): string {
  if (iso2 === "OTHER") return "🌐";
  const code = iso2.toUpperCase();
  if (code.length !== 2 || !/^[A-Z]{2}$/.test(code)) return "🌐";
  return String.fromCodePoint(
    ...[...code].map((char) => 0x1f1e6 - 65 + char.charCodeAt(0)),
  );
}

/**
 * Filters countries by name, dial code, or ISO code.
 *
 * @param countries - Full country list
 * @param query - User search string
 * @returns Matching countries
 */
export function filterPhoneCountries(
  countries: PhoneCountry[],
  query: string,
): PhoneCountry[] {
  const normalized = query.trim().toLowerCase().replace(/^\+/, "");
  if (!normalized) return countries;

  return countries.filter((country) => {
    if (country.iso2 === "OTHER") {
      return "other".includes(normalized);
    }
    return (
      country.name.toLowerCase().includes(normalized) ||
      country.dialCode.includes(normalized) ||
      country.iso2.toLowerCase().includes(normalized)
    );
  });
}

/**
 * Display label for the compact country trigger.
 *
 * @param country - Selected country
 * @returns Short dial-code label such as `+91`
 */
export function countryDialLabel(country: PhoneCountry): string {
  if (country.iso2 === "OTHER") return "Other";
  return `+${country.dialCode}`;
}
