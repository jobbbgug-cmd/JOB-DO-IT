import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { sendVerificationEmail } from '@/lib/email';

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'กรุณากรอกอีเมล' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้นี้' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ error: 'อีเมลนี้ได้รับการยืนยันแล้ว' }, { status: 400 });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);

    user.verificationCode = verificationCode;
    user.verificationCodeExpiry = verificationCodeExpiry;
    await user.save();

    await sendVerificationEmail(email, verificationCode);

    return NextResponse.json(
      { success: true, message: 'ส่งรหัสยืนยันไปยังอีเมลของคุณแล้ว' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Resend code error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการส่งรหัสใหม่' }, { status: 500 });
  }
}
