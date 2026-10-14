# Image aspect ratios by page and section

Crop ratios describe the **visible frame on the public site** (CSS `aspect-*`, fixed box, or viewport cover with `object-cover`) — **not** the source file dimensions an editor uploads. Admin `ImageField`s generally do not show these hints yet; crops are enforced in the frontend.

**Legend**

- Ratios are **W:H of the on-page crop** visitors see.
- Prefer Tailwind `aspect-*` when the layout sets one (e.g. `aspect-video` = **16:9**, `aspect-square` = **1:1**).
- **Viewport cover** = height/width from `svh`/`vh` (or section height) + `object-cover`. Visible ratio follows the device; document typical desktop vs mobile when they differ.
- **Layout box** = height/width from flex/grid/content (no fixed `aspect-*`). Approximate only.

---

## Home

| Section | Ratio | Notes |
|--------|--------|--------|
| Hero (video/poster) | **≈16:9** desktop / **≈9:16** mobile | `min-h-svh` cover |
| Welcome images | **1:1** | `aspect-square` |
| Courses cards | **16:10** | `CourseCard` stacked `aspect-[16/10]` |
| Experience cards | **3:4** | `aspect-[3/4]` |
| Teachers list avatars | **1:1** | Circular thumbs (`h-10 w-10`) |
| Teachers spotlight | **4:5** | `TeacherProfileCard` `aspect-4/5` |
| Gallery (masonry) | **2:3**, **16:10**, **1:1**, **3:4**, **4:5**, **16:9**, **4:3** | Rotating tile `aspect-*` |
| Why Rishikesh logos | **1:1** | Square box, `object-contain` |
| Why Rishikesh media | **16:9** | `aspect-video` |
| Video section | **16:9** | Thumbs + player `aspect-video` |
| Rishikesh band | **4:3** → layout box (~**1:1–3:2**) lg+ | `aspect-[4/3]`; `lg:min-h-[640px]` half-column |
| Map | layout box (~**viewport × 50vh**, min 500px) | iframe embed, not an image crop |
| Final CTA background | layout box (section height cover) | Content-driven band, `object-cover` |

---

## Course

| Section | Ratio | Notes |
|--------|--------|--------|
| Hero (bento) | **≈9:16** mobile / **≈1:1** desktop cells | `h-svh` grid cover; main cell half-width on md+ |
| Hero filmstrip thumbs | **≈17:14** → **10:7** (sm+) | `h-14` × `w-[4.25rem]` / `sm:w-20` |
| Hero simple-banner | **≈3:1** desktop / **≈3:4** mobile | `h-[60svh]` `min-h-[420px]` cover |
| Hero page-minimal | **4:3** | Side image `aspect-[4/3]` |
| Overview banner | **21:9** | `aspect-[21/9]` (min-height may stretch on narrow viewports) |
| Exam & certification | **3:2** | `aspect-3/2` |
| Accommodation / Food gallery | **5:3** → **4:3** (md+) | Main stage |
| Room / gallery thumbs | **1:1** | `w-14 h-14` / `sm:w-16 sm:h-16` |
| CMS section blocks | video **16:9**, subsection **16:10**, gallery **1:1**, image **4:3** | Module content |
| Instagram | **1:1** | `aspect-square` tiles |
| Travel banner | **≈3:2** mobile / **≈3:2–8:3** desktop | Fixed heights (`260` / `340` / `520px` row), full width of column |

---

## Online course

| Section | Ratio | Notes |
|--------|--------|--------|
| Hero preview | **3:2** | `aspect-[3/2]` framed preview |
| Teachers avatars | **1:1** | `aspect-square` rounded square |

---

## Retreat

| Section | Ratio | Notes |
|--------|--------|--------|
| Hero image | **4:3** → **16:11** (sm+) | Card image |
| Highlights icons | **1:1** | `size-16` squares |
| Overview mosaic | main **16:10**, sides **1:1** | Grid |
| Package cards | **16:9** | `aspect-video` header |
| Accommodation gallery | **5:3** | Main stage |

---

## Hub / YTT Hub / Venue

