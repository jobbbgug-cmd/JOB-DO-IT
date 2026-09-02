'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Team {
  id: string;
  name: string;
  description?: string | null;
  memberCount: number;
  isDefault: boolean;
}

interface Employee {
  id: string;
  name: string;
  userId?: string;
  color?: string;
  role?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'todo' | 'in-progress' | 'in-review' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignee?: string | null;
  dueDate?: string | null;
}

interface TeamMember {
  id: string;
  name: string;
  role?: string;
  x?: number;
  y?: number;
}

const STATUS_COLORS: { [key: string]: string } = {
  'todo': '#5B7FB0',
  'in-progress': '#C98A0E',
  'in-review': '#8A5CF6',
  'done': '#0E9384',
};

const PRIORITY_COLORS: { [key: string]: string } = {
  'urgent': '#E4572E',
  'high': '#C98A0E',
  'medium': '#5B7FB0',
  'low': '#0E9384',
};

const getInitials = (name?: string) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

export default function TeamBoardPage() {
  const router = useRouter();
  const params = useParams();
  const companyCode = params.companyCode as string;
  const teamId = params.teamId as string;
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!storedToken) {
      router.push('/login');
    } else {
      fetchTeamData();
    }
  }, [router, companyCode, teamId]);

  const fetchTeamData = async () => {
    try {
      // Fetch team info from the teams API
      const teamsResponse = await fetch(`/api/company/${companyCode}/teams`);
      if (teamsResponse.ok) {
        const teams = await teamsResponse.json();
        console.log('Teams fetched:', teams);
        console.log('Looking for teamId:', teamId);
        const currentTeam = teams.find((t: Team) => t.id === teamId);
        console.log('Found team:', currentTeam);
        if (currentTeam) {
          setTeam(currentTeam);
        } else {
          console.warn('Team not found');
        }
      }

      // Fetch employees for linked members
      const empResponse = await fetch(`/api/employees/${companyCode}`);
      if (empResponse.ok) {
        const data = await empResponse.json();
        const transformed = data.map((emp: any) => ({
          ...emp,
          id: emp.id || emp._id,
        }));
        setEmployees(transformed);
      }

      // Fetch tasks
      const tasksResponse = await fetch(`/api/tasks/${companyCode}`);
      if (tasksResponse.ok) {
        const data = await tasksResponse.json();
        setTasks(data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch team data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!team) {
    return <div className="flex items-center justify-center h-screen">Team not found</div>;
  }

  return (
    <div className="fixed inset-0 bg-gray-950">
      {/* Team Bar - Floating Top Left */}
      <div className="fixed top-20 left-4 flex items-center gap-3 z-50">
        <button
          onClick={() => router.push(`/c/${companyCode}/boardteam`)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg font-medium"
        >
          <span aria-hidden="true">←</span> ทุกทีม
        </button>
        <span className="text-base font-semibold text-white">
          {team?.name || 'Team'}
        </span>
      </div>

      {/* Add Employee Button - Show only if no linked members */}
      {team?.isDefault && employees.filter(emp => emp.userId).length === 0 && (
        <button
          onClick={() =>
            router.push(`/c/${companyCode}/company/employees?team=${teamId}`)
          }
          className="fixed left-4 top-44 px-6 py-8 text-gray-400 hover:text-white transition-colors rounded-lg border-2 border-dashed border-gray-600 hover:border-gray-500 flex flex-col items-center gap-3 bg-transparent hover:bg-gray-900/20 z-40"
          style={{
            width: '336px',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8"
          >
            <path d="M12 5v14M5 12h14"></path>
          </svg>
          <span className="text-sm font-medium">เพิ่มพนักงาน</span>
        </button>
      )}

      {/* Canvas Area */}
      <div className="absolute inset-0 overflow-auto p-8 pt-40">
        {/* Members Flex Layout */}
        {team?.isDefault ? (
          (() => {
            const linkedMembers = employees.filter(emp => emp.userId);
            return linkedMembers.length > 0 ? (
              <div className="flex gap-6 flex-wrap">
                {linkedMembers.map(member => {
                  const memberTasks = tasks.filter(task => task.assignee === member.id || task.assignee === member.name);
                  const routineTasks = memberTasks.filter(t => t.priority === 'urgent' || t.priority === 'high');
                  const urgentTasks = memberTasks.filter(t => t.priority !== 'urgent' && t.priority !== 'high');

                  return (
                    <section
                      key={member.id}
                      className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden flex-shrink-0"
                      style={{ width: '437px', minHeight: '328px' }}
                    >
                      {/* Member Header */}
                      <div className="flex items-center gap-3 p-4 pb-3 border-b border-gray-700 bg-gray-800/80">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                          style={{ backgroundColor: member.color || '#0E9384' }}
                        >
                          {member.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm truncate">{member.name}</div>
                          {member.role && <div className="text-xs text-gray-400 truncate">{member.role}</div>}
                        </div>
                        <div className="text-xs text-gray-400 flex-shrink-0">
                          {memberTasks.length} งาน
                        </div>
                      </div>

                      {/* Lanes */}
                      <div className="flex flex-1 overflow-auto">
                        {/* Routine Lane */}
                        <div className="flex-1 border-r border-gray-700 p-3 overflow-y-auto">
                          <div className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0E9384' }}></span>
                            งานรูทีน ({routineTasks.length})
                          </div>
                          <div className="space-y-2">
                            {routineTasks.length > 0 ? (
                              routineTasks.map(task => (
                                <div
                                  key={task.id}
                                  className="bg-gray-700/40 border border-gray-600 rounded p-2 text-xs hover:bg-gray-700/60 transition-colors group"
                                  style={{
                                    borderTopColor: STATUS_COLORS[task.status] || '#5B7FB0',
                                    borderTopWidth: '2px',
                                  }}
                                >
                                  <div className="font-medium text-white text-xs mb-1 line-clamp-2">{task.title}</div>
                                  <div className="flex items-center justify-between text-gray-400 text-[10px] gap-1">
                                    <span>{task.status}</span>
                                    <span style={{ color: PRIORITY_COLORS[task.priority] || '#999' }}>● {task.priority}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-600 text-center py-4">ไม่มีงาน</p>
                            )}
                          </div>
                        </div>

                        {/* Urgent Lane */}
                        <div className="flex-1 p-3 overflow-y-auto">
                          <div className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#E4572E' }}></span>
                            งานจิกปะทะ ({urgentTasks.length})
                          </div>
                          <div className="space-y-2">
                            {urgentTasks.length > 0 ? (
                              urgentTasks.map(task => (
                                <div
                                  key={task.id}
                                  className="bg-gray-700/40 border border-gray-600 rounded p-2 text-xs hover:bg-gray-700/60 transition-colors group"
                                  style={{
                                    borderTopColor: STATUS_COLORS[task.status] || '#5B7FB0',
                                    borderTopWidth: '2px',
                                  }}
                                >
                                  <div className="font-medium text-white text-xs mb-1 line-clamp-2">{task.title}</div>
                                  <div className="flex items-center justify-between text-gray-400 text-[10px] gap-1">
                                    <span>{task.status}</span>
                                    <span style={{ color: PRIORITY_COLORS[task.priority] || '#999' }}>● {task.priority}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-600 text-center py-4">ไม่มีงาน</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">ยังไม่มีสมาชิกในทีมนี้</p>
              </div>
            );
          })()
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">ทีมนี้ยังไม่เสร็จสิ้น</p>
          </div>
        )}
      </div>
    </div>
  );
}
