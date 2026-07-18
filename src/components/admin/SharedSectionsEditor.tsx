"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { AdminSectionJumpNav } from "@/components/admin/AdminSectionJumpNav";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { ImageField } from "@/components/admin/ImageField";
import { SectionLiveField } from "@/components/admin/SectionLiveField";
import { SelectField } from "@/components/admin/SelectField";
import { TextField } from "@/components/admin/TextField";
import { useSectionScrollSpy } from "@/components/admin/useSectionScrollSpy";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import { createDefaultWhyNirvana } from "@/content/data/why-nirvana-defaults";
import type {
  InstagramFeedContent,
  SiteMapContent,
  TravelGuideContent,
  WhyNirvanaContent,
} from "@/content/types/shared-sections";
import { GLOBAL_SHARED_SECTION_KEYS } from "@/content/types/shared-sections";
import { parseApiJson } from "@/lib/types/api";

const SHARED_KEYS = GLOBAL_SHARED_SECTION_KEYS;

type SharedKey = (typeof SHARED_KEYS)[number];

type SharedValue =
  | WhyNirvanaContent
  | SiteMapContent
  | InstagramFeedContent
  | TravelGuideContent
  | Record<string, unknown>;

const LABELS: Record<SharedKey, string> = {
  whyNirvana: "Why Nirvana",
  siteMap: "Map",
  instagram: "Instagram",
  travel: "Travel",
};

const SHARED_PANEL_ITEMS: Record<
  SharedKey,
  readonly { id: string; label: string }[]
> = {
  whyNirvana: [{ id: "shared-why-nirvana", label: "Why Nirvana" }],
  siteMap: [{ id: "shared-site-map", label: "Map" }],
  instagram: [{ id: "shared-instagram", label: "Instagram" }],
  travel: [
    { id: "shared-travel-guide", label: "Travel guide" },
    { id: "shared-travel-facts", label: "Quick facts" },
    { id: "shared-travel-topics", label: "Topics" },
  ],
};

/**
 * Empty scaffold when a shared key is missing from the DB.
 *
 * @param key - Active shared settings key
 */
