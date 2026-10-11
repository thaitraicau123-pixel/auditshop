import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, Sparkles, TrendingUp, User, UserPlus, Zap, 
  Clock, Rocket, Volume2, VolumeX, Flame, Coffee, HelpCircle, Heart,
  Sun, Moon, ChevronDown, Layers, Calculator, Search, MessageSquareQuote, 
  Camera, FileSpreadsheet, ArrowLeftRight, CheckCircle2
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
  onOpenCoffeeModal,
  isDarkMode = false,
  onToggleDarkMode,
  onOpenCrossReconcile,
  onOpenRateCompare,
  onOpenQuickAudit,
  onOpenDisputePlaybook,
  onOpenDamageClaim
}) {
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_-3px_rgba(0,0,0,0.4)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0 relative group cursor-pointer" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ShieldCheck className="w-5 h-5 text-white transition-transform group-hover:scale-110" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 ring-1 ring-emerald-400/40" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                className="font-black text-xl tracking-tight text-slate-900 dark:text-white cursor-pointer"
              >
                SoatDon<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">.vn</span>
              </span>
              <div className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>AI Logistics 3.0</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium hidden md:block">
              Hệ thống kiểm toán cước vận chuyển & bảo vệ doanh thu bán hàng
            </p>
          </div>
        </div>

        {/* Navigation & Controls */}
        <nav className="flex items-center gap-1.5 sm:gap-2">

          {/* ⚔️ & 📊 BỘ CÔNG CỤ ĐỐI SOÁT DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
              className="text-xs sm:text-sm font-extrabold px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300/60 dark:border-indigo-700/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group"
              title="Mở bộ công cụ kiểm toán và cứu tiền chuyên sâu"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:rotate-180 transition-transform duration-300" />
              <span>Tiện Ích</span>
              <span className="hidden sm:inline px-1 py-0.2 rounded-md bg-rose-500 text-white text-[9px] font-black uppercase tracking-tight">Mới</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isToolsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Bộ Công Cụ Cứu Tiền Chuyên Sâu
                  </span>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                    5 Tiện ích mới
                  </span>
                </div>

                <div className="p-1 space-y-1">
                  {/* Tool 1: So khớp 2 chiều */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsDropdownOpen(false);
                      if (onOpenCrossReconcile) onOpenCrossReconcile();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-indigo-50/80 dark:hover:bg-slate-800/80 transition-colors flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900 dark:text-white">So Khớp 2 Chiều (Kho vs Hãng)</span>
                        <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.2 rounded-full">HOT</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        Bắt lệch COD, nuốt đơn, cân khống từ file KiotViet/Sapo
                      </p>
                    </div>
                  </button>

                  {/* Tool 2: So sánh cước 6 hãng */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsDropdownOpen(false);
                      if (onOpenRateCompare) onOpenRateCompare();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50/80 dark:hover:bg-slate-800/80 transition-colors flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900 dark:text-white">Ma Trận Cước 6 Hãng</span>
                        <span className="text-[9px] font-black bg-blue-500 text-white px-1.5 py-0.2 rounded-full">TIẾT KIỆM</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        Tra cước chuẩn & xếp hạng GHTK, GHN, Viettel, SPX, J&T
                      </p>
                    </div>
                  </button>

                  {/* Tool 3: Soi nhanh 1 đơn */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsDropdownOpen(false);
                      if (onOpenQuickAudit) onOpenQuickAudit();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50/80 dark:hover:bg-slate-800/80 transition-colors flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Search className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-slate-900 dark:text-white">Soi Nhanh 1 Mã Vận Đơn</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        Gõ mã đơn bóc tách ngay cước khống và bản sao khiếu nại
                      </p>
                    </div>
                  </button>

                  {/* Tool 4: Kịch bản đòi tiền Zalo */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsDropdownOpen(false);
                      if (onOpenDisputePlaybook) onOpenDisputePlaybook();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-purple-50/80 dark:hover:bg-slate-800/80 transition-colors flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <MessageSquareQuote className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-slate-900 dark:text-white">Kịch Bản Đòi Tiền Zalo Cứng Rắn</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        6 mẫu phản hồi thép dẫn Luật Bưu chính 2010 ép bưu cục hoàn tiền
                      </p>
                    </div>
                  </button>

                  {/* Tool 5: Lập biên bản bể vỡ */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsDropdownOpen(false);
                      if (onOpenDamageClaim) onOpenDamageClaim();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-rose-50/80 dark:hover:bg-slate-800/80 transition-colors flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-slate-900 dark:text-white">Lập Biên Bản Bể Vỡ / Tráo Hàng</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        Tải ảnh hiện trường, đóng dấu thời gian & xuất biên bản A4
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Version Changelog Button */}
          <button 
            type="button"
            onClick={onOpenChangelog}
            className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/90 dark:border-emerald-800/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group"
            title="Xem nhật ký tính năng mới & thời gian phát hành v3.0"
          >
            <Rocket className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span className="font-black tracking-tight">{CURRENT_SYSTEM_VERSION}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </button>

          {/* History Scan Button */}
          <button 
            type="button"
            onClick={onOpenHistory}
            className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-all cursor-pointer py-1.5 px-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800"
            title="Lịch sử các lần đối soát đơn trước"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Lịch sử</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-black">
                {historyCount}
              </span>
            )}
          </button>

          {/* Pricing Button */}
          <button 
            type="button"
            onClick={onOpenPricing}
            className="text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200/80 dark:border-slate-700"
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
              className="text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/60 dark:to-blue-950/60 hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-900/60 dark:hover:to-blue-900/60 text-indigo-800 dark:text-indigo-200 border border-indigo-200/90 dark:border-indigo-800 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                {user.shopName?.charAt(0).toUpperCase() || 'S'}
              </div>
              <span className="max-w-[90px] sm:max-w-[120px] truncate">{user.shopName}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-200/70 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100 text-[10px] font-black flex items-center gap-0.5">
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

          {/* 🌙 / ☀️ Dark Mode Toggle */}
          <button 
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs"
            title={isDarkMode ? "Chuyển sang chế độ Sáng (Light Mode)" : "Chuyển sang chế độ Tối (Dark Mode)"}
          >
            {isDarkMode ? (
              <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-600" />
            )}
          </button>

          {/* Sound FX Toggle */}
          <button 
            type="button"
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled 
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 shadow-2xs' 
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            title={soundEnabled ? "Âm thanh hiệu ứng: Đang Bật (Click để tắt)" : "Âm thanh hiệu ứng: Đang Tắt (Click để bật)"}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Admin Portal Button */}
          <button 
            type="button"
            onClick={onOpenAdminModal}
            className="text-xs sm:text-sm font-bold px-2.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-slate-700 hover:border-slate-600"
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
