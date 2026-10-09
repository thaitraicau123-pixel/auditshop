import React from 'react';
import { AlertTriangle, Scale, PackageX, Receipt, Banknote, ShieldAlert, RotateCcw, FileText, CheckCircle2 } from 'lucide-react';

export default function AuditDashboard({ auditResult, fileName, onReset, activeFilter, onFilterChange, isUnlocked, onUnlockClick }) {
  if (!auditResult) return null;

  const { totalOrders, anomalyCount, totalLeakage, breakdown } = auditResult;
  const anomalyRate = ((anomalyCount / totalOrders) * 100).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
      {/* File scanned info bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 bg-slate-800/60 border border-slate-700/80 px-4 py-3 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <span>Đã hoàn thành kiểm toán:</span>
              <span className="font-mono text-emerald-400 font-bold">{fileName}</span>
            </div>
            <p className="text-xs text-slate-400">
              Đã rà soát <b>{totalOrders} đơn hàng</b> • Phát hiện <b>{anomalyCount} đơn bất thường</b> ({anomalyRate}%)
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/40 hover:bg-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Quét file khác</span>
        </button>
      </div>

      {/* Main Alert Banner */}
      <div className="bg-gradient-to-r from-red-950/80 via-rose-950/70 to-slate-900 border-2 border-red-500/50 rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl glow-danger relative overflow-hidden">
        <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
              <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-xs font-bold uppercase tracking-wider mb-2 border border-red-500/30">
                Phát hiện thất thoát nghiêm trọng
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Ước tính bị trừ oan: <span className="text-red-400 font-mono underline decoration-red-400/40">{totalLeakage.toLocaleString('vi-VN')} VNĐ</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-xl">
                Nếu không khiếu nại trước thời hạn (trong 48h - 72h), số tiền này sẽ bị các đơn vị vận chuyển khấu trừ vĩnh viễn vào chi phí kỳ đối soát.
              </p>
            </div>
          </div>

          {!isUnlocked && (
            <button
              onClick={onUnlockClick}
              className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-sm sm:text-base shadow-xl shadow-rose-500/30 transition-all transform hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
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
          className={`p-5 rounded-xl border transition-all cursor-pointer ${
            activeFilter === 'WEIGHT_INFLATION' 
              ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10' 
              : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Kê lố cân nặng</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-white mb-1">
            {breakdown.weight.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
          </div>
          <p className="text-xs text-slate-400 leading-snug">
            Bị nhảy nấc cước do hãng cân lố 400g - 800g so với thực tế gói hàng.
          </p>
        </div>

        {/* Card 2: Đơn hoàn ngâm */}
        <div 
          onClick={() => onFilterChange('RETURN_STALLED')}
          className={`p-5 rounded-xl border transition-all cursor-pointer ${
            activeFilter === 'RETURN_STALLED' 
              ? 'bg-rose-500/10 border-rose-500 shadow-lg shadow-rose-500/10' 
              : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Hàng hoàn ngâm quá hạn</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <PackageX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-white mb-1">
            {breakdown.returns.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
          </div>
          <p className="text-xs text-slate-400 leading-snug">
            Đơn hoàn &gt; 72h không trả về shop. Rủi ro mất hàng/tráo ruột cực cao.
          </p>
        </div>

        {/* Card 3: Phụ phí ảo */}
        <div 
          onClick={() => onFilterChange('FEE_ANOMALY')}
          className={`p-5 rounded-xl border transition-all cursor-pointer ${
            activeFilter === 'FEE_ANOMALY' 
              ? 'bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/10' 
              : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Phụ phí bất thường</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-white mb-1">
            {breakdown.fee.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
          </div>
          <p className="text-xs text-slate-400 leading-snug">
            Phí lưu kho ảo, phụ phí vùng sâu vùng xa tự ý thêm vào bảng kê.
          </p>
        </div>

        {/* Card 4: Lệch tiền COD */}
        <div 
          onClick={() => onFilterChange('COD_DISCREPANCY')}
          className={`p-5 rounded-xl border transition-all cursor-pointer ${
            activeFilter === 'COD_DISCREPANCY' 
              ? 'bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10' 
              : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Lệch tiền thu hộ COD</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-white mb-1">
            {breakdown.cod.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
          </div>
          <p className="text-xs text-slate-400 leading-snug">
            Chênh lệch giữa số tiền shipper thu của khách và tiền chuyển khoản về shop.
          </p>
        </div>
      </div>

      {/* Filters pill bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <span className="text-xs text-slate-400 font-semibold mr-2">Lọc theo loại lỗi:</span>
        <button
          onClick={() => onFilterChange('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-white text-slate-900 shadow'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Tất cả lỗi ({anomalyCount})
        </button>
        <button
          onClick={() => onFilterChange('WEIGHT_INFLATION')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'WEIGHT_INFLATION'
              ? 'bg-amber-400 text-slate-900 shadow'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Lệch cân nặng
        </button>
        <button
          onClick={() => onFilterChange('RETURN_STALLED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'RETURN_STALLED'
              ? 'bg-rose-500 text-white shadow'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Đơn hoàn ngâm
        </button>
        <button
          onClick={() => onFilterChange('FEE_ANOMALY')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'FEE_ANOMALY'
              ? 'bg-blue-500 text-white shadow'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Phụ phí ảo
        </button>
      </div>
    </div>
  );
}