function emptySharedDoc(key: SharedKey): SharedValue {
  if (key === "whyNirvana") return createDefaultWhyNirvana();
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
 * Admin hub for the four global shared section documents
 * (Why Nirvana, Map, Instagram, Travel). Lodging/food are edited per page.
 */
export function SharedSectionsEditor() {
  const [active, setActive] = useState<SharedKey>("whyNirvana");
  const [value, setValue] = useState<SharedValue | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [baseline, setBaseline] = useState("");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as SharedKey;
    if ((SHARED_KEYS as readonly string[]).includes(hash)) {
      setActive(hash);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setValue(null);
    setError("");
    setSaved(false);
    fetch(`/api/admin/settings/${active}`)
      .then((res) => parseApiJson<{ settings: SharedValue }>(res))
      .then((body) => {
        if (cancelled) return;
        const next = body.settings ?? emptySharedDoc(active);
        setValue(next);
        setBaseline(JSON.stringify(next));
      })
      .catch((err: Error) => {
        if (cancelled) return;
        // Missing row (404) — open an editable default so the panel still works.
        const fallback = emptySharedDoc(active);
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
    try {
      const res = await fetch(`/api/admin/settings/${active}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      await parseApiJson(res);
      setBaseline(JSON.stringify(value));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const dirty = Boolean(value) && JSON.stringify(value) !== baseline;
  const panelItems = SHARED_PANEL_ITEMS[active];
  const activePanelId = useSectionScrollSpy(panelItems.map((item) => item.id));
  const showJumpNav = panelItems.length >= 4;
  const fields = value ? (
    active === "whyNirvana" ? (
      <WhyNirvanaFields doc={value as WhyNirvanaContent} onChange={setValue} />
    ) : active === "siteMap" ? (
      <SiteMapFields doc={value as SiteMapContent} onChange={setValue} />
    ) : active === "instagram" ? (
      <InstagramFields
        doc={value as InstagramFeedContent}
        onChange={setValue}
      />
    ) : (
      <TravelFields doc={value as TravelGuideContent} onChange={setValue} />
    )
  ) : null;

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <div>
          <Link href="/admin" className="admin-back-link">
            ← Dashboard
          </Link>
          <h1 className="admin-title">Shared sections</h1>
          <p className="admin-subtitle">
            Global content only — Why Nirvana, Map, Instagram, and Travel. Edit
            once; each page toggles Live. Lodging and food are edited on each
            page.
          </p>
        </div>
      </div>

      <div className="admin-shared-key-tabs" role="tablist">
        {SHARED_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active === key}
            className={`admin-btn-sm${active === key ? "" : " admin-btn-sm--ghost"}`}
            onClick={() => {
              setActive(key);
              window.location.hash = key;
            }}
          >
            {LABELS[key]}
          </button>
        ))}
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
        fields
      )}

      <AdminSaveBar
        title={LABELS[active]}
        subtitle={`global_settings.${active}`}
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
  const keys = useStableListKeys(highlights.length);
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
      {highlights.map((item, index) => (
        <div key={keys.keys[index]} className="admin-nested-card">
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
        </div>
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
        onClick={() =>
          onChange({
            ...doc,
            highlights: [...highlights, { title: "", body: "" }],
          })
        }
      >
        Add highlight
      </button>
    </CollapsiblePanel>
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
function TravelFields({
  doc,
  onChange,
}: {
  doc: TravelGuideContent;
  onChange: (next: TravelGuideContent) => void;
}) {
  const topicKeys = useStableListKeys(doc.topics?.length ?? 0);
  const factKeys = useStableListKeys(doc.quickFacts?.length ?? 0);
  const topics = doc.topics ?? [];
  const quickFacts = doc.quickFacts ?? [];

  return (
    <>
      <CollapsiblePanel
        id="shared-travel-guide"
        title="Travel guide"
        defaultOpen
        description="Shared travel topics for course and hub pages. Pages only toggle Live."
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
        />
      </CollapsiblePanel>
      <CollapsiblePanel
        id="shared-travel-facts"
        title="Quick facts"
        defaultOpen
      >
        {quickFacts.map((fact, index) => (
          <div key={factKeys.keys[index]} className="admin-grid-2">
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
        ))}
      </CollapsiblePanel>
      <CollapsiblePanel id="shared-travel-topics" title="Topics" defaultOpen>
        {topics.map((topic, index) => (
          <div key={topicKeys.keys[index]} className="admin-nested-card">
            <TextField
              label="Title"
              value={topic.title}
              onChange={(title) => {
                const next = [...topics];
                next[index] = { ...topic, title };
                onChange({ ...doc, topics: next });
              }}
            />
            <TextField
              label="Tag"
              value={topic.tag}
              onChange={(tag) => {
                const next = [...topics];
                next[index] = { ...topic, tag };
                onChange({ ...doc, topics: next });
              }}
            />
            <TextField
              label="Content"
              value={topic.content}
              onChange={(content) => {
                const next = [...topics];
                next[index] = { ...topic, content };
                onChange({ ...doc, topics: next });
              }}
              multiline
            />
            <ImageField
              label="Image"
              value={topic.image}
              onChange={(image) => {
                const next = [...topics];
                next[index] = { ...topic, image };
                onChange({ ...doc, topics: next });
              }}
            />
            <SelectField
              label="Icon"
              value={topic.iconKey}
              options={[
                { value: "shield", label: "Shield" },
                { value: "plane", label: "Plane" },
                { value: "leaf", label: "Leaf" },
                { value: "compass", label: "Compass" },
                { value: "wallet", label: "Wallet" },
                { value: "wifi", label: "Wi‑Fi" },
              ]}
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
        ))}
      </CollapsiblePanel>
    </>
  );
}
