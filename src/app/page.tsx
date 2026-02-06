"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { createSuggestion, getSuggestions } from "./actions";
import type { Suggestion } from "@/types/database";
import { CATEGORIES, CATEGORY_COLORS, type CategoryId } from "@/types/database";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDisplayName(userId: string | null): string {
  if (!userId) return "匿名メンバー";
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
  }
  return Math.abs(hash) % 2 === 0 ? "Future Lab Researcher" : "匿名メンバー";
}

export default function FutureLabPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadSuggestions();
  }, []);

  async function loadSuggestions() {
    setLoading(true);
    const data = await getSuggestions();
    setSuggestions(data);
    setLoading(false);
  }

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    const result = await createSuggestion(formData);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setShowPostModal(false);
    loadSuggestions();
    (document.getElementById("post-form") as HTMLFormElement)?.reset();
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-xl font-semibold tracking-tight text-slate-700">Future Lab</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/suggestion-box/admin/login"
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              管理者
            </Link>
            <button
            onClick={handleLogout}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex justify-end">
          <button
            onClick={() => setShowPostModal(true)}
            className="rounded-2xl bg-teal-600 px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            ＋ アイデアを投稿
          </button>
        </div>

        <section>
          <h2 className="mb-4 text-lg font-medium text-slate-700">みんなの投稿</h2>
          {loading ? (
            <p className="py-12 text-center text-slate-500">読み込み中…</p>
          ) : suggestions.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <p className="text-slate-500">まだ投稿はありません。</p>
              <p className="mt-1 text-sm text-slate-400">最初のアイデアを投稿してみましょう。</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {suggestions.map((s) => (
                <li
                  key={s.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                        CATEGORY_COLORS[(s.category as CategoryId) ?? "other"] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {CATEGORIES.find((c) => c.id === s.category)?.label ?? s.category}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-slate-700">{s.content}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                    <span>{getDisplayName(s.user_id)}</span>
                    <span>・</span>
                    <time dateTime={s.created_at}>{formatDate(s.created_at)}</time>
                  </div>
                  {s.admin_response && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-medium text-slate-600">管理者からの返答</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{s.admin_response}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {showPostModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => !submitting && setShowPostModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-medium text-slate-700">アイデアを投稿</h3>
            <form id="post-form" action={handleSubmit} className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-600">カテゴリ</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <label
                      key={c.id}
                      className="cursor-pointer rounded-xl border-2 border-slate-200 px-4 py-2 text-sm transition has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50 has-[:checked]:text-teal-700 hover:border-slate-300"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={c.id}
                        defaultChecked={c.id === "other"}
                        className="sr-only"
                      />
                      {c.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="content" className="mb-1 block text-sm font-medium text-slate-600">
                  ご意見・アイデア
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={4}
                  required
                  placeholder="自由にご記入ください"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  disabled={submitting}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-700 disabled:opacity-60"
                >
                  {submitting ? "送信中…" : "投稿する"}
                </button>
                <button
                  type="button"
                  onClick={() => !submitting && setShowPostModal(false)}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
