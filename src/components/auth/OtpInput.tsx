"use client";

import { useRef } from "react";

type OtpInputProps = {
  /** Current digits, at most `length` long. */
  value: string;
  /** Receives the digits after every change. */
  onChange: (value: string) => void;
  /** Runs once every box is filled. */
  onComplete?: (value: string) => void;
  /** Number of digit boxes. */
  length: number;
  /** Disables typing while a request is in flight. */
  disabled?: boolean;
  /** Red outline after a wrong code. */
  invalid?: boolean;
};

/**
 * One box per digit with auto-advance, backspace-to-previous, and paste.
 *
 * @param props - Digits, change handlers, and box count
 */
export default function OtpInput({
  value,
  onChange,
  onComplete,
  length,
  disabled = false,
  invalid = false,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? "");

  function commit(next: string, focusIndex: number) {
    const clean = next.replace(/\D/g, "").slice(0, length);
    onChange(clean);
    refs.current[Math.min(focusIndex, length - 1)]?.focus();
    if (clean.length === length) onComplete?.(clean);
  }

  return (
    <div className="flex justify-between gap-2 sm:gap-2.5">
      {digits.map((digit, index) => (
        <input
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length digit boxes
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          // biome-ignore lint/a11y/noAutofocus: the code step exists only to type the code
          autoFocus={index === 0}
          maxLength={length}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${length}`}
          value={digit}
          onFocus={(event) => event.currentTarget.select()}
          onChange={(event) => {
            const typed = event.target.value.replace(/\D/g, "");
            if (!typed) return;
            // Typing or autofill can deliver several digits into one box.
            const next = (value.slice(0, index) + typed).slice(0, length);
            commit(next, index + typed.length);
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace") {
              event.preventDefault();
              if (digit) {
                commit(value.slice(0, index) + value.slice(index + 1), index);
              } else if (index > 0) {
                commit(
                  value.slice(0, index - 1) + value.slice(index),
                  index - 1,
                );
              }
            } else if (event.key === "ArrowLeft" && index > 0) {
              refs.current[index - 1]?.focus();
            } else if (event.key === "ArrowRight" && index < length - 1) {
              refs.current[index + 1]?.focus();
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            const pasted = event.clipboardData
              .getData("text")
              .replace(/\D/g, "");
            if (pasted) commit(pasted, pasted.length);
          }}
          className={`h-14 w-full min-w-0 rounded-xl border bg-white text-center text-xl font-semibold tabular-nums text-ink transition focus:outline-none focus:ring-4 disabled:opacity-60 sm:h-[3.75rem] ${
            invalid
              ? "border-primary/60 focus:border-primary focus:ring-primary/20"
              : digit
                ? "border-primary/40 focus:border-primary focus:ring-primary/15"
                : "border-ink/12 focus:border-primary focus:ring-primary/15"
          }`}
        />
      ))}
    </div>
  );
}
