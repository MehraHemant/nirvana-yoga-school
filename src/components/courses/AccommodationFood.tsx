import type { ResidentialLifeContent } from "@/content/types/shared-sections";
import Accommodation from "./Accommodation";
import Food from "./Food";

type AccommodationFoodProps = {
  /** Server-provided residential-life content */
  content?: ResidentialLifeContent | null;
};

/**
 * Renders accommodation and food as two separate stacked sections.
 * Prefer importing `Accommodation` and `Food` directly in new pages.
 *
 * @param props - Server-provided residential-life content
 */
export default function AccommodationFood({
  content = null,
}: AccommodationFoodProps = {}) {
  return (
    <>
      <Accommodation content={content} />
      <Food content={content} />
    </>
  );
}
