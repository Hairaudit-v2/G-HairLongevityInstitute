# Supabase Setup for Hair Longevity Institute

## 1. Storage Bucket (Required for file uploads)

To enable blood test and photo uploads, create the `hli-intakes` storage bucket in Supabase:

### Steps

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (the one matching your `NEXT_PUBLIC_SUPABASE_URL`)
3. Click **Storage** in the left sidebar
4. Click **New bucket**
5. Set **Name** to: `hli-intakes`
6. Leave **Public bucket** unchecked (private; access via service role)
7. Click **Create bucket**

### Storage policies (optional)

The app uses the **service role key**, which bypasses Row Level Security. The bucket should work as soon as it exists.

If uploads still fail, add a policy:

1. In Storage, click the `hli-intakes` bucket
2. Go to **Policies**
3. Click **New policy** → **For full customization**
4. Policy name: `Allow service role uploads`
5. Allowed operation: **INSERT** (and optionally SELECT for reads)
6. Target roles: `service_role`
7. USING expression: `true`
8. WITH CHECK expression: `true`

---

## 2. Tables (if not already created)

The intake API expects these tables:

### `hli_intakes`

```sql
create table hli_intakes (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  dob text not null,
  sex text not null,
  country text,
  primary_concern text not null,
  selections jsonb default '{}',
  notes text,
  created_at timestamptz default now()
);
```

### `hli_intake_files`

```sql
create table hli_intake_files (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references hli_intakes(id) on delete cascade,
  kind text not null check (kind in ('blood', 'photo', 'other')),
  filename text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz default now()
);
```

Run these in **SQL Editor** if the tables don't exist yet.

---

## 3. Longevity and Stripe billing migrations (order matters)

The Stripe billing migrations (`20260417000001_hli_stripe_entitlements.sql`, `20260418000001_hli_payment_hardening.sql`) **alter** `hli_longevity_profiles`. That table is **created** in `supabase/migrations/20250315000001_hli_longevity.sql`. If you run only the Stripe SQL in the Supabase SQL Editor on a new project, you will see:

`ERROR: relation "hli_longevity_profiles" does not exist`.

**Recommended:** apply the full migration history in timestamp order:

```bash
# From the repo root, with the project linked to your Supabase project
supabase link --project-ref <your-project-ref>
supabase db push
```

That runs every file under `supabase/migrations/` in order. The payment-hardening migration’s grandfather step also expects `hli_longevity_blood_requests.letter_document_id` (added in `20250316000006_hli_longevity_blood_request_eligibility.sql`).

If you cannot use the CLI, run the SQL files **in filename order** from `20250315000001` onward, at minimum through the migrations your app uses, **before** the `20260417` / `20260418` files.

---

## 4. AI Pipeline Tables (new)

Run the migration file to add the AI pipeline tables:

```bash
# If using Supabase CLI locally
supabase db push

# Or run the SQL manually in Supabase SQL Editor:
# supabase/migrations/20250219000001_hli_ai_pipeline.sql
```

This creates: `hli_ai_jobs`, `hli_ai_extractions`, `hli_ai_scores`, `hli_reports`, `hli_auditor_notes`, and optionally adds `latest_report_id` / `updated_at` to `hli_intakes`.

---

## 5. Running the AI Pipeline Locally

1. **Run migrations** (see above).
2. **Install dependencies**: `npm install`
3. **Start dev server**: `npm run dev`
4. **Submit an intake** at `/start` (or use an existing intake ID from admin).
5. **Trigger the pipeline**:
   - **Via admin UI**: Open `/admin`, select an intake, click **Run AI pipeline**
   - **Via API**:
     ```bash
     # Run pipeline (synchronous)
     curl -X POST "http://localhost:3000/api/dev/runPipeline?intakeId=YOUR_INTAKE_UUID"
     
     # Dry run (no DB writes, no PDF upload)
     curl -X POST "http://localhost:3000/api/dev/runPipeline?intakeId=YOUR_UUID" \
       -H "Content-Type: application/json" \
       -d '{"dryRun": true}'
     ```
6. **Review report**: Go to `/audits/[intakeId]`, view extracted markers/scores, approve, then release.

### Optional

- **Inngest**: For async processing, run the [Inngest dev server](https://www.inngest.com/docs) and configure `INNGEST_SIGNING_KEY`. Pipeline events go to `hli/ai.job.queued`.
- **Auto-queue**: Set `HLI_AUTO_QUEUE_AI=1` to auto-queue an AI job when an intake is submitted. Requires `HLI_APP_URL` (or `VERCEL_URL`) for the callback.
