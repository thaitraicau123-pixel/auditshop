import React from 'react';
import { ShieldCheck, Sparkles, HelpCircle, PhoneCall, TrendingUp } from 'lucide-react';

export default function Navbar({ onOpenPricing, onScrollToCalculator }) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">SoatDon<span className="text-rose-500">.vn</span></span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">MVP B2B</span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Kiểm toán cước & Cứu tiền thất thoát shop online</p>
          </div>
        </div>

        <nav className="flex items-center gap-3 sm:gap-6">
          <button 
            onClick={onScrollToCalculator}
            className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Tính tiền mất ước tính</span>
          </button>
          
          <button 
            onClick={onOpenPricing}
            className="text-xs sm:text-sm font-semibold px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-md shadow-rose-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Bảng giá & Mở khóa</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
