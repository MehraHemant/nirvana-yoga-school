"use client";

type SectionLiveFieldProps = {
  /** Current live flag (`undefined` / omitted means live) */
  value?: boolean;
  /** Called with the next live value */
  onChange: (live: boolean) => void;
  /** Stable input id */
  id?: string;
  /** Label when the section is live (default `"Live"`) */
  liveLabel?: string;
  /** Label when the section is hidden (default `"Hidden"`) */
  hiddenLabel?: string;
};

/**
 * Compact Live/Hidden toggle for admin section panel headers.
 * Place in `CollapsiblePanel` `actions` so it sits beside the section title.
 *
 * @param props - Current value, change handler, and optional labels
 */
export function SectionLiveField({
  value,
  onChange,
  id = "section-live",
  liveLabel = "Live",
  hiddenLabel = "Hidden",
}: SectionLiveFieldProps) {
  const isLive = value !== false;
  const statusLabel = isLive ? liveLabel : hiddenLabel;

  return (
    <label
      className={`admin-live-switch${isLive ? " admin-live-switch--on" : " admin-live-switch--off"}`}
      htmlFor={id}
      title={
        isLive
          ? "Section is visible on the site"
          : "Section is hidden on the site"
      }
    >
      <span className="admin-live-switch__label" aria-hidden="true">
        {statusLabel}
      </span>
      <span className="admin-live-switch__track">
        <span className="admin-live-switch__thumb" />
      </span>
      <input
        id={id}
        className="admin-live-switch__input"
        type="checkbox"
        role="switch"
        checked={isLive}
        aria-checked={isLive}
        aria-label={statusLabel}
        onChange={(event) => onChange(event.target.checked)}
        onClick={(event) => event.stopPropagation()}
      />
    </label>
  );
}
