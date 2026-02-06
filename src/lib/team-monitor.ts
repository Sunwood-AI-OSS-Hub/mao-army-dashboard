import { TeamConfig, TeamTask, TeamMonitorData, TeamSummary, AgentInbox, TeamInboxData, InboxMessage } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

const TEAMS_DIR = '/home/maki/.claude/teams';
const TASKS_DIR = '/home/maki/.claude/tasks';

/**
 * 指定チームのinboxデータを取得
 */
export async function loadTeamInboxes(teamName: string): Promise<TeamInboxData | null> {
  try {
    const inboxesDir = path.join(TEAMS_DIR, teamName, 'inboxes');
    const inboxesDirExists = await fs.access(inboxesDir).then(() => true).catch(() => false);
    if (!inboxesDirExists) {
      return null;
    }

    const entries = await fs.readdir(inboxesDir, { withFileTypes: true });
    const inboxFiles = entries.filter(entry => entry.isFile() && entry.name.endsWith('.json'));

    const agents: AgentInbox[] = [];

    for (const inboxFile of inboxFiles) {
      try {
        const inboxPath = path.join(inboxesDir, inboxFile.name);
        const content = await fs.readFile(inboxPath, 'utf-8');
        const messages = JSON.parse(content) as InboxMessage[];

        // エージェント名はファイル名から取得（.jsonを除去）
        const agentName = inboxFile.name.replace('.json', '');
        const agentId = `${agentName}@${teamName}`;

        // 未読メッセージ数をカウント
        const unreadCount = messages.filter(m => !m.read).length;

        // 最新メッセージの時間を取得
        const lastMessageTime = messages.length > 0
          ? messages[messages.length - 1].timestamp
          : new Date().toISOString();

        agents.push({
          agentId,
          agentName,
          messages,
          unreadCount,
          lastMessageTime,
        });
      } catch (error) {
        console.error(`Failed to read inbox: ${inboxFile.name}`, error);
      }
    }

    return {
      teamName,
      agents: agents.sort((a, b) =>
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      ),
    };
  } catch (error) {
    console.error(`Error loading inboxes for team ${teamName}:`, error);
    return null;
  }
}

/**
 * 全チームのinboxデータを取得
 */
export async function getAllTeamInboxes(): Promise<TeamInboxData[]> {
  const teams = await loadAllTeams();
  const inboxesData: TeamInboxData[] = [];

  for (const team of teams) {
    const inboxData = await loadTeamInboxes(team.name);
    if (inboxData) {
      inboxesData.push(inboxData);
    }
  }

  return inboxesData;
}

/**
 * 全チームの設定を読み込む
 */
