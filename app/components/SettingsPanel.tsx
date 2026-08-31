'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/app/store/uiStore';
import { useAuthStore } from '@/app/store/authStore';

export default function SettingsPanel() {
  const router = useRouter();
  const { settingsOpen, closeSettings } = useUIStore();
  const { user, logout } = useAuthStore();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState('system');
  const [zoom, setZoom] = useState(150);

  useEffect(() => {
    if (user) {
      setDisplayName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  if (!settingsOpen) return null;

  const handleLogout = () => {
    logout();
    closeSettings();
    router.push('/login');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={closeSettings}
      />

      {/* Settings Sheet */}
      <aside
        className="fixed right-0 top-0 bottom-0 w-96 bg-gray-800 border-l border-gray-700 shadow-xl z-50 flex flex-col overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="ตั้งค่า"
      >
        {/* Header */}
        <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">ตั้งค่า</h2>
          <button
            onClick={closeSettings}
            className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            aria-label="ปิด"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M18 6 6 18M6 6l12 12"></path>
            </svg>
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Profile Section */}
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="font-semibold text-white">โปรไฟล์ของฉัน</h3>
              <p className="text-sm text-gray-400">ชื่อ อีเมล และรูปที่คนอื่นเห็น</p>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-blue-500 text-white font-semibold flex items-center justify-center text-lg">
                {user?.name?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col gap-2">
                <button className="px-3 py-1.5 text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors">
                  เปลี่ยนรูป
                </button>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">ชื่อ</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ชื่อที่แสดง"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none text-sm"
                />
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors text-sm" disabled>
                  บันทึก
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">อีเมล</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none text-sm"
                  disabled
                />
                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white font-medium rounded-lg transition-colors text-sm">
                  เปลี่ยนอีเมล
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                การเปลี่ยนอีเมลต้องยืนยัน — ระบบจะส่งอีเมลยืนยันไปที่อีเมลใหม่
              </p>
            </div>
          </div>

          {/* Theme Section */}
          <div className="pb-6 border-t border-gray-700 pt-6">
            <div className="mb-3">
              <h3 className="font-semibold text-white">ธีม</h3>
              <p className="text-sm text-gray-400">สว่าง / มืด / ตามระบบ</p>
            </div>
            <div className="flex gap-2">
              {['light', 'dark', 'system'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                    theme === t
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:text-white'
                  }`}
                >
                  {t === 'light' ? 'สว่าง' : t === 'dark' ? 'มืด' : 'ระบบ'}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Section */}
          <div className="pb-6 border-t border-gray-700 pt-6">
            <div className="mb-3">
              <h3 className="font-semibold text-white">ขนาดบอร์ด</h3>
              <p className="text-sm text-gray-400">ย่อ–ขยายทั้งหน้า</p>
            </div>
            <div className="flex items-center justify-center gap-4 bg-gray-700 rounded-lg p-3">
              <button
                onClick={() => setZoom(Math.max(100, zoom - 10))}
                className="px-3 py-1 hover:text-white text-gray-400 transition-colors"
              >
                −
              </button>
              <div className="w-16 text-center text-sm font-semibold text-white">{zoom}%</div>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="px-3 py-1 hover:text-white text-gray-400 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Account Section */}
          <div className="pb-6 border-t border-gray-700 pt-6">
            <div className="mb-3">
              <h3 className="font-semibold text-white">บัญชี</h3>
              <p className="text-sm text-gray-400">{user?.name || 'User'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              ออกจากระบบ
            </button>
          </div>

          {/* Task Type Labels */}
          <div className="border-t border-gray-700 pt-6">
            <div className="mb-3">
              <h3 className="font-semibold text-white">ป้ายประเภทงาน</h3>
              <p className="text-sm text-gray-400">สองช่องต่อพนักงาน</p>
            </div>
            <div className="flex gap-3 text-xs font-semibold">
              <span className="text-blue-400">● รูทีน</span>
              <span className="text-red-400">● จิกปะทะ</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
