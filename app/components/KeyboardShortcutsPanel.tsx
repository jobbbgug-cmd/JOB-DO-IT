'use client';

import { useUIStore } from '@/app/store/uiStore';

const shortcuts = [
  {
    group: 'การ์ดงาน',
    items: [
      {
        keys: ['⌘', 'C'],
        desc: 'คัดลอกงานที่เมาส์ชี้อยู่',
      },
      {
        keys: ['⌘', 'X'],
        desc: 'ตัดงานที่เมาส์ชี้ — วางแล้วงานย้ายไปช่องใหม่ (ไม่ทำสำเนา)',
      },
      {
        keys: ['⌘', 'V'],
        desc: 'วางงานลงช่องที่เมาส์ชี้ (คน/เลน/โปรเจค) — กดซ้ำเพื่อแจกได้หลายคน',
      },
      {
        keys: ['⌘', 'Z'],
        desc: 'ย้อนการกระทำล่าสุด',
      },
      {
        keys: ['⌘', 'Shift', 'Z'],
        desc: 'ทำซ้ำการกระทำที่ย้อนไป (หรือ Ctrl+Y)',
      },
    ],
  },
  {
    group: 'มุมมองบอร์ด',
    items: [
      {
        keys: ['⌘', '+'],
        desc: 'ขยายบอร์ด',
      },
      {
        keys: ['⌘', '−'],
        desc: 'ย่อบอร์ด',
      },
      {
        keys: ['⌘', '0'],
        desc: 'รีเซ็ตซูมเป็น 100%',
      },
      {
        keys: ['⌘', 'ล้อเมาส์'],
        desc: 'ซูมเข้า/ออกตามตำแหน่งเมาส์',
      },
    ],
  },
  {
    group: 'ทั่วไป',
    items: [
      {
        keys: ['Enter'],
        desc: 'ที่แถบพิมพ์งาน: สร้างงานจากข้อความ (เปิดฟอร์มละเอียด หรือมอบให้ตัวเองทันที ตามการตั้งค่า)',
      },
      {
        keys: ['Esc'],
        desc: 'ปิดหน้าต่าง / ยกเลิก',
      },
    ],
  },
];

export default function KeyboardShortcutsPanel() {
  const { shortcutsOpen, closeShortcuts } = useUIStore();

  if (!shortcutsOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={closeShortcuts}
      />

      {/* Shortcuts Panel */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-1rem)] sm:w-full max-w-xl bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="คีย์ลัด"
      >
        {/* Header */}
        <header className="flex items-center justify-between gap-4 px-4 py-2 sticky top-0 bg-gray-800 flex-shrink-0">
          <h1 className="text-base font-bold text-white">คีย์ลัด</h1>
          <button
            onClick={closeShortcuts}
            className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            aria-label="ปิด"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M18 6 6 18M6 6l12 12"></path>
            </svg>
          </button>
        </header>

        {/* Content */}
        <div className="px-4 pt-0 pb-3 space-y-3 flex flex-col flex-1 overflow-y-auto">
          {shortcuts.map((section, idx) => (
            <section key={idx}>
              <h2 className="text-[11px] font-medium text-gray-400 mb-2 uppercase tracking-wide">{section.group}</h2>
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-start justify-between gap-3 py-1">
                    {/* Keys */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.keys.map((key, keyIdx) => (
                        <div key={keyIdx} className="flex items-center gap-1">
                          {keyIdx > 0 && <span className="text-gray-500 text-xs font-semibold">+</span>}
                          <kbd className="px-2 py-0.5 bg-gray-700 border border-gray-600 rounded text-gray-300 text-xs font-semibold shadow-sm">
                            {key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                    {/* Description */}
                    <p className="text-gray-400 text-xs flex-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
