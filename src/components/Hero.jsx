import React, { useState } from 'react';
import { 
  AlertTriangle, ArrowDown, CheckCircle2, ShieldAlert, ShieldCheck, 
  Zap, DollarSign, TrendingDown, Clock, Sparkles, Scale, PackageX, ChevronRight, FileText
} from 'lucide-react';

export default function Hero({ onStartDemo }) {
  const [showDemoDetail, setShowDemoDetail] = useState(false);

  return (
    <section className="relative pt-10 sm:pt-16 pb-12 overflow-hidden bg-tech-grid">
      {/* Background ambient lighting blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[420px] bg-gradient-to-b from-indigo-200/40 via-blue-100/25 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
        
        {/* Badge Alert */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200/90 text-rose-800 text-xs sm:text-sm font-bold mb-6 shadow-xs animate-float">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
          </span>
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Báo động: 87% Shop Online bị "chảy máu" 3 - 10 triệu/tháng vì kê khống nấc cân & giam đơn hoàn</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
          Lấy lại từng đồng <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent underline decoration-indigo-300 decoration-wavy decoration-2">bị trừ oan</span> từ các hãng vận chuyển trong 10 giây
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed font-normal">
          Hệ thống AI tự động phát hiện <b>kê khống cân nặng</b>, <b>đơn hoàn ngâm kho quá 72h</b>, <b>phụ phí khống</b> và <b>lệch tiền COD</b> từ file đối soát Excel của GHTK, GHN, Viettel Post, SPX, TikTok Shop. Xuất ngay biên bản khiếu nại chuẩn để đòi tiền về ví!
        </p>

        {/* 4 Live Trust Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 max-w-4xl mx-auto mb-10 text-left">
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-indigo-200 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đã rà soát</span>
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-slate-900 tracking-tight">1.482.000+</div>
            <div className="text-[11px] text-slate-500">Đơn hàng tự động</div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-emerald-200 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đã thu hồi</span>
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-700 tracking-tight">4.62+ Tỷ VNĐ</div>
            <div className="text-[11px] text-slate-500">Tiền oan về ví shop</div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-indigo-200 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tốc độ quét</span>
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-indigo-700 tracking-tight">10 Giây</div>
            <div className="text-[11px] text-slate-500">Xử lý xong 1.000 đơn</div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-amber-200 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bảo mật</span>
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-slate-900 tracking-tight">100% Client</div>
            <div className="text-[11px] text-slate-500">Không lưu data khách</div>
          </div>
        </div>

        {/* Interactive Before/After Visual Demo Card */}
        <div className="max-w-2xl mx-auto mb-10 rounded-2xl bg-white border border-slate-200/90 shadow-sm p-4 sm:p-5 text-left transition-all">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider">
                Thực Tế Đối Soát
              </span>
              <span className="text-xs font-bold text-slate-800">
                Ví dụ 1 đơn hàng bị bưu cục "ăn chặn" điển hình:
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Lệch: -24.000 đ/đơn
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Cột Bưu Cục Tính */}
            <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100/90">
              <div className="font-bold text-rose-900 flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                <span>Bưu Cục Kê Khống (Không Có AI):</span>
              </div>
              <ul className="space-y-1 text-slate-600 text-[11px]">
                <li>• Cân nặng ghi nhận: <b className="text-rose-700">1.450 gram</b> (Nấc 1.5kg)</li>
                <li>• Cước thực tế trừ: <b className="text-rose-700">42.000 đ</b></li>
                <li>• Kết quả: <span className="text-rose-600 italic">Shop không biết nên âm thầm mất tiền</span></li>
              </ul>
            </div>

            {/* Cột SoatDon.vn Phát Hiện */}
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100/90">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>SoatDon.vn Phát Hiện (Có AI):</span>
              </div>
              <ul className="space-y-1 text-slate-600 text-[11px]">
                <li>• Thể tích thực: <b>15x10x5 cm (~250 gram)</b></li>
                <li>• Cước chuẩn thỏa thuận: <b className="text-emerald-700">18.000 đ</b></li>
                <li>• Kết quả: <b className="text-emerald-700">Xuất file đòi lại 24.000 đ thành công!</b></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Carrier trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xs text-slate-600">
          <span className="text-slate-500 font-semibold text-xs">Hỗ trợ đầy đủ bảng kê các hãng:</span>
          {[
            { name: 'GHTK', color: 'emerald' },
            { name: 'GHN', color: 'orange' },
            { name: 'Viettel Post', color: 'red' },
            { name: 'Shopee Xpress', color: 'sky' },
            { name: 'TikTok Shop Logistics', color: 'purple' },
            { name: 'J&T Express', color: 'rose' }
          ].map((c) => (
            <span 
              key={c.name} 
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-slate-800 font-bold flex items-center gap-1.5 hover:border-slate-300 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{c.name}</span>
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
