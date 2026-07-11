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
import { Check, ChevronDown } from "@/icons";

export type SearchableSelectOption = {
  /** Stored value */
  value: string;
  /** Visible label (defaults to value) */
  label?: string;
  /** Optional secondary caption shown under the label */
  hint?: string;
};

export type SearchableSelectProps = {
  /** Field id — the input uses this id, listbox uses `${id}-listbox` */
  id: string;
  /** Current value */
  value: string;
  /** Called with the chosen or typed value */
  onChange: (value: string) => void;
  /** Preset options */
  options: SearchableSelectOption[];
  /** Placeholder for the input */
  placeholder?: string;
  /** Allow free-form values the user types (creatable) */
  allowCustom?: boolean;
  /** Marks the underlying input required */
  required?: boolean;
  /** Disables the control */
  disabled?: boolean;
  /** Extra classes on the wrapper */
  className?: string;
};

/**
 * Creatable searchable combobox — pick a preset option or type a custom value.
 *
 * @param props - Controlled value, option list, and change handler
 */
export default function SearchableSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Select or type…",
  allowCustom = false,
  required = false,
  disabled = false,
  className = "",
}: SearchableSelectProps) {
  const listboxId = `${id}-listbox`;
  const prefersReduced = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const instanceId = useId();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalizedQuery) return options;
    return options.filter((option) =>
      (option.label ?? option.value).toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery, options]);

  const exactMatch = useMemo(
    () =>
      options.some(
        (option) =>
          (option.label ?? option.value).toLowerCase() === normalizedQuery,
      ),
    [normalizedQuery, options],
  );

  const showCreate = allowCustom && query.trim().length > 0 && !exactMatch;
  const optionCount = filtered.length + (showCreate ? 1 : 0);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setHighlightIndex(0);
  }, []);

  const commitValue = useCallback(
    (next: string) => {
      onChange(next);
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
      requestAnimationFrame(() => inputRef.current?.focus());
      setHighlightIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (highlightIndex >= optionCount) {
      setHighlightIndex(Math.max(0, optionCount - 1));
    }
  }, [optionCount, highlightIndex]);

  const selectByIndex = (index: number) => {
    if (index < filtered.length) {
      commitValue(filtered[index].value);
      return;
    }
    if (showCreate) {
      commitValue(query.trim());
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      event.preventDefault();
      setOpen(true);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((index) =>
        Math.min(index + 1, Math.max(optionCount - 1, 0)),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      if (optionCount > 0) {
        event.preventDefault();
        selectByIndex(highlightIndex);
      } else if (allowCustom && query.trim()) {
        event.preventDefault();
        commitValue(query.trim());
      }
    }
  };

  const displayLabel =
    options.find((option) => option.value === value)?.label ?? value;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div
        className={`flex items-center rounded-2xl border bg-white transition-colors ${
          open
            ? "border-secondary ring-1 ring-secondary"
            : "border-secondary/15 hover:border-secondary/30"
        }`}
      >
        {/* Hidden mirror input keeps native required validation on the value */}
        {required && (
          <input
            aria-hidden="true"
            tabIndex={-1}
            required
            value={value}
            onChange={() => {}}
            className="pointer-events-none absolute h-0 w-0 opacity-0"
          />
        )}
        <input
          id={id}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          disabled={disabled}
          value={open ? query : displayLabel}
          placeholder={placeholder}
          onFocusCapture={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlightIndex(0);
            if (allowCustom) onChange(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 rounded-2xl bg-transparent px-4 py-3 font-sans text-sm text-ink placeholder-muted/65 focus:outline-none disabled:cursor-not-allowed"
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label={open ? "Close options" : "Open options"}
          onClick={() => (open ? close() : setOpen(true))}
          className="flex shrink-0 items-center px-3 text-muted"
        >
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key={`select-panel-${instanceId}`}
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: prefersReduced ? 0 : 0.18 }}
            className="absolute top-[calc(100%+0.35rem)] left-0 z-50 w-full overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft"
          >
            <ul
              id={listboxId}
              aria-label="Options"
              className="max-h-60 overflow-y-auto overscroll-contain py-1.5"
            >
              {filtered.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightIndex;

                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      onMouseEnter={() => setHighlightIndex(index)}
                      onClick={() => commitValue(option.value)}
                      className={`flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left font-sans transition-colors ${
                        isSelected
                          ? "bg-primary/8 text-ink"
                          : isHighlighted
                            ? "bg-surface text-ink"
                            : "text-ink/90 hover:bg-surface/80"
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">
                          {option.label ?? option.value}
                        </span>
                        {option.hint && (
                          <span className="block truncate text-xs text-muted">
                            {option.hint}
                          </span>
                        )}
                      </span>
                      {isSelected && (
                        <Check size={15} className="shrink-0 text-primary" />
                      )}
                    </button>
                  </li>
                );
              })}

              {showCreate && (
                <li>
                  <button
                    type="button"
                    onMouseEnter={() => setHighlightIndex(filtered.length)}
                    onClick={() => commitValue(query.trim())}
                    className={`flex w-full cursor-pointer items-center gap-2 px-3.5 py-2.5 text-left font-sans transition-colors ${
                      highlightIndex === filtered.length
                        ? "bg-surface text-ink"
                        : "text-ink/90 hover:bg-surface/80"
                    }`}
                  >
                    <span className="text-xs font-semibold text-primary">
                      Use
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      “{query.trim()}”
                    </span>
                  </button>
                </li>
              )}

              {filtered.length === 0 && !showCreate && (
                <li className="px-3.5 py-4 text-center font-sans text-xs text-muted">
                  No matches found
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
