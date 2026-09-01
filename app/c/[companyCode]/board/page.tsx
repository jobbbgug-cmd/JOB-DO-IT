'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'in-review' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignee?: string;
  dueDate?: string;
}

const COLUMNS = [
  { id: 'todo', name: 'ต้องทำ', icon: '📝' },
  { id: 'in-progress', name: 'กำลังทำ', icon: '🔄' },
  { id: 'in-review', name: 'รอตรวจสอบ', icon: '👀' },
  { id: 'done', name: 'เสร็จแล้ว', icon: '✅' },
];

const PRIORITY_COLORS = {
  urgent: 'border-red-500 bg-red-500/10',
  high: 'border-orange-500 bg-orange-500/10',
  medium: 'border-yellow-500 bg-yellow-500/10',
  low: 'border-blue-500 bg-blue-500/10',
};

const PRIORITY_LABELS = {
  urgent: 'เร่งด่วน',
  high: 'สูง',
  medium: 'ปกติ',
  low: 'ต่ำ',
};

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const companyCode = params.companyCode as string;
  const [isHydrated, setIsHydrated] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
  });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
    } else {
      setIsHydrated(true);
      fetchTasks();
    }
  }, [router]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks/${companyCode}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      alert('กรุณากรอกชื่องาน');
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${companyCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description || null,
          priority: newTask.priority,
          status: 'todo',
        }),
      });

      if (response.ok) {
        const created = await response.json();
        setTasks([...tasks, created.task]);
        setNewTask({ title: '', description: '', priority: 'medium' });
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('สร้างงานไม่สำเร็จ');
    }
  };

  if (!isHydrated) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const tasksByStatus = {
    'todo': tasks.filter(t => t.status === 'todo'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    'in-review': tasks.filter(t => t.status === 'in-review'),
    'done': tasks.filter(t => t.status === 'done'),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">บอร์ดงาน</h1>
          <p className="text-gray-400 mt-2">จัดการและติดตามงานทั้งหมด</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors min-h-[44px] whitespace-nowrap"
        >
          + งานใหม่
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-400 block mb-2">ชื่องาน</label>
            <input
              type="text"
              placeholder="เช่น ดูแลเว็บไซต์"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-base min-h-[44px]"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-400 block mb-2">รายละเอียด (ไม่บังคับ)</label>
            <textarea
              placeholder="รายละเอียดงาน..."
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-vertical text-base min-h-[100px]"
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-400 block mb-2">ลำดับความสำคัญ</label>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-base min-h-[44px]"
            >
              <option value="low">ต่ำ</option>
              <option value="medium">ปกติ</option>
              <option value="high">สูง</option>
              <option value="urgent">เร่งด่วน</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateTask}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
            >
              สร้างงาน
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewTask({ title: '', description: '', priority: 'medium' });
              }}
              className="px-4 py-2 text-gray-400 hover:text-gray-300 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {COLUMNS.map((column) => (
          <div key={column.id} className="bg-gray-800/20 rounded-lg p-4 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>{column.icon}</span>
              {column.name}
            </h2>

            <div className="space-y-3">
              {tasksByStatus[column.id as keyof typeof tasksByStatus].map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border ${PRIORITY_COLORS[task.priority]} cursor-move hover:shadow-lg transition-shadow`}
                >
                  <h3 className="font-medium text-white text-sm">{task.title}</h3>
                  {task.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-gray-700 rounded text-gray-300">
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                    {task.dueDate && (
                      <span>{new Date(task.dueDate).toLocaleDateString('th-TH')}</span>
                    )}
                  </div>
                </div>
              ))}
              {tasksByStatus[column.id as keyof typeof tasksByStatus].length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">ไม่มีงาน</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
