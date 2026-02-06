# Future Lab | 教員向け提案プラットフォーム

教員向けの未来志向な提案プラットフォームです。

## 画面構成

- **トップ** (`/`): タイムライン（みんなの投稿）＋ 投稿ボタン（要ログイン）
- **ログイン** (`/login`): メールアドレス／パスワード認証
- **新規登録** (`/login/signup`): アカウント作成
- **管理者** (`/suggestion-box/admin`): 全投稿の管理、返答・削除

## セットアップ

1. 依存関係のインストール

```bash
npm install
```

2. 環境変数の設定

- `.env.local.example` を `.env.local` にコピー
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
- `SUPABASE_SERVICE_ROLE_KEY` を設定（管理者用・タイムライン取得用）
- `ADMIN_PASSWORD` を設定（管理者ログイン用パスワード）

3. Supabase の設定

- [Supabase](https://supabase.com) でプロジェクトを作成
- Authentication → Providers で **Email** を有効化
- SQL エディタで `supabase_schema.sql` を実行
- 必要に応じて `user_id` カラムを追加:  
  `ALTER TABLE suggestions ADD COLUMN IF NOT EXISTS user_id UUID;`

4. 開発サーバー起動

```bash
npm run dev
```

- トップ: `http://localhost:3000`
- ログイン: `http://localhost:3000/login`
- 管理者: `http://localhost:3000/suggestion-box/admin/login`
