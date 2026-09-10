import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PendingRegistration from '@/lib/models/PendingRegistration';
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

    const pending = await PendingRegistration.findOne({ email });
    if (!pending) {
      return NextResponse.json({ error: 'ไม่พบการลงทะเบียนนี้ หรือหมดอายุแล้ว' }, { status: 404 });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);

    pending.verificationCode = verificationCode;
    pending.verificationCodeExpiry = verificationCodeExpiry;
    await pending.save();

    const emailSent = await sendVerificationEmail(email, verificationCode);
    if (!emailSent) {
      console.error('Failed to send verification email to:', email);
      return NextResponse.json(
        { error: 'ไม่สามารถส่งอีเมลได้ กรุณาตรวจสอบ Email Configuration หรือลองอีกครั้ง' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'ส่งรหัสยืนยันไปยังอีเมลของคุณแล้ว' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Resend code error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการส่งรหัสใหม่' }, { status: 500 });
  }
}
