import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSSのクラス名をマージする
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * ステータスに応じた色を取得
 */
export function getStatusColor(status: 'pending' | 'in_progress' | 'completed' | 'active' | 'idle' | 'busy' | 'offline'): string {
  switch (status) {
    case 'completed':
    case 'active':
      return 'text-green-500 bg-green-500/10 border-green-500/20';
    case 'in_progress':
    case 'busy':
      return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    case 'pending':
    case 'idle':
      return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    case 'offline':
      return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    default:
      return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
  }
}

/**
 * ステータスのラベルを取得
 */
export function getStatusLabel(status: 'pending' | 'in_progress' | 'completed' | 'active' | 'idle' | 'busy' | 'offline'): string {
  switch (status) {
    case 'completed':
      return '完了';
    case 'in_progress':
      return '進行中';
    case 'pending':
      return '待機中';
    case 'active':
      return 'アクティブ';
    case 'busy':
      return '作業中';
    case 'idle':
      return 'アイドル';
    case 'offline':
      return 'オフライン';
    default:
      return '不明';
  }
}

/**
 * ファイルサイズをフォーマット
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 日時をフォーマット
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'たった今';
  } else if (minutes < 60) {
    return `${minutes}分前`;
  } else if (hours < 24) {
    return `${hours}時間前`;
  } else if (days < 7) {
    return `${days}日前`;
  } else {
    return date.toLocaleDateString('ja-JP');
  }
}
