"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/ui";
import { ArrowRight, Lotus } from "@/icons";
import AuthFields from "./AuthFields";

type AuthFormProps = {
  /** Which account form to render. */
  mode: "login" | "signup";
  /** Relative path to open after a successful submit. */
  nextPath: string;
};

const COPY = {
  login: {
    eyebrow: "Welcome back",
    title: "Log in to your account",
    body: "Pick up where you left off.",
    switchPrompt: "New to Nirvana?",
    switchLabel: "Create an account",
    switchPath: "/signup",
    image: "/images/yoga-auth-bg.jpg",
    imageAlt: "Yoga practice at sunrise above the Himalayan foothills",
    imageLine: "Return to your practice.",
  },
  signup: {
    eyebrow: "Begin your journey",
    title: "Create your account",
    body: "Take the yoga quiz, track your attempts, and manage your bookings in one place.",
    switchPrompt: "Already have an account?",
    switchLabel: "Log in",
    switchPath: "/login",
    image: "/images/yoga-auth-mandala.jpg",
    imageAlt: "Flower mandala lit by oil lamps",
    imageLine: "Every practice begins with a single breath.",
  },
} as const;

/**
 * Login or signup page: a quiet form on the left and a full-height photo on
 * the right from `lg` up.
 *
 * @param props - Form mode and post-auth redirect
 */
export default function AuthForm({ mode, nextPath }: AuthFormProps) {
  const router = useRouter();
  const copy = COPY[mode];
  const next = encodeURIComponent(nextPath);

  return (
    <div className="flex min-h-dvh bg-[#fffaf8] lg:p-3">
      <div className="relative flex flex-1 flex-col px-6 py-6 sm:px-10 lg:px-14 xl:px-20">
        <div
          className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/6 blur-3xl"
          aria-hidden="true"
        />

        <header className="relative flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 text-sm font-semibold tracking-wide text-ink"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition group-hover:bg-primary-dark">
              <Lotus size={18} />
            </span>
            Nirvana Yoga School
          </Link>
          <Link
            href="/"
            className="text-sm text-ink/50 transition hover:text-primary"
          >
            Back to site
          </Link>
        </header>

        <main className="relative mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <span className="type-eyebrow inline-flex items-center gap-2 text-primary">
            <span className="h-px w-6 bg-primary/50" aria-hidden="true" />
            {copy.eyebrow}
          </span>
          <Heading
            as="h1"
            size="none"
            className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-[2.125rem]"
          >
            {copy.title}
          </Heading>
          <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink/55">
            {copy.body}
          </p>

          <div className="mt-9">
            <AuthFields
              mode={mode}
              onSuccess={() => {
                router.push(nextPath);
                router.refresh();
              }}
            />
          </div>

          <p className="mt-8 text-center text-sm text-ink/55">
            {copy.switchPrompt}{" "}
            <Link
              href={`${copy.switchPath}?next=${next}`}
              className="group inline-flex items-center gap-1 font-semibold text-primary transition hover:text-primary-dark"
            >
              {copy.switchLabel}
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </p>
        </main>

        <p className="relative text-center text-xs leading-relaxed text-ink/40">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-2 transition hover:text-primary"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-2 transition hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      <aside className="relative hidden flex-[0_0_50%] overflow-hidden rounded-[1.75rem] lg:block">
        <Image
          src={copy.image}
          alt={copy.imageAlt}
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent"
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14">
          <p className="max-w-md text-balance text-3xl font-medium leading-tight tracking-tight text-white xl:text-4xl">
            {copy.imageLine}
          </p>
          <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-white/60">
            Nirvana Yoga School · Rishikesh
          </p>
        </div>
      </aside>
    </div>
  );
}
