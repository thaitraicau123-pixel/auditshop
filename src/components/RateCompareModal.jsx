import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Calculator, ArrowRight, CheckCircle2, Zap, Clock, ShieldCheck, 
  HelpCircle, Sparkles, TrendingDown, Scale, DollarSign, Package, AlertCircle 
} from 'lucide-react';
import { REGIONS, calculateAllCarrierRates } from '../utils/shippingRateCalculator';

export default function RateCompareModal({ isOpen, onClose }) {
  const [fromRegion, setFromRegion] = useState('HN_INNER');
  const [toRegion, setToRegion] = useState('HCM_INNER');
  const [actualWeight, setActualWeight] = useState(350);
  const [length, setLength] = useState(20);
  const [width, setWidth] = useState(15);
  const [height, setHeight] = useState(10);
  const [codAmount, setCodAmount] = useState(350000);
  const [declaredValue, setDeclaredValue] = useState(350000);

  // Thoát nhanh bằng phím Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Tính toán bảng cước thời gian thực
  const rateCalculation = useMemo(() => {
    return calculateAllCarrierRates({
      fromRegion,
      toRegion,
      actualWeight: Number(actualWeight) || 100,
      length: Number(length) || 10,
      width: Number(width) || 10,
      height: Number(height) || 5,
      codAmount: Number(codAmount) || 0,
      declaredValue: Number(declaredValue) || 0
    });
  }, [fromRegion, toRegion, actualWeight, length, width, height, codAmount, declaredValue]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 md:p-6 flex items-start justify-center animate-fade-in font-sans"
    >
      <div className="bg-white border border-slate-200/90 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] relative text-slate-800">
        
        {/* Header Cố Định */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0 mr-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Calculator className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base md:text-lg tracking-wide truncate">
                  Bảng So Sánh &amp; Tra Cứu Cước Chuẩn 6 Hãng
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  LIVE RATE MATRIX
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate hidden sm:block">
                Tự động tính quy đổi thể tích DxRxC và so sánh biểu phí GHTK, GHN, Viettel Post, SPX, J&amp;T, VNPost
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 transition-colors flex items-center justify-center cursor-pointer shrink-0 shadow-xs"
            title="Đóng cửa sổ (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thân Modal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/60 space-y-6">
          
          {/* Bộ điều khiển thông số kiện hàng */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
            <h4 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600" />
              <span>Thông Số Kiện Hàng &amp; Tuyến Vận Chuyển</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Điểm đi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Điểm gửi đi</label>
                <select
                  value={fromRegion}
                  onChange={(e) => setFromRegion(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {REGIONS.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Điểm đến */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Điểm phát đến</label>
                <select
                  value={toRegion}
                  onChange={(e) => setToRegion(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {REGIONS.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Cân nặng thực tế */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Cân thực tế (gram)</label>
                  <span className="font-mono text-xs font-black text-indigo-600">{actualWeight}g</span>
                </div>
                <input 
                  type="number"
                  min="50"
                  max="30000"
                  step="50"
                  value={actualWeight}
                  onChange={(e) => setActualWeight(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>

              {/* Tiền thu hộ COD */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Tiền thu hộ COD</label>
                  <span className="font-mono text-xs font-black text-emerald-600">{codAmount.toLocaleString('vi-VN')} đ</span>
                </div>
                <input 
                  type="number"
                  min="0"
                  max="50000000"
                  step="10000"
                  value={codAmount}
                  onChange={(e) => setCodAmount(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Kích thước thể tích DxRxC */}
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Chiều Dài (D cm)</label>
                <input 
                  type="number"
                  min="1"
                  max="200"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Chiều Rộng (R cm)</label>
                <input 
                  type="number"
                  min="1"
                  max="200"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Chiều Cao (C cm)</label>
                <input 
                  type="number"
                  min="1"
                  max="200"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Banner Tiết Kiệm Tối Đa */}
          {rateCalculation.maxSaving > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm sm:text-base">
                    Gợi ý tối ưu: Chọn {rateCalculation.cheapestCarrier?.carrierName} tiết kiệm ngay {rateCalculation.maxSaving.toLocaleString('vi-VN')} đ/đơn!
                  </div>
                  <div className="text-xs text-emerald-100">
                    Cước thấp nhất: {rateCalculation.cheapestCarrier?.totalFee.toLocaleString('vi-VN')} đ (Thời gian giao {rateCalculation.cheapestCarrier?.slaHours})
                  </div>
                </div>
              </div>
              <span className="hidden sm:inline px-3 py-1.5 rounded-xl bg-white text-emerald-800 text-xs font-black shadow-xs shrink-0">
                LỰA CHỌN TỐI ƯU
              </span>
            </div>
          )}

          {/* Ma Trận So Sánh 6 Hãng */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rateCalculation.comparedList.map((carrier, idx) => {
              const isBest = carrier.bestValue;

              return (
                <div 
                  key={carrier.carrierId}
                  className={`rounded-3xl border p-5 transition-all relative flex flex-col justify-between ${
                    isBest 
                      ? 'bg-gradient-to-b from-emerald-50/80 to-white border-emerald-400 shadow-md ring-2 ring-emerald-500/20' 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {isBest && (
                    <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                      ⭐ Rẻ Nhất
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {carrier.shortName}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 font-mono">
                        Top #{idx + 1}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mb-4 line-clamp-1">
                      {carrier.tagline}
                    </p>

                    {/* Cước Tổng Lớn */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Tổng Cước Ước Tính</div>
                      <div className={`text-2xl font-black font-mono ${isBest ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {carrier.totalFee.toLocaleString('vi-VN')} đ
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>SLA giao hàng: <b>{carrier.slaHours}</b></span>
                      </div>
                    </div>

                    {/* Chi Tiết Cân Nặng & Phụ Phí */}
                    <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <div className="flex justify-between">
                        <span>Cân thực tế:</span>
                        <span className="font-mono font-semibold">{carrier.actualWeight}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quy đổi DxRxC:</span>
                        <span className={`font-mono font-semibold ${carrier.isVolumetricHeavier ? 'text-rose-600 font-bold' : ''}`}>
                          {carrier.volumetricWeight}g {carrier.isVolumetricHeavier && '(Vượt cân thực)'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cân tính cước:</span>
                        <span className="font-mono font-black text-indigo-700">{carrier.chargeableWeight}g</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-dashed border-slate-100">
                        <span>Phụ phí COD:</span>
                        <span className="font-mono">{carrier.codFee > 0 ? `${carrier.codFee.toLocaleString('vi-VN')} đ` : 'Miễn phí'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 italic">
                    {carrier.codPolicy}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Footer Cố Định */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Biểu phí được cập nhật bám sát hợp đồng nguyên tắc các hãng năm 2026</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            ← Đóng Cửa Sổ (Esc)
          </button>
        </div>

      </div>
    </div>
  );
}
