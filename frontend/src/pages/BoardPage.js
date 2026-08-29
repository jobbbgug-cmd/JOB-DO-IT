import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useTaskStore } from '../store/taskStore';

const BoardPage = () => {
  const { projectId } = useParams();
  const { tasks, fetchTasks, updateTask } = useTaskStore();
  const [columns, setColumns] = useState({ todo: [], 'in-progress': [], 'in-review': [], done: [] });

  useEffect(() => {
    fetchTasks({ project: projectId });
  }, [projectId, fetchTasks]);

  useEffect(() => {
    const organized = {
      todo: tasks.filter((t) => t.status === 'todo'),
      'in-progress': tasks.filter((t) => t.status === 'in-progress'),
      'in-review': tasks.filter((t) => t.status === 'in-review'),
      done: tasks.filter((t) => t.status === 'done'),
    };
    setColumns(organized);
  }, [tasks]);

  const handleDragStart = (e, task) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', task._id);
    e.dataTransfer.setData('sourceStatus', task.status);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const sourceStatus = e.dataTransfer.getData('sourceStatus');

    if (sourceStatus !== status) {
      await updateTask(taskId, { status });
    }
  };

  const columnConfig = {
    todo: { label: 'งานรอทำ', color: 'bg-gray-100', icon: '📋' },
    'in-progress': { label: 'กำลังทำ', color: 'bg-blue-100', icon: '⚙️' },
    'in-review': { label: 'รอตรวจ', color: 'bg-yellow-100', icon: '👀' },
    done: { label: 'เสร็จแล้ว', color: 'bg-green-100', icon: '✅' },
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📊 บอร์ดงาน</h1>
          <p className="text-gray-600 mt-2">ลากและวางงานเพื่อเปลี่ยนสถานะ</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {Object.entries(columnConfig).map(([status, config]) => (
            <div
              key={status}
              className={`${config.color} rounded-lg p-4 min-h-96`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                {config.icon} {config.label} ({columns[status]?.length || 0})
              </h2>
              <div className="space-y-3">
                {columns[status]?.map((task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-lg cursor-move border-l-4 border-teal-500 transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-800 mb-2">{task.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          task.priority === 'urgent'
                            ? 'bg-red-200 text-red-800'
                            : task.priority === 'high'
                            ? 'bg-orange-200 text-orange-800'
                            : task.priority === 'medium'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-green-200 text-green-800'
                        }`}
                      >
                        {task.priority}
                      </span>
                      {task.assignee && (
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {task.assignee.name?.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    {task.dueDate && (
                      <p className="text-xs text-gray-500 mt-2">
                        ครบกำหนด: {new Date(task.dueDate).toLocaleDateString('th-TH')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default BoardPage;
