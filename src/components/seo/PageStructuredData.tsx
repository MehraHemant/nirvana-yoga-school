import JsonLd from "@/components/ui/JsonLd";
import { resolvePageFaqs } from "@/content/repositories/faqs";
import { getPageSeo, getPageSeoContext } from "@/content/repositories/page-seo";
import { publicPathForPage } from "@/lib/cms/cache";
import { absoluteUrl, htmlToText } from "@/lib/seo/site";
import {
  breadcrumbNode,
  faqNode,
  programNode,
  SECTION_BY_TYPE,
  WEBSITE_ID,
} from "@/lib/seo/structured-data";

type Props = {
  /** CMS page slug */
  slug: string;
  /** FAQs already loaded by the page (skips a second FAQ lookup) */
  faqs?: { question: string; answer: string }[];
};

/**
 * JSON-LD for a CMS page: WebPage + BreadcrumbList, plus Course / TouristTrip
 * for programs and FAQPage when the page has FAQs. Renders nothing when the
 * page row cannot be loaded.
 *
 * @param props - Page slug and optional preloaded FAQs
 */
export default async function PageStructuredData({ slug, faqs }: Props) {
  const [page, seo] = await Promise.all([
    getPageSeoContext(slug),
    getPageSeo(slug).catch(() => null),
  ]);
  if (!page) return null;

  const path = publicPathForPage(slug, page.type);
  const url = absoluteUrl(path);
  const title = seo?.title || page.title || slug;
  const name = page.title || title;
  const description = htmlToText(seo?.description || page.description || "");

  const pageFaqs =
    faqs ??
    (await resolvePageFaqs(slug)
      .then((r) => r.data)
      .catch(() => []));

  const section = SECTION_BY_TYPE[page.type];
  const crumbs =
    path === "/"
      ? null
      : breadcrumbNode([
          ...(section && section.path !== path ? [section] : []),
          { name, path },
        ]);

  const program = programNode(page, url, name, description);
  const faq = faqNode(pageFaqs);

  const graph = [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      ...(description ? { description } : {}),
      isPartOf: { "@id": WEBSITE_ID },
      inLanguage: "en",
      ...(page.updatedAt ? { dateModified: page.updatedAt } : {}),
      ...(program ? { mainEntity: { "@id": program["@id"] } } : {}),
    },
    ...(crumbs ? [crumbs] : []),
    ...(program ? [program] : []),
    ...(faq ? [faq] : []),
  ];

  return (
    <JsonLd data={{ "@context": "https://schema.org", "@graph": graph }} />
  );
}
