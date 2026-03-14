/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "pdf-to-img", "tesseract.js", "pdfjs-dist", "@napi-rs/canvas", "sharp"],
  },
};

module.exports = nextConfig;
