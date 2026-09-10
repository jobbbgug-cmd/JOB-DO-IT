import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/lib/models/Team';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyCode: string }> }
) {
  const auth = await verifyAuth(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await connectDB();
    const { companyCode } = await params;

    const teams = await Team.find({ companyCode }).lean();

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
  const auth = await verifyAuth(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

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
