import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = `${process.env.BACKEND_URL || 'https://game-pulse-6y4hoj1ei-mihir-dharaiyas-projects.vercel.app'}/playtime-insights`;
    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching playtime insights:', error);
    return NextResponse.json({ error: 'Failed to fetch playtime insights' }, { status: 500 });
  }
} 