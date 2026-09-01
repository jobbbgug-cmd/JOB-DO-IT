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
  });

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
      <div>
        <h1 className="text-3xl font-bold text-white">โปรเจค</h1>
        <p className="text-gray-400 mt-2">รวมโปรเจคของบริษัท · กดที่การ์ดเพื่อดูผู้ถือและงานข้างใน</p>
      </div>

      {showCreateForm && (
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-400 block mb-2">ชื่อโปรเจค</label>
            <input
              type="text"
              placeholder="เช่น Website Redesign"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-400 block mb-2">รายละเอียด (ไม่บังคับ)</label>
            <textarea
              placeholder="รายละเอียดโปรเจค..."
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-vertical"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateProject}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
            >
              สร้างโปรเจค
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewProject({ name: '', description: '' });
              }}
              className="px-4 py-2 text-gray-400 hover:text-gray-300 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/20 border border-gray-700 rounded-lg">
          <p className="text-gray-400 mb-4">ยังไม่มีโปรเจค</p>
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
            >
              + โปรเจคใหม่
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
          >
            + โปรเจคใหม่
          </button>

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
        </div>
      )}
    </div>
  );
}
