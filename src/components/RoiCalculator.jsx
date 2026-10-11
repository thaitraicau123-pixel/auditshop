import React, { useState } from 'react';
import { Calculator, ArrowRight, TrendingUp, Sparkles, AlertCircle, ShieldCheck, DollarSign, Zap } from 'lucide-react';

export default function RoiCalculator({ onOpenPricing }) {
  const [ordersPerDay, setOrdersPerDay] = useState(80);
  const [returnRate, setReturnRate] = useState(12);

  const monthlyOrders = ordersPerDay * 30;
  
  // Ước tính: trung bình 8% đơn bị kê lố cân nặng (mỗi đơn lệch 12k - 18k)
  const weightLoss = Math.round(monthlyOrders * 0.08 * 15000);
  
  // Ước tính: 3% đơn hoàn bị ngâm quá hạn hoặc rủi ro mất/tráo kiện (trung bình giá trị hàng 250k)
  const returnOrders = monthlyOrders * (returnRate / 100);
  const returnLoss = Math.round(returnOrders * 0.03 * 250000);

  // Phụ phí và chênh lệch khác
  const otherLoss = Math.round(monthlyOrders * 0.02 * 20000);

  const totalMonthlyLoss = weightLoss + returnLoss + otherLoss;
  const annualLoss = totalMonthlyLoss * 12;

  return (
    <section id="roi-calculator" className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden transition-all">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold mb-3 shadow-2xs">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>Công Cụ Mô Phỏng Tổn Thất Tài Chính</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Ước tính số tiền shop bạn đang bị "chảy máu" mỗi tháng
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Kéo thanh trượt theo quy mô đơn hàng thực tế của shop để xem con số thất thoát giật mình.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Interactive Sliders */}
          <div className="space-y-6 bg-slate-50/80 p-6 sm:p-7 rounded-3xl border border-slate-200">
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="text-xs sm:text-sm font-bold text-slate-700">
                  Số lượng đơn gửi mỗi ngày:
                </label>
                <span className="text-sm sm:text-base font-mono font-black text-indigo-700 bg-indigo-100/80 px-3 py-1 rounded-xl border border-indigo-200">
                  {ordersPerDay} đơn/ngày
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="5"
                value={ordersPerDay}
                onChange={(e) => setOrdersPerDay(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-semibold">
                <span>10 đơn</span>
                <span>250 đơn</span>
                <span>500 đơn</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="text-xs sm:text-sm font-bold text-slate-700">
                  Tỷ lệ hàng hoàn trung bình:
                </label>
                <span className="text-sm sm:text-base font-mono font-black text-rose-700 bg-rose-100/80 px-3 py-1 rounded-xl border border-rose-200">
                  {returnRate}%
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="30"
                step="1"
                value={returnRate}
                onChange={(e) => setReturnRate(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-semibold">
                <span>3% (Rất thấp)</span>
                <span>15% (Trung bình)</span>
                <span>30% (Nguy hiểm)</span>
              </div>
            </div>

            {/* Micro Breakdown pills */}
            <div className="pt-2 border-t border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>• Kê khống nấc cân (~8% đơn):</span>
                <b className="font-mono text-slate-800">{weightLoss.toLocaleString('vi-VN')} đ</b>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>• Hàng hoàn ngâm/mất kiện (~3% hoàn):</span>
                <b className="font-mono text-slate-800">{returnLoss.toLocaleString('vi-VN')} đ</b>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>• Phụ phí ảo & lệch cước COD:</span>
                <b className="font-mono text-slate-800">{otherLoss.toLocaleString('vi-VN')} đ</b>
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-7 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-40 h-40 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 mb-6">
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Số tiền ước tính shop bị trừ oan</span>
              </div>
              
              <div className="text-3xl sm:text-4xl font-black font-mono text-rose-400 tracking-tight my-2">
                -{totalMonthlyLoss.toLocaleString('vi-VN')} <span className="text-sm font-normal text-slate-300">đ/tháng</span>
              </div>
              
              <div className="text-xs text-slate-300">
                Tương đương <b className="text-amber-400 font-mono font-black">{annualLoss.toLocaleString('vi-VN')} đ/năm</b> bị mất trắng nếu không rà soát bảng kê đều đặn.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 mb-6 relative z-10">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hiệu quả đầu tư (ROI vượt trội):</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                Chỉ với chi phí quét đối soát từ <b>9.000 đ/lần</b>, bạn có thể cứu lại hàng triệu đồng doanh thu mỗi tháng.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenPricing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] relative z-10"
            >
              <span>Xem Bảng Giá & Bắt Đầu Bảo Vệ Doanh Thu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
