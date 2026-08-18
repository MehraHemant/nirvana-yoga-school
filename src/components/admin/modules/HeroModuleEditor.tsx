"use client";

import type { HeroModule, HeroType } from "@/content/types";
import {
  getHeroLayoutConfig,
  type HeroLayoutConfig,
  type PageLayoutId,
} from "@/lib/cms/page-layout-registry";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { SectionIdField } from "../SectionIdField";
import { HeroSectionEditor } from "./HeroSectionEditor";
import { ModuleLiveField } from "./ModuleLiveField";
import type { ModulePanelProps } from "./types";

type HeroModuleEditorProps = ModulePanelProps & {
  hero: HeroModule;
  onChange: (hero: HeroModule) => void;
  /** Layout family — resolves hero editor config from page-layout registry */
  layoutId?: PageLayoutId;
  /** Pre-resolved hero config (e.g. from API meta.heroLayout) */
  heroLayout?: HeroLayoutConfig;
  /** Override allowed layout cards */
  allowedTypes?: HeroType[];
};

/**
 * Hero module panel — collapsible shell around {@link HeroSectionEditor}.
 *
 * @param props - Hero config, panel state, layout, and change handler
 */
export function HeroModuleEditor({
  hero,
  onChange,
  panelId = "module-hero",
  step = 1,
  description,
  open,
  onOpenChange,
  layoutId,
  heroLayout,
  allowedTypes,
}: HeroModuleEditorProps) {
  const layoutConfig =
    heroLayout ?? (layoutId ? getHeroLayoutConfig(layoutId) : undefined);
  const panelDescription =
    description ??
    layoutConfig?.description ??
    "Page top banner — pick a layout, then fill in title, images, and CTAs.";

  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="Hero section"
      subtitle={hero.type.replace(/-/g, " ")}
      description={panelDescription}
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
      <HeroSectionEditor
        hero={hero}
        onChange={onChange}
        layoutConfig={layoutConfig}
        allowedTypes={allowedTypes}
      />
    </CollapsiblePanel>
  );
}
