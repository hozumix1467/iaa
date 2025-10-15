/*
  # スマホ使用時間追跡テーブルの作成

  1. 新しいテーブル
    - `phone_usage`
      - `id` (uuid, primary key) - レコードの一意識別子
      - `date` (date, not null) - 使用日
      - `hours` (decimal, not null) - 使用時間（時間単位）
      - `created_at` (timestamptz) - レコード作成日時
      - `updated_at` (timestamptz) - レコード更新日時

  2. セキュリティ
    - `phone_usage`テーブルでRLSを有効化
    - 全てのユーザーが自分のデータを閲覧できるポリシーを追加
    - 全てのユーザーが新しい使用記録を挿入できるポリシーを追加
    - 全てのユーザーが自分のデータを更新できるポリシーを追加
    - 全てのユーザーが自分のデータを削除できるポリシーを追加

  3. インデックス
    - `date`カラムにインデックスを作成してクエリパフォーマンスを向上

  4. 重要な注意事項
    - このアプリは認証なしで動作するため、RLSポリシーは全ユーザーにアクセスを許可します
    - プロダクション環境では認証を追加することを推奨します
*/

CREATE TABLE IF NOT EXISTS phone_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  hours decimal(5,2) NOT NULL DEFAULT 0 CHECK (hours >= 0 AND hours <= 24),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE phone_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view usage data"
  ON phone_usage
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert usage data"
  ON phone_usage
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update usage data"
  ON phone_usage
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete usage data"
  ON phone_usage
  FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_phone_usage_date ON phone_usage(date DESC);