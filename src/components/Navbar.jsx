import React from 'react';
import { ShieldCheck, Sparkles, TrendingUp, User, UserPlus, Zap } from 'lucide-react';

export default function Navbar({ onOpenPricing, onScrollToCalculator, user, onOpenAuthModal, onOpenProfileModal }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                SoatDon<span className="text-indigo-600">.vn</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>AI Kiểm Toán Độc Quyền</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Kiểm toán vận chuyển & COD thông minh bằng AI</p>
          </div>
        </div>

        <nav className="flex items-center gap-2.5 sm:gap-4">
          <button 
            onClick={onScrollToCalculator}
            className="hidden md:flex text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 items-center gap-1.5 transition-colors cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Tính tiền mất</span>
          </button>
          
          <button 
            onClick={onOpenPricing}
            className="text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Bảng giá</span>
          </button>

          {/* User Account Button */}
          {user ? (
            <button
              onClick={onOpenProfileModal}
              className="text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                {user.shopName?.charAt(0).toUpperCase() || 'S'}
              </div>
              <span className="max-w-[120px] truncate">{user.shopName}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-200/60 text-indigo-800 text-[10px] font-black flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                {user.plan === 'monthly' ? 'Vô hạn' : `${user.balanceScans || 0}`}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer relative"
            >
              <UserPlus className="w-4 h-4" />
              <span>Đăng Ký / Đăng Nhập</span>
              <span className="hidden sm:inline-block absolute -top-2 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider shadow-xs animate-pulse">
                +3 lượt free
              </span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
