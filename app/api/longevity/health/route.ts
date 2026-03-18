import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, module: "longevity" });
}
