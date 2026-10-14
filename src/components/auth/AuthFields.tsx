"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui";
import { ChevronLeft, Eye, EyeOff } from "@/icons";
import OtpInput from "./OtpInput";

export type AuthMode = "login" | "signup";

type AuthFieldsProps = {
  /** Which account form to render. */
  mode: AuthMode;
  /** Runs after the session cookie is set. */
  onSuccess: () => void;
  /** Submit label override, e.g. "Sign up & start quiz". */
  submitLabel?: string;
};

/** Digits in the emailed signup code; matches the server. */
const CODE_LENGTH = 6;

/**
 * Posts account credentials and stores the session cookie from the response.
 *
 * @param path - Auth API path
 * @param body - JSON payload
 */
async function postAuth<T = Record<string, unknown>>(
  path: string,
  body: Record<string, string>,
): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }
  return data;
}

const LABEL_CLASS = "mb-2 block text-[0.8125rem] font-medium text-ink/75";

const INPUT_CLASS =
  "block h-12 w-full rounded-xl border border-ink/12 bg-white px-4 text-[0.9375rem] text-ink shadow-[0_1px_2px_rgb(0_0_0/0.03)] transition placeholder:text-ink/30 hover:border-ink/20 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10";

const ERROR_CLASS =
  "rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-primary";

/**
 * Login or signup fields shared by the auth pages and the quiz modal.
 *
 * @param props - Form mode, success handler, and optional submit label
 */
export default function AuthFields({
  mode,
  onSuccess,
  submitLabel,
}: AuthFieldsProps) {
  const fieldId = useId();
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  /** Normalized email the code was sent to; set once step one succeeds. */
  const [codeEmail, setCodeEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(
      () => setResendIn((left) => left - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignup) {
        const data = await postAuth<{ email: string; resendIn: number }>(
          "/api/auth/signup",
          { name, email, password },
        );
        setCodeEmail(data.email);
        setResendIn(data.resendIn);
        setCode("");
        setNotice("");
        setLoading(false);
        return;
      }
      await postAuth("/api/auth/login", { email, password });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  async function verify(digits: string) {
    if (!codeEmail || digits.length !== CODE_LENGTH || loading) return;
    setLoading(true);
    setError("");
    try {
      await postAuth("/api/auth/signup/verify", {
        email: codeEmail,
        code: digits,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setCode("");
      setLoading(false);
    }
  }

  async function resend() {
    if (!codeEmail || resendIn > 0) return;
    setError("");
    setNotice("");
    try {
      const data = await postAuth<{ resendIn: number }>(
        "/api/auth/signup/resend",
        { email: codeEmail },
      );
      setResendIn(data.resendIn);
      setCode("");
      setNotice("A new code is on its way.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const idleLabel = submitLabel ?? (isSignup ? "Continue" : "Log in");

  if (isSignup && codeEmail) {
    return (
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void verify(code);
        }}
      >
        <div>
          <p className="text-base font-semibold text-ink">Check your inbox</p>
          <p className="mt-1 text-sm leading-relaxed text-ink/60">
            We sent a {CODE_LENGTH}-digit code to{" "}
            <span className="font-medium text-ink">{codeEmail}</span>. It
            expires in 10 minutes.
          </p>
        </div>
        <OtpInput
          value={code}
          onChange={(next) => {
            setCode(next);
            if (error) setError("");
          }}
          onComplete={verify}
          length={CODE_LENGTH}
          disabled={loading}
          invalid={Boolean(error)}
        />
        {error ? (
          <p className={ERROR_CLASS} role="alert">
            {error}
          </p>
        ) : notice ? (
          <output className="block text-sm text-ink/60">{notice}</output>
        ) : null}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full shadow-lg shadow-primary/20"
          disabled={loading || code.length !== CODE_LENGTH}
        >
          {loading ? "Verifying…" : "Verify & create account"}
        </Button>
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => {
              setCodeEmail(null);
              setError("");
              setNotice("");
            }}
            className="inline-flex items-center gap-1 text-ink/60 transition hover:text-ink"
          >
            <ChevronLeft size={14} />
            Change email
          </button>
          <button
            type="button"
            onClick={resend}
            disabled={resendIn > 0}
            className="font-medium text-primary transition hover:text-primary-dark disabled:font-normal disabled:text-ink/45"
          >
            {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      {isSignup ? (
        <div>
          <label className={LABEL_CLASS} htmlFor={`${fieldId}-name`}>
            Full name
          </label>
          <input
            id={`${fieldId}-name`}
            className={INPUT_CLASS}
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
      ) : null}
      <div>
        <label className={LABEL_CLASS} htmlFor={`${fieldId}-email`}>
          Email
        </label>
        <input
          id={`${fieldId}-email`}
          className={INPUT_CLASS}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div>
        <label className={LABEL_CLASS} htmlFor={`${fieldId}-password`}>
          Password
        </label>
        <div className="relative">
          <input
            id={`${fieldId}-password`}
            className={`${INPUT_CLASS} pr-12`}
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder={isSignup ? "At least 8 characters" : "Your password"}
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((shown) => !shown)}
            className="absolute inset-y-0 right-1.5 my-auto flex h-9 w-9 items-center justify-center rounded-full text-ink/45 transition hover:bg-ink/5 hover:text-ink"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      {error ? (
        <p className={ERROR_CLASS} role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="mt-1 h-12 w-full text-[0.9375rem] shadow-lg shadow-primary/20"
        disabled={loading}
      >
        {loading ? (isSignup ? "Creating account…" : "Logging in…") : idleLabel}
      </Button>
    </form>
  );
}
