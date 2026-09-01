import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import InviteLink from '@/lib/models/InviteLink';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    const verified = await jwtVerify(token, JWT_SECRET);
    const userId = verified.payload.userId;

    const { companyCode, maxUses } = await req.json();
    if (!companyCode) {
      return NextResponse.json({ error: 'ขาดรหัสบริษัท' }, { status: 400 });
    }

    const code = generateInviteCode();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const inviteLink = await InviteLink.create({
      companyCode,
      code,
      createdBy: userId,
      usedCount: 0,
      maxUses: maxUses || null,
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      inviteLink: {
        id: inviteLink._id,
        code: inviteLink.code,
        url: `http://localhost:3000/join/${inviteLink.code}`,
        usedCount: inviteLink.usedCount,
        maxUses: inviteLink.maxUses,
        expiresAt: inviteLink.expiresAt,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Invite link error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
