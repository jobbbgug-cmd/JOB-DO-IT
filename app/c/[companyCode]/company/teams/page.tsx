'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/app/store/authStore';

interface Employee {
  id: string;
  name: string;
  userId?: string;
  color?: string;
  role?: string;
}

interface Team {
  id: string;
  name: string;
  description?: string | null;
  memberCount: number;
  isDefault: boolean;
}

export default function TeamsPage() {
  const params = useParams();
  const router = useRouter();
  const companyCode = params.companyCode as string;
  const { user } = useAuthStore();
  const canManageTeams = user?.role === 'owner';
  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchTeams();
    fetchEmployees();
  }, [companyCode]);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`/api/company/${companyCode}/teams`);
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`/api/employees/${companyCode}`);
      if (response.ok) {
        const data = await response.json();
        const transformed = data.map((emp: any) => ({
          ...emp,
          id: emp.id || emp._id,
        }));
        setEmployees(transformed);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamForm.name.trim()) {
      alert('กรุณากรอกชื่อทีม');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`/api/company/${companyCode}/teams`, {
        name: teamForm.name,
        description: teamForm.description || null,
      });
      if (response.data.success) {
        setTeams([...teams, response.data.team]);
        setShowModal(false);
        setTeamForm({ name: '', description: '' });
      }
    } catch (error) {
      console.error('Failed to create team:', error);
      alert('สร้างทีมไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Teams Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">ทีม</h2>
          <p className="text-xs text-gray-500">
            จัดกลุ่มพนักงานเป็นทีม — บอร์ดทีมของแต่ละคนจะแสดงเฉพาะเพื่อนร่วมทีม (เจ้าของบริษัทเห็นทุกคน)
          </p>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="border border-gray-700 rounded-lg p-4 bg-gray-800/30 hover:bg-gray-800/50 transition-colors cursor-pointer flex flex-col"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{team.name}</h3>
                  {team.isDefault && (
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded flex-shrink-0">
                      ทีมเริ่มต้น
                    </span>
                  )}
                </div>
                {canManageTeams && (
                  <div className="flex gap-2 text-xs flex-shrink-0">
                    <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                      แก้ไขสมาชิก
                    </button>
                    <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                      แก้ไข
                    </button>
                    {!team.isDefault && (
                      <button className="text-red-400 hover:text-red-300 transition-colors">
                        ลบทีม
                      </button>
                    )}
                  </div>
                )}
              </div>

              {team.description && (
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                  {team.description}
                </p>
              )}

              <div className="flex-grow mb-3">
                {team.isDefault ? (
                  // Default team - show linked employees
                  (() => {
                    const linkedMembers = employees.filter(emp => emp.userId);
                    return linkedMembers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {linkedMembers.map(member => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 bg-gray-700/50 rounded px-2 py-1"
                          >
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                              style={{ backgroundColor: member.color || '#0E9384' }}
                            >
                              {member.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-xs text-gray-300">{member.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">ยังไม่มีสมาชิกในทีมนี้</p>
                    );
                  })()
                ) : (
                  // Other teams - show member count
                  <div className="text-xs text-gray-500">
                    {team.memberCount === 0 ? (
                      <p>ยังไม่มีสมาชิกในทีมนี้</p>
                    ) : (
                      <p>สมาชิก {team.memberCount} คน</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Team Button - Only for owners */}
        {canManageTeams && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
          >
            + เพิ่มทีม
          </button>
        )}
      </div>

      {/* Create Team Modal - Only for owners */}
      {showModal && canManageTeams && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full space-y-4">
            <h1 className="text-xl font-bold text-white">สร้างทีมใหม่</h1>
            <p className="text-sm text-gray-400">
              ตั้งชื่อทีม แล้วเขียนสั้น ๆ ว่าทีมนี้ดูแลอะไร
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-2">
                  ชื่อทีม
                </label>
                <input
                  type="text"
                  maxLength={80}
                  placeholder="เช่น กราฟิก, การตลาด, บัญชี"
                  value={teamForm.name}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-2">
                  รายละเอียดทีม{' '}
                  <span className="text-gray-500">(ไม่บังคับ)</span>
                </label>
                <textarea
                  rows={4}
                  maxLength={500}
                  placeholder="ทีมนี้ทำอะไร ดูแลงานส่วนไหน…"
                  value={teamForm.description}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-vertical"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setTeamForm({ name: '', description: '' });
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCreateTeam}
                disabled={loading || !teamForm.name.trim()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
              >
                {loading ? 'สร้าง...' : 'สร้างทีม'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
