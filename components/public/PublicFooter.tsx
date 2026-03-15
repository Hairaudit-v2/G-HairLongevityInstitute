import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/10">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <img
              src="/brand/hli-mark.png"
              alt=""
              width={64}
              height={64}
              className="h-14 w-14 shrink-0 object-contain opacity-95 sm:h-16 sm:w-16"
              style={{ imageRendering: "auto" }}
            />
            <span className="text-sm text-white/55">
              © {new Date().getFullYear()} Hair Longevity Institute™
            </span>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm" aria-label="Legal">
            <Link href="/privacy" className="text-white/55 transition hover:text-white/80">
              Privacy
            </Link>
            <Link href="/terms" className="text-white/55 transition hover:text-white/80">
              Terms
            </Link>
            <Link href="/disclaimer" className="text-white/55 transition hover:text-white/80">
              Disclaimer
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
