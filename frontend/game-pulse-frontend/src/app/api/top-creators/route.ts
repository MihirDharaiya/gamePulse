import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    const platform = searchParams.get('platform');
    const game_name = searchParams.get('game_name');
    const sort_by = searchParams.get('sort_by') || 'total_views';

    let url = `${process.env.BACKEND_URL || 'https://game-pulse-6y4hoj1ei-mihir-dharaiyas-projects.vercel.app'}/top-creators?limit=${limit}&sort_by=${sort_by}`;
    if (platform) url += `&platform=${platform}`;
    if (game_name) url += `&game_name=${game_name}`;

    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching top creators:', error);
    return NextResponse.json({ error: 'Failed to fetch top creators' }, { status: 500 });
  }
} 