'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/app/store/authStore';

interface Employee {
  id: string;
  name: string;
  role: string;
  presence: boolean;
  color?: string;
  enabled?: boolean;
}

interface InviteLink {
  id: string;
  code: string;
  url: string;
  usedCount: number;
  maxUses: number | null;
  expiresAt: string;
}

interface CompanyMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'member';
  enabled: boolean;
  color?: string;
}

interface EmployeeOption {
  _id: string;
  name: string;
  userId?: string;
  role?: string;
}

const COLORS = [
  '#0E9384',
  '#E4572E',
  '#5B7FB0',
  '#B4479A',
  '#C98A0E',
  '#3F6E4B',
  '#8A5CF6',
  '#D2504F',
];

export default function EmployeesPage() {
  const params = useParams();
  const router = useRouter();
  const companyCode = params.companyCode as string;
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([]);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [maxUses, setMaxUses] = useState('');
  const [inviteCopied, setInviteCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    role: '',
    color: COLORS[0],
  });
  const [openPermissionsId, setOpenPermissionsId] = useState<string | null>(null);
  const [permissionsScope, setPermissionsScope] = useState<'self' | 'all'>('all');
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', role: '' });
  const [linkedUsers, setLinkedUsers] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchEmployees();
    fetchEmployeeOptions();
    fetchMembers();
  }, [companyCode]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        console.log('Loaded user from localStorage:', userData);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }, []);

  // Populate linked users when employeeOptions load
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

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/company/${companyCode}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`/api/employees/${companyCode}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched employees:', data);
        const transformed = data.map((emp: any) => ({
          ...emp,
          id: emp.id || emp._id,
          userId: emp.userId,
        }));
        setEmployees(transformed);

        // Load linked users from employees that have userId
        const linked: { [key: string]: string } = {};
        data.forEach((emp: any) => {
          if (emp.userId) {
            const linkedEmployee = employeeOptions.find(opt => opt._id === emp.userId);
            if (linkedEmployee) {
              linked[emp.id || emp._id] = linkedEmployee.name;
            }
          }
        });
        setLinkedUsers(linked);
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

  const handleCreateInviteLink = async () => {
    setLoading(true);
    try {
      console.log('Raw maxUses state:', maxUses, 'Type:', typeof maxUses);
      const maxUsesValue = maxUses ? parseInt(maxUses, 10) : null;
      console.log('Parsed maxUsesValue:', maxUsesValue, 'Type:', typeof maxUsesValue);

      const payload = {
        companyCode,
        maxUses: maxUsesValue,
      };
      console.log('Request payload:', JSON.stringify(payload));

      const response = await axios.post('/api/invite/create', payload);

      console.log('Full API Response:', JSON.stringify(response.data));
      const newLink = response.data.inviteLink;
      console.log('Extracted newLink:', JSON.stringify(newLink));

      setInviteLinks([...inviteLinks, newLink]);
      setMaxUses('');
    } catch (error: any) {
      console.error('Failed to create invite link:', error.response?.data || error.message);
      alert('สร้างลิงค์เชิญไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUsageText = (usedCount: number, maxUses: number | null | undefined) => {
    if (maxUses) {
      return `ใช้แล้ว ${usedCount}/${maxUses} คน`;
    }
    return `ใช้แล้ว ${usedCount} คน · ไม่จำกัด`;
  };

  const handleToggleEmployeeStatus = (empId: string, currentStatus: boolean) => {
    setEmployees(employees.map(emp =>
      emp.id === empId ? { ...emp, enabled: !currentStatus } : emp
    ));
    console.log(`Employee ${empId} toggled to ${!currentStatus}`);
  };

  const handleAddEmployee = async () => {
    if (!employeeForm.name.trim()) {
      alert('กรุณากรอกชื่อพนักงาน');
      return;
    }

    try {
      const response = await axios.post('/api/employees/add', {
        companyCode,
        name: employeeForm.name,
        role: employeeForm.role || null,
        color: employeeForm.color,
      });

      if (response.data.success) {
        setEmployees([...employees, response.data.employee]);
        setEmployeeForm({ name: '', role: '', color: COLORS[0] });
        setShowAddEmployeeForm(false);
      }
    } catch (error) {
      console.error('Failed to add employee:', error);
      alert('เพิ่มพนักงานไม่สำเร็จ');
    }
  };

  const handleLinkUser = async (employeeId: string, userId: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await axios.put(`/api/employees/${companyCode}/${employeeId}`, { userId: userId || null }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // Update employees state immediately
      setEmployees(employees.map(emp =>
        emp.id === employeeId ? { ...emp, userId: userId || null } : emp
      ));

      // Update linked users
      if (userId) {
        const linkedEmployee = employeeOptions.find(opt => opt._id === userId);
        if (linkedEmployee) {
          setLinkedUsers({ ...linkedUsers, [employeeId]: linkedEmployee.name });
        }
      } else {
        const newLinked = { ...linkedUsers };
        delete newLinked[employeeId];
        setLinkedUsers(newLinked);
      }
    } catch (error) {
      console.error('Failed to link user:', error);
      alert('ผูกผู้ใช้ไม่สำเร็จ');
    }
  };

  return (
    <div className="space-y-8">
      {/* Employees Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">พนักงาน</h2>
          <button
            onClick={() => setShowAddEmployeeForm(!showAddEmployeeForm)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm font-medium transition-colors"
          >
            ＋ เพิ่มพนักงาน
          </button>
        </div>

        <p className="text-xs text-gray-500">
          สร้างพนักงานได้อิสระ แล้วค่อยผูกกับผู้เข้าร่วม (บัญชี) ภายหลังถ้าต้องการ
        </p>


      {/* Invite Section */}
      <div className="bg-teal-900/20 border border-teal-600 rounded-lg p-6">
        <div className="mb-6">
          <h3 className="font-semibold text-white text-sm mb-1">เชิญสมาชิกเข้าร่วมบริษัท</h3>
          <p className="text-xs text-gray-400">
            ส่งลิงก์ให้เข้าสู่ระบบมาดูบอร์ดและอัปเดตงานเอง
          </p>
        </div>

        {inviteLinks.length > 0 && (
          <div className="space-y-4 mb-4">
            {inviteLinks.map((link) => (
              <div key={link.id} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={link.url}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300 font-mono"
                  />
                  <button
                    onClick={() => handleCopyLink(link.url)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    {inviteCopied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                  </button>
                  <button
                    onClick={() => setInviteLinks(inviteLinks.filter(l => l.id !== link.id))}
                    className="px-4 py-2 text-gray-400 hover:text-red-400 rounded text-sm transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  {getUsageText(link.usedCount, link.maxUses)} · ใช้ได้ถึง {formatDate(link.expiresAt)}
                </p>
              </div>
            ))}
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
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d+$/.test(val)) {
                  setMaxUses(val);
                }
              }}
              className="w-16 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white text-center"
            />
            คน (เว้นว่าง = ไม่จำกัด)
          </label>
          <button
            onClick={handleCreateInviteLink}
            disabled={loading}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
          >
            {loading ? 'สร้าง...' : 'สร้างลิงค์'}
          </button>
        </div>
      </div>

      {/* Company Members Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-white text-sm">สมาชิกบริษัท</h3>

        {/* Employees List */}
<div className="space-y-2">
          {employees.map((emp, idx) => (
            <div
              key={emp.id || idx}
              className={`rounded-lg ${emp.enabled === false ? 'opacity-50 bg-slate-950/40' : ''}`}
            >
              <div className="flex items-center gap-2 p-3 flex-wrap">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                style={{ backgroundColor: emp.color || '#0E9384' }}
              >
                {emp.name.substring(0, 2).toUpperCase()}
              </div>

              <div className="flex-1 min-w-[100px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-white text-sm truncate">{emp.name}</span>
                  {emp.role && <span className="text-xs text-gray-500 truncate">· {emp.role}</span>}
                  {linkedUsers[emp.id] && (
                    <span className="text-xs font-bold" style={{ color: 'var(--routine-ink, #0E9384)' }} title={`ผูกกับ ${linkedUsers[emp.id]}`}>
                      🔗 {linkedUsers[emp.id]}
                    </span>
                  )}
                  {permissionsScope === 'all' && (
                    <span className="text-xs text-cyan-400 px-2 py-1 border border-cyan-400 rounded truncate">จัดการงานเพื่อนร่วมทีมได้ (ยกเว้น %/สถานะ)</span>
                  )}
                </div>
              </div>

              <select
                className="h-9 px-3 bg-gray-800 border border-gray-600 rounded text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500 flex-shrink-0"
                title="ผูกผู้เข้าร่วม"
                value={emp.userId || ''}
                onChange={(e) => handleLinkUser(emp.id, e.target.value)}
              >
                <option value="">ไม่ผูก</option>
                {employeeOptions.map(opt => (
                  <option key={opt._id} value={opt._id}>
                    {opt.name} {opt.role ? `(${opt.role})` : ''}
                  </option>
                ))}
              </select>

              <select
                defaultValue="lanes"
                className="h-9 px-3 bg-gray-800 border border-gray-600 rounded text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500 flex-shrink-0"
              >
                <option value="lanes">รูทีน+จิกปะทะ</option>
                <option value="queue">คิวงาน</option>
              </select>

              <div className="relative">
                <button
                  onClick={() => setOpenPermissionsId(openPermissionsId === emp.id ? null : emp.id)}
                  className={`px-3 h-9 text-sm font-medium rounded transition-colors flex-shrink-0 ${
                    permissionsScope === 'all'
                      ? 'bg-white hover:bg-gray-100 text-gray-800'
                      : 'bg-gray-800 hover:bg-gray-700 text-white'
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
                        onClick={() => setPermissionsScope('self')}
                        className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
                          permissionsScope === 'self'
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        เฉพาะตัวเอง
                      </button>
                      <button
                        onClick={() => setPermissionsScope('all')}
                        className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
                          permissionsScope === 'all'
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        ทุกอย่าง
                      </button>
                    </div>

                    <ul className="space-y-2 text-xs">
                      {permissionsScope === 'self' && (
                        <li className="flex flex-col gap-2">
                          <span><b className="text-white">เฉพาะตัวเอง</b></span>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-red-400">
                              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                              <span>เพิ่ม แก้ไข ลบ ลากย้าย มอบหมาย ปรับ%/สถานะ</span>
                            </div>
                          </div>
                        </li>
                      )}
                      {permissionsScope === 'all' && (
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
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (editingEmployeeId === emp.id) {
                    setEditingEmployeeId(null);
                    setEditForm({ name: '', role: '' });
                  } else {
                    setEditingEmployeeId(emp.id);
                    setEditForm({ name: emp.name, role: emp.role || '' });
                  }
                }}
                className="px-3 h-9 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors flex-shrink-0"
              >
                {editingEmployeeId === emp.id ? 'ยกเลิก' : 'แก้ไข'}
              </button>

              <button
                onClick={() => handleToggleEmployeeStatus(emp.id, emp.enabled !== false)}
                className="px-3 h-9 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors flex-shrink-0"
              >
                {emp.enabled === false ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
              </button>
              </div>

              {editingEmployeeId === emp.id && (
                <div className="flex flex-wrap gap-2 p-3">
                  <label className="flex flex-col gap-1 flex-1 min-w-[160px] text-xs font-semibold text-gray-400">
                    ชื่อ
                    <input
                      type="text"
                      placeholder="ชื่อพนักงาน"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </label>
                  <label className="flex flex-col gap-1 flex-1 min-w-[160px] text-xs font-semibold text-gray-400">
                    ตำแหน่ง
                    <input
                      type="text"
                      placeholder="เช่น กราฟิก (ไม่บังคับ)"
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </label>
                  <button
                    onClick={() => {
                      console.log('บันทึก:', editForm);
                      setEditingEmployeeId(null);
                      setEditForm({ name: '', role: '' });
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


        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 bg-gray-800/30 border border-gray-700 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: member.color || '#0E9384' }}
              >
                {member.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-white text-sm">{member.name}</span>
                  <span className="text-xs text-gray-500">
                    · {member.role === 'owner' ? 'เจ้าของ' : 'สมาชิก'}
                  </span>
                  {member.enabled ? (
                    <span className="text-xs text-green-400">✓ ใช้งาน</span>
                  ) : (
                    <span className="text-xs text-gray-500">ปิดใช้งาน</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 truncate">{member.email}</div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors">
                  แก้ไข
                </button>
                <button className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors">
                  {member.enabled ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Employee Form - Below Invite Section */}
      {showAddEmployeeForm && (
        <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/30 space-y-3">
          <div className="flex flex-wrap gap-4">
            <label className="flex-1 min-w-[160px] flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-400">ชื่อ</span>
              <input
                type="text"
                placeholder="ชื่อพนักงาน"
                value={employeeForm.name}
                onChange={(e) =>
                  setEmployeeForm({ ...employeeForm, name: e.target.value })
                }
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </label>
            <label className="flex-1 min-w-[160px] flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-400">ตำแหน่ง</span>
              <input
                type="text"
                placeholder="เช่น กราฟิก (ไม่บังคับ)"
                value={employeeForm.role}
                onChange={(e) =>
                  setEmployeeForm({ ...employeeForm, role: e.target.value })
                }
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-400">สี</span>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() =>
                    setEmployeeForm({ ...employeeForm, color })
                  }
                  className={`w-8 h-8 rounded-md transition-all ${
                    employeeForm.color === color
                      ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-cyan-400 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`เลือกสี ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleAddEmployee}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded transition-colors"
            >
              เพิ่มพนักงาน
            </button>
            <button
              onClick={() => {
                setShowAddEmployeeForm(false);
                setEmployeeForm({ name: '', role: '', color: COLORS[0] });
              }}
              className="px-4 py-2 text-gray-400 hover:text-gray-300 text-sm transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
