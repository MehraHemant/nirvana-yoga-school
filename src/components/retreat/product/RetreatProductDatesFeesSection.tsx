"use client";

import RetreatSectionShell from "@/components/retreat/RetreatSectionShell";
import type {
  RetreatProductBatch,
  RetreatProductDatesContent,
} from "./retreatProductTypes";

const CARD_IDLE =
  "relative overflow-hidden rounded-2xl border border-black/40 bg-white transition-all duration-300 hover:border-primary/20";
const CARD_SELECTED =
  "relative overflow-hidden rounded-2xl border border-primary/40 bg-linear-to-br from-primary/18 via-primary/8 to-white";

/** One date button row: py-3.5 + single type-body line (~1.65lh). */
const DATE_ROW_HEIGHT = "3.625rem";
/** Matches `space-y-2.5` between list items. */
const DATE_LIST_ROW_GAP = "0.625rem";
/** Minimum scroll viewport: four visible date rows (gaps between rows only). */
const DATES_LIST_MIN_HEIGHT = `calc(4 * ${DATE_ROW_HEIGHT} + 3 * ${DATE_LIST_ROW_GAP})`;

/** Radial highlight overlay for the active selection card */
function SelectionGlow() {
  return (
    <span
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/20 via-primary/6 to-transparent"
      aria-hidden
    />
  );
}

/** Badge classes keyed by batch availability tone */
function batchStatusClass(tone: RetreatProductBatch["statusTone"]): string {
  switch (tone) {
    case "fast":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "last":
      return "text-rose-700 bg-rose-50 border-rose-200";
    default:
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
  }
}

type RetreatProductDatesFeesSectionProps = {
  content: RetreatProductDatesContent;
  selectedRoomId: string;
  selectedBatch: string;
  onSelectionChange: (selection: { roomId: string; batch: string }) => void;
};

/**
 * Selectable retreat dates and package cards — id `pricing`.
 *
 * @param content - Batches and packages from demo or CMS
 * @param selectedRoomId - Active package room id
 * @param selectedBatch - Active batch date label
 * @param onSelectionChange - Fired when room or batch changes
 */
export default function RetreatProductDatesFeesSection({
  content,
  selectedRoomId,
  selectedBatch,
  onSelectionChange,
}: RetreatProductDatesFeesSectionProps) {
  function selectRoom(roomId: string) {
    onSelectionChange({ roomId, batch: selectedBatch });
  }

  function selectBatch(batch: string) {
    onSelectionChange({ roomId: selectedRoomId, batch });
  }

  return (
    <RetreatSectionShell
      id="pricing"
      eyebrow={content.eyebrow}
      title={content.title}
      description={content.description}
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-10">
        {/* Dates column — min 4 rows visible; grows with packages column, then scrolls */}
        <div className="flex min-h-0 flex-col lg:h-0 lg:min-h-full">
          <h3 className="type-h4 mb-4 h-8 shrink-0 text-ink">Retreat dates</h3>
          <div
            className="scrollbar-thin-primary min-h-0 flex-1 overflow-y-auto overscroll-y-contain touch-pan-y pr-1"
            style={{ minHeight: DATES_LIST_MIN_HEIGHT }}
          >
            <ol className="space-y-2.5">
              {content.batches.map((batch) => {
                const selected = selectedBatch === batch.dates;
                return (
                  <li key={batch.dates}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => selectBatch(batch.dates)}
                      className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${selected ? CARD_SELECTED : CARD_IDLE}`}
                    >
                      {selected ? <SelectionGlow /> : null}
                      <span className="relative min-w-0 flex-1">
                        <span className="type-body block font-semibold text-ink">
                          {batch.dates}
                        </span>
                      </span>
                      <span
                        className={`relative type-eyebrow shrink-0 rounded-full border px-2.5 py-0.5 ${batchStatusClass(batch.statusTone)}`}
                      >
                        {batch.status}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div className="flex flex-col">
          <h3 className="type-h4 mb-4 h-8 text-ink">Retreat packages</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {content.packages.map((pkg) => {
              const selected = selectedRoomId === pkg.roomId;
              return (
                <button
                  key={pkg.roomId}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectRoom(pkg.roomId)}
                  className={`flex h-full w-full cursor-pointer flex-col p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${selected ? CARD_SELECTED : CARD_IDLE}`}
                >
                  {selected ? <SelectionGlow /> : null}
                  <h4 className="relative type-h4 text-ink">{pkg.roomType}</h4>
                  <p className="relative mt-1 text-sm text-ink/70">
                    {pkg.description}
                  </p>
                  <div className="relative mt-auto flex flex-wrap items-baseline gap-x-2 pt-3">
                    <span className="text-2xl font-semibold leading-[1.2] tracking-tight text-primary">
                      {pkg.price}
                    </span>
                    {pkg.originalPrice ? (
                      <span className="text-xs tabular-nums text-muted/50 line-through">
                        {pkg.originalPrice}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </RetreatSectionShell>
  );
}
