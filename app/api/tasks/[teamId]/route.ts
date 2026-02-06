import { NextResponse } from 'next/server';
import { getTeamMonitorData, loadAllTeams } from '@/lib/team-monitor';

/**
 * チーム名のバリデーション（ホワイトリスト方式）
 */
function isValidTeamName(name: string): boolean {
  // アルファベット、数字、ハイフン、アンダースコアのみ許可
  const validPattern = /^[a-zA-Z0-9-_]+$/;
  // パストラバーサル防止
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    return false;
  }
  return validPattern.test(name) && name.length > 0 && name.length <= 100;
}

/**
 * GET /api/tasks/[teamId]
 * 指定チームのタスク一覧を返却
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;

    // チーム名のバリデーション
    if (!isValidTeamName(teamId)) {
      return NextResponse.json(
        { error: 'Invalid team name' },
        { status: 400 }
      );
    }

    // チームの存在確認（ホワイトリストチェック）
    const teams = await loadAllTeams();
    const teamExists = teams.some(t => t.name === teamId);

    if (!teamExists) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    const monitorData = await getTeamMonitorData(teamId);

    if (!monitorData) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(monitorData);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
