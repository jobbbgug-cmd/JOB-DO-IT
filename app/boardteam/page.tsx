'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';
import Layout from '@/app/components/Layout';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
}

export default function TeamBoard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!storedToken) {
      router.push('/login');
    } else {
      setIsHydrated(true);
    }
  }, [router]);

  if (!isHydrated) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const handleAddEmployee = () => {
    router.push('/company');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">บอร์ดทีม</h1>
          <p className="text-gray-400 mt-2">จัดการสมาชิกทีมและพนักงาน</p>
        </div>

        {/* Empty State - Add Employee */}
        {employees.length === 0 ? (
          <button
            onClick={handleAddEmployee}
            className="w-1/2 min-h-96 border-4 border-dashed border-gray-600 hover:border-cyan-500 rounded-xl flex items-center justify-center transition-colors group mx-auto"
          >
            <p className="text-3xl font-semibold text-gray-300 group-hover:text-white transition-colors">
              + เพิ่มพนักงาน
            </p>
          </button>
        ) : (
          /* Employee Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-semibold flex items-center justify-center">
                    {emp.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{emp.name}</h3>
                    <p className="text-xs text-gray-400">{emp.role}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">{emp.email}</p>
                  <p className="text-gray-400">{emp.department}</p>
                </div>
              </div>
            ))}

            {/* Add Employee Button */}
            <button 
              onClick={handleAddEmployee}
              className="bg-gray-800 border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-lg p-4 flex items-center justify-center min-h-40 transition-colors group"
            >
              <div className="text-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-gray-400 group-hover:text-blue-500 mx-auto mb-2 transition-colors"
                >
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
                <span className="text-gray-300 group-hover:text-white font-medium text-sm transition-colors">
                  เพิ่มพนักงาน
                </span>
              </div>
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