export async function loadAllTeams(): Promise<TeamConfig[]> {
  try {
    const teamsDirExists = await fs.access(TEAMS_DIR).then(() => true).catch(() => false);
    if (!teamsDirExists) {
      return [];
    }

    const entries = await fs.readdir(TEAMS_DIR, { withFileTypes: true });
    const teamDirs = entries.filter(entry => entry.isDirectory());

    const teams: TeamConfig[] = [];
    for (const teamDir of teamDirs) {
      try {
        const configPath = path.join(TEAMS_DIR, teamDir.name, 'config.json');
        const content = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(content) as TeamConfig;

        // inboxesディレクトリから実際のメンバー数を取得
        const inboxesPath = path.join(TEAMS_DIR, teamDir.name, 'inboxes');
        try {
          const inboxFiles = await fs.readdir(inboxesPath);
          // inboxのJSONファイルの名前をセット（拡張子なし）
          const inboxAgentNames = new Set(
            inboxFiles
              .filter(f => f.endsWith('.json'))
              .map(f => f.replace('.json', ''))
          );

          // inboxファイルからエージェント説明を抽出するヘルパー
          const extractAgentDescriptionFromInbox = async (agentName: string): Promise<string | undefined> => {
            try {
              const inboxPath = path.join(inboxesPath, `${agentName}.json`);
              const inboxContent = await fs.readFile(inboxPath, 'utf-8');
              const messages = JSON.parse(inboxContent) as InboxMessage[];

              if (messages.length > 0 && messages[0].text) {
                const firstMessage = messages[0].text;
                // 最初の数行を取得（最大150文字）
                const lines = firstMessage.split('\n').slice(0, 5);
                const description = lines.join('\n').trim();
                return description.length > 150
                  ? description.slice(0, 150) + '...'
                  : description;
              }
            } catch (e) {
              // inboxの読み込みエラーはスキップ
              console.error(`Failed to extract description for ${agentName}:`, e);
            }
            return undefined;
          };

          // config.jsonのメンバー情報をベースにして、inboxがあるメンバーのみを抽出
          // inboxにファイルがある＝実際にチームに所属しているエージェント
          const actualMembers = config.members.filter(member => {
            // agentIdからエージェント名を抽出（例: "Minotaur@mao-army-dev" -> "Minotaur"）
            const memberName = member.agentId.split('@')[0];
            return inboxAgentNames.has(memberName);
          });

          // inboxにあるがconfig.jsonにないメンバーを追加（新規メンバー）
          for (const inboxAgentName of inboxAgentNames) {
            const existsInConfig = config.members.some(m =>
              m.agentId.split('@')[0] === inboxAgentName
            );

            if (!existsInConfig) {
              // inboxの最初のメッセージから説明を抽出
              const description = await extractAgentDescriptionFromInbox(inboxAgentName);

              // config.jsonにないメンバーは最小限の情報で追加
              actualMembers.push({
                agentId: `${inboxAgentName}@${teamDir.name}`,
                name: inboxAgentName,
                agentType: 'general-purpose',
                model: '',
                color: undefined,
                planModeRequired: false,
                joinedAt: Date.now(),
                tmuxPaneId: '',
                cwd: '',
                subscriptions: [],
                backendType: '',
                isActive: false,
                description, // inboxの最初のメッセージから抽出した説明
              });
            }
          }

          // メンバー情報を更新
          config.members = actualMembers;
        } catch (e) {
          // inboxesディレクトリがない場合はconfig.jsonのまま
          console.log(`No inboxes directory for ${teamDir.name}, using config.json members`);
        }

        teams.push(config);
      } catch (error) {
        // 読み込みエラーはスキップ
        console.error(`Failed to read config for ${teamDir.name}:`, error);
      }
    }

    return teams;
  } catch (error) {
    console.error('Error loading teams:', error);
    return [];
  }
}

/**
 * 指定チームのタスクを読み込む
 */
export async function loadTeamTasks(teamName: string): Promise<TeamTask[]> {
  try {
    const tasksDir = path.join(TASKS_DIR, teamName);
    const tasksDirExists = await fs.access(tasksDir).then(() => true).catch(() => false);
    if (!tasksDirExists) {
      return [];
    }

    const entries = await fs.readdir(tasksDir, { withFileTypes: true });
    const taskFiles = entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
      .map(entry => path.join(tasksDir, entry.name));

    const tasks: TeamTask[] = [];
    for (const taskFile of taskFiles) {
      try {
        const content = await fs.readFile(taskFile, 'utf-8');
        const task = JSON.parse(content) as TeamTask;
        tasks.push(task);
      } catch (error) {
        // 読み込みエラーはスキップ
        console.error(`Failed to read task: ${taskFile}`, error);
      }
    }

    return tasks;
  } catch (error) {
    console.error(`Error loading tasks for team ${teamName}:`, error);
    return [];
  }
}

/**
 * 全チームの監視データを取得
 */
export async function getMonitorData(): Promise<TeamMonitorData[]> {
  const teams = await loadAllTeams();
  const monitorData: TeamMonitorData[] = [];

  for (const team of teams) {
    const tasks = await loadTeamTasks(team.name);
    monitorData.push({
      config: team,
      tasks,
      isActive: team.members.some(m => m.isActive),
      lastUpdated: Date.now()
    });
  }

  return monitorData;
}

/**
 * チーム概要を取得
 */
export async function getTeamSummaries(): Promise<TeamSummary[]> {
  const monitorData = await getMonitorData();

  return monitorData.map(data => {
    const totalTasks = data.tasks.length;
    const completedTasks = data.tasks.filter(t => t.status === 'completed').length;
    const activeTasks = data.tasks.filter(t => t.status === 'in_progress').length;

    return {
      name: data.config.name,
      description: data.config.description,
      memberCount: data.config.members.length,
      activeTasks,
      completedTasks,
      totalTasks,
      isActive: data.isActive,
      lastUpdated: data.lastUpdated
    };
  });
}

/**
 * 指定チームの監視データを取得
 */
export async function getTeamMonitorData(teamName: string): Promise<TeamMonitorData | null> {
  const teams = await loadAllTeams();
  const team = teams.find(t => t.name === teamName);

  if (!team) {
    return null;
  }

  const tasks = await loadTeamTasks(teamName);

  return {
    config: team,
    tasks,
    isActive: team.members.some(m => m.isActive),
    lastUpdated: Date.now()
  };
}
