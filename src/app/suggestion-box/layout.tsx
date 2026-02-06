export default function SuggestionBoxLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
          <h1 className="text-xl font-medium text-slate-800 tracking-wide">
            目安箱（社内提案ポスト）
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
