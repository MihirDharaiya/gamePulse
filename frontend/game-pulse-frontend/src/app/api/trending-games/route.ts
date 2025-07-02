import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    const genre = searchParams.get('genre');
    const source = searchParams.get('source');

    let url = `${process.env.BACKEND_URL || 'https://game-pulse-6y4hoj1ei-mihir-dharaiyas-projects.vercel.app'}/trending-games?limit=${limit}`;
    if (genre) url += `&genre=${genre}`;
    if (source) url += `&source=${source}`;

    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching trending games:', error);
    return NextResponse.json({ error: 'Failed to fetch trending games' }, { status: 500 });
  }
} 