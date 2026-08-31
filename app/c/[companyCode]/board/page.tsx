'use client';

export default function BoardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">บอร์ดงาน</h1>
        <p className="text-gray-400 mt-2">จัดการและติดตามงานทั้งหมด</p>
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
        <p className="text-gray-400">บอร์ดงาน (Kanban Board)</p>
      </div>
    </div>
  );
}
