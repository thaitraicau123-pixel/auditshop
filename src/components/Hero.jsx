import React from 'react';
import { 
  ShieldAlert, ShieldCheck, Zap, Clock, Scale, CheckCircle2, 
  ArrowLeftRight, Calculator, Search, MessageSquareQuote, Camera, Sparkles
} from 'lucide-react';

export default function Hero({ 
  onStartDemo,
  onOpenCrossReconcile,
  onOpenRateCompare,
  onOpenQuickAudit,
  onOpenDisputePlaybook,
  onOpenDamageClaim
}) {
  return (
    <section className="relative pt-10 sm:pt-16 pb-12 overflow-hidden bg-tech-grid">
      {/* Background ambient lighting blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[420px] bg-gradient-to-b from-indigo-200/40 via-blue-100/25 to-transparent dark:from-indigo-900/20 dark:via-blue-900/10 dark:to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
        
        {/* Badge Alert */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/90 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs sm:text-sm font-bold mb-6 shadow-xs animate-float">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
          </span>
          <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>Công cụ đối soát độc lập: Tự động rà soát nấc cân nặng, hạn khiếu nại 72h & sai lệch cước COD</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-6">
          Lấy lại từng đồng <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent underline decoration-indigo-300 dark:decoration-indigo-600 decoration-wavy decoration-2">bị trừ oan</span> từ các hãng vận chuyển trong 10 giây
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed font-normal">
          Hệ thống AI tự động phát hiện <b>kê khống cân nặng</b>, <b>đơn hoàn ngâm kho quá 72h</b>, <b>phụ phí khống</b> và <b>lệch tiền COD</b> từ file đối soát Excel của GHTK, GHN, Viettel Post, SPX, TikTok Shop. Xuất ngay biên bản khiếu nại chuẩn để đòi tiền về ví!
        </p>

        {/* 🚀 QUICK ACTION SHORTCUT PILLS FOR NEW TOOLS */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-4xl mx-auto mb-8">
          <button
            type="button"
            onClick={onOpenCrossReconcile}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>⚔️ So Khớp 2 File (Kho vs Hãng)</span>
          </button>

          <button
            type="button"
            onClick={onOpenRateCompare}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-black shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>📊 Tra Cước 6 Hãng</span>
          </button>

          <button
            type="button"
            onClick={onOpenQuickAudit}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-black shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>🔍 Soi Nhanh 1 Đơn</span>
          </button>

          <button
            type="button"
            onClick={onOpenDisputePlaybook}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-black shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
          >
            <MessageSquareQuote className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>💬 Mẫu Đòi Tiền Zalo</span>
          </button>

          <button
            type="button"
            onClick={onOpenDamageClaim}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-black shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>📸 Biên Bản Bể Vỡ A4</span>
          </button>
        </div>

        {/* 4 Authentic Technical Value Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 max-w-4xl mx-auto mb-10 text-left">
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tốc độ quét</span>
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-white tracking-tight">&lt; 10 Giây</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Xử lý xong 1.000 đơn Excel</div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs hover:border-emerald-200 dark:hover:border-emerald-800 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bảo mật</span>
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-700 dark:text-emerald-400 tracking-tight">100% Client</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Chạy trên máy, không lưu data</div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tương thích</span>
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-indigo-700 dark:text-indigo-400 tracking-tight">6 Hãng Lớn</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">GHTK, GHN, Viettel, SPX, VNPost, J&T</div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs hover:border-amber-200 dark:hover:border-amber-800 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quy chuẩn</span>
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-amber-700 dark:text-amber-400 tracking-tight">Chuẩn 72h</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Bám sát thời hạn khiếu nại bưu cục</div>
          </div>
        </div>

        {/* Interactive Before/After Visual Demo Card */}
        <div className="max-w-2xl mx-auto mb-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 sm:p-5 text-left transition-all">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider">
                Thực Tế Đối Soát
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Ví dụ 1 đơn hàng bị bưu cục "ăn chặn" điển hình:
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
              Lệch: -24.000 đ/đơn
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Cột Bưu Cục Tính */}
            <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100/90 dark:border-rose-900/60">
              <div className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                <span>Bưu Cục Kê Khống (Không Có AI):</span>
              </div>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                <li>• Cân nặng ghi nhận: <b className="text-rose-700 dark:text-rose-400">1.450 gram</b> (Nấc 1.5kg)</li>
                <li>• Cước thực tế trừ: <b className="text-rose-700 dark:text-rose-400">42.000 đ</b></li>
                <li>• Kết quả: <span className="text-rose-600 dark:text-rose-400 italic">Shop không biết nên âm thầm mất tiền</span></li>
              </ul>
            </div>

            {/* Cột SoatDon.vn Phát Hiện */}
            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100/90 dark:border-emerald-900/60">
              <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>SoatDon.vn Phát Hiện (Có AI):</span>
              </div>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                <li>• Thể tích thực: <b>15x10x5 cm (~250 gram)</b></li>
                <li>• Cước chuẩn thỏa thuận: <b className="text-emerald-700 dark:text-emerald-400">18.000 đ</b></li>
                <li>• Kết quả: <b className="text-emerald-700 dark:text-emerald-400">Xuất file đòi lại 24.000 đ thành công!</b></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Carrier trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xs text-slate-600 dark:text-slate-400">
          <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs">Hỗ trợ đầy đủ bảng kê các hãng:</span>
          {[
            { name: 'GHTK', color: 'emerald' },
            { name: 'GHN', color: 'orange' },
            { name: 'Viettel Post', color: 'red' },
            { name: 'Shopee Xpress', color: 'sky' },
            { name: 'VNPost Bưu Điện', color: 'amber' },
            { name: 'J&T Express', color: 'rose' }
          ].map((c) => (
            <span 
              key={c.name} 
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xs text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{c.name}</span>
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
