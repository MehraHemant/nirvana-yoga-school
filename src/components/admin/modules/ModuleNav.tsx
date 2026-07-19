"use client";

import {
  type AdminSectionJumpItem,
  AdminSectionJumpNav,
} from "@/components/admin/AdminSectionJumpNav";

const COMMON_ANCHORS = [
  { id: "#overview", label: "Overview", shortLabel: "Overview" },
  { id: "#inclusions", label: "Inclusions", shortLabel: "Include" },
  { id: "#eligibility", label: "Eligibility", shortLabel: "Eligible" },
  { id: "#syllabus", label: "Syllabus", shortLabel: "Syllabus" },
  { id: "#schedule", label: "Schedule", shortLabel: "Schedule" },
  { id: "#exam", label: "Exam", shortLabel: "Exam" },
  { id: "#accommodation", label: "Lodging", shortLabel: "Lodging" },
  { id: "#teachers", label: "Teachers", shortLabel: "Teachers" },
  { id: "#testimonials", label: "Reviews", shortLabel: "Reviews" },
  { id: "#pricing", label: "Dates & Fees", shortLabel: "Dates" },
  { id: "#why-nirvana", label: "Why Nirvana", shortLabel: "Why" },
  { id: "#travel", label: "Travel", shortLabel: "Travel" },
  { id: "#faq", label: "FAQ", shortLabel: "FAQ" },
] as const;

type ModuleNavItem = AdminSectionJumpItem & {
  step: number;
};

type ModuleNavProps = {
  items: ModuleNavItem[];
  activeId: string;
  onJump: (id: string) => void;
};

/**
 * Sticky jump navigation for the module editor sidebar.
 * Thin wrapper around {@link AdminSectionJumpNav}.
 *
 * @param props - Section list, active section, and scroll handler
 */
export function ModuleNav({ items, activeId, onJump }: ModuleNavProps) {
  return (
    <AdminSectionJumpNav items={items} activeId={activeId} onJump={onJump} />
  );
}

export { COMMON_ANCHORS };
