import { cookies } from "next/headers";
import { createHash } from "crypto";

const ADMIN_COOKIE = "suggestion_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24時間

function getExpectedToken(): string | null {
  const secret = process.env.ADMIN_PASSWORD?.trim();
  if (!secret) return null;
  return createHash("sha256")
    .update(secret + "suggestion_admin_salt")
    .digest("hex");
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) return false;
  return password.trim() === expected;
}

export async function setAdminSession(): Promise<void> {
  const token = getExpectedToken();
  if (!token) throw new Error("ADMIN_PASSWORD が設定されていません。");
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export async function isAdminSession(): Promise<boolean> {
  try {
    const expected = getExpectedToken();
    if (!expected) return false;
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value;
    return token === expected;
  } catch {
    return false;
  }
}
