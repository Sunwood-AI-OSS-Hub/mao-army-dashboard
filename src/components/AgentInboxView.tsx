'use client';

import * as React from 'react';
import { MessageSquare, Check, CheckCheck, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { cn, formatTime } from '@/lib/utils';
import type { AgentInbox, InboxMessage } from '@/types';

interface AgentInboxViewProps {
  inbox: AgentInbox;
}

// 最初のメッセージからエージェント説明を抽出
function extractAgentDescription(messages: InboxMessage[]): string | null {
  if (messages.length === 0) return null;

  const firstMessage = messages[0];

  // 最初のメッセージのテキストを取得（最初の200文字程度）
  const text = firstMessage.text;

  // 改行で分割して、最初の数行を取得
  const lines = text.split('\n').slice(0, 5);
  const description = lines.join('\n').trim();

  // 長すぎる場合は省略
  if (description.length > 150) {
    return description.slice(0, 150) + '...';
  }

  return description;
}

function MessageItem({ message }: { message: InboxMessage }) {
  const timestamp = new Date(message.timestamp).toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // textがJSONの場合は整形
  let displayText = message.text;
  let isSystemMessage = false;

  try {
    if (message.text.startsWith('{')) {
      const parsed = JSON.parse(message.text);
      if (parsed.type === 'task_assignment') {
        isSystemMessage = true;
        displayText = `📋 タスク割り当て: ${parsed.subject}`;
      } else if (parsed.type === 'shutdown_request') {
        isSystemMessage = true;
        displayText = `👋 シャットダウンリクエスト`;
      }
    }
  } catch (e) {
    // JSONでない場合はそのまま表示
  }

  return (
    <div className={cn(
      'group relative p-3 rounded-lg border transition-all duration-200',
      message.read
        ? 'bg-purple-950/20 border-purple-800/20 opacity-70'
        : 'bg-purple-900/30 border-purple-700/40 shadow-sm',
      isSystemMessage && 'border-amber-700/30'
    )}>
      <div className="flex items-start gap-2">
        <div className={cn(
          'mt-0.5',
          message.read ? 'text-purple-500/50' : 'text-amber-400'
        )}>
          {message.read ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              'text-xs font-medium',
              message.read ? 'text-purple-400/70' : 'text-purple-300'
            )}>
              {message.from}
            </span>
            {message.summary && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 border-purple-700/30 text-purple-400/70">
                {message.summary}
              </Badge>
            )}
            {isSystemMessage && (
              <Badge className="text-xs px-1.5 py-0 h-4 bg-amber-900/50 text-amber-300 border-amber-700/50">
                システム
              </Badge>
            )}
          </div>
          <p className={cn(
            'text-sm whitespace-pre-wrap break-words',
            message.read ? 'text-purple-300/50' : 'text-purple-100'
          )}>
            {displayText}
          </p>
          <span className="text-xs text-purple-400/40 mt-1 block">
            {timestamp}
          </span>
        </div>
      </div>
      {!message.read && (
        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
      )}
    </div>
  );
}

export function AgentInboxView({ inbox }: AgentInboxViewProps) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Card className={cn(
      'overflow-hidden transition-all duration-300',
      'bg-purple-950/40 border-purple-800/30',
      inbox.unreadCount > 0 && 'border-amber-700/40 shadow-lg shadow-amber-900/10'
    )}>
      <CardHeader
        className={cn(
          'cursor-pointer select-none transition-colors duration-200',
          'hover:bg-purple-900/20'
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              inbox.unreadCount > 0
                ? 'bg-amber-900/30 text-amber-300'
                : 'bg-purple-900/30 text-purple-400'
            )}>
              <User className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base text-purple-200">
                {inbox.agentName}
              </CardTitle>
              <p className="text-xs text-purple-400/70 mt-0.5">
                {inbox.messages.length}件のメッセージ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {inbox.unreadCount > 0 && (
              <Badge className="bg-amber-600 text-white border-amber-500">
                {inbox.unreadCount} 未読
              </Badge>
            )}
            <MessageSquare className={cn(
              'h-4 w-4 transition-transform duration-200',
              expanded ? 'rotate-90' : '',
              inbox.unreadCount > 0 ? 'text-amber-400' : 'text-purple-400/50'
            )} />
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 pb-4">
          {/* エージェント説明（最初のメッセージ） */}
          {inbox.messages.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-purple-900/20 border border-purple-700/30">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-purple-300/80">エージェント説明</span>
              </div>
              <p className="text-sm text-purple-200/80 whitespace-pre-wrap">
                {extractAgentDescription(inbox.messages)}
              </p>
            </div>
          )}

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {/* 最初のメッセージは説明として表示済みなので、2つ目から */}
              {inbox.messages.slice(1).map((message, index) => (
                <MessageItem key={`${message.timestamp}-${index}`} message={message} />
              ))}
              {inbox.messages.length <= 1 && (
                <div className="text-center py-8 text-purple-300/50 text-sm">
                  その他のメッセージはありません
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}

interface TeamInboxesViewProps {
  teamName: string;
  inboxes: AgentInbox[];
}

export function TeamInboxesView({ teamName, inboxes }: TeamInboxesViewProps) {
  const totalUnread = inboxes.reduce((sum, inbox) => sum + inbox.unreadCount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-purple-200">
          📬 メッセージボックス
        </h3>
        {totalUnread > 0 && (
          <Badge className="bg-amber-600 text-white border-amber-500">
            {totalUnread} 未読
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {inboxes.map((inbox) => (
          <AgentInboxView key={inbox.agentId} inbox={inbox} />
        ))}
        {inboxes.length === 0 && (
          <div className="text-center py-12 text-purple-300/50">
            メッセージはありません
          </div>
        )}
      </div>
    </div>
  );
}
