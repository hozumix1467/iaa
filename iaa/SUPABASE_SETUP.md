# Supabase セットアップガイド

## 問題の説明

コンソールに以下のエラーが発生している場合：
```
Failed to load resource: the server responded with a status of 404 ()
zjkvemoquwzcjmyatlty.supabase.co/rest/v1/reflections?select=*&date=eq.2025-10-05:1
```

これは、`reflections`テーブルがSupabaseデータベースに存在しないために発生しています。

## 解決方法

### 1. Supabase CLIのインストール

```bash
npm install -g supabase
```

### 2. Supabaseプロジェクトへのログイン

```bash
supabase login
```

### 3. プロジェクトのリンク

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

プロジェクトのREFは、SupabaseダッシュボードのURLから取得できます：
`https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

### 4. マイグレーションの実行

```bash
supabase db push
```

または、個別にマイグレーションを実行する場合：

```bash
supabase migration up
```

### 5. 手動でSQLを実行する場合

SupabaseダッシュボードのSQL Editorで以下のSQLを実行：

```sql
-- Create reflections table for daily memo/journaling
CREATE TABLE IF NOT EXISTS reflections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one reflection per user per date
    UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reflections_user_date ON reflections(user_id, date);
CREATE INDEX IF NOT EXISTS idx_reflections_date ON reflections(date);

-- Enable Row Level Security
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own reflections" ON reflections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reflections" ON reflections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflections" ON reflections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reflections" ON reflections
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_reflections_updated_at 
    BEFORE UPDATE ON reflections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## 確認方法

### 1. テーブルの存在確認

SupabaseダッシュボードのTable Editorで`reflections`テーブルが表示されることを確認してください。

### 2. アプリでの動作確認

1. アプリを再起動
2. ホームページでカレンダーの日付を選択
3. メモ機能が正常に動作することを確認

## トラブルシューティング

### エラーコードの説明

- **PGRST116**: データが見つからない（正常な場合）
- **42P01**: テーブルが存在しない
- **404**: リソースが見つからない

### よくある問題

1. **マイグレーションが実行されていない**
   - `supabase db push`を実行

2. **RLS（Row Level Security）が有効になっていない**
   - 手動でSQLを実行してテーブルを作成

3. **認証設定の問題**
   - Supabaseの認証設定を確認

## 今後の開発

### 新しいマイグレーションの作成

```bash
supabase migration new your_migration_name
```

### ローカル開発環境のセットアップ

```bash
supabase start
```

これで、ローカルでSupabaseを実行して開発できます。

## サポート

問題が解決しない場合は、以下を確認してください：

1. Supabaseプロジェクトの設定
2. ネットワーク接続
3. 認証設定
4. RLSポリシーの設定
