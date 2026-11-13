/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD requires direct script injection for SEO crawlers. */

type Props = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * Serializes JSON-LD for a `<script>` tag. `<` is escaped so CMS text
 * containing `</script>` cannot break out of the tag.
 *
 * @param data - Structured data object(s)
 */
function serialize(data: Props["data"]): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/[\u2028\u2029]/g, (c) =>
      c === "\u2028" ? "\\u2028" : "\\u2029",
    );
}

export default function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}
