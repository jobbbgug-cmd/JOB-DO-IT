'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

export default function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('กรุณากรอกรหัส 6 หลัก');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/auth/verify', { email, code });
      const { token } = response.data;
      localStorage.setItem('token', token);
      router.push('/boardteam');
    } catch (err: any) {
      setError(err.response?.data?.error || 'ยืนยันรหัสไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/resend-code', { email });
      alert('ส่งรหัสใหม่เรียบร้อย ตรวจสอบเซิร์ฟเวอร์ console');
    } catch (err: any) {
      setError(err.response?.data?.error || 'ส่งรหัสใหม่ไม่สำเร็จ');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur">
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">✉️</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">สั่งรหัสยืนยันแล้ว</h1>
            <p className="text-gray-600 text-sm">
              ระบบส่งรหัสยืนยัน 6 หลักไปยัง <br />
              <strong>{email}</strong>
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-sm text-gray-600">
            <p className="mb-2">
              ตรวจสอบเซิร์ฟเวอร์ console สำหรับรหัสยืนยัน (dev mode)
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold text-sm mb-2">
                รหัสยืนยัน
              </label>
              <input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-teal-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-gray-50 hover:bg-white text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-2">
                กรอกตัวเลข 6 หลัก
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังยืนยัน...' : 'ยืนยัน'}
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm mb-3">ไม่ได้รับรหัส?</p>
            <button
              onClick={handleResendCode}
              disabled={resendLoading}
              className="text-teal-600 font-semibold hover:text-teal-700 hover:underline disabled:opacity-50"
            >
              {resendLoading ? 'กำลังส่ง...' : 'ส่งรหัสใหม่'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
