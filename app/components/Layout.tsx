'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';
import TabNav from './TabNav';
import Dock from './Dock';
import SideRail from './SideRail';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Top Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="JOB DO IT"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400">
              🔔
            </button>
            <div className="flex items-center gap-3">
              <div className="text-sm">
                <p className="font-medium text-gray-100">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-900/20 rounded-lg transition-colors"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <TabNav />

      {/* Main Content with SideRail */}
      <main className="flex-1 overflow-auto p-6 pr-24 pb-24 bg-gray-900">{children}</main>

      {/* Dock */}
      <Dock />

      {/* SideRail */}
      <SideRail />
    </div>
  );
}
