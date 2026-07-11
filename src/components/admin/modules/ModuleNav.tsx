"use client";

const COMMON_ANCHORS = [
  { id: "#overview", label: "Overview", shortLabel: "Overview" },
  { id: "#inclusions", label: "Inclusions", shortLabel: "Include" },
  { id: "#eligibility", label: "Eligibility", shortLabel: "Eligible" },
  { id: "#syllabus", label: "Syllabus", shortLabel: "Syllabus" },
  { id: "#schedule", label: "Schedule", shortLabel: "Schedule" },
  { id: "#exam", label: "Exam", shortLabel: "Exam" },
  { id: "#accommodation", label: "Lodging", shortLabel: "Lodging" },
  { id: "#pricing", label: "Dates & Fees", shortLabel: "Dates" },
  { id: "#why-nirvana", label: "Why Nirvana", shortLabel: "Why" },
  { id: "#travel", label: "Travel", shortLabel: "Travel" },
  { id: "#faq", label: "FAQ", shortLabel: "FAQ" },
] as const;

type ModuleNavItem = {
  id: string;
  step: number;
  label: string;
  hint?: string;
};

type ModuleNavProps = {
  items: ModuleNavItem[];
  activeId: string;
  onJump: (id: string) => void;
};

/**
 * Sticky jump navigation for the module editor sidebar.
 *
 * @param props - Section list, active section, and scroll handler
 */
export function ModuleNav({ items, activeId, onJump }: ModuleNavProps) {
  return (
    <nav className="admin-module-nav" aria-label="Page sections">
      <p className="admin-module-nav-label">Jump to section</p>
      <ul className="admin-module-nav-list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`admin-module-nav-link ${activeId === item.id ? "admin-module-nav-link--active" : ""}`}
              onClick={() => onJump(item.id)}
            >
              <span className="admin-module-nav-step">{item.step}</span>
              <span>
                <span className="admin-module-nav-text">{item.label}</span>
                {item.hint ? (
                  <span className="admin-module-nav-hint">{item.hint}</span>
                ) : null}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export { COMMON_ANCHORS };
