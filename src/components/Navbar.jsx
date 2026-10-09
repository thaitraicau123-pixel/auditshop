import React from 'react';
import { ShieldCheck, Sparkles, HelpCircle, PhoneCall, TrendingUp } from 'lucide-react';

export default function Navbar({ onOpenPricing, onScrollToCalculator }) {
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
                <span>Gemini 3.8 AI Chuẩn Hóa</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Kiểm toán vận chuyển & COD thông minh bằng AI</p>
          </div>
        </div>

        <nav className="flex items-center gap-3 sm:gap-6">
          <button 
            onClick={onScrollToCalculator}
            className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Tính tiền mất ước tính</span>
          </button>
          
          <button 
            onClick={onOpenPricing}
            className="text-xs sm:text-sm font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Bảng giá & Mở khóa</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
