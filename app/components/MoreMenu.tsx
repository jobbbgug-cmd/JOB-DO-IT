'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

interface MoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
  companyCode: string;
}

export default function MoreMenu({ isOpen, onClose, companyCode }: MoreMenuProps) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      label: 'แจ้งเตือน',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 1 0-12 0c0 6-3 7-3 7h18s-3-1-3-7"></path>
          <path d="M13.7 20a2 2 0 0 1-3.4 0"></path>
        </svg>
      ),
      action: () => console.log('Notifications'),
    },
    {
      label: 'การเปลี่ยนแปลง',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path>
          <path d="M3 3v5h5"></path>
          <path d="M12 7v5l3 2"></path>
        </svg>
      ),
      action: () => console.log('Changes'),
    },
    {
      label: 'โฟลเดอร์งาน',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 20a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2z"></path>
        </svg>
      ),
      action: () => console.log('Task Folders'),
    },
    {
      label: 'เพิ่มพนักงาน',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M19 8v6M22 11h-6"></path>
        </svg>
      ),
      action: () => {
        router.push(`/c/${companyCode}/company/employees`);
        onClose();
      },
    },
    {
      label: 'จัดการบริษัท',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"></path>
          <path d="M16 9h3a1 1 0 0 1 1 1v11"></path>
          <path d="M2 21h20"></path>
          <path d="M8 7h2M8 11h2M8 15h2M12 7h1M12 11h1M12 15h1"></path>
        </svg>
      ),
      action: () => {
        router.push(`/c/${companyCode}/company/info`);
        onClose();
      },
    },
    {
      label: 'โน้ต',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"></path>
          <path d="M14 3v6h6M8 13h7M8 17h5"></path>
        </svg>
      ),
      action: () => {
        router.push(`/c/${companyCode}/notes`);
        onClose();
      },
    },
    {
      label: 'โครงสร้างบริษัท',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="3" width="6" height="5" rx="1.2"></rect>
          <rect x="3" y="16" width="6" height="5" rx="1.2"></rect>
          <rect x="15" y="16" width="6" height="5" rx="1.2"></rect>
          <path d="M12 8v4M6 16v-2a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2"></path>
        </svg>
      ),
      action: () => {
        router.push(`/c/${companyCode}/company/teams`);
        onClose();
      },
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose}>
      <div
        className="fixed bottom-20 left-0 right-0 bg-gray-800 border-t border-gray-700 rounded-t-2xl max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1 p-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full flex items-center gap-4 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
              <span className="text-sm font-medium text-left flex-1">{item.label}</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4 flex-shrink-0"
              >
                <path d="m9 5 7 7-7 7"></path>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
