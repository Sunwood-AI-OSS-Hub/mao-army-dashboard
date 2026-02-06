'use client';

import * as React from 'react';
import { Search, Bell } from 'lucide-react';
import Image from 'next/image';

interface InfernoHeaderProps {
  userName?: string;
  userAvatar?: string;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onOpenVault: () => void;
  vaultUnreadCount?: number;
}

export function InfernoHeader({
  userName = 'DEMON LORD #001',
  userAvatar = 'https://via.placeholder.com/36',
  searchQuery,
  onSearchQueryChange,
  onOpenVault,
  vaultUnreadCount,
}: InfernoHeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-30">
      {/* 左側 - ロゴ */}
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-2xl">security</span>
        <h2 className="text-lg lg:text-xl font-bold tracking-tighter uppercase italic ember-text text-white">
          魔王軍 AGI ダッシュボード
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
          className="bg-stone-900 border-white/5 rounded pl-10 pr-4 py-1.5 text-sm focus:ring-primary focus:border-primary w-64 text-stone-300 focus:outline-none focus:ring-1 transition-all"
        />
      </div>

      {/* 右側 - ユーザー情報 */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenVault}
          className="relative text-stone-500 hover:text-primary transition-colors p-1"
          aria-label="Open vault"
        >
          <Bell className="w-5 h-5" />
          {vaultUnreadCount && vaultUnreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 bg-lava-red text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full font-bold border border-white/10">
              {vaultUnreadCount > 99 ? '99+' : vaultUnreadCount}
            </span>
          ) : null}
        </button>
        <div className="h-6 w-[1px] bg-white/5 mx-1 hidden sm:block"></div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs font-bold text-stone-500 hidden sm:block">{userName}</span>
          <div className="size-9 rounded-full bg-stone-900 border border-primary/50 glow-red overflow-hidden">
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
