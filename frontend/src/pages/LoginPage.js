import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'dev',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuthStore();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password, formData.role);
      }

      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในระบบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 via-teal-600 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <img src="/logo.png" alt="JOB DO IT" className="max-w-xs mx-auto mb-6 object-contain" />
          <p className="text-teal-100 text-lg font-semibold">{isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</p>
          <p className="text-teal-100 text-sm mt-2">
            {isLogin ? 'เข้าสู่ระบบเพื่อจัดการงานและโครงการของคุณ' : 'สร้างบัญชีใหม่เพื่อเริ่มต้น'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">ชื่อของคุณ</label>
                <input
                  type="text"
                  name="name"
                  placeholder="เช่น สมชาย สมการ"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">อีเมล</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">รหัสผ่าน</label>
              <input
                type="password"
                name="password"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">บทบาท</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-white"
                >
                  <option value="dev">👨‍💻 นักพัฒนา (Dev)</option>
                  <option value="tester">🧪 ผู้ทดสอบ (Tester)</option>
                  <option value="lead">👔 หัวหน้าทีม (Lead)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl mt-6"
            >
              {loading ? 'กำลังดำเนิน...' : isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </button>
          </form>

          {/* Toggle */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              {isLogin ? 'ยังไม่มีบัญชี?' : 'มีบัญชีแล้ว?'}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ name: '', email: '', password: '', role: 'dev' });
                }}
                className="text-teal-600 font-semibold hover:text-teal-700 transition"
              >
                {isLogin ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-teal-100 text-xs mt-8">
          ระบบจัดการงานสำหรับทีมพัฒนา © 2026
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
