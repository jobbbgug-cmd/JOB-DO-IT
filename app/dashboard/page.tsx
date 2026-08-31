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
  { key: 'todo', label: 'ทำได้', color: 'bg-blue-50 border-blue-200' },
  { key: 'in_progress', label: 'กำลังทำ', color: 'bg-orange-50 border-orange-200' },
  { key: 'in_review', label: 'รอตรวจสอบ', color: 'bg-yellow-50 border-yellow-200' },
  { key: 'done', label: 'เสร็จสิ้น', color: 'bg-green-50 border-green-200' },
];

const getPriorityBadge = (priority: string) => {
  const colors = {
    urgent: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };
  const labels = {
    urgent: 'ด่วน',
    high: 'สูง',
    medium: 'กลาง',
    low: 'ต่ำ',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[priority as keyof typeof colors]}`}>
      {labels[priority as keyof typeof labels]}
    </span>
  );
};

export default function Home() {
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
          <h1 className="text-3xl font-bold text-gray-900">บอร์ดทีม</h1>
          <p className="text-gray-600 mt-2">ติดตามความคืบหน้างานของทีม</p>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-x-auto pb-6">
          {statuses.map((status) => (
            <div key={status.key} className={`flex flex-col gap-4 p-4 rounded-lg border ${status.color} min-w-72`}>
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900">{status.label}</h2>
                <span className="text-sm font-semibold text-gray-600 bg-white px-2 py-1 rounded">
                  {mockTasks.filter((t) => t.status === status.key).length}
                </span>
              </div>

              <div className="space-y-3">
                {mockTasks
                  .filter((task) => task.status === status.key)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight flex-1">
                          {task.title}
                        </h3>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {getPriorityBadge(task.priority)}
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                          {task.assignee}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>ความคืบหน้า</span>
                          <span>{task.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Time Info */}
                      <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-gray-100">
                        <div className="flex justify-between">
                          <span>ตั้งไว้:</span>
                          <span className="font-medium">{task.estimatedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ใช้ไปแล้ว:</span>
                          <span className="font-medium">{task.spentTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                {mockTasks.filter((t) => t.status === status.key).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
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
