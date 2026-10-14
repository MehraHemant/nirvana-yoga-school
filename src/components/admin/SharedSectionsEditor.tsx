"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { AdminSectionJumpNav } from "@/components/admin/AdminSectionJumpNav";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { ImageField } from "@/components/admin/ImageField";
import { NestedItemCard } from "@/components/admin/NestedItemCard";
import {
  RoomsCatalogEditor,
  type RoomsCatalogEditorHandle,
} from "@/components/admin/RoomsCatalogEditor";
import { SectionLiveField } from "@/components/admin/SectionLiveField";
import { SelectField } from "@/components/admin/SelectField";
import {
  type SharedAccommodationMeta,
  SharedAccommodationMetaFields,
  SharedFoodFields,
} from "@/components/admin/SharedLodgingEditors";
import { TextField } from "@/components/admin/TextField";
import { useSectionScrollSpy } from "@/components/admin/useSectionScrollSpy";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import {
  coerceSharedAccommodationMeta,
  normalizeSharedFood,
  sharedMetaToResidentialLife,
} from "@/content/mappers/residential-life";
import type {
  ExamCertificationContent,
  InstagramFeedContent,
  ResidentialLifeContent,
  RetreatAccommodationContent,
  SharedFoodContent,
  SiteMapContent,
  TravelGuideContent,
  WhyNirvanaContent,
} from "@/content/types/shared-sections";
import { GLOBAL_SHARED_SECTION_KEYS } from "@/content/types/shared-sections";
import { hasExamCertificationContent } from "@/lib/cms/section-visibility";
import {
  createEmptySharedFood,
  createEmptyWhyNirvana,
  createExamCertificationAdminScaffold,
} from "@/lib/cms/structural-defaults";
import { parseApiJson } from "@/lib/types/api";

const SHARED_KEYS = GLOBAL_SHARED_SECTION_KEYS;

type SharedKey = (typeof SHARED_KEYS)[number];

/** Shared sections hub tab — global settings key. */
type ActiveSection = SharedKey;

type SharedValue =
  | WhyNirvanaContent
  | ExamCertificationContent
  | SiteMapContent
  | InstagramFeedContent
  | TravelGuideContent
  | ResidentialLifeContent
  | RetreatAccommodationContent
  | SharedFoodContent
  | SharedAccommodationMeta
  | Record<string, unknown>;

const LABELS: Record<SharedKey, string> = {
  whyNirvana: "Why Nirvana",
  examCertification: "Exam & certification",
  siteMap: "Map",
  instagram: "Instagram",
  travel: "Travel",
  residentialLife: "Course accommodation",
  retreatAccommodation: "Retreat accommodation",
  courseFood: "Course food",
  retreatFood: "Retreat food",
};

const HINTS: Record<SharedKey, string> = {
  whyNirvana: "Site-wide band",
  examCertification: "Site-wide band",
  siteMap: "Embed & copy",
  instagram: "Feed settings",
  travel: "Guide & facts",
  residentialLife: "Stay, facilities & rooms",
  retreatAccommodation: "Stay, facilities & rooms",
  courseFood: "Menu copy & gallery",
  retreatFood: "Menu copy & gallery",
};

const DESCRIPTIONS: Record<SharedKey, string> = {
  whyNirvana: "Shared highlights band used across product and hub pages.",
  examCertification: "Shared exam process and certificate copy.",
  siteMap: "Map embed shown on travel and venue pages.",
  instagram: "Instagram feed block used site-wide.",
  travel: "Travel guide copy, facts, and topic cards.",
  residentialLife:
    "Course stay intro, campus facilities, and the shared course room catalog.",
  retreatAccommodation:
    "Retreat stay intro, campus facilities, and the shared retreat room catalog.",
  courseFood: "Shared sattvic food copy and gallery for course pages.",
  retreatFood: "Shared sattvic food copy and gallery for retreat pages.",
};

const NAV_GROUPS: Array<{ label: string; keys: SharedKey[] }> = [
  {
    label: "Lodging & food",
    keys: [
      "residentialLife",
      "retreatAccommodation",
      "courseFood",
      "retreatFood",
    ],
  },
  {
    label: "Site bands",
    keys: ["whyNirvana", "examCertification", "siteMap", "instagram", "travel"],
  },
];

const SHARED_PANEL_ITEMS: Record<
  SharedKey,
  readonly { id: string; label: string }[]
