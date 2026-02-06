-- 目安箱（社内提案ポスト）用テーブル
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'open',
  admin_response TEXT,
  admin_responded_at TIMESTAMPTZ,
  category VARCHAR(50) DEFAULT 'other',
  poster_id UUID,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 既存テーブルへのカラム追加（マイグレーション用）
ALTER TABLE suggestions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open';
ALTER TABLE suggestions ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'other';
ALTER TABLE suggestions ADD COLUMN IF NOT EXISTS poster_id UUID;
ALTER TABLE suggestions ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE suggestions ADD COLUMN IF NOT EXISTS admin_response TEXT;
ALTER TABLE suggestions ADD COLUMN IF NOT EXISTS admin_responded_at TIMESTAMPTZ;

-- RLSポリシー（読み取り・挿入を許可）
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read" ON suggestions;
DROP POLICY IF EXISTS "Allow anonymous insert" ON suggestions;

CREATE POLICY "Allow anonymous read" ON suggestions
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert" ON suggestions
  FOR INSERT WITH CHECK (true);

-- 更新・削除は Supabase サービスロールキー（createAdminClient）で実行
