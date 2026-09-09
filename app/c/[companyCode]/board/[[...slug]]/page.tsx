// @ts-nocheck
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';
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
  const searchParams = useSearchParams();
  const companyCode = params.companyCode as string;
  const { user } = useAuthStore();
  const [authUserId, setAuthUserId] = useState(''); // userId from auth system
  const [currentEmployeeId, setCurrentEmployeeId] = useState(''); // employees._id

  // Extract assignee ID from URL path: /c/CONCEPTX/board/assigneeId
  const assigneeFilter = Array.isArray(params.slug) ? params.slug[0] : (params.slug || '') as string;

  console.log('✅ Assignee Filter from path:', assigneeFilter);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [activeTab, setActiveTab] = useState('todo');
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [userCache, setUserCache] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync authUserId from useAuthStore or localStorage
  useEffect(() => {
    let userId = user?.id || '';

    // Fallback to localStorage if useAuthStore.user doesn't have id
    if (!userId && typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const storedUser = JSON.parse(userStr);
          userId = storedUser.id || storedUser._id || '';
        }
      } catch (e) {
        console.error('Failed to parse user from localStorage:', e);
      }
    }

    console.log('🔐 User sync:', { authStoreUser: user?.id, localStorageUser: userId });

    if (userId) {
      setAuthUserId(userId);
    } else {
      // No user ID found - redirect to login
      router.push('/login');
    }
  }, [user?.id, user, router]);

  // Map authUserId to currentEmployeeId from employees array
  useEffect(() => {
    if (authUserId && employees.length > 0) {
      const currentEmployee = employees.find(emp => emp.userId === authUserId);
      if (currentEmployee) {
        setCurrentEmployeeId(currentEmployee.id);
        setIsInitialized(true);
        console.log('🔗 Mapped authUserId to employeeId:', { authUserId, employeeId: currentEmployee.id });
      } else {
        console.warn('⚠️ Current employee not found for userId:', authUserId);
      }
    }
  }, [authUserId, employees]);

  // Check if viewing filtered tasks (read-only) or all tasks (editable)
  // read-only only if: assigneeFilter exists AND it's NOT current employee AND currentEmployeeId is loaded
  const isReadOnly = assigneeFilter ? (assigneeFilter !== currentEmployeeId && currentEmployeeId !== '') : false;
  const viewingUserName = employees.find(u => u.id === assigneeFilter)?.name || assigneeFilter || 'ผู้ใช้';

  // Debug logging
  useEffect(() => {
    console.log('🔍 DEBUG:', {
      authUserId,
      currentEmployeeId,
      assigneeFilter,
      isReadOnly,
      shouldShowButtons: !isReadOnly,
      isInitialized
    });
  }, [assigneeFilter, currentEmployeeId, isReadOnly, isInitialized, authUserId]);

  // Fetch data when initialized
  useEffect(() => {
    if (currentEmployeeId) {
      fetchTasks();
      fetchEmployees();
    }
  }, [currentEmployeeId]);

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

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`/api/employees/${companyCode}`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
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

  if (!currentEmployeeId) {
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
  const TaskCard = ({ task, statusColor, isReadOnly: cardIsReadOnly }: { task: Task; statusColor: string; isReadOnly: boolean }) => (
    <div
      onClick={() => setSelectedTask(task)}
      className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/40 rounded-lg p-3 text-xs text-gray-200 hover:from-gray-800/80 hover:to-gray-900/60 transition-all border border-gray-700/50 shadow-sm hover:shadow-md cursor-pointer"
      style={{ position: 'relative' }}
    >
      {/* Edit/Delete Buttons - Top Right (Only if editable) */}
      {!cardIsReadOnly && (
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
      )}

      <div onClick={() => setSelectedTask(task)}>
        {/* Title */}
        <div className="font-semibold text-gray-100 mb-2 line-clamp-2 text-sm leading-tight">
          {task.title}
        </div>

        {/* Attachments Preview with Badge */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="flex gap-1 mb-2 items-center">
            {task.attachments.map((attId: string, idx: number) => (
              <AttachmentThumbnail
                key={`${task.id}-${attId}-${idx}`}
                attId={attId}
              />
            ))}
            {task.attachments.length > 0 && (
              <div className="relative w-6 h-6">
                <span className="text-lg">📎</span>
                <span className="absolute -top-1 -right-1 bg-gray-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
                  {task.attachments.length}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar with Percentage */}
        {task.progress !== undefined && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 bg-gray-700/50 rounded-full h-1.5 overflow-hidden border border-gray-600/30">
              <div
                className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-1.5 transition-all rounded-full"
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 whitespace-nowrap">{task.progress}%</div>
          </div>
        )}

        {/* Creator Info and Timestamp */}
        {task.createdBy && (
          <div className="text-gray-500 text-xs flex items-center justify-between">
            <span>
              {(() => {
                if (userCache[task.createdBy]) {
                  return userCache[task.createdBy];
                }
                if (!userCache.hasOwnProperty(task.createdBy)) {
                  fetch(`/api/users/${task.createdBy}`)
                    .then(res => res.json())
                    .then(user => setUserCache(prev => ({ ...prev, [task.createdBy]: user.name || task.createdBy })))
                    .catch(() => setUserCache(prev => ({ ...prev, [task.createdBy]: task.createdBy })));
                }
                return userCache[task.createdBy] || task.createdBy;
              })()}
            </span>
            {task.createdAt && (
              <span>
                {new Date(task.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-6">
      {/* Desktop/Large View */}
      <div className="hidden lg:block space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <button
              onClick={() => router.push(`/c/${companyCode}/sprintId/6a98521598e246e523adb0ea`)}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-cyan-400 transition-colors mt-1"
              title="กลับ"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {assigneeFilter ? `บอร์ดงานของ ${viewingUserName}` : 'บอร์ดงาน'}
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm">
                {isReadOnly
                  ? `งานทั้งหมดที่ ${viewingUserName} ถือ แยกตามสถานะ — ดูได้อย่างเดียว แก้ไขไม่ได้`
                  : 'งานทั้งหมดที่คุณถือ แยกตามสถานะ — ลากการ์ดข้ามคอลัมน์เพื่อเปลี่ยนสถานะ'}
              </p>
            </div>
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
                      <TaskCard key={task.id} task={task} statusColor={status.color} isReadOnly={isReadOnly} />
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
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-2xl font-bold text-white">
              {assigneeFilter ? `บอร์ดงานของ ${viewingUserName}` : 'บอร์ดงาน'}
            </h1>
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
          <p className="text-gray-400 text-xs">
            {isReadOnly
              ? `งานทั้งหมดที่ ${viewingUserName} ถือ แยกตามสถานะ — ดูได้อย่างเดียว แก้ไขไม่ได้`
              : 'งานทั้งหมดที่คุณถือ แยกตามสถานะ — ลากการ์ดข้ามคอลัมน์เพื่อเปลี่ยนสถานะ'}
          </p>
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
                    <TaskCard key={task.id} task={task} statusColor={status.color} isReadOnly={isReadOnly} />
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
        isReadOnly={isReadOnly}
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

function AttachmentThumbnail({ attId }: { attId: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isImage, setIsImage] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        if (attId.includes('||')) {
          const [fileName, dataUrl] = attId.split('||');
          if (dataUrl && dataUrl.startsWith('data:')) {
            setPreview(dataUrl);
            setIsImage(dataUrl.startsWith('data:image/'));
            return;
          }
        }

        if (attId.startsWith('data:')) {
          setPreview(attId);
          setIsImage(attId.startsWith('data:image/'));
          return;
        }

        const res = await fetch('/api/attachments/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: attId })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.dataUrl) {
            setPreview(data.dataUrl);
            setIsImage(data.fileType?.startsWith('image/') || data.dataUrl.startsWith('data:image/'));
          }
        }
      } catch (error) {
        console.error('Failed to fetch attachment preview:', error);
      }
    };
    fetchPreview();
  }, [attId]);

  if (!preview || isImage !== true) {
    return null;
  }

  return (
    <img
      src={preview}
      alt="attachment"
      className="w-6 h-6 rounded object-cover cursor-pointer hover:opacity-80 transition-opacity"
    />
  );
}
