'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';

interface Employee {
  id: string;
  name: string;
  color?: string;
}

export default function MobileComposer() {
  const params = useParams();
  const pathname = usePathname();
  const companyCode = params.companyCode as string;
  const [taskName, setTaskName] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const pickerRef = useRef<HTMLDivElement>(null);

  const isTeamBoard = pathname?.includes('boardteam');

  useEffect(() => {
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

    if (companyCode) {
      fetchEmployees();
    }
  }, [companyCode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedEmployeeObj = employees.find((emp) => emp.id === selectedEmployee);

  if (!companyCode || !isTeamBoard) return null;

  return (
    <div className="block md:hidden fixed bottom-24 left-0 right-0 bg-gray-900 border-b border-gray-800 z-40">
      <div className="border border-gray-700 rounded-lg bg-gray-800/50 m-3 p-3 space-y-2">
        {/* First Row: Picker */}
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className="px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[32px] whitespace-nowrap flex items-center gap-1"
          >
            <span>👤</span>
            <span>{selectedEmployeeObj?.name || 'ยังไม่มีพนักงาน'}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3 h-3 ml-auto"
            >
              <path d="m6 9 6 6 6-6"></path>
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isPickerOpen && (
            <div className="fixed bottom-64 left-3 right-3 bg-gray-800 border-2 border-cyan-500 rounded-lg shadow-lg z-50">
              <input
                type="text"
                placeholder="ค้นหาชื่อพนักงาน…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 bg-gray-700 border-b border-gray-600 text-white text-xs placeholder-gray-400 focus:outline-none"
              />
              <div className="max-h-40 overflow-y-auto" role="listbox">
                {filteredEmployees.length === 0 ? (
                  <div className="px-3 py-3 text-gray-400 text-xs">ไม่พบพนักงาน</div>
                ) : (
                  filteredEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        setSelectedEmployee(emp.id);
                        setIsPickerOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-3 py-2.5 text-white text-xs hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: emp.color || '#6B7280' }}
                      ></div>
                      <span>{emp.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Second Row: Task Input + Buttons */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="พิมพ์งานที่นี่…"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-transparent text-white placeholder-gray-400 focus:outline-none text-xs"
          />

          {/* Detail Button */}
          <button
            className="p-1 text-gray-400 hover:text-white transition-colors flex-shrink-0"
            title="กรอกงานแบบละเอียด"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5"
            >
              <path d="M9 6h11M9 12h11M9 18h11"></path>
              <path d="M4 6h.01M4 12h.01M4 18h.01"></path>
            </svg>
          </button>

          {/* AI Button */}
          <button
            className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors flex-shrink-0"
            title="AI จับใจความให้"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5"
            >
              <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
              <path d="M20 2v4"></path>
              <path d="M22 4h-4"></path>
              <circle cx="4" cy="20" r="2"></circle>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
