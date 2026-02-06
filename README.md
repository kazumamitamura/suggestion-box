# 目安箱（社内提案ポスト）

社内のご意見・ご提案を匿名で投稿できるWebアプリです。

## 画面構成

- **投稿者画面** (`/suggestion-box`): 投稿フォームと意見一覧、管理者からの返答を確認
- **管理者画面** (`/suggestion-box/admin`): 全投稿の管理、返答追加・編集、削除

## セットアップ

1. 依存関係のインストール

```bash
npm install
```

2. 環境変数の設定

- `.env.local.example` を `.env.local` にコピー
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
- `SUPABASE_SERVICE_ROLE_KEY` を設定（管理者の更新・削除用）
- `ADMIN_PASSWORD` を設定（管理者ログイン用パスワード）

3. Supabaseの設定

- [Supabase](https://supabase.com)でプロジェクトを作成
- `supabase_schema.sql` をSupabaseのSQLエディタで実行

4. 開発サーバー起動

```bash
npm run dev
```

- 投稿画面: `http://localhost:3000/suggestion-box`
- 管理者ログイン: `http://localhost:3000/suggestion-box/admin/login`
