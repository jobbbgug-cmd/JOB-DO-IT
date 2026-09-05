let resend: any = null;

const getResend = async () => {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resend) {
    const { Resend } = await import('resend');
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

export async function sendVerificationEmail(email: string, code: string) {
  const resendClient = await getResend();
  if (!resendClient) {
    console.log('Resend API key not configured, skipping email');
    return true;
  }

  try {
    await resendClient.emails.send({
      from: 'JOB DO IT <onboarding@resend.dev>',
      to: email,
      subject: 'รหัสยืนยันอีเมล | JOB DO IT',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">JOB DO IT</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Task Management System</p>
          </div>
          
          <div style="background: #f9fafb; padding: 40px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
              ยืนยันอีเมลของคุณเพื่อเข้าสู่ระบบ
            </p>
            
            <div style="background: white; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
              <p style="color: #999; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase;">รหัสยืนยัน</p>
              <p style="font-size: 48px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 10px 0; font-family: 'Courier New', monospace;">
                ${code}
              </p>
              <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                รหัสนี้จะหมดอายุใน 15 นาที
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
              ถ้าคุณไม่ได้ขอรหัสนี้ กรุณาละเว้นข้อความนี้
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2026 JOB DO IT. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });
    
    console.log(`Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}
