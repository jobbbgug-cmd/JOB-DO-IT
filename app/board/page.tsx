'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';
import Layout from '@/app/components/Layout';

const mockTasks = [
  {
    id: 1,
    title: 'ดีไซน์หน้าแรกเว็บไซต์',
    status: 'todo',
    priority: 'high',
    assignee: 'Dev',
    progress: 0,
    estimatedTime: '8 ชั่วโมง',
    spentTime: '0 ชั่วโมง',
  },
  {
    id: 2,
    title: 'ติดตั้ง API endpoint สำหรับ login',
    status: 'in_progress',
    priority: 'urgent',
    assignee: 'Dev',
    progress: 45,
    estimatedTime: '6 ชั่วโมง',
    spentTime: '2.7 ชั่วโมง',
  },
  {
    id: 3,
    title: 'ทดสอบ responsiveness บนมือถือ',
    status: 'in_progress',
    priority: 'medium',
    assignee: 'Tester',
    progress: 60,
    estimatedTime: '4 ชั่วโมง',
    spentTime: '2.4 ชั่วโมง',
  },
  {
    id: 4,
    title: 'แก้ไข bug ใน navigation menu',
    status: 'in_review',
    priority: 'high',
    assignee: 'Dev',
    progress: 85,
    estimatedTime: '3 ชั่วโมง',
    spentTime: '2.5 ชั่วโมง',
  },
  {
    id: 5,
    title: 'เขียน unit tests สำหรับ auth',
    status: 'done',
    priority: 'medium',
    assignee: 'Dev',
    progress: 100,
    estimatedTime: '5 ชั่วโมง',
    spentTime: '4.8 ชั่วโมง',
  },
];

const statuses = [
  { key: 'todo', label: 'ทำได้', icon: '📝', color: 'from-blue-500 to-blue-600' },
  { key: 'in_progress', label: 'กำลังทำ', icon: '⚡', color: 'from-orange-500 to-orange-600' },
  { key: 'in_review', label: 'รอตรวจสอบ', icon: '🔍', color: 'from-yellow-500 to-yellow-600' },
  { key: 'done', label: 'เสร็จสิ้น', icon: '✅', color: 'from-green-500 to-green-600' },
];

const getPriorityBadge = (priority: string) => {
  const config = {
    urgent: { bg: 'bg-red-900/30', text: 'text-red-400', label: 'ด่วน' },
    high: { bg: 'bg-orange-900/30', text: 'text-orange-400', label: 'สูง' },
    medium: { bg: 'bg-yellow-900/30', text: 'text-yellow-400', label: 'กลาง' },
    low: { bg: 'bg-green-900/30', text: 'text-green-400', label: 'ต่ำ' },
  };
  const c = config[priority as keyof typeof config];
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
};

export default function KanbanBoard() {
  const router = useRouter();
  const { user } = useAuthStore();
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
          <h1 className="text-3xl font-bold text-white">บอร์ดงาน</h1>
          <p className="text-gray-400 mt-2">ติดตามความคืบหน้างานของทีม</p>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-x-auto pb-6">
          {statuses.map((status) => (
            <div key={status.key} className="flex flex-col gap-4 bg-gray-800/50 backdrop-blur rounded-lg p-4 min-w-72 border border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <span>{status.icon}</span>
                  {status.label}
                </h2>
                <span className="text-sm font-semibold text-gray-300 bg-gray-700 px-2.5 py-1 rounded-full">
                  {mockTasks.filter((t) => t.status === status.key).length}
                </span>
              </div>

              <div className="space-y-3">
                {mockTasks
                  .filter((task) => task.status === status.key)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="bg-gray-900 rounded-lg p-3 border border-gray-600 hover:border-blue-500 transition-all hover:shadow-lg cursor-pointer space-y-2 group"
                    >
                      <h3 className="font-semibold text-gray-100 text-sm leading-tight group-hover:text-white">
                        {task.title}
                      </h3>

                      <div className="flex gap-2 flex-wrap">
                        {getPriorityBadge(task.priority)}
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-700 text-gray-300">
                          {task.assignee}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>ความคืบหน้า</span>
                          <span className="font-medium">{task.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div
                            className={`bg-gradient-to-r ${status.color} h-1.5 rounded-full transition-all`}
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Time Info */}
                      <div className="text-xs text-gray-500 space-y-0.5 pt-2 border-t border-gray-700">
                        <div className="flex justify-between">
                          <span>ตั้งไว้:</span>
                          <span className="font-medium text-gray-400">{task.estimatedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ใช้ไปแล้ว:</span>
                          <span className="font-medium text-gray-400">{task.spentTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                {mockTasks.filter((t) => t.status === status.key).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">ไม่มีงาน</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
