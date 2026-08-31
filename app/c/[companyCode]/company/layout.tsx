'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const TABS = [
  { id: 'employees', label: 'พนักงาน' },
  { id: 'teams', label: 'ทีม' },
  { id: 'info', label: 'ข้อมูลบริษัท' },
];

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const companyCode = params.companyCode as string;
  const [activeTab, setActiveTab] = useState('employees');

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{companyCode}</h1>
          <p className="text-gray-400">
            รหัสบริษัท {companyCode} · จัดการข้อมูล พนักงาน และการเข้าร่วม
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-6 border-b border-gray-700">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            href={`/c/${companyCode}/company/${tab.id === 'employees' ? '' : tab.id}`}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-cyan-500 -mb-[1px]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Content */}
      <div className="mw-section">{children}</div>
    </>
  );
}
