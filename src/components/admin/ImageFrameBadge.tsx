import { describeImageFrame } from "@/lib/cdn/image-frame";

type ImageFrameBadgeProps = {
  width?: number | null;
  height?: number | null;
  /** Include the pixel size next to the ratio */
  showDimensions?: boolean;
};

/**
 * Orientation tag and aspect ratio for an uploaded image.
 * Renders nothing when pixel dimensions are not known yet.
 *
 * @param props - Pixel size and whether to show the raw dimensions
 */
export function ImageFrameBadge({
  width,
  height,
  showDimensions = false,
}: ImageFrameBadgeProps) {
  const frame = describeImageFrame(width, height);
  if (!frame) return null;

  const pixels = `${frame.width}×${frame.height}`;

  return (
    <div className="admin-media-frame">
      <span className="admin-status-chip">{frame.label}</span>
      <span className="admin-media-frame__ratio" title={pixels}>
        {frame.ratio}
        {showDimensions ? ` · ${pixels}` : ""}
      </span>
    </div>
  );
}
