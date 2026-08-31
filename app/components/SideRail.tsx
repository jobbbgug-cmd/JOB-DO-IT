'use client';

export default function SideRail() {
  const shortcuts = [
    {
      icon: '🔔',
      label: 'แจ้งเตือน',
      title: 'งานที่ถึงเวลา และงานที่เกี่ยวกับคุณ',
    },
    {
      icon: '🔄',
      label: 'การเปลี่ยนแปลง',
      title: 'ใครอัปเดตอะไรบ้าง',
    },
    {
      icon: '📁',
      label: 'โฟลเดอร์',
      title: 'ลากไปชนงานเพื่อเก็บ',
    },
    {
      icon: '👥',
      label: 'พนักงาน',
      title: 'เพิ่มพนักงาน',
    },
    {
      icon: '🏢',
      label: 'บริษัท',
      title: 'จัดการบริษัท',
    },
    {
      icon: '📝',
      label: 'โน้ต',
      title: 'บันทึกความจำ',
    },
    {
      icon: '📊',
      label: 'โครงสร้าง',
      title: 'ผังคน/ตำแหน่ง',
    },
  ];

  return (
    <nav className="fixed right-0 top-0 bottom-0 w-20 bg-gray-900 border-l border-gray-800 flex flex-col items-center gap-2 py-6">
      {shortcuts.map((item, i) => (
        <button
          key={i}
          className="w-14 h-14 flex items-center justify-center rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors group relative"
          title={item.title}
        >
          <span className="text-2xl">{item.icon}</span>
          {/* Tooltip */}
          <div className="absolute right-full mr-2 bg-gray-800 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
            {item.label}
          </div>
        </button>
      ))}
    </nav>
  );
}
