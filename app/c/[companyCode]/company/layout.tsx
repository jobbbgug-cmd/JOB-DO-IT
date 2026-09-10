'use client';

import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const companyCode = params.companyCode as string;
  const [companyName, setCompanyName] = useState('');
  const [activeTab, setActiveTab] = useState('employees');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    
    // Fetch company name
    const fetchCompanyName = async () => {
      try {
        const response = await axios.get(`/api/company/${companyCode}`);
        setCompanyName(response.data.companyName || '');
      } catch (error) {
        console.error('Failed to fetch company name:', error);
        setCompanyName(companyCode); // Fallback to companyCode
      }
    };

    if (companyCode) {
      fetchCompanyName();
    }

    if (pathname.includes('/employees')) {
      setActiveTab('employees');
    } else if (pathname.includes('/teams')) {
      setActiveTab('teams');
    } else if (pathname.includes('/info')) {
      setActiveTab('info');
    } else {
      setActiveTab('employees');
    }
  }, [pathname, companyCode]);

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900 z-10">
        <h1 className="text-4xl font-bold text-white mb-2">{companyName || companyCode}</h1>
        <p className="text-gray-400">
          รหัสบริษัท {companyCode} · จัดการข้อมูล พนักงาน และการเข้าร่วม
        </p>
      </div>

      {/* Tabs */}
      {isHydrated && (
        <div className="flex gap-4 border-b border-gray-700">
          <Link
            href={`/c/${companyCode}/company`}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'employees'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            พนักงาน
          </Link>

          <Link
            href={`/c/${companyCode}/company/teams`}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'teams'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ทีม
          </Link>

          <Link
            href={`/c/${companyCode}/company/info`}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'info'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ข้อมูลบริษัท
          </Link>
        </div>
      )}

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
