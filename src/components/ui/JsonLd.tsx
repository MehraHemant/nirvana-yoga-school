/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD requires direct script injection for SEO crawlers. */

type Props = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export default function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
