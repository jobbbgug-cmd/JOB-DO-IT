'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const inviteCode = params.inviteCode as string;
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteInfo, setInviteInfo] = useState<any>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }

    verifyAndJoin();
  }, [router, inviteCode]);

  const verifyAndJoin = async () => {
    try {
      const response = await fetch(`/api/invite/verify/${inviteCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'ลิงค์เชิญไม่ถูกต้องหรือหมดอายุแล้ว');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setInviteInfo(data);
      
      // Auto redirect after 2 seconds
      setTimeout(() => {
        router.push(`/c/${data.companyCode}/boardteam`);
      }, 2000);
    } catch (error) {
      console.error('Failed to join via invite:', error);
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">เข้าร่วมบริษัท</h1>
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
          >
            กลับหน้าแรก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">เข้าร่วมบริษัท</h1>
        {loading ? (
          <p className="text-gray-400">กำลังเชื่อมต่อ...</p>
        ) : (
          <>
            <p className="text-green-400">✓ เข้าร่วมสำเร็จ</p>
            <p className="text-gray-400">
              กำลังนำพาไปยัง {inviteInfo?.companyCode}...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
