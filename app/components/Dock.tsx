'use client';

import { useState } from 'react';

export default function Dock() {
  const [input, setInput] = useState('');

  const handleCreateTask = () => {
    if (input.trim()) {
      console.log('Create task:', input);
      setInput('');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-6 py-4 shadow-2xl">
      <div className="max-w-full mx-auto flex gap-4 items-center">
        {/* Drag handle */}
        <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400" title="ลากเพื่อย้าย">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="6" r="1.4"></circle>
            <circle cx="15" cy="6" r="1.4"></circle>
            <circle cx="9" cy="12" r="1.4"></circle>
            <circle cx="15" cy="12" r="1.4"></circle>
            <circle cx="9" cy="18" r="1.4"></circle>
            <circle cx="15" cy="18" r="1.4"></circle>
          </svg>
        </button>

        {/* Command button */}
        <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400" title="คำสั่ง (/)">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3.5" y="3.5" width="17" height="17" rx="4.5"></rect>
            <path d="m14 8.5-4 7"></path>
          </svg>
        </button>

        {/* Input field */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
            placeholder="แตะที่นี่เพื่อสร้างงาน หรือพิมพ์ / สำหรับคำสั่ง..."
            className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Detailed edit button */}
        <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400" title="รายละเอียด">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"></path>
            <path d="M9 7h2M9 11h2M9 15h2M14 7h1M14 11h1M14 15h1"></path>
          </svg>
        </button>

        {/* AI button */}
        <button className="p-2 hover:bg-gray-800 rounded-lg text-blue-400" title="AI จับใจความ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
            <path d="M20 2v4"></path>
            <path d="M22 4h-4"></path>
            <circle cx="4" cy="20" r="2"></circle>
          </svg>
        </button>
      </div>
    </div>
  );
}
