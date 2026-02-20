// app/api/admin/intakes/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { ok: false, error: "Server misconfigured." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const primaryConcern = searchParams.get("primary_concern") || "";
    const search = searchParams.get("search") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10) || 50, 100);
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10) || 0);

    const supabase = supabaseAdmin();

    let query = supabase
      .from("hli_intakes")
      .select("id, full_name, email, dob, sex, country, primary_concern, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (primaryConcern) {
      query = query.eq("primary_concern", primaryConcern);
    }

    if (search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`full_name.ilike.${term},email.ilike.${term}`);
    }

    const { data: intakes, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    if (!intakes?.length) {
      return NextResponse.json({
        ok: true,
        intakes: [],
        total: count ?? 0,
      });
    }

    const ids = intakes.map((i) => i.id);

    const { data: fileCounts } = await supabase
      .from("hli_intake_files")
      .select("intake_id, kind")
      .in("intake_id", ids);

    const countByIntake: Record<string, { blood: number; photo: number }> = {};
    for (const id of ids) {
      countByIntake[id] = { blood: 0, photo: 0 };
    }
    for (const f of fileCounts || []) {
      if (f.kind === "blood") countByIntake[f.intake_id].blood++;
      if (f.kind === "photo") countByIntake[f.intake_id].photo++;
    }

    const intakesWithFiles = intakes.map((i) => ({
      ...i,
      file_counts: countByIntake[i.id] || { blood: 0, photo: 0 },
    }));

    return NextResponse.json({
      ok: true,
      intakes: intakesWithFiles,
      total: count ?? 0,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unexpected error." },
      { status: 500 }
    );
  }
}
