import React from 'react';
import { AlertTriangle, ArrowDown, CheckCircle2, ShieldAlert, ShieldCheck, Zap } from 'lucide-react';

export default function Hero({ onStartDemo }) {
  return (
    <section className="relative pt-12 pb-10 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-indigo-100/60 via-blue-50/40 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge alert */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs sm:text-sm font-semibold mb-6 shadow-xs">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>87% Shop online bị "rút ruột" 3 - 10 triệu/tháng vì chênh cân & giam đơn hoàn</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.18] mb-6">
          Lấy lại tiền <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent underline decoration-indigo-300">bị trừ oan</span> từ các hãng vận chuyển trong 10 giây
        </h1>

        {/* Subhead */}
        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed font-normal">
          Tự động phát hiện <b>kê khống cân nặng</b>, <b>đơn hoàn ngâm quá hạn 72h</b>, <b>phụ phí ảo</b> và <b>lệch tiền COD</b> từ file đối soát Excel của GHTK, GHN, Shopee Xpress, TikTok Shop. Xuất ngay đơn khiếu nại chuẩn để đòi tiền về ví.
        </p>

        {/* Carrier list pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xs text-slate-600 mb-8">
          <span className="text-slate-500 font-semibold">Đối tác vận chuyển hỗ trợ:</span>
          {['Giao Hàng Tiết Kiệm (GHTK)', 'Giao Hàng Nhanh (GHN)', 'Shopee Xpress (SPX)', 'TikTok Shop Logistics', 'Viettel Post', 'J&T Express'].map((name) => (
            <span key={name} className="px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-xs text-slate-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{name}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
