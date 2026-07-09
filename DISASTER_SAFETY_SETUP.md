# リアルタイム防災バナー & Pingシステム セットアップガイド

## 概要

このドキュメントは、ビジネスカードページに統合されたリアルタイム防災バナー機能と、定期的なPingシステムのセットアップ手順を説明します。

## 実装内容

### 1. 防災バナーコンポーネント (`DisasterSafetyBanner.tsx`)
- **位置**: `src/components/DisasterSafetyBanner.tsx`
- **機能**: 訪問者の位置情報と防災情報をリアルタイムに表示
- **更新間隔**: 5分ごと（SWRによる自動再検証）

### 2. API エンドポイント

#### `/api/safety-status` (GET)
- **説明**: 訪問者の位置情報と防災情報を統合して返す
- **レスポンス例**:
```json
{
  "city": "金沢市",
  "prefecture": "石川県",
  "message": "現在、石川県に気象警報は出ていません。穏やかな天気です",
  "status": "safe",
  "weatherIcon": "☀️",
  "isActiveEvent": false,
  "lastUpdated": "2026-07-09T12:34:56.000Z"
}
```

#### `/api/business-card-schedules` (GET/POST/PUT/DELETE)
- **説明**: Supabaseの `business_card_schedules` テーブルを管理
- **認証**: `x-admin-token` ヘッダーで管理者認証

#### `/api/ping` (POST)
- **説明**: 定期的なシステムヘルスチェック
- **認証**: `Authorization: Bearer {PING_SECRET_TOKEN}` ヘッダー
- **用途**: GitHub Actions から定期的に呼び出される

### 3. 管理画面

#### `/admin/business-card-schedules`
- **説明**: ビジネスカードスケジュールの管理UI
- **機能**:
  - スケジュール一覧表示
  - 新規作成・編集・削除
  - 閲覧数の表示

## セットアップ手順

### ステップ 1: 環境変数の設定

`.env.local` に以下の環境変数を追加してください:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 管理者認証
ADMIN_PASSWORD=your-secure-password

# Ping システム
PING_SECRET_TOKEN=your-ping-secret-token
```

### ステップ 2: Supabase テーブルの確認

`business_card_schedules` テーブルが以下のスキーマで存在することを確認してください:

```sql
CREATE TABLE business_card_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### ステップ 3: GitHub Actions の設定

GitHub リポジトリの Settings > Secrets and variables > Actions から、以下のシークレットを追加してください:

| キー | 値 | 説明 |
| :--- | :--- | :--- |
| `DEPLOYMENT_URL` | `https://your-domain.vercel.app` | デプロイ先のURL |
| `PING_SECRET_TOKEN` | (上記と同じ) | Ping認証トークン |

### ステップ 4: ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで `http://localhost:3000/hello/business-card/YOUR_TOKEN` にアクセスしてください。

## 使用方法

### 防災バナーの表示

ビジネスカードページ (`/hello/business-card/[token]`) にアクセスすると、自動的に防災バナーが表示されます。

**表示内容**:
- **安全時 (safe)**: ✅ アイコン、緑色のバナー
- **警報時 (warning)**: ⚠️ アイコン、黄色のバナー
- **危険時 (danger)**: 🚨 アイコン、赤色のバナー

### スケジュール管理

1. `/admin` にアクセス
2. 「ビジネスカード スケジュール管理」をクリック
3. 管理者パスワードでログイン
4. スケジュールを追加・編集・削除

### Ping システムの動作確認

GitHub Actions のワークフロー (`ping-disaster-system.yml`) が毎時間 0 分に実行されます。

**手動実行**:
```bash
# GitHub CLI を使用
gh workflow run ping-disaster-system.yml
```

## トラブルシューティング

### 防災バナーが表示されない

1. ブラウザのコンソールでエラーを確認
2. `/api/safety-status` が正常に動作しているか確認
3. Supabase の接続情報を確認

### スケジュール管理画面にアクセスできない

1. 管理者パスワードが正しいか確認
2. ブラウザのクッキーをクリア
3. `ADMIN_PASSWORD` 環境変数が設定されているか確認

### Ping が失敗する

1. `DEPLOYMENT_URL` が正しいか確認
2. `PING_SECRET_TOKEN` が環境変数に設定されているか確認
3. GitHub Actions のログを確認

## 今後の拡張案

### 1. 気象庁 API の統合

現在は簡易実装ですが、以下のAPIと連携することで、より詳細な防災情報を提供できます:

- 気象庁 OpenData API
- Lアラート (災害情報共有システム)
- 河川水位情報 API

### 2. リアルタイム通知

WebSocket や Server-Sent Events (SSE) を利用して、警報発令時に即座に訪問者に通知できます。

### 3. DMD構想の実装

Ping ログを Markdown 形式でリポジトリに自動コミットし、活動ログを永続化できます。

```markdown
## Ping Report - 2026-07-09 12:34:56

- **Timestamp**: 2026-07-09T12:34:56.000Z
- **Active Schedules**: 1
- **System Status**: ✅ Healthy

### Details
- **sudo-event-2026**: 2026-07-06 07:50:00 ~ 2026-07-06 08:15:00 (View Count: 42)
```

## 参考リンク

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [気象庁 OpenData](https://www.jma.go.jp/jma/kishou/info/open_data/index.html)