| Section | Ratio | Notes |
|--------|--------|--------|
| YTT hero | **≈16:9** desktop / **≈9:16** mobile | Same as Home (`min-h-svh` cover) |
| YTT overview | **1:1** | Welcome-style square grid |
| YTT Why mosaic | main **16:10**, sides **4:5** | Hub Why Rishikesh tiles |
| Programs / course cards | **16:10**; editorial **4:3** → layout box (md+) | Hub + home stacked share `CourseCard` `aspect-[16/10]`; editorial keeps side panel |
| Gallery | same as Home masonry | Shared component |
| Editorial images | **4:5** | Up to 4 images |
| Teachers | **4:5** / **1:1** thumbs | Same as Home |
| Venue hero | **≈3:1** desktop / **≈3:4–1:1** mobile | `DarkMediaHero` ~52–58svh cover |
| Lodging / Instagram / Travel | same as Course | Shared components |

---

## Kirtan

| Section | Ratio | Notes |
|--------|--------|--------|
| Highlights | **16:10** | `aspect-[16/10]` |
| Certification | **4:3** | `aspect-[4/3]` |

---

## Teachers page

| Section | Ratio | Notes |
|--------|--------|--------|
| Profile photo | **4:5** | `aspect-4/5` (no full-bleed hero) |

---

## Contact / Enquire / Booking

| Section | Ratio | Notes |
|--------|--------|--------|
| Hero background | **≈3:1** desktop / **≈3:4–1:1** mobile | `DarkMediaHero` `min-h-[52svh]` / `lg:min-h-[58svh]` cover |

---

## Blog

| Section | Ratio | Notes |
|--------|--------|--------|
| Index cards | **16:10** | Post thumbnails |
| Index / post hero | **≈3:1** desktop / **≈3:4–9:16** mobile | ~48–54svh cover |
| SEO / OG image | **1200×630** (~**1.91:1**) | Metadata target (not an on-page CSS crop) |

---

## Shared sections

| Section | Ratio | Notes |
|--------|--------|--------|
| Why Nirvana | n/a | Icons only |
| Reviews tiles | layout box (~landscape mobile / ~**2:3–3:4** desktop side) | `min-h` + `md:w-1/3` cover |
| Instagram | **1:1** | All media tiles |
| Travel | same as Course travel banner | Layout box, not a fixed `aspect-*` |
| Map | layout box (~**viewport × 50vh**, min 500px) | Embed |

---

## CMS / site pages

| Section | Ratio | Notes |
|--------|--------|--------|
| Hero | **≈3:1** desktop / **≈3:4–1:1** mobile | `min-h-[60vh]` cover |
| Prose side image | **4:5** | `aspect-4/5` |
| Gallery / cards | **4:3** | `aspect-4/3` |

---

## Admin (previews / hints)

| Context | Ratio | Notes |
|--------|--------|--------|
| Page SEO OG image | **1200×630** | Explicit upload hint |
| Media library / ImageField preview | **1:1** | `7rem` square preview |
| Section table thumbs | **7:5** | `3.5rem × 2.5rem` list thumbs |

---

## Quick reference — ratios in use

| Ratio | Where it shows up most |
|-------|------------------------|
| **1:1** | Welcome, Instagram, thumbs, online teachers, logos, retreat mosaic sides |
| **16:9** | Video players, Why Rishikesh media, retreat packages |
| **16:10** | Course cards (stacked), blog cards, gallery tiles, retreat/kirtan highlights |
| **4:3** | Page-minimal hero, CMS gallery/cards, kirtan cert, lodging md+, editorial cards (mobile) |
| **4:5** | Teachers, editorial, YTT Why sides, CMS prose |
| **3:4** | Home experience; gallery masonry; many mobile viewport covers |
| **3:2** | Online hero preview; exam certification |
| **2:3** | Gallery masonry |
| **5:3** | Accommodation / retreat room galleries (main) |
| **21:9** | Course overview banner |
| **16:11** | Retreat hero (sm+) |
| **≈16:9 / ≈9:16** (svh cover) | Full-viewport heroes (Home, YTT, course bento mobile) |
| **≈3:1 / ≈3:4–1:1** (partial svh/vh) | DarkMedia / simple-banner / CMS / blog heroes |
| Layout box | Travel banner, Final CTA, map iframe, reviews, editorial course-card (md+) |

---

## Key component files

- Home gallery: `src/components/home/GallerySection.tsx`
- Page gallery: `src/components/courses/PageGallerySection.tsx`
- Course cards: `src/components/ui/CourseCard.tsx`
- Accommodation: `src/components/courses/AccommodationGalleryPanel.tsx`
- Course overview: `src/components/courses/CourseOverview.tsx`
- Instagram: `src/components/courses/InstagramFeed.tsx`
- Travel banner: `src/components/courses/TravelGuide.tsx`
- SEO OG field: `src/components/admin/PageSeoFields.tsx`
