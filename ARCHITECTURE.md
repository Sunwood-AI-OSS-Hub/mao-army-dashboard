# システムアーキテクチャ

> 魔王城の構造図……ふふ、ここを知らないと迷子になるかも。

## システム概要

魔王軍団ダッシュボードは、Claude Codeのエージェントチーム機能を監視・管理するWebアプリケーションです。Next.jsのApp Routerを採用し、フロントエンドとバックエンドAPIを単一のアプリケーションで提供します。

```
┌─────────────────────────────────────────────────────────────────┐
│                        ブラウザ                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              React / Next.js フロントエンド               │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP / SSE
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ /api/teams   │  │ /api/tasks   │  │   /api/stream        │  │
│  │              │  │  /[teamId]   │  │   (SSE)              │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   team-monitor.ts                               │
│              （チーム監視ロジック）                               │
└─────────────────────────────┬───────────────────────────────────┘
                              │ ファイルシステムアクセス
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ~/.claude/                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  teams/                        tasks/                    │   │
│  │  ├── {team-name}/              ├── {team-name}/          │   │
│  │  │   └── config.json           │   └── *.json           │   │
│  │  └── ...                       └── ...                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## ディレクトリ構造

```
mao-army-dashboard/
├── app/                          # Next.js App Router ディレクトリ
│   ├── api/                     # API ルート
│   │   ├── teams/
│   │   │   └── route.ts         # GET /api/teams
│   │   ├── tasks/
│   │   │   └── [teamId]/
│   │   │       └── route.ts     # GET /api/tasks/{teamId}
│   │   └── stream/
│   │       └── route.ts         # GET /api/stream (SSE)
│   ├── layout.tsx               # ルートレイアウト
│   ├── page.tsx                 # トップページ
│   └── globals.css              # グローバルスタイル
├── src/
│   ├── lib/                     # ユーティリティ・ビジネスロジック
│   │   ├── team-monitor.ts      # チーム監視コアロジック
│   │   └── utils.ts             # 汎用ユーティリティ
│   └── types/                   # TypeScript 型定義
│       └── index.ts             # 共通型
├── public/                      # 静的アセット
│   ├── next.svg
│   └── vercel.svg
├── .gitignore
├── eslint.config.mjs            # ESLint 設定
├── next.config.ts               # Next.js 設定
├── package.json                 # 依存関係
├── pnpm-workspace.yaml
├── postcss.config.mjs           # PostCSS 設定
├── tailwind.config.ts           # Tailwind CSS 設定
└── tsconfig.json                # TypeScript 設定
```

## データフロー

### 1. チーム一覧取得

```
クライアント
    │
    │ GET /api/teams
    ▼
API Route (teams/route.ts)
    │
    │ getTeamSummaries()
    ▼
team-monitor.ts
    │
    ├─→ loadAllTeams()
    │       └─→ ~/.claude/teams/*/config.json
    │
    └─→ loadTeamTasks(teamName)
            └─→ ~/.claude/tasks/{teamName}/*.json
    │
    ▼
TeamSummary[] → JSON Response
```

### 2. SSE リアルタイム更新

```
クライアント
    │
    │ GET /api/stream?team={name}
    ▼
API Route (stream/route.ts)
    │
    ├─→ ReadableStream 作成
    │
    ├─→ 初期データ送信
    │
    ├─→ setInterval (3秒ごと)
    │       └─→ getMonitorData() → sendEvent()
    │
    └─→ setInterval (5秒ごと)
            └─→ ハートビート送信
    │
    ▼
text/event-stream で継続的に送信
```

### 3. チーム詳細取得

```
クライアント
    │
    │ GET /api/tasks/{teamId}
    ▼
API Route (tasks/[teamId]/route.ts)
    │
    │ getTeamMonitorData(teamId)
    ▼
team-monitor.ts
    │
    ├─→ loadAllTeams() → 該当チーム検索
    │
    └─→ loadTeamTasks(teamId)
    │
    ▼
TeamMonitorData → JSON Response
```

## 型システム

### コア型

```typescript
// チーム設定
interface TeamConfig {
  name: string;
  description: string;
  createdAt: number;
  leadAgentId: string;
  leadSessionId: string;
  members: TeamMember[];
}

// チームメンバー
interface TeamMember {
  agentId: string;
  name: string;
  agentType: string;
  model: string;
  prompt?: string;
  color?: string;
  planModeRequired: boolean;
  joinedAt: number;
  tmuxPaneId: string;
  cwd: string;
  subscriptions: string[];
  backendType: string;
  isActive: boolean;
}

// タスク
interface TeamTask {
  id: string;
  subject: string;
  description: string;
  activeForm: string;
  status: 'pending' | 'in_progress' | 'completed';
  blocks: string[];
  blockedBy: string[];
  owner?: string;
  metadata?: Record<string, unknown>;
}

// 監視データ
interface TeamMonitorData {
  config: TeamConfig;
  tasks: TeamTask[];
  isActive: boolean;
  lastUpdated: number;
}

// チーム概要
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

## セキュリティ

### 入力検証

- チーム名はホワイトリスト方式でバリデーション
  - アルファベット、数字、ハイフン、アンダースコアのみ許可
  - パストラバーサル防止（`..`, `/`, `\` を拒否）
  - 長さ制限（1〜100文字）

### エラーハンドリング

- ファイル読み込みエラーはスキップ
- APIエラーは適切なステータスコードで返却
- エラーログはサーバー側に出力（機密情報は含めない）

## パフォーマンス

### 最適化戦略

- **SSEの差分検出**: データハッシュで変更がある場合のみ送信
- **ハートビート**: 5秒ごとのハートビートで接続維持
- **ポーリング間隔**: 3秒ごとのデータ更新

### スケーラビリティ

現時点では単一サーバー向けの設計です。将来的には以下の拡張が可能：

- Redisによるセッション管理
- WebSocketへの移行
- チームデータのキャッシング

## 技術的負債

### 既知の制限

1. **ファイルシステム依存**: Claude Codeのローカルファイル構造に依存
2. **単一サーバー**: スケールアウト非対応
3. **認証なし**: 現時点では認証機能なし

### 改善提案

- [ ] 認証・認可機能の追加
- [ ] データベース移行（SQLite/PostgreSQL）
- [ ] WebSocketへの移行
- [ ] フロントエンドの実装（現在はAPIのみ）
- [ ] テストコードの追加
- [ ] エラーハンドリングの強化

## 関連リソース

- [Next.js Documentation](https://nextjs.org/docs)
- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Claude Code Teams](https://docs.anthropic.com/...)

---

……ふふ、アーキテクチャは魔王城の地下迷路みたいなもの。
地図がないと迷子になるから、ここをしっかり見ておいてね。
