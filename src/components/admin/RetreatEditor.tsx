"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { AdminSectionJumpNav } from "@/components/admin/AdminSectionJumpNav";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { ImageField } from "@/components/admin/ImageField";
import { ListRowActions } from "@/components/admin/ListRowActions";
import { NestedItemCard } from "@/components/admin/NestedItemCard";
import { ResidentialLifeFields } from "@/components/admin/LodgingFields";
import { FaqModuleEditor } from "@/components/admin/modules/FaqModuleEditor";
import { HeroModuleEditor } from "@/components/admin/modules/HeroModuleEditor";
import { InclusionsModuleEditor } from "@/components/admin/modules/InclusionsModuleEditor";
import { ModuleFlagsPanel } from "@/components/admin/modules/ModuleFlagsPanel";
import { OverviewModuleEditor } from "@/components/admin/modules/OverviewModuleEditor";
import { StickyNavModuleEditor } from "@/components/admin/modules/StickyNavModuleEditor";
import { PageSeoFields } from "@/components/admin/PageSeoFields";
import { SharedSectionLinks } from "@/components/admin/SharedSectionLinks";
import { StringListField } from "@/components/admin/StringListField";
import {
  scrollToSection,
  toSectionDomId,
} from "@/components/admin/sectionDomId";
import { TextField } from "@/components/admin/TextField";
import { useAdminSectionAccordion } from "@/components/admin/useAdminSectionAccordion";
import { useSectionScrollSpy } from "@/components/admin/useSectionScrollSpy";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import { roomDisplayTitle } from "@/content/lodging/room-catalog";
import {
  roomFeesFromLinkedItems,
  upsertRetreatPackageForRoom,
} from "@/content/mappers/page-room-fees";
import { createEmptyPageModules } from "@/content/page-modules-defaults";
import type { PageModulesDocument, RetreatDocument } from "@/content/types";
import type { RetreatScheduleActivityKind } from "@/content/types/retreat-page";
import { normalizeFaqCategory } from "@/content/types/faq-categories";
import type { RoomRecord } from "@/content/types/shared-sections";
import { sharedSectionLinksForLayout } from "@/lib/cms/page-layout-registry";
import { createEmptyResidentialLife } from "@/lib/cms/structural-defaults";
import { parseApiJson } from "@/lib/types/api";

type RetreatEditorProps = {
  /** Retreat product document */
  initialRetreat: RetreatDocument;
  /** Page modules (hero, overview, pricing copy, lodging, FAQ, …) */
  initialModules: PageModulesDocument | null;
  slug: string;
  backHref?: string;
  backLabel?: string;
  onSave: (payload: {
    retreat: RetreatDocument;
    modules: PageModulesDocument;
  }) => Promise<void>;
};

const RETREAT_JUMP_SECTIONS = [
  { slug: "meta", label: "Page metadata" },
  { slug: "hero", label: "Hero" },
  { slug: "highlights", label: "Highlights" },
  { slug: "sticky-nav", label: "Sticky nav" },
  { slug: "overview", label: "Overview" },
  { slug: "inclusions", label: "Inclusions" },
  { slug: "schedule", label: "Day schedule" },
  { slug: "flags", label: "Shared live" },
  { slug: "accommodation", label: "Lodging & food" },
  { slug: "packages", label: "Packages & dates" },
  { slug: "testimonials", label: "Testimonials" },
  { slug: "faq", label: "FAQ" },
] as const;

const RETREAT_ACTIVITY_KINDS: RetreatScheduleActivityKind[] = [
  "wake",
  "meditation",
  "yoga",
  "meal",
  "workshop",
  "rest",
  "healing",
  "community",
  "sleep",
  "excursion",
];

const RETREAT_PANEL_KEYS = RETREAT_JUMP_SECTIONS.map((section) => section.slug);

/**
 * True when overview presentation fields are unset (legacy product-only pages).
 *
 * @param overview - Overview module from page_modules
 */
function isOverviewEmpty(overview: PageModulesDocument["overview"]): boolean {
  return (
    !overview.eyebrow?.trim() &&
    !overview.title?.trim() &&
    !overview.lead?.trim() &&
    !overview.supportingCopy?.trim() &&
    overview.glance.length === 0 &&
    overview.media.items.length === 0
  );
}

