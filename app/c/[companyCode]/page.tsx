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
    time: string;
    assignee: string;
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
          time: '13:36',
          assignee: 'jobbbgug',
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
            บริษัท: <span className="text-cyan-400">{companyCode}</span>
          </h1>
          <p className="text-gray-400 mt-2">จัดการสมาชิกทีมและงาน</p>
        </div>

        {/* Employees Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-gray-900 border-2 border-cyan-600/40 hover:border-cyan-500/60 rounded-xl p-5 transition-all hover:shadow-lg hover:shadow-cyan-900/20"
            >
              {/* Employee Header with Drag Handle */}
              <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-700 group cursor-grab active:cursor-grabbing">
                {/* Drag Handle */}
                <div className="text-gray-600 group-hover:text-gray-400 transition-colors pt-1">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <circle cx="9" cy="6" r="1.4"></circle>
                    <circle cx="15" cy="6" r="1.4"></circle>
                    <circle cx="9" cy="12" r="1.4"></circle>
                    <circle cx="15" cy="12" r="1.4"></circle>
                    <circle cx="9" cy="18" r="1.4"></circle>
                    <circle cx="15" cy="18" r="1.4"></circle>
                  </svg>
                </div>

                {/* Avatar & Info */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold flex items-center justify-center text-base shadow-lg">
                      {emp.name.substring(0, 2).toUpperCase()}
                    </div>
                    {emp.presence && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 shadow-lg"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{emp.name}</h3>
                    <p className="text-xs text-gray-400">{emp.role}</p>
                  </div>
                </div>

                {/* Task Count & Actions */}
                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <div className="text-xs text-gray-500">งานทั้งหมด</div>
                    <div className="text-lg font-bold text-white">{emp.taskCount}</div>
                  </div>

                  {/* Board Button */}
                  <button
                    className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-cyan-400 transition-colors"
                    title="ดูบอร์ดงาน"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-4 h-4"
                    >
                      <rect x="3" y="4" width="6" height="16" rx="1"></rect>
                      <rect x="15" y="4" width="6" height="10" rx="1"></rect>
                    </svg>
                  </button>

                  {/* History Button */}
                  <button
                    className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-cyan-400 transition-colors"
                    title="ประวัติกิจกรรม"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-4 h-4"
                    >
                      <path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path>
                      <path d="M3 3v5h5"></path>
                      <path d="M12 7v5l3 2"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Lanes */}
              <div className="space-y-4">
                {/* Routine Lane */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                      <span className="text-sm font-semibold text-gray-200">งานรูทีน</span>
                      <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                        {emp.tasks.filter((t) => t.lane === 'routine').length}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {emp.tasks
                      .filter((t) => t.lane === 'routine')
                      .map((task) => (
                        <div
                          key={task.id}
                          className="bg-gray-800/50 border border-gray-700 hover:border-cyan-500/50 rounded-lg p-3 transition-all hover:bg-gray-800/80 cursor-pointer group"
                        >
                          <p className="text-sm text-gray-300 group-hover:text-white transition-colors mb-2 leading-snug">
                            {task.title}
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 justify-between">
                              <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-1.5 rounded-full transition-all"
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold text-gray-500 whitespace-nowrap ml-2">
                                {task.progress}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                                  {task.assignee.substring(0, 1).toUpperCase()}
                                </div>
                                <span className="text-xs text-gray-500">{task.assignee}</span>
                              </div>
                              <time className="text-xs text-gray-600">{task.time}</time>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Urgent Lane */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="text-sm font-semibold text-gray-200">งานจิกปะทะ</span>
                      <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                        {emp.tasks.filter((t) => t.lane === 'urgent').length}
                      </span>
                    </div>
                  </div>
                  {emp.tasks.filter((t) => t.lane === 'urgent').length === 0 ? (
                    <div className="text-xs text-gray-600 text-center py-6 italic border-2 border-dashed border-gray-700 rounded-lg">
                      ลากงานมาวาง
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {emp.tasks
                        .filter((t) => t.lane === 'urgent')
                        .map((task) => (
                          <div
                            key={task.id}
                            className="bg-gray-800/50 border border-gray-700 hover:border-red-500/50 rounded-lg p-3 transition-all hover:bg-gray-800/80 cursor-pointer group"
                          >
                            <p className="text-sm text-gray-300 group-hover:text-white transition-colors mb-2 leading-snug">
                              {task.title}
                            </p>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 justify-between">
                                <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-red-500 to-red-400 h-1.5 rounded-full transition-all"
                                    style={{ width: `${task.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-semibold text-gray-500 whitespace-nowrap ml-2">
                                  {task.progress}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                                    {task.assignee.substring(0, 1).toUpperCase()}
                                  </div>
                                  <span className="text-xs text-gray-500">{task.assignee}</span>
                                </div>
                                <time className="text-xs text-gray-600">{task.time}</time>
                              </div>
                            </div>
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
