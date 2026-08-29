import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useTaskStore } from '../store/taskStore';

const TimelinePage = () => {
  const { projectId } = useParams();
  const { tasks, fetchTasks } = useTaskStore();

  useEffect(() => {
    fetchTasks({ project: projectId });
  }, [projectId]);

  const sortedTasks = tasks.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📅 ไทมไลน์</h1>
          <p className="text-gray-600 mt-2">ดูกำหนดการของงานและโครงการ</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            {sortedTasks.filter((t) => t.dueDate).map((task) => {
              const dueDate = new Date(task.dueDate);
              const today = new Date();
              const isOverdue = dueDate < today && task.status !== 'done';
              const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={task._id}
                  className={`p-4 rounded-lg border-l-4 ${
                    isOverdue
                      ? 'border-red-500 bg-red-50'
                      : daysLeft <= 3
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-teal-500 bg-teal-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{task.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-gray-800">
                        {dueDate.toLocaleDateString('th-TH')}
                      </p>
                      {isOverdue ? (
                        <p className="text-sm text-red-600">เลยกำหนด {-daysLeft} วัน</p>
                      ) : (
                        <p className="text-sm text-gray-600">{daysLeft} วันที่เหลือ</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-200 text-blue-800">
                      {task.status}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-200 text-purple-800">
                      {task.priority}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TimelinePage;
