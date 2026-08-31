'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';
import TopNav from './TopNav';
import Dock from './Dock';
import SideRail from './SideRail';
import SettingsPanel from './SettingsPanel';
import FeedbackPanel from './FeedbackPanel';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Top Navigation */}
      <TopNav />

      {/* Main Content with SideRail */}
      <main className="flex-1 overflow-auto p-6 pr-24 pb-24 bg-gray-900">{children}</main>

      {/* Dock */}
      <Dock />

      {/* SideRail */}
      <SideRail />

      {/* Panels */}
      <SettingsPanel />
      <FeedbackPanel />
    </div>
  );
}
