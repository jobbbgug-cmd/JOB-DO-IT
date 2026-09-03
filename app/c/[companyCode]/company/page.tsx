'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';

interface Employee {
  id: string;
  name: string;
  role: string;
  userId?: string;
  color?: string;
}

interface EmployeeOption {
  _id: string;
  name: string;
  role?: string;
}

const COLORS = ['#0E9384', '#E4572E', '#5B7FB0', '#B4479A', '#C98A0E', '#3F6E4B', '#8A5CF6', '#D2504F'];

export default function CompanyPage() {
  const params = useParams();
  const companyCode = params.companyCode as string;
  const { user } = useAuthStore();
  const canManageEmployees = user?.role === 'owner';
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
  const [maxUses, setMaxUses] = useState('');
  const [linkedUsers, setLinkedUsers] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchEmployees();
    fetchEmployeeOptions();
  }, [companyCode]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`/api/employees/${companyCode}`);
      if (response.ok) {
        const data = await response.json();
        const transformed = data.map((emp: any) => ({
          ...emp,
          id: emp.id || emp._id,
          userId: emp.userId,
        }));
        setEmployees(transformed);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const fetchEmployeeOptions = async () => {
    try {
      const response = await fetch(`/api/employees/${companyCode}/list`);
      if (response.ok) {
        const data = await response.json();
        setEmployeeOptions(data);
      }
    } catch (error) {
      console.error('Failed to fetch employee options:', error);
    }
  };

  useEffect(() => {
    if (employeeOptions.length > 0 && employees.length > 0) {
      const linked: { [key: string]: string } = {};
      employees.forEach((emp: any) => {
        if (emp.userId) {
          const linkedEmployee = employeeOptions.find(opt => opt._id === emp.userId);
          if (linkedEmployee) {
            linked[emp.id] = linkedEmployee.name;
          }
        }
      });
      setLinkedUsers(linked);
    }
  }, [employeeOptions, employees]);

  return (
    <div className="space-y-4">
      {/* Employees Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">พนักงาน</h2>
          {canManageEmployees && (
            <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm font-medium transition-colors">
              ＋ เพิ่มพนักงาน
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">
          สร้างพนักงานได้อิสระ แล้วค่อยผูกกับผู้เข้าร่วม (บัญชี) ภายหลังถ้าต้องการ
        </p>

        {/* Invite Section - Only for owners */}
        {canManageEmployees && (
          <div className="bg-teal-900/20 border border-teal-600 rounded-lg p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-white text-sm mb-1">เชิญสมาชิกเข้าร่วมบริษัท</h3>
              <p className="text-xs text-gray-400">
                ส่งลิงก์ให้เข้าสู่ระบบมาดูบอร์ดและอัปเดตงานเอง
              </p>
            </div>
            <div className="flex gap-2 items-end">
              <label className="flex items-center gap-2 text-xs text-gray-400">
                ใช้ได้
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="∞"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  className="w-16 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white text-center"
                />
                คน (เว้นว่าง = ไม่จำกัด)
              </label>
              <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors">
                สร้างลิงค์
              </button>
            </div>
          </div>
        )}

        {/* Employees List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-white text-sm">สมาชิกบริษัท</h3>
          <div className="space-y-2">
            {employees.map((emp) => (
              <div key={emp.id} className="rounded-lg">
                <div className="flex items-center gap-2 p-3 flex-wrap">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                    style={{ backgroundColor: emp.color || COLORS[0] }}
                  >
                    {emp.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white text-sm truncate">{emp.name}</span>
                      <span className="text-xs text-gray-500 truncate">· {emp.role}</span>
                      {linkedUsers[emp.id] && (
                        <span className="text-xs font-bold text-teal-400">
                          🔗 {linkedUsers[emp.id]}
                        </span>
                      )}
                      <span className="text-xs text-cyan-400 px-2 py-1 border border-cyan-400 rounded truncate">
                        จัดการงานเพื่อนร่วมทีมได้ (ยกเว้น %/สถานะ)
                      </span>
                    </div>
                  </div>
                  {canManageEmployees && (
                    <>
                      <select className="h-9 px-3 bg-gray-800 border border-gray-600 rounded text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500 flex-shrink-0" title="ผูกผู้เข้าร่วม">
                        <option value="">ไม่ผูก</option>
                        {employeeOptions.map((opt) => (
                          <option key={opt._id} value={opt._id}>
                            {opt.name} ({opt.role})
                          </option>
                        ))}
                      </select>
                      <select className="h-9 px-3 bg-gray-800 border border-gray-600 rounded text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500 flex-shrink-0">
                        <option value="lanes" defaultValue="lanes">
                          รูทีน+จิกปะทะ
                        </option>
                        <option value="queue">คิวงาน</option>
                      </select>
                      <div className="relative">
                        <button className="px-3 h-9 text-sm font-medium rounded transition-colors flex-shrink-0 bg-white hover:bg-gray-100 text-gray-800">
                          สิทธิ์
                        </button>
                      </div>
                      <button className="px-3 h-9 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors flex-shrink-0">
                        แก้ไข
                      </button>
                      <button className="px-3 h-9 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors flex-shrink-0">
                        ปิดใช้งาน
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
