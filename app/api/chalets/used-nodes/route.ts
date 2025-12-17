import { fetchUsedMapNodeIds } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const usedNodeIds = await fetchUsedMapNodeIds();
    return NextResponse.json(usedNodeIds);
  } catch (error) {
    console.error('Error fetching used map node IDs:', error);
    return NextResponse.json({ error: 'Failed to fetch used map node IDs' }, { status: 500 });
  }
}
