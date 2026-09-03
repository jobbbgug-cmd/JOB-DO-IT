'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const inviteCode = params.inviteCode as string;

  useEffect(() => {
    // Store invite code in localStorage
    if (typeof window !== 'undefined' && inviteCode) {
      localStorage.setItem('inviteCode', inviteCode);
    }
    // Redirect to login with invite code
    router.push(`/login?inviteCode=${inviteCode}`);
  }, [router, inviteCode]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-400">กำลังนำไปหน้าสมัครสมาชิก...</p>
    </div>
  );
}
