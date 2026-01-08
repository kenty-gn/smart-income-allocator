# Supabase セットアップガイド

## 1. 環境変数の設定

`.env.local` ファイルをプロジェクトルートに作成し、以下の内容を設定してください：

```bash
# Supabase Dashboard → Settings → API から取得
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 2. データベースマイグレーションの実行

Supabase Dashboard → SQL Editor で以下のファイルを**順番に**実行してください：

1. `supabase/migrations/001_initial_schema.sql` - テーブル作成
2. `supabase/migrations/002_seed_data.sql` - デフォルトカテゴリ作成

## 3. 認証設定

Supabase Dashboard → Authentication → Providers で必要な認証プロバイダーを有効化：

- [x] Email (デフォルト有効)
- [ ] Google (オプション)
- [ ] GitHub (オプション)

## 4. 動作確認

```bash
npm run dev
```

ブラウザでアプリにアクセスし、認証とデータ操作が動作することを確認してください。
