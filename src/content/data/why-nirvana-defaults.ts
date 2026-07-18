import {
  WHY_NIRVANA_BANNER,
  WHY_NIRVANA_CLOSING,
  WHY_NIRVANA_HIGHLIGHTS,
} from "@/data/whyNirvana";
import type { WhyNirvanaContent } from "@/content/types/shared-sections";

/**
 * Default Why Nirvana shared document for seed / admin ensure.
 */
export function createDefaultWhyNirvana(): WhyNirvanaContent {
  return {
    live: true,
    highlights: WHY_NIRVANA_HIGHLIGHTS.map((item) => ({ ...item })),
    closing: WHY_NIRVANA_CLOSING,
    banner: WHY_NIRVANA_BANNER,
  };
}
