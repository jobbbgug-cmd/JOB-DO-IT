async function testEmail() {
  try {
    const { Resend } = await import('resend');
    const resend = new Resend('re_JlcrLtjR_MHMzH1jDkbGc43ZowndYV4xX');
    
    const result = await resend.emails.send({
      from: 'JOB DO IT <noreply@jobdoit.online>',
      to: 'jobbbgug@gmail.com',
      subject: 'Test Email',
      html: '<h1>Test Email</h1><p>If you see this, email works!</p>',
    });
    
    console.log('✅ Email sent:', result);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testEmail();
