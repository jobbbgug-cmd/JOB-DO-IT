'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function CompanyPage() {
  const router = useRouter();
  const params = useParams();
  const companyCode = params.companyCode as string;

  useEffect(() => {
    router.replace(`/c/${companyCode}/company/employees`);
  }, [router, companyCode]);

  return null;
}
