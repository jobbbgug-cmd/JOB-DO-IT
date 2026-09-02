'use client';

import { useState } from 'react';
import { useUIStore } from '@/app/store/uiStore';
import { useAuthStore } from '@/app/store/authStore';

export default function FeedbackPanel() {
  const { feedbackOpen, closeFeedback } = useUIStore();
  const { user } = useAuthStore();
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!feedbackOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((f) => f.size <= 5 * 1024 * 1024);
    if (validFiles.length <= 3) {
      setAttachments(validFiles);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setIsSubmitting(true);
    try {
      // TODO: Submit feedback to API
      console.log('Feedback submitted:', { description, attachments, user });
      setDescription('');
      setAttachments([]);
      closeFeedback();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={closeFeedback}
      />

      {/* Feedback Panel */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-1rem)] sm:w-full max-w-2xl bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="แจ้งปัญหา / ข้อเสนอแนะ"
      >
        {/* Header */}
        <header className="flex items-center justify-between gap-4 px-4 py-2 sticky top-0 bg-gray-800 flex-shrink-0">
          <h1 className="text-base font-bold text-white">แจ้งปัญหา / ข้อเสนอแนะ</h1>
          <button
            onClick={closeFeedback}
            className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors flex-shrink-0"
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
          {/* Lead Text */}
          <p className="text-gray-300 text-xs">
            เจอบั๊ก ใช้แล้วติดขัด หรืออยากได้อะไรเพิ่ม — เล่าให้ฟังได้เลย
          </p>

          {/* Description */}
          <div className="flex-1 flex flex-col">
            <label className="block text-xs font-medium text-gray-300 mb-2">รายละเอียด</label>
            <textarea
              placeholder="เกิดอะไรขึ้น / อยากให้เป็นแบบไหน…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* File Attachment */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">
              แนบไฟล์ (สกรีนช็อต ฯลฯ — ไม่เกิน 3 ไฟล์ ไฟล์ละ 5MB)
            </label>
            <label className="flex items-center justify-start gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg cursor-pointer transition-colors text-gray-300 hover:text-white text-sm font-medium w-fit">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              แนบไฟล์
              <input
                type="file"
                multiple
                hidden
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
              />
            </label>
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachments.map((file) => (
                  <div
                    key={file.name}
                    className="text-sm text-gray-400 flex items-center justify-between p-2 bg-gray-700 rounded"
                  >
                    <span>📎 {file.name}</span>
                    <button
                      onClick={() =>
                        setAttachments(attachments.filter((f) => f.name !== file.name))
                      }
                      className="text-gray-500 hover:text-gray-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Note */}
          <p className="text-[11px] text-gray-500">
            ระบบจะแนบชื่อผู้ส่ง บริษัท และหน้าที่เปิดอยู่ไปด้วย เพื่อช่วยให้ตามเรื่องได้เร็วขึ้น
          </p>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!description.trim() || isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? 'กำลังส่ง...' : 'ส่งเรื่อง'}
          </button>
        </div>
      </div>
    </>
  );
}
