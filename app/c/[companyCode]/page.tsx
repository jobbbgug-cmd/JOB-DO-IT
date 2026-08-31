'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';
import Layout from '@/app/components/Layout';

interface Employee {
  id: string;
  name: string;
  role: string;
  presence: boolean;
  taskCount: number;
  tasks: Array<{
    id: string;
    title: string;
    progress: number;
    lane: 'routine' | 'urgent';
  }>;
}

export default function CompanyPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [companyCode] = useState(params.companyCode as string);
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '157ac5bd-a9d5-46f8-a886-fef30626fef3',
      name: 'jobbbgug',
      role: 'เจ้าของบริษัท',
      presence: true,
      taskCount: 1,
      tasks: [
        {
          id: 'task-1',
          title: 'งานตัวอย่าง — ลากย้ายได้ กดเปิดดูรายละเอียด ลบทิ้งได้เลย',
          progress: 0,
          lane: 'routine',
        },
      ],
    },
  ]);

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
          <h1 className="text-3xl font-bold text-white">
            บริษัท: <span className="text-blue-400">{companyCode}</span>
          </h1>
          <p className="text-gray-400 mt-2">จัดการสมาชิกทีมและงาน</p>
        </div>

        {/* Employees Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors"
              style={{
                position: 'relative',
                width: '100%',
              }}
            >
              {/* Employee Header */}
              <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-700">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-blue-500 text-white font-semibold flex items-center justify-center text-lg">
                      {emp.name.substring(0, 2).toUpperCase()}
                    </div>
                    {emp.presence && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-gray-800"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{emp.name}</h3>
                    <p className="text-sm text-gray-400">{emp.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">งานทั้งหมด</div>
                  <div className="text-lg font-bold text-white">{emp.taskCount}</div>
                </div>
              </div>

              {/* Lanes */}
              <div className="space-y-3">
                {/* Routine Lane */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-sm font-semibold text-gray-300">งานรูทีน</span>
                    <span className="text-xs text-gray-500">
                      {emp.tasks.filter((t) => t.lane === 'routine').length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {emp.tasks
                      .filter((t) => t.lane === 'routine')
                      .map((task) => (
                        <div
                          key={task.id}
                          className="bg-gray-900 rounded p-2 text-sm text-gray-300 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                        >
                          <p className="text-xs mb-1">{task.title}</p>
                          <div className="w-full bg-gray-700 rounded-full h-1">
                            <div
                              className="bg-blue-500 h-1 rounded-full"
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{task.progress}%</div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Urgent Lane */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="text-sm font-semibold text-gray-300">งานจิกปะทะ</span>
                    <span className="text-xs text-gray-500">
                      {emp.tasks.filter((t) => t.lane === 'urgent').length}
                    </span>
                  </div>
                  {emp.tasks.filter((t) => t.lane === 'urgent').length === 0 ? (
                    <div className="text-xs text-gray-500 text-center py-2">ลากงานมาวาง</div>
                  ) : (
                    <div className="space-y-2">
                      {emp.tasks
                        .filter((t) => t.lane === 'urgent')
                        .map((task) => (
                          <div
                            key={task.id}
                            className="bg-gray-900 rounded p-2 text-sm text-gray-300 border border-gray-700 hover:border-red-500 transition-colors cursor-pointer"
                          >
                            <p className="text-xs mb-1">{task.title}</p>
                            <div className="w-full bg-gray-700 rounded-full h-1">
                              <div
                                className="bg-red-500 h-1 rounded-full"
                                style={{ width: `${task.progress}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{task.progress}%</div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
