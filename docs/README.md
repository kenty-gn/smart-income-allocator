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
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | Supabaseセットアップ手順 |
| [IOS_APP_PROPOSAL.md](./IOS_APP_PROPOSAL.md) | iOSアプリ開発提案書 |

---

## 📈 進捗状況

| フェーズ | 状態 | 説明 |
|---------|------|------|
| フェーズ1: 認証連携 | ✅ 完了 | Supabase Auth |
| フェーズ2: DB連携 | ✅ 完了 | CRUD操作 |
| フェーズ3: 機能強化 | ✅ 完了 | カテゴリー管理、エクスポート |
| フェーズ4: AI入力 | ✅ 完了 | 自然言語パース |
| フェーズ5: AI拡張 | ✅ 完了 | アドバイス、予測、チャット |
| フェーズ6: サブスク改善 | ✅ 完了 | Free/Pro差別化 |
| フェーズ7: リアルタイム同期 | ✅ 完了 | マルチデバイス対応 |
| フェーズ8: レシート読み取り | ✅ 完了 | Vision API連携 |
| フェーズ9: Stripe決済 | ✅ 完了 | サブスク決済 |

---

## 🔑 重要ファイル

### 認証関連
- `app/login/page.tsx` - ログイン画面
- `contexts/AuthContext.tsx` - 認証状態管理
- `middleware.ts` - ルート保護

### 画面
- `app/page.tsx` - ダッシュボード
- `app/settings/page.tsx` - 設定画面
- `app/analytics/page.tsx` - アナリティクス

### API
- `app/api/ai/parse/route.ts` - AI支出パース
- `app/api/ai/advice/route.ts` - AIアドバイス生成
- `app/api/ai/chat/route.ts` - チャット応答
- `app/api/ai/challenge/route.ts` - 節約チャレンジ
- `app/api/ai/receipt/route.ts` - レシート読み取り

### データベース
- `lib/supabase.ts` - Supabaseクライアント
- `lib/api/profiles.ts` - プロフィールAPI
- `lib/api/categories.ts` - カテゴリーAPI
- `lib/api/transactions.ts` - トランザクションAPI

### コンポーネント
- `components/dashboard/` - ダッシュボード（予測、チャレンジ）
- `components/analytics/` - アナリティクス（チャート、アドバイス）
- `components/chat/AIChatWidget.tsx` - チャットウィジェット
- `components/input/` - 入力フォーム（AI入力、手動入力）

---

## 💳 サブスクリプション機能

| 機能 | Free | Pro |
|------|:----:|:---:|
| 基本ダッシュボード | ✅ | ✅ |
| 支出登録 | ✅ | ✅ |
| 月別貯蓄グラフ | ✅ | ✅ |
| 全体目標サマリー | ✅ | ✅ |
| AI入力 | ✅ | ✅ |
| レシート読み取り | ✅ | ✅ |
| カテゴリー別分析 | 🔒 | ✅ |
| 年間集計 | 🔒 | ✅ |
| AIアドバイス | 🔒 | ✅ |
| チャットアシスタント | 🔒 | ✅ |
| 節約チャレンジ | 🔒 | ✅ |

---

## 🔧 環境変数

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

---

## 📝 今後の候補

- iOSアプリ開発（React Native / Swift）
