"use client";

import { useRouter } from "next/navigation";
import { adminLogout } from "../actions";

export function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await adminLogout();
    router.push("/suggestion-box/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-slate-600 hover:text-slate-800"
    >
      ログアウト
    </button>
  );
}
