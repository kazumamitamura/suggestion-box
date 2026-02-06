export type Suggestion = {
  id: string;
  content: string;
  author_name: string | null;
  user_id: string | null;
  category: string;
  status?: string;
  admin_response?: string | null;
  admin_responded_at?: string | null;
  created_at: string;
};

export type CategoryId = "facility" | "workflow" | "efficiency" | "other";

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "facility", label: "設備修繕" },
  { id: "workflow", label: "授業アイデア" },
  { id: "efficiency", label: "業務効率化" },
  { id: "other", label: "その他" },
];

export const CATEGORY_COLORS: Record<CategoryId, string> = {
  facility: "bg-teal-100 text-teal-800",
  workflow: "bg-sky-100 text-sky-800",
  efficiency: "bg-indigo-100 text-indigo-800",
  other: "bg-slate-100 text-slate-700",
};
