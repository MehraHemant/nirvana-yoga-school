import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/lib/seo/site";

/** Private or transactional areas that should never be crawled. */
const PRIVATE_PATHS = [
  "/admin",
  "/api/",
  "/account",
  "/login",
  "/signup",
  "/quiz",
];

/**
 * AI search and assistant crawlers. Allowing them explicitly lets ChatGPT,
 * Claude, Perplexity, Gemini, Copilot and others read and cite the site.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "DuckAssistBot",
  "Meta-ExternalAgent",
  "MistralAI-User",
  "cohere-ai",
  "YouBot",
  "Amazonbot",
  "CCBot",
];

/**
 * robots.txt — open to search engines and AI assistants, closed for admin,
 * API, and account routes; points crawlers at the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: PRIVATE_PATHS },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
