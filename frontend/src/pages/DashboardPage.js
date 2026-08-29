import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useTaskStore } from '../store/taskStore';

const DashboardPage = () => {
  const { tasks, fetchTasks } = useTaskStore();
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0, todo: 0 });

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (tasks.length > 0) {
      setStats({
        total: tasks.length,
        todo: tasks.filter((t) => t.status === 'todo').length,
        inProgress: tasks.filter((t) => t.status === 'in-progress').length,
        completed: tasks.filter((t) => t.status === 'done').length,
      });
    }
  }, [tasks]);

  const tasksByPriority = {
    urgent: tasks.filter((t) => t.priority === 'urgent'),
    high: tasks.filter((t) => t.priority === 'high'),
    medium: tasks.filter((t) => t.priority === 'medium'),
    low: tasks.filter((t) => t.priority === 'low'),
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📊 แดชบอร์ด</h1>
          <p className="text-gray-600 mt-2">ยินดีต้อนรับกลับ!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-blue-100 mt-2">งานทั้งหมด</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold">{stats.todo}</div>
            <p className="text-yellow-100 mt-2">รอทำ</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold">{stats.inProgress}</div>
            <p className="text-orange-100 mt-2">กำลังทำ</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold">{stats.completed}</div>
            <p className="text-green-100 mt-2">เสร็จแล้ว</p>
          </div>
        </div>

        {/* Urgent Tasks */}
        {tasksByPriority.urgent.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-red-600 mb-4">🔴 งานเร่งด่วน</h2>
            <div className="space-y-2">
              {tasksByPriority.urgent.slice(0, 5).map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-3 bg-red-50 border-l-4 border-red-500 rounded"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{task.title}</p>
                    <p className="text-sm text-gray-600">
                      สถานะ: <span className="font-semibold">{task.status}</span>
                    </p>
                  </div>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📝 งานล่าสุด</h2>
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 text-sm font-semibold rounded bg-teal-100 text-teal-700">
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📊 สถิติงาน</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">งานรอทำ</span>
                  <span className="font-bold text-gray-800">{stats.todo}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${(stats.todo / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">กำลังทำ</span>
                  <span className="font-bold text-gray-800">{stats.inProgress}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">เสร็จแล้ว</span>
                  <span className="font-bold text-gray-800">{stats.completed}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
