import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";

export const dynamic = "force-dynamic";

export async function GET() {
  const ok = isLongevityApiEnabled();
  const raw = process.env.HLI_ENABLE_LONGEVITY_API ?? null;
  if (!ok) {
    return NextResponse.json({ ok, error: "Longevity API is disabled.", raw }, { status: 404 });
  }
  return NextResponse.json({ ok, module: "longevity", raw });
}
