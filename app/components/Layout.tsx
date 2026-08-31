'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';
import TabNav from './TabNav';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
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
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              🔔
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span>{user?.name}</span>
              <button
                onClick={handleLogout}
                className="p-1 hover:bg-red-50 text-red-600 rounded text-xs"
              >
                ↪️
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <TabNav />

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
