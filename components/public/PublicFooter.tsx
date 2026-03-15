import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/10">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <img
              src="/brand/hli-mark.png"
              alt="Hair Longevity Institute"
              width={44}
              height={44}
              className="h-11 w-11 opacity-90"
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
