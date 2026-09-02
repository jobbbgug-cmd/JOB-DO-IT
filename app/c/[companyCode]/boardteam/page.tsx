'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';
import axios from 'axios';

interface Team {
  id: string;
  name: string;
  description?: string | null;
  memberCount: number;
  isDefault: boolean;
}

export default function TeamBoard() {
  const router = useRouter();
  const params = useParams();
  const companyCode = params.companyCode as string;
  const { user } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!storedToken) {
      router.push('/login');
    } else {
      setIsHydrated(true);
      fetchTeams();
    }
  }, [router, companyCode]);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`/api/company/${companyCode}/teams`);
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamForm.name.trim()) {
      alert('กรุณากรอกชื่อทีม');
      return;
    }

    setSubmitting(true);
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
      setSubmitting(false);
    }
  };

  if (!isHydrated || loading) {
    return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  }

  return (
    <div className="relative w-full">
      {/* Stage Content */}
      <div className="pb-20">
        {/* Team Overview Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">ทีมทั้งหมด</h1>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs sm:text-sm transition-colors flex-shrink-0 min-h-[32px] whitespace-nowrap"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              เพิ่มทีม
            </button>
          </div>
          <p className="text-sm text-gray-500">
            เลือกทีมที่อยากดูงาน แล้วกดเข้าไปที่การ์ดทีม
          </p>
        </div>

        {/* Team Grid */}
        {teams.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="mb-4">ยังไม่มีทีม</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => router.push(`/c/${companyCode}/team/${team.id}`)}
                className="text-left border border-gray-700 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors p-4 group"
              >
                {/* Team Card Head */}
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="font-semibold text-white text-lg truncate">
                    {team.name}
                  </span>
                  {team.isDefault && (
                    <span className="text-xs font-bold text-cyan-400 whitespace-nowrap">
                      ทีมเริ่มต้น
                    </span>
                  )}
                </div>

                {/* Description */}
                {team.description && (
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {team.description}
                  </p>
                )}

                {/* Members */}
                <div className="text-xs text-gray-500 mb-4">
                  {team.memberCount === 0 ? (
                    <p>ยังไม่มีสมาชิกในทีมนี้</p>
                  ) : (
                    <p>สมาชิก {team.memberCount} คน</p>
                  )}
                </div>

                {/* Footer */}
                <div className="text-cyan-400 text-sm font-medium group-hover:text-cyan-300 transition-colors">
                  เปิดบอร์ดทีม <span aria-hidden="true">→</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h1 className="text-2xl font-bold text-white mb-2">สร้างทีมใหม่</h1>
            <p className="text-gray-400 mb-6 text-sm">
              ตั้งชื่อทีม แล้วเขียนสั้น ๆ ว่าทีมนี้ดูแลอะไร
            </p>

            <div className="space-y-4">
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
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-2">
                  รายละเอียดทีม{' '}
                  <span className="text-gray-500 font-normal">(ไม่บังคับ)</span>
                </label>
                <textarea
                  rows={4}
                  maxLength={500}
                  placeholder="ทีมนี้ทำอะไร ดูแลงานส่วนไหน…"
                  value={teamForm.description}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-vertical text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setTeamForm({ name: '', description: '' });
                }}
                className="px-4 py-2 text-gray-400 hover:text-gray-300 rounded transition-colors text-sm"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCreateTeam}
                disabled={submitting || !teamForm.name.trim()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-medium transition-colors text-sm"
              >
                {submitting ? 'สร้าง...' : 'สร้างทีม'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
