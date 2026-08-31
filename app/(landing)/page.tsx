'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icon.png" alt="JOB DO IT" width={120} height={32} className="h-8 w-auto" />
          </Link>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-teal-600 font-semibold hover:text-teal-700">
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/login"
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 font-semibold"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="mb-8 inline-block p-3 bg-white rounded-xl shadow-lg">
          <Image src="/logo.png" alt="JOB DO IT" width={80} height={80} className="h-20 w-auto" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-6">
          JOB DO IT
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          ระบบจัดการงานและโครงการสำหรับทีมพัฒนาซอฟต์แวร์
        </p>
        <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
          ติดตามความคืบหน้างาน จัดการโปรเจกต์ และทำงานร่วมกับทีมได้อย่างมีประสิทธิภาพ
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 font-bold text-lg shadow-lg"
          >
            เริ่มต้นใช้งาน
          </Link>
          <Link
            href="#features"
            className="px-8 py-4 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 font-bold text-lg"
          >
            เรียนรู้เพิ่มเติม
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">ฟีเจอร์หลัก</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: '📊',
              title: 'แดชบอร์ด',
              desc: 'มองเห็นภาพรวมของงานและโปรเจกต์ทั้งหมด',
            },
            {
              icon: '📋',
              title: 'บอร์ด Kanban',
              desc: 'จัดระเบียบงานด้วยการลากวาง (Drag & Drop)',
            },
            {
              icon: '📁',
              title: 'จัดการโปรเจกต์',
              desc: 'สร้างและติดตามโปรเจกต์ทั้งหมดของทีม',
            },
            {
              icon: '✅',
              title: 'ติดตามงาน',
              desc: 'กำหนดปัจจุบัน ลำดับความสำคัญ และกำหนดมอบหมาย',
            },
            {
              icon: '💬',
              title: 'ความเห็นและการอภิปราย',
              desc: 'ติดต่อสื่อสารกับทีมภายในงานแต่ละงาน',
            },
            {
              icon: '⚡',
              title: 'การอัปเดตแบบเรียลไทม์',
              desc: 'เห็นการเปลี่ยนแปลงทันทีเมื่อเกิดขึ้น',
            },
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-500 to-teal-500 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-6">พร้อมที่จะเริ่มต้นแล้วหรือ?</h2>
          <p className="text-xl mb-8 text-blue-50">
            เข้าร่วมทีมและเพิ่มประสิทธิภาพการทำงาน
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-white text-teal-600 rounded-lg hover:bg-gray-50 font-bold text-lg shadow-lg"
          >
            สมัครสมาชิก ฟรี
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>&copy; 2026 JOB DO IT. สงวนสิทธิ์ทั้งหมด</p>
        </div>
      </footer>
    </div>
  );
}
