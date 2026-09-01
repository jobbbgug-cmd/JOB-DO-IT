'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';

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

  if (!isHydrated || loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">บอร์ดทีม</h1>
        <p className="text-gray-400 mt-2">เลือกทีมเพื่อดูบอร์ด</p>
      </div>

      {teams.length === 0 ? (
        <div className="text-center text-gray-400">
          <p>ยังไม่มีทีม</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => router.push(`/c/${companyCode}/team/${team.id}`)}
              className="text-left border border-gray-700 rounded-lg p-4 bg-gray-800/30 hover:bg-gray-800/50 transition-colors group"
            >
              <div className="mb-3">
                <h3 className="font-semibold text-white text-lg group-hover:text-cyan-400 transition-colors">
                  {team.name}
                </h3>
                {team.isDefault && (
                  <span className="text-xs font-bold text-cyan-400 inline-block mt-1">
                    ทีมเริ่มต้น
                  </span>
                )}
              </div>

              {team.description && (
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {team.description}
                </p>
              )}

              <div className="text-xs text-gray-500 mb-4">
                {team.memberCount === 0 ? (
                  <p>ยังไม่มีสมาชิกในทีมนี้</p>
                ) : (
                  <p>สมาชิก {team.memberCount} คน</p>
                )}
              </div>

              <div className="text-cyan-400 text-sm font-medium group-hover:text-cyan-300 transition-colors">
                เปิดบอร์ดทีม <span aria-hidden="true">→</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
