import { NextRequest, NextResponse } from 'next/server';
import { searchProperties } from '@/lib/data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const guests = searchParams.get('guests');
  const amenities = searchParams.get('amenities')?.split(',').filter(Boolean);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const name = searchParams.get('name');

  try {
    const properties = await searchProperties({
      guests,
      amenities,
      startDate,
      endDate,
      name,
    });
    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error in search endpoint:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
