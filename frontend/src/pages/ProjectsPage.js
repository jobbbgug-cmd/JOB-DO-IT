import React from 'react';
import Layout from '../components/Layout';

const ProjectsPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📁 โปรเจค</h1>
          <p className="text-gray-600 mt-2">จัดการโปรเจคและทีมของคุณ</p>
        </div>

        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">ยังไม่มีโปรเจค</p>
          <button className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            + สร้างโปรเจคใหม่
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectsPage;
