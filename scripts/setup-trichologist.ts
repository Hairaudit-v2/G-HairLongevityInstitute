/**
 * One-off setup: ensure trichologist auth user and hli_longevity_trichologists row exist.
 * Idempotent. Run with: npx tsx scripts/setup-trichologist.ts
 * Optional: TRICHOLOGIST_INITIAL_PASSWORD for new user creation (otherwise a random one is generated and printed).
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (from .env.local if present)
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load .env.local when run from project root so env vars are available
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf8");
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    if (key && !process.env[key]) process.env[key] = val;
  }
}

const TRICHOLOGIST_EMAIL = "trichologist@evolvedhair.com.au";
const DISPLAY_NAME = "Trichologist";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1) Resolve auth user by email (listUsers and find)
  let authUserId: string | null = null;
  const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const users = listData?.users ?? [];
  const existing = users.find((u) => (u.email ?? "").toLowerCase() === TRICHOLOGIST_EMAIL.toLowerCase());
  if (existing) {
    authUserId = existing.id;
    console.log("Found existing auth user:", existing.id, existing.email);
  } else {
    const password =
      process.env.TRICHOLOGIST_INITIAL_PASSWORD ||
      `Tmp${Math.random().toString(36).slice(2, 14)}!`;
    const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
      email: TRICHOLOGIST_EMAIL,
      password,
      email_confirm: true,
    });
    if (createErr) {
      console.error("Failed to create auth user:", createErr.message);
      process.exit(1);
    }
    authUserId = createData.user?.id ?? null;
    if (!authUserId) {
      console.error("Create user returned no id");
      process.exit(1);
    }
    console.log("Created auth user:", authUserId);
    if (!process.env.TRICHOLOGIST_INITIAL_PASSWORD) {
      console.log("Initial password (change on first sign-in):", password);
    }
  }

  if (!authUserId) {
    console.error("No auth user id");
    process.exit(1);
  }

  // 2) Ensure hli_longevity_trichologists row (idempotent: by auth_user_id)
  const { data: existingRow } = await supabase
    .from("hli_longevity_trichologists")
    .select("id, email, display_name")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (existingRow) {
    console.log("Trichologist row already exists:", existingRow.id, existingRow.email);
    return;
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("hli_longevity_trichologists")
    .insert({
      auth_user_id: authUserId,
      email: TRICHOLOGIST_EMAIL,
      display_name: DISPLAY_NAME,
      is_active: true,
    })
    .select("id, email")
    .single();

  if (insertErr) {
    console.error("Failed to insert trichologist row:", insertErr.message);
    process.exit(1);
  }
  console.log("Inserted trichologist row:", inserted.id, inserted.email);
  console.log("Done. Sign in at /portal/login with", TRICHOLOGIST_EMAIL);
}

main();
