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
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>Công cụ ước tính thất thoát tài chính</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Ước tính số tiền shop bạn đang bị "chảy máu" mỗi tháng
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Kéo thanh trượt theo quy mô đơn hàng của shop để xem con số giật mình.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Sliders */}
          <div className="space-y-6 bg-slate-50/80 p-6 rounded-2xl border border-slate-200">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-slate-700">
                  Số lượng đơn gửi mỗi ngày:
                </label>
                <span className="text-base font-mono font-bold text-indigo-700 bg-indigo-100 px-3 py-0.5 rounded-lg border border-indigo-200">
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
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                <span>10 đơn</span>
                <span>250 đơn</span>
                <span>500 đơn</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-slate-700">
                  Tỷ lệ hoàn hàng của shop:
                </label>
                <span className="text-base font-mono font-bold text-rose-700 bg-rose-100 px-3 py-0.5 rounded-lg border border-rose-200">
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
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                <span>3% (Thấp)</span>
                <span>15% (Trung bình)</span>
                <span>30% (Thời trang cao)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Quy mô: <b>{monthlyOrders.toLocaleString('vi-VN')} đơn/tháng</b> (~{Math.round(returnOrders)} đơn hoàn). Thất thoát thường âm thầm diễn ra mà chủ shop không phát hiện vì không có thời gian soi hàng nghìn dòng Excel.
              </span>
            </div>
          </div>

          {/* Results display */}
          <div className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 p-6 sm:p-8 rounded-2xl text-center shadow-xs relative">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Số tiền shop bạn có thể đang mất oan
            </span>

            <div className="text-3xl sm:text-5xl font-black font-mono text-slate-900 my-3 tracking-tight">
              ~{totalMonthlyLoss.toLocaleString('vi-VN')} <span className="text-base font-normal text-rose-700">VNĐ/tháng</span>
            </div>

            <p className="text-xs text-slate-500 mb-6 font-mono font-medium">
              (Tương đương mất khoảng <b className="text-rose-700 font-bold">{annualLoss.toLocaleString('vi-VN')} VNĐ/năm</b>)
            </p>

            <div className="space-y-2 text-xs text-left mb-6 bg-white p-4 rounded-xl border border-rose-100 shadow-2xs">
              <div className="flex justify-between text-slate-700">
                <span>• Bị kê lố cân nặng:</span>
                <span className="font-mono font-bold text-amber-600">~{weightLoss.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>• Đơn hoàn thất lạc/ngâm kho:</span>
                <span className="font-mono font-bold text-rose-600">~{returnLoss.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>• Phụ phí và chênh lệch cước:</span>
                <span className="font-mono font-bold text-indigo-600">~{otherLoss.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <button
              onClick={onOpenPricing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Chỉ từ 9.000đ để bảo vệ khoản tiền này</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
