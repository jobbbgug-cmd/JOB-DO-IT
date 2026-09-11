import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/lib/models/Team';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyCode: string; teamId: string }> }
) {
  const auth = await verifyAuth(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await connectDB();
    const { companyCode, teamId } = await params;

    const team = await Team.findOne({ _id: teamId, companyCode });
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: team._id?.toString() || '',
      name: team.name,
      description: team.description || null,
      memberCount: team.members?.length || 0,
      isDefault: team.isDefault || false,
      members: team.members || [],
    });
  } catch (error) {
    console.error('Failed to fetch team:', error);
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
  }
}
