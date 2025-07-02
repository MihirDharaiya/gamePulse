import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = `${process.env.BACKEND_URL || 'https://game-pulse-nl6xozybg-mihir-dharaiyas-projects.vercel.app'}/top-genres`;
    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching top genres:', error);
    return NextResponse.json({ error: 'Failed to fetch top genres' }, { status: 500 });
  }
} 