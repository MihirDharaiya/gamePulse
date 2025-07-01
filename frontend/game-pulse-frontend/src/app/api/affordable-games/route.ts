import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = `${process.env.BACKEND_URL || 'http://localhost:8000'}/affordable-games`;
    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching affordable games:', error);
    return NextResponse.json({ error: 'Failed to fetch affordable games' }, { status: 500 });
  }
} 