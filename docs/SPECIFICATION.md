# Smart Income Allocator - 開発計画

## 概要

モバイルファーストの家計管理アプリケーション。収入に対する予算配分を可視化し、支出を追跡する。

## 技術スタック

| カテゴリ | 技術 |
|---------|-----|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| UIコンポーネント | shadcn/ui |
| アニメーション | Framer Motion |
| バックエンド | Supabase (Auth, Database) |
| グラフ | Recharts |

---

## 現在の実装状況

### ✅ 完了

- **UI/UX**: ダッシュボード、設定画面、アナリティクス
- **データベース設計**: profiles, categories, transactions テーブル
- **認証基盤**: ログイン画面、AuthContext、middleware

### 🔄 進行中

- **フェーズ1**: Supabase認証連携

### ⏳ 未着手

- **フェーズ2**: データベース連携（モック→Supabase移行）
- **フェーズ3**: 機能強化（カテゴリー管理等）
- **フェーズ4**: AI入力機能（Pro限定）

---

## アーキテクチャ

```
app/
├── page.tsx          # ダッシュボード
├── login/page.tsx    # ログイン画面
├── analytics/        # 分析画面
├── settings/         # 設定画面
└── layout.tsx        # 共通レイアウト

components/
├── dashboard/        # ダッシュボード関連
├── analytics/        # グラフ関連
├── input/            # 入力フォーム
├── layout/           # ナビゲーション等
└── ui/               # shadcn/ui

contexts/
└── AuthContext.tsx   # 認証状態管理

lib/
├── supabase.ts       # Supabaseクライアント
├── mock-data.ts      # モックデータ
└── utils.ts          # ユーティリティ

types/
└── database.ts       # 型定義
```

---

## データベース設計

### profiles
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | ユーザーID (auth.users 参照) |
| salary_day | INTEGER | 給料日 (1-31) |
| target_income | DECIMAL | 目標収入 |
| subscription_tier | TEXT | free / pro |

### categories
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | カテゴリーID |
| user_id | UUID | ユーザーID |
| name | TEXT | カテゴリー名 |
| type | TEXT | fixed / variable |
| target_amount | DECIMAL | 目標金額 (固定費) |
| target_percentage | DECIMAL | 目標割合 (変動費) |
| color | TEXT | 表示色 |

### transactions
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | トランザクションID |
| user_id | UUID | ユーザーID |
| category_id | UUID | カテゴリーID |
| amount | DECIMAL | 金額 |
| date | DATE | 日付 |
| description | TEXT | メモ |
| type | TEXT | income / expense |

---

## フェーズ別実装計画

### フェーズ1: Supabase認証連携

```
app/login/page.tsx     [NEW]     ログイン/サインアップUI
contexts/AuthContext   [MODIFY]  Supabase Auth連携
middleware.ts          [NEW]     ルート保護
```

### フェーズ2: データベース連携

```
lib/supabase.ts        [MODIFY]  CRUD関数追加
app/page.tsx           [MODIFY]  モック→Supabase
app/settings/page.tsx  [MODIFY]  カテゴリーCRUD
```

### フェーズ3: 機能強化

- カテゴリー追加/編集/削除UI
- 収入設定画面
- 月次レポート
- CSVエクスポート

### フェーズ4: AI入力機能

- OpenAI API連携
- 自然言語パース
- サブスクリプション制限

---

## 検証計画

### 自動テスト
```bash
npm run lint
npm run build
```

### 手動検証
1. 認証フロー（サインアップ→ログイン→ログアウト）
2. データ永続化（リロード後もデータ保持）
3. 権限制御（未認証時リダイレクト）
