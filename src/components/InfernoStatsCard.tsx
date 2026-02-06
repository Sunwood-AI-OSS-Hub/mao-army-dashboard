'use client';

import * as React from 'react';
import { Swords, Flag, Fireplace } from './InfernoIcons';

interface InfernoStatsCardProps {
  type: 'soldiers' | 'conquests' | 'schemes';
  value: string | number;
  change?: string;
  status?: 'active' | null;
  description: string;
}

export function InfernoStatsCard({
  type,
  value,
  change,
  status,
  description,
}: InfernoStatsCardProps) {
  const config = {
    soldiers: {
      icon: Swords,
      label: 'SOLDIERS',
      color: 'primary',
    },
    conquests: {
      icon: Flag,
      label: 'CONQUESTS',
      color: 'primary',
    },
    schemes: {
      icon: Fireplace,
      label: 'CURRENT SCHEMES',
      color: 'amber-glow',
    },
  };

  const { icon: Icon, label } = config[type];

  return (
    <div className="stone-texture p-6 rounded-xl border border-white/5 relative overflow-hidden group hover:border-primary/50 transition-all">
      {/* 背景アイコン */}
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
        <Icon className="w-16 h-16 text-primary" />
      </div>

      {/* ラベル */}
      <h3 className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-2">
        {label}
      </h3>

      {/* 値と変化 */}
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black text-white italic ember-text">
          {value}
        </span>
        {change && (
          <span className="text-primary text-xs font-bold">+{change}</span>
        )}
        {status === 'active' && (
          <span className="text-amber-glow text-xs font-bold px-2 py-0.5 bg-amber-glow/10 rounded">
            ACTIVE
          </span>
        )}
      </div>

      {/* 説明 */}
      <p className="text-[10px] text-stone-600 mt-2 uppercase font-bold">
        {description}
      </p>
    </div>
  );
}
