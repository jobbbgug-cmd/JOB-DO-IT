import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/lib/models/Team';
import { verifyAuth } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ companyCode: string; teamId: string }> }
) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (auth.user?.role !== 'owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const { companyCode, teamId } = await params;
    const body = await request.json();
    const { members, name, description } = body;

    const team = await Team.findOne({ _id: teamId, companyCode });
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (members !== undefined) {
      if (!Array.isArray(members)) {
        return NextResponse.json(
          { error: 'Members must be an array' },
          { status: 400 }
        );
      }
      team.members = members;
    }

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return NextResponse.json(
          { error: 'Team name required' },
          { status: 400 }
        );
      }
      team.name = name;
    }

    if (description !== undefined) {
      team.description = description || null;
    }

    await team.save();

    return NextResponse.json(
      {
        success: true,
        team: {
          id: team._id,
          name: team.name,
          description: team.description,
          members: team.members,
          memberCount: team.members.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update team error:', error);
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    );
  }
}
