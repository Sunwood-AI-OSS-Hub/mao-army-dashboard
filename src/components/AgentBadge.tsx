'use client';

import * as React from 'react';
import { Activity, Clock, AlertCircle, PowerOff, Bot } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn, getStatusLabel } from '@/lib/utils';
import type { AgentStatus } from '@/types';

interface AgentBadgeProps {
  agent: AgentStatus;
  showCurrentTask?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AgentBadge({ agent, showCurrentTask = true, size = 'md' }: AgentBadgeProps) {
  const [isPulsing, setIsPulsing] = React.useState(agent.status === 'active' || agent.status === 'busy');

  React.useEffect(() => {
    setIsPulsing(agent.status === 'active' || agent.status === 'busy');
  }, [agent.status]);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const statusConfig = {
    active: {
      variant: 'active' as const,
      icon: Activity,
      bgClass: 'bg-green-500/10',
      pulseColor: 'bg-green-500',
    },
    idle: {
      variant: 'idle' as const,
      icon: Clock,
      bgClass: 'bg-blue-500/10',
      pulseColor: 'bg-blue-500',
    },
    busy: {
      variant: 'busy' as const,
      icon: AlertCircle,
      bgClass: 'bg-yellow-500/10',
      pulseColor: 'bg-yellow-500',
    },
    offline: {
      variant: 'offline' as const,
      icon: PowerOff,
      bgClass: 'bg-gray-500/10',
      pulseColor: 'bg-gray-500',
    },
  };

  const config = statusConfig[agent.status];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border transition-all duration-300',
        sizeClasses[size],
        config.bgClass,
        agent.status === 'active' && 'shadow-lg shadow-green-500/20',
        agent.status === 'busy' && 'shadow-lg shadow-yellow-500/20',
      )}
    >
      {/* アバターアイコン */}
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            'flex items-center justify-center rounded-full',
            size === 'sm' ? 'h-5 w-5' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8',
            'bg-gradient-to-br from-purple-600 to-purple-800',
            'border border-purple-500/30'
          )}
        >
          <Bot className={cn(
            'text-purple-200',
            iconSizes[size === 'sm' ? 'sm' : 'md']
          )} />
        </div>

        {/* ステータスインジケーター */}
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 flex h-3 w-3',
            isPulsing && 'animate-pulse'
          )}
        >
          <span className={cn(
            'absolute inline-flex h-full w-full rounded-full',
            config.pulseColor,
            'opacity-75'
          )} />
          <span className={cn(
            'relative inline-flex h-3 w-3 rounded-full',
            config.pulseColor
          )} />
        </span>
      </div>

      {/* エージェント名 */}
      <span className="font-medium text-purple-100">{agent.name}</span>

      {/* ステータスアイコンとラベル */}
      <Badge variant={config.variant} className="gap-1">
        <StatusIcon className={iconSizes[size === 'sm' ? 'sm' : 'md']} />
        <span>{getStatusLabel(agent.status)}</span>
      </Badge>

      {/* 現在のタスク */}
      {showCurrentTask && agent.currentTask && (
        <span className="truncate text-purple-300/70 max-w-[150px]" title={agent.currentTask}>
          → {agent.currentTask}
        </span>
      )}
    </div>
  );
}

interface AgentBadgeListProps {
  agents: AgentStatus[];
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
}

export function AgentBadgeList({ agents, size = 'md', maxDisplay }: AgentBadgeListProps) {
  const [displayAgents, setDisplayAgents] = React.useState(agents);

  React.useEffect(() => {
    setDisplayAgents(maxDisplay ? agents.slice(0, maxDisplay) : agents);
  }, [agents, maxDisplay]);

  const remainingCount = maxDisplay && agents.length > maxDisplay ? agents.length - maxDisplay : 0;

  return (
    <div className="flex flex-wrap gap-2">
      {displayAgents.map((agent) => (
        <AgentBadge key={agent.agentId} agent={agent} size={size} />
      ))}
      {remainingCount > 0 && (
        <div className={cn(
          'inline-flex items-center justify-center rounded-full border border-purple-700/50 bg-purple-950/50 text-purple-300',
          size === 'sm' ? 'h-6 px-2 text-xs' : size === 'md' ? 'h-8 px-3 text-sm' : 'h-10 px-4 text-base'
        )}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
