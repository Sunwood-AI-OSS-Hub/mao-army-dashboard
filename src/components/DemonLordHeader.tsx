'use client';

import * as React from 'react';
import { Flame, Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemonLordHeaderProps {
  title?: string;
  subtitle?: string;
}

export function DemonLordHeader({
  title = '魔王軍団ダッシュボード',
  subtitle = 'Demon Army Dashboard',
}: DemonLordHeaderProps) {
  const [flameIntensity, setFlameIntensity] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setFlameIntensity(Math.random());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative overflow-hidden border-b border-purple-800/30 bg-gradient-to-r from-purple-950 via-red-950/30 to-purple-950">
      {/* 炎のエフェクト背景 */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute bottom-0 left-1/4 h-32 w-32 -translate-x-1/2 rounded-full bg-gradient-to-t from-red-600/20 to-transparent blur-xl"
          style={{
            transform: `translateX(-50%) scale(${0.8 + flameIntensity * 0.4})`,
            opacity: 0.3 + flameIntensity * 0.2,
            transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 h-24 w-24 -translate-x-1/2 rounded-full bg-gradient-to-t from-orange-600/20 to-transparent blur-xl"
          style={{
            transform: `translateX(-50%) scale(${0.7 + (1 - flameIntensity) * 0.4})`,
            opacity: 0.25 + (1 - flameIntensity) * 0.2,
            transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-gradient-to-t from-purple-600/10 to-transparent blur-2xl"
          style={{
            transform: `translateX(-50%) scale(${0.9 + flameIntensity * 0.2})`,
            opacity: 0.2 + flameIntensity * 0.1,
            transition: 'transform 0.4s ease-out, opacity 0.4s ease-out',
          }}
        />
      </div>

      {/* パーティクルエフェクト */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-amber-500/40"
            style={{
              left: `${10 + i * 12}%`,
              bottom: `${10 + Math.sin(flameIntensity * Math.PI * 2 + i) * 20}%`,
              animation: `float ${2 + i * 0.3}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* ヘッダーコンテンツ */}
      <div className="relative z-10 px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 王冠アイコン */}
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-full bg-amber-500/20 blur-md" />
              <Crown className="relative h-12 w-12 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            </div>

            {/* タイトル */}
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-red-200 to-purple-200 drop-shadow-lg">
                {title}
                <Flame
                  className="h-8 w-8 text-orange-500"
                  style={{
                    transform: `scale(${0.9 + flameIntensity * 0.3}) rotate(${-10 + flameIntensity * 20}deg)`,
                    transition: 'transform 0.2s ease-out',
                  }}
                />
              </h1>
              <p className="mt-1 text-sm text-purple-300/70 tracking-wider">
                {subtitle}
              </p>
            </div>
          </div>

          {/* 右側の装飾 */}
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
            <div className="h-px w-16 bg-gradient-to-r from-purple-600 to-transparent" />
            <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
      </div>

      {/* 下部の光沢ライン */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-20px) scale(1.2);
            opacity: 0.8;
          }
        }
      `}</style>
    </header>
  );
}
