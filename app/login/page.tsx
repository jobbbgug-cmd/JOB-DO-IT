export const dynamic = 'force-dynamic';
export const revalidate = 0;

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/app/store/authStore';
import { useUIStore } from '@/app/store/uiStore';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('inviteCode');
  const [isLogin, setIsLogin] = useState(!inviteCode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { login, register, loading } = useAuthStore();
  const { setCompanyCode } = useUIStore();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
      if (result.success) {
        const companyCode = localStorage.getItem('companyCode');
        if (companyCode) {
          setCompanyCode(companyCode);
          router.push(`/c/${companyCode}/boardteam`);
        } else {
          router.push('/boardteam');
        }
      } else {
        setError(result.message || 'เกิดข้อผิดพลาด');
      }
    } else {
      const nameFromEmail = formData.email.split('@')[0];
      result = await register(nameFromEmail, formData.email, formData.password, 'dev');
      if (result.success) {
        if (inviteCode) {
          localStorage.setItem('inviteCode', inviteCode);
          router.push(`/verify?email=${encodeURIComponent(formData.email)}&inviteCode=${inviteCode}`);
        } else {
          router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
        }
      } else {
        setError(result.message || 'เกิดข้อผิดพลาด');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <Image
                  src="/icon.png"
                  alt="JOB DO IT"
                  width={100}
                  height={100}
                  className="h-10 w-auto"
                  priority
                />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'เข้าสู่ระบบ' : 'สร้างบัญชีใหม่'}
            </h1>
            <p className="text-gray-600 text-sm font-medium">
              {isLogin
                ? 'เข้าสู่ระบบเพื่อจัดการงานของทีมต่อ'
                : 'เข้าสู่ระบบแล้วใช้งานบอร์ดได้ทันที ไม่ต้องตั้งค่าเพิ่มเติม'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold text-sm mb-2">อีเมล</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold text-sm mb-2">รหัสผ่าน</label>
              <input
                type="password"
                name="password"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 mt-6"
            >
              {loading ? 'กำลังดำเนิน...' : isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </button>

            {/* Toggle */}
            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                {isLogin ? 'ยังไม่มีบัญชี?' : 'มีบัญชีแล้ว?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setFormData({ email: '', password: '' });
                  }}
                  className="text-teal-600 font-semibold hover:text-teal-700 hover:underline"
                >
                  {isLogin ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
