'use client';

import * as React from 'react';
import { Users, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TeamSummary } from '@/types';

interface InfernoTeamCardProps {
  team: TeamSummary;
  onClick?: () => void;
}

export function InfernoTeamCard({ team, onClick }: InfernoTeamCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const completionRate = team.totalTasks > 0
    ? Math.round((team.completedTasks / team.totalTasks) * 100)
    : 0;

  return (
    <div
      data-testid="team-card"
      className={cn(
        'stone-texture p-6 rounded-xl border border-white/5 relative overflow-hidden transition-all duration-300 cursor-pointer group',
        'hover:border-primary/50',
        onClick && 'hover:scale-[1.02]',
        team.isActive && 'border-primary/30 glow-red'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* 背景グロー（ホバー時） */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* アクティブインジケーター */}
      {team.isActive && (
        <div className="absolute top-4 right-4">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
          </span>
        </div>
      )}

      {/* コンテンツ */}
      <div className="relative z-10">
        {/* チーム名 */}
        <h3 className="text-xl font-bold text-white mb-1 ember-text group-hover:text-primary transition-colors">
          {team.name}
        </h3>
        <p className="text-stone-400 text-sm mb-6 line-clamp-2 min-h-[2.5rem]">
          {team.description}
        </p>

        {/* 統計情報 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="flex flex-col items-center rounded-lg bg-black/30 p-3 border border-white/5">
            <Users className="mb-1 h-4 w-4 text-primary" />
            <span className="text-2xl font-bold text-stone-100">{team.memberCount}</span>
            <span className="text-[10px] text-stone-500 uppercase">Members</span>
          </div>

          <div className="flex flex-col items-center rounded-lg bg-black/30 p-3 border border-white/5">
            <Clock className="mb-1 h-4 w-4 text-amber-glow" />
            <span className="text-2xl font-bold text-stone-100">{team.activeTasks}</span>
            <span className="text-[10px] text-stone-500 uppercase">Active</span>
          </div>

          <div className="flex flex-col items-center rounded-lg bg-black/30 p-3 border border-white/5">
            <CheckCircle2 className="mb-1 h-4 w-4 text-green-400" />
            <span className="text-2xl font-bold text-stone-100">{team.completedTasks}</span>
            <span className="text-[10px] text-stone-500 uppercase">Done</span>
          </div>
        </div>

        {/* 進行状況バー */}
        {team.totalTasks > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500 uppercase tracking-wider">Progress</span>
              <span className="font-bold text-stone-300">{completionRate}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-stone-900 border border-white/5">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500 ease-out',
                  completionRate >= 75 ? 'bg-gradient-to-r from-green-600 to-green-500' :
                  completionRate >= 50 ? 'bg-gradient-to-r from-amber-600 to-amber-500' :
                  'bg-gradient-to-r from-primary to-lava-red'
                )}
                style={{
                  width: `${completionRate}%`,
                  boxShadow: isHovered ? '0 0 10px currentColor' : 'none',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="relative z-10 flex items-center justify-between mt-6 pt-4 border-t border-white/5">
        <span className="text-[10px] text-stone-600 uppercase font-bold">
          Updated: {new Date(team.lastUpdated).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
        </span>
        {onClick && (
          <div className={cn(
            'flex items-center gap-1 text-xs text-primary',
            'transition-transform duration-300',
            isHovered && 'translate-x-1'
          )}>
            View Details
            <ArrowRight className={cn(
              'w-4 h-4 transition-transform duration-300',
              isHovered && 'translate-x-1'
            )} />
          </div>
        )}
      </div>
    </div>
  );
}
