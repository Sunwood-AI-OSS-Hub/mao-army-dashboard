// チームConfig構造
export interface TeamConfig {
  name: string;
  description: string;
  createdAt: number;
  leadAgentId: string;
  leadSessionId: string;
  members: TeamMember[];
}

export interface TeamMember {
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
  description?: string; // inboxの最初のメッセージから抽出したエージェント説明
}

// タスク構造
export interface TeamTask {
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
export interface TeamMonitorData {
  config: TeamConfig;
  tasks: TeamTask[];
  isActive: boolean;
  lastUpdated: number;
}

// エージェント状態
export interface AgentStatus {
  name: string;
  agentId: string;
  status: 'active' | 'idle' | 'busy' | 'offline';
  currentTask?: string;
}

// チーム概要
export interface TeamSummary {
  name: string;
  description: string;
  memberCount: number;
  activeTasks: number;
  completedTasks: number;
  totalTasks: number;
  isActive: boolean;
  lastUpdated: number;
}

// Inboxメッセージ構造
export interface InboxMessage {
  from: string;
  text: string;
  timestamp: string;
  read: boolean;
  summary?: string;
  color?: string;
}

// エージェントinboxデータ
export interface AgentInbox {
  agentId: string;
  agentName: string;
  messages: InboxMessage[];
  unreadCount: number;
  lastMessageTime: string;
}

// チームinboxデータ
export interface TeamInboxData {
  teamName: string;
  agents: AgentInbox[];
}
