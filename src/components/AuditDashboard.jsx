import React, { useEffect } from 'react';
import { 
  AlertTriangle, Scale, PackageX, Receipt, Banknote, ShieldAlert, 
  RotateCcw, FileText, CheckCircle2, Sparkles, Bot, Loader2, Trophy, PartyPopper 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AuditDashboard({ 
  auditResult, 
  fileName, 
  onReset, 
  activeFilter, 
  onFilterChange, 
  isUnlocked, 
  onUnlockClick,
  aiDiagnosis,
  isLoadingAi
}) {
  if (!auditResult) return null;

  const { totalOrders, anomalyCount, totalLeakage, breakdown } = auditResult;
  const anomalyRate = ((anomalyCount / totalOrders) * 100).toFixed(1);

  // Hiệu ứng pháo hoa khi không có lỗi nào
  useEffect(() => {
    if (anomalyCount === 0) {
      const end = Date.now() + 3500;
      const colors = ['#10B981', '#34D399', '#F59E0B', '#60A5FA', '#A78BFA'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [anomalyCount]);

  // MÀN HÌNH CHÚC MỪNG NẾU KHÔNG CÓ LỖI NÀO
  if (anomalyCount === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-16">
        <div className="bg-white border-2 border-emerald-500/50 rounded-3xl p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/25">
            <Trophy className="w-10 h-10 text-white animate-bounce" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold uppercase tracking-wider mb-3">
            <PartyPopper className="w-4 h-4 text-emerald-600" />
            <span>Bảng kê đối soát hoàn hảo 100%</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
            🎉 CHÚC MỪNG SHOP! KHÔNG PHÁT HIỆN THẤT THOÁT NÀO
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Toàn bộ <b>{totalOrders} đơn hàng</b> trong file đối soát <b className="text-emerald-700 font-mono">{fileName}</b> đều được bên vận chuyển tính chuẩn xác: đúng nấc cân nặng, không bị tính phụ phí oan và không có đơn hoàn nào bị giam quá hạn!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-8 text-left">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-900">Khối lượng chuẩn 100%</div>
                <div className="text-[11px] text-slate-500">Không có đơn nào bị kê khống nấc cân</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-900">0 đơn hoàn ngâm kho</div>
                <div className="text-[11px] text-slate-500">Tất cả đơn chuyển hoàn đều đúng tiến độ</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-900">Cước & COD đối soát đủ</div>
                <div className="text-[11px] text-slate-500">Không phát sinh phụ phí bất thường</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={onReset}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Quét bảng kê kỳ khác</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
      {/* File scanned info bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 bg-white border border-slate-200/90 px-4 py-3 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Đã hoàn thành kiểm toán:</span>
              <span className="font-mono text-indigo-600">{fileName}</span>
            </div>
            <p className="text-xs text-slate-500">
              Đã rà soát <b>{totalOrders} đơn hàng</b> • Phát hiện <b>{anomalyCount} đơn bất thường</b> ({anomalyRate}%)
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Quét file khác</span>
        </button>
      </div>

      {/* AI Diagnosis Insights if available */}
      {isLoadingAi && (
        <div className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center gap-3 text-indigo-900 text-xs sm:text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>🤖 Hệ thống AI đang tổng hợp báo cáo chẩn đoán nguyên nhân thất thoát...</span>
        </div>
      )}

      {aiDiagnosis && (
        <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-indigo-50/80 border border-indigo-200/90 shadow-xs">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-indigo-950 uppercase tracking-wide">
              Báo Cáo Chẩn Đoán Chuyên Gia Logistics (Hệ Thống AI Đối Soát Độc Quyền)
            </h3>
          </div>
          <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-normal">
            {aiDiagnosis}
          </div>
        </div>
      )}

      {/* Main Alert Banner */}
      <div className="bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 border border-red-200 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-rose-100 text-rose-600 border border-rose-200 shrink-0 shadow-xs">
              <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-2 border border-rose-300">
                Phát hiện thất thoát nghiêm trọng
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Ước tính bị trừ oan: <span className="text-rose-600 font-mono underline decoration-rose-300">{totalLeakage.toLocaleString('vi-VN')} VNĐ</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl">
                Nếu không khiếu nại trước thời hạn (trong 48h - 72h), số tiền này sẽ bị các đơn vị vận chuyển khấu trừ vĩnh viễn vào chi phí kỳ đối soát.
              </p>
            </div>
          </div>

          {!isUnlocked && (
            <button
              onClick={onUnlockClick}
              className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/25 transition-all transform hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-5 h-5" />
              <span>Mở khóa mã đơn & Xuất file khiếu nại</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Categorized Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Kê cân nặng */}
        <div 
          onClick={() => onFilterChange('WEIGHT_INFLATION')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'WEIGHT_INFLATION' 
              ? 'bg-amber-50/80 border-amber-400 shadow-sm ring-1 ring-amber-400' 
              : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Kê lố cân nặng</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mb-1">
            {breakdown.weight.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">đ</span>
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            Bị nhảy nấc cước do hãng cân lố 400g - 800g so với thực tế gói hàng.
          </p>
        </div>

        {/* Card 2: Đơn hoàn ngâm */}
        <div 
          onClick={() => onFilterChange('RETURN_STALLED')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'RETURN_STALLED' 
              ? 'bg-rose-50/80 border-rose-400 shadow-sm ring-1 ring-rose-400' 
              : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Hàng hoàn ngâm quá hạn</span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <PackageX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mb-1">
            {breakdown.returns.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">đ</span>
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            Đơn hoàn &gt; 72h không trả về shop. Rủi ro mất hàng/tráo ruột cực cao.
          </p>
        </div>

        {/* Card 3: Phụ phí ảo */}
        <div 
          onClick={() => onFilterChange('FEE_ANOMALY')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'FEE_ANOMALY' 
              ? 'bg-blue-50/80 border-blue-400 shadow-sm ring-1 ring-blue-400' 
              : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Phụ phí bất thường</span>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mb-1">
            {breakdown.fee.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">đ</span>
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            Phí lưu kho ảo, phụ phí vùng sâu vùng xa tự ý thêm vào bảng kê.
          </p>
        </div>

        {/* Card 4: Lệch tiền COD */}
        <div 
          onClick={() => onFilterChange('COD_DISCREPANCY')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'COD_DISCREPANCY' 
              ? 'bg-emerald-50/80 border-emerald-400 shadow-sm ring-1 ring-emerald-400' 
              : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Lệch tiền thu hộ COD</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mb-1">
            {breakdown.cod.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">đ</span>
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            Chênh lệch giữa số tiền shipper thu của khách và tiền chuyển khoản về shop.
          </p>
        </div>
      </div>

      {/* Filters pill bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs text-slate-500 font-semibold mr-2">Lọc theo loại lỗi:</span>
        <button
          onClick={() => onFilterChange('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tất cả lỗi ({anomalyCount})
        </button>
        <button
          onClick={() => onFilterChange('WEIGHT_INFLATION')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'WEIGHT_INFLATION'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Lệch cân nặng
        </button>
        <button
          onClick={() => onFilterChange('RETURN_STALLED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'RETURN_STALLED'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Đơn hoàn ngâm
        </button>
        <button
          onClick={() => onFilterChange('FEE_ANOMALY')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'FEE_ANOMALY'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Phụ phí ảo
        </button>
        <button
          onClick={() => onFilterChange('COD_DISCREPANCY')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'COD_DISCREPANCY'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Lệch COD / Chuyển khoản
        </button>
      </div>
    </div>
  );
}
