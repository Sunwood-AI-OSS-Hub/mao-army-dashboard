'use client';

import * as React from 'react';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import Image from 'next/image';

export type ThemeMode = 'dark' | 'light';

interface InfernoHeaderProps {
  userName?: string;
  userAvatar?: string;
  appName: string;
  theme: ThemeMode;
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onOpenVault: () => void;
  vaultUnreadCount?: number;
}

export function InfernoHeader({
  userName = 'DEMON LORD #001',
  userAvatar = 'https://via.placeholder.com/36',
  appName,
  theme,
  onToggleTheme,
  searchQuery,
  onSearchQueryChange,
  onOpenVault,
  vaultUnreadCount,
}: InfernoHeaderProps) {
  const isDark = theme === 'dark';

  return (
    <header
      className={[
        'h-16 flex items-center justify-between px-6 lg:px-8 backdrop-blur-xl sticky top-0 z-30',
        isDark ? 'border-b border-white/5 bg-black/40' : 'border-b border-black/10 bg-white/70',
      ].join(' ')}
    >
      {/* 左側 - ロゴ */}
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-2xl">
          security
        </span>
        <h2
          className={[
            'text-lg lg:text-xl font-bold tracking-tighter uppercase italic',
            isDark ? 'ember-text text-white' : 'text-stone-900',
          ].join(' ')}
        >
          {appName}
        </h2>
      </div>

      {/* 中央 - 検索バー（デスクトップのみ） */}
      <div className="relative hidden lg:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm" />
        <input
          type="text"
          placeholder="Search teams, tasks..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className={[
            'rounded pl-10 pr-4 py-1.5 text-sm w-64 focus:outline-none focus:ring-1 transition-all',
            isDark
              ? 'bg-stone-900 border border-white/5 text-stone-300 focus:ring-primary focus:border-primary'
              : 'bg-white border border-black/10 text-stone-900 focus:ring-primary focus:border-primary',
          ].join(' ')}
        />
      </div>

      {/* 右側 - ユーザー情報 */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleTheme}
          className={isDark ? 'text-stone-500 hover:text-primary transition-colors p-1' : 'text-stone-600 hover:text-primary transition-colors p-1'}
          aria-label="Toggle theme"
          title={isDark ? 'Switch to light' : 'Switch to dark'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          type="button"
          onClick={onOpenVault}
          className={isDark ? 'relative text-stone-500 hover:text-primary transition-colors p-1' : 'relative text-stone-600 hover:text-primary transition-colors p-1'}
          aria-label="Open vault"
        >
          <Bell className="w-5 h-5" />
          {vaultUnreadCount && vaultUnreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 bg-lava-red text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full font-bold border border-white/10">
              {vaultUnreadCount > 99 ? '99+' : vaultUnreadCount}
            </span>
          ) : null}
        </button>
        <div className={isDark ? 'h-6 w-[1px] bg-white/5 mx-1 hidden sm:block' : 'h-6 w-[1px] bg-black/10 mx-1 hidden sm:block'}></div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={isDark ? 'text-xs font-bold text-stone-500 hidden sm:block' : 'text-xs font-bold text-stone-600 hidden sm:block'}>
            {userName}
          </span>
          <div className={isDark ? 'size-9 rounded-full bg-stone-900 border border-primary/50 glow-red overflow-hidden' : 'size-9 rounded-full bg-white border border-primary/30 overflow-hidden'}>
            <Image
              className="w-full h-full object-cover"
              src={userAvatar}
              alt="User Avatar"
              width={36}
              height={36}
              unoptimized
            />
          </div>
        </div>
      </div>
    </header>
  );
}
