'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';

interface Employee {
  id: string;
  name: string;
  role: string;
  presence: boolean;
  taskCount?: number;
}

export default function TeamBoard() {
  const router = useRouter();
  const params = useParams();
  const companyCode = params.companyCode as string;
  const { user } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!storedToken) {
      router.push('/login');
    } else {
      setIsHydrated(true);
      fetchEmployees();
    }
  }, [router, companyCode]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`/api/employees/${companyCode}`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  if (!isHydrated) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const handleAddEmployee = () => {
    router.push(`/c/${companyCode}/company`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">บอร์ดทีม</h1>
        <p className="text-gray-400 mt-2">จัดการสมาชิกทีมและพนักงาน</p>
      </div>

      {employees.length === 0 ? (
        <button
          onClick={handleAddEmployee}
          className="w-1/4 min-h-72 border-4 border-dashed border-gray-600 hover:border-cyan-500 rounded-xl flex items-center justify-center transition-colors group"
        >
          <p className="text-3xl font-semibold text-gray-300 group-hover:text-white transition-colors">
            + เพิ่มพนักงาน
          </p>
        </button>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-cyan-500 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-semibold flex items-center justify-center text-sm">
                  {emp.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{emp.name}</h3>
                  <p className="text-xs text-gray-400 truncate">{emp.role}</p>
                </div>
                {emp.presence && (
                  <span className="text-xs font-bold text-green-400 flex-shrink-0">🟢</span>
                )}
              </div>
              {emp.taskCount !== undefined && (
                <div className="pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-500">งานทั้งหมด: {emp.taskCount}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
