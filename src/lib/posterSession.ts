import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const POSTER_COOKIE = "suggestion_poster_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1年

/** 投稿者用の識別子を取得。なければ新規発行してCookieに保存 */
export async function getPosterId(): Promise<string> {
  const cookieStore = await cookies();
  let id = cookieStore.get(POSTER_COOKIE)?.value;

  if (!id) {
    id = randomUUID();
    cookieStore.set(POSTER_COOKIE, id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  }

  return id;
}
