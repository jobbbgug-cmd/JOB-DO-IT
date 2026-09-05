'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'in-review' | 'done';
  priority: string;
  progress: number;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  color: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  'todo': { label: 'ยังไม่เริ่ม', color: '#5B7FB0' },
  'in-progress': { label: 'กำลังทำ', color: '#C98A0E' },
  'in-review': { label: 'รอรีวิว', color: '#8A5CF6' },
  'done': { label: 'เสร็จ', color: '#0E9384' },
};

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const companyCode = params.companyCode as string;
  const employeeId = params.employeeId as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await fetch(`/api/employees/${companyCode}`);
        const allEmployees = await empRes.json();
        const emp = allEmployees.find((e: any) => (e.id || e._id) === employeeId);
        setEmployee(emp);

        const tasksRes = await fetch(`/api/tasks?companyCode=${companyCode}`);
        const allTasks = await tasksRes.json();
        const empTasks = allTasks.filter((t: any) => t.assignee === employeeId);
        setTasks(empTasks);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (companyCode && employeeId) {
      fetchData();
    }
  }, [companyCode, employeeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-gray-400">Employee not found</div>
      </div>
    );
  }

  const columns = Object.entries(statusConfig).map(([status, config]) => ({
    status: status as Task['status'],
    label: config.label,
    color: config.color,
    tasks: tasks.filter(t => t.status === status),
  }));

  return (
    <div className="fixed inset-0 w-screen h-screen bg-slate-950">
      <div className="absolute top-20 left-6 z-50 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-cyan-400 transition-colors"
          title="กลับ"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"></path>
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full text-white font-bold flex items-center justify-center text-base shadow-lg"
            style={{ backgroundColor: employee.color }}
          >
            {employee.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{employee.name}</h1>
            <p className="text-xs text-gray-400">{employee.role}</p>
          </div>
        </div>
      </div>

      <div className="pt-40 pl-6 pr-24 pb-6 h-full overflow-auto">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(300px, 1fr))` }}>
        {columns.map(column => (
          <div key={column.status} className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <div className="mb-4 pb-4 border-b border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: column.color }}
                ></span>
                <h2 className="font-semibold text-white">{column.label}</h2>
              </div>
              <p className="text-xs text-gray-500">{column.tasks.length} งาน</p>
            </div>

            <div className="space-y-2 min-h-[400px]">
              {column.tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-600 italic">ยังไม่มีงาน</div>
              ) : (
                column.tasks.map(task => (
                  <div
                    key={task.id}
                    className="bg-gray-800/50 rounded p-3 hover:bg-gray-800 transition-colors border-l-2"
                    style={{ borderColor: column.color }}
                  >
                    <p className="text-sm font-medium text-gray-100 mb-2">{task.title}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: `${column.color}33`, color: column.color }}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-gray-500">{task.progress}%</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-700 rounded-full h-1 overflow-hidden">
                      <div
                        className="h-1 transition-all"
                        style={{ width: `${task.progress}%`, backgroundColor: column.color }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
