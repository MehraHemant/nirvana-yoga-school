import Button from "./Button";

export default function MobileStickyBar() {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-ink/10 shadow-[0_-4px_24px_-8px_rgba(26,20,16,0.15)] px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <div className="type-eyebrow text-muted">200hr YTT from</div>
        <div className="font-serif text-lg leading-none text-ink">
          $649
          <span className="text-xs text-muted ml-1 font-sans">
            all-inclusive
          </span>
        </div>
      </div>
      <Button href="#courses" variant="primary" size="sm">
        Enquire
      </Button>
    </div>
  );
}
