import { NextResponse } from 'next/server';
import { getTeamSummaries } from '@/lib/team-monitor';

/**
 * GET /api/teams
 * 全チームの概要を返却
 */
export async function GET() {
  try {
    const summaries = await getTeamSummaries();
    return NextResponse.json(summaries);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
