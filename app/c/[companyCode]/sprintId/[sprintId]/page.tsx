'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Dock from '@/app/components/Dock';

interface Employee {
  id: string;
  name: string;
  role: string;
  color: string;
  userId?: string;
}

interface Task {
  id: string;
  title: string;
  lane: 'routine' | 'urgent';
  assignee: string;
  progress: number;
}

interface EmployeeCard {
  employee: Employee;
  routineTasks: Task[];
  urgentTasks: Task[];
}

const COLORS = ['#0E9384', '#E4572E', '#5B7FB0', '#B4479A', '#C98A0E', '#3F6E4B', '#8A5CF6', '#D2504F'];

export default function SprintPage() {
  const router = useRouter();
  const params = useParams();
  const companyCode = params.companyCode as string;
  const sprintId = params.sprintId as string;

  const [cards, setCards] = useState<EmployeeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchDataRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employees
        const empRes = await fetch(`/api/employees/${companyCode}`);
        const employees = await empRes.json();
        console.log('Fetched employees:', employees);
        if (employees.length > 0) {
          console.log('First employee:', employees[0]);
        }

        // Fetch tasks for sprint
        const tasksRes = await fetch(`/api/tasks?sprintId=${sprintId}&companyCode=${companyCode}`);
        const tasks = await tasksRes.json();
        console.log('Fetched tasks:', tasks);

        // Group tasks by employee and lane
        const cardData: EmployeeCard[] = employees.map((emp: any) => {
          const empId = emp.id || emp._id;
          const empTasks = tasks.filter((t: any) => t.assignee === empId);
          console.log(`Tasks for employee ${empId} (${emp.name}):`, empTasks);
          return {
            employee: {
              id: empId,
              name: emp.name,
              role: emp.role,
              color: emp.color || COLORS[0],
            },
            routineTasks: empTasks.filter((t: any) => t.lane === 'routine'),
            urgentTasks: empTasks.filter((t: any) => t.lane === 'urgent'),
          };
        });

        console.log('Final card data:', cardData);
        setCards(cardData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataRef.current = fetchData;

    if (companyCode && sprintId) {
      fetchData();
    }
  }, [companyCode, sprintId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Dock
        onTaskCreated={() => {
          console.log('onTaskCreated called, refetching...');
          fetchDataRef.current?.();
        }}
      />
      <div className="fixed inset-0 w-screen h-screen bg-slate-950">
        <div className="absolute top-20 left-6 z-50 flex items-center gap-4">
        <button
          onClick={() => router.push(`/c/${companyCode}/boardteam`)}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-cyan-400 transition-colors"
          title="กลับ"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"></path>
          </svg>
        </button>
        <span className="font-semibold text-white text-lg truncate">
          {companyCode}
        </span>
      </div>
      <div className="flex items-start justify-start p-6 overflow-auto h-full pt-32">
        <div className="flex flex-wrap gap-6" style={{ maxWidth: '1400px' }}>
        {cards.map((card) => (
          <div
            key={card.employee.id}
            className="bg-gray-900 border-2 border-cyan-600/40 hover:border-cyan-500/60 rounded-xl p-5 transition-all hover:shadow-lg hover:shadow-cyan-900/20 flex flex-col"
            style={{
              width: '450px',
              height: '500px',
              cursor: 'grab',
              userSelect: 'none',
            }}
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-700 group cursor-grab active:cursor-grabbing flex-shrink-0">
              <div className="text-gray-600 group-hover:text-gray-400 transition-colors pt-1">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <circle cx="9" cy="6" r="1.4"></circle>
                  <circle cx="15" cy="6" r="1.4"></circle>
                  <circle cx="9" cy="12" r="1.4"></circle>
                  <circle cx="15" cy="12" r="1.4"></circle>
                  <circle cx="9" cy="18" r="1.4"></circle>
                  <circle cx="15" cy="18" r="1.4"></circle>
                </svg>
              </div>

              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-full text-white font-bold flex items-center justify-center text-base shadow-lg"
                    style={{ backgroundColor: card.employee.color }}
                  >
                    {card.employee.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 shadow-lg"></span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-lg">{card.employee.name}</h3>
                  <p className="text-sm text-gray-400">{card.employee.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right mr-2 text-base font-bold text-gray-400 border border-gray-600 rounded-lg px-3 py-1">
                  {card.routineTasks.length + card.urgentTasks.length} งาน
                </div>
                <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-cyan-400 transition-colors flex-shrink-0" title="สร้างงาน">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Task Lanes */}
            <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 min-h-0">
              {/* Routine Lane */}
              <div className="space-y-2 overflow-y-auto border-2 rounded-lg px-2 py-2 transition-colors border-transparent">
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    <span className="text-lg font-semibold text-gray-200">งานรูทีน</span>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                    {card.routineTasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {card.routineTasks.length === 0 ? (
                    <div className="text-gray-600 text-center py-6 italic border-2 border-dashed border-gray-600 rounded-lg">
                      ว่าง
                    </div>
                  ) : (
                    card.routineTasks.map((task: any) => (
                      <div key={task.id} className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 rounded-lg p-3 text-xs text-gray-200 hover:from-gray-800/80 hover:to-gray-900/60 transition-all border border-gray-700/50 shadow-sm hover:shadow-md">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="inline-block px-2 py-1 rounded-md text-xs font-semibold bg-cyan-500/25 text-cyan-300 flex-shrink-0">
                            {task.priority}
                          </span>
                        </div>
                        <div className="font-semibold text-gray-100 mb-2 line-clamp-2 text-sm leading-tight">{task.title}</div>
                        {task.dueDate && (
                          <div className="text-gray-400 text-xs mb-2">📅 {task.dueDate}</div>
                        )}
                        <div className="space-y-1">
                          <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden border border-gray-600/30">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-1.5 transition-all rounded-full"
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500">{task.progress}% เสร็จสิ้น</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Urgent Lane */}
              <div className="space-y-2 overflow-y-auto border-2 rounded-lg px-2 py-2 transition-colors border-transparent">
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="text-lg font-semibold text-gray-200">งานจิกปะทะ</span>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                    {card.urgentTasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {card.urgentTasks.length === 0 ? (
                    <div className="text-gray-600 text-center py-6 italic border-2 border-dashed border-gray-600 rounded-lg">
                      ลากงานมาวาง
                    </div>
                  ) : (
                    card.urgentTasks.map((task: any) => (
                      <div key={task.id} className="bg-gradient-to-br from-red-900/40 to-red-950/30 rounded-lg p-3 text-xs text-gray-200 hover:from-red-900/60 hover:to-red-950/50 transition-all border border-red-700/40 shadow-sm hover:shadow-md">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="inline-block px-2 py-1 rounded-md text-xs font-semibold bg-red-500/30 text-red-300 flex-shrink-0">
                            {task.priority}
                          </span>
                        </div>
                        <div className="font-semibold text-gray-100 mb-2 line-clamp-2 text-sm leading-tight">{task.title}</div>
                        {task.dueDate && (
                          <div className="text-gray-400 text-xs mb-2">📅 {task.dueDate}</div>
                        )}
                        <div className="space-y-1">
                          <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden border border-gray-600/30">
                            <div
                              className="bg-gradient-to-r from-red-500 to-red-400 h-1.5 transition-all rounded-full"
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500">{task.progress}% เสร็จสิ้น</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Resize Handle */}
            <button
              className="absolute bottom-0 right-0 w-6 h-6 opacity-40 hover:opacity-100 transition-opacity flex items-center justify-center"
              style={{ pointerEvents: 'auto' }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-gray-400 hover:text-cyan-400"
              >
                <path d="M21 21V9M21 21H9"></path>
              </svg>
            </button>
          </div>
        ))}
        </div>
      </div>
      </div>
    </>
  );
}
