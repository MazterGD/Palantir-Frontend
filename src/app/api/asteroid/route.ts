import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Asteroid ID required' }, { status: 400 });
  }
  
  try {
    const response = await fetch(`https://galanor-backend.onrender.com/api/asteroid?id=${id}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch asteroid data' }, { status: 500 });
  }
}
