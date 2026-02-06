# 貢献ガイド

> 魔王軍団に力を貸してくれるのね……ふふ、歓迎するよ。

このガイドでは、魔王軍 AGI ダッシュボードプロジェクトへの貢献方法を説明します。

## 開発環境のセットアップ

### 1. フォーク & クローン

```bash
# リポジトリをフォークしてクローン
git clone https://github.com/your-username/mao-army-dashboard.git
cd mao-army-dashboard
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 開発サーバーの起動

```bash
pnpm dev
```

http://localhost:3003 でアプリケーションが起動します。

## コーディング規約

### TypeScript

- 型定義は必須。`any`型の使用は禁止
- インターフェースは `src/types/index.ts` に定義
- 非同期関数は `async/await` を使用

```typescript
// 良い例
interface TeamSummary {
  name: string;
  memberCount: number;
}

async function loadTeam(name: string): Promise<TeamSummary | null> {
  // ...
}

// 悪い例
function loadTeam(name: any) {
  // ...
}
```

### コンポーネント

- Reactコンポーネントは PascalCase
- カスタムフックは `use` プレフィックス
- propsはインターフェースで定義

```typescript
// 良い例
interface TeamCardProps {
  team: TeamSummary;
  onClick?: () => void;
}

export function TeamCard({ team, onClick }: TeamCardProps) {
  // ...
}
```

### 命名規則

| 種類 | 規則 | 例 |
|------|------|------|
| コンポーネント | PascalCase | `TeamCard`, `Dashboard` |
| 関数/変数 | camelCase | `loadTeam`, `isActive` |
| 型/インターフェース | PascalCase | `TeamConfig`, `AgentStatus` |
| 定数 | UPPER_SNAKE_CASE | `API_BASE_URL` |
| ファイル名 | kebab-case | `team-monitor.ts`, `api-route.ts` |

### インポート順序

```typescript
// 1. 外部ライブラリ
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';

// 2. 内部モジュール（@/エイリアス）
import { getTeamSummaries } from '@/lib/team-monitor';
import { TeamSummary } from '@/types';

// 3. 相対インポート
import { formatAgentName } from './utils';
```

## コミットメッセージ

### コミットメッセージフォーマット

```
<type>: <subject>

<body>

<footer>
```

### Type（種類）

| Type | 説明 |
|------|------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみ |
| `style` | コードスタイル（動作に影響しない） |
| `refactor` | リファクタリング |
| `test` | テスト追加 |
| `chore` | ビルドプロセスやツール変更 |

### 例

```bash
# 良いコミットメッセージ
feat: チーム詳細ページを追加

チーム名クリックでメンバー一覧とタスク進捗を表示するページを実装

- TeamDetailコンポーネントを作成
- /teams/[name]ルートを追加
- メンバーカードのステータス表示を改善
```

## プルリクエストの流れ

### 1. ブランチを作成

```bash
git checkout -b feat/team-detail-page
# または
git checkout -b fix/api-error-handling
```

ブランチ名は `type/-description` 形式で。

### 2. 変更をコミット

```bash
git add .
git commit -m "feat: チーム詳細ページを追加"
```

### 3. プッシュ

```bash
git push origin feat/team-detail-page
```

### 4. プルリクエストを作成

GitHub上でプルリクエストを作成してください。以下の情報を含めてね：

- 変更内容の説明
- 関連するIssue番号（もしあれば）
- スクリーンショット（UI変更の場合）
- テスト方法

### 5. レビュー & マージ

- レビューアーのコメントに対応してください
- CIチェックが通っていることを確認してください
- マージ後にブランチは削除してください

## テスト

```bash
# リント実行
pnpm lint

# 型チェック
pnpm build
```

……すべてのチェックが通ってからPRを出してね。

## Issueの報告

バグや機能要望はGitHub Issuesで報告してください。

### バグ報告テンプレート

```markdown
## バグ内容
簡潔な説明

## 再現手順
1. こうして
2. こうする
3. こうなる

## 期待する動作
こうあってほしい

## 環境
- OS:
- Node.js:
- ブラウザ:
```

## 行動規範

- 建設的な議論を心がけて
- 異なる意見を尊重して
- 迷惑な行為は禁止
- ……ふふ、魔王軍団らしく振る舞ってね

---

質問があれば [Discussions](https://github.com/your-org/mao-army-dashboard/discussions) で聞いてね。
