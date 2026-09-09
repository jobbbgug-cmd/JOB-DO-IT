'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Task } from '@/app/types/index';
import './timeline.css';

export default function TimelinePage() {
  const router = useRouter();
  const params = useParams();
  const companyCode = params.companyCode as string;
  const [isHydrated, setIsHydrated] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [view, setView] = useState('month');
  const [viewType, setViewType] = useState('overview');
  const [showAll, setShowAll] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) router.push('/login');
    else setIsHydrated(true);
  }, [router]);

  useEffect(() => {
    if (isHydrated) {
      fetchTasks();
      fetchEmployees();
    }
  }, [isHydrated, companyCode]);

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

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks/${companyCode}`);
      if (response.ok) {
        const data = await response.json();
        const sortedTasks = (data || []).sort((a: Task, b: Task) => {
          const dateA = new Date(a.dueDate || '').getTime();
          const dateB = new Date(b.dueDate || '').getTime();
          return dateA - dateB;
        });
        setTasks(sortedTasks.filter((t: Task) => t.dueDate));
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'todo': return '#5B7FB0';
      case 'in-progress': return '#C98A0E';
      case 'testing-failed': return '#D2504F';
      case 'wait-testing': return '#8A5CF6';
      case 'done': return '#0E9384';
      default: return '#999';
    }
  };

  const getTimelineWidth = () => {
    if (view === 'day') return 80;
    if (view === 'week') return 120;
    return 135; // month
  };

  const getMonthDisplay = (date: Date): string => {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'สค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

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

  const getEmployeeNames = (assigneeIds?: string[]): string => {
    if (!assigneeIds || assigneeIds.length === 0) return 'ไม่มีผู้รับผิดชอบ';
    return assigneeIds
      .map(id => employees.find(e => e.id === id)?.name || id)
      .join(', ');
  };

  if (!isHydrated) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const visibleTasks = showAll ? tasks : tasks.slice(0, 20);
  const timelineWidth = getTimelineWidth();
  const labelWidth = 260;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">ไทม์ไลน์</h1>
        <p className="text-gray-400 text-sm mt-1">โปรเจคและงานของทั้งทีมเรียงตามวันเสร็จ — กดอื่นปรากฏผลงานงาง้านไว้ ทีโปรแกรมลดรูปควนเเพ</p>
      </div>

      {/* Timeline Tools */}
      <div className="flex gap-2 items-center overflow-x-auto pb-2 whitespace-nowrap scrollbar-hide">
        <button
          onClick={() => setViewType('overview')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            viewType === 'overview'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:text-white'
          }`}
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
        >
          รายพนักงาน
        </button>

        <div className="w-px h-5 bg-gray-600"></div>

        <button
          onClick={() => setView('day')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            view === 'day' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          รายวัน
        </button>
        <button
          onClick={() => setView('week')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            view === 'week' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          รายสัปดาห์
        </button>
        <button
          onClick={() => setView('month')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            view === 'month' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          รายเดือน
        </button>

        <div className="w-px h-5 bg-gray-600"></div>

        <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded font-medium transition-colors">
          ทำงานในโปรเจค
        </button>
        <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded font-medium transition-colors">
          งานรูทีน (+1)
        </button>
        <button
          onClick={() => setShowAll(!showAll)}
          className={`px-3 py-1.5 text-xs rounded font-medium transition-colors ${
            showAll ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          แสดงทั้งหมด
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className={`px-3 py-1.5 text-xs rounded font-medium transition-colors ${
            isFullscreen ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          เต็มจอ
        </button>
      </div>

      {/* Gantt Chart */}
      <div className="tl-body" style={{ width: `calc(${labelWidth}px + ${timelineWidth}px)`, '--tl-label': `${labelWidth}px`, '--tl-grid': `${timelineWidth}px` } as any}>
        {/* Header */}
        <div className="tl-head">
          <div className="tl-label tl-corner">โปรเจค / งาน (เรียงตามวันเสร็จ)</div>
          <div className="tl-track" style={{ width: timelineWidth }}>
            <div className="tl-months">
              {visibleTasks.length > 0 && (
                <span className="tl-month" style={{ left: 0, width: timelineWidth }}>
                  {getMonthDisplay(new Date(visibleTasks[0].dueDate || new Date()))}
                </span>
              )}
            </div>
            <div className="tl-ticks"></div>
          </div>
        </div>

        {/* Today Line */}
        <div className="tl-today" style={{ left: `calc(${labelWidth}px + 36px)` }}></div>

        {/* Rows */}
        {visibleTasks.map((task) => {
          const assigneeNames = task.assignees?.map(id => employees.find(e => e.id === id)?.name || id) || [];
          return (
            <div key={task.id} className={`tl-row tl-flat ${task.status === 'done' ? 'tl-done' : ''}`}>
              <div className="tl-label">
                <button className="tl-task-name" title="ดูรายละเอียดงาน">
                  <span className="dot" style={{ background: getStatusColor(task.status || 'todo') }}></span>
                  <span className="who">
                    {task.title}
                    <span className="role">
                      {task.projectName && `${task.projectName} · `}
                      {getEmployeeNames(task.assignees)}
                    </span>
                  </span>
                  <span className="tl-pct muted">{task.progress || 0}%</span>
                </button>
              </div>

              <div className="tl-track" style={{ width: timelineWidth }}>
                <button type="button" className="tl-bar" style={{ left: 0, width: timelineWidth, '--bar': getStatusColor(task.status || 'todo') } as any}>
                  <span className="fill" style={{ width: `${(task.progress || 0)}%` }}></span>
                  <span className="tl-holders">
                    {assigneeNames.slice(0, 2).map((name, i) => (
                      <span key={i} className="av" style={{ background: getAvatarColor(name) }}>
                        {getInitials(name)}
                      </span>
                    ))}
                  </span>
                  <span className="txt">{task.title}</span>
                  <span className="pct">{task.progress || 0}%</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
