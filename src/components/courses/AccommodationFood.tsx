import type { ResidentialLifeContent } from "@/content/types/shared-sections";
import Accommodation from "./Accommodation";
import Food from "./Food";

type AccommodationFoodProps = {
  /** Server-provided residential-life content */
  content?: ResidentialLifeContent | null;
};

/**
 * Shared lodging + food block for courses, retreats, venues, hubs, and kirtan.
 * Renders `#accommodation` and `#food` with the same CMS `residentialLife` shape.
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
