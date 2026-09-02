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
      role: 'owner',
      isVerified: false,
      verificationCode,
      verificationCodeExpiry,
    });

    const emailSent = await sendVerificationEmail(email, verificationCode);
    console.log(`Email sent: ${emailSent}`);

    if (!emailSent) {
      console.error('Failed to send verification email to:', email);
      return NextResponse.json(
        { error: 'ไม่สามารถส่งอีเมลได้ กรุณาตรวจสอบ Email Configuration หรือลองอีกครั้ง' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, email: user.email, message: 'ส่งรหัสยืนยันไปยังอีเมลของคุณแล้ว' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register error:', error.message || error);
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก',
      details: error.message 
    }, { status: 500 });
  }
}
