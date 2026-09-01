'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Team {
  id: string;
  name: string;
  description?: string | null;
  memberCount: number;
}

interface TeamMember {
  id: string;
  name: string;
  role?: string;
  x?: number;
  y?: number;
}

export default function TeamBoardPage() {
  const router = useRouter();
  const params = useParams();
  const companyCode = params.companyCode as string;
  const teamId = params.teamId as string;
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!storedToken) {
      router.push('/login');
    } else {
      fetchTeamData();
    }
  }, [router, companyCode, teamId]);

  const fetchTeamData = async () => {
    try {
      // Fetch team info from the teams API
      const teamsResponse = await fetch(`/api/company/${companyCode}/teams`);
      if (teamsResponse.ok) {
        const teams = await teamsResponse.json();
        console.log('Teams fetched:', teams);
        console.log('Looking for teamId:', teamId);
        const currentTeam = teams.find((t: Team) => t.id === teamId);
        console.log('Found team:', currentTeam);
        if (currentTeam) {
          setTeam(currentTeam);
        } else {
          console.warn('Team not found');
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch team data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!team) {
    return <div className="flex items-center justify-center h-screen">Team not found</div>;
  }

  return (
    <div className="fixed inset-0 bg-gray-950">
      {/* Team Bar - Floating Top Left */}
      <div className="fixed top-20 left-4 flex items-center gap-3 z-50">
        <button
          onClick={() => router.push(`/c/${companyCode}/boardteam`)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 bg-gray-700/60 hover:bg-gray-700/80 transition-colors rounded-lg font-medium"
        >
          <span aria-hidden="true">←</span> ทุกทีม
        </button>
        <span className="text-base font-semibold text-white">
          {team?.name || 'Team'}
        </span>
      </div>

      {/* Add Employee Button - Floating */}
      <button
        onClick={() =>
          router.push(`/c/${companyCode}/company/employees?team=${teamId}`)
        }
        className="fixed left-4 top-44 px-6 py-8 text-gray-400 hover:text-white transition-colors rounded-lg border-2 border-dashed border-gray-600 hover:border-gray-500 flex flex-col items-center gap-3 bg-transparent hover:bg-gray-900/20 z-40"
        style={{
          width: '336px',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8"
        >
          <path d="M12 5v14M5 12h14"></path>
        </svg>
        <span className="text-sm font-medium">เพิ่มพนักงาน</span>
      </button>

      {/* Canvas Area */}
      <div className="absolute inset-0 overflow-auto relative">

        <div
          className="relative w-full h-full"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: '0 0',
            transition: 'transform 0.1s',
          }}
        >
          {/* Team Members - to be implemented */}
          {members.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-600"></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
