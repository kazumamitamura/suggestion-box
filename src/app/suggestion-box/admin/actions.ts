"use server";

import { redirect } from "next/navigation";
import { clearAdminSession, isAdminSession } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase";
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

async function requireAdmin() {
  const ok = await isAdminSession();
  if (!ok) {
    throw new Error("管理者としてログインしてください。");
  }
}

export async function adminLogout() {
  await clearAdminSession();
  revalidatePath("/suggestion-box/admin");
  redirect("/suggestion-box/admin/login");
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

export async function updateAdminResponse(id: string, admin_comment: string) {
  await requireAdmin();
  const trimmed = admin_comment?.trim() || "";
  const status = trimmed ? "responded" : "open";
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("suggestions")
      .update({
        status,
        admin_response: trimmed || null,
        admin_responded_at: trimmed ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (error) throw error;
    revalidatePath("/suggestion-box");
    revalidatePath("/suggestion-box/admin");
  } catch (e) {
    console.error(e);
    throw new Error("返答の保存に失敗しました。");
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
  } catch (e) {
    console.error(e);
    throw new Error("削除に失敗しました。");
  }
}
