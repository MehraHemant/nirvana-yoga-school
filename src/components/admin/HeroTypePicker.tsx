"use client";

import type { HeroType } from "@/content/types";

const HERO_OPTIONS: {
  value: HeroType;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "bento-media",
    label: "Bento gallery",
    description: "Course page — image grid + videos",
    icon: "▦",
  },
  {
    value: "split-copy",
    label: "Split product",
    description: "Online course — copy left, preview right",
    icon: "◧",
  },
  {
    value: "simple-banner",
    label: "Simple banner",
    description: "One background image + headline",
    icon: "▬",
  },
  {
    value: "page-minimal",
    label: "Page minimal",
    description: "Site page — title, text, single image",
    icon: "▢",
  },
];

type HeroTypePickerProps = {
  value: HeroType;
  onChange: (type: HeroType) => void;
  /** When set, only these layout cards are offered */
  allowedTypes?: HeroType[];
};

/**
 * Visual card picker for hero layout types.
 *
 * @param props - Current type and change handler
 */
export function HeroTypePicker({
  value,
  onChange,
  allowedTypes,
}: HeroTypePickerProps) {
  const options = allowedTypes?.length
    ? HERO_OPTIONS.filter((option) => allowedTypes.includes(option.value))
    : HERO_OPTIONS;

  if (options.length <= 1) return null;

  return (
    <div className="admin-field">
      <span className="admin-label">Hero layout</span>
      <p className="admin-hint admin-hint--tight">
        Pick the layout — only relevant fields will show below.
      </p>
      <div className="admin-hero-type-grid">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className={`admin-hero-type-card ${active ? "admin-hero-type-card--active" : ""}`}
              onClick={() => onChange(option.value)}
              aria-pressed={active}
            >
              <span className="admin-hero-type-icon" aria-hidden="true">
                {option.icon}
              </span>
              <span className="admin-hero-type-label">{option.label}</span>
              <span className="admin-hero-type-desc">{option.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
