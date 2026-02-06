"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSuggestion, getSuggestions, type Suggestion } from "./actions";

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

export default function SuggestionBoxPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSuggestions().then((data) => {
      setSuggestions(data);
      setLoading(false);
    });
  }, []);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    const result = await createSuggestion(formData);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    const updated = await getSuggestions();
    setSuggestions(updated);
    const form = document.getElementById("suggestion-form") as HTMLFormElement;
    form?.reset();
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-end">
        <Link
          href="/suggestion-box/admin/login"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          管理者はこちら →
        </Link>
      </div>
      <section>
        <h2 className="mb-4 text-base font-medium text-slate-700">投稿フォーム</h2>
        <form
          id="suggestion-form"
          action={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="content" className="mb-1 block text-sm text-slate-600">
                ご意見・ご提案
              </label>
              <textarea
                id="content"
                name="content"
                rows={4}
                required
                placeholder="自由にご記入ください"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                disabled={submitting}
              />
            </div>
            <div>
              <label htmlFor="author_name" className="mb-1 block text-sm text-slate-600">
                お名前（任意）
              </label>
              <input
                id="author_name"
                name="author_name"
                type="text"
                placeholder="匿名可"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                disabled={submitting}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? "送信中…" : "投稿する"}
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-base font-medium text-slate-700">意見一覧</h2>
        {loading ? (
          <p className="text-slate-500">読み込み中…</p>
        ) : suggestions.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            まだ投稿はありません。最初のご意見をお寄せください。
          </p>
        ) : (
          <ul className="space-y-4">
            {suggestions.map((s) => (
              <li
                key={s.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="whitespace-pre-wrap text-slate-800">{s.content}</p>
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <span>{s.author_name || "匿名"}</span>
                  <span>・</span>
                  <time dateTime={s.created_at}>{formatDate(s.created_at)}</time>
                </div>
                {s.admin_response && (
                  <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
                    <p className="font-medium text-slate-600">管理者からの返答</p>
                    <p className="mt-1 whitespace-pre-wrap text-slate-700">
                      {s.admin_response}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
