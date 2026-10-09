import React, { useState } from 'react';
import { Calculator, ArrowRight, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

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
    <section id="roi-calculator" className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <Calculator className="w-4 h-4" />
            <span>Công cụ ước tính thất thoát tài chính</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
            Ước tính số tiền shop bạn đang bị "chảy máu" mỗi tháng
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Kéo thanh trượt theo quy mô đơn hàng của shop để xem con số giật mình.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Sliders */}
          <div className="space-y-6 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-300">
                  Số lượng đơn gửi mỗi ngày:
                </label>
                <span className="text-lg font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-0.5 rounded-lg border border-amber-400/20">
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
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>10 đơn</span>
                <span>250 đơn</span>
                <span>500 đơn</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-300">
                  Tỷ lệ hoàn hàng của shop:
                </label>
                <span className="text-lg font-mono font-bold text-rose-400 bg-rose-400/10 px-3 py-0.5 rounded-lg border border-rose-400/20">
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
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>3% (Thấp)</span>
                <span>15% (Trung bình)</span>
                <span>30% (Thời trang cao)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-400 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Quy mô: <b>{monthlyOrders.toLocaleString('vi-VN')} đơn/tháng</b> (~{Math.round(returnOrders)} đơn hoàn). Thất thoát thường âm thầm diễn ra mà chủ shop không phát hiện vì không có thời gian soi hàng nghìn dòng Excel.
              </span>
            </div>
          </div>

          {/* Results display */}
          <div className="bg-gradient-to-br from-rose-950/60 to-slate-900 border-2 border-rose-500/40 p-6 sm:p-8 rounded-2xl text-center shadow-xl relative">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Số tiền shop bạn có thể đang mất oan
            </span>

            <div className="text-3xl sm:text-5xl font-black font-mono text-white my-3 tracking-tight">
              ~{totalMonthlyLoss.toLocaleString('vi-VN')} <span className="text-base font-normal text-rose-300">VNĐ/tháng</span>
            </div>

            <p className="text-xs text-slate-400 mb-6 font-mono">
              (Tương đương mất khoảng <b className="text-amber-400">{annualLoss.toLocaleString('vi-VN')} VNĐ/năm</b>)
            </p>

            <div className="space-y-2 text-xs text-left mb-6 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div className="flex justify-between text-slate-300">
                <span>• Bị kê lố cân nặng:</span>
                <span className="font-mono font-bold text-amber-400">~{weightLoss.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>• Đơn hoàn thất lạc/ngâm kho:</span>
                <span className="font-mono font-bold text-rose-400">~{returnLoss.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>• Phụ phí và chênh lệch cước:</span>
                <span className="font-mono font-bold text-blue-400">~{otherLoss.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <button
              onClick={onOpenPricing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Chỉ từ 199k/tháng để bảo vệ khoản tiền này</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
