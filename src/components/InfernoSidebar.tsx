'use client';

import * as React from 'react';
import {
  Dashboard,
  Group,
  Assignment,
  ChatBubble,
  AddCircle,
} from './InfernoIcons';
import type { ThemeMode } from './InfernoHeader';

export type SidebarView = 'overview' | 'teams' | 'missions' | 'vault';

interface NavItem {
  view: SidebarView;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number | string;
}

const navItems: NavItem[] = [
  { view: 'overview', icon: Dashboard, label: 'Overview' },
  { view: 'teams', icon: Group, label: 'Teams' },
  { view: 'missions', icon: Assignment, label: 'Mission Log' },
  { view: 'vault', icon: ChatBubble, label: 'Vault' },
];

export function InfernoSidebar({
  activeView,
  onNavigate,
  onRefresh,
  vaultUnreadCount,
  theme,
}: {
  activeView: SidebarView;
  onNavigate: (view: SidebarView) => void;
  onRefresh: () => void;
  vaultUnreadCount?: number;
  theme: ThemeMode;
}) {
  const isDark = theme === 'dark';
  return (
    <aside
      className={[
        'w-64 flex-shrink-0 flex flex-col justify-between z-20',
        isDark ? 'burnt-sidebar border-r border-primary/20' : 'bg-white border-r border-silver',
      ].join(' ')}
    >
      <div className="p-6 relative z-10">
        {/* ロゴ */}
        <div className="flex items-center gap-3 mb-10">
          <div
            className={[
              'size-10 rounded flex items-center justify-center',
              isDark ? 'bg-gradient-to-br from-primary to-lava-red glow-red-intense' : 'bg-primary/10 text-primary rounded-lg',
            ].join(' ')}
          >
            <span className="material-symbols-outlined text-stone-100 text-2xl">skull</span>
          </div>
          <div>
            <h1 className="text-stone-100 text-lg font-bold leading-tight tracking-tight uppercase italic">
              {isDark ? '魔王軍' : 'Agent Teams'}
            </h1>
            <p className={isDark ? 'text-primary text-[10px] font-bold tracking-[0.2em] uppercase' : 'text-xs text-stone-500 font-medium'}>
              {isDark ? 'AGI Dashboard' : 'Team Console'}
            </p>
          </div>
        </div>

        {/* ナビゲーション */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.view === activeView;
            const badge =
              item.view === 'vault'
                ? (vaultUnreadCount && vaultUnreadCount > 0 ? vaultUnreadCount : undefined)
                : item.badge;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => onNavigate(item.view)}
                className={[
                  'w-full flex items-center gap-3 px-4 py-3 rounded transition-all',
                  isDark
                    ? (isActive
                        ? 'bg-primary/20 border-l-4 border-primary text-stone-100 font-semibold glow-red'
                        : 'text-stone-500 hover:bg-white/5 hover:text-stone-100')
                    : (isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-200'),
                ].join(' ')}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {badge !== undefined && (
                  <span className={isDark ? 'ml-auto bg-lava-red text-[10px] px-1.5 py-0.5 rounded-full font-bold text-white' : 'ml-auto bg-lava-red text-[10px] px-1.5 py-0.5 rounded-full font-bold text-white'}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6 relative z-10">
        <button
          type="button"
          onClick={onRefresh}
          className={[
            'w-full flex items-center justify-center gap-2 py-3 rounded font-bold transition-all uppercase tracking-widest text-xs',
            isDark
              ? 'bg-stone-900 border border-primary/30 text-primary hover:bg-primary hover:text-stone-100 glow-amber'
              : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20',
          ].join(' ')}
        >
          <AddCircle className="w-4 h-4" />
          Refresh
        </button>
      </div>
    </aside>
  );
}
