import React from 'react';
import { 
  ShieldCheck, ShieldAlert, Sparkles, TrendingUp, User, UserPlus, Zap, 
  Clock, Rocket, Volume2, VolumeX, Flame, Coffee, HelpCircle, Heart
} from 'lucide-react';
import { CURRENT_SYSTEM_VERSION } from '../data/changelog';

export default function Navbar({ 
  onOpenPricing, 
  onScrollToCalculator, 
  user, 
  onOpenAuthModal, 
  onOpenProfileModal,
  onOpenHistory,
  historyCount = 0,
  onOpenAdminModal,
  onOpenChangelog,
  soundEnabled = true,
  onToggleSound,
  onOpenCoffeeModal
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0 relative group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <ShieldCheck className="w-5 h-5 text-white transition-transform group-hover:scale-110" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-400/40" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                className="font-black text-xl tracking-tight text-slate-900 cursor-pointer"
              >
                SoatDon<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">.vn</span>
              </span>
              <div className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-[10px] font-black uppercase tracking-wider text-indigo-700 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>AI Logistics 3.0</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden md:block">
              Hệ thống kiểm toán cước vận chuyển & bảo vệ doanh thu bán hàng
            </p>
          </div>
        </div>

        {/* Navigation & Controls */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Version Changelog Button */}
          <button 
            type="button"
            onClick={onOpenChangelog}
            className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 text-emerald-800 border border-emerald-200/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group"
            title="Xem nhật ký tính năng mới & thời gian phát hành v3.0"
          >
            <Rocket className="w-3.5 h-3.5 text-emerald-600 group-hover:rotate-12 transition-transform" />
            <span className="font-black tracking-tight">{CURRENT_SYSTEM_VERSION}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </button>

          {/* History Scan Button */}
          <button 
            type="button"
            onClick={onOpenHistory}
            className="text-xs sm:text-sm font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition-all cursor-pointer py-1.5 px-2.5 rounded-xl hover:bg-slate-100/80"
            title="Lịch sử các lần đối soát đơn trước"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Lịch sử</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black">
                {historyCount}
              </span>
            )}
          </button>

          {/* ROI Calculator Shortcut */}
          <button 
            type="button"
            onClick={onScrollToCalculator}
            className="hidden lg:flex text-xs sm:text-sm font-bold text-slate-600 hover:text-emerald-700 items-center gap-1.5 transition-colors cursor-pointer py-1.5 px-2.5 rounded-xl hover:bg-emerald-50/70"
            title="Ước tính số tiền thất thoát mỗi tháng"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tính tiền mất</span>
          </button>
          
          {/* Pricing Button */}
          <button 
            type="button"
            onClick={onOpenPricing}
            className="text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200/80"
            title="Bảng giá các gói quét bản quyền"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Bảng giá</span>
          </button>

          {/* User Account / Login Button */}
          {user ? (
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 text-indigo-800 border border-indigo-200/90 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                {user.shopName?.charAt(0).toUpperCase() || 'S'}
              </div>
              <span className="max-w-[90px] sm:max-w-[120px] truncate">{user.shopName}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-200/70 text-indigo-900 text-[10px] font-black flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                {user.plan === 'monthly' ? 'Vô hạn' : `${user.balanceScans || 0}`}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="text-xs sm:text-sm font-extrabold px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Đăng Nhập</span>
            </button>
          )}

          {/* Sound FX Toggle */}
          <button 
            type="button"
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-2xs' 
                : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title={soundEnabled ? "Âm thanh hiệu ứng: Đang Bật (Click để tắt)" : "Âm thanh hiệu ứng: Đang Tắt (Click để bật)"}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Admin Portal Button */}
          <button 
            type="button"
            onClick={onOpenAdminModal}
            className="text-xs sm:text-sm font-bold px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-slate-700 hover:border-slate-600"
            title="Trung tâm Quản trị Admin"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
