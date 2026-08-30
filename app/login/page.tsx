'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/app/store/authStore';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'dev',
  });
  const [error, setError] = useState('');
  const { login, register, loading } = useAuthStore();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await register(formData.name, formData.email, formData.password, formData.role);
    }

    if (result.success) {
      router.push('/');
    } else {
      setError(result.message || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <Image
              src="/logo.png"
              alt="JOB DO IT"
              width={100}
              height={100}
              className="h-20 w-auto"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">เข้าสู่ระบบ</h1>
          <p className="text-gray-600 text-sm">
            {isLogin
              ? 'เข้าสู่ระบบเพื่อจัดการงานและโครงการของคุณ'
              : 'สร้างบัญชีใหม่เพื่อเริ่มต้น'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-700 font-semibold text-sm mb-1.5">ชื่อ</label>
              <input
                type="text"
                name="name"
                placeholder="เช่น สมชาย สมการ"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-gray-900 placeholder-gray-500"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-semibold text-sm mb-1.5">อีเมล</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-gray-900 placeholder-gray-500"
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-gray-700 font-semibold text-sm mb-1.5">รหัสผ่าน</label>
              <input
                type="password"
                name="password"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-gray-900 placeholder-gray-500"
              />
            </div>
            {isLogin && (
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                  setFormData({ name: '', email: '', password: '', role: 'dev' });
                }}
                className="text-xs text-teal-600 font-semibold hover:text-teal-700 whitespace-nowrap"
              >
                สมัครสมาชิก?
              </button>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-gray-700 font-semibold text-sm mb-1.5">บทบาท</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-gray-900 bg-white"
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
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 mt-6"
          >
            {loading ? 'กำลังดำเนิน...' : isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            {isLogin ? 'ยังไม่มีบัญชี?' : 'มีบัญชีแล้ว?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ name: '', email: '', password: '', role: 'dev' });
              }}
              className="text-teal-600 font-semibold hover:text-teal-700"
            >
              {isLogin ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
