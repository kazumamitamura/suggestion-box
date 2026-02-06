"use client";

import { useEffect, useState } from "react";
import {
  getAdminSuggestions,
  deleteSuggestion,
  updateAdminResponse,
  type Suggestion,
} from "../actions";

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

export default function AdminDashboardPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, []);

  async function loadSuggestions() {
    setLoading(true);
    const data = await getAdminSuggestions();
    setSuggestions(data);
    setLoading(false);
  }

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

  if (loading) {
    return <p className="text-slate-500">読み込み中…</p>;
  }

  if (suggestions.length === 0) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        まだ投稿はありません。
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {suggestions.map((s) => (
        <li
          key={s.id}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="whitespace-pre-wrap text-slate-800">{s.content}</p>
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <span>{s.author_name || "匿名"}</span>
            <span>・</span>
            <time dateTime={s.created_at}>{formatDate(s.created_at)}</time>
            {s.status === "responded" && (
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700">
                返答済み
              </span>
            )}
          </div>

          {s.admin_response && (
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
              <p className="font-medium text-slate-600">管理者の返答</p>
              <p className="mt-1 whitespace-pre-wrap text-slate-700">
                {s.admin_response}
              </p>
              {s.admin_responded_at && (
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(s.admin_responded_at)}
                </p>
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
      ))}
    </ul>
  );
}
