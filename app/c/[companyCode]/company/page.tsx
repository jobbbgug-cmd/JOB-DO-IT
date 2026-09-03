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
  permissionLevel?: 'self' | 'all';
  isActive?: boolean;
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
  const [isHydrated, setIsHydrated] = useState(false);
  const [openPermissionsId, setOpenPermissionsId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState('');
  const [addRole, setAddRole] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [inviteLink, setInviteLink] = useState('');
  const [creatingLink, setCreatingLink] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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
          isActive: emp.isActive !== undefined ? emp.isActive : true,
          permissionLevel: emp.permissionLevel || 'self',
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
    <div className="space-y-4" suppressHydrationWarning>
      {/* Employees Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">พนักงาน</h2>
          {isHydrated && canManageEmployees && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm font-medium transition-colors"
            >
              ＋ เพิ่มพนักงาน
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">
          สร้างพนักงานได้อิสระ แล้วค่อยผูกกับผู้เข้าร่วม (บัญชี) ภายหลังถ้าต้องการ
        </p>

        {/* Add Employee Form */}
        {isHydrated && canManageEmployees && showAddForm && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-sm">เพิ่มพนักงานใหม่</h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setAddName('');
                  setAddRole('');
                  setSelectedColor(COLORS[0]);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col gap-1 flex-1 min-w-[160px] text-xs font-semibold text-gray-400">
                ชื่อ
                <input
                  placeholder="ชื่อพนักงาน"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                  type="text"
                />
              </label>
              <label className="flex flex-col gap-1 flex-1 min-w-[160px] text-xs font-semibold text-gray-400">
                ตำแหน่ง
                <input
                  placeholder="เช่น กราฟิก (ไม่บังคับ)"
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                  type="text"
                />
              </label>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-xs font-semibold text-gray-400">สี:</span>
              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-colors ${
                      selectedColor === color ? 'border-cyan-400' : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={async () => {
                  if (!addName.trim()) return;

                  try {
                    const response = await fetch(`/api/employees/${companyCode}`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: addName,
                        role: addRole,
                        color: selectedColor,
                        companyCode,
                      }),
                    });

                    if (response.ok) {
                      await fetchEmployees();
                      setShowAddForm(false);
                      setAddName('');
                      setAddRole('');
                      setSelectedColor(COLORS[0]);
                    }
                  } catch (error) {
                    console.error('Failed to add employee:', error);
                  }
                }}
                className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm font-medium transition-colors"
              >
                เพิ่มพนักงาน
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setAddName('');
                  setAddRole('');
                  setSelectedColor(COLORS[0]);
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        {/* Invite Section - Only for owners */}
        {isHydrated && canManageEmployees && (
          <div className="bg-teal-900/20 border border-teal-600 rounded-lg p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-white text-sm mb-1">เชิญสมาชิกเข้าร่วมบริษัท</h3>
              <p className="text-xs text-gray-400">
                ส่งลิงก์ให้เข้าสู่ระบบมาดูบอร์ดและอัปเดตงานเอง
              </p>
            </div>
            {inviteLink && (
              <div className="space-y-4 mb-4">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300 font-mono"
                      type="text"
                      value={inviteLink}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(inviteLink);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                        copied
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                      }`}
                    >
                      {copied ? '✓ คัดลอกแล้ว' : 'คัดลอก'}
                    </button>
                    <button
                      onClick={() => setInviteLink('')}
                      className="px-4 py-2 text-gray-400 hover:text-red-400 rounded text-sm transition-colors"
                    >
                      ยกเลิก
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    ใช้แล้ว 0 คน · {maxUses ? `${maxUses} คน` : 'ไม่จำกัด'} · ใช้ได้ถึง{' '}
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )}

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
              <button
                onClick={async () => {
                  setCreatingLink(true);
                  try {
                    const response = await fetch(`/api/invites/${companyCode}`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        maxUses: maxUses ? parseInt(maxUses) : null,
                      }),
                    });

                    if (response.ok) {
                      const data = await response.json();
                      setInviteLink(data.link);
                    }
                  } catch (error) {
                    console.error('Failed to create invite link:', error);
                  } finally {
                    setCreatingLink(false);
                  }
                }}
                disabled={creatingLink}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
              >
                {creatingLink ? 'กำลังสร้าง...' : 'สร้างลิงค์'}
              </button>
            </div>
          </div>
        )}

        {/* Employees List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-white text-sm">สมาชิกบริษัท</h3>
          <div className="space-y-2">
            {employees.map((emp) => (
              <div key={emp.id} className={`rounded-lg transition-opacity ${emp.isActive === false ? 'opacity-50 bg-gray-900' : ''}`}>
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
                      {emp.permissionLevel === 'all' && (
                        <span className="text-xs text-cyan-400 px-2 py-1 border border-cyan-400 rounded truncate">
                          จัดการงานเพื่อนร่วมทีมได้ (ยกเว้น %/สถานะ)
                        </span>
                      )}
                    </div>
                  </div>
                  {isHydrated && canManageEmployees && (
                    <>
                      <select
                        value={emp.userId || ''}
                        onChange={async (evt) => {
                          const userId = evt.target.value || null;
                          setSavingId(emp.id);

                          const updatedEmployees = employees.map(e =>
                            e.id === emp.id ? { ...e, userId } : e
                          );
                          setEmployees(updatedEmployees);

                          try {
                            const response = await fetch(
                              `/api/employees/${companyCode}/${emp.id}`,
                              {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId }),
                              }
                            );

                            if (!response.ok) {
                              console.error('Failed to link user:', response.status);
                              setSavingId(null);
                              await fetchEmployees();
                              return;
                            }

                            await fetchEmployees();
                            setSavingId(null);
                          } catch (error) {
                            console.error('Failed to link user:', error);
                            setSavingId(null);
                            await fetchEmployees();
                          }
                        }}
                        disabled={savingId === emp.id}
                        className={`h-9 px-3 bg-gray-800 border border-gray-600 rounded text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500 flex-shrink-0 ${
                          savingId === emp.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="ผูกผู้เข้าร่วม"
                      >
                        <option value="">ไม่ผูก</option>
                        {employeeOptions
                          .filter(opt => !employees.some(e => e.userId === opt._id && e.id !== emp.id))
                          .map((opt) => (
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
                        <button
                          onClick={() => setOpenPermissionsId(openPermissionsId === emp.id ? null : emp.id)}
                          className={`px-3 h-9 text-sm font-medium rounded transition-colors flex-shrink-0 ${
                            emp.permissionLevel === 'self'
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-400'
                              : 'bg-white hover:bg-gray-100 text-gray-800'
                          }`}
                        >
                          สิทธิ์
                        </button>

                        {openPermissionsId === emp.id && (
                          <div className="absolute right-0 mt-2 w-80 bg-slate-950 border border-gray-700 rounded-lg shadow-xl z-50 p-4 space-y-4">
                            <div className="text-xs text-gray-400">ทุกคนได้เท่ากันเสมอ ไม่ขึ้นกับตัวเลือกด้านล่าง</div>

                            <ul className="space-y-2 text-xs">
                              <li className="flex flex-col gap-2">
                                <span><b className="text-white">งานที่สร้างเอง และยังไม่ได้ยกให้ใคร</b></span>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-green-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                                    <span>เพิ่ม แก้ไข ลบ ลากย้าย ปรับ%/สถานะ ได้ทั้งหมด</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-red-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                                    <span>ยกให้เพื่อนร่วมทีม — ต้องมีสิทธิ์ระดับ "ทุกอย่าง" เท่านั้น</span>
                                  </div>
                                </div>
                              </li>
                              <li className="flex flex-col gap-2">
                                <span><b className="text-white">งานที่คนอื่นมอบมาให้ถือ</b></span>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-green-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                                    <span>ปรับ % ความคืบหน้า เปลี่ยนสถานะ</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-red-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                                    <span>แก้ไข ลบ ส่งต่อ (ระดับ "ทุกอย่าง" ทำได้)</span>
                                  </div>
                                </div>
                              </li>
                            </ul>

                            <div className="text-xs text-gray-400 mt-4">จัดการ "งานของเพื่อนร่วมทีม" ได้แค่ไหน</div>
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  const updated = employees.map(e =>
                                    e.id === emp.id ? { ...e, permissionLevel: 'all' as const } : e
                                  );
                                  setEmployees(updated);

                                  try {
                                    const response = await fetch(
                                      `/api/employees/${companyCode}/${emp.id}`,
                                      {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ permissionLevel: 'all' }),
                                      }
                                    );

                                    if (!response.ok) {
                                      console.error('Failed to save permission');
                                      await fetchEmployees();
                                    }
                                  } catch (error) {
                                    console.error('Failed to update permission:', error);
                                    await fetchEmployees();
                                  }
                                }}
                                className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-all border ${
                                  emp.permissionLevel === 'all'
                                    ? 'bg-cyan-600 text-white border-cyan-500 ring-1 ring-cyan-400'
                                    : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                                }`}
                              >
                                {emp.permissionLevel === 'all' && '✓ '}ทุกอย่าง
                              </button>
                              <button
                                onClick={async () => {
                                  const updated = employees.map(e =>
                                    e.id === emp.id ? { ...e, permissionLevel: 'self' as const } : e
                                  );
                                  setEmployees(updated);

                                  try {
                                    const response = await fetch(
                                      `/api/employees/${companyCode}/${emp.id}`,
                                      {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ permissionLevel: 'self' }),
                                      }
                                    );

                                    if (!response.ok) {
                                      console.error('Failed to save permission');
                                      await fetchEmployees();
                                    }
                                  } catch (error) {
                                    console.error('Failed to update permission:', error);
                                    await fetchEmployees();
                                  }
                                }}
                                className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-all border ${
                                  emp.permissionLevel === 'self'
                                    ? 'bg-gray-700 text-white border-gray-600 ring-1 ring-gray-500'
                                    : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                                }`}
                              >
                                {emp.permissionLevel === 'self' && '✓ '}เฉพาะตัวเอง
                              </button>
                            </div>

                            <ul className="space-y-2 text-xs">
                              <li className="flex flex-col gap-2">
                                <span><b className="text-white">ทุกอย่าง</b></span>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-green-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                                    <span>เพิ่ม แก้ไข ลบ ลากย้าย มอบหมาย (ทุกใบในทีมตัวเอง)</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-red-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                                    <span>ปรับ % / เปลี่ยนสถานะแทนคนอื่น</span>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          if (editingId === emp.id) {
                            setEditingId(null);
                            setEditName('');
                            setEditRole('');
                          } else {
                            setEditingId(emp.id);
                            setEditName(emp.name);
                            setEditRole(emp.role);
                          }
                        }}
                        className="px-3 h-9 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors flex-shrink-0"
                      >
                        {editingId === emp.id ? 'ยกเลิก' : 'แก้ไข'}
                      </button>
                      <button
                        onClick={async () => {
                          const newState = !emp.isActive;
                          const updated = employees.map(e =>
                            e.id === emp.id ? { ...e, isActive: newState } : e
                          );
                          setEmployees(updated);

                          try {
                            const response = await fetch(
                              `/api/employees/${companyCode}/${emp.id}`,
                              {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ isActive: newState }),
                              }
                            );

                            if (!response.ok) {
                              console.error('Failed to save isActive');
                              await fetchEmployees();
                            }
                          } catch (error) {
                            console.error('Failed to update isActive:', error);
                            await fetchEmployees();
                          }
                        }}
                        className="px-3 h-9 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors flex-shrink-0"
                      >
                        {emp.isActive === false ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </button>
                    </>
                  )}
                </div>

                {editingId === emp.id && (
                  <div className="flex flex-wrap gap-2 p-3 border-t border-gray-700">
                    <label className="flex flex-col gap-1 flex-1 min-w-[160px] text-xs font-semibold text-gray-400">
                      ชื่อ
                      <input
                        placeholder="ชื่อพนักงาน"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                        type="text"
                      />
                    </label>
                    <label className="flex flex-col gap-1 flex-1 min-w-[160px] text-xs font-semibold text-gray-400">
                      ตำแหน่ง
                      <input
                        placeholder="เช่น กราฟิก (ไม่บังคับ)"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                        type="text"
                      />
                    </label>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(
                            `/api/employees/${companyCode}/${emp.id}`,
                            {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                name: editName,
                                role: editRole,
                              }),
                            }
                          );

                          if (response.ok) {
                            const updated = await response.json();
                            setEmployees(
                              employees.map(e =>
                                e.id === emp.id
                                  ? { ...e, name: updated.name, role: updated.role }
                                  : e
                              )
                            );
                            setEditingId(null);
                            setEditName('');
                            setEditRole('');
                          }
                        } catch (error) {
                          console.error('Failed to save employee:', error);
                        }
                      }}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium rounded transition-colors h-10 self-end"
                    >
                      บันทึก
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
