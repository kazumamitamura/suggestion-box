"use client";

import { useEffect, useState, useMemo } from "react";
import {
  getAdminSuggestions,
  deleteSuggestion,
  updateAdminResponse,
  type Suggestion,
} from "../actions";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  SUGGESTION_CATEGORIES,
  type CategoryId,
} from "@/lib/categories";

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

type ViewMode = "list" | "byCategory" | "byAuthor";
type FilterCategory = "all" | CategoryId;

export default function AdminDashboardPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("all");

  useEffect(() => {
    loadSuggestions();
  }, []);

  async function loadSuggestions() {
    setLoading(true);
    const data = await getAdminSuggestions();
    setSuggestions(data);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    if (filterCategory === "all") return suggestions;
    return suggestions.filter((s) => (s.category || "other") === filterCategory);
  }, [suggestions, filterCategory]);

  const byCategory = useMemo(() => {
    const map: Record<string, Suggestion[]> = {};
    SUGGESTION_CATEGORIES.forEach((id) => {
      map[id] = filtered.filter((s) => (s.category || "other") === id);
    });
    return map;
  }, [filtered]);

  const byAuthor = useMemo(() => {
    const map: Record<string, Suggestion[]> = {};
    filtered.forEach((s) => {
      const key = s.author_name?.trim() || "匿名";
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, [filtered]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SUGGESTION_CATEGORIES.forEach((id) => {
      counts[id] = suggestions.filter((s) => (s.category || "other") === id).length;
    });
    return counts;
  }, [suggestions]);

  const maxCount = useMemo(() => {
    return Math.max(1, ...Object.values(categoryCounts));
  }, [categoryCounts]);

  const respondedCount = suggestions.filter((s) => s.status === "responded").length;

  async function handleDelete(id: string) {
    if (!confirm("この投稿を削除しますか？")) return;
    setSubmitting(true);
    await deleteSuggestion(id);
    setSubmitting(false);
    loadSuggestions();
  }

  async function handleSaveResponse(id: string) {
    setSubmitting(true);
    await updateAdminResponse(id, responseText);
    setSubmitting(false);
    setEditingId(null);
    setResponseText("");
    loadSuggestions();
  }

  function startEdit(s: Suggestion) {
    setEditingId(s.id);
    setResponseText(s.admin_response || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setResponseText("");
  }

  function SuggestionCard({ s }: { s: Suggestion }) {
    const cat = (s.category || "other") as CategoryId;
    return (
      <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[cat] ?? "bg-slate-100 text-slate-700"}`}>
            {CATEGORY_LABELS[cat] ?? s.category}
          </span>
          {s.status === "responded" && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-700">返答済み</span>
          )}
        </div>
        <p className="whitespace-pre-wrap text-slate-800">{s.content}</p>
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <span>{s.author_name || "匿名"}</span>
          <span>・</span>
          <time dateTime={s.created_at}>{formatDate(s.created_at)}</time>
        </div>
        {s.admin_response && (
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
            <p className="font-medium text-slate-600">管理者の返答</p>
            <p className="mt-1 whitespace-pre-wrap text-slate-700">{s.admin_response}</p>
            {s.admin_responded_at && (
              <p className="mt-1 text-xs text-slate-500">{formatDate(s.admin_responded_at)}</p>
            )}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {editingId === s.id ? (
            <>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={3}
                placeholder="返答を入力"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                disabled={submitting}
              />
              <button
                onClick={() => handleSaveResponse(s.id)}
                disabled={submitting}
                className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
              >
                保存
              </button>
              <button
                onClick={cancelEdit}
                disabled={submitting}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                キャンセル
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => startEdit(s)}
                disabled={submitting}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                {s.admin_response ? "返答を編集" : "返答を追加"}
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                disabled={submitting}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                削除
              </button>
            </>
          )}
        </div>
      </li>
    );
  }

  if (loading) {
    return <p className="text-slate-500">読み込み中…</p>;
  }

  return (
    <div className="space-y-8">
      {/* サマリーカード */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">総投稿数</p>
          <p className="mt-1 text-2xl font-semibold text-slate-800">{suggestions.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">返答済み</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">{respondedCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">未返答</p>
          <p className="mt-1 text-2xl font-semibold text-amber-600">{suggestions.length - respondedCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">送信者数</p>
          <p className="mt-1 text-2xl font-semibold text-slate-800">
            {new Set(suggestions.map((s) => s.author_name?.trim() || "匿名")).size}
          </p>
        </div>
      </div>

      {/* カテゴリ別グラフ */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-base font-medium text-slate-700">カテゴリ別 件数</h3>
        <div className="space-y-3">
          {SUGGESTION_CATEGORIES.map((id) => {
            const count = categoryCounts[id] ?? 0;
            const pct = maxCount ? (count / maxCount) * 100 : 0;
            return (
              <div key={id} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-slate-600">{CATEGORY_LABELS[id]}</span>
                <div className="min-w-0 flex-1">
                  <div className="h-6 overflow-hidden rounded bg-slate-100">
                    <div
                      className={`h-full rounded ${id === "facility" ? "bg-blue-500" : id === "workflow" ? "bg-emerald-500" : id === "welfare" ? "bg-amber-500" : id === "event" ? "bg-violet-500" : "bg-slate-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="w-8 shrink-0 text-right text-sm font-medium text-slate-700">{count}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* フィルター・表示切替 */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">カテゴリ:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          >
            <option value="all">すべて</option>
            {SUGGESTION_CATEGORIES.map((id) => (
              <option key={id} value={id}>
                {CATEGORY_LABELS[id]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">表示:</span>
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-lg px-3 py-1.5 text-sm ${viewMode === "list" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            一覧
          </button>
          <button
            onClick={() => setViewMode("byCategory")}
            className={`rounded-lg px-3 py-1.5 text-sm ${viewMode === "byCategory" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            カテゴリ別
          </button>
          <button
            onClick={() => setViewMode("byAuthor")}
            className={`rounded-lg px-3 py-1.5 text-sm ${viewMode === "byAuthor" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            送信者別
          </button>
        </div>
      </div>

      {/* 投稿一覧 */}
      {filtered.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          {filterCategory === "all" ? "まだ投稿はありません。" : "該当する投稿はありません。"}
        </p>
      ) : viewMode === "byCategory" ? (
        <div className="space-y-8">
          {SUGGESTION_CATEGORIES.map((id) => {
            const items = byCategory[id] || [];
            if (items.length === 0) return null;
            return (
              <section key={id}>
                <h3 className="mb-4 flex items-center gap-2 text-base font-medium text-slate-700">
                  <span className={`rounded px-2 py-0.5 text-sm ${CATEGORY_COLORS[id]}`}>
                    {CATEGORY_LABELS[id]}
                  </span>
                  <span className="text-slate-500">（{items.length}件）</span>
                </h3>
                <ul className="space-y-4">
                  {items.map((s) => (
                    <SuggestionCard key={s.id} s={s} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : viewMode === "byAuthor" ? (
        <div className="space-y-8">
          {byAuthor.map(([author, items]) => (
            <section key={author}>
              <h3 className="mb-4 text-base font-medium text-slate-700">
                {author} <span className="text-slate-500">（{items.length}件）</span>
              </h3>
              <ul className="space-y-4">
                {items.map((s) => (
                  <SuggestionCard key={s.id} s={s} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <ul className="space-y-4">
          {filtered.map((s) => (
            <SuggestionCard key={s.id} s={s} />
          ))}
        </ul>
      )}
    </div>
  );
}
