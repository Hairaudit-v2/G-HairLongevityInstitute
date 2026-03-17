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
};

module.exports = nextConfig;
