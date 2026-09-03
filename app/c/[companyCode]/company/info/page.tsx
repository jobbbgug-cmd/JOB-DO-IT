'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/app/store/authStore';

export default function CompanyInfoPage() {
  const params = useParams();
  const router = useRouter();
  const companyCode = params.companyCode as string;
  const { user } = useAuthStore();
  const canManage = user?.role === 'owner';
  const [companyName, setCompanyName] = useState('ConceptX');
  const [allowCardLayout, setAllowCardLayout] = useState(true);

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
              <p className="font-semibold text-white">ชื่อบริษัท · {companyName}</p>
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
                ฟีเจอร์นี้อยู่ระหว่างเตรียมเปิดให้บริการ
              </p>
            </div>
            <button
              disabled
              className="flex-shrink-0 w-12 h-7 rounded-full bg-gray-700 disabled:opacity-50 relative transition-colors"
            >
              <span className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow"></span>
            </button>
          </div>
        </div>
      )}

      {/* Board Layout Section - Only for owners */}
      {canManage && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">การจัดวางบอร์ดทีม</h2>
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold text-white mb-1">ให้พนักงานจัดวาง/ย่อขยายการ์ดเองได้</p>
              <p className="text-xs text-gray-500">
                เปิด = แต่ละคนจัดตำแหน่ง/ขนาดการ์ดบนบอร์ดทีมเป็นของตัวเองได้ ·
                ปิด = ทุกคนใช้เฉพาะที่คุณจัดไว้เท่านั้น
              </p>
            </div>
            <button
              onClick={() => setAllowCardLayout(!allowCardLayout)}
              className={`flex-shrink-0 w-12 h-7 rounded-full relative transition-colors ${
                allowCardLayout ? 'bg-cyan-500' : 'bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
                  allowCardLayout ? 'left-6' : 'left-1'
                }`}
              ></span>
            </button>
          </div>
        </div>
      )}

      {/* Actions Section - Show for all users */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/company')}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
          >
            ＋ สร้างบริษัทใหม่
          </button>
          <button className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors">
            เข้าร่วมบริษัทอื่น
          </button>
        </div>
      </div>

      {/* Leave Company Section - Show for all users */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">ออกจากบริษัท</h2>
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="font-semibold text-white mb-1">ออกจากบริษัท «{companyName}»</p>
            <p className="text-xs text-gray-400">
              คุณจะไม่เห็นบอร์ด งาน และข้อมูลของบริษัทนี้อีก — กลับเข้ามาใหม่ได้ด้วยลิงก์เชิญ
              การ์ดพนักงานและงานที่คุณถืออยู่ยังอยู่กับบริษัท
            </p>
          </div>
          <button className="flex-shrink-0 px-4 py-2 bg-gray-700 border border-gray-600 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors">
            ออกจากบริษัท
          </button>
        </div>
      </div>

      {/* Delete Company Section - Only for owners */}
      {canManage && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-red-500">ลบบริษัท</h2>
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold text-white mb-1">ลบบริษัทนี้ถาวร</p>
              <p className="text-xs text-gray-400">
                ลบพนักงาน งาน ทีม ลิงก์เชิญ และข้อมูลทั้งหมดของบริษัท ย้อนกลับไม่ได้ —
                ต้องพิมพ์ชื่อบริษัทยืนยัน แล้วกรอกรหัสที่ส่งไปอีเมลของคุณ
              </p>
            </div>
            <button className="flex-shrink-0 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors">
              ลบบริษัท
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
