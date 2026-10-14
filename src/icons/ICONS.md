# Icon components — agent guide

**Read this file before adding or changing any SVG in the project.**

All icons live as React TSX components under `src/icons/`. Components import from the barrel: `import { Check, Wifi } from "@/icons"`.

## Rules

1. **Never inline `<svg>`** in `src/components/`, pages, or layouts. Always add a dedicated file here.
2. **One icon per file.** File name = component name in PascalCase (`Shower.tsx` → `export default function Shower`).
3. **Export from `index.ts`** alphabetically after creating a new icon.
4. **Reuse existing icons** before creating duplicates. Search `src/icons/` first.
5. **Decorative icons** use `aria-hidden="true"`. Meaningful/standalone icons need `<title>` or `role="img"` + `aria-label`.

## Component template

```tsx
import type { IconProps } from "./types";
import { iconSize } from "./types";

export default function MyIcon({
  size = 18,
  className = "",
  strokeWidth = 2,
  ...props
}: IconProps & { strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...iconSize(size, props)}
      {...props}
    >
      <path
        d="..."
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

## Conventions

| Concern | Choice |
| ------- | ------ |
| ViewBox | `0 0 24 24` |
| Default size | `18` (UI), `14` for small inline checks |
| Color | `stroke="currentColor"` or `fill="currentColor"` — never hard-coded hex |
| Style | Outline stroke icons matching Heroicons/Lucide weight |
| Props | Extend `IconProps` from `./types`; spread `{...props}` on `<svg>` |
| Optional | `strokeWidth` prop when consumers need thinner/heavier strokes |

## Checklist for new icons

- [ ] Searched `src/icons/` for an existing match
- [ ] Created `ComponentName.tsx` using the template above
- [ ] Added `export { default as ComponentName } from "./ComponentName"` to `index.ts`
- [ ] Imported from `@/icons` in the consuming component (not a deep path)
- [ ] Ran `npx biome check src/icons/ --write` if needed

## Facility icon registry

Accommodation facility labels map to icons in `src/data/accommodationFacilities.ts`. When adding a new facility label, add a matching icon component (or reuse one) and register it there.
