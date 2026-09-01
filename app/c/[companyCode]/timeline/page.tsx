'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  projectName: string;
  dueDate: string;
  status: string;
  assignee: string;
}

export default function TimelinePage() {
  const router = useRouter();
  const params = useParams();
  const companyCode = params.companyCode as string;
  const [isHydrated, setIsHydrated] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('month');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) router.push('/login');
    else setIsHydrated(true);
  }, [router]);

  if (!isHydrated) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">ไทม์ไลน์</h1>
        <p className="text-gray-400 mt-2">โปรเจคและงานของทั้งทีมเรียงตามวันเสร็จ</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={view}
          onChange={(e) => setView(e.target.value)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
        >
          <option value="day">รายวัน</option>
          <option value="week">รายสัปดาห์</option>
          <option value="month">รายเดือน</option>
        </select>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
        >
          <option value="all">ทั้งหมด</option>
          <option value="today">วันนี้</option>
          <option value="week">สัปดาห์นี้</option>
          <option value="overdue">ล้นวัน</option>
        </select>
      </div>

      {/* Timeline Content */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/20 border border-gray-700 rounded-lg">
          <p className="text-gray-400">งานที่มีอยู่ถูกซ่อนไว้ทั้งหมด</p>
          <p className="text-sm text-gray-500 mt-2">งานรูทีนที่ยังไม่กำหนดช่วงวัน 0 งาน</p>
          <p className="text-xs text-gray-500 mt-4">กดปุ่มด้านบนเพื่อแสดง หรือกำหนดช่วงวันให้งาน</p>
        </div>
      ) : (
        <div className="space-y-4 bg-gray-800/20 rounded-lg p-4">
          {tasks.map((task) => (
            <div key={task.id} className="border-l-4 border-cyan-500 pl-4 py-2">
              <h3 className="font-medium text-white">{task.title}</h3>
              <p className="text-sm text-gray-400">{task.projectName}</p>
              <p className="text-xs text-gray-500 mt-1">{task.dueDate}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
