'use client';

interface DeleteConfirmModalProps {
  taskTitle: string | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function DeleteConfirmModal({
  taskTitle,
  isOpen,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  if (!isOpen || !taskTitle) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div
        className="bg-gray-900 rounded-xl w-full max-w-sm shadow-2xl border border-gray-800 backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
              </svg>
            </div>
          </div>

          {/* Content */}
          <h2 className="text-lg font-bold text-white text-center mb-2">ลบงานนี้ใช่หรือไม่?</h2>
          <p className="text-gray-400 text-sm text-center mb-6 line-clamp-2">
            งาน: <span className="text-gray-200 font-semibold">{taskTitle}</span>
          </p>
          <p className="text-gray-500 text-xs text-center mb-6">
            การลบนี้ไม่สามารถยกเลิกได้ หลังจากลบงานจะหายไปจากระบบ
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 py-2.5 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                  กำลังลบ...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                  </svg>
                  ลบงาน
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
