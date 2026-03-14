/**
 * Doctor session for portal access.
 * TODO: Replace with Supabase Auth when wired. Doctors matched by email -> hli_doctors.
 */
import { cookies } from "next/headers";

const COOKIE_NAME = "hli_doctor_id";

export async function setDoctorSession(doctorId: string): Promise<void> {
  const c = await cookies();
  c.set(COOKIE_NAME, doctorId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24h
    path: "/",
  });
}

export async function clearDoctorSession(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

export async function getDoctorIdFromRequest(): Promise<string | null> {
  const c = await cookies();
  const v = c.get(COOKIE_NAME)?.value;
  return v && /^[0-9a-f-]{36}$/i.test(v) ? v : null;
}
