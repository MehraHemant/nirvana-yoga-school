/**
 * Hostname for `next/image` remotePatterns when Cloudinary is configured.
 */
export function cdnPublicHostname(): string | null {
  return process.env.CLOUDINARY_CLOUD_NAME ? "res.cloudinary.com" : null;
}
