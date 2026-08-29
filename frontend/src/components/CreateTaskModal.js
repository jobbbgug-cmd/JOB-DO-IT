import React, { useState } from 'react';

const CreateTaskModal = ({ isOpen, onClose, onCreate, projectId, users = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    type: 'task',
    assignee: '',
    dueDate: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && projectId) {
      onCreate({ ...formData, project: projectId });
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        type: 'task',
        assignee: '',
        dueDate: '',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 max-h-96 overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">สร้างงานใหม่</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">ชื่องาน</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="ชื่องาน"
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">รายละเอียด</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="รายละเอียด"
              rows="2"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">ประเภท</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="task">งาน</option>
                <option value="feature">ฟีเจอร์</option>
                <option value="bug">บัค</option>
                <option value="improvement">ปรับปรุง</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">ลำดับความสำคัญ</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="low">ต่ำ</option>
                <option value="medium">ปกติ</option>
                <option value="high">สูง</option>
                <option value="urgent">เร่งด่วน</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">กำหนดส่ง</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {users.length > 0 && (
              <div>
                <label className="block text-gray-700 font-semibold mb-1 text-sm">มอบหมายให้</label>
                <select
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">ไม่ได้มอบหมาย</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold text-sm"
            >
              สร้างงาน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
