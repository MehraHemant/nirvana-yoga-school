# Image aspect ratios by page and section

Crop ratios used on the public site (mostly Tailwind `aspect-*` or fill frames). Admin `ImageField`s generally do not show these hints yet — crops are enforced in the frontend.

**Legend**

- `fill` = full-bleed / viewport or section height, `object-cover`
- `fluid` = no fixed aspect; height/width driven by layout
- `aspect-video` = **16:9**

---

## Home

| Section | Ratio | Notes |
|--------|--------|--------|
| Hero (video/poster) | fill | `min-h-svh`, full-bleed |
| Welcome images | **1:1** | Square grid cells |
| Courses cards | **16:10** | Via `CourseCard` stacked layout |
| Experience cards | **3:4** | Portrait cards |
| Teachers list avatars | **1:1** | Small circular thumbs |
| Teachers spotlight | **4:5** | Detail photo |
| Gallery (masonry) | **2:3**, **16:10**, **1:1**, **3:4**, **4:5**, **16:9**, **4:3** | Rotating tile classes |
| Why Rishikesh logos | **1:1** | `object-contain` |
| Why Rishikesh media | **16:9** | Image/video tile |
| Video section | **16:9** | Thumbs + player |
| Rishikesh band | **4:3** (mobile) / fill (desktop) | Responsive |
| Map | fluid iframe | ~50vh |
| Final CTA background | fill | Full-bleed |

---

## Course

| Section | Ratio | Notes |
|--------|--------|--------|
| Hero (bento) | fill | Viewport grid cells |
| Hero filmstrip thumbs | ~**17:14** | Fixed small px |
| Hero simple-banner | fill | ~60svh |
| Hero page-minimal | **4:3** | Side image |
| Overview banner | **21:9** | Ultra-wide |
| Exam & certification | **3:2** | Photo pair |
| Accommodation / Food gallery | **5:3** → **4:3** (md+) | Main stage |
| Room / gallery thumbs | **1:1** | Switcher / filmstrip |
| CMS section blocks | video **16:9**, subsection **16:10**, gallery **1:1**, image **4:3** | Module content |
| Instagram | **1:1** | Grid tiles |
| Travel banner | fluid height; source **16:9** | Defaults 1600×900 |

---

## Online course

| Section | Ratio | Notes |
|--------|--------|--------|
| Hero preview | **16:9** | Image/video |
| Teachers avatars | **1:1** | Rounded square |

---

## Retreat

| Section | Ratio | Notes |
|--------|--------|--------|
| Hero image | **4:3** → **16:11** (sm+) | Card image |
| Highlights icons | **1:1** | Small squares |
| Overview mosaic | main **16:10**, sides **1:1** | Grid |
| Package cards | **16:9** | Card header |
| Accommodation gallery | **5:3** | Main stage |

---

## Hub / YTT Hub / Venue

| Section | Ratio | Notes |
|--------|--------|--------|
| YTT hero / overview main | fill | Tall cover |
| YTT overview inset | **4:5** | Overlay inset |
| Programs / course cards | **16:10** (editorial: **4:3** → fill) | `CourseCard` |
| Gallery | same as Home masonry | Shared component |
| Editorial images | **4:5** | Up to 4 images |
| Teachers | **4:5** / **1:1** thumbs | Same as Home |
| Lodging / Instagram / Travel | same as Course | Shared components |

---

## Kirtan

| Section | Ratio | Notes |
|--------|--------|--------|
| Highlights | **16:10** | Feature images |
| Certification | **4:3** | Image tiles |

---

## Teachers page

| Section | Ratio | Notes |
|--------|--------|--------|
| Hero | fill | Full-bleed |
| Profile photo | fluid | Fixed height, ~half width |

---

## Contact / Enquire / Booking

| Section | Ratio | Notes |
|--------|--------|--------|
| Hero background | fill | Low-opacity cover |

---

## Blog

| Section | Ratio | Notes |
|--------|--------|--------|
| Index cards | **16:10** | Post thumbnails |
| Post hero | fill | Full-bleed |
| SEO / OG image | **1200×630** (~**1.91:1**) | Metadata |

---

## Shared sections

| Section | Ratio | Notes |
|--------|--------|--------|
| Why Nirvana | n/a | Icons only |
| Reviews tiles | fluid | Portrait-leaning on desktop |
| Instagram | **1:1** | All media tiles |
| Travel | **16:9** | Crop intent in defaults |
| Map | fluid iframe | Embed |

---

## CMS / site pages

| Section | Ratio | Notes |
|--------|--------|--------|
| Hero | fill | Full-bleed |
| Prose side image | **4:5** | Split prose |
| Gallery / cards | **4:3** | Grid / card tops |

---

## Admin (previews / hints)

| Context | Ratio | Notes |
|--------|--------|--------|
| Page SEO OG image | **1200×630** | Explicit upload hint |
| Media library thumbs | **1:1** | Admin UI preview |
| Section card preview | **16:10** | Admin list cards |

---

## Quick reference — ratios in use

| Ratio | Where it shows up most |
|-------|------------------------|
| **1:1** | Welcome, Instagram, thumbs, online teachers, lodging thumbs |
| **16:9** | Online hero, video players, retreat packages, Why Rishikesh media |
| **16:10** | Course cards, blog cards, gallery tiles, retreat overview, kirtan highlights |
| **4:3** | Page-minimal hero, CMS gallery/cards, kirtan cert, lodging md+ |
| **4:5** | Teachers, editorial, YTT inset, CMS prose |
| **3:4** | Home experience; gallery masonry |
| **2:3** | Gallery masonry |
| **5:3** | Accommodation / retreat room galleries |
| **3:2** | Exam certification |
| **21:9** | Course overview banner |
| **16:11** | Retreat hero (sm+) |
| **fill / fluid** | Most heroes, map, travel banner height box |

---

## Key component files

- Home gallery: `src/components/home/GallerySection.tsx`
- Page gallery: `src/components/courses/PageGallerySection.tsx`
- Course cards: `src/components/ui/CourseCard.tsx`
- Accommodation: `src/components/courses/AccommodationGalleryPanel.tsx`
- Course overview: `src/components/courses/CourseOverview.tsx`
- Instagram: `src/components/courses/InstagramFeed.tsx`
- Travel defaults: `src/content/data/travel-guide-defaults.ts`
- SEO OG field: `src/components/admin/PageSeoFields.tsx`
