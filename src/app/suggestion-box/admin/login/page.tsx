"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminLogin } from "../../actions";

export default function AdminLoginPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    const result = await adminLogin(formData);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/suggestion-box/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-slate-800">管理者ログイン</h2>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-slate-600">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="管理者パスワード"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              disabled={submitting}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? "ログイン中…" : "ログイン"}
          </button>
        </form>
        <p className="mt-4 text-center">
          <Link
            href="/suggestion-box"
            className="text-sm text-slate-600 hover:text-slate-800"
          >
            ← 投稿画面に戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
