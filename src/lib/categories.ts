/** 投稿カテゴリ（Future Lab / 管理者用） */
export const SUGGESTION_CATEGORIES = [
  "facility",
  "workflow",
  "efficiency",
  "welfare",
  "event",
  "other",
] as const;

export type CategoryId = (typeof SUGGESTION_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<string, string> = {
  facility: "設備修繕",
  workflow: "授業アイデア",
  efficiency: "業務効率化",
  welfare: "福利厚生",
  event: "イベント・交流",
  other: "その他",
};

export const CATEGORY_COLORS: Record<string, string> = {
  facility: "bg-teal-100 text-teal-800",
  workflow: "bg-sky-100 text-sky-800",
  efficiency: "bg-indigo-100 text-indigo-800",
  welfare: "bg-amber-100 text-amber-800",
  event: "bg-violet-100 text-violet-800",
  other: "bg-slate-100 text-slate-700",
};
