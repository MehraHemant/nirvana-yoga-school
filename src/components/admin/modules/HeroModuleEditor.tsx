"use client";

import type { HeroModule, HeroType, PageMinimalHero } from "@/content/types";
import type { HomeHeroVideoContent } from "@/content/types/dedicated-pages";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { HeroTypePicker } from "../HeroTypePicker";
import { ImageField } from "../ImageField";
import { ImageListField } from "../ImageListField";
import { SectionIdField } from "../SectionIdField";
import { StringListField } from "../StringListField";
import { TextField } from "../TextField";
import { useStableListKeys } from "../useStableListKeys";
import { ModuleLiveField } from "./ModuleLiveField";
import type { ModulePanelProps } from "./types";

const EMPTY_HERO_VIDEO: HomeHeroVideoContent = {
  mobileSrc: "",
  mobilePoster: "",
  desktopSrc: "",
  desktopPoster: "",
};

type HeroModuleEditorProps = ModulePanelProps & {
  hero: HeroModule;
  onChange: (hero: HeroModule) => void;
  /** Restrict layout picker (e.g. venue pages only allow simple-banner) */
  allowedTypes?: HeroType[];
};

type PageMinimalHeroFieldsProps = {
  hero: PageMinimalHero;
  onChange: (hero: PageMinimalHero) => void;
};

/**
 * Page-minimal hero fields including homepage-style lead/accent/marquee/video.
 *
 * @param props - Page-minimal hero and change handler
 */
