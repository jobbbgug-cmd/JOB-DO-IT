'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Task } from '@/app/types/index';
import Dock from '@/app/components/Dock';
import TaskDetailModal from '@/app/components/TaskDetailModal';
import EditTaskModal from '@/app/components/EditTaskModal';
import DeleteConfirmModal from '@/app/components/DeleteConfirmModal';

interface Employee {
  id: string;
  name: string;
  role: string;
  color: string;
  userId?: string;
}

interface EmployeeCard {
  employee: Employee;
  routineTasks: Task[];
  urgentTasks: Task[];
  doingCount?: number;
}

const COLORS = ['#0E9384', '#E4572E', '#5B7FB0', '#B4479A', '#C98A0E', '#3F6E4B', '#8A5CF6', '#D2504F'];

const getProgressFromStatus = (status: string): number => {
  switch (status) {
    case 'todo':
      return 0;
    case 'in-progress':
      return 25;
    case 'testing-failed':
      return 50;
    case 'wait-testing':
      return 75;
    case 'in-review': // backward compatibility
      return 75;
    case 'done':
      return 100;
    default:
      return 0;
  }
};

export default function SprintPage() {
  const router = useRouter();
  const params = useParams();
  const companyCode = (params?.companyCode || '') as string;
  const sprintId = (params?.sprintId || '') as string;

  const [cards, setCards] = useState<EmployeeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [userCache, setUserCache] = useState<Record<string, string>>({});
  const [attachmentPreviews, setAttachmentPreviews] = useState<Record<string, string>>({});
  const [nonImageFileIds, setNonImageFileIds] = useState<Record<string, string[]>>({});
  const fetchDataRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employees
        const empRes = await fetch(`/api/employees/${companyCode}`);
        const employeesList = await empRes.json();
        console.log('Fetched employees:', employeesList);
        setEmployees(employeesList);
        if (employeesList.length > 0) {
          console.log('First employee:', employeesList[0]);
        }

        // Fetch tasks for sprint
        const tasksRes = await fetch(`/api/tasks?sprintId=${sprintId}&companyCode=${companyCode}`);
        const tasks = await tasksRes.json();
        console.log('📋 Sprint tasks loaded:', tasks.length, 'tasks');
        console.log('First 3 tasks attachments:', tasks.slice(0, 3).map((t: any) => ({ title: t.title, attachments: t.attachments })));
        console.log('Fetched tasks:', tasks);

        // Group tasks by employee and lane
        const cardData: EmployeeCard[] = employeesList.map((emp: any) => {
          const empId = emp.id || emp._id;
          const empTasks = tasks.filter((t: any) => {
            const taskAssignees = Array.isArray(t.assignees) && t.assignees.length > 0
              ? t.assignees
              : t.assignee
                ? [t.assignee]
                : [];

            return taskAssignees.some((assigneeId: unknown) => String(assigneeId) === String(empId));
          });
          console.log(`Tasks for employee ${empId} (${emp.name}):`, empTasks);
          const routineTasks = empTasks.filter((t: any) => t.lane === 'routine');
          const urgentTasks = empTasks.filter((t: any) => t.lane === 'urgent');
          const doingCount = empTasks.filter((t: any) => t.status === 'in-progress').length;

          return {
            employee: {
              id: empId,
              name: emp.name,
              role: emp.role,
              color: emp.color || COLORS[0],
            },
            routineTasks,
            urgentTasks,
            doingCount,
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
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onEdit={(task) => {
          setEditingTask(task);
          setSelectedTask(null);
        }}
        onTaskUpdated={() => {
          console.log('Task updated, refetching...');
          fetchDataRef.current?.();
        }}
        employees={employees}
        companyCode={companyCode}
        isReadOnly={false}
      />
      <EditTaskModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        companyCode={companyCode}
        isReadOnly={false}
        onTaskUpdated={() => {
          console.log('Task updated, refetching...');
          fetchDataRef.current?.();
          setEditingTask(null);
        }}
      />
      <DeleteConfirmModal
        taskTitle={cards
          .flatMap((card) => [...card.routineTasks, ...card.urgentTasks])
          .find((t) => t.id === deleteTaskId)?.title || null}
        isOpen={deleteTaskId !== null}
        onCancel={() => setDeleteTaskId(null)}
        onConfirm={async () => {
          if (!deleteTaskId || !deletingEmployeeId) return;
          setDeletingTaskId(deleteTaskId);
          try {
            const res = await fetch(`/api/tasks/delete/${deleteTaskId}?employeeId=${deletingEmployeeId}`, {
              method: 'DELETE',
            });
            if (res.ok) {
              setDeleteTaskId(null);
              setDeletingEmployeeId(null);
              fetchDataRef.current?.();
            }
          } catch (error) {
            console.error('Failed to delete task:', error);
          } finally {
            setDeletingTaskId(null);
          }
        }}
        isDeleting={deletingTaskId === deleteTaskId}
      />
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
                {(card.doingCount ?? 0) > 0 && (
                  <div
                    title="งานที่กำลังทำอยู่"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'rgba(200, 138, 14, 0.15)',
                      border: '1px solid rgb(200, 138, 14)',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      color: 'rgb(200, 138, 14)',
                      fontWeight: '500',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {card.doingCount} กำลังทำ
                  </div>
                )}
                <button
                  onClick={() => router.push(`/c/${companyCode}/board/${card.employee.id}`)}
                  className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-cyan-400 transition-colors flex-shrink-0"
                  title="ดูบอร์ดงาน"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="6" height="16" rx="1"></rect>
                    <rect x="15" y="4" width="6" height="10" rx="1"></rect>
                  </svg>
                </button>
                <button
                  onClick={() => alert('ประวัติกิจกรรมยังไม่มีการพัฒนา')}
                  className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-cyan-400 transition-colors flex-shrink-0"
                  title="ประวัติกิจกรรม"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path>
                    <path d="M3 3v5h5"></path>
                    <path d="M12 7v5l3 2"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Task Lanes */}
            <div className="grid grid-cols-2 gap-4 flex-1 pr-2">
              {/* Routine Lane */}
              <div className="space-y-2 border-2 rounded-lg px-2 py-2 transition-colors border-transparent">
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
                    card.routineTasks.map((task: any) => {
                      console.log('📌 Rendering task:', task.title, '| attachments:', task.attachments, '| has attachments:', !!task.attachments?.length);
                      return (
                      <div key={task.id} className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/40 rounded-lg p-3 text-xs text-gray-200 hover:from-gray-800/80 hover:to-gray-900/60 transition-all border border-gray-700/50 shadow-sm hover:shadow-md cursor-pointer" style={{minHeight: 'auto !important', height: 'auto !important', overflow: 'visible !important'}}>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTask(task);
                            }}
                            className="p-1 hover:bg-gray-700/60 rounded transition-colors"
                            title="แก้ไข"
                          >
                            <svg className="w-4 h-4 text-gray-300 hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTaskId(task.id);
                              setDeletingEmployeeId(card.employee.id);
                            }}
                            className="p-1 hover:bg-gray-700/60 rounded transition-colors"
                            title="ลบ"
                          >
                            <svg className="w-4 h-4 text-gray-300 hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                            </svg>
                          </button>
                        </div>
                        <div onClick={() => setSelectedTask(task)}>
                          <div className="font-semibold text-gray-100 mb-2 text-sm w-full break-words overflow-visible">{task.title}</div>
                          {task.attachments && task.attachments.length > 0 && (
                            <div className="grid grid-cols-3 gap-1 mb-2">
                              {console.log(`Task ${task.id} has ${task.attachments.length} attachments:`, task.attachments)}
                              {task.attachments.map((attId: string, idx: number) => (
                                <AttachmentThumbnail
                                  key={`${task.id}-${attId}-${idx}`}
                                  attId={attId}
                                  onLoad={(isImage) => {
                                    if (!isImage) {
                                      setNonImageFileIds((prev) => {
                                        const current = prev[task.id] || [];
                                        // Use Set to deduplicate and prevent double-counting
                                        const updated = Array.from(new Set([...current, attId]));
                                        return {
                                          ...prev,
                                          [task.id]: updated
                                        };
                                      });
                                    }
                                  }}
                                />
                              ))}
                              {nonImageFileIds[task.id] && nonImageFileIds[task.id].length > 0 && (
                                <div className="relative col-start-1 w-6 h-6">
                                  <span className="text-lg">📎</span>
                                  <span className="absolute -top-1 -right-1 bg-gray-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
                                    {nonImageFileIds[task.id].length}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 bg-gray-700/50 rounded-full h-1.5 overflow-hidden border border-gray-600/30">
                              <div
                                className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-1.5 transition-all rounded-full"
                                style={{ width: `${getProgressFromStatus(task.status)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 whitespace-nowrap">{getProgressFromStatus(task.status)}%</div>
                          </div>
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
                    })
                  )}
                </div>
              </div>

              {/* Urgent Lane */}
              <div className="space-y-2 border-2 rounded-lg px-2 py-2 transition-colors border-transparent bg-transparent">
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
                      <div key={task.id} className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/40 rounded-lg p-3 text-xs text-gray-200 hover:from-gray-800/80 hover:to-gray-900/60 transition-all border border-gray-700/50 shadow-sm hover:shadow-md cursor-pointer" style={{minHeight: 'auto !important', height: 'auto !important', overflow: 'visible !important'}}>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTask(task);
                            }}
                            className="p-1 hover:bg-gray-700/60 rounded transition-colors"
                            title="แก้ไข"
                          >
                            <svg className="w-4 h-4 text-gray-300 hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTaskId(task.id);
                              setDeletingEmployeeId(card.employee.id);
                            }}
                            className="p-1 hover:bg-gray-700/60 rounded transition-colors"
                            title="ลบ"
                          >
                            <svg className="w-4 h-4 text-gray-300 hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                            </svg>
                          </button>
                        </div>
                        <div onClick={() => setSelectedTask(task)}>
                          <div className="font-semibold text-gray-100 mb-2 text-sm w-full break-words overflow-visible">{task.title}</div>
                          {task.attachments && task.attachments.length > 0 && (
                            <div className="flex gap-1 mb-2 items-center">
                              {task.attachments.map((attId: string, idx: number) => (
                                <AttachmentThumbnail
                                  key={`${task.id}-${attId}-${idx}`}
                                  attId={attId}
                                  onLoad={(isImage) => {
                                    if (!isImage) {
                                      setNonImageFileIds((prev) => {
                                        const current = prev[task.id] || [];
                                        // Use Set to deduplicate and prevent double-counting
                                        const updated = Array.from(new Set([...current, attId]));
                                        return {
                                          ...prev,
                                          [task.id]: updated
                                        };
                                      });
                                    }
                                  }}
                                />
                              ))}
                              {nonImageFileIds[task.id] && nonImageFileIds[task.id].length > 0 && (
                                <div className="relative w-6 h-6">
                                  <span className="text-lg">📎</span>
                                  <span className="absolute -top-1 -right-1 bg-gray-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
                                    {nonImageFileIds[task.id].length}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 bg-gray-700/50 rounded-full h-1.5 overflow-hidden border border-gray-600/30">
                              <div
                                className="bg-gradient-to-r from-orange-500 to-orange-400 h-1.5 transition-all rounded-full"
                                style={{ width: `${getProgressFromStatus(task.status)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 whitespace-nowrap">{getProgressFromStatus(task.status)}%</div>
                          </div>
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

function AttachmentThumbnail({ attId, onLoad }: { attId: string; onLoad?: (isImage: boolean) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isImage, setIsImage] = useState<boolean | null>(null);
  const callbackRef = useRef(false);
  const onLoadRef = useRef(onLoad);

  // Update ref whenever onLoad changes
  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        console.log('Fetching attachment:', attId);

        // Handle embedded filename format: filename||data:...
        if (attId.includes('||')) {
          const [fileName, dataUrl] = attId.split('||');
          if (dataUrl && dataUrl.startsWith('data:')) {
            setPreview(dataUrl);
            const imageCheck = dataUrl.startsWith('data:image/');
            console.log('🖼️ Attachment loaded (embedded):', {
              fileName,
              dataUrlStart: dataUrl.substring(0, 30),
              isImage: imageCheck
            });
            setIsImage(imageCheck);
            if (!callbackRef.current) {
              callbackRef.current = true;
              console.log('Calling onLoad with:', imageCheck);
              onLoadRef.current?.(imageCheck);
            }
            return;
          }
        }

        // Handle base64 data URL format
        if (attId.startsWith('data:')) {
          setPreview(attId);
          const imageCheck = attId.startsWith('data:image/');
          console.log('🖼️ Attachment loaded (base64):', {
            dataUrlStart: attId.substring(0, 30),
            isImage: imageCheck
          });
          setIsImage(imageCheck);
          if (!callbackRef.current) {
            callbackRef.current = true;
            console.log('Calling onLoad with:', imageCheck);
            onLoadRef.current?.(imageCheck);
          }
          return;
        }

        // Handle API ID format (MongoDB attachment ID)
        const res = await fetch('/api/attachments/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: attId })
        });
        console.log('Fetch response status:', res.status);

        if (res.ok) {
          const data = await res.json();
          console.log('Attachment data:', data);
          if (data.dataUrl) {
            setPreview(data.dataUrl);
            const imageCheck = data.fileType?.startsWith('image/') || data.dataUrl.startsWith('data:image/');
            console.log('🖼️ Attachment loaded:', {
              attId,
              fileType: data.fileType,
              fileName: data.fileName,
              dataUrlStart: data.dataUrl.substring(0, 30),
              isImage: imageCheck
            });
            setIsImage(imageCheck);
            if (!callbackRef.current) {
              callbackRef.current = true;
              console.log('Calling onLoad with:', imageCheck);
              onLoadRef.current?.(imageCheck);
            }
          }
        } else {
          let errorData: any = {};
          try {
            errorData = await res.json();
          } catch {
            const text = await res.text();
            console.error('Response text:', text);
          }
          const failInfo = {
            status: res.status,
            statusText: res.statusText,
            error: errorData,
            attId
          };
          console.error('❌ Fetch failed:', failInfo);
          console.table(failInfo);
        }
      } catch (error) {
        console.error('Failed to fetch attachment preview:', error);
        if (!callbackRef.current) {
          callbackRef.current = true;
          onLoadRef.current?.(false);
        }
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
