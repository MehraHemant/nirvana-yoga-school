/**
 * Shown as soon as an admin link is clicked, while that page's data loads.
 * The sidebar stays put; only the content area swaps to this placeholder.
 */
export default function AdminPageLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div
        className="admin-media-skeleton admin-media-skeleton--line"
        style={{ height: "1.75rem", width: "14rem" }}
      />
      <div
        className="admin-media-skeleton admin-media-skeleton--line admin-media-skeleton--short"
        style={{ marginTop: "0.75rem" }}
      />
      <div
        className="admin-media-skeleton admin-media-skeleton--line"
        style={{ marginTop: "1.5rem", height: "8rem" }}
      />
    </div>
  );
}
