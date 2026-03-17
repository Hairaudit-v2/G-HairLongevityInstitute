// app/layout.tsx
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hair Longevity Institute™ | Biology First. Hair for Life.",
  description:
    "Advanced hormone mapping, blood analysis, and regenerative hair strategy — delivered globally through our proprietary Follicle Intelligence™ system.",
  icons: {
    icon: "/brand/hli-mark.png",
    apple: "/brand/hli-mark.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
