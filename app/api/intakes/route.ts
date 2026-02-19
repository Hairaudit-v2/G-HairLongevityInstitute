// app/api/intakes/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_PDF_BYTES = 15 * 1024 * 1024; // 15 MB

function safeSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function isImage(file: File): boolean {
  return file.type.startsWith("image/");
}

function getMaxBytes(file: File): number {
  return isPdf(file) ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
}

function validateFileSize(file: File): { ok: true } | { ok: false; error: string } {
  const max = getMaxBytes(file);
  if (file.size <= max) return { ok: true };
  const limitMB = max === MAX_PDF_BYTES ? 15 : 5;
  const typeLabel = isPdf(file) ? "PDF" : "Image";
  return {
    ok: false,
    error: `${typeLabel} "${file.name}" exceeds ${limitMB} MB limit.`,
  };
}

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { ok: false, error: "Server misconfigured: missing Supabase env vars." },
        { status: 500 }
      );
    }

    const form = await req.formData();

    const full_name = String(form.get("full_name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const dob = String(form.get("dob") || "").trim(); // YYYY-MM-DD
    const sex = String(form.get("sex") || "").trim(); // male/female/other
    const country = String(form.get("country") || "").trim();
    const primary_concern = String(form.get("primary_concern") || "").trim();
    const selectionsRaw = String(form.get("selections") || "{}");
    const notes = String(form.get("notes") || "").trim();

    if (!full_name || !email || !dob || !sex || !primary_concern) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    let selections: any = {};
    try {
      selections = JSON.parse(selectionsRaw);
    } catch {
      selections = {};
    }

    const supabase = supabaseAdmin();

    // 1) Create intake
    const { data: intake, error: intakeErr } = await supabase
      .from("hli_intakes")
      .insert({
        full_name,
        email,
        dob,
        sex,
        country: country || null,
        primary_concern,
        selections,
        notes: notes || null,
      })
      .select("id")
      .single();

    if (intakeErr || !intake?.id) {
      return NextResponse.json(
        { ok: false, error: intakeErr?.message || "Failed to create intake." },
        { status: 500 }
      );
    }

    const intakeId = intake.id as string;

    // 2) Upload files (blood tests + photos) — optional; intake succeeds even if bucket is missing
    const bucket = "hli-intakes";
    const filesToSave: Array<{
      file: File;
      kind: "blood" | "photo" | "other";
    }> = [];

    // blood files (PDF or image: 15 MB for PDF, 5 MB for images)
    const blood = form.getAll("blood_files") as File[];
    for (const f of blood) {
      if (f && f.size) {
        const v = validateFileSize(f);
        if (!v.ok) {
          return NextResponse.json({ ok: false, error: v.error }, { status: 400 });
        }
        filesToSave.push({ file: f, kind: "blood" });
      }
    }

    // photo files (images only: 5 MB)
    const photos = form.getAll("photo_files") as File[];
    for (const f of photos) {
      if (f && f.size) {
        const v = validateFileSize(f);
        if (!v.ok) {
          return NextResponse.json({ ok: false, error: v.error }, { status: 400 });
        }
        filesToSave.push({ file: f, kind: "photo" });
      }
    }

    const fileRows: any[] = [];
    let uploadWarning: string | null = null;

    if (filesToSave.length > 0) {
      const now = new Date();
      const datePrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
        now.getDate()
      ).padStart(2, "0")}`;

      const nameSlug = safeSlug(full_name);
      const basePath = `intakes/${datePrefix}/${intakeId}-${nameSlug}`;

      for (const item of filesToSave) {
        const f = item.file;
        const ext = (f.name.split(".").pop() || "bin").toLowerCase();
        const safeName = safeSlug(f.name.replace(/\.[^/.]+$/, "")) || "file";
        const storagePath = `${basePath}/${item.kind}/${Date.now()}-${safeName}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(bucket)
          .upload(storagePath, f, {
            contentType: f.type || "application/octet-stream",
            upsert: false,
          });

        if (upErr) {
          uploadWarning = `File upload failed: ${upErr.message}. Create the "${bucket}" storage bucket in Supabase.`;
          break; // skip further uploads if bucket/config is wrong
        }

        fileRows.push({
          intake_id: intakeId,
          kind: item.kind,
          filename: f.name,
          storage_path: storagePath,
          mime_type: f.type || null,
          size_bytes: f.size,
        });
      }

      // 3) Save file metadata (only for successfully uploaded files)
      if (fileRows.length > 0) {
        const { error: filesErr } = await supabase.from("hli_intake_files").insert(fileRows);
        if (filesErr) {
          uploadWarning = uploadWarning || `Files uploaded but metadata save failed: ${filesErr.message}`;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      intakeId,
      ...(uploadWarning && { warning: uploadWarning }),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unexpected error." },
      { status: 500 }
    );
  }
}
