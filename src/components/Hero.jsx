import React from 'react';
import { AlertTriangle, ArrowDown, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function Hero({ onStartDemo }) {
  return (
    <section className="relative pt-12 pb-10 overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-rose-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge alert */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm font-semibold mb-6 animate-pulse">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>87% Shop online bị "rút ruột" 3 - 10 triệu/tháng vì chênh cân & giam đơn hoàn</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] mb-6">
          Lấy lại tiền <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-amber-500 bg-clip-text text-transparent underline decoration-rose-500/30">bị trừ oan</span> từ các hãng vận chuyển trong 10 giây
        </h1>

        {/* Subhead */}
        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed font-normal">
          Tự động phát hiện <b>kê khống cân nặng</b>, <b>đơn hoàn ngâm quá hạn 72h</b>, <b>phụ phí ảo</b> và <b>lệch tiền COD</b> từ file đối soát Excel của GHTK, GHN, Shopee Xpress, TikTok Shop. Xuất ngay đơn khiếu nại chuẩn để đòi tiền về ví.
        </p>

        {/* Carrier list pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-slate-400 mb-10">
          <span className="text-slate-500 font-medium">Hỗ trợ đầy đủ file đối soát từ:</span>
          {['Giao Hàng Tiết Kiệm (GHTK)', 'Giao Hàng Nhanh (GHN)', 'Shopee Xpress (SPX)', 'TikTok Shop Logistics', 'Viettel Post', 'J&T Express'].map((name) => (
            <span key={name} className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 font-medium">
              ✓ {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
