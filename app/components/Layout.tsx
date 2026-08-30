'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/' },
    { icon: '📋', label: 'Board', path: '/board' },
    { icon: '📁', label: 'Projects', path: '/projects' },
    { icon: '📝', label: 'Tasks', path: '/tasks' },
    { icon: '⚙️', label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            {sidebarOpen ? (
              <Image
                src="/icon.png"
                alt="JOB DO IT"
                width={150}
                height={40}
                className="h-8 w-auto"
              />
            ) : (
              <Image
                src="/logo.png"
                alt="JOB DO IT"
                width={32}
                height={32}
                className="h-8 w-8 rounded"
              />
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          {sidebarOpen && user && (
            <div className="text-sm">
              <p className="font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full text-xs text-gray-600 hover:text-gray-900 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            {sidebarOpen ? 'Logout' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              >
                ☰
              </button>
              <Image
                src="/icon.png"
                alt="JOB DO IT"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                🔔
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                ⚙️
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
