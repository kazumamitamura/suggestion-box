/** 投稿カテゴリ（目安箱用） */
export const SUGGESTION_CATEGORIES = [
  "facility",
  "workflow",
  "welfare",
  "event",
  "other",
] as const;

export type CategoryId = (typeof SUGGESTION_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  facility: "施設・設備",
  workflow: "業務改善",
  welfare: "福利厚生",
  event: "イベント・交流",
  other: "その他",
};

export const CATEGORY_COLORS: Record<CategoryId, string> = {
  facility: "bg-blue-100 text-blue-800",
  workflow: "bg-emerald-100 text-emerald-800",
  welfare: "bg-amber-100 text-amber-800",
  event: "bg-violet-100 text-violet-800",
  other: "bg-slate-100 text-slate-700",
};
