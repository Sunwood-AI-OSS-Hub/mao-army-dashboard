import { NextRequest, NextResponse } from 'next/server';
import { loadTeamInboxes } from '@/lib/team-monitor';

/**
 * GET /api/inboxes/[teamName]
 * 指定チームのinboxデータを取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamName: string }> }
) {
  try {
    const { teamName } = await params;
    const inboxData = await loadTeamInboxes(teamName);

    if (!inboxData) {
      return NextResponse.json(
        { error: 'チームが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(inboxData);
  } catch (error) {
    console.error('Error fetching team inboxes:', error);
    return NextResponse.json(
      { error: 'inboxデータの取得に失敗しました' },
      { status: 500 }
    );
  }
}
