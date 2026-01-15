# Smart Income Allocator - 技術仕様

## 概要

モバイルファーストの家計管理アプリケーション。収入に対する予算配分を可視化し、支出を追跡する。

---

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
| AI | OpenAI API (gpt-4o-mini) |

---

## アーキテクチャ

```
app/
├── page.tsx              # ダッシュボード
├── login/page.tsx        # ログイン画面
├── analytics/page.tsx    # アナリティクス
├── settings/page.tsx     # 設定画面
├── layout.tsx            # 共通レイアウト
└── api/
    └── ai/
        ├── parse/        # 支出パースAPI
        ├── advice/       # アドバイスAPI
        ├── chat/         # チャットAPI
        └── challenge/    # チャレンジAPI
    └── stripe/
        ├── checkout/     # Stripe Checkoutセッション
        └── webhook/      # Stripe Webhook処理

components/
├── dashboard/
│   ├── BudgetProgress.tsx   # 予算プログレス
│   ├── CategoryCard.tsx     # カテゴリーカード
│   ├── SpendingForecast.tsx # 支出予測
│   └── SavingsChallenge.tsx # 節約チャレンジ
├── analytics/
│   ├── SavingsChart.tsx     # 貯蓄グラフ
│   ├── TargetGap.tsx        # 目標差分
│   ├── AdviceCard.tsx       # AIアドバイス
│   └── YearlySummary.tsx    # 年間集計
├── chat/
│   └── AIChatWidget.tsx     # チャットウィジェット
├── input/
│   ├── AIInput.tsx          # AI入力（タブ切り替え）
│   ├── ReceiptScanner.tsx   # レシート読み取り
│   └── ManualInput.tsx      # 手動入力
├── layout/
│   ├── Header.tsx           # ヘッダー
│   ├── MainLayout.tsx       # メインレイアウト
│   └── MobileNav.tsx        # モバイルナビ
└── ui/                      # shadcn/ui

contexts/
└── AuthContext.tsx          # 認証状態管理

hooks/
├── useCategories.ts         # カテゴリーフック（リアルタイム対応）
└── useTransactions.ts       # トランザクションフック（リアルタイム対応）

lib/
├── supabase.ts              # Supabaseクライアント
├── realtime.ts              # リアルタイム購読ユーティリティ
├── export-csv.ts            # CSVエクスポート
├── ai-parser.ts             # AIパーサークライアント
└── api/
    ├── profiles.ts          # プロフィールAPI
    ├── categories.ts        # カテゴリーAPI
    └── transactions.ts      # トランザクションAPI

types/
└── database.ts              # 型定義
```

---

## データベース設計

### profiles
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | ユーザーID (auth.users参照) |
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

## APIエンドポイント

### POST /api/ai/parse
自然言語から支出を解析

**Request:**
```json
{
  "text": "今日ランチに800円使った",
  "categories": ["食費", "交通費", ...]
}
```

**Response:**
```json
{
  "parsed": [
    { "amount": 800, "category": "食費", "description": "ランチ" }
  ]
}
```

### POST /api/ai/advice
支出パターンからアドバイス生成

### POST /api/ai/chat
家計に関する質問に回答

### POST /api/ai/challenge
節約チャレンジを生成

### POST /api/ai/receipt
レシート画像から支出情報を抽出

**Request:**
```json
{
  "image": "data:image/jpeg;base64,...",
  "categories": ["食費", "外食", ...]
}
```

**Response:**
```json
{
  "results": [
    { "amount": 1500, "category": "食費", "description": "コンビニ" }
  ]
}

---

## サブスクリプション設計

```typescript
type SubscriptionTier = 'free' | 'pro';

// Pro専用機能
const proFeatures = [
  'カテゴリー別分析',
  '年間集計',
  'AI入力',
  'AIアドバイス',
  'チャットアシスタント',
  '節約チャレンジ',
];
```

---

## リアルタイム同期

Supabase Realtimeを使用して、複数デバイス/タブ間でデータをリアルタイムに同期。

### 対象テーブル
- `transactions` - 支出/収入の追加・編集・削除
- `categories` - カテゴリーの追加・編集・削除

### 仕組み
```typescript
// lib/realtime.ts
supabase
  .channel(`transactions-${userId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'transactions',
    filter: `user_id=eq.${userId}`
  }, callback)
  .subscribe()
```

### 機能
- INSERT: 新規レコードをリストに追加
- UPDATE: 対象レコードを更新
- DELETE: 対象レコードを削除
- コンポーネントのアンマウント時に自動購読解除

---

## 検証コマンド

```bash
# リント
npm run lint

# ビルド
npm run build

# 開発サーバー
npm run dev
```
