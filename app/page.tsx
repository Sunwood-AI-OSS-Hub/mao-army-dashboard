'use client';

import * as React from 'react';
import { DemonLordHeader, TeamCard } from '@/components';
import { Button } from '@/components/ui';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, X, MessageSquare } from 'lucide-react';
import { TeamInboxesView } from '@/components/AgentInboxView';
import type { TeamSummary, TeamMonitorData, TeamInboxData } from '@/types';

export default function HomePage() {
  const [teams, setTeams] = React.useState<TeamSummary[]>([]);
  const [selectedTeam, setSelectedTeam] = React.useState<TeamMonitorData | null>(null);
  const [teamInboxes, setTeamInboxes] = React.useState<TeamInboxData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'info' | 'inbox'>('info');

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
            activeTasks: d.tasks.filter(t => t.status === 'in_progress').length,
            completedTasks: d.tasks.filter(t => t.status === 'completed').length,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-gray-950 to-purple-950">
      <DemonLordHeader />

      <main className="container mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-purple-200">軍団一覧</h1>
          <Button
            data-testid="refresh-button"
            onClick={fetchTeams}
            disabled={loading}
            variant="outline"
            className="border-purple-700/50 hover:bg-purple-900/30"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            更新
          </Button>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-700/50 text-red-200">
            {error}
          </div>
        )}

        {/* ローディング表示 */}
        {loading && teams.length === 0 && (
          <div className="text-center py-12 text-purple-300/70">
            読み込み中...
          </div>
        )}

        {/* チーム一覧 */}
        {!loading && teams.length === 0 && (
          <div className="text-center py-12 text-purple-300/70">
            チームがありません
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard
              key={team.name}
              team={team}
              onClick={() => handleTeamClick(team)}
            />
          ))}
        </div>

        {/* フッター */}
        <footer className="text-center py-8 border-t border-purple-800/30 mt-12">
          <p className="text-purple-300/50 text-sm">
            魔王軍団ダッシュボード v0.1.0
          </p>
          <p className="text-purple-300/30 text-xs mt-1">
            ……ふふ、私がここで待ってるから
          </p>
        </footer>
      </main>

      {/* チーム詳細モーダル */}
      {selectedTeam && (
        <div
          data-testid="team-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={handleCloseModal}
        >
          <Card
            className="max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col bg-purple-950/90 border-purple-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-purple-800/30 shrink-0">
              <h2 className="text-2xl font-bold text-purple-200">{selectedTeam.config.name}</h2>
              <button
                data-testid="modal-close"
                onClick={handleCloseModal}
                className="text-purple-400 hover:text-purple-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* タブ */}
            <div className="flex border-b border-purple-800/30 shrink-0">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'info'
                    ? 'text-purple-200 border-b-2 border-purple-500 bg-purple-900/30'
                    : 'text-purple-400/70 hover:text-purple-300 hover:bg-purple-900/20'
                }`}
              >
                チーム情報
              </button>
              <button
                onClick={() => setActiveTab('inbox')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'inbox'
                    ? 'text-purple-200 border-b-2 border-purple-500 bg-purple-900/30'
                    : 'text-purple-400/70 hover:text-purple-300 hover:bg-purple-900/20'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                メッセージ
                {teamInboxes && teamInboxes.agents.some(a => a.unreadCount > 0) && (
                  <span className="ml-1 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            </div>

            <CardContent className="p-6 overflow-y-auto flex-1">
              {activeTab === 'info' ? (
                <div className="space-y-6">
              {/* 説明 */}
              <div>
                <h3 className="text-sm font-semibold text-purple-300/70 mb-2">説明</h3>
                <p className="text-purple-100">{selectedTeam.config.description}</p>
              </div>

              {/* メンバー一覧 */}
              <div>
                <h3 className="text-sm font-semibold text-purple-300/70 mb-3">
                  メンバー ({selectedTeam.config.members.length})
                </h3>
                <div className="space-y-2">
                  {selectedTeam.config.members.map((member) => (
                    <div
                      key={member.agentId}
                      className="p-3 rounded-lg bg-purple-900/30 border border-purple-800/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-semibold text-purple-200">{member.name}</div>
                          <div className="text-xs text-purple-300/50">{member.agentType}</div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          member.isActive
                            ? 'bg-green-900/50 text-green-300 border border-green-700/50'
                            : 'bg-gray-900/50 text-gray-400 border border-gray-700/50'
                        }`}>
                          {member.isActive ? 'アクティブ' : 'オフライン'}
                        </div>
                      </div>
                      {member.description && (
                        <p className="text-xs text-purple-300/70 whitespace-pre-wrap line-clamp-3">
                          {member.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* タスク一覧 */}
              <div>
                <h3 className="text-sm font-semibold text-purple-300/70 mb-3">
                  タスク ({selectedTeam.tasks.length})
                </h3>
                {selectedTeam.tasks.length === 0 ? (
                  <p className="text-purple-300/50 text-sm">タスクはありません</p>
                ) : (
                  <div className="space-y-2">
                    {selectedTeam.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg bg-purple-900/30 border border-purple-800/30"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-purple-200">{task.subject}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.status === 'completed'
                              ? 'bg-green-900/50 text-green-300'
                              : task.status === 'in_progress'
                              ? 'bg-yellow-900/50 text-yellow-300'
                              : 'bg-blue-900/50 text-blue-300'
                          }`}>
                            {task.status === 'completed' ? '完了' : task.status === 'in_progress' ? '進行中' : '待機中'}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-sm text-purple-300/70 mt-1">{task.description}</p>
                        )}
                        {task.owner && (
                          <p className="text-xs text-purple-300/50 mt-2">担当: {task.owner}</p>
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
                  <div className="text-center py-12 text-purple-300/50">
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