> = {
  whyNirvana: [{ id: "shared-why-nirvana", label: "Why Nirvana" }],
  examCertification: [
    { id: "shared-exam-intro", label: "Intro" },
    { id: "shared-exam-steps", label: "Evaluation steps" },
    { id: "shared-exam-certificates", label: "Certificates" },
  ],
  siteMap: [{ id: "shared-site-map", label: "Map" }],
  instagram: [{ id: "shared-instagram", label: "Instagram" }],
  travel: [
    { id: "shared-travel-guide", label: "Travel guide" },
    { id: "shared-travel-facts", label: "Quick facts" },
    { id: "shared-travel-topics", label: "Topics" },
  ],
  residentialLife: [
    { id: "lodging-stay", label: "Stay overview" },
    { id: "lodging-facilities", label: "Facilities" },
    { id: "lodging-rooms", label: "Rooms" },
  ],
  retreatAccommodation: [
    { id: "lodging-stay", label: "Stay overview" },
    { id: "lodging-facilities", label: "Facilities" },
    { id: "lodging-rooms", label: "Rooms" },
  ],
  courseFood: [{ id: "shared-course-food", label: "Course food" }],
  retreatFood: [{ id: "shared-retreat-food", label: "Retreat food" }],
};

/**
 * Empty scaffold when a shared key is missing from the DB.
 *
 * @param key - Active shared settings key
 */
function emptySharedDoc(key: SharedKey): SharedValue {
  if (key === "whyNirvana") return createEmptyWhyNirvana();
  if (key === "examCertification") {
    return createExamCertificationAdminScaffold();
  }
  if (key === "residentialLife" || key === "retreatAccommodation") {
    return {
      live: true,
      title: "",
      stay: { title: "", description: "" },
      facilities: [],
    } satisfies SharedAccommodationMeta;
  }
  if (key === "courseFood" || key === "retreatFood") {
    return createEmptySharedFood();
  }
  if (key === "siteMap") {
    return {
      live: true,
      eyebrow: "",
      title: "",
      description: "",
      embedUrl: "",
      iframeTitle: "Map",
    } satisfies SiteMapContent;
  }
  if (key === "instagram") {
    return {
      live: true,
      username: null,
      profileUrl: "",
      postsCount: 0,
      media: [],
    } satisfies InstagramFeedContent;
  }
  return {
    live: true,
    intro: "",
    quickFacts: [],
    topics: [],
  } satisfies TravelGuideContent;
}

/**
 * Coerces a loaded settings value into the editor shape for the active key.
 *
 * @param key - Active shared key
 * @param raw - Settings value from API
 */
function coerceLoadedValue(key: SharedKey, raw: SharedValue): SharedValue {
  if (key === "residentialLife" || key === "retreatAccommodation") {
    return coerceSharedAccommodationMeta(raw);
  }
  if (key === "courseFood" || key === "retreatFood") {
    return normalizeSharedFood(raw as SharedFoodContent);
  }
  return raw;
}

/**
 * Admin hub for global shared section documents including lodging catalogs.
 */
