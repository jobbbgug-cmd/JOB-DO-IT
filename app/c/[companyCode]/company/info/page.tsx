'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import axios from 'axios';

export default function CompanyInfoPage() {
  const params = useParams();
  const router = useRouter();
  const companyCode = params.companyCode as string;
  const { user } = useAuthStore();
  const canManage = user?.role === 'owner';
  const [companyName, setCompanyName] = useState('');
  const [allowCardLayout, setAllowCardLayout] = useState(true);

  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        const response = await axios.get(`/api/company/${companyCode}`);
        setCompanyName(response.data.companyName || '');
      } catch (error) {
        console.error('Failed to fetch company name:', error);
        setCompanyName(companyCode);
      }
    };

    if (companyCode) {
      fetchCompanyName();
    }
  }, [companyCode]);

  return (
    <div className="space-y-8">
      {/* AI Usage Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">การใช้งาน AI เดือนนี้</h2>
        <div className="space-y-3 bg-gray-800/30 border border-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-baseline gap-3">
            <span className="text-4xl font-bold text-white">0%</span>
            <span className="text-xs text-gray-500">ของโควตาแพ็กเกจ Free</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{ width: '0%' }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">
            ตอนนี้ทุกบริษัทอยู่แพ็กเกจ Free · โควตานับรวมทุกคนในบริษัท · รีเซ็ตอัตโนมัติต้นเดือนหน้า
          </p>
        </div>
      </div>

      {/* Company Information Section - Only for owners */}
      {canManage && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">ข้อมูลบริษัท</h2>

          {/* Company Name */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold text-white">ชื่อบริษัท · {companyName || companyCode}</p>
              <p className="text-xs text-gray-500">ชื่อที่แสดงให้ทุกคนในบริษัทเห็น</p>
            </div>
            <button className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
              เปลี่ยน
            </button>
          </div>

          {/* Company Code */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold text-white">รหัสบริษัท · {companyCode}</p>
              <p className="text-xs text-gray-500">ตั้งเองได้ (A-Z 0-9)</p>
            </div>
            <button className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
              เปลี่ยน
            </button>
          </div>
        </div>
      )}

      {/* Email Notifications Section - Only for owners */}
      {canManage && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">การแจ้งเตือนทางอีเมล</h2>
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-white">ส่งอีเมลแจ้งเตือนงาน</p>
                <span className="text-xs font-bold text-gray-500 bg-gray-700 px-2 py-1 rounded-full">
                  เร็ว ๆ นี้
                </span>
              </div>
              <p className="text-xs text-gray-500">
                แจ้งผู้รับงานเมื่อได้รับงานใหม่ และแจ้งผู้มอบหมายงานเมื่อส่งรีวิวหรือปิดงาน ·
                <span className="text-gray-600">ส่วนของสมาชิก</span>
              </p>
            </div>
            <label className="flex items-center">
              <input type="checkbox" checked={allowCardLayout} onChange={() => setAllowCardLayout(!allowCardLayout)} className="mr-2" />
              <span className="text-sm text-white">เปิด</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
