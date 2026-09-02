'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Note {
  id: string;
  title: string;
  content: string;
  links?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

const NOTE_COLORS = [
  { name: 'default', bg: 'bg-yellow-200', rgb: 'rgb(254, 243, 160)' },
  { name: 'peach', bg: 'bg-orange-200', rgb: 'rgb(255, 217, 168)' },
  { name: 'pink', bg: 'bg-pink-200', rgb: 'rgb(255, 201, 214)' },
  { name: 'purple', bg: 'bg-purple-200', rgb: 'rgb(226, 207, 250)' },
  { name: 'blue', bg: 'bg-blue-200', rgb: 'rgb(197, 231, 250)' },
  { name: 'green', bg: 'bg-green-200', rgb: 'rgb(204, 237, 180)' },
];

export default function NotesPage() {
  const router = useRouter();
  const params = useParams();
  const companyCode = params.companyCode as string;
  const [isHydrated, setIsHydrated] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    links: '',
    color: NOTE_COLORS[2].rgb,
  });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
    } else {
      setIsHydrated(true);
      fetchNotes();
    }
  }, [router]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/notes/${companyCode}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };

  const handleCreateNote = async () => {
    if (!formData.title.trim()) {
      alert('กรุณาใส่ชื่อโน้ต');
      return;
    }

    console.log('Before create - formData:', formData);

    try {
      const response = await fetch(`/api/notes/${companyCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          links: formData.links,
          color: formData.color,
        }),
      });

      if (response.ok) {
        const created = await response.json();
        console.log('Created note from API:', created);
        setNotes([...notes, created]);
        setShowCreateModal(false);
        setFormData({
          title: '',
          content: '',
          links: '',
          color: NOTE_COLORS[2].rgb,
        });
      } else {
        alert('เซิร์ฟเวอร์ตอบกลับข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Failed to create note:', error);
      alert('สร้างโน้ตไม่สำเร็จ');
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote) return;

    if (!formData.title.trim()) {
      alert('กรุณาใส่ชื่อโน้ต');
      return;
    }

    console.log('Before update - formData:', formData);

    try {
      const response = await fetch(`/api/notes/${companyCode}/${editingNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          links: formData.links,
          color: formData.color,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        console.log('Updated note from API:', updated);
        setNotes(notes.map(n => n.id === editingNote.id ? updated : n));
        setEditingNote(null);
        setFormData({
          title: '',
          content: '',
          links: '',
          color: NOTE_COLORS[2].rgb,
        });
      } else {
        alert('เซิร์ฟเวอร์ตอบกลับข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      alert('แก้ไขโน้ตไม่สำเร็จ');
    }
  };

  const handleDeleteNote = async (noteId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('แน่ใจหรือว่าต้องการลบโน้ตนี้?')) return;

    try {
      await fetch(`/api/notes/${companyCode}/${noteId}`, {
        method: 'DELETE',
      });
      setNotes(notes.filter(n => n.id !== noteId));
      if (editingNote?.id === noteId) {
        setEditingNote(null);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isHydrated) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-900 rounded-lg font-medium text-sm transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4"
          >
            <path d="M12 5v14M5 12h14"></path>
          </svg>
          โน้ตใหม่
        </button>

        <input
          type="search"
          placeholder="ค้นหาโน้ต…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 w-64 text-sm"
        />
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>ไม่มีโน้ต</p>
          <p className="text-sm text-gray-500 mt-1">กดปุ่ม "โน้ตใหม่" เพื่อสร้างโน้ต</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => {
                setEditingNote(note);
                setFormData({
                  title: note.title,
                  content: note.content,
                  links: note.links || '',
                  color: note.color || NOTE_COLORS[2].rgb,
                });
              }}
              className="relative rounded-lg shadow-md p-4 min-h-[200px] group hover:shadow-lg transition-shadow cursor-pointer"
              style={{ backgroundColor: note.color || NOTE_COLORS[2].rgb }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-sm flex-1 break-words" style={{ color: 'rgb(15, 23, 42)' }}>
                  {note.title}
                </h3>
                <button
                  onClick={(e) => handleDeleteNote(note.id, e)}
                  className="p-1.5 rounded hover:bg-red-500/20 text-red-600 hover:text-red-700 transition-colors"
                  title="ลบ"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M18 6 6 18M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {note.content && (
                <p className="text-xs mb-3 whitespace-pre-wrap break-words" style={{ color: 'rgb(15, 23, 42)' }}>
                  {note.content}
                </p>
              )}

              {note.links && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {note.links.split('\n').map((link, idx) => {
                    const trimmedLink = link.trim();
                    if (!trimmedLink) return null;
                    try {
                      const url = new URL(trimmedLink);
                      const domain = url.hostname.replace('www.', '');
                      return (
                        <a
                          key={idx}
                          href={trimmedLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-200 border border-gray-400 hover:bg-gray-300 transition-colors flex-shrink-0"
                          title={trimmedLink}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0 text-gray-600">
                            <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"></path>
                            <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"></path>
                          </svg>
                          <span className="text-xs font-medium text-gray-700">{domain.substring(0, 20)}</span>
                        </a>
                      );
                    } catch {
                      return (
                        <a
                          key={idx}
                          href={trimmedLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-200 border border-gray-400 hover:bg-gray-300 transition-colors flex-shrink-0"
                          title={trimmedLink}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0 text-gray-600">
                            <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"></path>
                            <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"></path>
                          </svg>
                          <span className="text-xs font-medium text-gray-700">{trimmedLink.substring(0, 20)}</span>
                        </a>
                      );
                    }
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">โน้ต</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M18 6 6 18M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">ชื่อ</label>
              <input
                type="text"
                placeholder="ชื่อโน้ต เช่น รหัส Wi-Fi ออฟฟิศ"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">รายละเอียด</label>
              <textarea
                placeholder="จดไว้กันลืม…"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm resize-none"
              />
            </div>

            {/* Links */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">ลิงก์ (บรรทัดละอัน)</label>
              <textarea
                placeholder="https://…"
                value={formData.links}
                onChange={(e) => setFormData({ ...formData, links: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm resize-none"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">สีการ์ด</label>
              <div className="flex flex-wrap gap-2">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setFormData({ ...formData, color: color.rgb })}
                    className={`w-6 h-6 rounded transition-all ${
                      formData.color === color.rgb ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.rgb }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCreateNote}
                className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-medium text-sm transition-colors"
              >
                สร้างโน้ต
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium text-sm transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">แก้ไขโน้ต</h2>
              <button
                onClick={() => setEditingNote(null)}
                className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M18 6 6 18M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">ชื่อ</label>
              <input
                type="text"
                placeholder="ชื่อโน้ต เช่น รหัส Wi-Fi ออฟฟิศ"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">รายละเอียด</label>
              <textarea
                placeholder="จดไว้กันลืม…"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm resize-none"
              />
            </div>

            {/* Links */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">ลิงก์ (บรรทัดละอัน)</label>
              <textarea
                placeholder="https://…"
                value={formData.links}
                onChange={(e) => setFormData({ ...formData, links: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm resize-none"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">สีการ์ด</label>
              <div className="flex flex-wrap gap-2">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setFormData({ ...formData, color: color.rgb })}
                    className={`w-6 h-6 rounded transition-all ${
                      formData.color === color.rgb ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.rgb }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleUpdateNote}
                className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-medium text-sm transition-colors"
              >
                บันทึก
              </button>
              <button
                onClick={() => {
                  handleDeleteNote(editingNote.id);
                  setEditingNote(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-sm transition-colors"
              >
                ลบ
              </button>
              <button
                onClick={() => setEditingNote(null)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium text-sm transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
