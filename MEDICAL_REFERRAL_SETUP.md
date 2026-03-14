# Medical Referral Workflow (Australia)

## Overview

Doctor medical review for online prescribing support. Australia-only. Doctors make independent decisions (no auto-prescribing).

## 1. Run Migration

```bash
# Supabase CLI
supabase db push

# Or run the SQL in Supabase Dashboard → SQL Editor
# File: supabase/migrations/20250219100001_hli_medical_referrals.sql
```

## 2. Seed Doctors

```bash
# Via script (uses env vars)
node scripts/seed-doctors.mjs

# Or in Supabase SQL Editor: scripts/seed-doctors.sql
```

## 3. Local Run

```bash
npm run dev
```

- Admin: http://localhost:3001/admin → Doctors, Referrals
- Doctor portal: http://localhost:3001/doctor
- Auditor: http://localhost:3001/audits/[intakeId] → "Request Medical Review (AU)" (when report approved/released)

## 4. Flow

1. Auditor approves report → "Request Medical Review (AU)" appears
2. Admin assigns doctor in /admin/referrals
3. Doctor visits /doctor, selects identity, sees assigned cases
4. Doctor opens case, views PDF + files (signed URLs), submits decision: needs_more_info | approved | declined | completed

## 5. Security Notes

- Storage: private bucket, signed URLs server-side only
- Doctor access: session cookie (dev). Replace with Supabase Auth when wired
- No keys client-side; service-role only on server routes
