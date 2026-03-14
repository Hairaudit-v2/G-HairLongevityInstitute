#!/usr/bin/env node
/**
 * Seed 3 AU doctors via Supabase REST API.
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Run: node scripts/seed-doctors.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const doctors = [
  { full_name: "Dr. Sarah Chen", email: "sarah.chen@hli.example.au", country: "AU", license_number: "MED123456", registration_body: "AHPRA", active: true },
  { full_name: "Dr. James Wilson", email: "james.wilson@hli.example.au", country: "AU", license_number: "MED234567", registration_body: "AHPRA", active: true },
  { full_name: "Dr. Emma Taylor", email: "emma.taylor@hli.example.au", country: "AU", license_number: "MED345678", registration_body: "AHPRA", active: true },
];

async function main() {
  for (const d of doctors) {
    const { data, error } = await supabase
      .from("hli_doctors")
      .upsert(d, { onConflict: "email" })
      .select("id, full_name, email")
      .single();
    if (error) {
      console.warn(`Failed to upsert ${d.email}:`, error.message);
    } else {
      console.log("Added:", data.full_name, data.email);
    }
  }
  console.log("Done.");
}

main();
