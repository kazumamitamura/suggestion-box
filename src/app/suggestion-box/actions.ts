"use server";

import { createServerClient } from "@/lib/supabase";
import { createAdminClient } from "@/lib/supabase";
import {
  verifyAdminPassword,
  setAdminSession,
  clearAdminSession,
  isAdminSession,
} from "@/lib/admin";
import { revalidatePath } from "next/cache";

export type Suggestion = {
  id: string;
  content: string;
  author_name: string | null;
  status?: string;
  admin_response?: string | null;
  admin_responded_at?: string | null;
  created_at: string;
};

// --- 投稿者用 ---

export async function createSuggestion(formData: FormData) {
  const content = formData.get("content") as string;
  const authorName = (formData.get("author_name") as string) || null;

  if (!content?.trim()) {
    return { error: "ご意見を入力してください。" };
  }

  try {
    const supabase = createServerClient();
    const { error } = await supabase.from("suggestions").insert({
      content: content.trim(),
      author_name: authorName?.trim() || null,
    });

    if (error) throw error;
    revalidatePath("/suggestion-box");
    revalidatePath("/suggestion-box/admin");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "投稿に失敗しました。しばらくおいて再度お試しください。" };
  }
}

export async function getSuggestions(): Promise<Suggestion[]> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("suggestions")
      .select("id, content, author_name, status, admin_response, admin_responded_at, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Suggestion[];
  } catch (e) {
    console.error(e);
    return [];
  }
}

// --- 管理者用 ---

export async function adminLogin(formData: FormData) {
  const password = formData.get("password") as string;
  if (!password?.trim()) {
    return { error: "パスワードを入力してください。" };
  }

  const valid = await verifyAdminPassword(password.trim());
  if (!valid) {
    return { error: "パスワードが正しくありません。" };
  }

  await setAdminSession();
  revalidatePath("/suggestion-box/admin");
  return { success: true };
}

export async function adminLogout() {
  await clearAdminSession();
  revalidatePath("/suggestion-box/admin");
  return { success: true };
}

export async function requireAdmin() {
  const ok = await isAdminSession();
  if (!ok) {
    throw new Error("管理者としてログインしてください。");
  }
}

export async function deleteSuggestion(id: string) {
  await requireAdmin();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("suggestions").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/suggestion-box");
    revalidatePath("/suggestion-box/admin");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "削除に失敗しました。" };
  }
}

export async function updateAdminResponse(id: string, adminResponse: string) {
  await requireAdmin();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("suggestions")
      .update({
        admin_response: adminResponse.trim() || null,
        admin_responded_at: adminResponse.trim() ? new Date().toISOString() : null,
        status: adminResponse.trim() ? "responded" : "open",
      })
      .eq("id", id);

    if (error) throw error;
    revalidatePath("/suggestion-box");
    revalidatePath("/suggestion-box/admin");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "返答の保存に失敗しました。" };
  }
}

export async function getAdminSuggestions(): Promise<Suggestion[]> {
  await requireAdmin();
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("suggestions")
      .select("id, content, author_name, status, admin_response, admin_responded_at, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Suggestion[];
  } catch (e) {
    console.error(e);
    return [];
  }
}
