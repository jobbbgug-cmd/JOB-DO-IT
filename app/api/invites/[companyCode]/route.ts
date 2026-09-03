import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import crypto from 'crypto';

interface InviteLink {
  _id?: string;
  code: string;
  companyCode: string;
  maxUses: number | null;
  usedCount: number;
  createdAt: Date;
  expiresAt: Date;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyCode: string }> }
) {
  try {
    await connectDB();
    const { companyCode } = await params;
    const { maxUses } = await req.json();

    const inviteCode = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteLink = `${baseUrl}/invite/${inviteCode}`;

    return NextResponse.json(
      {
        code: inviteCode,
        link: inviteLink,
        companyCode,
        maxUses: maxUses || null,
        usedCount: 0,
        expiresAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating invite link:', error);
    return NextResponse.json(
      { error: 'Failed to create invite link' },
      { status: 500 }
    );
  }
}
