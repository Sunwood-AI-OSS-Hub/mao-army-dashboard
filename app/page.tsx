'use client';

import * as React from 'react';
import { RefreshCw, X, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import heroImage from '../image2.png';
import {
  InfernoSidebar,
  InfernoHeader,
  InfernoStatsCard,
  InfernoTeamCard,
} from '@/components';
import { Button } from '@/components/ui';
import { Card, CardContent } from '@/components/ui/card';
import { TeamInboxesView } from '@/components/AgentInboxView';
import type { TeamSummary, TeamMonitorData, TeamInboxData } from '@/types';
import type { SidebarView } from '@/components/InfernoSidebar';

type View = SidebarView;

function normalizeQuery(q: string) {
  return q.trim().toLowerCase();
}

export default function HomePage() {
  const [teams, setTeams] = React.useState<TeamSummary[]>([]);
  const [monitorData, setMonitorData] = React.useState<TeamMonitorData[]>([]);
  const [selectedTeam, setSelectedTeam] = React.useState<TeamMonitorData | null>(null);
  const [teamInboxes, setTeamInboxes] = React.useState<TeamInboxData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'info' | 'inbox'>('info');
  const [view, setView] = React.useState<View>('overview');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [vaultLoading, setVaultLoading] = React.useState(false);
  const [vaultError, setVaultError] = React.useState<string | null>(null);
  const [vaultData, setVaultData] = React.useState<TeamInboxData[] | null>(null);

  // 総計統計を計算
  const totalMembers = React.useMemo(() => teams.reduce((sum, t) => sum + t.memberCount, 0), [teams]);
  const totalActiveTasks = React.useMemo(() => teams.reduce((sum, t) => sum + t.activeTasks, 0), [teams]);

  const vaultUnreadCount = React.useMemo(() => {
    if (!vaultData) return 0;
    return vaultData.reduce((sum, team) => {
      const teamUnread = team.agents.reduce((s, a) => s + a.unreadCount, 0);
      return sum + teamUnread;
    }, 0);
  }, [vaultData]);

  const filteredTeams = React.useMemo(() => {
    const q = normalizeQuery(searchQuery);
    if (!q) return teams;
    return teams.filter(t =>
      `${t.name} ${t.description}`.toLowerCase().includes(q)
    );
  }, [teams, searchQuery]);

  const allTasks = React.useMemo(() => {
    const q = normalizeQuery(searchQuery);
    const tasks = monitorData.flatMap(team => team.tasks.map(task => ({
      teamName: team.config.name,
      task,
    })));
    if (!q) return tasks;
    return tasks.filter(({ teamName, task }) => {
      const hay = `${teamName} ${task.subject} ${task.description ?? ''} ${task.owner ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [monitorData, searchQuery]);

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
  const fetchTeamDetail = React.useCallback(async (teamName: string, initialTab: 'info' | 'inbox' = 'info') => {
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
      setActiveTab(initialTab);
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
          setMonitorData(message.data);
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

  const handleTeamClick = (team: TeamSummary, initialTab: 'info' | 'inbox' = 'info') => {
    fetchTeamDetail(team.name, initialTab);
  };

  const handleCloseModal = () => {
    setSelectedTeam(null);
    setTeamInboxes(null);
    setActiveTab('info');
  };

  const fetchVault = React.useCallback(async () => {
    try {
      setVaultLoading(true);
      setVaultError(null);
      const res = await fetch('/api/inboxes');
      if (!res.ok) throw new Error('Vaultデータの取得に失敗しました');
      const data = await res.json();
      setVaultData(data);
    } catch (e) {
      setVaultError(e instanceof Error ? e.message : '不明なエラー');
    } finally {
      setVaultLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (view !== 'vault') return;
    if (vaultData) return;
    fetchVault();
  }, [view, vaultData, fetchVault]);

  return (
    <div className="flex h-screen overflow-hidden bg-background-dark">
      {/* サイドバー */}
      <InfernoSidebar
        activeView={view}
        onNavigate={(v) => setView(v)}
        onRefresh={() => fetchTeams()}
        vaultUnreadCount={vaultUnreadCount}
      />

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <InfernoHeader
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onOpenVault={() => setView('vault')}
          vaultUnreadCount={vaultUnreadCount}
        />

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {/* ヒーローセクション */}
          <div className="relative w-full h-64 lg:h-80 rounded-xl overflow-hidden mb-8 glow-red-intense group">
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-background-dark/80 via-transparent to-transparent z-10" />

            {/* ヒーロー背景画像 */}
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="absolute inset-0 object-cover object-center"
            />

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
                    魔王軍 AGI
                  </h1>
                  <p className="text-amber-glow font-bold tracking-[0.3em] text-xs lg:text-sm uppercase flex items-center gap-2">
                    <span className="h-px w-6 lg:w-8 bg-amber-glow"></span>
                    Team Monitor Dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* タブ */}
          <div className="border-b border-white/5 flex gap-8 lg:gap-10 mb-8">
            <button
              type="button"
              onClick={() => setView('overview')}
              className={`pb-4 border-b-2 font-bold text-sm tracking-widest uppercase transition-colors ${
                view === 'overview'
                  ? 'border-primary text-primary ember-text'
                  : 'border-transparent text-stone-500 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setView('teams')}
              className={`pb-4 border-b-2 font-bold text-sm tracking-widest uppercase transition-colors ${
                view === 'teams'
                  ? 'border-primary text-primary ember-text'
                  : 'border-transparent text-stone-500 hover:text-white'
              }`}
            >
              Team Roster
            </button>
            <button
              type="button"
              onClick={() => setView('missions')}
              className={`pb-4 border-b-2 font-bold text-sm tracking-widest uppercase transition-colors ${
                view === 'missions'
                  ? 'border-primary text-primary ember-text'
                  : 'border-transparent text-stone-500 hover:text-white'
              }`}
            >
              Mission Log
            </button>
            <button
              type="button"
              onClick={() => setView('vault')}
              className={`pb-4 border-b-2 font-bold text-sm tracking-widest uppercase transition-colors ${
                view === 'vault'
                  ? 'border-primary text-primary ember-text'
                  : 'border-transparent text-stone-500 hover:text-white'
              }`}
            >
              The Vault
              {vaultUnreadCount > 0 ? (
                <span className="ml-2 inline-flex items-center justify-center bg-lava-red text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full font-bold border border-white/10">
                  {vaultUnreadCount > 99 ? '99+' : vaultUnreadCount}
                </span>
              ) : null}
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
          {/* 統計カード（全ビュー共通） */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <InfernoStatsCard
              type="soldiers"
              value={totalMembers}
              description="Total members"
            />
            <InfernoStatsCard
              type="conquests"
              value={teams.reduce((sum, t) => sum + t.completedTasks, 0)}
              description="Tasks completed"
            />
            <InfernoStatsCard
              type="schemes"
              value={totalActiveTasks}
              status={totalActiveTasks > 0 ? 'active' : undefined}
              description={totalActiveTasks > 0 ? 'Tasks in progress' : 'No active tasks'}
            />
          </div>

          {/* Overview / Teams */}
          {(view === 'overview' || view === 'teams') && (
            <div className="space-y-8">
              {/* 操作バー */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                  {view === 'teams' ? 'Team Roster' : 'Active Legions'}
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

              {!loading && filteredTeams.length === 0 && (
                <div className="text-center py-12 text-stone-500">
                  {searchQuery ? '一致する軍団がありません' : '軍団がありません'}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTeams.map((team) => (
                  <InfernoTeamCard
                    key={team.name}
                    team={team}
                    onClick={() => handleTeamClick(team, 'info')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Mission Log */}
          {view === 'missions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                  Mission Log
                </h2>
                <Button
                  onClick={fetchTeams}
                  disabled={loading}
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/20 text-primary hover:text-white"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              <Card className="bg-stone-900/60 border-white/5">
                <CardContent className="p-6">
                  {allTasks.length === 0 ? (
                    <div className="text-center py-12 text-stone-500">
                      タスクがありません（SSEの初回更新待ちの可能性があります）
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {allTasks
                        .slice()
                        .sort((a, b) => (a.task.status === b.task.status ? 0 : a.task.status === 'in_progress' ? -1 : 1))
                        .map(({ teamName, task }) => (
                          <button
                            key={`${teamName}:${task.id}`}
                            type="button"
                            onClick={() => fetchTeamDetail(teamName, 'info')}
                            className="w-full text-left p-4 rounded-lg bg-black/30 border border-white/5 hover:border-primary/30 transition-all"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <div className="text-xs text-stone-500 font-bold uppercase tracking-widest">
                                  {teamName}
                                </div>
                                <div className="text-stone-100 font-bold truncate">
                                  {task.subject}
                                </div>
                                {task.description ? (
                                  <div className="text-sm text-stone-400 mt-1 line-clamp-2">
                                    {task.description}
                                  </div>
                                ) : null}
                              </div>
                              <div className={`shrink-0 text-xs px-2 py-1 rounded-full ${
                                task.status === 'completed'
                                  ? 'bg-green-900/50 text-green-300'
                                  : task.status === 'in_progress'
                                  ? 'bg-amber-900/50 text-amber-300'
                                  : 'bg-blue-900/50 text-blue-300'
                              }`}>
                                {task.status === 'completed' ? '完了' : task.status === 'in_progress' ? '進行中' : '待機中'}
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* The Vault */}
          {view === 'vault' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                  The Vault (Inboxes)
                </h2>
                <Button
                  onClick={fetchVault}
                  disabled={vaultLoading}
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/20 text-primary hover:text-white"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${vaultLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {vaultError ? (
                <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-700/50 text-red-200">
                  {vaultError}
                </div>
              ) : null}

              <Card className="bg-stone-900/60 border-white/5">
                <CardContent className="p-6">
                  {vaultLoading && !vaultData ? (
                    <div className="text-center py-12 text-stone-500">
                      読み込み中...
                    </div>
                  ) : vaultData && vaultData.length === 0 ? (
                    <div className="text-center py-12 text-stone-500">
                      inbox がありません
                    </div>
                  ) : vaultData ? (
                    <div className="space-y-3">
                      {vaultData.map((team) => {
                        const teamUnread = team.agents.reduce((s, a) => s + a.unreadCount, 0);
                        return (
                          <button
                            key={team.teamName}
                            type="button"
                            onClick={() => fetchTeamDetail(team.teamName, 'inbox')}
                            className="w-full text-left p-4 rounded-lg bg-black/30 border border-white/5 hover:border-primary/30 transition-all"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <div className="text-stone-100 font-bold truncate">
                                  {team.teamName}
                                </div>
                                <div className="text-xs text-stone-500 mt-1">
                                  agents: {team.agents.length}
                                </div>
                              </div>
                              {teamUnread > 0 ? (
                                <span className="shrink-0 bg-lava-red text-white text-[10px] leading-none px-2 py-1 rounded-full font-bold border border-white/10">
                                  {teamUnread > 99 ? '99+' : teamUnread} unread
                                </span>
                              ) : (
                                <span className="shrink-0 text-xs text-stone-600">
                                  0 unread
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-stone-500">
                      Vaultデータがありません
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* フッター */}
          <footer className="text-center py-8 border-t border-white/5 mt-12">
            <p className="text-stone-600 text-sm">
              魔王軍 AGI ダッシュボード v0.1.0
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
                    <TeamInboxesView inboxes={teamInboxes.agents} />
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
