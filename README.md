# 魔王軍 AGI ダッシュボード

> 魔王軍のエージェントチームを可視化・管理するダッシュボード。

![魔王城](https://img.shields.io/badge/Status-Active-red)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-cyan)

## 概要

このダッシュボードは、Claude Codeのエージェントチーム機能を可視化・管理するためのアプリケーションです。Server-Sent Events(SSE)によるリアルタイム更新で、チームの状態を常に把握できます。

### 主な機能

- **チーム一覧**: 登録されている全チームの概要を表示
- **メンバー状態**: 各エージェントの状態（active/idle/busy/offline）をリアルタイム監視
- **タスク管理**: チーム内のタスク進捗状況を可視化
- **リアルタイム更新**: SSEによるプッシュ通知で最新状態を自動取得

## セットアップ

### 環境要件

- Node.js 20+
- pnpm（推奨）または npm / yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-org/mao-army-dashboard.git
cd mao-army-dashboard

# 依存関係をインストール
pnpm install
```

### 開発サーバー起動

```bash
pnpm dev
```

ブラウザで [http://localhost:3003](http://localhost:3003) にアクセスしてください。

### ビルド

```bash
pnpm build
pnpm start
```

## エージェントチーム構成

| 役割 | 名前 | 説明 |
|------|------|------|
| 魔王 | Demon Lord | チーム全体を統括、戦略を立案 |
| 魔導士 | Archmage | 技術設計・アーキテクチャを担当 |
| 竜騎兵 | Dragon Knight | フロントエンド実装を担当 |
| 暗黒騎士 | Dark Knight | バックエンド実装を担当 |
| 闘術士 | Minotaur | テスト・品質管理を担当 |

## 使用技術

### フロントエンド

- **Next.js 16.1** (App Router) - Reactフレームワーク
- **TypeScript 5.x** - 型安全な開発
- **Tailwind CSS v4** - ユーティリティファーストなCSS
- **Lucide React** - アイコンライブラリ
- **class-variance-authority** - バリアント管理

### バックエンド

- **Next.js API Routes** - REST API / SSEストリーミング
- **Server-Sent Events** - リアルタイム通信

### ディレクトリ構成

```
mao-army-dashboard/
├── app/                    # Next.js App Router
│   ├── api/               # APIルート
│   │   ├── teams/         # チーム一覧API
│   │   ├── tasks/         # タスク詳細API
│   │   └── stream/        # SSEストリーミングAPI
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # トップページ
├── src/
│   ├── lib/               # ユーティリティ関数
│   │   └── team-monitor.ts # チーム監視機能
│   └── types/             # 型定義
│       └── index.ts       # 共通型
├── public/                # 静的アセット
└── package.json           # 依存関係
```

## API仕様

### `GET /api/teams`

全チームの概要を取得します。

```typescript
interface TeamSummary {
  name: string;
  description: string;
  memberCount: number;
  activeTasks: number;
  completedTasks: number;
  totalTasks: number;
  isActive: boolean;
  lastUpdated: number;
}
```

### `GET /api/tasks/[teamId]`

指定チームの詳細情報（メンバー・タスク）を取得します。

```typescript
interface TeamMonitorData {
  config: TeamConfig;
  tasks: TeamTask[];
  isActive: boolean;
  lastUpdated: number;
}
```

### `GET /api/stream?team={teamName}`

Server-Sent Eventsによるリアルタイム更新ストリーム。

```typescript
// イベント形式
interface StreamEvent {
  type: 'update' | 'error';
  timestamp: number;
  data?: TeamMonitorData[];
  error?: string;
}
```

## ライセンス

MIT License

```
Copyright (c) 2025 Agent ZERO Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

## 貢献

……ふふ、この魔王城に来るのを歓迎するよ。詳細は [CONTRIBUTING.md](CONTRIBUTING.md) を見てね。

---

Made with 魔王軍のためのダッシュボード
