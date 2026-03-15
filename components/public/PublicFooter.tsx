import Link from "next/link";
import { isLongevityPortalEnabled } from "@/lib/features";

export default function PublicFooter() {
  const showPortalLogin = isLongevityPortalEnabled();

  return (
    <footer className="border-t border-white/10 bg-black/10">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex items-center gap-4 sm:col-span-2 lg:col-span-1">
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
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Hair Intelligence Network
            </h3>
            <nav className="mt-3 flex flex-col gap-3 text-sm" aria-label="Hair Intelligence Network">
              <div>
                <Link href="/" className="font-medium text-white/75 transition hover:text-white/90">
                  Hair Longevity Institute
                </Link>
                <p className="mt-0.5 text-xs text-white/50">
                  Biological hair health optimisation and specialist review
                </p>
              </div>
              <div>
                <a
                  href="https://hairaudit.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-white/75 transition hover:text-white/90"
                >
                  HairAudit
                </a>
                <p className="mt-0.5 text-xs text-white/50">
                  Independent hair transplant auditing and transparency platform
                </p>
              </div>
              <div>
                <a
                  href="https://follicleintelligence.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-white/75 transition hover:text-white/90"
                >
                  Follicle Intelligence
                </a>
                <p className="mt-0.5 text-xs text-white/50">
                  Analysis engine for hair biology and surgical outcomes
                </p>
              </div>
            </nav>
          </div>
          {showPortalLogin && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Portal access
              </h3>
              <nav className="mt-3 flex flex-col gap-2 text-sm" aria-label="Portal access">
                <Link href="/login/patient" className="text-white/55 transition hover:text-white/80">
                  Patient Login
                </Link>
                <Link href="/login/trichologist" className="text-white/55 transition hover:text-white/80">
                  Trichologist Login
                </Link>
              </nav>
            </div>
          )}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Legal
            </h3>
            <nav className="mt-3 flex flex-wrap gap-6 text-sm" aria-label="Legal">
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
      </div>
    </footer>
  );
}
