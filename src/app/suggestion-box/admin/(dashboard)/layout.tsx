import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin";
import Link from "next/link";
import { AdminLogoutButton } from "./AdminLogoutButton";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) {
    redirect("/suggestion-box/admin/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-slate-700">管理者画面</h2>
        <div className="flex items-center gap-4">
          <Link
            href="/suggestion-box"
            className="text-sm text-slate-600 hover:text-slate-800"
          >
            投稿画面へ
          </Link>
          <AdminLogoutButton />
        </div>
      </div>
      {children}
    </div>
  );
}
