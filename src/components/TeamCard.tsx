'use client';

import * as React from 'react';
import { Users, CheckCircle2, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { cn, formatTime } from '@/lib/utils';
import type { TeamSummary } from '@/types';

interface TeamCardProps {
  team: TeamSummary;
  onClick?: () => void;
}

export function TeamCard({ team, onClick }: TeamCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const completionRate = team.totalTasks > 0
    ? Math.round((team.completedTasks / team.totalTasks) * 100)
    : 0;

  return (
    <Card
      data-testid="team-card"
      className={cn(
        'group relative overflow-hidden transition-all duration-300',
        'hover:shadow-2xl hover:shadow-purple-900/40',
        'hover:-translate-y-1 hover:scale-[1.02]',
        onClick && 'cursor-pointer',
        team.isActive && 'border-amber-700/50 shadow-lg shadow-amber-900/20'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* アクティブチームの光るエフェクト */}
      {team.isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      {/* ホバー時の光沢エフェクト */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent',
          'transition-opacity duration-500',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          background: isHovered
            ? 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.1), transparent)'
            : 'none',
        }}
      />

      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              {team.name}
              {team.isActive && (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </span>
              )}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {team.description}
            </CardDescription>
          </div>

          {/* 装飾的なアイコン */}
          {isHovered && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        {/* 統計情報 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-lg bg-purple-950/50 p-3 border border-purple-800/30">
            <Users className="mb-1 h-4 w-4 text-purple-400" />
            <span className="text-2xl font-bold text-purple-100">{team.memberCount}</span>
            <span className="text-xs text-purple-300/70">メンバー</span>
          </div>

          <div className="flex flex-col items-center rounded-lg bg-purple-950/50 p-3 border border-purple-800/30">
            <Clock className="mb-1 h-4 w-4 text-yellow-400" />
            <span className="text-2xl font-bold text-purple-100">{team.activeTasks}</span>
            <span className="text-xs text-purple-300/70">進行中</span>
          </div>

          <div className="flex flex-col items-center rounded-lg bg-purple-950/50 p-3 border border-purple-800/30">
            <CheckCircle2 className="mb-1 h-4 w-4 text-green-400" />
            <span className="text-2xl font-bold text-purple-100">{team.completedTasks}</span>
            <span className="text-xs text-purple-300/70">完了</span>
          </div>
        </div>

        {/* 進行状況バー */}
        {team.totalTasks > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-300/70">進行状況</span>
              <span className="font-semibold text-purple-100">{completionRate}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-purple-950 border border-purple-800/30">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500 ease-out',
                  completionRate >= 75 ? 'bg-gradient-to-r from-green-600 to-green-500' :
                  completionRate >= 50 ? 'bg-gradient-to-r from-yellow-600 to-yellow-500' :
                  'bg-gradient-to-r from-purple-600 to-purple-500'
                )}
                style={{
                  width: `${completionRate}%`,
                  boxShadow: isHovered ? '0 0 10px currentColor' : 'none',
                }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="relative z-10 flex items-center justify-between border-t border-purple-800/20">
        <span className="text-xs text-purple-300/50">
          最終更新: {formatTime(team.lastUpdated)}
        </span>
        {onClick && (
          <div className={cn(
            'flex items-center gap-1 text-sm text-purple-400',
            'transition-transform duration-300',
            isHovered && 'translate-x-1'
          )}>
            詳細を見る
            <ArrowRight className={cn(
              'h-4 w-4 transition-transform duration-300',
              isHovered && 'translate-x-1'
            )} />
          </div>
        )}
      </CardFooter>

      {/* カードの下に光るライン（ホバー時） */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent',
          'transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
      />
    </Card>
  );
}
