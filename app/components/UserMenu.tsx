'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';

export default function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
        title="เมนูผู้ใช้"
      >
        {user?.name?.substring(0, 2).toUpperCase() || 'U'}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white text-sm font-medium flex items-center justify-center">
              {user?.name?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="font-semibold text-white">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-400">บัญชีผู้ใช้</div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Settings */}
            <button
              onClick={() => {
                router.push('/dashboard/settings');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-sm"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              ตั้งค่า
            </button>

            {/* Help */}
            <button
              onClick={() => {
                // TODO: Show help modal
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-sm"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 0.9c0 1.8-2.7 2.2-2.7 3.9"></path>
                <path d="M12 17.4h.01"></path>
              </svg>
              สอนใช้งาน
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors text-sm"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <path d="M16 17l5-5-5-5M21 12H9"></path>
              </svg>
              ออกจากระบบ
            </button>
          </div>
        </div>
      )}

      {/* Close menu when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
