'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUIStore } from '@/app/store/uiStore';
import Layout from '@/app/components/Layout';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const { setCompanyCode } = useUIStore();

  useEffect(() => {
    setCompanyCode(params.companyCode as string);
  }, [params.companyCode, setCompanyCode]);

  return <Layout>{children}</Layout>;
}
