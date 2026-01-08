# Smart Income Allocator - 開発ダッシュボード

## 📊 プロジェクト概要

**Smart Income Allocator** は、収入に対する予算配分を視覚化し、支出を追跡するモバイルファーストの家計管理アプリです。

---

## 🚀 クイックスタート

```bash
# 開発サーバー起動
npm run dev

# ビルド確認
npm run build

# lint実行
npm run lint
```

---

## 📁 ドキュメント一覧

| ファイル | 説明 |
|---------|------|
| [TASK.md](./TASK.md) | 開発タスクリスト（チェックリスト形式） |
| [SPECIFICATION.md](./SPECIFICATION.md) | 技術仕様・アーキテクチャ |
| [../SUPABASE_SETUP.md](../SUPABASE_SETUP.md) | Supabaseセットアップ手順 |

---

## 📈 進捗状況

| フェーズ | 状態 | 完了率 |
|---------|------|--------|
| フェーズ1: 認証連携 | 🔄 進行中 | 75% |
| フェーズ2: DB連携 | ⏳ 未着手 | 0% |
| フェーズ3: 機能強化 | ⏳ 未着手 | 0% |
| フェーズ4: AI機能 | ⏳ 未着手 | 0% |

---

## 🔑 重要ファイル

### 認証関連
- `app/login/page.tsx` - ログイン画面
- `contexts/AuthContext.tsx` - 認証状態管理
- `middleware.ts` - ルート保護

### UI関連
- `app/page.tsx` - ダッシュボード
- `app/settings/page.tsx` - 設定画面
- `app/analytics/page.tsx` - アナリティクス

### データ関連
- `lib/supabase.ts` - Supabaseクライアント
- `lib/mock-data.ts` - モックデータ
- `types/database.ts` - 型定義

---

## ⚠️ 既知の問題

1. Next.js 16で `middleware` が非推奨警告（`proxy`に移行推奨）
2. モックデータからSupabaseへの移行が未完了

---

## 📝 次のアクション

1. [ ] ログアウトボタンをヘッダーに追加
2. [ ] 認証フローの動作確認
3. [ ] フェーズ2（DB連携）に着手
