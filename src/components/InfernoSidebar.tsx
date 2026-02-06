'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Dashboard,
  Group,
  Assignment,
  ChatBubble,
  Settings,
  AddCircle,
} from './InfernoIcons';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number | string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { href: '#', icon: Dashboard, label: 'Overview', active: true },
  { href: '#teams', icon: Group, label: 'Teams' },
  { href: '#tasks', icon: Assignment, label: 'Tasks' },
  { href: '#messages', icon: ChatBubble, label: 'Messages', badge: 12 },
  { href: '#settings', icon: Settings, label: 'Settings' },
];

export function InfernoSidebar() {
  return (
    <aside className="w-64 flex-shrink-0 burnt-sidebar border-r border-primary/20 flex flex-col justify-between z-20">
      <div className="p-6 relative z-10">
        {/* ロゴ */}
        <div className="flex items-center gap-3 mb-10">
          <div className="size-10 bg-gradient-to-br from-primary to-lava-red rounded flex items-center justify-center glow-red-intense">
            <span className="material-symbols-outlined text-white text-2xl">skull</span>
          </div>
          <div>
            <h1 className="text-white text-lg font-bold leading-tight tracking-tight uppercase italic">
              Agent ZERO
            </h1>
            <p className="text-primary text-[10px] font-bold tracking-[0.2em] uppercase">
              Command Center
            </p>
          </div>
        </div>

        {/* ナビゲーション */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded transition-all ${
                  item.active
                    ? 'bg-primary/20 border-l-4 border-primary text-white font-semibold glow-red'
                    : 'text-stone-500 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-lava-red text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 relative z-10">
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded bg-stone-900 border border-primary/30 text-primary font-bold hover:bg-primary hover:text-white transition-all uppercase tracking-widest text-xs glow-amber">
          <AddCircle className="w-4 h-4" />
          New Scheme
        </button>
      </div>
    </aside>
  );
}
