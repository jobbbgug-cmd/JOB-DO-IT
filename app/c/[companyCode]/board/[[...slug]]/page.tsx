// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CreateTaskModal from '@/app/components/CreateTaskModal';
import TaskDetailModal from '@/app/components/TaskDetailModal';
import EditTaskModal from '@/app/components/EditTaskModal';
import type { Task } from '@/app/types/index';

const STATUS_CONFIG = [
  { id: 'todo' as const, name: 'ยังไม่เริ่ม', color: '#5B7FB0' },
  { id: 'in-progress' as const, name: 'กำลังทำ', color: '#C98A0E' },
  { id: 'in-review' as const, name: 'รอรีวิว', color: '#8A5CF6' },
  { id: 'done' as const, name: 'เสร็จ', color: '#0E9384' },
];

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const companyCode = params.companyCode as string;
  // Extract assignee ID from URL: /board/assigneeId
  const assigneeFilter = Array.isArray(params.slug) ? params.slug[0] : (params.slug || '') as string;
  const [isHydrated, setIsHydrated] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [activeTab, setActiveTab] = useState('todo');
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('แน่ใจหรือว่าต้องการลบงานนี้?')) {
      try {
        await fetch(`/api/tasks/${companyCode}/${taskId}`, {
          method: 'DELETE',
        });
        setTasks(tasks.filter(t => t.id !== taskId));
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  if (!isHydrated) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAssignee = !assigneeFilter || (t.assignees && t.assignees.includes(assigneeFilter));
    return matchesSearch && matchesAssignee;
  });

  // Debug log - ALWAYS
  console.log('🔍 DEBUG - Assignee Filter:', assigneeFilter);
  console.log('📋 DEBUG - All Tasks Count:', tasks.length);
  console.log('📋 DEBUG - All Tasks:', tasks);
  console.log('✅ DEBUG - Filtered Tasks Count:', filteredTasks.length);
  console.log('✅ DEBUG - Filtered Tasks:', filteredTasks);

  const getTasksByStatus = (status: string) =>
    filteredTasks.filter(t => t.status === status);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getAvatarColor = (name?: string) => {
    if (!name) return '#999';
    const colors = ['#5B7FB0', '#C98A0E', '#8A5CF6', '#0E9384', '#E4572E'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const pendingCount = getTasksByStatus('todo').length + getTasksByStatus('in-progress').length;

  // Using shared Task type from @/app/types/index
  const TaskCard = ({ task, statusColor }: { task: Task; statusColor: string }) => (
    <div
      onClick={() => setSelectedTask(task)}
      className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/40 rounded-lg p-3 text-xs text-gray-200 hover:from-gray-800/80 hover:to-gray-900/60 transition-all border border-gray-700/50 shadow-sm hover:shadow-md cursor-pointer"
    >
      {/* Edit/Delete Buttons - Top Right */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setSelectedTask(task)} className="p-1 hover:bg-gray-700/60 rounded transition-colors" title="แก้ไข">
          <svg className="w-4 h-4 text-gray-300 hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
          </svg>
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} className="p-1 hover:bg-gray-700/60 rounded transition-colors" title="ลบ">
          <svg className="w-4 h-4 text-gray-300 hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
          </svg>
        </button>
      </div>

      {/* Title */}
      <div className="font-semibold text-gray-100 mb-2 line-clamp-2 text-sm leading-tight pr-16">
        {task.title}
      </div>

      {/* Attachments/Files Row */}
      <div className="flex gap-1 mb-2 items-center">
        {/* File attachments would go here */}
        <span className="text-xs text-gray-500">📎</span>
      </div>

      {/* Footer: Status & Priority */}
      <div className="flex gap-1 mb-2 items-center">
        {task.priority && (
          <span
            className="text-[10px] px-2 py-0.5 rounded font-medium"
            style={{
              backgroundColor: `${statusColor}33`,
              color: statusColor,
            }}
          >
            {task.priority}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {task.progress !== undefined && (
        <div className="w-full bg-gray-700 rounded-full h-1 overflow-hidden border border-gray-600/30">
          <div
            className="h-1 transition-all"
            style={{ width: `${task.progress}%`, backgroundColor: statusColor }}
          ></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 pb-6">
      {/* Desktop/Large View */}
      <div className="hidden lg:block space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">บอร์ดงาน</h1>
            <p className="text-gray-400 text-xs sm:text-sm">งานทั้งหมดที่คุณถือ แยกตามสถานะ — ลากการ์ดข้ามคอลัมน์เพื่อเปลี่ยนสถานะ</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end w-full lg:w-auto">
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-900 rounded-lg text-sm font-medium transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
                <path d="M20 2v4"></path>
                <path d="M22 4h-4"></path>
                <circle cx="4" cy="20" r="2"></circle>
              </svg>
              <span>สรุปด้วย AI</span>
            </button>

            <div className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs sm:text-sm flex-shrink-0">
              <span className="hidden sm:inline text-gray-400">🔲</span>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-transparent text-white outline-none cursor-pointer"
              >
                <option value="all">ทุกโปรเจค</option>
              </select>
            </div>

            <input
              type="search"
              placeholder="ค้นหา…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-auto min-w-[120px] px-2 sm:px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs sm:text-sm flex-shrink-0"
            />
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 xl:grid-cols-4">
          {STATUS_CONFIG.map((status) => {
            const statusTasks = getTasksByStatus(status.id);
            return (
              <div
                key={status.id}
                className="bg-gray-800/30 rounded-lg border border-gray-700 flex flex-col overflow-hidden"
                style={{ 
                  borderTopColor: status.color,
                  borderTopWidth: '3px'
                }}
              >
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }}></span>
                    <h2 className="text-white font-semibold text-sm">{status.name}</h2>
                  </div>
                  <span className="text-gray-400 text-xs bg-gray-700/50 px-2 py-1 rounded">
                    {statusTasks.length}
                  </span>
                </div>

                <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[600px]">
                  {statusTasks.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                      ลากงานมาวาง
                    </div>
                  ) : (
                    statusTasks.map((task) => (
                      <TaskCard key={task.id} task={task} statusColor={status.color} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-white">บอร์ดงาน</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 bg-gray-700/50 px-2.5 py-1.5 rounded-full">
              ค้างอยู่ {pendingCount} งาน
            </span>
            
            {/* Tools - Compact */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs">
                <span className="text-gray-400">🔲</span>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="bg-transparent text-white outline-none cursor-pointer text-xs"
                >
                  <option value="all">ทุกโปรเจค</option>
                </select>
              </div>

              <button className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors flex-shrink-0" title="สรุปด้วย AI">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
                  <path d="M20 2v4"></path>
                  <path d="M22 4h-4"></path>
                  <circle cx="4" cy="20" r="2"></circle>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <svg viewBox="0 0 32 32" className="absolute left-3 top-2.5 w-4 h-4" aria-hidden="true">
            <rect width="32" height="32" rx="9" fill="#0e9384"/>
            <path d="M32 0 L32 32 L0 32 Z" fill="#e4572e"/>
            <rect x="10" y="10" width="12" height="12" rx="3.5" fill="#fff"/>
          </svg>
          <input
            type="search"
            placeholder="ค้นหางาน…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {STATUS_CONFIG.map((status) => {
            const count = getTasksByStatus(status.id).length;
            const isActive = activeTab === status.id;
            return (
              <button
                key={status.id}
                onClick={() => setActiveTab(status.id)}
                role="tab"
                aria-selected={isActive}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-sm font-medium transition-colors flex-shrink-0 flex items-center gap-2 ${
                  isActive
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {!isActive && (
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }}></span>
                )}
                {status.name}
                <span className="text-xs opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {STATUS_CONFIG.map((status) => {
            if (activeTab !== status.id) return null;
            const statusTasks = getTasksByStatus(status.id);

            return (
              <div key={status.id} className="space-y-3">
                {statusTasks.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-12 bg-gray-800/30 rounded-lg border border-gray-700">
                    ไม่มีงาน
                  </div>
                ) : (
                  statusTasks.map((task) => (
                    <TaskCard key={task.id} task={task} statusColor={status.color} />
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onEdit={(editTask: any) => {
          setEditingTask(editTask);
          setSelectedTask(null);
        }}
        onTaskUpdated={() => {
          fetchTasks();
          setSelectedTask(null);
        }}
        employees={employees}
        companyCode={companyCode}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        companyCode={companyCode}
        onTaskUpdated={() => {
          fetchTasks();
          setEditingTask(null);
        }}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        companyCode={companyCode}
      />
    </div>
  );
}
