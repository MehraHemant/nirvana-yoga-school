import type { ReactNode } from "react";

type AdminIconButtonProps = {
  /** Accessible label */
  label: string;
  /** Icon element */
  icon: ReactNode;
  /** Visual variant */
  variant?: "default" | "danger";
  /** Optional disabled state */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Button type */
  type?: "button" | "submit";
};

/**
 * Icon-only admin button for client-side row actions (e.g. inline edit).
 *
 * @param props - Label, icon, variant, and button behavior
 */
export function AdminIconButton({
  label,
  icon,
  variant = "default",
  disabled = false,
  onClick,
  type = "button",
}: AdminIconButtonProps) {
  return (
    <button
      type={type}
      className={`admin-icon-btn${variant === "danger" ? " admin-icon-btn--danger" : ""}`}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </button>
  );
}
