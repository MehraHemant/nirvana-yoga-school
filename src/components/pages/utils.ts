export type PageSectionLayout = "default" | "timeline" | "split-media" | "faq";

export function sectionTone(index: number) {
  return index % 2 === 0 ? "bg-paper" : "bg-white";
}

export function layoutForSection(title: string): PageSectionLayout {
  if (/schedule|day-wise|itinerary/i.test(title)) return "timeline";
  if (/faq|frequently asked|q&a/i.test(title)) return "faq";
  if (/accommodation|food|venue|inclusions|overview/i.test(title)) {
    return "split-media";
  }
  return "default";
}

export function shouldSkipSection(title: string) {
  return /testimonial|what students say|enquiry form|sign up/i.test(title);
}
