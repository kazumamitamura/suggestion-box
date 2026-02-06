import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase環境変数が設定されていません。NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。"
    );
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

/** 管理者用：RLSをバイパスして更新・削除を実行 */
export function createAdminClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "管理者機能には SUPABASE_SERVICE_ROLE_KEY が必要です。"
    );
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}
