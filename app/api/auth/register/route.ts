import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'อีเมลนี้ได้ถูกลงทะเบียนแล้ว' }, { status: 400 });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'dev',
      isVerified: false,
      verificationCode,
      verificationCodeExpiry,
    });

    console.log(`[DEV] Verification code for ${email}: ${verificationCode}`);

    return NextResponse.json(
      { success: true, email: user.email, message: 'ส่งรหัสยืนยันไปยังอีเมลของคุณแล้ว' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' }, { status: 500 });
  }
}
