'use client';

import * as React from 'react';
import { CheckCircle2, Clock, AlertCircle, Circle, ChevronRight, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { cn, getStatusLabel, getStatusColor } from '@/lib/utils';
import type { TeamTask } from '@/types';

interface TaskListProps {
  tasks: TeamTask[];
  title?: string;
  showStatus?: boolean;
  onTaskClick?: (task: TeamTask) => void;
}

export function TaskList({
  tasks,
  title = 'タスク一覧',
  showStatus = true,
  onTaskClick,
}: TaskListProps) {
  const [expandedTask, setExpandedTask] = React.useState<string | null>(null);

  // ステータスでグループ化
  const groupedTasks = React.useMemo(() => {
    return {
      in_progress: tasks.filter((t) => t.status === 'in_progress'),
      pending: tasks.filter((t) => t.status === 'pending'),
      completed: tasks.filter((t) => t.status === 'completed'),
    };
  }, [tasks]);

  const statusConfig = {
    pending: {
      icon: Circle,
      label: '待機中',
      colorClass: 'text-blue-400',
      bgColorClass: 'bg-blue-500/10',
      borderColorClass: 'border-blue-500/30',
    },
    in_progress: {
      icon: Clock,
      label: '進行中',
      colorClass: 'text-yellow-400',
      bgColorClass: 'bg-yellow-500/10',
      borderColorClass: 'border-yellow-500/30',
    },
    completed: {
      icon: CheckCircle2,
      label: '完了',
      colorClass: 'text-green-400',
      bgColorClass: 'bg-green-500/10',
      borderColorClass: 'border-green-500/30',
    },
  };

  const TaskItem = ({ task }: { task: TeamTask }) => {
    const config = statusConfig[task.status];
    const StatusIcon = config.icon;
    const isExpanded = expandedTask === task.id;

    return (
      <div
        className={cn(
          'group rounded-lg border transition-all duration-300',
          config.borderColorClass,
          config.bgColorClass,
          'hover:shadow-lg hover:shadow-purple-900/20',
          onTaskClick && 'cursor-pointer hover:-translate-y-0.5',
          isExpanded && 'ring-2 ring-purple-500/30'
        )}
        onClick={() => {
          if (onTaskClick) {
            onTaskClick(task);
          }
          setExpandedTask(isExpanded ? null : task.id);
        }}
      >
        <div className="flex items-start gap-3 p-4">
          {/* ステータスアイコン */}
          <div className={cn(
            'mt-0.5 flex-shrink-0',
            task.status === 'in_progress' && 'animate-pulse'
          )}>
            <StatusIcon className={cn('h-5 w-5', config.colorClass)} />
          </div>

          {/* タスク情報 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={cn(
                'font-semibold text-purple-100',
                task.status === 'completed' && 'line-through opacity-60'
              )}>
                {task.subject}
              </h4>
              {showStatus && (
                <Badge variant={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'warning' : 'default'} className="text-xs">
                  {config.label}
                </Badge>
              )}
            </div>

            <p className="text-sm text-purple-300/70 line-clamp-2">
              {task.description}
            </p>

            {/* メタデータ */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {/* オーナー */}
              {task.owner && (
                <div className="flex items-center gap-1 text-xs text-purple-400">
                  <User className="h-3 w-3" />
                  <span>{task.owner}</span>
                </div>
              )}

              {/* ブロック情報 */}
              {task.blockedBy.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  ブロック中: {task.blockedBy.length}
                </Badge>
              )}
              {task.blocks.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  ブロック中: {task.blocks.length}
                </Badge>
              )}
            </div>

            {/* 展開時の詳細情報 */}
            {isExpanded && (
              <div className={cn(
                'mt-3 pt-3 border-t border-purple-700/30',
                'animate-in fade-in slide-in-from-top-2 duration-300'
              )}>
                {task.blockedBy.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-purple-300/50 mb-1">このタスクをブロックしているタスク:</p>
                    <div className="flex flex-wrap gap-1">
                      {task.blockedBy.map((id) => (
                        <Badge key={id} variant="outline" className="text-xs">
                          {id}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {task.blocks.length > 0 && (
                  <div>
                    <p className="text-xs text-purple-300/50 mb-1">このタスクがブロックしているタスク:</p>
                    <div className="flex flex-wrap gap-1">
                      {task.blocks.map((id) => (
                        <Badge key={id} variant="outline" className="text-xs">
                          {id}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 展開インジケーター */}
          <ChevronRight
            className={cn(
              'h-5 w-5 text-purple-400 transition-transform duration-300 flex-shrink-0 mt-1',
              isExpanded && 'rotate-90'
            )}
          />
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <span className="text-sm font-normal text-purple-300/70">
            全 {tasks.length} 件
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 進行中のタスク */}
        {groupedTasks.in_progress.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-yellow-400">
              <Clock className="h-4 w-4" />
              進行中 ({groupedTasks.in_progress.length})
            </h3>
            <div className="space-y-2">
              {groupedTasks.in_progress.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* 待機中のタスク */}
        {groupedTasks.pending.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-400">
              <Circle className="h-4 w-4" />
              待機中 ({groupedTasks.pending.length})
            </h3>
            <div className="space-y-2">
              {groupedTasks.pending.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* 完了したタスク */}
        {groupedTasks.completed.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              完了 ({groupedTasks.completed.length})
            </h3>
            <details className="group">
              <summary className="cursor-pointer text-sm text-purple-300/50 hover:text-purple-300 transition-colors list-none flex items-center gap-2">
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                完了したタスクを表示
              </summary>
              <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                {groupedTasks.completed.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </details>
          </div>
        )}

        {/* タスクがない場合 */}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-purple-300/50">
            <AlertCircle className="mx-auto h-12 w-12 mb-3 opacity-50" />
            <p>タスクがありません</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
