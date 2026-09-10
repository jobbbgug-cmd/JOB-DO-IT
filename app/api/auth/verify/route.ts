import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import PendingRegistration from '@/lib/models/PendingRegistration';
import Company from '@/lib/models/Company';
import { SignJWT } from 'jose';

const generateCompanyCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'กรุณากรอกอีเมลและรหัสยืนยัน' }, { status: 400 });
    }

    const pending = await PendingRegistration.findOne({ email });
    if (!pending) {
      return NextResponse.json({ error: 'ไม่พบการลงทะเบียนนี้ หรือหมดอายุแล้ว' }, { status: 404 });
    }

    if (pending.verificationCode !== code) {
      return NextResponse.json({ error: 'รหัสยืนยันไม่ถูกต้อง' }, { status: 400 });
    }

    if (pending.verificationCodeExpiry < new Date()) {
      await PendingRegistration.deleteOne({ email });
      return NextResponse.json({ error: 'รหัสยืนยันหมดอายุแล้ว กรุณาขอรหัสใหม่' }, { status: 400 });
    }

    console.log('Creating user with role:', pending.role);
    const user = await User.create({
      name: pending.name,
      email: pending.email,
      password: pending.password,
      role: pending.role,
      isVerified: true,
    });

    await PendingRegistration.deleteOne({ email });

    const token = await new SignJWT({ userId: user._id.toString(), email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const response = NextResponse.json(
      {
        success: true,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token,
      },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการยืนยัน' }, { status: 500 });
  }
}
