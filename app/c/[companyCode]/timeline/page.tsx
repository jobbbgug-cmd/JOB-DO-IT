'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Task } from '@/app/types/index';
import TaskDetailModal from '@/app/components/TaskDetailModal';
import './timeline.css';

export default function TimelinePage() {
  const router = useRouter();
  const params = useParams();
  const companyCode = params.companyCode as string;
  const [isHydrated, setIsHydrated] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [view, setView] = useState('day');
  const [viewType, setViewType] = useState('overview');
  const [showAll, setShowAll] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expandedEmployees, setExpandedEmployees] = useState<Record<string, boolean>>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
    console.log('🚀 fetchTasks called, companyCode:', companyCode);
    try {
      const url = `/api/tasks/${companyCode}`;
      console.log('📍 Fetching from:', url);
      const response = await fetch(url);
      console.log('📡 Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Tasks fetched:', data);
        console.log('📊 Total tasks:', data?.length);
        if (data && data.length > 0) {
          console.log('🔍 First task:', data[0]);
          console.log('📅 First task dueDate:', data[0].dueDate);
        }
        const getProgress = (status: string | undefined): number => {
          switch (status) {
            case 'todo': return 0;
            case 'in-progress': return 25;
            case 'testing-failed': return 50;
            case 'wait-testing': return 75;
            case 'done': return 100;
            default: return 0;
          }
        };

        const tasksWithProgress = (data || []).map((task: Task) => ({
          ...task,
          progress: getProgress(task.status)
        }));

        const sortedTasks = tasksWithProgress.sort((a: Task, b: Task) => {
          const dateA = new Date(a.dueDate || '').getTime();
          const dateB = new Date(b.dueDate || '').getTime();
          return dateA - dateB;
        });
        const filtered = sortedTasks.filter((t: Task) => t.dueDate);
        console.log('📋 Filtered tasks with dueDate:', filtered);
        setTasks(tasksWithProgress);
      } else {
        console.error('❌ Response not ok:', response.status);
      }
    } catch (error) {
      console.error('❌ Failed to fetch tasks:', error);
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

  const getProgressFromStatus = (status: string | undefined): number => {
    switch (status) {
      case 'todo': return 0;
      case 'in-progress': return 25;
      case 'testing-failed': return 50;
      case 'wait-testing': return 75;
      case 'done': return 100;
      default: return 0;
    }
  };

  const getDateRange = () => {
    if (tasks.length === 0) {
      const today = new Date();
      return { start: today, end: today, days: 1 };
    }

    const dates = tasks
      .filter(t => t.dueDate)
      .map(t => new Date(t.dueDate || new Date()));

    if (dates.length === 0) {
      const today = new Date();
      return { start: today, end: today, days: 1 };
    }

    const start = new Date(Math.min(...dates.map(d => d.getTime())));
    const end = new Date(Math.max(...dates.map(d => d.getTime())));

    console.log('📅 getDateRange:', { start: start.toLocaleDateString('th-TH'), end: end.toLocaleDateString('th-TH'), taskCount: tasks.length });

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return { start, end, days: diffDays };
  };

  const getMonthsInRange = () => {
    const { start, end } = getDateRange();
    const months: Array<{ date: Date; year: number; month: number }> = [];
    const current = new Date(start.getFullYear(), start.getMonth(), 1);

    while (current <= end) {
      months.push({
        date: new Date(current),
        year: current.getFullYear(),
        month: current.getMonth()
      });
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  };

  const getWeeksInRange = () => {
    const { start, end } = getDateRange();
    const weeks: Array<{ date: Date; monthYear: string }> = [];
    const current = new Date(start);

    // Move to first Monday
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    current.setDate(diff);

    while (current <= end) {
      const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      weeks.push({
        date: new Date(current),
        monthYear: `${current.getDate()} ${monthNames[current.getMonth()]}`
      });
      current.setDate(current.getDate() + 7);
    }

    return weeks;
  };

  const getTimelineWidth = () => {
    if (view === 'day') {
      const { days } = getDateRange();
      return Math.max(30 * days, 900);
    }
    if (view === 'week') {
      const { days } = getDateRange();
      return Math.max(120 * (days / 7), 900);
    }
    // month view
    const months = getMonthsInRange();
    return Math.max(months.length * 138.6, 900);
  };

  const getMonthDisplay = (date: Date): string => {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'สค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getTaskBarPosition = (task: Task) => {
    if (!task.dueDate) return { left: 0, width: 100 };

    const { start } = getDateRange();
    const taskDate = new Date(task.dueDate);

    if (view === 'day') {
      const daysFromStart = Math.ceil((taskDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return {
        left: daysFromStart * 30,
        width: Math.max(30, 30)
      };
    } else if (view === 'week') {
      // Calculate week position
      const weeks = getWeeksInRange();
      let weekIndex = 0;

      weeks.forEach((w, idx) => {
        const weekStart = new Date(w.date);
        const weekEnd = new Date(w.date);
        weekEnd.setDate(weekEnd.getDate() + 7);

        if (taskDate >= weekStart && taskDate < weekEnd) {
          weekIndex = idx;
        }
      });

      return {
        left: weekIndex * 91,
        width: 91
      };
    } else {
      // month view
      const months = getMonthsInRange();
      let monthIndex = 0;

      months.forEach((m, idx) => {
        const monthStart = new Date(m.date.getFullYear(), m.date.getMonth(), 1);
        const monthEnd = new Date(m.date.getFullYear(), m.date.getMonth() + 1, 0);

        if (taskDate >= monthStart && taskDate <= monthEnd) {
          monthIndex = idx;
        }
      });

      return {
        left: monthIndex * 138.6,
        width: 138.6
      };
    }
  };

  const getEmployeeTasks = () => {
    const grouped: Record<string, Task[]> = {};

    employees.forEach(emp => {
      grouped[emp.id] = visibleTasks.filter(task =>
        task.assignees && task.assignees.includes(emp.id)
      );
    });

    return grouped;
  };

  const toggleEmployee = (empId: string) => {
    setExpandedEmployees(prev => ({
      ...prev,
      [empId]: !prev[empId]
    }));
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
          <div className="tl-label tl-corner">
            {viewType === 'employee' ? 'ผู้รับผิดชอบ / งาน' : 'โปรเจค / งาน (เรียงตามวันเสร็จ)'}
          </div>
          <div className="tl-track" style={{
            width: timelineWidth,
            '--divider-lines': view === 'month'
              ? 'repeating-linear-gradient(90deg, transparent 0, transparent 138.5px, rgb(75, 85, 99) 138.5px, rgb(75, 85, 99) 138.6px)'
              : view === 'week'
              ? 'repeating-linear-gradient(90deg, transparent 0, transparent 90.5px, rgb(75, 85, 99) 90.5px, rgb(75, 85, 99) 91px)'
              : 'none'
          } as any}>
            {view === 'month' ? (
              <>
                <div className="tl-majors">
                  {(() => {
                    const months = getMonthsInRange();
                    const yearGroups: Record<number, { start: number; count: number }> = {};

                    months.forEach((m, idx) => {
                      if (!yearGroups[m.year]) {
                        yearGroups[m.year] = { start: idx, count: 0 };
                      }
                      yearGroups[m.year].count++;
                    });

                    return Object.entries(yearGroups).map(([year, info]) => (
                      <span key={year} className="tl-major" style={{ left: info.start * 138.6, width: info.count * 138.6 }}>
                        <span>{year}</span>
                      </span>
                    ));
                  })()}
                </div>
                <div className="tl-ticks">
                  {getMonthsInRange().map((m, idx) => {
                    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
                    const isYearStart = idx === 0 || m.month === 0;
                    return (
                      <span key={idx} className={`tl-tick ${isYearStart ? 'strong' : ''}`} style={{ left: idx * 138.6 }}>
                        {monthNames[m.month]}
                      </span>
                    );
                  })}
                </div>
              </>
            ) : view === 'week' ? (
              <>
                <div className="tl-majors">
                  {(() => {
                    const weeks = getWeeksInRange();
                    const monthGroups: Record<string, { start: number; count: number }> = {};

                    weeks.forEach((w, idx) => {
                      const monthKey = `${w.date.getFullYear()}-${w.date.getMonth()}`;
                      if (!monthGroups[monthKey]) {
                        monthGroups[monthKey] = { start: idx, count: 0 };
                      }
                      monthGroups[monthKey].count++;
                    });

                    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
                    return Object.entries(monthGroups).map(([key, info]) => {
                      const [year, month] = key.split('-');
                      return (
                        <span key={key} className="tl-major" style={{ left: info.start * 91, width: info.count * 91 }}>
                          <span>{monthNames[parseInt(month)]} {year}</span>
                        </span>
                      );
                    });
                  })()}
                </div>
                <div className="tl-ticks">
                  {getWeeksInRange().map((w, idx) => {
                    const isMonthStart = idx === 0 || w.date.getDate() <= 7;
                    return (
                      <span key={idx} className={`tl-tick ${isMonthStart ? 'strong' : ''}`} style={{ left: idx * 91 }}>
                        {w.monthYear}
                      </span>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div className="tl-majors">
                  {(() => {
                    const months = getMonthsInRange();
                    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

                    if (view === 'day') {
                      // For day view, calculate positions
                      const { start } = getDateRange();
                      let leftPos = 0;

                      return months.map((m, idx) => {
                        const monthStart = new Date(m.date.getFullYear(), m.date.getMonth(), 1);
                        const monthEnd = new Date(m.date.getFullYear(), m.date.getMonth() + 1, 0);

                        // Count days in this month that are in our range
                        const rangeStart = new Date(start);
                        const dayStart = Math.max(monthStart.getDate(), rangeStart.getDate());
                        const dayEnd = monthEnd.getDate();
                        const daysInRange = dayEnd - dayStart + 1;

                        const monthWidth = daysInRange * 30;
                        const result = (
                          <span key={idx} className="tl-major" style={{ left: leftPos, width: monthWidth }}>
                            <span>{monthNames[m.month]} {m.year}</span>
                          </span>
                        );

                        leftPos += monthWidth;
                        return result;
                      });
                    } else {
                      // For week view
                      const weeks = getWeeksInRange();
                      const monthGroups: Record<string, { start: number; count: number }> = {};

                      weeks.forEach((w, idx) => {
                        const monthKey = `${w.date.getFullYear()}-${w.date.getMonth()}`;
                        if (!monthGroups[monthKey]) {
                          monthGroups[monthKey] = { start: idx, count: 0 };
                        }
                        monthGroups[monthKey].count++;
                      });

                      return Object.entries(monthGroups).map(([key, info]) => {
                        const [year, month] = key.split('-');
                        return (
                          <span key={key} className="tl-major" style={{ left: info.start * 91, width: info.count * 91 }}>
                            <span>{monthNames[parseInt(month)]} {year}</span>
                          </span>
                        );
                      });
                    }
                  })()}
                </div>
                <div className="tl-ticks">
                  {view === 'day' && (() => {
                    const { start, days } = getDateRange();
                    const ticks = [];
                    for (let i = 0; i < days; i++) {
                      const date = new Date(start);
                      date.setDate(date.getDate() + i);
                      ticks.push(
                        <span key={i} className="tl-tick" style={{ left: i * 30 }}>
                          {date.getDate()}
                        </span>
                      );
                    }
                    return ticks;
                  })()}
                  {view === 'week' && getWeeksInRange().map((w, idx) => {
                    const isMonthStart = idx === 0 || w.date.getDate() <= 7;
                    return (
                      <span key={idx} className={`tl-tick ${isMonthStart ? 'strong' : ''}`} style={{ left: idx * 91 }}>
                        {w.monthYear}
                      </span>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>


        {/* Rows */}
        {viewType === 'overview' ? (
          visibleTasks.map((task) => {
            const assigneeNames = task.assignees?.map(id => employees.find(e => e.id === id)?.name || id) || [];
            const barPos = getTaskBarPosition(task);

            return (
              <div key={task.id} className={`tl-row tl-flat ${task.status === 'done' ? 'tl-done' : ''}`}>
                <div className="tl-label">
                  <button
                    className="tl-task-name"
                    title="ดูรายละเอียดงาน"
                    onClick={() => {
                      console.log('👁️ Overview task name clicked:', task);
                      setSelectedTask(task);
                    }}
                  >
                    <span className="dot" style={{ background: getStatusColor(task.status || 'todo') }}></span>
                    <span className="who">
                      {task.title}
                      <span className="role">
                        {getEmployeeNames(task.assignees)}
                      </span>
                    </span>
                    <span className="tl-pct muted">{task.progress || 0}%</span>
                  </button>
                </div>

                <div className="tl-track" style={{ width: timelineWidth }}>
                  <div
                    className="tl-bar"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('🖱️ Task bar clicked:', task);
                      setSelectedTask(task);
                    }}
                    style={{
                      left: barPos.left,
                      width: barPos.width,
                      '--bar': getStatusColor(task.status || 'todo')
                    } as any}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="fill" style={{ width: `${(task.progress || 0)}%` }}></span>
                    <span className="tl-holders" title={assigneeNames.join(', ')}>
                      {assigneeNames.slice(0, 2).map((name, i) => (
                        <span key={i} className="av" style={{ background: getAvatarColor(name) }}>
                          {getInitials(name)}
                        </span>
                      ))}
                    </span>
                    <span className="txt">{task.title}</span>
                    <span className="pct">{task.progress || 0}%</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // Employee view
          employees.map((emp) => {
            const empTasks = getEmployeeTasks()[emp.id] || [];
            const isExpanded = expandedEmployees[emp.id] === true;

            return (
              <div key={emp.id} className="tl-group">
                {/* Employee Row */}
                <div className="tl-row tl-emp">
                  <div className="tl-label">
                    <button
                      className="tl-toggle"
                      onClick={() => toggleEmployee(emp.id)}
                      aria-expanded={isExpanded}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`caret ${isExpanded ? 'open' : ''}`}>
                        <path d="m9 5 7 7-7 7"></path>
                      </svg>
                      <span className="mini" style={{ background: getAvatarColor(emp.name) }}>
                        {getInitials(emp.name)}
                      </span>
                      <span className="who">
                        <b>{emp.name}</b>
                        <span className="role">{emp.role || emp.position || emp.department || 'Member'}</span>
                      </span>
                      <span className="n">{empTasks.length}</span>
                    </button>
                  </div>
                  <div className="tl-track" style={{ width: timelineWidth }}></div>
                </div>

                {/* Tasks Block */}
                {isExpanded && (
                  <div className="tl-block">
                    {empTasks.length > 0 && (
                      <>
                        <div className="tl-row tl-loose">
                          <div className="tl-label">
                            <span className="who muted">งานลอย (ไม่อยู่ในโปรเจค)</span>
                            <span className="n">{empTasks.length}</span>
                          </div>
                          <div className="tl-track" style={{ width: timelineWidth }}></div>
                        </div>

                        {empTasks.map((task) => {
                          const barPos = getTaskBarPosition(task);
                          return (
                            <div key={task.id} className={`tl-row tl-task ${task.status === 'done' ? 'tl-done' : ''}`}>
                              <div className="tl-label indent">
                                <button
                                  className="tl-task-name"
                                  title="ดูรายละเอียดงาน"
                                  onClick={() => {
                                    console.log('👁️ Employee task name clicked:', task);
                                    setSelectedTask(task);
                                  }}
                                >
                                  <span className="dot" style={{ background: getStatusColor(task.status || 'todo') }}></span>
                                  <span className="who">{task.title}</span>
                                  <span className="tl-pct muted">{task.progress || 0}%</span>
                                </button>
                              </div>

                              <div className="tl-track" style={{ width: timelineWidth }}>
                                <div
                                  className="tl-bar pct-in"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('🖱️ Employee task bar clicked:', task);
                                    setSelectedTask(task);
                                  }}
                                  style={{
                                    left: typeof barPos.width === 'string' ? 0 : barPos.left,
                                    width: typeof barPos.width === 'string' ? barPos.width : barPos.width,
                                    '--bar': getStatusColor(task.status || 'todo')
                                  } as any}
                                  role="button"
                                  tabIndex={0}
                                >
                                  <span className="fill" style={{ width: `${(task.progress || 0)}%` }}></span>
                                  <span className="txt" style={{ maxWidth: timelineWidth - 100 }}>{task.title}</span>
                                  <span className="pct in" style={{ right: 4 }}>
                                    {task.progress || 0}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          employees={employees}
          companyCode={companyCode}
          onTaskUpdated={() => {
            fetchTasks();
            fetchEmployees();
          }}
        />
      )}
    </div>
  );
}
