import React from 'react';
import { X, Clock, FileSpreadsheet, AlertTriangle, ArrowRight, Trash2, CheckCircle2, Lock, Unlock, Eye, Sparkles } from 'lucide-react';

export default function ScanHistoryModal({ isOpen, onClose, history = [], onSelectScan, onDeleteScan, onClearAll }) {
  // Thoát nhanh bằng phím Escape (Chạy hợp lệ trước return)
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn font-sans"
    >
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative my-auto max-h-[90vh] flex flex-col text-slate-800">
        
        {/* Header Cố Định */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">Lịch Sử Soát Đơn Gần Đây</h3>
              <p className="text-[11px] text-slate-500 font-medium">Lưu tự động kết quả các lần tải file trước đó</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="Đóng (Phím Esc)"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Nội dung danh sách */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm">Chưa có lịch sử soát đơn nào</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Mỗi khi bạn tải bảng kê Excel lên kiểm toán, hệ thống sẽ tự động lưu lại kết quả tại đây để bạn có thể xem lại bất kỳ lúc nào mà không cần tải lại file.
              </p>
            </div>
          ) : (
            history.map((item) => {
              const formattedDate = new Date(item.timestamp).toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm truncate max-w-[240px] sm:max-w-xs block">
                        {item.fileName}
                      </span>
                      {item.isUnlocked ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 shrink-0">
                          <Unlock className="w-3 h-3" />
                          <span>Đã mở</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center gap-1 shrink-0">
                          <Lock className="w-3 h-3 text-rose-500" />
                          <span>Chưa mở</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>{item.totalOrders} đơn</span>
                      <span>•</span>
                      <span className="font-bold text-rose-600">
                        {item.anomalyCount} đơn lệch ({item.totalLeakage.toLocaleString('vi-VN')} đ)
                      </span>
                    </div>
                  </div>

                  {/* Hành động */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <button
                      onClick={() => {
                        onSelectScan(item);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem lại</span>
                    </button>

                    <button
                      onClick={() => onDeleteScan(item.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Xóa bản ghi này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
          {history.length > 0 ? (
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <span className="text-slate-400 text-[11px]">Đang lưu {history.length} bản ghi gần nhất trên thiết bị</span>
              <button
                onClick={onClearAll}
                className="text-rose-600 hover:text-rose-700 font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa hết</span>
              </button>
            </div>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-200/60 text-slate-600 font-bold text-xs transition-colors cursor-pointer ml-auto"
          >
            ← Đóng & Quay lại (Esc)
          </button>
        </div>

      </div>
    </div>
  );
}