/**
 * Seeds empty overview / inclusions module fields from the retreat product.
 *
 * @param modules - Modules document (possibly scaffolded)
 * @param retreat - Retreat product used as fallback source
 */
function withProductModuleFallbacks(
  modules: PageModulesDocument,
  retreat: RetreatDocument,
): PageModulesDocument {
  let next = modules;

  if (isOverviewEmpty(next.overview)) {
    next = {
      ...next,
      overview: {
        ...next.overview,
        eyebrow: retreat.eyebrow ?? "",
        title: retreat.title,
        lead: retreat.overview,
        supportingCopy: next.overview.supportingCopy ?? "",
        glance: retreat.duration
          ? [{ label: "Duration", value: retreat.duration }]
          : [],
        media: {
          mode: "carousel",
          items: (retreat.overviewImages ?? []).map((url) => ({
            type: "image" as const,
            url,
            alt: "",
          })),
        },
      },
    };
  }

  if (!next.inclusions.items.length && retreat.inclusions.length) {
    next = {
      ...next,
      inclusions: { ...next.inclusions, items: [...retreat.inclusions] },
    };
  }

  return next;
}

/**
 * Builds the modules document when a legacy retreat lacks persisted modules.
 * Seeds overview, inclusions, and FAQ items from the retreat product when empty.
 *
 * @param initialModules - Persisted modules, when available
 * @param retreat - Retreat document used to scaffold the hero / FAQs
 */
function retreatModules(
  initialModules: PageModulesDocument | null,
  retreat: RetreatDocument,
): PageModulesDocument {
  const base = initialModules?.hero
    ? initialModules
    : (() => {
        const scaffold = createEmptyPageModules("page-minimal");
        scaffold.hero = {
          type: "page-minimal",
          title: retreat.title,
          subtitle: retreat.description,
          heroImage: retreat.heroImage,
          ctaLabel: retreat.ctaLabel,
          ctaHref: retreat.ctaHref,
        };
        return scaffold;
      })();

  const withFallbacks = withProductModuleFallbacks(base, retreat);

  if (withFallbacks.faqs?.items?.length || !retreat.faqs?.length) {
    return withFallbacks;
  }

  return {
    ...withFallbacks,
    faqs: {
      ...withFallbacks.faqs,
      items: retreat.faqs.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
      })),
    },
  };
}

/**
 * Retreat product editor aligned to live sections — highlights, day schedule,
 * packages, and per-page lodging/food (no syllabus).
 *
 * @param props - Retreat document, modules, and save handler
 */
