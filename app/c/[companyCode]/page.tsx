'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';
import { useUIStore } from '@/app/store/uiStore';
import Layout from '@/app/components/Layout';

interface Employee {
  id: string;
  name: string;
  role: string;
  presence: boolean;
  taskCount: number;
  tasks: Array<{
    id: string;
    title: string;
    progress: number;
    lane: 'routine' | 'urgent';
    time: string;
    assignee: string;
  }>;
}

interface CardSize {
  width: number;
  height: number;
}

interface CardPosition {
  x: number;
  y: number;
}

export default function CompanyPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const { zoom } = useUIStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [companyCode] = useState(params.companyCode as string);
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '157ac5bd-a9d5-46f8-a886-fef30626fef3',
      name: 'jobbbgug',
      role: 'เจ้าของบริษัท',
      presence: true,
      taskCount: 1,
      tasks: [
        {
          id: 'task-1',
          title: 'งานตัวอย่าง — ลากย้ายได้ กดเปิดดูรายละเอียด ลบทิ้งได้เลย',
          progress: 0,
          lane: 'routine',
          time: '13:36',
          assignee: 'jobbbgug',
        },
      ],
    },
  ]);

  const [cardSizes, setCardSizes] = useState<Record<string, CardSize>>({});
  const [cardPositions, setCardPositions] = useState<Record<string, CardPosition>>({});
  const [resizing, setResizing] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, side: '' });
  const [taskDragging, setTaskDragging] = useState<{ empId: string; taskId: string; sourceLane: 'routine' | 'urgent' } | null>(null);
  const [hoveredLane, setHoveredLane] = useState<'routine' | 'urgent' | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRefs = useRef<Record<string, HTMLDivElement>>({});

  const draggedTask = taskDragging
    ? employees.find((e) => e.id === taskDragging.empId)?.tasks.find((t) => t.id === taskDragging.taskId)
    : null;

  const cardPositionsRef = useRef(cardPositions);
  const dragStartRef = useRef(dragStart);

  useEffect(() => {
    cardPositionsRef.current = cardPositions;
    dragStartRef.current = dragStart;
  }, [cardPositions, dragStart]);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!storedToken) {
      router.push('/login');
    } else {
      setIsHydrated(true);
    }
  }, [router]);

  const handleDragStart = (e: React.MouseEvent, empId: string) => {
    e.preventDefault();
    setDragging(empId);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleResizeStart = (e: React.MouseEvent, empId: string, side: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(empId);
    setResizeStart({ x: e.clientX, y: e.clientY, side });
  };

  const handleTaskDragStart = (e: React.MouseEvent, empId: string, taskId: string, sourceLane: 'routine' | 'urgent') => {
    e.preventDefault();
    e.stopPropagation();
    setMousePos({ x: e.clientX, y: e.clientY });
    setTaskDragging({ empId, taskId, sourceLane });
  };

  const handleTaskLaneDrop = (empId: string, targetLane: 'routine' | 'urgent') => {
    if (!taskDragging) return;
    const { empId: sourceEmpId, taskId } = taskDragging;

    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== sourceEmpId) return emp;
        return {
          ...emp,
          tasks: emp.tasks.map((task) =>
            task.id === taskId ? { ...task, lane: targetLane } : task
          ),
        };
      })
    );
    setTaskDragging(null);
  };

  useEffect(() => {
    if (!dragging) return;

    const cardEl = cardRefs.current[dragging];
    if (!cardEl) return;

    let pendingUpdate = false;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      const currentPos = cardPositionsRef.current[dragging] || { x: 0, y: 0 };

      const newPos = {
        x: currentPos.x + deltaX,
        y: currentPos.y + deltaY,
      };

      cardPositionsRef.current = {
        ...cardPositionsRef.current,
        [dragging]: newPos,
      };

      // Direct DOM update for smooth motion
      if (cardEl) {
        cardEl.style.transform = `translate(${newPos.x}px, ${newPos.y}px)`;
      }

      dragStartRef.current = { x: e.clientX, y: e.clientY };
      pendingUpdate = true;
    };

    const handleMouseUp = () => {
      setDragging(null);
      // State stays in sync via ref
      cardPositionsRef.current = { ...cardPositionsRef.current };
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  const scaleFactor = zoom / 100;

  useEffect(() => {
    if (!resizing) return;

    const cardEl = cardRefs.current[resizing];
    if (!cardEl) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - resizeStart.x) / scaleFactor;
      const deltaY = (e.clientY - resizeStart.y) / scaleFactor;
      const side = resizeStart.side;

      const rect = cardEl.getBoundingClientRect();
      const currentSize = cardSizes[resizing] || { width: 450, height: 500 };
      const currentPos = cardPositionsRef.current[resizing] || { x: 0, y: 0 };

      let newWidth = currentSize.width;
      let newHeight = currentSize.height;
      let newPos = { ...currentPos };

      if (side.includes('right')) newWidth = Math.max(400, currentSize.width + deltaX);
      if (side.includes('left')) {
        newWidth = Math.max(400, currentSize.width - deltaX);
        newPos.x = currentPos.x + deltaX;
      }
      if (side.includes('bottom')) newHeight = Math.max(300, currentSize.height + deltaY);
      if (side.includes('top')) {
        newHeight = Math.max(300, currentSize.height - deltaY);
        newPos.y = currentPos.y + deltaY;
      }

      setCardSizes((prev) => ({
        ...prev,
        [resizing]: { width: newWidth, height: newHeight },
      }));

      setCardPositions((prev) => ({
        ...prev,
        [resizing]: newPos,
      }));

      cardPositionsRef.current = { ...cardPositionsRef.current, [resizing]: newPos };

      setResizeStart({ x: e.clientX, y: e.clientY, side });
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, resizeStart, scaleFactor]);

  useEffect(() => {
    if (!taskDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setTaskDragging(null);
      setHoveredLane(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [taskDragging]);

  if (!isHydrated) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <Layout>
      {/* Full Screen Canvas */}
      <div className="fixed inset-0 top-16 left-4 right-4 bottom-4 overflow-visible" style={{transformOrigin: "top left", transform: `scale(${zoom / 100})`}}>
        {employees.map((emp) => {
          const size = cardSizes[emp.id] || { width: 450, height: 500 };
          const pos = cardPositions[emp.id] || { x: 20, y: 20 };
          const isDragging = dragging === emp.id;
          const isResizing = resizing === emp.id;

          return (
            <div
              key={emp.id}
              ref={(el) => {
                if (el) cardRefs.current[emp.id] = el;
              }}
              className={`absolute bg-gray-900 border-2 border-cyan-600/40 hover:border-cyan-500/60 rounded-xl p-5 transition-all ${
                isResizing
                  ? 'border-cyan-500/80 shadow-lg shadow-cyan-900/40'
                  : isDragging
                    ? 'border-cyan-500 shadow-lg shadow-cyan-900/60'
                    : 'hover:shadow-lg hover:shadow-cyan-900/20'
              }`}
              style={{
                width: `${size.width}px`,
                height: `${size.height}px`,
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                display: 'flex',
                flexDirection: 'column',
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
              }}
            >
              {/* Employee Header with Drag Handle */}
              <div
                className={`flex items-start gap-3 mb-4 pb-4 border-b border-gray-700 group cursor-grab active:cursor-grabbing flex-shrink-0 ${isDragging ? 'opacity-80' : ''}`}
                onMouseDown={(e) => handleDragStart(e, emp.id)}
              >
                {/* Drag Handle */}
                <div className="text-gray-600 group-hover:text-gray-400 transition-colors pt-1">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <circle cx="9" cy="6" r="1.4"></circle>
                    <circle cx="15" cy="6" r="1.4"></circle>
                    <circle cx="9" cy="12" r="1.4"></circle>
                    <circle cx="15" cy="12" r="1.4"></circle>
                    <circle cx="9" cy="18" r="1.4"></circle>
                    <circle cx="15" cy="18" r="1.4"></circle>
                  </svg>
                </div>

                {/* Avatar & Info */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold flex items-center justify-center text-base shadow-lg">
                      {emp.name.substring(0, 2).toUpperCase()}
                    </div>
                    {emp.presence && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 shadow-lg"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{emp.name}</h3>
                    <p className="text-sm text-gray-400">{emp.role}</p>
                  </div>
                </div>

                {/* Task Count & Actions */}
                <div className="flex items-center gap-2">
                  <div className="text-right mr-2 text-base font-bold text-white border border-gray-600 rounded-lg px-3 py-1">
                    {emp.taskCount} งาน
                  </div>

                  {/* Board Button */}
                  <button
                    className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-cyan-400 transition-colors flex-shrink-0"
                    title="ดูบอร์ดงาน"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-4 h-4"
                    >
                      <rect x="3" y="4" width="6" height="16" rx="1"></rect>
                      <rect x="15" y="4" width="6" height="10" rx="1"></rect>
                    </svg>
                  </button>

                  {/* History Button */}
                  <button
                    className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-cyan-400 transition-colors flex-shrink-0"
                    title="ประวัติกิจกรรม"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-4 h-4"
                    >
                      <path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path>
                      <path d="M3 3v5h5"></path>
                      <path d="M12 7v5l3 2"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Lanes - 2 Columns Layout */}
              <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 min-h-0" onMouseDown={(e) => e.stopPropagation()}>
                {/* Routine Lane (Left) */}
                <div
                  className={`space-y-2 overflow-y-auto border-2 rounded-lg px-2 py-2 transition-colors ${
                    taskDragging && taskDragging.sourceLane === 'urgent' && hoveredLane === 'routine'
                      ? 'border-cyan-500 bg-cyan-900/10'
                      : 'border-transparent'
                  }`}
                  onMouseUp={() => taskDragging && handleTaskLaneDrop(emp.id, 'routine')}
                  onMouseMove={() => taskDragging && taskDragging.sourceLane === 'urgent' && setHoveredLane('routine')}
                  onMouseLeave={() => setHoveredLane(null)}
                >
                  <div className="flex items-center justify-between mb-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                      <span className="text-lg font-semibold text-gray-200">งานรูทีน</span>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                      {emp.tasks.filter((t) => t.lane === 'routine').length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {emp.tasks
                      .filter((t) => t.lane === 'routine')
                      .map((task) => (
                        <div
                          key={task.id}
                          onMouseDown={(e) => handleTaskDragStart(e, emp.id, task.id, 'routine')}
                          className={`bg-gray-800/50 border border-gray-700 hover:border-cyan-500/50 rounded-lg p-4 transition-all hover:bg-gray-800/80 cursor-grab active:cursor-grabbing group text-xs min-h-32 flex flex-col ${
                            taskDragging?.taskId === task.id ? 'opacity-50 border-cyan-500' : ''
                          }`}
                        >
                          <p className="text-gray-300 group-hover:text-white transition-colors mb-3 leading-snug line-clamp-3 text-sm">
                            {task.title}
                          </p>
                          <div className="space-y-1.5 flex-1 flex flex-col justify-end">
                            <div className="flex items-center gap-2 justify-between">
                              <div className="w-full bg-gray-700 rounded-full h-1 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-1 rounded-full transition-all"
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              </div>
                              <span className="font-semibold text-gray-500 whitespace-nowrap ml-1">
                                {task.progress}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <div className="w-4 h-4 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center flex-shrink-0">
                                  {task.assignee.substring(0, 1).toUpperCase()}
                                </div>
                                <span className="text-gray-500 line-clamp-1">{task.assignee}</span>
                              </div>
                              <time className="text-gray-600">{task.time}</time>
                            </div>
                          </div>
                        </div>
                      ))}
                    {emp.tasks.filter((t) => t.lane === 'routine').length === 0 && (
                      <div className="text-gray-600 text-center py-6 italic border-2 border-dashed border-gray-600 rounded-lg">
                        ว่าง
                      </div>
                    )}
                  </div>
                </div>

                {/* Urgent Lane (Right) */}
                <div
                  className={`space-y-2 overflow-y-auto border-2 rounded-lg px-2 py-2 transition-colors ${
                    taskDragging && taskDragging.sourceLane === 'routine' && hoveredLane === 'urgent'
                      ? 'border-red-500 bg-red-900/10'
                      : 'border-transparent'
                  }`}
                  onMouseUp={() => taskDragging && handleTaskLaneDrop(emp.id, 'urgent')}
                  onMouseMove={() => taskDragging && taskDragging.sourceLane === 'routine' && setHoveredLane('urgent')}
                  onMouseLeave={() => setHoveredLane(null)}
                >
                  <div className="flex items-center justify-between mb-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="text-lg font-semibold text-gray-200">งานจิกปะทะ</span>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                      {emp.tasks.filter((t) => t.lane === 'urgent').length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {emp.tasks
                      .filter((t) => t.lane === 'urgent')
                      .map((task) => (
                        <div
                          key={task.id}
                          onMouseDown={(e) => handleTaskDragStart(e, emp.id, task.id, 'urgent')}
                          className={`bg-gray-800/50 border border-gray-700 hover:border-red-500/50 rounded-lg p-4 transition-all hover:bg-gray-800/80 cursor-grab active:cursor-grabbing group text-xs min-h-32 flex flex-col ${
                            taskDragging?.taskId === task.id ? 'opacity-50 border-red-500' : ''
                          }`}
                        >
                          <p className="text-gray-300 group-hover:text-white transition-colors mb-3 leading-snug line-clamp-3 text-sm">
                            {task.title}
                          </p>
                          <div className="space-y-1.5 flex-1 flex flex-col justify-end">
                            <div className="flex items-center gap-2 justify-between">
                              <div className="w-full bg-gray-700 rounded-full h-1 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-red-500 to-red-400 h-1 rounded-full transition-all"
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              </div>
                              <span className="font-semibold text-gray-500 whitespace-nowrap ml-1">
                                {task.progress}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <div className="w-4 h-4 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center flex-shrink-0">
                                  {task.assignee.substring(0, 1).toUpperCase()}
                                </div>
                                <span className="text-gray-500 line-clamp-1">{task.assignee}</span>
                              </div>
                              <time className="text-gray-600">{task.time}</time>
                            </div>
                          </div>
                        </div>
                      ))}
                    {emp.tasks.filter((t) => t.lane === 'urgent').length === 0 && (
                      <div className="text-gray-600 text-center py-6 italic border-2 border-dashed border-gray-600 rounded-lg">
                        ลากงานมาวาง
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Invisible Resize Zones - 8 Directions */}
              {/* Top Left */}
              <div className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize" onMouseDown={(e) => handleResizeStart(e, emp.id, 'top-left')} style={{ pointerEvents: 'auto' }} />
              {/* Top Center */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-4 cursor-n-resize" onMouseDown={(e) => handleResizeStart(e, emp.id, 'top')} style={{ pointerEvents: 'auto' }} />
              {/* Top Right */}
              <div className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize" onMouseDown={(e) => handleResizeStart(e, emp.id, 'top-right')} style={{ pointerEvents: 'auto' }} />
              {/* Left Center */}
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-4 h-8 cursor-w-resize" onMouseDown={(e) => handleResizeStart(e, emp.id, 'left')} style={{ pointerEvents: 'auto' }} />
              {/* Right Center */}
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-4 h-8 cursor-e-resize" onMouseDown={(e) => handleResizeStart(e, emp.id, 'right')} style={{ pointerEvents: 'auto' }} />
              {/* Bottom Left */}
              <div className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize" onMouseDown={(e) => handleResizeStart(e, emp.id, 'bottom-left')} style={{ pointerEvents: 'auto' }} />
              {/* Bottom Center */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-4 cursor-s-resize" onMouseDown={(e) => handleResizeStart(e, emp.id, 'bottom')} style={{ pointerEvents: 'auto' }} />
              {/* Bottom Right */}
              <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" onMouseDown={(e) => handleResizeStart(e, emp.id, 'bottom-right')} style={{ pointerEvents: 'auto' }} />
            </div>
          );
        })}
      </div>

      {/* Task Drag Preview */}
      {taskDragging && draggedTask && (
        <div
          className="fixed bg-gray-800 border-2 border-blue-500 rounded-lg p-3 shadow-2xl shadow-blue-900/50 pointer-events-none z-50 max-w-xs"
          style={{
            left: `${mousePos.x + 10}px`,
            top: `${mousePos.y + 10}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <p className="text-gray-300 text-xs font-semibold leading-snug line-clamp-2 mb-2">
            {draggedTask.title}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center flex-shrink-0">
              {draggedTask.assignee.substring(0, 1).toUpperCase()}
            </div>
            <span className="text-gray-400">{draggedTask.assignee}</span>
            <span className="text-cyan-400">{draggedTask.progress}%</span>
          </div>
        </div>
      )}
    </Layout>
  );
}
