import { NextResponse } from 'next/server';
import { getAllTeamInboxes } from '@/lib/team-monitor';

/**
 * GET /api/inboxes
 * 全チームのinboxデータを取得
 */
export async function GET() {
  try {
    const data = await getAllTeamInboxes();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching all inboxes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inboxes' },
      { status: 500 }
    );
  }
}

