'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';
import Layout from '@/app/components/Layout';

export default function NotesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!storedToken) {
      router.push('/login');
    } else {
      setIsHydrated(true);
    }
  }, [router]);

  if (!isHydrated) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">โน้ต</h1>
          <p className="text-gray-400 mt-2">บันทึกความจำและไอเดีย</p>
        </div>

        <div className="flex items-center justify-center min-h-96 py-12">
          <div className="text-center">
            <p className="text-gray-400">📝 อยู่ระหว่างการพัฒนา</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
