'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import MoreMenu from './MoreMenu';

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const companyCode = pathname?.split('/')[2] || 'CONCEPTX';

  const handleNavClick = (path: string) => {
    router.push(`/c/${companyCode}/${path}`);
  };

  const isActive = (path: string) => pathname?.includes(path) || false;

  return (
    <div className="block md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
      <nav className="flex justify-between items-stretch w-full">
        {/* บอร์ดทีม */}
        <button
          onClick={() => handleNavClick('boardteam')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 transition-all border-t-2 ${
            isActive('boardteam')
              ? 'text-cyan-400 border-cyan-400 bg-gray-800/50'
              : 'text-gray-400 border-transparent'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <rect x="3" y="4" width="6" height="16" rx="1"></rect>
            <rect x="15" y="4" width="6" height="10" rx="1"></rect>
          </svg>
          <span className="text-xs font-medium">บอร์ดทีม</span>
        </button>

        {/* บอร์ดงาน */}
        <button
          onClick={() => handleNavClick('board')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 transition-all border-t-2 ${
            isActive('board') && !isActive('boardteam')
              ? 'text-cyan-400 border-cyan-400 bg-gray-800/50'
              : 'text-gray-400 border-transparent'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M9 6h11M9 12h11M9 18h11"></path>
            <path d="M4 6h.01M4 12h.01M4 18h.01"></path>
          </svg>
          <span className="text-xs font-medium">บอร์ดงาน</span>
        </button>

        {/* โปรเจค */}
        <button
          onClick={() => handleNavClick('projects')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 transition-all border-t-2 ${
            isActive('projects')
              ? 'text-cyan-400 border-cyan-400 bg-gray-800/50'
              : 'text-gray-400 border-transparent'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 2.8 12V4a1.2 1.2 0 0 1 1.2-1.2h8a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.8Z"></path>
            <circle cx="7.5" cy="7.5" r="1.3"></circle>
          </svg>
          <span className="text-xs font-medium">โปรเจค</span>
        </button>

        {/* ไทม์ไลน์ */}
        <button
          onClick={() => handleNavClick('timeline')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 transition-all border-t-2 ${
            isActive('timeline')
              ? 'text-cyan-400 border-cyan-400 bg-gray-800/50'
              : 'text-gray-400 border-transparent'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="m9 5 7 7-7 7"></path>
          </svg>
          <span className="text-xs font-medium">ไทม์ไลน์</span>
        </button>

        {/* เพิ่มเติม (More Menu) */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 transition-all border-t-2 text-gray-400 border-transparent hover:text-gray-300"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <circle cx="5" cy="12" r="1.8"></circle>
            <circle cx="12" cy="12" r="1.8"></circle>
            <circle cx="19" cy="12" r="1.8"></circle>
          </svg>
          <span className="text-xs font-medium">เพิ่มเติม</span>
        </button>
      </nav>

      {/* More Menu Modal */}
      <MoreMenu
        isOpen={showMoreMenu}
        onClose={() => setShowMoreMenu(false)}
        companyCode={companyCode}
      />
    </div>
  );
}
