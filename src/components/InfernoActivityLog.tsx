'use client';

import * as React from 'react';
import { PersonAdd, AssignmentTurnedIn, Bolt, Chat } from './InfernoIcons';

interface ActivityItem {
  id: string;
  type: 'new_agent' | 'task_assigned' | 'scheme_initiated' | 'new_intel';
  title: string;
  description: string;
  time: string;
  highlighted?: boolean;
}

interface InfernoActivityLogProps {
  activities: ActivityItem[];
  onLoadMore?: () => void;
}

export function InfernoActivityLog({ activities, onLoadMore }: InfernoActivityLogProps) {
  const getActivityConfig = (type: ActivityItem['type']) => {
    switch (type) {
      case 'new_agent':
        return {
          icon: PersonAdd,
          borderColor: 'border-primary',
          textColor: 'text-primary',
          bgClass: 'bg-stone-900 text-primary glow-red-intense',
        };
      case 'task_assigned':
        return {
          icon: AssignmentTurnedIn,
          borderColor: 'border-amber-glow',
          textColor: 'text-amber-glow',
          bgClass: 'bg-stone-900 text-amber-glow glow-amber',
        };
      case 'scheme_initiated':
        return {
          icon: Bolt,
          borderColor: 'border-primary',
          textColor: 'text-primary',
          bgClass: 'bg-stone-900 text-primary glow-red-intense',
        };
      case 'new_intel':
      default:
        return {
          icon: Chat,
          borderColor: 'border-stone-800',
          textColor: 'text-stone-600',
          bgClass: 'bg-stone-900 text-stone-600',
        };
    }
  };

  return (
    <div className="stone-texture border border-white/5 rounded-xl p-6 h-full relative overflow-hidden">
      {/* 背景グロー */}
      <div className="absolute top-0 right-0 size-32 bg-primary/5 blur-3xl rounded-full" />

      {/* ヘッダー */}
      <h3 className="text-lg font-bold italic uppercase tracking-tighter text-white mb-8 flex items-center gap-2">
        <History className="w-5 h-5 text-amber-glow" />
        Activity Log
      </h3>

      {/* アクティビティタイムライン */}
      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/20 before:to-transparent">
        {activities.map((activity) => {
          const config = getActivityConfig(activity.type);
          const Icon = config.icon;

          return (
            <div key={activity.id} className="relative flex items-center group">
              {/* アイコン */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${config.borderColor} ${config.bgClass} shrink-0 z-10 transition-transform group-hover:scale-110`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* コンテンツ */}
              <div className="flex-1 ml-6 p-4 rounded-lg bg-black/40 border border-white/5 hover:border-primary/20 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-stone-200 text-xs">
                    {activity.title}
                  </div>
                  <time className="font-bold text-[10px] text-stone-600 uppercase">
                    {activity.time}
                  </time>
                </div>
                <div
                  className={`text-xs ${activity.highlighted ? config.textColor : 'text-stone-400'}`}
                >
                  {activity.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* もっと見るボタン */}
      {onLoadMore && (
        <button
          onClick={onLoadMore}
          className="w-full mt-10 py-3 rounded border border-white/10 text-[10px] font-bold text-stone-500 hover:text-primary hover:border-primary transition-all uppercase tracking-[0.3em] bg-black/20"
        >
          Load Archival Logs
        </button>
      )}
    </div>
  );
}

// History icon for the header
function History({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
