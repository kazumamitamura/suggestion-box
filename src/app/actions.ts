"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type { Suggestion } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function createAdminSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY が必要です。");
  }
  return createAdminClient(supabaseUrl, supabaseServiceKey);
}

/** 投稿作成（user_id を保存） */
export async function createSuggestion(formData: FormData) {
  const content = formData.get("content") as string;
  const category = (formData.get("category") as string) || "other";

  if (!content?.trim()) {
    return { error: "ご意見を入力してください。" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "ログインしてください。" };
    }

    const { error } = await supabase.from("suggestions").insert({
      content: content.trim(),
      category: category || "other",
      user_id: user.id,
      author_name: null,
    });

    if (error) throw error;
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "投稿に失敗しました。しばらくおいて再度お試しください。" };
  }
}

/** タイムライン用：全員の投稿を取得 */
export async function getSuggestions(): Promise<Suggestion[]> {
  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("suggestions")
      .select("id, content, user_id, category, status, admin_response, admin_responded_at, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Suggestion[];
  } catch (e) {
    console.error(e);
    return [];
  }
}
