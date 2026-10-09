import React from 'react';
import { X, User, Store, Phone, Award, Zap, LogOut, PlusCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose, user, onLogout, onOpenPricing }) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative my-auto text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Hồ Sơ Nhà Bán Hàng</h3>
              <p className="text-[11px] text-slate-500 font-medium">Tài khoản & Quản lý lượt quét</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
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
                {user.plan === 'monthly' ? 'Gói Tháng (Vô Hạn)' : user.plan === 'free_trial' ? 'Trải Nghiệm Miễn Phí' : 'Nạp Lượt'}
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

          {/* Đăng xuất */}
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[11px] text-slate-400">Đã đăng nhập trên thiết bị này</span>
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
          </div>
        </div>

      </div>
    </div>
  );
}
