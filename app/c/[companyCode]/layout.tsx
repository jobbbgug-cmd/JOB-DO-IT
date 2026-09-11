'use client';
import { getApiUrl } from '@/lib/api';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUIStore } from '@/app/store/uiStore';
import { useAuthStore } from '@/app/store/authStore';
import Layout from '@/app/components/Layout';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const { setCompanyCode } = useUIStore();
  const { token } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const verifyCompany = async () => {
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(getApiUrl(`/api/company/${params.companyCode}`), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 404 || response.status === 401) {
          router.push('/login');
          return;
        }

        if (response.ok) {
          setCompanyCode(params.companyCode as string);
          setIsHydrated(true);
        }
      } catch (error) {
        console.error('Company verification failed:', error);
        router.push('/login');
      }
    };

    verifyCompany();
  }, [params.companyCode, token, router, setCompanyCode]);

  if (!isHydrated) {
    return <div>Loading...</div>;
  }

  return <Layout>{children}</Layout>;
}