function PageMinimalHeroFields({
  hero,
  onChange,
}: PageMinimalHeroFieldsProps) {
  const trustKeys = useStableListKeys(hero.mobileTrust?.length ?? 0);
  const heroVideo = hero.heroVideo ?? EMPTY_HERO_VIDEO;
  const mobileTrust = hero.mobileTrust ?? [];

  return (
    <div className="admin-field-group">
      <p className="admin-field-group-label">Page / hub hero</p>
      <TextField
        label="Badge / eyebrow"
        value={hero.eyebrow ?? ""}
        onChange={(eyebrow) => onChange({ ...hero, eyebrow })}
      />
      <div className="admin-grid-2">
        <TextField
          label="Title lead"
          value={hero.titleLead ?? hero.title}
          onChange={(titleLead) =>
            onChange({ ...hero, titleLead, title: titleLead })
          }
          hint="First line of the homepage-style hero title."
        />
        <TextField
          label="Title accent"
          value={hero.titleAccent ?? ""}
          onChange={(titleAccent) => onChange({ ...hero, titleAccent })}
          hint="Accent phrase under the lead (serif / primary)."
        />
      </div>
      <TextField
        label="Full title (fallback)"
        value={hero.title}
        onChange={(title) => onChange({ ...hero, title })}
        hint="Used when lead/accent are empty; also kept for SEO/listings."
      />
      <TextField
        label="Subtitle"
        value={hero.subtitle ?? ""}
        onChange={(subtitle) => onChange({ ...hero, subtitle })}
      />
      <TextField
        label="Description"
        value={hero.description ?? ""}
        onChange={(description) => onChange({ ...hero, description })}
        multiline
      />
      <ImageField
        label="Hero image / poster fallback"
        value={hero.heroImage}
        onChange={(heroImage) => onChange({ ...hero, heroImage })}
        hint="Still image shown as full-bleed poster when video src is empty."
      />
      <div className="admin-nested-card">
        <strong>Background video (optional)</strong>
        <p className="admin-hint">
          Full-bleed muted MP4 loop (autoplay, no controls). Leave srcs empty
          for poster / still image only.
        </p>
        <div className="admin-grid-2">
          <TextField
            label="Mobile MP4 src"
            value={heroVideo.mobileSrc}
            onChange={(mobileSrc) =>
              onChange({
                ...hero,
                heroVideo: { ...heroVideo, mobileSrc },
              })
            }
          />
          <TextField
            label="Mobile poster"
            value={heroVideo.mobilePoster}
            onChange={(mobilePoster) =>
              onChange({
                ...hero,
                heroVideo: { ...heroVideo, mobilePoster },
              })
            }
          />
        </div>
        <div className="admin-grid-2">
          <TextField
            label="Desktop MP4 src"
            value={heroVideo.desktopSrc}
            onChange={(desktopSrc) =>
              onChange({
                ...hero,
                heroVideo: { ...heroVideo, desktopSrc },
              })
            }
          />
          <TextField
            label="Desktop poster"
            value={heroVideo.desktopPoster}
            onChange={(desktopPoster) =>
              onChange({
                ...hero,
                heroVideo: { ...heroVideo, desktopPoster },
              })
            }
          />
        </div>
      </div>
      <div className="admin-grid-2">
        <TextField
          label="CTA label"
          value={hero.ctaLabel ?? ""}
          onChange={(ctaLabel) => onChange({ ...hero, ctaLabel })}
        />
        <TextField
          label="CTA link"
          value={hero.ctaHref ?? ""}
          onChange={(ctaHref) => onChange({ ...hero, ctaHref })}
        />
      </div>
      <StringListField
        label="Marquee items"
        items={hero.marqueeItems ?? []}
        onChange={(marqueeItems) => onChange({ ...hero, marqueeItems })}
      />
      <div className="admin-nested-list">
        <div className="admin-nested-list-head">
          <span className="admin-label">Mobile trust chips</span>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() => {
              trustKeys.addKey();
              onChange({
                ...hero,
                mobileTrust: [...mobileTrust, { value: "", label: "" }],
              });
            }}
          >
            Add chip
          </button>
        </div>
        {mobileTrust.map((chip, index) => (
          <div key={trustKeys.keys[index]} className="admin-nested-card">
            <div className="admin-grid-2">
              <TextField
                label="Value"
                value={chip.value}
                onChange={(value) => {
                  const next = [...mobileTrust];
                  next[index] = { ...chip, value };
                  onChange({ ...hero, mobileTrust: next });
                }}
              />
              <TextField
                label="Label"
                value={chip.label}
                onChange={(label) => {
                  const next = [...mobileTrust];
                  next[index] = { ...chip, label };
                  onChange({ ...hero, mobileTrust: next });
                }}
              />
            </div>
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              onClick={() => {
                trustKeys.removeKey(index);
                onChange({
                  ...hero,
                  mobileTrust: mobileTrust.filter((_, i) => i !== index),
                });
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Hero module editor with conditional fields per hero type.
 *
 * @param props - Hero config, panel state, and change handler
 */
export function HeroModuleEditor({
  hero,
  onChange,
  panelId = "module-hero",
  step = 1,
  description = "Page top banner — pick a layout, then fill in title, images, and CTAs.",
  open,
  onOpenChange,
  allowedTypes,
}: HeroModuleEditorProps) {
  function setType(type: HeroType) {
    if (type === hero.type) return;
    const keep = { _id: hero._id, live: hero.live };
    if (type === "bento-media") {
      onChange({
        ...keep,
        type: "bento-media",
        title: "title" in hero ? hero.title : "",
        heroImages: [],
        videos: [],
      });
    } else if (type === "split-copy") {
      onChange({
        ...keep,
        type: "split-copy",
        title: "title" in hero ? hero.title : "",
        previewType: "image",
        previewUrl: "",
      });
    } else if (type === "simple-banner") {
      onChange({
        ...keep,
        type: "simple-banner",
        title: "title" in hero ? hero.title : "",
        backgroundImage: "",
      });
    } else {
      onChange({
        ...keep,
        type: "page-minimal",
        title: "title" in hero ? hero.title : "",
        heroImage: "",
      });
    }
  }

  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="Hero section"
      subtitle={hero.type.replace(/-/g, " ")}
      description={description}
      open={open}
      onOpenChange={onOpenChange}
      actions={
        <ModuleLiveField
          id={`${panelId}-live`}
          value={hero.live}
          onChange={(live) => onChange({ ...hero, live })}
        />
      }
    >
      <SectionIdField
        fieldId={`${panelId}-section-id`}
        value={hero._id}
        onChange={(_id) => onChange({ ...hero, _id })}
      />
      <HeroTypePicker
        value={hero.type}
        onChange={setType}
        allowedTypes={allowedTypes}
      />

      {hero.type === "bento-media" ? (
        <div className="admin-field-group">
          <p className="admin-field-group-label">Course hero content</p>
          <TextField
            label="Title"
            value={hero.title}
            onChange={(title) => onChange({ ...hero, title })}
          />
          <TextField
            label="Subtitle"
            value={hero.subtitle ?? ""}
            onChange={(subtitle) => onChange({ ...hero, subtitle })}
            multiline
          />
          <div className="admin-grid-2">
            <TextField
              label="Duration"
              value={hero.duration ?? ""}
              onChange={(duration) => onChange({ ...hero, duration })}
            />
            <TextField
              label="Level"
              value={hero.level ?? ""}
              onChange={(level) => onChange({ ...hero, level })}
            />
          </div>
          <div className="admin-grid-2">
            <TextField
              label="Certification"
              value={hero.certification ?? ""}
              onChange={(certification) => onChange({ ...hero, certification })}
            />
            <TextField
              label="Fee"
              value={hero.fee ?? ""}
              onChange={(fee) => onChange({ ...hero, fee })}
            />
          </div>
          <ImageField
            label="Certification badge"
            value={hero.certBadge ?? ""}
            onChange={(certBadge) => onChange({ ...hero, certBadge })}
          />
          <ImageListField
            label="Hero gallery images"
            items={hero.heroImages ?? []}
            onChange={(heroImages) => onChange({ ...hero, heroImages })}
            addLabel="Add image"
            hint="Each row is one slide — upload or pick an image, set alt text, then drag to reorder."
          />
          <StringListField
            label="YouTube video URLs"
            items={hero.videos ?? []}
            onChange={(videos) => onChange({ ...hero, videos })}
            addLabel="Add video URL"
            placeholder="https://www.youtube.com/watch?v=…"
            hint="Paste full YouTube watch or youtu.be links. Filmstrip still uses Hero gallery images only."
          />
        </div>
      ) : null}

      {hero.type === "split-copy" ? (
        <div className="admin-field-group">
          <p className="admin-field-group-label">Online course hero</p>
          <TextField
            label="Eyebrow"
            value={hero.eyebrow ?? ""}
            onChange={(eyebrow) => onChange({ ...hero, eyebrow })}
          />
          <TextField
            label="Title"
            value={hero.title}
            onChange={(title) => onChange({ ...hero, title })}
          />
          <TextField
            label="Subtitle"
            value={hero.subtitle ?? ""}
            onChange={(subtitle) => onChange({ ...hero, subtitle })}
            multiline
          />
          <div className="admin-grid-2">
            <TextField
              label="CTA primary"
              value={hero.ctaPrimary ?? ""}
              onChange={(ctaPrimary) => onChange({ ...hero, ctaPrimary })}
            />
            <TextField
              label="CTA primary link"
              value={hero.ctaPrimaryHref ?? ""}
              onChange={(ctaPrimaryHref) =>
                onChange({ ...hero, ctaPrimaryHref })
              }
            />
          </div>
          <div className="admin-grid-2">
            <TextField
              label="CTA secondary"
              value={hero.ctaSecondary ?? ""}
              onChange={(ctaSecondary) => onChange({ ...hero, ctaSecondary })}
            />
            <TextField
              label="CTA secondary link"
              value={hero.ctaSecondaryHref ?? ""}
              onChange={(ctaSecondaryHref) =>
                onChange({ ...hero, ctaSecondaryHref })
              }
            />
          </div>
          <div className="admin-grid-2">
            <div className="admin-field">
              <label className="admin-label" htmlFor="preview-type">
                Preview type
              </label>
              <select
                id="preview-type"
                className="admin-input"
                value={hero.previewType}
                onChange={(e) =>
                  onChange({
                    ...hero,
                    previewType: e.target.value as "image" | "video",
                  })
                }
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            <ImageField
              label="Preview URL"
              value={hero.previewUrl}
              onChange={(previewUrl) => onChange({ ...hero, previewUrl })}
              hint="Shown as a framed image (or YouTube thumbnail with a play link) on the right side of the hero — not a full-bleed background."
            />
          </div>
        </div>
      ) : null}

      {hero.type === "simple-banner" ? (
        <div className="admin-field-group">
          <p className="admin-field-group-label">Banner hero</p>
          <TextField
            label="Eyebrow"
            value={hero.eyebrow ?? ""}
            onChange={(eyebrow) => onChange({ ...hero, eyebrow })}
          />
          <TextField
            label="Title"
            value={hero.title}
            onChange={(title) => onChange({ ...hero, title })}
          />
          <TextField
            label="Subtitle"
            value={hero.subtitle ?? ""}
            onChange={(subtitle) => onChange({ ...hero, subtitle })}
            multiline
          />
          <ImageField
            label="Background image"
            value={hero.backgroundImage}
            onChange={(backgroundImage) =>
              onChange({ ...hero, backgroundImage })
            }
            hint="Full-bleed hero image at the top of the public page."
          />
          <div className="admin-grid-2">
            <TextField
              label="CTA label"
              value={hero.ctaLabel ?? ""}
              onChange={(ctaLabel) => onChange({ ...hero, ctaLabel })}
            />
            <TextField
              label="CTA link"
              value={hero.ctaHref ?? ""}
              onChange={(ctaHref) => onChange({ ...hero, ctaHref })}
            />
          </div>
        </div>
      ) : null}

      {hero.type === "page-minimal" ? (
        <PageMinimalHeroFields hero={hero} onChange={onChange} />
      ) : null}
    </CollapsiblePanel>
  );
}
