import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Sprint from '@/lib/models/Sprint';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sprintId: string }> }
) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await connectDB();
    const { sprintId } = await params;

    const sprint = await Sprint.findById(sprintId).populate('teamId', 'name');
    if (!sprint) {
      return NextResponse.json({ error: 'Sprint not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: sprint._id,
      name: sprint.name,
      teamId: sprint.teamId?._id,
      teamName: (sprint.teamId as any)?.name || '',
      status: sprint.status,
    });
  } catch (error) {
    console.error('Failed to fetch sprint:', error);
    return NextResponse.json({ error: 'Failed to fetch sprint' }, { status: 500 });
  }
}
