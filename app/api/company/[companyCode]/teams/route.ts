import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/lib/models/Team';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyCode: string }> }
) {
  try {
    await connectDB();
    const { companyCode } = await params;

    let teams = await Team.find({ companyCode }).lean();

    // Create default team if none exist
    if (teams.length === 0) {
      const defaultTeam = await Team.create({
        companyCode,
        name: companyCode,
        members: [],
        isDefault: true,
      });
      teams = [defaultTeam];
    }

    const formattedTeams = teams.map((team: any) => ({
      id: team._id?.toString() || '',
      name: team.name,
      description: team.description || null,
      memberCount: team.members?.length || 0,
      isDefault: team.isDefault || false,
    }));

    return NextResponse.json(formattedTeams);
  } catch (error) {
    console.error('Failed to fetch teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyCode: string }> }
) {
  try {
    await connectDB();
    const { companyCode } = await params;
    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Team name required' }, { status: 400 });
    }

    const team = await Team.create({
      companyCode,
      name,
      description: description || null,
      members: [],
      isDefault: false,
    });

    return NextResponse.json({
      success: true,
      team: {
        id: team._id.toString(),
        name: team.name,
        description: team.description || null,
        memberCount: 0,
        isDefault: false,
      },
    });
  } catch (error) {
    console.error('Failed to create team:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}
