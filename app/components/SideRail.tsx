'use client';

export default function SideRail() {
  const shortcuts = [
    {
      label: 'แจ้งเตือน',
      title: 'งานที่ถึงเวลา และงานที่เกี่ยวกับคุณ',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M18 8a6 6 0 1 0-12 0c0 6-3 7-3 7h18s-3-1-3-7"></path>
          <path d="M13.7 20a2 2 0 0 1-3.4 0"></path>
        </svg>
      ),
    },
    {
      label: 'การเปลี่ยนแปลง',
      title: 'ใครอัปเดตอะไรบ้าง',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path>
          <path d="M3 3v5h5"></path>
          <path d="M12 7v5l3 2"></path>
        </svg>
      ),
    },
    {
      label: 'โฟลเดอร์',
      title: 'ลากไปชนงานเพื่อเก็บ',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M4 20a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2z"></path>
        </svg>
      ),
    },
    {
      label: 'พนักงาน',
      title: 'เพิ่มพนักงาน',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M19 8v6M22 11h-6"></path>
        </svg>
      ),
    },
    {
      label: 'บริษัท',
      title: 'จัดการบริษัท',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"></path>
          <path d="M16 9h3a1 1 0 0 1 1 1v11"></path>
          <path d="M2 21h20"></path>
          <path d="M8 7h2M8 11h2M8 15h2M12 7h1M12 11h1M12 15h1"></path>
        </svg>
      ),
    },
    {
      label: 'โน้ต',
      title: 'บันทึกความจำ',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"></path>
          <path d="M14 3v6h6M8 13h7M8 17h5"></path>
        </svg>
      ),
    },
    {
      label: 'โครงสร้าง',
      title: 'ผังคน/ตำแหน่ง',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="9" y="3" width="6" height="5" rx="1.2"></rect>
          <rect x="3" y="16" width="6" height="5" rx="1.2"></rect>
          <rect x="15" y="16" width="6" height="5" rx="1.2"></rect>
          <path d="M12 8v4M6 16v-2a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2"></path>
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed right-0 top-0 bottom-0 w-20 bg-gray-900 border-l border-gray-800 flex flex-col items-center gap-3 py-6" aria-label="เมนูลัด">
      {shortcuts.map((item, i) => (
        <div key={i} className="rail-slot">
          <button
            type="button"
            className="w-14 h-14 flex items-center justify-center rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 text-gray-400 hover:text-cyan-400 transition-all duration-200 group relative hover:shadow-lg hover:shadow-cyan-900/50 hover:-translate-y-1"
            title={item.title}
            aria-label={`${item.label} — ${item.title}`}
            aria-expanded="false"
          >
            {item.icon}
            {/* Tooltip */}
            <div
              className="absolute right-full mr-3 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none shadow-lg"
              role="tooltip"
            >
              {item.label}
            </div>
          </button>
        </div>
      ))}
    </nav>
  );
}
