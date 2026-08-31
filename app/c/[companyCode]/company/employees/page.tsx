'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Employee {
  id: string;
  name: string;
  role: string;
  presence: boolean;
}

export default function EmployeesPage() {
  const params = useParams();
  const companyCode = params.companyCode as string;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, [companyCode]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`/api/employees/${companyCode}`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployeeName || !newEmployeeRole) return;

    try {
      const response = await fetch(`/api/employees/${companyCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEmployeeName,
          role: newEmployeeRole,
          presence: true,
          taskCount: 0,
          tasks: [],
        }),
      });

      if (response.ok) {
        setNewEmployeeName('');
        setNewEmployeeRole('');
        fetchEmployees();
      }
    } catch (error) {
      console.error('Failed to add employee:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-white">พนักงาน</h2>
        <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm font-medium transition-colors">
          ＋ เพิ่มพนักงาน
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-1 mb-4">
        สร้างพนักงานได้อิสระ แล้วค่อยผูกกับผู้เข้าร่วม (บัญชี) ภายหลังถ้าต้องการ
      </p>

      {/* Invite Section */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
        <div className="mb-4">
          <h3 className="font-semibold text-white text-sm mb-1">เชิญสมาชิกเข้าร่วมบริษัท</h3>
          <p className="text-xs text-gray-400">
            ส่งลิงก์ให้เข้าสู่ระบบมาดูบอร์ดและอัปเดตงานเอง
          </p>
        </div>
        <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm font-medium transition-colors">
          ＋ สร้างลิงก์เชิญ
        </button>
      </div>

      {/* Employees List */}
      <div className="space-y-3">
        {employees.length === 0 ? (
          <div className="text-center py-8 text-gray-400">ไม่มีพนักงาน</div>
        ) : (
          employees.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center gap-3 p-3 bg-gray-800/30 border border-gray-700 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {emp.name.substring(0, 2).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white text-sm truncate">{emp.name}</span>
                  <span className="text-xs text-gray-500 truncate">· {emp.role}</span>
                  {emp.presence && (
                    <span className="text-xs font-bold text-cyan-400 flex-shrink-0">
                      🔗 {emp.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <button className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors">
                  แก้ไข
                </button>
                <button className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors">
                  ปิดใช้งาน
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