export function RetreatEditor({
  initialRetreat,
  initialModules,
  slug,
  backHref = "/admin/sections/retreats",
  backLabel = "Retreats",
  onSave,
}: RetreatEditorProps) {
  const [retreat, setRetreat] = useState(initialRetreat);
  const [modules, setModules] = useState<PageModulesDocument>(() =>
    retreatModules(initialModules, initialRetreat),
  );
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify({
      retreat: initialRetreat,
      modules: retreatModules(initialModules, initialRetreat),
    }),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const dirty = useMemo(
    () => JSON.stringify({ retreat, modules }) !== baseline,
    [retreat, modules, baseline],
  );

  const highlightKeys = useStableListKeys(retreat.highlights.length);
  const dayKeys = useStableListKeys(retreat.schedule.length);
  const dateKeys = useStableListKeys(
    Math.max(retreat.dates.length, modules.pricing.batches?.length ?? 0),
  );
  const testimonialKeys = useStableListKeys(
    modules.testimonials?.items?.length ?? 0,
  );
  const [catalogRooms, setCatalogRooms] = useState<RoomRecord[]>([]);
  const { openOnly, panelOpenProps } =
    useAdminSectionAccordion(RETREAT_PANEL_KEYS);
  useEffect(() => {
    const nextModules = retreatModules(initialModules, initialRetreat);
    setRetreat(initialRetreat);
    setModules(nextModules);
    setBaseline(
      JSON.stringify({ retreat: initialRetreat, modules: nextModules }),
    );
    setSaved(false);
    setError("");
  }, [initialRetreat, initialModules]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/rooms?catalog=retreat")
      .then((res) => parseApiJson<{ rooms: RoomRecord[] }>(res))
      .then((body) => {
        if (!cancelled) setCatalogRooms(body.rooms ?? []);
      })
      .catch(() => {
        if (!cancelled) setCatalogRooms([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const packageByRoomId = useMemo(() => {
    const map = new Map(
      retreat.packages
        .filter((pkg) => pkg.roomId)
        .map((pkg) => [pkg.roomId ?? "", pkg]),
    );
    return map;
  }, [retreat.packages]);

  // Admin packages list: all Shared Live rooms (ignores per-page lodging Live).
  const packageOfferSummary = useMemo(() => {
    const sharedLive = catalogRooms.filter((room) => room.live);
    if (sharedLive.length > 0 || catalogRooms.length > 0) {
      return sharedLive.map((room) => {
        const pkg = packageByRoomId.get(room.id);
        return {
          roomId: room.id,
          name: pkg?.title || roomDisplayTitle(room),
          price: pkg?.price || "",
          originalPrice: pkg?.originalPrice || "",
        };
      });
    }
    return retreat.packages
      .filter((pkg) => Boolean(pkg.roomId))
      .map((pkg) => ({
        roomId: pkg.roomId ?? pkg.title,
        name: pkg.title || "Package",
        price: pkg.price || "",
        originalPrice: pkg.originalPrice || "",
      }));
  }, [catalogRooms, packageByRoomId, retreat.packages]);

  const jumpItems = useMemo(
    () =>
      RETREAT_JUMP_SECTIONS.map((section, index) => ({
        ...section,
        step: index + 1,
        id: toSectionDomId(
          section.slug,
          section.slug === "meta"
            ? modules.meta
            : section.slug === "hero"
              ? modules.hero
              : section.slug === "sticky-nav"
                ? modules.stickyNav
                : section.slug === "overview"
                  ? modules.overview
                  : section.slug === "inclusions"
                    ? modules.inclusions
                    : section.slug === "packages"
                      ? modules.pricing
                      : undefined,
        ),
      })),
    [modules],
  );
  const activeSectionId = useSectionScrollSpy(jumpItems.map((item) => item.id));

  /** Resolves the current DOM id for a retreat editor panel. */
  function panelId(
    slug: (typeof RETREAT_JUMP_SECTIONS)[number]["slug"],
  ): string {
    return (
      jumpItems.find((item) => item.slug === slug)?.id ?? toSectionDomId(slug)
    );
  }

  /**
   * Jump nav: open only the target section, collapse the rest, then scroll.
   *
   * @param domId - Target panel DOM id
   */
  function jumpTo(domId: string) {
    const item = jumpItems.find((entry) => entry.id === domId);
    if (item) openOnly(item.slug);
    requestAnimationFrame(() => scrollToSection(domId));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      // Persist the course-compatible shape; drop legacy retreat lodging key.
      const { retreatAccommodation: _legacy, ...modulesToSave } = modules;
      void _legacy;
      const faqItems = modulesToSave.faqs?.items ?? [];
      const retreatToSave = {
        ...retreat,
        // Keep product fallbacks aligned with modules the live page prefers.
        eyebrow: modulesToSave.overview.eyebrow || retreat.eyebrow,
        overview: modulesToSave.overview.lead || retreat.overview,
        overviewImages: modulesToSave.overview.media.items
          .filter((item) => item.type === "image" && item.url.trim())
          .map((item) => item.url),
        inclusions: modulesToSave.inclusions.items,
        faqs: faqItems.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
          category: normalizeFaqCategory(faq.category),
        })),
      };
      await onSave({ retreat: retreatToSave, modules: modulesToSave });
      setRetreat(retreatToSave);
      setModules(modulesToSave);
      setBaseline(
        JSON.stringify({ retreat: retreatToSave, modules: modulesToSave }),
      );
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <div>
          <Link href={backHref} className="admin-back-link">
            ← {backLabel}
          </Link>
          <h1 className="admin-title">{retreat.title}</h1>
          <p className="admin-subtitle">
            Retreat layout — overview/pricing presentation via page modules; day
            schedule, packages, lodging (no syllabus).
          </p>
        </div>
        <a
          href={`/retreat/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn-sm"
        >
          Preview
        </a>
      </div>

      <div className="admin-editor-layout">
        <AdminSectionJumpNav
          items={jumpItems}
          activeId={activeSectionId}
          onJump={jumpTo}
        />

        <div className="admin-editor-sections">
          <div className="admin-section-shell">
            <CollapsiblePanel
              id={panelId("meta")}
              step={1}
              title="Page metadata"
              subtitle="SEO title, description, OG image — overrides site defaults when set"
              {...panelOpenProps("meta")}
            >
              <TextField
                label="Listing title"
                value={retreat.title}
                onChange={(title) => setRetreat({ ...retreat, title })}
                hint="Admin lists, booking links, and fallbacks when overview/hero titles are empty."
              />
              <TextField
                label="Listing description"
                value={retreat.description}
                onChange={(description) =>
                  setRetreat({ ...retreat, description })
                }
                multiline
                hint="Short summary used as a fallback when the hero subtitle is empty."
              />
              <PageSeoFields
                value={modules.meta}
                onChange={(meta) => setModules({ ...modules, meta })}
              />
            </CollapsiblePanel>
          </div>

          <div className="admin-section-shell">
            <HeroModuleEditor
              hero={modules.hero}
              onChange={(hero) => setModules({ ...modules, hero })}
              layoutId="retreat"
              panelId={panelId("hero")}
              step={2}
              {...panelOpenProps("hero")}
            />
          </div>

          <div className="admin-section-shell">
            <CollapsiblePanel
              id={panelId("highlights")}
              step={3}
              title="Highlights"
              {...panelOpenProps("highlights")}
            >
              {retreat.highlights.map((item, index) => (
                <div
                  key={highlightKeys.keys[index]}
                  className="admin-nested-card"
                >
                  <TextField
                    label="Title"
                    value={item.title}
                    onChange={(title) => {
                      const highlights = [...retreat.highlights];
                      highlights[index] = { ...item, title };
                      setRetreat({ ...retreat, highlights });
                    }}
                  />
                  <TextField
                    label="Description"
                    value={item.description}
                    onChange={(description) => {
                      const highlights = [...retreat.highlights];
                      highlights[index] = { ...item, description };
                      setRetreat({ ...retreat, highlights });
                    }}
                    multiline
                  />
                  <ImageField
                    label="Image"
                    value={item.image}
                    onChange={(image) => {
                      const highlights = [...retreat.highlights];
                      highlights[index] = { ...item, image };
                      setRetreat({ ...retreat, highlights });
                    }}
                  />
                </div>
              ))}
            </CollapsiblePanel>
          </div>

          <div className="admin-section-shell">
            <StickyNavModuleEditor
              items={modules.stickyNav.items}
              sectionId={modules.stickyNav._id}
              onSectionIdChange={(_id) =>
                setModules({
                  ...modules,
                  stickyNav: { ...modules.stickyNav, _id },
                })
              }
              onChange={(items) =>
                setModules({
                  ...modules,
                  stickyNav: { ...modules.stickyNav, items },
                })
              }
              panelId={panelId("sticky-nav")}
              step={4}
              {...panelOpenProps("sticky-nav")}
            />
          </div>

          <div className="admin-section-shell">
            <OverviewModuleEditor
              overview={modules.overview}
              onChange={(overview) => setModules({ ...modules, overview })}
              panelId={panelId("overview")}
              step={5}
              description="Live overview section — eyebrow, title, lead, supporting copy, glance stats, and media."
              {...panelOpenProps("overview")}
            />
          </div>

          <div className="admin-section-shell">
            <InclusionsModuleEditor
              inclusions={modules.inclusions}
              onChange={(inclusions) => setModules({ ...modules, inclusions })}
              panelId={panelId("inclusions")}
              step={6}
              description="What is included on the public retreat page."
              {...panelOpenProps("inclusions")}
            />
          </div>

          <div className="admin-section-shell">
            <CollapsiblePanel
              id={panelId("schedule")}
              step={7}
              title="Day schedule"
              subtitle="Section copy in modules; days stored on the retreat product"
              {...panelOpenProps("schedule")}
            >
              <TextField
                label="Section eyebrow"
                value={modules.schedule.eyebrow ?? ""}
                onChange={(eyebrow) =>
                  setModules({
                    ...modules,
                    schedule: { ...modules.schedule, eyebrow },
                  })
                }
              />
              <TextField
                label="Section title"
                value={modules.schedule.title ?? ""}
                onChange={(title) =>
                  setModules({
                    ...modules,
                    schedule: { ...modules.schedule, title },
                  })
                }
              />
              <TextField
                label="Section description"
                value={modules.schedule.description}
                onChange={(description) =>
                  setModules({
                    ...modules,
                    schedule: { ...modules.schedule, description },
                  })
                }
                multiline
              />
              <div className="admin-field-header">
                <span className="admin-label">Retreat days</span>
                <button
                  type="button"
                  className="admin-btn-sm"
                  onClick={() => {
                    dayKeys.addKey();
                    const nextDay =
                      retreat.schedule.reduce(
                        (max, d) => Math.max(max, d.day),
                        0,
                      ) + 1;
                    setRetreat({
                      ...retreat,
                      schedule: [
                        ...retreat.schedule,
                        { day: nextDay, title: "", activities: [] },
                      ],
                    });
                  }}
                >
                  Add day
                </button>
              </div>
              {retreat.schedule.map((day, index) => (
                <NestedItemCard
                  key={dayKeys.keys[index]}
                  title={day.title.trim() || `Day ${day.day}`}
                  index={index}
                  onRemove={() => {
                    dayKeys.removeKey(index);
                    setRetreat({
                      ...retreat,
                      schedule: retreat.schedule.filter((_, i) => i !== index),
                    });
                  }}
                >
                  <TextField
                    label={`Day ${day.day} title`}
                    value={day.title}
                    onChange={(title) => {
                      const schedule = [...retreat.schedule];
                      schedule[index] = { ...day, title };
                      setRetreat({ ...retreat, schedule });
                    }}
                  />
                  <TextField
                    label="Note"
                    value={day.note ?? ""}
                    onChange={(note) => {
                      const schedule = [...retreat.schedule];
                      schedule[index] = { ...day, note };
                      setRetreat({ ...retreat, schedule });
                    }}
                  />
                  {day.activities.map((activity, activityIndex) => (
                    <div key={`${dayKeys.keys[index]}-act-${activityIndex}`}>
                      <div className="admin-field-header">
                        <span className="admin-label">
                          Activity {activityIndex + 1}
                        </span>
                        <ListRowActions
                          onRemove={() => {
                            const schedule = [...retreat.schedule];
                            schedule[index] = {
                              ...day,
                              activities: day.activities.filter(
                                (_, i) => i !== activityIndex,
                              ),
                            };
                            setRetreat({ ...retreat, schedule });
                          }}
                        />
                      </div>
                      <div className="admin-grid-2">
                      <TextField
                        label="Time"
                        value={activity.time}
                        onChange={(time) => {
                          const activities = [...day.activities];
                          activities[activityIndex] = { ...activity, time };
                          const schedule = [...retreat.schedule];
                          schedule[index] = { ...day, activities };
                          setRetreat({ ...retreat, schedule });
                        }}
                      />
                      <TextField
                        label="Activity"
                        value={activity.activity}
                        onChange={(activityLabel) => {
                          const activities = [...day.activities];
                          activities[activityIndex] = {
                            ...activity,
                            activity: activityLabel,
                          };
                          const schedule = [...retreat.schedule];
                          schedule[index] = { ...day, activities };
                          setRetreat({ ...retreat, schedule });
                        }}
                      />
                      <TextField
                        label="Detail"
                        value={activity.detail ?? ""}
                        onChange={(detail) => {
                          const activities = [...day.activities];
                          activities[activityIndex] = { ...activity, detail };
                          const schedule = [...retreat.schedule];
                          schedule[index] = { ...day, activities };
                          setRetreat({ ...retreat, schedule });
                        }}
                        multiline
                      />
                      <label className="admin-field">
                        <span className="admin-label">Kind</span>
                        <select
                          className="admin-input"
                          value={activity.kind ?? "rest"}
                          onChange={(event) => {
                            const kind = event.target
                              .value as RetreatScheduleActivityKind;
                            const activities = [...day.activities];
                            activities[activityIndex] = { ...activity, kind };
                            const schedule = [...retreat.schedule];
                            schedule[index] = { ...day, activities };
                            setRetreat({ ...retreat, schedule });
                          }}
                        >
                          {RETREAT_ACTIVITY_KINDS.map((kind) => (
                            <option key={kind} value={kind}>
                              {kind}
                            </option>
                          ))}
                        </select>
                      </label>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="admin-btn-sm"
                    onClick={() => {
                      const schedule = [...retreat.schedule];
                      schedule[index] = {
                        ...day,
                        activities: [
                          ...day.activities,
                          { time: "", activity: "", kind: "rest" },
                        ],
                      };
                      setRetreat({ ...retreat, schedule });
                    }}
                  >
                    Add activity
                  </button>
                </NestedItemCard>
              ))}
            </CollapsiblePanel>
          </div>

          <div className="admin-section-shell">
            <ModuleFlagsPanel
              flags={modules.flags}
              onChange={(flags) => setModules({ ...modules, flags })}
              panelId={panelId("flags")}
              step={8}
              {...panelOpenProps("flags")}
            />
          </div>

          <div className="admin-section-shell">
            <SharedSectionLinks
              links={sharedSectionLinksForLayout("retreat")}
            />
          </div>

          <div className="admin-section-shell">
            <CollapsiblePanel
              id={panelId("accommodation")}
              step={9}
              title="Lodging & food"
              subtitle="Per-room Live and prices"
              description="Lists shared Retreat accommodation rooms. Toggle Live and set prices here — source of truth for room fees. Override section eyebrow, title, and stay copy below (blank fields use shared Retreat accommodation). Edit room photos/names under Shared sections."
              {...panelOpenProps("accommodation")}
            >
              <ResidentialLifeFields
                catalog="retreat"
                pageSlug={slug}
                doc={modules.residentialLife ?? createEmptyResidentialLife()}
                onChange={(residentialLife) =>
                  setModules({ ...modules, residentialLife })
                }
                roomFees={roomFeesFromLinkedItems(retreat.packages)}
                onRoomFeeChange={(room, fee) =>
                  setRetreat({
                    ...retreat,
                    packages: upsertRetreatPackageForRoom(
                      retreat.packages,
                      room,
                      fee,
                    ),
                  })
                }
              />
            </CollapsiblePanel>
          </div>

          <div className="admin-section-shell">
            <CollapsiblePanel
              id={panelId("packages")}
              step={10}
              title="Packages & dates"
              subtitle="Dates only — room fees come from Lodging"
              {...panelOpenProps("packages")}
            >
              <TextField
                label="Section eyebrow"
                value={modules.pricing.eyebrow ?? ""}
                onChange={(eyebrow) =>
                  setModules({
                    ...modules,
                    pricing: { ...modules.pricing, eyebrow },
                  })
                }
              />
              <TextField
                label="Section title"
                value={modules.pricing.title ?? ""}
                onChange={(title) =>
                  setModules({
                    ...modules,
                    pricing: { ...modules.pricing, title },
                  })
                }
              />
              <TextField
                label="Pricing description"
                value={modules.pricing.description}
                onChange={(description) =>
                  setModules({
                    ...modules,
                    pricing: { ...modules.pricing, description },
                  })
                }
                multiline
                hint="Shown on the sticky offer card (promo note) and Dates & Fees section intro."
              />
              <TextField
                label="Sticky promo headline"
                value={modules.pricing.promoHeadline ?? ""}
                onChange={(promoHeadline) =>
                  setModules({
                    ...modules,
                    pricing: { ...modules.pricing, promoHeadline },
                  })
                }
                placeholder="25% OFF"
                hint="Primary banner on the sticky sidebar offer (defaults to 25% OFF)."
              />
              <TextField
                label="Sticky promo subhead"
                value={modules.pricing.promoSubhead ?? ""}
                onChange={(promoSubhead) =>
                  setModules({
                    ...modules,
                    pricing: { ...modules.pricing, promoSubhead },
                  })
                }
                placeholder="Limited time offer"
              />
              <TextField
                label="Duration label"
                value={modules.pricing.duration ?? ""}
                onChange={(duration) =>
                  setModules({
                    ...modules,
                    pricing: { ...modules.pricing, duration },
                  })
                }
              />
              <TextField
                label="Starting fee (offer card)"
                value={modules.pricing.startingFee ?? ""}
                onChange={(startingFee) =>
                  setModules({
                    ...modules,
                    pricing: { ...modules.pricing, startingFee },
                  })
                }
                placeholder="$749"
                hint="Fallback price on the sticky card before a package is selected."
              />
              <StringListField
                label="Offer card bullets"
                items={modules.pricing.offerBullets ?? []}
                onChange={(offerBullets) =>
                  setModules({
                    ...modules,
                    pricing: { ...modules.pricing, offerBullets },
                  })
                }
                addLabel="Add bullet"
              />
              <p className="admin-hint">
                Lists all rooms marked Live in Shared retreat accommodation.
                Per-page lodging Live only affects the public accommodation
                gallery. Edit prices under Lodging &amp; food; manage upcoming
                dates below.
              </p>
              <div className="admin-compact-table-scroll">
                <div className="admin-compact-table admin-compact-table--pricing-fees">
                  <div className="admin-compact-table-head admin-compact-table-row">
                    <span className="admin-compact-col admin-compact-col--num">
                      #
                    </span>
                    <span className="admin-compact-col admin-compact-col--name">
                      Room
                    </span>
                    <span className="admin-compact-col admin-compact-col--price">
                      Price
                    </span>
                    <span className="admin-compact-col admin-compact-col--price">
                      Original
                    </span>
                  </div>
                  {packageOfferSummary.length === 0 ? (
                    <div className="admin-empty-card">
                      <p>
                        No Shared Live rooms yet. Mark rooms Live under Shared
                        sections, then set prices under Lodging &amp; food.
                      </p>
                    </div>
                  ) : (
                    packageOfferSummary.map((row, index) => (
                      <div key={row.roomId} className="admin-compact-table-row">
                        <span className="admin-compact-col admin-compact-col--num">
                          {index + 1}
                        </span>
                        <span className="admin-compact-col admin-compact-col--name">
                          <span className="admin-page-room-name">
                            {row.name}
                          </span>
                        </span>
                        <span className="admin-compact-col admin-compact-col--price admin-pricing-fee-value">
                          {row.price || "—"}
                        </span>
                        <span className="admin-compact-col admin-compact-col--price admin-pricing-fee-value admin-pricing-fee-value--muted">
                          {row.originalPrice || "—"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="admin-field" style={{ marginTop: "1rem" }}>
                <div className="admin-field-header">
                  <span className="admin-label">Upcoming dates</span>
                  <button
                    type="button"
                    className="admin-btn-sm"
                    onClick={() => {
                      dateKeys.addKey();
                      setRetreat({
                        ...retreat,
                        dates: [
                          ...retreat.dates,
                          { range: "", availability: "" },
                        ],
                      });
                      const tone = "open" as const;
                      setModules({
                        ...modules,
                        pricing: {
                          ...modules.pricing,
                          batches: [
                            ...(modules.pricing.batches ?? []),
                            {
                              dates: "",
                              spaces: "",
                              tone,
                              status: "Open",
                              statusColor:
                                "text-emerald-700 bg-emerald-50 border-emerald-200",
                            },
                          ],
                        },
                      });
                    }}
                  >
                    Add date
                  </button>
                </div>
                {(modules.pricing.batches ?? []).map((batch, index) => (
                  <div
                    key={dateKeys.keys[index] ?? index}
                    className="admin-nested-card"
                  >
                    <div className="admin-field-header">
                      <span className="admin-label">
                        {batch.dates.trim() || `Date batch ${index + 1}`}
                      </span>
                      <ListRowActions
                        onRemove={() => {
                          dateKeys.removeKey(index);
                          setModules({
                            ...modules,
                            pricing: {
                              ...modules.pricing,
                              batches: (modules.pricing.batches ?? []).filter(
                                (_, i) => i !== index,
                              ),
                            },
                          });
                          setRetreat({
                            ...retreat,
                            dates: retreat.dates.filter((_, i) => i !== index),
                          });
                        }}
                      />
                    </div>
                    <div className="admin-grid-2">
                      <TextField
                        label="Dates"
                        value={batch.dates}
                        onChange={(dates) => {
                          const batches = [...(modules.pricing.batches ?? [])];
                          batches[index] = { ...batch, dates };
                          setModules({
                            ...modules,
                            pricing: { ...modules.pricing, batches },
                          });
                          const retreatDates = [...retreat.dates];
                          if (retreatDates[index]) {
                            retreatDates[index] = {
                              ...retreatDates[index],
                              range: dates,
                            };
                            setRetreat({ ...retreat, dates: retreatDates });
                          }
                        }}
                      />
                      <TextField
                        label="Seats / availability"
                        value={batch.spaces}
                        onChange={(spaces) => {
                          const batches = [...(modules.pricing.batches ?? [])];
                          batches[index] = { ...batch, spaces };
                          setModules({
                            ...modules,
                            pricing: { ...modules.pricing, batches },
                          });
                          const retreatDates = [...retreat.dates];
                          if (retreatDates[index]) {
                            retreatDates[index] = {
                              ...retreatDates[index],
                              availability: spaces,
                            };
                            setRetreat({ ...retreat, dates: retreatDates });
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CollapsiblePanel>
          </div>

          <div className="admin-section-shell">
            <CollapsiblePanel
              id={panelId("testimonials")}
              step={11}
              title="Testimonials"
              subtitle="Guest reviews on the retreat product page (#reviews)"
              {...panelOpenProps("testimonials")}
            >
              <TextField
                label="Eyebrow"
                value={modules.testimonials?.eyebrow ?? ""}
                onChange={(eyebrow) =>
                  setModules({
                    ...modules,
                    testimonials: {
                      items: modules.testimonials?.items ?? [],
                      ...modules.testimonials,
                      eyebrow,
                    },
                  })
                }
              />
              <TextField
                label="Title"
                value={modules.testimonials?.title ?? ""}
                onChange={(title) =>
                  setModules({
                    ...modules,
                    testimonials: {
                      items: modules.testimonials?.items ?? [],
                      ...modules.testimonials,
                      title,
                    },
                  })
                }
              />
              <TextField
                label="Description"
                value={modules.testimonials?.description ?? ""}
                onChange={(description) =>
                  setModules({
                    ...modules,
                    testimonials: {
                      items: modules.testimonials?.items ?? [],
                      ...modules.testimonials,
                      description,
                    },
                  })
                }
                multiline
              />
              <div className="admin-field-header">
                <span className="admin-label">Reviews</span>
                <button
                  type="button"
                  className="admin-btn-sm"
                  onClick={() => {
                    testimonialKeys.addKey();
                    setModules({
                      ...modules,
                      testimonials: {
                        items: [
                          ...(modules.testimonials?.items ?? []),
                          { name: "", quote: "", location: "", rating: 5 },
                        ],
                        ...modules.testimonials,
                      },
                    });
                  }}
                >
                  Add review
                </button>
              </div>
              {(modules.testimonials?.items ?? []).map((item, index) => (
                <div
                  key={testimonialKeys.keys[index]}
                  className="admin-nested-card"
                >
                  <TextField
                    label="Name"
                    value={item.name}
                    onChange={(name) => {
                      const items = [...(modules.testimonials?.items ?? [])];
                      items[index] = { ...item, name };
                      setModules({
                        ...modules,
                        testimonials: {
                          ...modules.testimonials,
                          items,
                        },
                      });
                    }}
                  />
                  <TextField
                    label="Location"
                    value={item.location ?? ""}
                    onChange={(location) => {
                      const items = [...(modules.testimonials?.items ?? [])];
                      items[index] = { ...item, location };
                      setModules({
                        ...modules,
                        testimonials: {
                          ...modules.testimonials,
                          items,
                        },
                      });
                    }}
                  />
                  <TextField
                    label="Quote"
                    value={item.quote}
                    onChange={(quote) => {
                      const items = [...(modules.testimonials?.items ?? [])];
                      items[index] = { ...item, quote };
                      setModules({
                        ...modules,
                        testimonials: {
                          ...modules.testimonials,
                          items,
                        },
                      });
                    }}
                    multiline
                  />
                  <TextField
                    label="Rating (1–5)"
                    value={String(item.rating ?? 5)}
                    onChange={(raw) => {
                      const rating = Math.min(
                        5,
                        Math.max(1, Number.parseInt(raw, 10) || 5),
                      );
                      const items = [...(modules.testimonials?.items ?? [])];
                      items[index] = { ...item, rating };
                      setModules({
                        ...modules,
                        testimonials: {
                          ...modules.testimonials,
                          items,
                        },
                      });
                    }}
                  />
                </div>
              ))}
            </CollapsiblePanel>
          </div>

          <div className="admin-section-shell">
            <FaqModuleEditor
              faqs={modules.faqs ?? { items: [] }}
              onChange={(faqs) => setModules({ ...modules, faqs })}
              panelId={panelId("faq")}
              step={12}
              description="Questions and answers shown in the retreat FAQ accordion. Drag to reorder."
              {...panelOpenProps("faq")}
            />
          </div>
        </div>
      </div>

      <AdminSaveBar
        title={retreat.title}
        subtitle={slug}
        saving={saving}
        saved={saved}
        dirty={dirty}
        error={error}
        onSave={handleSave}
        previewHref={`/retreat/${slug}`}
      />
    </div>
  );
}
