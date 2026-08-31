'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';
import Layout from '@/app/components/Layout';

const generateRandomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function CompanyPage() {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyCode, setCompanyCode] = useState(generateRandomCode());
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!storedToken) {
      router.push('/login');
    } else {
      setIsHydrated(true);
    }
  }, [router]);

  if (!isHydrated) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const isCreateFormValid = companyName.trim().length > 0 && companyCode.trim().length > 0;
  const isJoinFormValid = inviteLink.trim().length > 0;

  const handleRandomCode = () => {
    setCompanyCode(generateRandomCode());
  };

  const handleCreateCompany = () => {
    if (!isCreateFormValid) return;
    console.log('Create company:', { companyName, companyCode });
    // TODO: API call
  };

  const handleJoinCompany = () => {
    if (!isJoinFormValid) return;
    console.log('Join company:', { inviteLink });
    // TODO: API call
  };

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

        {!showCreateForm && !showJoinForm ? (
          <>
            {/* Choice Cards */}
            <div className="grid gap-4 max-w-md">
              {/* Create Company */}
              <button
                onClick={() => setShowCreateForm(true)}
                className="p-6 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-lg text-left transition-all hover:shadow-lg"
              >
                <div className="flex flex-col gap-2">
                  <b className="text-xl text-white flex items-center gap-2">
                    <span className="text-2xl">🏢</span>
                    สร้างบริษัท
                  </b>
                  <span className="text-gray-400 text-sm">เปิดบริษัทใหม่ แล้วเชิญเพื่อนร่วมงานเข้ามา</span>
                </div>
              </button>

              {/* Join Company */}
              <button
                onClick={() => setShowJoinForm(true)}
                className="p-6 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-lg text-left transition-all hover:shadow-lg"
              >
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
          </>
        ) : showCreateForm ? (
          <>
            {/* Create Form */}
            <div className="max-w-md bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-bold text-white">สร้างบริษัท</h2>
              <p className="text-gray-400 text-sm">คุณจะเป็นเจ้าของบริษัทนี้</p>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ชื่อบริษัท</label>
                <input
                  type="text"
                  placeholder="เช่น สตูดิโอ ดูงาน"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Company Code */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">รหัสบริษัท (A-Z a-z 0-9)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={24}
                    placeholder="เช่น DONGAN"
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none tracking-widest"
                  />
                  <button
                    onClick={handleRandomCode}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
                    title="สุ่มใหม่"
                  >
                    สุ่ม
                  </button>
                </div>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreateCompany}
                disabled={!isCreateFormValid}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors mt-2"
              >
                สร้างบริษัท
              </button>

              {/* Back Button */}
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setCompanyName('');
                  setCompanyCode(generateRandomCode());
                }}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                ← ย้อนกลับ
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Join Form */}
            <div className="max-w-md bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-bold text-white">เข้าร่วมบริษัท</h2>
              <p className="text-gray-400 text-sm">วางลิงก์เชิญที่ได้รับจากเจ้าของบริษัท — หรือกดลิงก์นั้นตรง ๆ ก็เข้าร่วมได้เลย</p>

              {/* Invite Link */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ลิงก์เชิญ</label>
                <input
                  type="text"
                  placeholder="เช่น https://dongan.app/join/…"
                  value={inviteLink}
                  onChange={(e) => setInviteLink(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Join Button */}
              <button
                onClick={handleJoinCompany}
                disabled={!isJoinFormValid}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors mt-2"
              >
                เข้าร่วมบริษัท
              </button>

              {/* Back Button */}
              <button
                onClick={() => {
                  setShowJoinForm(false);
                  setInviteLink('');
                }}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                ← ย้อนกลับ
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
