import React, { useEffect, useState } from 'react';
import { AlertOctagon, X, ShieldAlert, Clock, ArrowRight, Flame, Scale, PackageX, Receipt } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function EmergencyAlertModal({ isOpen, onClose, totalLeakage, anomalyCount, fileName, onGoToDispute, breakdown }) {
  if (!isOpen) return null;

  const [timeLeft, setTimeLeft] = useState({ hours: 47, minutes: 59, seconds: 45 });

  useEffect(() => {
    sounds.playAlarm();

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/85 backdrop-blur-xl animate-fadeIn">
      {/* Background strobe flashes */}
      <div className="absolute inset-0 bg-radial from-red-600/20 via-transparent to-transparent animate-pulse pointer-events-none" />

      <div className="bg-slate-950 border-3 border-red-500 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-[0_0_80px_rgba(239,68,68,0.5)] relative my-8 overflow-hidden animate-scaleUp">
        {/* Glowing background gradient */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Siren Header */}
        <div className="text-center mb-6">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-3xl bg-red-500/30 animate-ping" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-2xl shadow-red-500/50 border border-red-400">
              <ShieldAlert className="w-10 h-10 animate-bounce" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-widest animate-pulse mb-2">
            <Flame className="w-4 h-4 fill-red-400" />
            <span>BÁO ĐỘNG ĐỎ: THẤT THOÁT TÀI CHÍNH</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            CẢNH BÁO: BỊ TRỪ OAN TIỀN!
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Phát hiện <b>{anomalyCount} đơn hàng</b> trong bảng kê đang bị "rút ruột" tài chính.
          </p>
        </div>

        {/* Loss Number Box */}
        <div className="bg-red-950/60 border-2 border-red-500/50 rounded-2xl p-5 mb-6 text-center shadow-inner relative overflow-hidden">
          <div className="text-xs uppercase font-extrabold text-red-300 tracking-wider mb-1">
            TỔNG SỐ TIỀN THẤT THOÁT TẠM TÍNH
          </div>
          <div className="text-4xl sm:text-5xl font-black font-mono text-red-400 tracking-tight my-2 drop-shadow-[0_0_20px_rgba(248,113,113,0.6)]">
            -{totalLeakage.toLocaleString('vi-VN')} <span className="text-xl font-normal text-red-300">VNĐ</span>
          </div>
          <p className="text-xs text-red-300/80">
            File rà soát: <span className="font-mono text-white font-bold">{fileName}</span>
          </p>
        </div>

        {/* 3 Categories Summary */}
        <div className="grid grid-cols-3 gap-2 mb-6 text-center">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-amber-400 font-bold uppercase">Kê cân nặng</div>
            <div className="text-xs sm:text-sm font-mono font-bold text-white mt-0.5">
              {(breakdown?.weight || 0).toLocaleString('vi-VN')} đ
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-rose-400 font-bold uppercase">Giam đơn hoàn</div>
            <div className="text-xs sm:text-sm font-mono font-bold text-white mt-0.5">
              {(breakdown?.returns || 0).toLocaleString('vi-VN')} đ
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-blue-400 font-bold uppercase">Phụ phí ảo</div>
            <div className="text-xs sm:text-sm font-mono font-bold text-white mt-0.5">
              {(breakdown?.fee || 0).toLocaleString('vi-VN')} đ
            </div>
          </div>
        </div>

        {/* Urgent Deadline Countdown */}
        <div className="bg-slate-900/90 border border-red-500/30 rounded-xl p-3 mb-6 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-400 animate-spin" />
            <span>Thời hạn khiếu nại quy định:</span>
          </div>
          <div className="font-mono font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/30">
            {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </div>
        </div>

        {/* Big Action Button */}
        <button
          onClick={onGoToDispute}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm sm:text-base shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
        >
          <span>Xem Danh Sách Đơn & Đòi Lại Tiền Ngay</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-[11px] text-center text-slate-400 mt-3">
          *Theo quy chế bồi thường của hãng, quá 48h - 72h đơn hàng sẽ bị đóng và không thể hoàn tiền.
        </p>
      </div>
    </div>
  );
}
