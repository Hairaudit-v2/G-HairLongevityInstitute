/**
 * Full case bundle for doctor: intake, report link (signed), file links (signed), notes.
 * No raw storage paths exposed.
 */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getDoctorIdFromRequest } from "@/lib/doctorAuth";

export const dynamic = "force-dynamic";

const BUCKET = "hli-intakes";
const FILE_URL_TTL = 3600; // 1h

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ referralId: string }> }
) {
  try {
    const doctorId = await getDoctorIdFromRequest();
    if (!doctorId) {
      return NextResponse.json({ ok: false, error: "Doctor session required." }, { status: 401 });
    }

    const { referralId } = await params;
    if (!referralId) {
      return NextResponse.json({ ok: false, error: "Missing referralId." }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    const { data: ref, error: refErr } = await supabase
      .from("hli_medical_referrals")
      .select("*")
      .eq("id", referralId)
      .eq("assigned_doctor_id", doctorId)
      .single();

    if (refErr || !ref) {
      return NextResponse.json({ ok: false, error: "Referral not found or not assigned to you." }, { status: 404 });
    }

    if (ref.status === "assigned") {
      await supabase
        .from("hli_medical_referrals")
        .update({ status: "in_review", updated_at: new Date().toISOString() })
        .eq("id", referralId);
    }

    const { data: intake } = await supabase
      .from("hli_intakes")
      .select("*")
      .eq("id", ref.intake_id)
      .single();

    const { data: bloodExt } = await supabase
      .from("hli_ai_extractions")
      .select("payload")
      .eq("intake_id", ref.intake_id)
      .eq("type", "blood")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: imageExts } = await supabase
      .from("hli_ai_extractions")
      .select("payload")
      .eq("intake_id", ref.intake_id)
      .eq("type", "image")
      .order("created_at", { ascending: true });

    const { data: scores } = await supabase
      .from("hli_ai_scores")
      .select("*")
      .eq("intake_id", ref.intake_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let reportSignedUrl: string | null = null;
    if (ref.report_id) {
      const { data: rep } = await supabase.from("hli_reports").select("storage_path").eq("id", ref.report_id).single();
      if (rep?.storage_path) {
        const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(rep.storage_path, FILE_URL_TTL);
        reportSignedUrl = signed?.signedUrl ?? null;
      }
    }
    if (!reportSignedUrl) {
      const reportIdToTry = (intake as { latest_report_id?: string })?.latest_report_id;
      if (reportIdToTry) {
        const { data: rep } = await supabase
          .from("hli_reports")
          .select("storage_path")
          .eq("id", reportIdToTry)
          .single();
        if (rep?.storage_path) {
          const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(rep.storage_path, FILE_URL_TTL);
          reportSignedUrl = signed?.signedUrl ?? null;
        }
      }
      if (!reportSignedUrl) {
        const { data: latest } = await supabase
          .from("hli_reports")
          .select("storage_path")
          .eq("intake_id", ref.intake_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (latest?.storage_path) {
          const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(latest.storage_path, FILE_URL_TTL);
          reportSignedUrl = signed?.signedUrl ?? null;
        }
      }
    }

    const { data: files } = await supabase
      .from("hli_intake_files")
      .select("id, kind, filename, storage_path")
      .eq("intake_id", ref.intake_id);

    const fileUrlPromises = (files ?? []).map(async (f: { id: string; kind: string; filename: string; storage_path?: string }) => {
      if (!f.storage_path) return null;
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(f.storage_path, FILE_URL_TTL);
      if (!signed?.signedUrl) return null;
      return { id: f.id, kind: f.kind, filename: f.filename, signed_url: signed.signedUrl };
    });
    const fileUrlResults = (await Promise.all(fileUrlPromises)).filter(Boolean) as Array<{
      id: string;
      kind: string;
      filename: string;
      signed_url: string;
    }>;

    const { data: notes } = await supabase
      .from("hli_medical_notes")
      .select("*")
      .eq("referral_id", referralId)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      ok: true,
      referral: {
        id: ref.id,
        status: ref.status,
        reason: ref.reason,
        decision_payload: ref.decision_payload,
      },
      intake: intake ?? null,
      bloodMarkers: bloodExt?.payload?.markers ?? [],
      imageSignals: (imageExts ?? []).map((e) => e.payload),
      scores: scores ?? null,
      reportSignedUrl,
      files: fileUrlResults,
      notes: notes ?? [],
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
