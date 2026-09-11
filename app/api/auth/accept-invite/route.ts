import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Employee from '@/lib/models/Employee';
import InviteLink from '@/lib/models/InviteLink';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { inviteCode, userId, email } = await req.json();

    if (!inviteCode || !userId) {
      return NextResponse.json(
        { error: 'Invalid invite or user' },
        { status: 400 }
      );
    }

    const invite = await InviteLink.findOne({ code: inviteCode });
    if (!invite) {
      return NextResponse.json(
        { error: 'Invite not found or expired' },
        { status: 404 }
      );
    }

    const nameFromEmail = email.split('@')[0];
    const COLORS = ['#0E9384', '#E4572E', '#5B7FB0', '#B4479A', '#C98A0E', '#3F6E4B', '#8A5CF6', '#D2504F'];
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    const employee = await Employee.create({
      name: nameFromEmail,
      role: 'employee',
      userId,
      color: randomColor,
      companyCode: invite.companyCode,
      isActive: true,
      permissionLevel: 'self',
    });

    return NextResponse.json(
      {
        success: true,
        employee,
        companyCode: invite.companyCode,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json(
      { error: 'Failed to accept invite' },
      { status: 500 }
    );
  }
}
