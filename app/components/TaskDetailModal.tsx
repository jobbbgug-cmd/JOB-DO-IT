'use client';

import { useState, useRef, useEffect } from 'react';
import type { Task } from '@/app/types/index';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onEdit?: (task: Task) => void;
  onTaskUpdated?: () => void;
  employees?: any[];
  companyCode?: string;
  isReadOnly?: boolean;
}

const COLORS = ['#0E9384', '#E4572E', '#5B7FB0', '#B4479A', '#C98A0E', '#3F6E4B', '#8A5CF6', '#D2504F'];

export default function TaskDetailModal({ task, onClose, onEdit, onTaskUpdated, employees = [], companyCode = '', isReadOnly = false }: TaskDetailModalProps) {
  console.log('TaskDetailModal received props: onEdit type:', typeof onEdit, 'task:', task?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<{ file: File; preview: string }[]>([]);
  const [creatorName, setCreatorName] = useState<string>('');

  useEffect(() => {
    if (!task?.createdBy) {
      setCreatorName('');
      return;
    }

    // หาชื่อผู้สร้างจาก employees array
    const creator = employees.find((emp: any) =>
      String(emp.userId || emp.id || emp._id) === String(task.createdBy) ||
      String(emp.id || emp._id) === String(task.createdBy)
    );

    if (creator) {
      setCreatorName(creator.name);
    } else {
      setCreatorName(task.createdBy);
    }
  }, [task?.createdBy, employees]);

  useEffect(() => {
    if (task?.attachments && Array.isArray(task.attachments) && task.attachments.length > 0) {
      const loadAttachments = async () => {
        const loaded = await Promise.all(
          task.attachments.map(async (att: string, idx: number) => {
            if (!att) return null;

            // ถ้า base64 ใช้โดยตรง
            if (att.startsWith('data:') || att.includes('||data:')) {
              let fileName = `file_${idx}`;
              let dataUrl = att;

              // แยกชื่อไฟล์ถ้ามี format: filename||data:...
              if (att.includes('||')) {
                const [name, data] = att.split('||');
                fileName = name || `file_${idx}`;
                dataUrl = data;
              }

              const isImage = dataUrl.startsWith('data:image/');
              const mimeType = isImage ? dataUrl.split(':')[1].split(';')[0] : 'application/octet-stream';
              return {
                file: new File([dataUrl], fileName, { type: mimeType }),
                preview: dataUrl,
              };
            }

            // ถ้า ID เรียก API
            try {
              const res = await fetch(`/api/attachments/${att}`);
              if (res.ok) {
                const data = await res.json();
                return {
                  file: new File([data.dataUrl], data.fileName, { type: data.fileType }),
                  preview: data.dataUrl,
                };
              }
            } catch (error) {
              console.error(`Failed to load attachment ${att}:`, error);
            }
            return null;
          })
        );
        setAttachments(loaded.filter(Boolean) as any);
      };
      loadAttachments();
    } else {
      setAttachments([]);
    }
  }, [task?.attachments]);

  if (!task) return null;

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !task?.id || !companyCode) return;

    await Promise.all(
      Array.from(files).map(async (file) => {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('taskId', task.id);
          formData.append('companyCode', companyCode);

          const response = await fetch('/api/attachments/upload', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            // Use the filename from API response if available, otherwise use file.name
            const displayFileName = data.fileName || file.name;
            // Create a new File object with the proper filename for display
            const fileWithName = new File([data.dataUrl], displayFileName, { type: file.type });
            setAttachments(prev => [...prev, { file: fileWithName, preview: data.dataUrl }]);
          } else {
            const errorData = await response.json();
            console.error('Upload failed:', errorData);
          }
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      })
    );

    // Notify parent to refetch task data so new attachment persists
    onTaskUpdated?.();

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = async (index: number) => {
    if (!task?.id || !task?.attachments?.[index]) return;

    setAttachments(prev => prev.filter((_, i) => i !== index));

    try {
      const attachmentToDelete = task.attachments[index];
      await fetch(`/api/tasks/edit/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deletedAttachments: [attachmentToDelete],
          companyCode,
        }),
      });
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  };

  const statusLabels: Record<string, string> = {
    'todo': 'ยังไม่เริ่ม',
    'in-progress': 'กำลังทำ',
    'in-review': 'รอรีวิว',
    'done': 'เสร็จ',
  };

  const statusColors: Record<string, string> = {
    'todo': '#5B7FB0',
    'in-progress': '#C98A0E',
    'in-review': '#8A5CF6',
    'done': '#0E9384',
  };

  const laneLabels: Record<string, string> = {
    'routine': 'งานรูทีน',
    'urgent': 'งานจิกปะทะ',
  };

  const laneColors: Record<string, string> = {
    'routine': '#0E9384',
    'urgent': '#EA580C',
  };

  const priorityLabels: Record<string, string> = {
    'critical': 'ด่วนมาก',
    'urgent': 'ด่วน',
    'high': 'ด่วน',
    'normal': 'ปกติ',
    'medium': 'ปกติ',
    'low': 'ไม่รีบ',
    'later': 'ทำเมื่อว่าง',
    'none': 'ทำเมื่อว่าง',
    'idle': 'ทำเมื่อว่าง',
  };

  const priorityColors: Record<string, string> = {
    'critical': '#D2504F',
    'urgent': '#E4572E',
    'high': '#E4572E',
    'normal': '#0E9384',
    'medium': '#0E9384',
    'low': '#5B7FB0',
    'later': '#8A8F98',
    'none': '#8A8F98',
    'idle': '#8A8F98',
  };

  const getPriorityLabel = (priority: string | undefined): string => {
    if (!priority) return 'ปกติ';
    return priorityLabels[priority.toLowerCase()] || 'ปกติ';
  };

  const getPriorityColor = (priority: string | undefined): string => {
    if (!priority) return '#0E9384';
    return priorityColors[priority.toLowerCase()] || '#666';
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto relative shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 hover:bg-gray-800 rounded transition-colors z-10"
          title="ปิด"
        >
          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12"></path>
          </svg>
        </button>

        <div className="p-6">
          <h1 className="text-lg font-bold text-white mb-3 pr-8 leading-relaxed">{task.title}</h1>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="px-2.5 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: statusColors[task.status] || '#666' }}>
              {statusLabels[task.status] || task.status}
            </span>
            {task.lane && (
              <span className="px-2.5 py-1 rounded text-xs font-medium text-white flex items-center gap-1" style={{ backgroundColor: laneColors[task.lane] || '#666' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                {laneLabels[task.lane] || task.lane}
              </span>
            )}
            <span className="px-2.5 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: getPriorityColor(task.priority) }}>
              {getPriorityLabel(task.priority)}
            </span>
          </div>

          {task.description && (
            <div className="mb-4">
              <p className="text-gray-300 text-sm leading-relaxed">{task.description}</p>
            </div>
          )}

          <div className="space-y-3 mb-4 text-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-500 text-xs">ผู้ถืองาน</span>
              {task.assignees && task.assignees.length > 0 ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {task.assignees.map((assigneeId: any, i: number) => {
                    const employee = employees.find((emp: any) => String(emp.id || emp._id) === String(assigneeId));
                    const empName = employee?.name || assigneeId;
                    const empColor = employee?.color || COLORS[i % COLORS.length];
                    return (
                      <div key={i} className="flex items-center gap-1.5 bg-gray-800 px-2 py-1 rounded">
                        <div
                          className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
                          style={{ backgroundColor: empColor }}
                        >
                          {empName.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-gray-200 text-xs">{empName}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span className="text-gray-500 text-xs">ไม่มีผู้รับ</span>
              )}
            </div>

            <div>
              <span className="text-gray-500 text-xs">ผู้สั่งงาน</span>
              <span className="text-gray-300 ml-2">
                {creatorName || task.createdBy || '-'}
                {task.createdAt && (() => {
                  const date = new Date(task.createdAt);
                  const day = String(date.getDate()).padStart(2, '0');
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const year = date.getFullYear();
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  return <span className="text-gray-500 text-xs ml-2">· {day}-{month}-{year} {hours}:{minutes} น.</span>;
                })()}
              </span>
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="mb-4 space-y-2">
              {(() => {
                const images = attachments.filter(item => item.preview && item.preview.startsWith('data:image/'));
                const nonImageFiles = attachments.filter(item => !item.preview || !item.preview.startsWith('data:image/'));

                return (
                  <>
                    {images.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {images.map((item, idx) => (
                          <div key={`img-${idx}`} className="relative group flex-shrink-0 w-40">
                            <img
                              src={item.preview}
                              alt={item.file.name}
                              className="w-full h-40 rounded border border-gray-700 object-cover"
                            />
                            <button
                              onClick={() => removeAttachment(attachments.indexOf(item))}
                              className="absolute top-1 right-1 p-1.5 bg-red-600/80 hover:bg-red-700 rounded transition opacity-0 group-hover:opacity-100"
                              title="ถอดไฟล์"
                            >
                              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {nonImageFiles.length > 0 && (
                      <div className="space-y-2">
                        {nonImageFiles.map((item, idx) => {
                          const actualIdx = attachments.indexOf(item);
                          return (
                            <div
                              key={`file-${idx}`}
                              className="flex items-center gap-1.5 p-1.5 bg-gray-800/50 rounded border border-gray-700/50 group hover:bg-gray-800/70 transition"
                            >
                              <span className="text-sm flex-shrink-0">📎</span>
                              <a
                                href={item.preview}
                                download={item.file.name}
                                className="text-gray-300 text-sm hover:text-gray-100 underline truncate flex-1"
                                title={item.file.name}
                              >
                                {item.file.name}
                              </a>
                              <button
                                onClick={() => removeAttachment(actualIdx)}
                                className="p-1.5 text-gray-400 hover:text-red-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition"
                                title="ถอดไฟล์"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {!isReadOnly && (
            <>
              {console.log('TaskDetailModal: Buttons section rendered, isReadOnly:', isReadOnly)}
              <div className="mb-4">
                <button
                  onClick={handleFileAttach}
                  className="w-full text-gray-300 hover:text-gray-100 text-sm py-2 px-3 rounded hover:bg-gray-800 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"></path>
                  </svg>
                  แนบไฟล์
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,video/*,application/pdf,.doc,.docx,.txt"
                />
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  เสร็จ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log('===== Edit button CLICKED =====');
                    console.log('onEdit exists:', !!onEdit);
                    console.log('task exists:', !!task);
                    console.log('task.id:', task?.id);
                    console.log('Calling onEdit now...');
                    onEdit?.(task);
                    console.log('Calling onClose now...');
                    onClose();
                    console.log('===== Edit button handler finished =====');
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                  </svg>
                  แก้ไข
                </button>
                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                  </svg>
                  ลบงาน
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
