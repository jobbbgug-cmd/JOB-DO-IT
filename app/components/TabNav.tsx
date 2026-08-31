'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: 'แดชบอร์ด', href: '/', icon: '📊' },
  { name: 'บอร์ด', href: '/board', icon: '📋' },
  { name: 'โปรเจกต์', href: '/projects', icon: '📁' },
  { name: 'งาน', href: '/tasks', icon: '✅' },
  { name: 'ตั้งค่า', href: '/settings', icon: '⚙️' },
];

export default function TabNav() {
  const pathname = usePathname();

  return (
    <div className="bg-white border-b border-gray-200 overflow-x-auto">
      <div className="flex gap-8 px-6">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`py-4 px-2 whitespace-nowrap font-medium text-sm border-b-2 transition-colors ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
