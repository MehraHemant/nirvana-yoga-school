import Button from "./Button";

export default function MobileStickyBar() {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-ink/10 shadow-[0_-4px_24px_-8px_rgba(26,20,16,0.15)] px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
      <div className="flex flex-col min-w-0">
        <div className="type-eyebrow text-ink">200hr YTT from</div>
        <div className="text-base sm:text-lg font-semibold leading-none text-ink">
          $649
          <span className="type-eyebrow ml-1 text-ink">
            all-inclusive
          </span>
        </div>
      </div>
      <Button href="/enquire-now" variant="primary" size="sm" responsive>
        Enquire
      </Button>
    </div>
  );
}
