/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization enabled for Core Web Vitals. Set unoptimized: true if the host
  // does not support sharp (e.g. some serverless runtimes) or if optimization causes issues.
  images: {
    unoptimized: false,
  },
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "pdf-to-img", "tesseract.js", "pdfjs-dist", "@napi-rs/canvas", "sharp"],
  },
  /**
   * Retired v0 demo insight slugs (previously indexable). Permanent redirect preserves equity and bookmarks.
   */
  async redirects() {
    return [
      {
        source: "/insights/ferritin-hair-shedding-clinical-context",
        destination: "/insights/ferritin-and-hair-loss",
        permanent: true,
      },
      {
        source: "/insights/hair-loss-causes-biology-first-overview",
        destination: "/insights/what-blood-tests-matter-for-hair-loss",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
