"use client";

import type { HeroModule, HeroType } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { HeroTypePicker } from "../HeroTypePicker";
import { ImageField } from "../ImageField";
import { ImageListField } from "../ImageListField";
import { ModuleLibraryPanelActions } from "../ModuleLibraryPanelActions";
import { StringListField } from "../StringListField";
import { TextField } from "../TextField";
import type { ModulePanelProps } from "./types";

type HeroModuleEditorProps = ModulePanelProps & {
  hero: HeroModule;
  onChange: (hero: HeroModule) => void;
};

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
  hideLibraryActions = false,
}: HeroModuleEditorProps) {
  function setType(type: HeroType) {
    if (type === hero.type) return;
    if (type === "bento-media") {
      onChange({
        type: "bento-media",
        title: "title" in hero ? hero.title : "",
        heroImages: [],
        videos: [],
      });
    } else if (type === "split-copy") {
      onChange({
        type: "split-copy",
        title: "title" in hero ? hero.title : "",
        previewType: "image",
        previewUrl: "",
      });
    } else if (type === "simple-banner") {
      onChange({
        type: "simple-banner",
        title: "title" in hero ? hero.title : "",
        backgroundImage: "",
      });
    } else {
      onChange({
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
        hideLibraryActions ? undefined : (
          <ModuleLibraryPanelActions
            moduleKey="hero"
            variant={hero.type}
            payload={hero}
            hasContent={Boolean(hero.title?.trim())}
            onInsert={(payload) => onChange(payload as HeroModule)}
          />
        )
      }
    >
      <HeroTypePicker value={hero.type} onChange={setType} />

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
            hint="Upload or pick from the media library for each slide."
          />
          <StringListField
            label="YouTube video IDs"
            items={hero.videos ?? []}
            onChange={(videos) => onChange({ ...hero, videos })}
            addLabel="Add video ID"
            placeholder="B6MMNCE4eLo"
            hint="Only the video ID — not the full URL."
          />
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={hero.disableSupplemental ?? false}
              onChange={(e) =>
                onChange({ ...hero, disableSupplemental: e.target.checked })
              }
            />
            Disable stock supplemental images
          </label>
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
            />
          </div>
        </div>
      ) : null}

      {hero.type === "simple-banner" ? (
        <div className="admin-field-group">
          <p className="admin-field-group-label">Banner hero</p>
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
        <div className="admin-field-group">
          <p className="admin-field-group-label">Simple page hero</p>
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
          />
          <TextField
            label="Description"
            value={hero.description ?? ""}
            onChange={(description) => onChange({ ...hero, description })}
            multiline
          />
          <ImageField
            label="Hero image"
            value={hero.heroImage}
            onChange={(heroImage) => onChange({ ...hero, heroImage })}
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
    </CollapsiblePanel>
  );
}
