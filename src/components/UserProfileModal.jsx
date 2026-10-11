import React from 'react';
import { X, User, Store, Phone, Award, Zap, LogOut, PlusCircle, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose, user, onLogout, onOpenPricing, onOpenHistory }) {
  if (!isOpen || !user) return null;

  // Thoát nhanh bằng phím Escape
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn font-sans"
    >
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative my-auto max-h-[92vh] flex flex-col text-slate-800">
        
        {/* Header Cố Định */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">Hồ Sơ Nhà Bán Hàng</h3>
              <p className="text-[11px] text-slate-500 font-medium">Tài khoản & Quản lý lượt quét</p>
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

        {/* Thông tin tài khoản */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200/80">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-slate-400" />
                <span>Tên Shop / Chủ TK:</span>
              </span>
              <span className="font-extrabold text-slate-900 text-sm">{user.shopName}</span>
            </div>

            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200/80">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Số điện thoại:</span>
              </span>
              <span className="font-mono font-bold text-slate-800">{user.phone}</span>
            </div>

            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200/80">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                <span>Gói dịch vụ:</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold uppercase text-[10px]">
                {user.plan === 'monthly' ? 'Gói Tháng (Vô Hạn)' : (user.balanceScans > 0 ? 'Gói Nạp Lượt' : 'Tài Khoản Tiêu Chuẩn')}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Lượt quét còn lại:</span>
              </span>
              <span className="font-black text-rose-600 font-mono text-base">
                {user.plan === 'monthly' ? '∞ Không giới hạn' : `${user.balanceScans || 0} lượt`}
              </span>
            </div>
          </div>

          {/* Nút Xem Lịch Sử Soát Đơn */}
          <button
            onClick={() => {
              onClose();
              if (onOpenHistory) onOpenHistory();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
          >
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Xem Lịch Sử Các Lần Soát Đơn</span>
          </button>

          {/* Nút Nạp Thêm Lượt / Mua Gói */}
          <button
            onClick={() => {
              onClose();
              onOpenPricing();
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nạp Thêm Lượt Quét / Nâng Cấp Gói Tháng</span>
          </button>

          {/* Đăng xuất & Quay lại */}
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng Xuất</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
            >
              ← Đóng (Esc)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
