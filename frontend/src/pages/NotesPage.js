import React, { useState } from 'react';
import Layout from '../components/Layout';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleAddNote = () => {
    if (title && content) {
      setNotes([
        ...notes,
        { id: Date.now(), title, content, createdAt: new Date() },
      ]);
      setTitle('');
      setContent('');
    }
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📝 หมายเหตุ</h1>
          <p className="text-gray-600 mt-2">จดบันทึกความเห็นและข้อมูลสำคัญ</p>
        </div>

        {/* Add Note Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">เพิ่มหมายเหตุใหม่</h2>
          <input
            type="text"
            placeholder="ชื่อเรื่อง"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <textarea
            placeholder="เนื้อหา"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleAddNote}
            className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
          >
            บันทึก
          </button>
        </div>

        {/* Notes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow hover:shadow-lg transition-shadow"
            >
              <h3 className="font-bold text-gray-800 mb-2">{note.title}</h3>
              <p className="text-gray-700 text-sm mb-3">{note.content}</p>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {note.createdAt.toLocaleDateString('th-TH')}
                </p>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-red-600 text-sm font-semibold hover:underline"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default NotesPage;
