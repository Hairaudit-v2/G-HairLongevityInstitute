// app/layout.tsx
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import StructuredData from "@/components/seo/StructuredData";
import { getMetadataBaseUrl } from "@/lib/seo/site";
import "./globals.css";

const defaultTitle = "Hair Longevity Institute™ | Biology First. Hair for Life.";
const defaultDescription =
  "Advanced hormone mapping, blood analysis, and regenerative hair strategy — delivered globally through our proprietary Follicle Intelligence™ system.";

// Default OG image. For best social previews (1200×630), add /public/brand/og-default.png and use "/brand/og-default.png" here.
const defaultOgImagePath = "/brand/hli-mark.png";

export const metadata: Metadata = {
  metadataBase: getMetadataBaseUrl(),
  title: defaultTitle,
  description: defaultDescription,
  icons: {
    icon: "/brand/hli-mark.png",
    apple: "/brand/hli-mark.png",
  },
  openGraph: {
    type: "website",
    siteName: "Hair Longevity Institute™",
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: defaultOgImagePath,
        width: 512,
        height: 512,
        alt: "Hair Longevity Institute",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [defaultOgImagePath],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <StructuredData />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
