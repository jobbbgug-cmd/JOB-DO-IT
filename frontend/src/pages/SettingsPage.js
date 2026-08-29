import React from 'react';
import Layout from '../components/Layout';

const SettingsPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">⚙️ ตั้งค่า</h1>
          <p className="text-gray-600 mt-2">จัดการการตั้งค่าส่วนตัวและทีม</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">ตั้งค่าบัญชี</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">ชื่อ</label>
              <input
                type="text"
                placeholder="ชื่อของคุณ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">อีเมล</label>
              <input
                type="email"
                placeholder="อีเมลของคุณ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">บทบาท</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option>นักพัฒนา (Dev)</option>
                <option>ผู้ทดสอบ (Tester)</option>
                <option>หัวหน้าทีม (Lead)</option>
              </select>
            </div>
          </div>
          <button className="mt-6 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold">
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