export function SharedSectionsEditor() {
  const [active, setActive] = useState<ActiveSection>("whyNirvana");
  const [value, setValue] = useState<SharedValue | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [baseline, setBaseline] = useState("");
  const [roomsDirty, setRoomsDirty] = useState(false);
  const roomsCatalogRef = useRef<RoomsCatalogEditorHandle>(null);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if ((SHARED_KEYS as readonly string[]).includes(hash)) {
      setActive(hash as SharedKey);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setValue(null);
    setError("");
    setSaved(false);
    setRoomsDirty(false);
    fetch(`/api/admin/settings/${active}`)
      .then((res) => parseApiJson<{ settings: SharedValue }>(res))
      .then((body) => {
        if (cancelled) return;
        const next = coerceLoadedValue(
          active,
          body.settings ?? emptySharedDoc(active),
        );
        setValue(next);
        setBaseline(JSON.stringify(next));
      })
      .catch((err: Error) => {
        if (cancelled) return;
        const fallback = coerceLoadedValue(active, emptySharedDoc(active));
        setValue(fallback);
        setBaseline(JSON.stringify(fallback));
        setError(
          err.message.includes("not found") || err.message.includes("404")
            ? ""
            : err.message,
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [active]);

  async function handleSave() {
    if (!value) return;
    setSaving(true);
    setSaved(false);
    setError("");
    const isLodgingSection =
      active === "residentialLife" || active === "retreatAccommodation";
    try {
      let payload: SharedValue = value;
      if (active === "residentialLife" || active === "retreatAccommodation") {
        payload = sharedMetaToResidentialLife(
          coerceSharedAccommodationMeta(value),
        );
      }
      if (active === "courseFood" || active === "retreatFood") {
        payload = normalizeSharedFood(value as SharedFoodContent);
      }
      const saves: Promise<unknown>[] = [
        parseApiJson(
          await fetch(`/api/admin/settings/${active}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value: payload }),
          }),
        ),
      ];
      if (isLodgingSection && roomsCatalogRef.current?.hasUnsavedChanges()) {
        saves.push(roomsCatalogRef.current.saveAll());
      }
      await Promise.all(saves);
      setBaseline(JSON.stringify(value));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const metaDirty = Boolean(value) && JSON.stringify(value) !== baseline;
  const dirty = metaDirty || roomsDirty;
  const panelItems = SHARED_PANEL_ITEMS[active] ?? [];
  const activePanelId = useSectionScrollSpy(panelItems.map((item) => item.id));
  const showJumpNav = panelItems.length >= 2;
  const isLodging =
    active === "residentialLife" || active === "retreatAccommodation";
  const isFood = active === "courseFood" || active === "retreatFood";

  const fields = value ? (
    active === "whyNirvana" ? (
      <WhyNirvanaFields doc={value as WhyNirvanaContent} onChange={setValue} />
    ) : active === "examCertification" ? (
      <ExamCertificationFields
        doc={value as ExamCertificationContent}
        onChange={setValue}
      />
    ) : active === "siteMap" ? (
      <SiteMapFields doc={value as SiteMapContent} onChange={setValue} />
    ) : active === "instagram" ? (
      <InstagramFields
        doc={value as InstagramFeedContent}
        onChange={setValue}
      />
    ) : active === "travel" ? (
      <TravelFields doc={value as TravelGuideContent} onChange={setValue} />
    ) : isLodging ? (
      <div className="admin-shared-stack">
        <SharedAccommodationMetaFields
          doc={value as SharedAccommodationMeta}
          catalogLabel={
            active === "retreatAccommodation" ? "Retreat" : "Course"
          }
          onChange={setValue}
        />
        <RoomsCatalogEditor
          ref={roomsCatalogRef}
          catalog={active === "retreatAccommodation" ? "retreat" : "course"}
          onDirtyChange={setRoomsDirty}
        />
      </div>
    ) : isFood ? (
      <SharedFoodFields
        doc={value as SharedFoodContent}
        catalogLabel={active === "retreatFood" ? "Retreat" : "Course"}
        onChange={setValue}
      />
    ) : null
  ) : null;

  return (
    <div className="admin-editor admin-shared-hub">
      <div className="admin-editor-header admin-shared-hub__header">
        <div>
          <Link href="/admin" className="admin-back-link">
            ← Dashboard
          </Link>
          <h1 className="admin-title">Shared sections</h1>
          <p className="admin-subtitle">
            Edit once — course/retreat accommodation &amp; food, plus site-wide
            bands. Each product page only toggles Live for lodging and food.
          </p>
        </div>
      </div>

      <div className="admin-shared-nav">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="admin-shared-nav__group">
            <p className="admin-shared-nav__label">{group.label}</p>
            <div
              className="admin-shared-nav__tabs"
              role="tablist"
              aria-label={group.label}
            >
              {group.keys.map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active === key}
                  className={`admin-shared-tab${active === key ? " is-active" : ""}`}
                  onClick={() => {
                    setActive(key);
                    window.location.hash = key;
                  }}
                >
                  <span className="admin-shared-tab__label">{LABELS[key]}</span>
                  <span className="admin-shared-tab__hint">{HINTS[key]}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="admin-shared-active-banner">
        <div>
          <p className="admin-cms-kicker">Editing</p>
          <h2 className="admin-shared-active-banner__title">
            {LABELS[active]}
          </h2>
          <p className="admin-shared-active-banner__desc">
            {DESCRIPTIONS[active]}
          </p>
        </div>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      {loading || !value ? (
        <p className="admin-hint">Loading {LABELS[active]}…</p>
      ) : showJumpNav ? (
        <div className="admin-editor-layout">
          <AdminSectionJumpNav
            items={[...panelItems]}
            activeId={activePanelId}
          />
          <div className="admin-editor-sections">{fields}</div>
        </div>
      ) : (
        <div className="admin-editor-sections">{fields}</div>
      )}

      <AdminSaveBar
        title={LABELS[active]}
        subtitle={
          isLodging
            ? `Stay & facilities · global_settings.${active}`
            : `global_settings.${active}`
        }
        saving={saving}
        saved={saved}
        dirty={dirty}
        error={error}
        onSave={handleSave}
      />
    </div>
  );
}

/**
 * Why Nirvana shared fields.
 *
 * @param props - Document and change handler
 */
function WhyNirvanaFields({
  doc,
  onChange,
}: {
  doc: WhyNirvanaContent;
  onChange: (next: WhyNirvanaContent) => void;
}) {
  const highlights = doc.highlights ?? [];
  const { keys, addKey, removeKey } = useStableListKeys(highlights.length);
  return (
    <CollapsiblePanel
      id="shared-why-nirvana"
      title="Why Nirvana"
      defaultOpen
      description="Shared across course, retreat, venue, and hub pages. Each page only toggles Live."
      actions={
        <SectionLiveField
          id="why-nirvana-live"
          value={doc.live}
          onChange={(live) => onChange({ ...doc, live })}
        />
      }
    >
      <TextField
        label="Heading"
        value={doc.heading ?? ""}
        onChange={(heading) => onChange({ ...doc, heading })}
        hint="Subheading above the highlights grid on the public page."
      />
      {highlights.map((item, index) => (
        <NestedItemCard
          key={keys[index]}
          title={item.title || `Highlight ${index + 1}`}
          index={index}
          onRemove={() => {
            removeKey(index);
            onChange({
              ...doc,
              highlights: highlights.filter((_, i) => i !== index),
            });
          }}
        >
          <TextField
            label="Title"
            value={item.title}
            onChange={(title) => {
              const next = [...highlights];
              next[index] = { ...item, title };
              onChange({ ...doc, highlights: next });
            }}
          />
          <TextField
            label="Body"
            value={item.body}
            onChange={(body) => {
              const next = [...highlights];
              next[index] = { ...item, body };
              onChange({ ...doc, highlights: next });
            }}
            multiline
            rows={6}
          />
        </NestedItemCard>
      ))}
      <TextField
        label="Closing"
        value={doc.closing ?? ""}
        onChange={(closing) => onChange({ ...doc, closing })}
        multiline
        rows={4}
      />
      <button
        type="button"
        className="admin-btn-sm"
        onClick={() => {
          addKey();
          onChange({
            ...doc,
            highlights: [...highlights, { title: "", body: "" }],
          });
        }}
      >
        Add highlight
      </button>
    </CollapsiblePanel>
  );
}

/**
 * Shared exam and certificate fields with add/remove and public-visibility preview.
 *
 * @param props - Document and change handler
 */
function ExamCertificationFields({
  doc,
  onChange,
}: {
  doc: ExamCertificationContent;
  onChange: (next: ExamCertificationContent) => void;
}) {
  const steps = doc.steps ?? [];
  const certificates = doc.certificates ?? [];
  const stepKeys = useStableListKeys(steps.length);
  const certificateKeys = useStableListKeys(certificates.length);
  const filledSteps = steps.filter(
    (s) => s.title?.trim() || s.description?.trim() || s.tag?.trim(),
  ).length;
  const filledCerts = certificates.filter(
    (c) => c.title?.trim() || c.subtitle?.trim() || c.image?.trim(),
  ).length;
  const hasCopy = Boolean(
    doc.eyebrow?.trim() || doc.title?.trim() || doc.description?.trim(),
  );
  const willShowPublicly =
    doc.live !== false && hasExamCertificationContent(doc);

  return (
    <>
      <CollapsiblePanel
        id="shared-exam-intro"
        title="Intro"
        defaultOpen
        subtitle={doc.live !== false ? "Live" : "Hidden"}
        description="Shared across course, online course, retreat, and hub pages. Each page toggles Exam & certification under Modules → Visibility."
        actions={
          <SectionLiveField
            id="exam-certification-live"
            value={doc.live}
            onChange={(live) => onChange({ ...doc, live })}
          />
        }
      >
        <div className="admin-grid-2">
          <TextField
            label="Eyebrow"
            value={doc.eyebrow}
            onChange={(eyebrow) => onChange({ ...doc, eyebrow })}
          />
          <TextField
            label="Title"
            value={doc.title}
            onChange={(title) => onChange({ ...doc, title })}
          />
        </div>
        <TextField
          label="Description"
          value={doc.description}
          onChange={(description) => onChange({ ...doc, description })}
          multiline
          rows={4}
        />
        <div
          className="admin-hint admin-hint--padded"
          role="status"
          aria-label="Public visibility summary"
        >
          <div className="admin-list-row-actions admin-list-row-actions--compact">
            <span
              className={`admin-status-chip${doc.live !== false ? " admin-status-chip--ok" : " admin-status-chip--warn"}`}
            >
              {doc.live !== false ? "Live site-wide" : "Hidden site-wide"}
            </span>
            <span
              className={`admin-status-chip${willShowPublicly ? " admin-status-chip--ok" : " admin-status-chip--warn"}`}
            >
              {willShowPublicly
                ? "Visible on enabled pages"
                : "Not visible publicly"}
            </span>
          </div>
          <p className="admin-hint">
            {filledSteps} evaluation step{filledSteps === 1 ? "" : "s"} ·{" "}
            {filledCerts} certificate{filledCerts === 1 ? "" : "s"}
            {!hasCopy && filledSteps === 0 && filledCerts === 0
              ? " · Add intro copy, steps, or certificates to publish"
              : null}
          </p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel
        id="shared-exam-steps"
        title="Evaluation steps"
        defaultOpen={steps.length > 0}
        subtitle={
          steps.length > 0
            ? `${filledSteps} of ${steps.length} filled`
            : "No steps yet"
        }
        description="Numbered list on the public section — title, tag, and description only."
      >
        <div className="admin-nested-list-head">
          <span className="admin-label">Steps</span>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() => {
              stepKeys.addKey();
              onChange({
                ...doc,
                steps: [...steps, { title: "", tag: "", description: "" }],
              });
            }}
          >
            Add step
          </button>
        </div>
        {steps.length === 0 ? (
          <p className="admin-hint">
            No steps yet. Add the exam process in order — each step appears as a
            numbered item on the public page.
          </p>
        ) : null}
        {steps.map((step, index) => (
          <NestedItemCard
            key={stepKeys.keys[index]}
            title={step.title || `Step ${index + 1}`}
            subtitle={step.tag?.trim() || undefined}
            index={index}
            collapsible
            defaultOpen={steps.length <= 2 || index === 0}
            onRemove={() => {
              stepKeys.removeKey(index);
              onChange({
                ...doc,
                steps: steps.filter((_, i) => i !== index),
              });
            }}
          >
            <div className="admin-grid-2">
              <TextField
                label="Title"
                value={step.title}
                onChange={(title) => {
                  const next = [...steps];
                  next[index] = { ...step, title };
                  onChange({ ...doc, steps: next });
                }}
              />
              <TextField
                label="Tag"
                hint="Short label shown above the title, e.g. Practical exam"
                value={step.tag}
                onChange={(tag) => {
                  const next = [...steps];
                  next[index] = { ...step, tag };
                  onChange({ ...doc, steps: next });
                }}
              />
            </div>
            <TextField
              label="Description"
              value={step.description}
              onChange={(description) => {
                const next = [...steps];
                next[index] = { ...step, description };
                onChange({ ...doc, steps: next });
              }}
              multiline
              rows={3}
            />
          </NestedItemCard>
        ))}
      </CollapsiblePanel>

      <CollapsiblePanel
        id="shared-exam-certificates"
        title="Certificates"
        defaultOpen={certificates.length > 0}
        subtitle={
          certificates.length > 0
            ? `${filledCerts} of ${certificates.length} filled`
            : "No certificates yet"
        }
        description="Upload certificate artwork — images stack on the public section and open in a lightbox."
      >
        <div className="admin-nested-list-head">
          <span className="admin-label">Certificates</span>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() => {
              certificateKeys.addKey();
              onChange({
                ...doc,
                certificates: [
                  ...certificates,
                  { title: "", subtitle: "", image: "" },
                ],
              });
            }}
          >
            Add certificate
          </button>
        </div>
        {certificates.length === 0 ? (
          <p className="admin-hint">
            No certificates yet. Add a certificate image plus optional title and
            subtitle for the lightbox.
          </p>
        ) : null}
        {certificates.map((certificate, index) => (
          <NestedItemCard
            key={certificateKeys.keys[index]}
            title={certificate.title || `Certificate ${index + 1}`}
            subtitle={certificate.subtitle?.trim() || undefined}
            index={index}
            collapsible
            defaultOpen={certificates.length <= 2 || index === 0}
            onRemove={() => {
              certificateKeys.removeKey(index);
              onChange({
                ...doc,
                certificates: certificates.filter((_, i) => i !== index),
              });
            }}
          >
            <ImageField
              label="Certificate image"
              value={certificate.image}
              onChange={(image) => {
                const next = [...certificates];
                next[index] = { ...certificate, image };
                onChange({ ...doc, certificates: next });
              }}
            />
            <div className="admin-grid-2">
              <TextField
                label="Title"
                value={certificate.title}
                onChange={(title) => {
                  const next = [...certificates];
                  next[index] = { ...certificate, title };
                  onChange({ ...doc, certificates: next });
                }}
              />
              <TextField
                label="Subtitle"
                value={certificate.subtitle}
                onChange={(subtitle) => {
                  const next = [...certificates];
                  next[index] = { ...certificate, subtitle };
                  onChange({ ...doc, certificates: next });
                }}
              />
            </div>
          </NestedItemCard>
        ))}
      </CollapsiblePanel>
    </>
  );
}

/**
 * Shared map embed fields.
 *
 * @param props - Document and change handler
 */
function SiteMapFields({
  doc,
  onChange,
}: {
  doc: SiteMapContent;
  onChange: (next: SiteMapContent) => void;
}) {
  return (
    <CollapsiblePanel
      id="shared-site-map"
      title="Map"
      defaultOpen
      description="One embed for the whole site. Product pages only toggle Live."
      actions={
        <SectionLiveField
          id="site-map-live"
          value={doc.live}
          onChange={(live) => onChange({ ...doc, live })}
        />
      }
    >
      <div className="admin-grid-2">
        <TextField
          label="Eyebrow"
          value={doc.eyebrow ?? ""}
          onChange={(eyebrow) => onChange({ ...doc, eyebrow })}
        />
        <TextField
          label="Title"
          value={doc.title ?? ""}
          onChange={(title) => onChange({ ...doc, title })}
        />
      </div>
      <TextField
        label="Description"
        value={doc.description ?? ""}
        onChange={(description) => onChange({ ...doc, description })}
        multiline
        rows={2}
      />
      <TextField
        label="Embed URL"
        value={doc.embedUrl}
        onChange={(embedUrl) => onChange({ ...doc, embedUrl })}
        multiline
        rows={2}
      />
      <TextField
        label="Iframe title"
        value={doc.iframeTitle}
        onChange={(iframeTitle) => onChange({ ...doc, iframeTitle })}
      />
    </CollapsiblePanel>
  );
}

/**
 * Shared Instagram feed fields.
 *
 * @param props - Document and change handler
 */
function InstagramFields({
  doc,
  onChange,
}: {
  doc: InstagramFeedContent;
  onChange: (next: InstagramFeedContent) => void;
}) {
  const keys = useStableListKeys(doc.media?.length ?? 0);
  const media = doc.media ?? [];

  return (
    <CollapsiblePanel
      id="shared-instagram"
      title="Instagram"
      defaultOpen
      description="Shared feed shown on product pages. Pages only toggle Live."
      actions={
        <SectionLiveField
          id="instagram-live"
          value={doc.live}
          onChange={(live) => onChange({ ...doc, live })}
        />
      }
    >
      <div className="admin-grid-2">
        <TextField
          label="Username"
          value={doc.username ?? ""}
          onChange={(username) => onChange({ ...doc, username })}
        />
        <TextField
          label="Display name"
          value={doc.displayName ?? ""}
          onChange={(displayName) => onChange({ ...doc, displayName })}
        />
      </div>
      <TextField
        label="Profile URL"
        value={doc.profileUrl}
        onChange={(profileUrl) => onChange({ ...doc, profileUrl })}
      />
      <TextField
        label="Bio"
        value={doc.bio ?? ""}
        onChange={(bio) => onChange({ ...doc, bio })}
        multiline
      />
      <div className="admin-grid-2">
        <TextField
          label="Posts count"
          value={String(doc.postsCount ?? 0)}
          onChange={(postsCount) =>
            onChange({ ...doc, postsCount: Number(postsCount) || 0 })
          }
        />
        <TextField
          label="Followers"
          value={String(doc.followersCount ?? 0)}
          onChange={(followersCount) =>
            onChange({
              ...doc,
              followersCount: Number(followersCount) || 0,
            })
          }
        />
      </div>
      <p className="admin-hint">{media.length} media items</p>
      {media.map((item, index) => (
        <div key={keys.keys[index]} className="admin-nested-card">
          <ImageField
            label={`Post image #${index + 1}`}
            value={item.image}
            onChange={(image) => {
              const next = [...media];
              next[index] = {
                ...item,
                image,
                images: item.images?.length ? item.images : [image],
              };
              onChange({ ...doc, media: next });
            }}
          />
          <TextField
            label="Caption"
            value={item.caption}
            onChange={(caption) => {
              const next = [...media];
              next[index] = { ...item, caption };
              onChange({ ...doc, media: next });
            }}
            multiline
          />
          <TextField
            label="Permalink"
            value={item.permalink}
            onChange={(permalink) => {
              const next = [...media];
              next[index] = { ...item, permalink };
              onChange({ ...doc, media: next });
            }}
          />
        </div>
      ))}
    </CollapsiblePanel>
  );
}

/**
 * Shared travel guide fields.
 *
 * @param props - Document and change handler
 */
const TRAVEL_ICON_OPTIONS: Array<{
  value: TravelGuideContent["topics"][number]["iconKey"];
  label: string;
}> = [
  { value: "shield", label: "Shield" },
  { value: "plane", label: "Plane" },
  { value: "leaf", label: "Leaf" },
  { value: "compass", label: "Compass" },
  { value: "wallet", label: "Wallet" },
  { value: "wifi", label: "Wi‑Fi" },
];

/** Creates an empty travel topic with a stable id for the accordion. */
function createEmptyTravelTopic(): TravelGuideContent["topics"][number] {
  return {
    id: crypto.randomUUID(),
    title: "",
    content: "",
    image: "",
    imageAlt: "",
    iconKey: "compass",
  };
}

/**
 * Shared travel guide fields with collapsible topic cards.
 *
 * @param props - Document and change handler
 */
function TravelFields({
  doc,
  onChange,
}: {
  doc: TravelGuideContent;
  onChange: (next: TravelGuideContent) => void;
}) {
  const {
    keys: topicKeys,
    addKey: addTopicKey,
    removeKey: removeTopicKey,
  } = useStableListKeys(doc.topics?.length ?? 0);
  const {
    keys: factKeys,
    addKey: addFactKey,
    removeKey: removeFactKey,
  } = useStableListKeys(doc.quickFacts?.length ?? 0);
  const topics = doc.topics ?? [];
  const quickFacts = doc.quickFacts ?? [];
  const filledTopics = topics.filter(
    (topic) =>
      topic.title?.trim() || topic.content?.trim() || topic.image?.trim(),
  ).length;
  const filledFacts = quickFacts.filter(
    (fact) => fact.label?.trim() || fact.value?.trim(),
  ).length;

  return (
    <>
      <CollapsiblePanel
        id="shared-travel-guide"
        title="Travel guide"
        defaultOpen
        description="Intro copy shown beside the section heading. Pages only toggle Live."
        actions={
          <SectionLiveField
            id="travel-live"
            value={doc.live}
            onChange={(live) => onChange({ ...doc, live })}
          />
        }
      >
        <TextField
          label="Intro"
          value={doc.intro}
          onChange={(intro) => onChange({ ...doc, intro })}
          multiline
          rows={3}
          hint="Short paragraph under the section title on course and hub pages."
        />
      </CollapsiblePanel>

      <CollapsiblePanel
        id="shared-travel-facts"
        title="Quick facts"
        defaultOpen={quickFacts.length > 0}
        subtitle={
          quickFacts.length > 0
            ? `${filledFacts} of ${quickFacts.length} filled`
            : "Optional"
        }
        description="Label/value pairs for at-a-glance travel details. Leave empty if unused."
      >
        <div className="admin-nested-list-head">
          <span className="admin-label">Facts</span>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() => {
              addFactKey();
              onChange({
                ...doc,
                quickFacts: [...quickFacts, { label: "", value: "" }],
              });
            }}
          >
            Add fact
          </button>
        </div>
        {quickFacts.length === 0 ? (
          <p className="admin-hint">
            No quick facts yet. Add label/value pairs such as airport or visa
            notes if you want them on the page.
          </p>
        ) : null}
        {quickFacts.map((fact, index) => (
          <NestedItemCard
            key={factKeys[index]}
            title={fact.label || `Fact ${index + 1}`}
            subtitle={fact.value?.trim() || undefined}
            index={index}
            collapsible
            defaultOpen={quickFacts.length <= 2}
            onRemove={() => {
              removeFactKey(index);
              onChange({
                ...doc,
                quickFacts: quickFacts.filter((_, i) => i !== index),
              });
            }}
          >
            <div className="admin-grid-2">
              <TextField
                label="Label"
                value={fact.label}
                onChange={(label) => {
                  const next = [...quickFacts];
                  next[index] = { ...fact, label };
                  onChange({ ...doc, quickFacts: next });
                }}
              />
              <TextField
                label="Value"
                value={fact.value}
                onChange={(value) => {
                  const next = [...quickFacts];
                  next[index] = { ...fact, value };
                  onChange({ ...doc, quickFacts: next });
                }}
              />
            </div>
          </NestedItemCard>
        ))}
      </CollapsiblePanel>

      <CollapsiblePanel
        id="shared-travel-topics"
        title="Topics"
        defaultOpen
        subtitle={
          topics.length > 0
            ? `${filledTopics} of ${topics.length} filled`
            : "No topics yet"
        }
        description="Accordion items on the public page — title, body, hero image, and icon."
      >
        <div className="admin-nested-list-head">
          <span className="admin-label">Topics</span>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() => {
              addTopicKey();
              onChange({
                ...doc,
                topics: [...topics, createEmptyTravelTopic()],
              });
            }}
          >
            Add topic
          </button>
        </div>
        {topics.length === 0 ? (
          <p className="admin-hint">
            No topics yet. Each topic becomes an accordion row with a hero image
            when selected.
          </p>
        ) : null}
        {topics.map((topic, index) => {
          const iconLabel =
            TRAVEL_ICON_OPTIONS.find((option) => option.value === topic.iconKey)
              ?.label ?? "Compass";

          return (
            <NestedItemCard
              key={topicKeys[index]}
              title={topic.title || `Topic ${index + 1}`}
              subtitle={iconLabel}
              index={index}
              collapsible
              defaultOpen={topics.length <= 2 || index === 0}
              onRemove={() => {
                removeTopicKey(index);
                onChange({
                  ...doc,
                  topics: topics.filter((_, i) => i !== index),
                });
              }}
            >
              <div className="admin-grid-2">
                <TextField
                  label="Title"
                  value={topic.title}
                  onChange={(title) => {
                    const next = [...topics];
                    next[index] = { ...topic, title };
                    onChange({ ...doc, topics: next });
                  }}
                />
                <SelectField
                  label="Icon"
                  value={topic.iconKey}
                  options={TRAVEL_ICON_OPTIONS}
                  onChange={(iconKey) => {
                    const next = [...topics];
                    next[index] = {
                      ...topic,
                      iconKey:
                        iconKey as TravelGuideContent["topics"][number]["iconKey"],
                    };
                    onChange({ ...doc, topics: next });
                  }}
                />
              </div>
              <TextField
                label="Content"
                value={topic.content}
                onChange={(content) => {
                  const next = [...topics];
                  next[index] = { ...topic, content };
                  onChange({ ...doc, topics: next });
                }}
                multiline
                rows={4}
                hint="Body copy shown when the topic accordion is expanded."
              />
              <ImageField
                label="Hero image"
                value={topic.image}
                onChange={(image) => {
                  const next = [...topics];
                  next[index] = { ...topic, image };
                  onChange({ ...doc, topics: next });
                }}
              />
              <TextField
                label="Image alt text"
                value={topic.imageAlt}
                onChange={(imageAlt) => {
                  const next = [...topics];
                  next[index] = { ...topic, imageAlt };
                  onChange({ ...doc, topics: next });
                }}
                hint="Describe the hero image for screen readers."
              />
            </NestedItemCard>
          );
        })}
      </CollapsiblePanel>
    </>
  );
}
