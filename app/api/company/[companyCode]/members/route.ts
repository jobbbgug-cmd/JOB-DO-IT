import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyCode: string }> }
) {
  try {
    await connectDB();
    const { companyCode } = await params;

    const members = await User.find({ companyCode })
      .select('name email role enabled color -_id')
      .lean();

    const formattedMembers = members.map((member: any) => ({
      id: member._id?.toString() || '',
      name: member.name,
      email: member.email,
      role: member.role === 'admin' ? 'owner' : 'member',
      enabled: member.enabled !== false,
      color: member.color,
    }));

    return NextResponse.json(formattedMembers);
  } catch (error) {
    console.error('Failed to fetch members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
