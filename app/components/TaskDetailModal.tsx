'use client';

import { useState, useRef } from 'react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  lane?: string;
  dueDate?: string;
  assignee?: string;
  assignees?: any[];
  creator?: string;
  createdAt?: string;
  createdBy?: string;
  startDate?: string;
  endDate?: string;
}

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onEdit?: (task: Task) => void;
}

const COLORS = ['#0E9384', '#E4572E', '#5B7FB0', '#B4479A', '#C98A0E', '#3F6E4B', '#8A5CF6', '#D2504F'];

export default function TaskDetailModal({ task, onClose, onEdit }: TaskDetailModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<{ file: File; preview: string }[]>([]);

  if (!task) return null;

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setAttachments(prev => [...prev, { file, preview: event.target?.result as string }]);
          };
          reader.readAsDataURL(file);
        } else {
          setAttachments(prev => [...prev, { file, preview: '' }]);
        }
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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

  const priorityLabels: Record<string, string> = {
    'low': 'ต่ำ',
    'medium': 'ปกติ',
    'high': 'สูง',
    'urgent': 'เร่งด่วน',
  };

  const priorityColors: Record<string, string> = {
    'low': '#7C3AED',
    'medium': '#0E9384',
    'high': '#DC2626',
    'urgent': '#EA580C',
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
              <span className="px-2.5 py-1 rounded text-xs font-medium text-white flex items-center gap-1" style={{ backgroundColor: '#EA580C' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                {laneLabels[task.lane] || task.lane}
              </span>
            )}
            <span className="px-2.5 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: priorityColors[task.priority] || '#666' }}>
              {priorityLabels[task.priority] || task.priority}
            </span>
          </div>

          {task.description && (
            <div className="mb-4">
              <p className="text-gray-300 text-sm leading-relaxed">{task.description}</p>
            </div>
          )}

          <div className="space-y-3 mb-4 text-sm">
            <div>
              <span className="text-gray-500 text-xs block mb-1">ผู้ถือ</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {task.assignees && task.assignees.length > 0 ? (
                  task.assignees.map((assignee: any, i: number) => (
                    <div key={i} className="flex items-center gap-1.5 bg-gray-800 px-2 py-1 rounded">
                      <div
                        className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
                        style={{ backgroundColor: assignee.color || COLORS[i % COLORS.length] }}
                      >
                        {(assignee.name || assignee).substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-gray-200 text-xs">{assignee.name || assignee}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500 text-xs">ไม่มีผู้รับ</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-gray-500 text-xs block mb-1">ช่วงวันที่</span>
              <span className="text-gray-300">
                📅{' '}
                {task.startDate && task.endDate
                  ? `${task.startDate} – ${task.endDate}`
                  : task.dueDate
                  ? task.dueDate
                  : '-'}
              </span>
            </div>

            <div>
              <span className="text-gray-500 text-xs block mb-1">ผู้สั่งงาน</span>
              <span className="text-gray-300">
                {task.createdBy || task.creator || '-'}
                {task.createdAt && <span className="text-gray-500 text-xs ml-2">· {task.createdAt}</span>}
              </span>
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="mb-4 space-y-2">
              {attachments.map((item, idx) => {
                const file = item.file;
                const preview = item.preview;
                return (
                  <div key={idx} className="relative group">
                    {preview ? (
                      <img
                        src={preview}
                        alt={file.name}
                        className="w-full rounded border border-gray-700 max-h-48 object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-between bg-gray-800 p-3 rounded border border-gray-700">
                        <span className="text-gray-300 text-xs truncate">{file.name}</span>
                      </div>
                    )}
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="absolute top-1 right-1 p-1.5 bg-red-600/80 hover:bg-red-700 rounded transition opacity-0 group-hover:opacity-100"
                      title="ถอดไฟล์"
                    >
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

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
              onClick={() => {
                onEdit?.(task);
                onClose();
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
        </div>
      </div>
    </div>
  );
}
