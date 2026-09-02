'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived' | 'planning';
  taskCount: number;
  memberCount: number;
}

export default function ProjectsPage() {
  const router = useRouter();
  const params = useParams();
  const companyCode = params.companyCode as string;
  const { user } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    type: 'routine',
    color: '#0E9384',
  });

  const PROJECT_COLORS = [
    '#0E9384',
    '#E4572E',
    '#5B7FB0',
    '#B4479A',
    '#C98A0E',
    '#3F6E4B',
    '#8A5CF6',
    '#D2504F',
  ];

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!storedToken) {
      router.push('/login');
    } else {
      setIsHydrated(true);
      fetchProjects();
    }
  }, [router]);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`/api/projects/${companyCode}`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      alert('กรุณากรอกชื่อโปรเจค');
      return;
    }

    try {
      const response = await fetch(`/api/projects/${companyCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProject.name,
          description: newProject.description || null,
        }),
      });

      if (response.ok) {
        const created = await response.json();
        setProjects([...projects, created.project]);
        setNewProject({ name: '', description: '' });
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('สร้างโปรเจคไม่สำเร็จ');
    }
  };

  if (!isHydrated || loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">โปรเจค</h1>
          <p className="text-gray-400 text-sm mt-2">รวมโปรเจคของบริษัท · กดที่การ์ดเพื่อดูผู้ถือและงานข้างใน</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors flex-shrink-0 min-h-[40px] whitespace-nowrap"
        >
          + โปรเจคใหม่
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 pt-48">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md space-y-4">
            <input
              type="text"
              placeholder="ชื่อโปรเจค เช่น รีแบรนด์ปี 2026"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
            />

            <textarea
              placeholder="รายละเอียดสั้น ๆ (ไม่บังคับ)"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none text-sm"
              rows={3}
            />

            {/* Project Type */}
            <div className="flex gap-2">
              <button
                onClick={() => setNewProject({ ...newProject, type: 'routine' })}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  newProject.type === 'routine'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#0E9384' }}></span>
                รูทีน
              </button>
              <button
                onClick={() => setNewProject({ ...newProject, type: 'urgent' })}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  newProject.type === 'urgent'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#E4572E' }}></span>
                จิกปะทะ
              </button>
            </div>

            {/* Color Picker */}
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-2">สี</label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewProject({ ...newProject, color })}
                    className={`w-8 h-8 rounded-lg transition-transform ${
                      newProject.color === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={`เลือกสี ${color}`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">ช่วงวันทำงานตั้งได้หลังสร้าง — กางการ์ดโปรเจคแล้วกด "ช่วงวันทำงาน"</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCreateProject}
                className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors text-sm"
              >
                สร้างโปรเจค
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewProject({ name: '', description: '', type: 'routine', color: '#0E9384' });
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors text-sm"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/20 border border-gray-700 rounded-lg">
          <p className="text-gray-400 mb-4">ยังไม่มีโปรเจค — กด "โปรเจคใหม่" เพื่อเริ่ม</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => router.push(`/c/${companyCode}/projects/${project.id}`)}
              className="text-left border border-gray-700 rounded-lg p-4 bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
            >
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                {project.description && (
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{project.description}</p>
                )}
              </div>

              <div className="flex gap-4 text-xs text-gray-500">
                <span>📋 {project.taskCount} งาน</span>
                <span>👥 {project.memberCount} คน</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
