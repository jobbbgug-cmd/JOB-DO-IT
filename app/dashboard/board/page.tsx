'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';
import Layout from '@/app/components/Layout';

export default function BoardPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!storedToken) {
      router.push('/login');
    } else {
      setIsHydrated(true);
    }
  }, [router]);

  if (!isHydrated) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-gray-600 mt-2">Organize your tasks visually</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {['Todo', 'In Progress', 'In Review', 'Done'].map((status) => (
            <div key={status} className="bg-gray-100 rounded-lg p-4">
              <h2 className="font-semibold text-gray-900 mb-4">{status}</h2>
              <div className="space-y-3 min-h-96">
                <p className="text-center text-gray-500 text-sm">No tasks</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
