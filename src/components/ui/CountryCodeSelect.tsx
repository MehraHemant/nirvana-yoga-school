"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown } from "@/icons";
import {
  countryDialLabel,
  filterPhoneCountries,
  getPhoneCountry,
  isoToFlag,
  PHONE_COUNTRIES,
} from "@/lib/phone-countries";

export type CountryCodeSelectProps = {
  /** Field id — listbox uses `${id}-listbox` */
  id: string;
  /** Selected ISO country code */
  value: string;
  /** Called when the user picks a country */
  onChange: (iso2: string) => void;
  /** Disables the trigger */
  disabled?: boolean;
};

/**
 * Searchable country-code picker with flags, keyboard navigation, and click-outside close.
 *
 * @param props - Controlled ISO value and change handler
 */
export default function CountryCodeSelect({
  id,
  value,
  onChange,
  disabled = false,
}: CountryCodeSelectProps) {
  const listboxId = `${id}-listbox`;
  const searchId = `${id}-search`;
  const prefersReduced = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const instanceId = useId();

  const selected = getPhoneCountry(value);
  const filtered = useMemo(
    () => filterPhoneCountries(PHONE_COUNTRIES, query),
    [query],
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setHighlightIndex(0);
  }, []);

  const selectCountry = useCallback(
    (iso2: string) => {
      onChange(iso2);
      close();
    },
    [close, onChange],
  );

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [close, open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
      const selectedIndex = filtered.findIndex((c) => c.iso2 === value);
      setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [open, value, filtered]);

  useEffect(() => {
    if (highlightIndex >= filtered.length) {
      setHighlightIndex(Math.max(0, filtered.length - 1));
    }
  }, [filtered.length, highlightIndex]);

  const handleTriggerKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (disabled) return;

    if (
      event.key === "ArrowDown" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      setOpen(true);
    }
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((index) =>
        Math.min(index + 1, Math.max(filtered.length - 1, 0)),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Enter" && filtered[highlightIndex]) {
      event.preventDefault();
      selectCountry(filtered[highlightIndex].iso2);
    }
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={handleTriggerKeyDown}
        className="flex h-full min-h-12 w-[6.75rem] rounded-2xl cursor-pointer items-center gap-1.5 border-r border-ink/10 bg-surface px-2.5 py-3 font-sans text-sm text-ink transition-colors hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60 sm:w-[7.5rem] sm:px-3"
      >
        <span className="text-base leading-none" aria-hidden="true">
          {isoToFlag(selected.iso2)}
        </span>
        <span className="min-w-0 flex-1 truncate text-left font-semibold tabular-nums">
          {countryDialLabel(selected)}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key={`country-panel-${instanceId}`}
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: prefersReduced ? 0 : 0.18 }}
            className="absolute top-[calc(100%+0.35rem)] left-0 z-50 w-[min(18rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft"
          >
            <div className="border-b border-ink/8 bg-surface/80 p-2.5">
              <label htmlFor={searchId} className="sr-only">
                Search country
              </label>
              <input
                ref={searchRef}
                id={searchId}
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlightIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search country or code"
                className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2 font-sans text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>

            <ul
              id={listboxId}
              aria-label="Country codes"
              className="max-h-56 overflow-y-auto overscroll-contain py-1.5"
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-4 text-center font-sans text-xs text-muted">
                  No countries found
                </li>
              ) : (
                filtered.map((country, index) => {
                  const isSelected = country.iso2 === value;
                  const isHighlighted = index === highlightIndex;

                  return (
                    <li key={country.iso2} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setHighlightIndex(index)}
                        onClick={() => selectCountry(country.iso2)}
                        className={`flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-left font-sans transition-colors ${
                          isSelected
                            ? "bg-primary/8 text-ink"
                            : isHighlighted
                              ? "bg-surface text-ink"
                              : "text-ink/90 hover:bg-surface/80"
                        }`}
                      >
                        <span
                          className="w-6 shrink-0 text-center text-base leading-none"
                          aria-hidden="true"
                        >
                          {isoToFlag(country.iso2)}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm">
                          {country.name}
                        </span>
                        <span
                          className={`shrink-0 text-xs font-semibold tabular-nums ${
                            isSelected ? "text-primary" : "text-muted"
                          }`}
                        >
                          {country.iso2 === "OTHER"
                            ? "—"
                            : `+${country.dialCode}`}
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
