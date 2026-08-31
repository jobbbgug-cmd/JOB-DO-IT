'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const companyCode = typeof window !== 'undefined' ? localStorage.getItem('companyCode') : null;
    if (companyCode) {
      router.replace(`/c/${companyCode}/boardteam`);
    } else {
      router.replace('/boardteam');
    }
  }, [router]);

  return null;
}
