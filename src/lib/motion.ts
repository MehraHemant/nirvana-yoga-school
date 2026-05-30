import type { Transition, Variants } from "framer-motion";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const VIEWPORT_ONCE = { once: true, amount: 0.12 as const };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: EASE_OUT },
  }),
};

export const fadeUpSmall: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
};

export const starPop: Variants = {
  hidden: { opacity: 0, scale: 0.35, rotate: -12 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

export const cardHoverShadow =
  "0 4px 12px rgb(26 20 16 / 0.06), 0 28px 56px -20px rgb(163 36 50 / 0.22)";

export const cardRestShadow =
  "0 2px 8px -2px rgb(26 20 16 / 0.08), 0 12px 32px -8px rgb(26 20 16 / 0.12)";

export function reducedTransition(
  reduced: boolean,
  transition: Transition,
): Transition {
  return reduced ? { duration: 0 } : transition;
}
