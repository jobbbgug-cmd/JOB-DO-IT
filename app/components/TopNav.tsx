'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';
import { useUIStore } from '@/app/store/uiStore';
import UserMenu from './UserMenu';

const getTabsWithCompany = (companyCode: string) => {
  const prefix = companyCode ? `/c/${companyCode}` : '';
  return [
    { name: 'บอร์ดทีม', href: companyCode ? `${prefix}/boardteam` : '/boardteam', icon: '📊' },
    { name: 'บอร์ดงาน', href: companyCode ? `${prefix}/board` : '/board', icon: '📋' },
    { name: 'โปรเจค', href: companyCode ? `${prefix}/projects` : '/projects', icon: '📁' },
    { name: 'ไทม์ไลน์', href: companyCode ? `${prefix}/timeline` : '/timeline', icon: '📈' },
    { name: 'โน้ต', href: companyCode ? `${prefix}/notes` : '/notes', icon: '📝' },
    { name: 'บริษัท', href: companyCode ? `${prefix}/company/employees` : '/company', icon: '🏢' },
  ];
};

export default function TopNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { openFeedback, openShortcuts, zoom, zoomIn, zoomOut, companyCode } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayCompanyCode = mounted ? companyCode : '';
  const tabs = getTabsWithCompany(displayCompanyCode);

  const getActiveTab = () => {
    const tab = tabs.find((t) => {
      if (displayCompanyCode && pathname.startsWith(`/c/${displayCompanyCode}`)) {
        return t.name === 'บริษัท';
      }
      return pathname === t.href;
    });
    return tab || tabs[0];
  };

  const activeTab = getActiveTab();

  return (
    <nav className="bg-gray-800 border-b border-gray-700 h-16 flex items-center px-6 gap-6 sticky top-0 z-40">
      {/* Brand */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Image src="/icon.png" alt="JOB DO IT" width={32} height={32} className="h-8 w-8" />
        <div>
          <div className="font-bold text-white text-sm">JOB DO IT</div>
          <div className="text-xs text-gray-400">{displayCompanyCode || 'Task Manager'}</div>
        </div>
      </div>

      {/* Tabs - Desktop only */}
      <div className="hidden md:flex items-center gap-1" role="tablist">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              role="tab"
              aria-selected={isActive}
              className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>

      {/* Spring (Flex spacer) - Desktop only */}
      <div className="hidden md:flex flex-1"></div>

      {/* Zoom Controls - Desktop only */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-700 rounded text-sm text-gray-300">
        <button
          onClick={zoomOut}
          className="p-1 hover:text-white transition-colors disabled:opacity-50"
          title="ย่อ"
          disabled={zoom <= 50}
        >
          −
        </button>
        <div className="w-12 text-center text-xs">{zoom}%</div>
        <button
          onClick={zoomIn}
          className="p-1 hover:text-white transition-colors disabled:opacity-50"
          title="ขยาย"
          disabled={zoom >= 160}
        >
          +
        </button>
      </div>

      {/* Notification - Desktop only */}
      <button
        className="hidden md:block p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        title="แจ้งเตือน"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M10.268 21a2 2 0 0 0 3.464 0"></path>
          <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path>
        </svg>
      </button>

      {/* Spacer for mobile */}
      <div className="md:hidden flex-1"></div>

      {/* Keyboard Shortcuts */}
      <button
        onClick={openShortcuts}
        className="p-2 md:px-3 md:py-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors md:text-sm md:flex md:items-center md:gap-2"
        title="คีย์ลัด"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 md:w-4 md:h-4">
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"></path>
        </svg>
        <span className="hidden md:inline">คีย์ลัด</span>
      </button>

      {/* Feedback */}
      <button
        onClick={openFeedback}
        className="p-2 md:px-3 md:py-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors md:text-sm md:flex md:items-center md:gap-2"
        title="แจ้งปัญหา"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 md:w-4 md:h-4">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          <path d="M8 10h.01M12 10h.01M16 10h.01"></path>
        </svg>
        <span className="hidden md:inline">แจ้งปัญหา</span>
      </button>

      {/* User Menu */}
      <UserMenu />
    </nav>
  );
}
