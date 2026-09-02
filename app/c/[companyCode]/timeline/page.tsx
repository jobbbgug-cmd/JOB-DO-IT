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
  const [view, setView] = useState('week');
  const [viewType, setViewType] = useState('overview');
  const [showAll, setShowAll] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

      {/* Timeline Tools - Single Line */}
      <div className="flex gap-2 items-center overflow-x-auto pb-2 whitespace-nowrap scrollbar-hide">
        {/* View Type Buttons */}
        <button
          onClick={() => setViewType('overview')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            viewType === 'overview'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:text-white'
          }`}
          title="งานทั้งหมดเรียงตามวันเสร็จ ไม่แบ่งตามคน"
        >
          ภาพรวม
        </button>
        <button
          onClick={() => setViewType('employee')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            viewType === 'employee'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:text-white'
          }`}
          title="แบ่งตามพนักงาน → โปรเจค → งาน"
        >
          รายพนักงาน
        </button>

        {/* Time Scale Buttons */}
        <button
          onClick={() => setView('day')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            view === 'day'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          รายวัน
        </button>
        <button
          onClick={() => setView('week')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            view === 'week'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          รายสัปดาห์
        </button>
        <button
          onClick={() => setView('month')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            view === 'month'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          รายเดือน
        </button>

        {/* Action Buttons */}
        <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded font-medium transition-colors" title="เลื่อนไปวันนี้">
          วันนี้
        </button>
        <button disabled className="px-3 py-1.5 bg-gray-800 text-gray-500 text-xs rounded font-medium opacity-50 cursor-not-allowed" title="กาง/พับงานในทุกโปรเจคพร้อมกัน">
          กางงานในโปรเจค
        </button>
        <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded font-medium transition-colors" title="งานรูทีนที่ไม่ได้กำหนดช่วงวัน">
          งานรูทีน (+1)
        </button>
        <button
          onClick={() => setShowAll(!showAll)}
          className={`px-3 py-1.5 text-xs rounded font-medium transition-colors ${
            showAll
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          title="แสดงทั้งหมด"
        >
          แสดงทั้งหมด
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className={`px-3 py-1.5 text-xs rounded font-medium transition-colors ${
            isFullscreen
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          title="แสดงตารางเต็มหน้าจอ"
        >
          เต็มจอ
        </button>
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
