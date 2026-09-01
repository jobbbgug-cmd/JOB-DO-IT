'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Note {
  id: string;
  title: string;
  content: string;
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
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
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
    if (!newNote.title.trim()) {
      alert('กรุณาใส่ชื่อหมายเหตุ');
      return;
    }

    try {
      const response = await fetch(`/api/notes/${companyCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newNote.title,
          content: newNote.content,
        }),
      });

      if (response.ok) {
        const created = await response.json();
        setNotes([created, ...notes]);
        setNewNote({ title: '', content: '' });
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Failed to create note:', error);
      alert('สร้างหมายเหตุไม่สำเร็จ');
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isHydrated) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-6 h-screen overflow-hidden">
      {/* Notes List */}
      <div className="col-span-1 flex flex-col border-r border-gray-700">
        <div className="space-y-4 p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">หมายเหตุ</h1>
          <input
            type="text"
            placeholder="ค้นหา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-medium transition-colors"
          >
            + หมายเหตุใหม่
          </button>
        </div>

        {/* Notes List Items */}
        <div className="flex-1 overflow-y-auto space-y-2 p-4">
          {filteredNotes.length === 0 ? (
            <p className="text-gray-400 text-center py-8">ไม่มีหมายเหตุ</p>
          ) : (
            filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedNote?.id === note.id
                    ? 'bg-gray-700 border border-gray-600'
                    : 'bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700'
                }`}
              >
                <h3 className="font-medium text-white text-sm truncate">{note.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(note.updatedAt).toLocaleDateString('th-TH')}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Note Editor or Create Form */}
      <div className="col-span-2 flex flex-col">
        {showCreateForm ? (
          <div className="flex-1 p-6 flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4">หมายเหตุใหม่</h2>
            <div className="space-y-4 flex-1">
              <div>
                <label className="text-sm font-semibold text-gray-400 block mb-2">ชื่อ</label>
                <input
                  type="text"
                  placeholder="ชื่อหมายเหตุ..."
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-400 block mb-2">เนื้อหา</label>
                <textarea
                  placeholder="เนื้อหาหมายเหตุ..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="w-full h-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleCreateNote}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-medium transition-colors"
              >
                บันทึก
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewNote({ title: '', content: '' });
                }}
                className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        ) : selectedNote ? (
          <div className="flex-1 p-6 flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-2">{selectedNote.title}</h2>
            <p className="text-xs text-gray-500 mb-4">
              อัปเดต {new Date(selectedNote.updatedAt).toLocaleDateString('th-TH')}
            </p>
            <p className="text-gray-300 whitespace-pre-wrap flex-1">{selectedNote.content}</p>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">เลือกหมายเหตุหรือสร้างใหม่</p>
          </div>
        )}
      </div>
    </div>
  );
}
