'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';
import Layout from '@/app/components/Layout';

export default function CompanyPage() {
  const router = useRouter();
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
      <div className="max-w-2xl">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">บริษัท</h1>
          <p className="text-gray-400 text-lg">
            เริ่มต้นใช้งาน — สร้างบริษัทของคุณ หรือเข้าร่วมบริษัทที่มีอยู่
          </p>
        </div>

        {/* Choice Cards */}
        <div className="grid gap-4 max-w-md">
          {/* Create Company */}
          <button className="p-6 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-lg text-left transition-all hover:shadow-lg">
            <div className="flex flex-col gap-2">
              <b className="text-xl text-white flex items-center gap-2">
                <span className="text-2xl">🏢</span>
                สร้างบริษัท
              </b>
              <span className="text-gray-400 text-sm">เปิดบริษัทใหม่ แล้วเชิญเพื่อนร่วมงานเข้ามา</span>
            </div>
          </button>

          {/* Join Company */}
          <button className="p-6 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-lg text-left transition-all hover:shadow-lg">
            <div className="flex flex-col gap-2">
              <b className="text-xl text-white flex items-center gap-2">
                <span className="text-2xl">🔗</span>
                เข้าร่วมบริษัท
              </b>
              <span className="text-gray-400 text-sm">มีลิงก์เชิญจากทีมอยู่แล้ว</span>
            </div>
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-12 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
          <p className="text-gray-400 text-sm">
            💡 <strong>ทิป:</strong> บัญชีเดียวสามารถสร้างหรือเข้าร่วมได้หลายบริษัท
            สลับได้ในคลิกเดียวจากเมนู TopNav
          </p>
        </div>
      </div>
    </Layout>
  );
}
