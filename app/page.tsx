'use client';

import * as React from 'react';
import { RefreshCw, X, MessageSquare } from 'lucide-react';
import {
  InfernoSidebar,
  InfernoHeader,
  InfernoStatsCard,
  InfernoActivityLog,
  InfernoTeamCard,
} from '@/components';
import { Button } from '@/components/ui';
import { Card, CardContent } from '@/components/ui/card';
import { TeamInboxesView } from '@/components/AgentInboxView';
import type { TeamSummary, TeamMonitorData, TeamInboxData } from '@/types';

export default function HomePage() {
  const [teams, setTeams] = React.useState<TeamSummary[]>([]);
  const [selectedTeam, setSelectedTeam] = React.useState<TeamMonitorData | null>(null);
  const [teamInboxes, setTeamInboxes] = React.useState<TeamInboxData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'info' | 'inbox'>('info');

  // 総計統計を計算
  const totalMembers = React.useMemo(() => teams.reduce((sum, t) => sum + t.memberCount, 0), [teams]);
  const totalActiveTasks = React.useMemo(() => teams.reduce((sum, t) => sum + t.activeTasks, 0), [teams]);
  const activeTeamsCount = React.useMemo(() => teams.filter(t => t.isActive).length, [teams]);

  // チーム一覧を取得
  const fetchTeams = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/teams');
      if (!response.ok) {
        throw new Error('チームデータの取得に失敗しました');
      }
      const data = await response.json();
      setTeams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラー');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // チーム詳細を取得
  const fetchTeamDetail = React.useCallback(async (teamName: string) => {
    try {
      const response = await fetch(`/api/tasks/${teamName}`);
      if (!response.ok) {
        throw new Error('チーム詳細の取得に失敗しました');
      }
      const data = await response.json();
      setSelectedTeam(data);

      // inboxも取得
      const inboxResponse = await fetch(`/api/inboxes/${teamName}`);
      if (inboxResponse.ok) {
        const inboxData = await inboxResponse.json();
        setTeamInboxes(inboxData);
      }

      // タブをリセット
      setActiveTab('info');
    } catch (err) {
      console.error('Error fetching team detail:', err);
    }
  }, []);

  // 初期ロード
  React.useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // SSEでリアルタイム更新
  React.useEffect(() => {
    const eventSource = new EventSource('/api/stream');

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'update' && message.data) {
          // チーム一覧を更新
          const summaries = message.data.map((d: TeamMonitorData) => ({
            name: d.config.name,
            description: d.config.description,
            memberCount: d.config.members.length,
            activeTasks: d.tasks.filter((t: { status: string }) => t.status === 'in_progress').length,
            completedTasks: d.tasks.filter((t: { status: string }) => t.status === 'completed').length,
            totalTasks: d.tasks.length,
            isActive: d.isActive,
            lastUpdated: d.lastUpdated,
          }));
          setTeams(summaries);

          // 選択中のチームがあれば更新
          if (selectedTeam) {
            const updated = message.data.find((d: TeamMonitorData) => d.config.name === selectedTeam.config.name);
            if (updated) {
              setSelectedTeam(updated);
            }
          }
        }
      } catch (err) {
        console.error('Error parsing SSE message:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [selectedTeam]);

  const handleTeamClick = (team: TeamSummary) => {
    fetchTeamDetail(team.name);
  };

  const handleCloseModal = () => {
    setSelectedTeam(null);
    setTeamInboxes(null);
    setActiveTab('info');
  };

  // サンプルアクティビティデータ
  const sampleActivities = [
    {
      id: '1',
      type: 'new_agent' as const,
      title: 'New Agent Joined',
      description: 'Abyssal Knight V-99 has sworn fealty.',
      time: '2m ago',
      highlighted: true,
    },
    {
      id: '2',
      type: 'task_assigned' as const,
      title: 'Task Assigned',
      description: 'Succubus-01 tasked with Diplomatic Sabotage.',
      time: '1h ago',
      highlighted: true,
    },
    {
      id: '3',
      type: 'scheme_initiated' as const,
      title: 'Scheme Initiated',
      description: "Scheme 'Eternal Eclipse' phase 2 activated.",
      time: '3h ago',
      highlighted: true,
    },
    {
      id: '4',
      type: 'new_intel' as const,
      title: 'New Intel',
      description: '"The barrier is weakening at the northern gate..."',
      time: '6h ago',
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background-dark">
      {/* サイドバー */}
      <InfernoSidebar />

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <InfernoHeader />

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {/* ヒーローセクション */}
          <div className="relative w-full h-64 lg:h-80 rounded-xl overflow-hidden mb-8 glow-red-intense group">
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-background-dark/80 via-transparent to-transparent z-10" />

            {/* 背景画像（サンプル） */}
            <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900" />

            {/* コンテンツ */}
            <div className="absolute bottom-8 lg:bottom-10 left-6 lg:left-10 z-20">
              <div className="flex items-center gap-6 lg:gap-8">
                <div className="size-20 lg:size-28 bg-stone-900/80 backdrop-blur-md border-2 border-primary/60 rounded-xl flex items-center justify-center glow-red-intense">
                  <span className="material-symbols-outlined text-5xl lg:text-7xl text-primary">
                    shield_moon
                  </span>
                </div>
                <div className="space-y-1">
                  <h1 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter text-white ember-text">
                    Inferno Legion
                  </h1>
                  <p className="text-amber-glow font-bold tracking-[0.3em] text-xs lg:text-sm uppercase flex items-center gap-2">
                    <span className="h-px w-6 lg:w-8 bg-amber-glow"></span>
                    Elite Vanguard Unit
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* タブ */}
          <div className="border-b border-white/5 flex gap-8 lg:gap-10 mb-8">
            <button className="pb-4 border-b-2 border-primary text-primary font-bold text-sm tracking-widest uppercase ember-text">
              Overview
            </button>
            <button className="pb-4 border-b-2 border-transparent text-stone-500 hover:text-white font-bold text-sm tracking-widest uppercase transition-colors">
              Team Roster
            </button>
            <button className="pb-4 border-b-2 border-transparent text-stone-500 hover:text-white font-bold text-sm tracking-widest uppercase transition-colors">
              Mission Log
            </button>
            <button className="pb-4 border-b-2 border-transparent text-stone-500 hover:text-white font-bold text-sm tracking-widest uppercase transition-colors">
              The Vault
            </button>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-700/50 text-red-200">
              {error}
            </div>
          )}

          {/* ローディング表示 */}
          {loading && teams.length === 0 && (
            <div className="text-center py-12 text-stone-500">
              読み込み中...
            </div>
          )}

          {/* コンテンツグリッド */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* 左側 - メインコンテンツ */}
            <div className="col-span-1 xl:col-span-8 space-y-8">
              {/* 統計カード */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfernoStatsCard
                  type="soldiers"
                  value={totalMembers}
                  change="12"
                  description="Ready for deployment"
                />
                <InfernoStatsCard
                  type="conquests"
                  value={teams.reduce((sum, t) => sum + t.completedTasks, 0)}
                  change="5"
                  description="Missions completed"
                />
                <InfernoStatsCard
                  type="schemes"
                  value={totalActiveTasks}
                  status={totalActiveTasks > 0 ? 'active' : undefined}
                  description={totalActiveTasks > 0 ? 'Operations in progress' : 'No active operations'}
                />
              </div>

              {/* 操作バー */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                  Active Legions
                </h2>
                <Button
                  data-testid="refresh-button"
                  onClick={fetchTeams}
                  disabled={loading}
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/20 text-primary hover:text-white"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {/* チーム一覧 */}
              {!loading && teams.length === 0 && (
                <div className="text-center py-12 text-stone-500">
                  軍団がありません
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teams.map((team) => (
                  <InfernoTeamCard
                    key={team.name}
                    team={team}
                    onClick={() => handleTeamClick(team)}
                  />
                ))}
              </div>

              {/* 優先タスクセクション（サンプル） */}
              <div className="bg-stone-900 border border-white/5 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold italic uppercase tracking-tighter text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">priority_high</span>
                    Priority Schemes
                  </h3>
                  <button className="text-xs font-bold text-primary hover:text-amber-glow transition-colors uppercase tracking-widest">
                    View All Missions
                  </button>
                </div>
                <div className="space-y-4">
                  {/* サンプルタスク */}
                  <div className="flex items-center justify-between p-5 bg-black/40 border border-white/5 rounded-lg hover:border-primary/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded bg-primary/10 flex items-center justify-center text-primary glow-red">
                        <span className="material-symbols-outlined">auto_fix_high</span>
                      </div>
                      <div>
                        <p className="font-bold text-stone-100 group-hover:text-primary transition-colors">
                          Operation: Eternal Eclipse
                        </p>
                        <p className="text-xs text-stone-500 font-medium">Target: High Heaven Sanctum</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-40 h-2 bg-stone-800 rounded-full overflow-hidden border border-white/5">
                        <div className="bg-gradient-to-r from-lava-red to-primary h-full" style={{ width: '75%' }} />
                      </div>
                      <p className="text-[10px] font-bold text-primary mt-1.5 tracking-tighter">75% CORRUPTION</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右側 - アクティビティログ */}
            <div className="col-span-1 xl:col-span-4">
              <InfernoActivityLog activities={sampleActivities} />
            </div>
          </div>

          {/* フッター */}
          <footer className="text-center py-8 border-t border-white/5 mt-12">
            <p className="text-stone-600 text-sm">
              Inferno Legion Command Center v0.1.0
            </p>
            <p className="text-stone-700 text-xs mt-1">
              ……ふふ、私がここで待ってるから
            </p>
          </footer>
        </div>
      </main>

      {/* チーム詳細モーダル */}
      {selectedTeam && (
        <div
          data-testid="team-modal"
          className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4"
          onClick={handleCloseModal}
        >
          <Card
            className="max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col bg-stone-900/90 border-primary/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
              <h2 className="text-2xl font-bold text-white ember-text">{selectedTeam.config.name}</h2>
              <button
                data-testid="modal-close"
                onClick={handleCloseModal}
                className="text-stone-500 hover:text-primary transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* タブ */}
            <div className="flex border-b border-white/5 shrink-0">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'info'
                    ? 'text-white border-b-2 border-primary bg-primary/10'
                    : 'text-stone-500 hover:text-white hover:bg-white/5'
                }`}
              >
                チーム情報
              </button>
              <button
                onClick={() => setActiveTab('inbox')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'inbox'
                    ? 'text-white border-b-2 border-primary bg-primary/10'
                    : 'text-stone-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                メッセージ
                {teamInboxes && teamInboxes.agents.some(a => a.unreadCount > 0) && (
                  <span className="ml-1 h-2 w-2 rounded-full bg-amber-glow animate-pulse" />
                )}
              </button>
            </div>

            <CardContent className="p-6 overflow-y-auto flex-1">
              {activeTab === 'info' ? (
                <div className="space-y-6">
                  {/* 説明 */}
                  <div>
                    <h3 className="text-sm font-semibold text-stone-400 mb-2">説明</h3>
                    <p className="text-stone-200">{selectedTeam.config.description}</p>
                  </div>

                  {/* メンバー一覧 */}
                  <div>
                    <h3 className="text-sm font-semibold text-stone-400 mb-3">
                      メンバー ({selectedTeam.config.members.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedTeam.config.members.map((member) => (
                        <div
                          key={member.agentId}
                          className="p-3 rounded-lg bg-black/30 border border-white/5"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-semibold text-stone-100">{member.name}</div>
                              <div className="text-xs text-stone-500">{member.agentType}</div>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              member.isActive
                                ? 'bg-green-900/50 text-green-300 border border-green-700/50'
                                : 'bg-stone-800/50 text-stone-500 border border-stone-700/50'
                            }`}>
                              {member.isActive ? 'アクティブ' : 'オフライン'}
                            </div>
                          </div>
                          {member.description && (
                            <p className="text-xs text-stone-400 whitespace-pre-wrap line-clamp-3">
                              {member.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* タスク一覧 */}
                  <div>
                    <h3 className="text-sm font-semibold text-stone-400 mb-3">
                      タスク ({selectedTeam.tasks.length})
                    </h3>
                    {selectedTeam.tasks.length === 0 ? (
                      <p className="text-stone-500 text-sm">タスクはありません</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedTeam.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-3 rounded-lg bg-black/30 border border-white/5"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-stone-100">{task.subject}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                task.status === 'completed'
                                  ? 'bg-green-900/50 text-green-300'
                                  : task.status === 'in_progress'
                                  ? 'bg-amber-900/50 text-amber-300'
                                  : 'bg-blue-900/50 text-blue-300'
                              }`}>
                                {task.status === 'completed' ? '完了' : task.status === 'in_progress' ? '進行中' : '待機中'}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-sm text-stone-400 mt-1">{task.description}</p>
                            )}
                            {task.owner && (
                              <p className="text-xs text-stone-500 mt-2">担当: {task.owner}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  {teamInboxes ? (
                    <TeamInboxesView teamName={selectedTeam.config.name} inboxes={teamInboxes.agents} />
                  ) : (
                    <div className="text-center py-12 text-stone-500">
                      メッセージデータを読み込み中...
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
