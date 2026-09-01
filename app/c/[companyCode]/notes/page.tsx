'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Note {
  id: string;
  title: string;
  content: string;
  x?: number;
  y?: number;
  createdAt: string;
  updatedAt: string;
}

export default function NotesPage() {
  const router = useRouter();
  const params = useParams();
  const companyCode = params.companyCode as string;
  const [isHydrated, setIsHydrated] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);

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
    try {
      const response = await fetch(`/api/notes/${companyCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'โน้ตใหม่',
          content: '',
        }),
      });

      if (response.ok) {
        const created = await response.json();
        const newNote = {
          ...created,
          x: Math.random() * 300,
          y: Math.random() * 300,
        };
        setNotes([...notes, newNote]);
        setEditingNote(newNote);
      }
    } catch (error) {
      console.error('Failed to create note:', error);
      alert('สร้างหมายเหตุไม่สำเร็จ');
    }
  };

  const handleUpdateNote = async (note: Note) => {
    try {
      await fetch(`/api/notes/${companyCode}/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: note.title,
          content: note.content,
        }),
      });
      setEditingNote(null);
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await fetch(`/api/notes/${companyCode}/${noteId}`, {
        method: 'DELETE',
      });
      setNotes(notes.filter(n => n.id !== noteId));
      setEditingNote(null);
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
    <div className="fixed inset-0 bg-gray-950 overflow-hidden">
      {/* Toolbar */}
      <div className="fixed top-20 left-6 z-50 flex items-center gap-3">
        <button
          onClick={handleCreateNote}
          className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-lg font-medium transition-colors shadow-lg"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
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
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 w-64"
        />
      </div>

      {/* Notes Canvas */}
      <div className="absolute inset-0 pt-20">
        {filteredNotes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-400 text-lg">ไม่มีหมายเหตุ</p>
              <p className="text-gray-500 text-sm mt-2">กดปุ่ม "โน้ตใหม่" เพื่อสร้างหมายเหตุ</p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="absolute w-64 bg-yellow-300 rounded-lg shadow-lg p-4 cursor-move select-none group hover:shadow-xl transition-shadow"
                style={{
                  left: `${note.x || Math.random() * window.innerWidth - 300}px`,
                  top: `${note.y || Math.random() * window.innerHeight - 300}px`,
                  minHeight: '300px',
                }}
              >
                {editingNote?.id === note.id ? (
                  <div className="space-y-3 h-full flex flex-col">
                    <input
                      type="text"
                      value={editingNote.title}
                      onChange={(e) =>
                        setEditingNote({ ...editingNote, title: e.target.value })
                      }
                      className="w-full px-2 py-1 text-sm font-bold text-gray-900 bg-yellow-100 border border-yellow-400 rounded focus:outline-none"
                      placeholder="ชื่อโน้ต"
                    />
                    <textarea
                      value={editingNote.content}
                      onChange={(e) =>
                        setEditingNote({ ...editingNote, content: e.target.value })
                      }
                      className="flex-1 px-2 py-1 text-sm text-gray-900 bg-yellow-100 border border-yellow-400 rounded focus:outline-none resize-none"
                      placeholder="เขียนเนื้อหาโน้ต..."
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleUpdateNote(editingNote)}
                        className="px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
                      >
                        บันทึก
                      </button>
                      <button
                        onClick={() => setEditingNote(null)}
                        className="px-3 py-1 text-xs bg-gray-400 hover:bg-gray-500 text-white rounded transition-colors"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-gray-900 text-sm mb-2 pr-8">
                      {note.title || '(ไม่มีชื่อ)'}
                    </h3>
                    <p className="text-gray-800 text-xs whitespace-pre-wrap break-words flex-1">
                      {note.content || '(ไม่มีข้อ)'}
                    </p>

                    {/* Hover Actions */}
                    <div className="absolute top-2 right-2 gap-1 hidden group-hover:flex">
                      <button
                        onClick={() => setEditingNote(note)}
                        className="p-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded text-xs"
                        title="แก้ไข"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 bg-red-400 hover:bg-red-500 text-white rounded text-xs"
                        title="ลบ"
                      >
                        ✕
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
