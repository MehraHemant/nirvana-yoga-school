import Image from "next/image";
import Link from "next/link";
import { BlogHtmlContent } from "@/components/blog/BlogHtmlContent";
import { Button, Container, Heading } from "@/components/ui";
import type { SitePageCmsContent } from "@/content/types";
import { hasFilledCmsData } from "@/lib/cms/content-schema-utils";

type CmsPageContentProps = {
  /** Typed CMS blocks from MySQL */
  cms: SitePageCmsContent;
};

function str(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  return typeof value === "string" ? value.trim() : "";
}

function lines(data: Record<string, unknown>, key: string): string[] {
  return str(data, key)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Reads a repeater field into an array of row records. */
function rows(
  data: Record<string, unknown>,
  key: string,
): Record<string, unknown>[] {
  const value = data[key];
  if (!Array.isArray(value)) return [];
  return value.filter(
    (row): row is Record<string, unknown> =>
      !!row && typeof row === "object" && !Array.isArray(row),
  );
}

/** Reads a string cell from a repeater row. */
function cell(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Renders ordered CMS component blocks for a page.
 *
 * @param props - CMS snapshot from SitePageDocument
 */
export function CmsPageContent({ cms }: CmsPageContentProps) {
  const blocks = cms.blocks.filter((b) => hasFilledCmsData(b.data));
  if (blocks.length === 0) return null;

  return (
    <>
      {blocks.map((block) => (
        <CmsBlock
          key={`${block.typeKey}-${JSON.stringify(block.data).slice(0, 24)}`}
          typeKey={block.typeKey}
          data={block.data}
        />
      ))}
    </>
  );
}

type CmsBlockProps = {
  typeKey: string;
  data: Record<string, unknown>;
};

/**
 * Dispatches a single CMS block to a layout by type key.
 *
 * @param props - Block type key and field data
 */
function CmsBlock({ typeKey, data }: CmsBlockProps) {
  // Global chrome is rendered from the site layout — never as a page section
  if (typeKey === "site_header") return null;

  if (typeKey === "hero" || typeKey.endsWith("_hero")) {
    return (
      <HeroBlock
        eyebrow={str(data, "eyebrow")}
        headline={str(data, "headline")}
        summary={str(data, "summary")}
        image={str(data, "hero_image")}
        ctaLabel={str(data, "cta_label")}
        ctaHref={str(data, "cta_href")}
        meta={[
          str(data, "duration"),
          str(data, "level"),
          str(data, "certification"),
          str(data, "fee"),
          str(data, "location"),
        ].filter(Boolean)}
      />
    );
  }

  if (typeKey === "contact" || typeKey === "site_contact") {
    return <ContactBlock data={data} />;
  }

  if (typeKey === "about" || typeKey === "site_about") {
    return <AboutBlock data={data} />;
  }

  if (typeKey === "gallery") {
    return <GalleryBlock data={data} />;
  }

  if (typeKey === "cards") {
    return <CardsBlock data={data} />;
  }

  if (typeKey === "feature_list") {
    return <FeatureListBlock data={data} />;
  }

  if (typeKey === "pricing_table") {
    return <PricingTableBlock data={data} />;
  }

  if (typeKey === "faq" || typeKey.includes("faq")) {
    const items = rows(data, "items");
    if (items.length > 0) {
      return (
        <FaqBlock
          eyebrow={str(data, "eyebrow")}
          title={str(data, "title") || str(data, "headline")}
          items={items}
        />
      );
    }
    return (
      <ProseBlock
        eyebrow={str(data, "eyebrow")}
        title={str(data, "title") || str(data, "headline")}
        body={str(data, "body")}
      />
    );
  }

  if (
    typeKey === "checklist" ||
    typeKey.includes("inclusions") ||
    typeKey.includes("amenities")
  ) {
    const items = lines(data, "includes").length
      ? lines(data, "includes")
      : lines(data, "items");
    return (
      <ListBlock
        title={str(data, "title")}
        items={items}
        excludes={lines(data, "excludes")}
        body={str(data, "body")}
      />
    );
  }

  return (
    <ProseBlock
      eyebrow={str(data, "eyebrow")}
      title={str(data, "title") || str(data, "headline")}
      lead={str(data, "lead") || str(data, "summary")}
      body={str(data, "body")}
      image={str(data, "image") || str(data, "portrait_image")}
      ctaLabel={str(data, "cta_label")}
      ctaHref={str(data, "cta_href")}
    />
  );
}

function HeroBlock({
  eyebrow,
  headline,
  summary,
  image,
  ctaLabel,
  ctaHref,
  meta,
}: {
  eyebrow: string;
  headline: string;
  summary: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
  meta: string[];
}) {
  return (
    <section className="relative min-h-[60vh] overflow-hidden bg-ink text-white">
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-primary via-ink to-secondary" />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/55 to-ink/25" />
      <Container
        size="lg"
        className="relative flex min-h-[60vh] items-end py-16 md:py-24"
      >
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="type-eyebrow mb-4 text-accent">{eyebrow}</p>
          ) : null}
          {headline ? (
            <Heading as="h1" size="h1" invert>
              {headline}
            </Heading>
          ) : null}
          {summary ? (
            <p className="type-lead mt-5 text-white/85">{summary}</p>
          ) : null}
          {meta.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-3">
              {meta.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-white/25 px-3 py-1 type-ui text-white/90"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
          {ctaLabel && ctaHref ? (
            <div className="mt-8">
              <Button href={ctaHref} variant="primary" size="lg" responsive>
                {ctaLabel}
              </Button>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

function ProseBlock({
  eyebrow,
  title,
  lead,
  body,
  image,
  ctaLabel,
  ctaHref,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  body: string;
  image?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  if (!title && !body && !lead) return null;
  return (
    <section className="bg-white py-16 md:py-20">
      <Container size="lg">
        <div
          className={
            image
              ? "grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start"
              : "max-w-3xl"
          }
        >
          <div>
            {eyebrow ? (
              <p className="type-eyebrow mb-3 text-primary">{eyebrow}</p>
            ) : null}
            {title ? (
              <Heading as="h2" size="h2">
                {title}
              </Heading>
            ) : null}
            {lead ? <p className="type-lead mt-4 text-ink">{lead}</p> : null}
            {body ? (
              <div className="mt-6">
                <BlogHtmlContent html={body} className="prose-blog space-y-5" />
              </div>
            ) : null}
            {ctaLabel && ctaHref ? (
              <div className="mt-8">
                <Button href={ctaHref} variant="primary">
                  {ctaLabel}
                </Button>
              </div>
            ) : null}
          </div>
          {image ? (
            <div className="relative aspect-4/5 overflow-hidden rounded-3xl">
              <Image
                src={image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

function ListBlock({
  title,
  items,
  excludes,
  body,
}: {
  title: string;
  items: string[];
  excludes: string[];
  body: string;
}) {
  return (
    <section className="bg-white py-16 md:py-20">
      <Container size="lg">
        {title ? (
          <Heading as="h2" size="h2" className="mb-8">
            {title}
          </Heading>
        ) : null}
        {items.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-ink/8 bg-sand/60 px-4 py-3 type-body"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : null}
        {excludes.length > 0 ? (
          <div className="mt-8">
            <p className="type-eyebrow mb-3 text-ink">Not included</p>
            <ul className="space-y-2 text-ink type-body">
              {excludes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {body ? (
          <div className="mt-8 max-w-3xl">
            <BlogHtmlContent html={body} className="prose-blog space-y-5" />
          </div>
        ) : null}
      </Container>
    </section>
  );
}

function ContactBlock({ data }: { data: Record<string, unknown> }) {
  const email = str(data, "email");
  const phone = str(data, "phone");
  const whatsapp = str(data, "whatsapp");
  const address = str(data, "address");
  const hours = str(data, "hours");
  return (
    <section className="bg-white py-16 md:py-20">
      <Container size="lg">
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div>
            <Heading as="h2" size="h2">
              {str(data, "headline") || "Get in touch"}
            </Heading>
            {str(data, "summary") ? (
              <p className="type-lead mt-4 text-ink">{str(data, "summary")}</p>
            ) : null}
            {str(data, "body") ? (
              <div className="mt-6">
                <BlogHtmlContent
                  html={str(data, "body")}
                  className="prose-blog space-y-5"
                />
              </div>
            ) : null}
          </div>
          <aside className="rounded-3xl bg-white p-7 shadow-card">
            <dl className="space-y-4">
              {email ? (
                <div>
                  <dt className="type-eyebrow text-ink">Email</dt>
                  <dd className="mt-1">
                    <a
                      className="text-primary hover:underline"
                      href={`mailto:${email}`}
                    >
                      {email}
                    </a>
                  </dd>
                </div>
              ) : null}
              {phone ? (
                <div>
                  <dt className="type-eyebrow text-ink">Phone</dt>
                  <dd className="mt-1 type-body">{phone}</dd>
                </div>
              ) : null}
              {whatsapp ? (
                <div>
                  <Button
                    href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                    variant="primary"
                    size="sm"
                  >
                    WhatsApp
                  </Button>
                </div>
              ) : null}
              {address ? (
                <div>
                  <dt className="type-eyebrow text-ink">Address</dt>
                  <dd className="mt-1 whitespace-pre-line type-body">
                    {address}
                  </dd>
                </div>
              ) : null}
              {hours ? (
                <div>
                  <dt className="type-eyebrow text-ink">Hours</dt>
                  <dd className="mt-1 type-body">{hours}</dd>
                </div>
              ) : null}
            </dl>
            <p className="mt-6">
              <Link
                href="/enquire-now"
                className="type-ui text-primary underline"
              >
                Enquire now →
              </Link>
            </p>
          </aside>
        </div>
      </Container>
    </section>
  );
}

function AboutBlock({ data }: { data: Record<string, unknown> }) {
  const body = [
    str(data, "mission")
      ? `<h3>Mission</h3><p>${str(data, "mission")}</p>`
      : "",
    str(data, "vision") ? `<h3>Vision</h3><p>${str(data, "vision")}</p>` : "",
    str(data, "body"),
  ]
    .filter(Boolean)
    .join("");

  return (
    <ProseBlock
      title={str(data, "headline")}
      lead={str(data, "summary")}
      body={body}
      image={str(data, "portrait_image")}
    />
  );
}

function GalleryBlock({ data }: { data: Record<string, unknown> }) {
  const title = str(data, "title");
  const images = rows(data, "images").filter((row) => cell(row, "image"));
  if (images.length === 0) return null;
  return (
    <section className="bg-white py-16 md:py-20">
      <Container size="lg">
        {title ? (
          <Heading as="h2" size="h2" className="mb-8">
            {title}
          </Heading>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <figure
              // biome-ignore lint/suspicious/noArrayIndexKey: gallery order is stable
              key={`gallery-${index}`}
              className="overflow-hidden rounded-3xl bg-sand"
            >
              <div className="relative aspect-4/3">
                <Image
                  src={cell(image, "image")}
                  alt={cell(image, "caption")}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
              </div>
              {cell(image, "caption") ? (
                <figcaption className="px-4 py-3 type-ui text-ink">
                  {cell(image, "caption")}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}

function CardsBlock({ data }: { data: Record<string, unknown> }) {
  const eyebrow = str(data, "eyebrow");
  const title = str(data, "title");
  const cards = rows(data, "cards");
  if (cards.length === 0) return null;
  return (
    <section className="bg-white py-16 md:py-20">
      <Container size="lg">
        {eyebrow ? (
          <p className="type-eyebrow mb-3 text-primary">{eyebrow}</p>
        ) : null}
        {title ? (
          <Heading as="h2" size="h2" className="mb-8">
            {title}
          </Heading>
        ) : null}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => {
            const href = cell(card, "cta_href");
            const label = cell(card, "cta_label");
            return (
              <article
                // biome-ignore lint/suspicious/noArrayIndexKey: card order is stable
                key={`card-${index}`}
                className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-card"
              >
                {cell(card, "image") ? (
                  <div className="relative aspect-4/3">
                    <Image
                      src={cell(card, "image")}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-6">
                  {cell(card, "title") ? (
                    <Heading as="h3" size="display-sm">
                      {cell(card, "title")}
                    </Heading>
                  ) : null}
                  {cell(card, "text") ? (
                    <p className="mt-2 type-body text-ink">
                      {cell(card, "text")}
                    </p>
                  ) : null}
                  {href && label ? (
                    <div className="mt-4">
                      <Button href={href} variant="ghost" size="sm">
                        {label}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function FeatureListBlock({ data }: { data: Record<string, unknown> }) {
  const title = str(data, "title");
  const intro = str(data, "intro");
  const items = rows(data, "items").filter((row) => cell(row, "text"));
  if (items.length === 0 && !title) return null;
  return (
    <section className="bg-white py-16 md:py-20">
      <Container size="lg">
        {title ? (
          <Heading as="h2" size="h2">
            {title}
          </Heading>
        ) : null}
        {intro ? <p className="type-lead mt-4 text-ink">{intro}</p> : null}
        {items.length > 0 ? (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {items.map((item, index) => (
              <li
                // biome-ignore lint/suspicious/noArrayIndexKey: list order is stable
                key={`feature-${index}`}
                className="rounded-2xl border border-ink/8 bg-sand/60 px-4 py-3"
              >
                <p className="type-body font-semibold text-ink">
                  {cell(item, "text")}
                </p>
                {cell(item, "note") ? (
                  <p className="type-ui text-ink">{cell(item, "note")}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </section>
  );
}

function PricingTableBlock({ data }: { data: Record<string, unknown> }) {
  const title = str(data, "title");
  const plans = rows(data, "plans").filter((row) => cell(row, "name"));
  if (plans.length === 0) return null;
  return (
    <section className="bg-white py-16 md:py-20">
      <Container size="lg">
        {title ? (
          <Heading as="h2" size="h2" className="mb-8">
            {title}
          </Heading>
        ) : null}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const href = cell(plan, "cta_href");
            const label = cell(plan, "cta_label");
            return (
              <article
                // biome-ignore lint/suspicious/noArrayIndexKey: plan order is stable
                key={`plan-${index}`}
                className="flex flex-col rounded-3xl border border-ink/8 bg-white p-7 shadow-card"
              >
                <h3 className="type-eyebrow text-ink">{cell(plan, "name")}</h3>
                {cell(plan, "price") ? (
                  <p className="mt-2 text-4xl text-primary">
                    {cell(plan, "price")}
                  </p>
                ) : null}
                {cell(plan, "note") ? (
                  <p className="mt-3 type-body text-ink">
                    {cell(plan, "note")}
                  </p>
                ) : null}
                {href && label ? (
                  <div className="mt-6">
                    <Button href={href} variant="primary" size="sm">
                      {label}
                    </Button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function FaqBlock({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: Record<string, unknown>[];
}) {
  const entries = items.filter((item) => cell(item, "question"));
  if (entries.length === 0) return null;
  return (
    <section className="bg-white py-16 md:py-20">
      <Container size="md">
        {eyebrow ? (
          <p className="type-eyebrow mb-3 text-primary">{eyebrow}</p>
        ) : null}
        {title ? (
          <Heading as="h2" size="h2" className="mb-8">
            {title}
          </Heading>
        ) : null}
        <div className="space-y-3">
          {entries.map((item, index) => (
            <details
              // biome-ignore lint/suspicious/noArrayIndexKey: FAQ order is stable
              key={`faq-${index}`}
              className="group rounded-2xl border border-ink/8 bg-sand/50 px-5 py-4"
            >
              <summary className="cursor-pointer type-display-sm text-ink">
                {cell(item, "question")}
              </summary>
              {cell(item, "answer") ? (
                <p className="mt-3 type-body text-ink">
                  {cell(item, "answer")}
                </p>
              ) : null}
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
