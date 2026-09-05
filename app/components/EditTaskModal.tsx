'use client';

import { useState } from 'react';

interface EditTaskModalProps {
  task: any | null;
  onClose: () => void;
}

export default function EditTaskModal({ task, onClose }: EditTaskModalProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [visibility, setVisibility] = useState('public');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [lane, setLane] = useState(task?.lane || 'routine');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!task) return null;

  const priorityOptions = [
    { value: 'urgent', label: 'ด่วนมาก', color: '#D2504F' },
    { value: 'high', label: 'ด่วน', color: '#E4572E' },
    { value: 'medium', label: 'ปกติ', color: '#0E9384' },
    { value: 'low', label: 'ไม่รีบ', color: '#5B7FB0' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-xl w-full max-w-md shadow-2xl my-8"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-800 rounded transition-colors"
          title="ปิด"
        >
          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12"></path>
          </svg>
        </button>

        <div className="p-6">
          <h1 className="text-lg font-bold text-white mb-2 pr-8">กรอกงานแบบละเอียด</h1>
          <p className="text-gray-400 text-sm mb-6">ระบุรายละเอียด กำหนดวัน และแนบไฟล์ให้ครบในครั้งเดียว</p>

          <div className="space-y-4">
            {/* ชื่องาน */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">ชื่องาน</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น ออกแบบโปสเตอร์งานเปิดตัว"
                className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:border-cyan-500 focus:outline-none text-sm"
              />
            </div>

            {/* รายละเอียด */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">รายละเอียดงาน</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="อธิบายเพิ่มเติม (ไม่บังคับ)"
                className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:border-cyan-500 focus:outline-none text-sm min-h-20 resize-none"
              />
            </div>

            {/* ประเภท */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">ประเภท</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLane('routine')}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                    lane === 'routine'
                      ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500'
                      : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 mr-2"></span>
                  รูทีน
                </button>
                <button
                  onClick={() => setLane('urgent')}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                    lane === 'urgent'
                      ? 'bg-orange-500/30 text-orange-300 border border-orange-500'
                      : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
                  จิกปะทะ
                </button>
              </div>
            </div>

            {/* ความสำคัญ */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">แท็กความสำคัญ</label>
              <div className="grid grid-cols-2 gap-2">
                {priorityOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setPriority(option.value)}
                    className={`py-2 px-3 rounded text-xs font-medium transition ${
                      priority === option.value
                        ? 'text-white'
                        : 'text-gray-400'
                    }`}
                    style={{
                      backgroundColor: priority === option.value ? `${option.color}33` : 'transparent',
                      border: priority === option.value ? `1px solid ${option.color}` : '1px solid #4B5563',
                      color: priority === option.value ? option.color : undefined,
                    }}
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: option.color }}></span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ช่วงวันที่ */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">ช่วงวันที่ทำงาน</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:border-cyan-500 focus:outline-none text-sm"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:border-cyan-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* ปุ่มสร้าง */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition mt-6">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M20 6 9 17l-5-5"></path>
              </svg>
              บันทึกการแก้ไข
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
