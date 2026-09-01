import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { connectDB } from '@/lib/db';
import InviteLink from '@/lib/models/InviteLink';
import User from '@/lib/models/User';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret');

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ inviteCode: string }> }
) {
  try {
    await connectDB();
    const { inviteCode } = await params;
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.sub as string;

    // Find and validate invite
    const invite = await InviteLink.findOne({
      code: inviteCode,
      expiresAt: { $gt: new Date() },
    });

    if (!invite) {
      return NextResponse.json(
        { error: 'ลิงค์เชิญไม่ถูกต้องหรือหมดอายุแล้ว' },
        { status: 400 }
      );
    }

    // Check usage limit
    if (invite.maxUses && invite.usedCount >= invite.maxUses) {
      return NextResponse.json(
        { error: 'ลิงค์เชิญนี้ถูกใช้งานถึงขีดจำกัดแล้ว' },
        { status: 400 }
      );
    }

    // Update user's company code
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.companyCode && user.companyCode !== invite.companyCode) {
      return NextResponse.json(
        { error: 'คุณเป็นสมาชิกของบริษัทอื่นแล้ว' },
        { status: 400 }
      );
    }

    user.companyCode = invite.companyCode;
    user.enabled = true;
    await user.save();

    // Increment usage count
    invite.usedCount += 1;
    await invite.save();

    return NextResponse.json({
      success: true,
      companyCode: invite.companyCode,
      message: 'เข้าร่วมบริษัทสำเร็จ',
    });
  } catch (error: any) {
    console.error('Invite verification failed:', error);
    
    if (error.code === 'ERR_JWT_EXPIRED') {
      return NextResponse.json(
        { error: 'Token หมดอายุแล้ว' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process invite' },
      { status: 500 }
    );
  }
}
