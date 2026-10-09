import React, { useEffect } from 'react';
import { Trophy, X, CheckCircle2, Sparkles, Star, Award, RotateCcw, Share2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';

export default function VictoryCelebrationModal({ isOpen, onClose, totalOrders, fileName, onReset }) {
  if (!isOpen) return null;

  useEffect(() => {
    // 1. Kích hoạt âm thanh chiến thắng
    sounds.playVictory();

    // 2. Đại tiệc pháo hoa đa góc độ liên tục 4 giây
    const duration = 4.5 * 1000;
    const end = Date.now() + duration;

    // Pháo hoa góc trái & phải
    const interval = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }

      confetti({
        particleCount: 25,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 },
        colors: ['#10B981', '#F59E0B', '#60A5FA', '#F43F5E', '#A855F7']
      });

      confetti({
        particleCount: 25,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 },
        colors: ['#10B981', '#F59E0B', '#60A5FA', '#F43F5E', '#A855F7']
      });

      // Bắn hình ngôi sao lấp lánh ở trung tâm
      confetti({
        particleCount: 15,
        spread: 100,
        origin: { x: 0.5, y: 0.4 },
        shapes: ['star', 'circle'],
        colors: ['#FFD700', '#FFA500', '#10B981']
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-fadeIn">
      {/* Radiant rotating sunburst rays effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[800px] h-[800px] bg-gradient-to-tr from-amber-500/15 via-emerald-500/15 to-purple-500/15 rounded-full blur-3xl animate-spin duration-10000" />
      </div>

      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-3 border-amber-400/80 rounded-3xl max-w-xl w-full p-6 sm:p-10 text-center shadow-[0_0_100px_rgba(245,158,11,0.4)] relative my-8 overflow-hidden animate-scaleUp">
        {/* Shimmering top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400 animate-pulse" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Massive 3D Trophy Badge with Glow */}
        <div className="relative w-28 h-28 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-xl animate-pulse" />
          <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-2xl shadow-amber-500/50 border-2 border-yellow-200 transform hover:rotate-6 transition-transform">
            <Trophy className="w-16 h-16 text-slate-950 drop-shadow" />
            <Sparkles className="w-6 h-6 text-white absolute -top-2 -right-2 animate-bounce" />
            <Star className="w-5 h-5 text-white absolute -bottom-1 -left-1 animate-pulse" />
          </div>
        </div>

        {/* Title & Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-black uppercase tracking-widest mb-3">
          <Award className="w-4 h-4 text-amber-400" />
          <span>CHỨNG NHẬN ĐỐI SOÁT HOÀN HẢO 100%</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-3">
          🌟 XUẤT SẮC! BẠN KHÔNG MẤT 1 ĐỒNG NÀO!
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
          Toàn bộ <b className="text-amber-300 font-bold">{totalOrders} đơn hàng</b> trong file <b className="text-emerald-400 font-mono">{fileName}</b> đã được các hãng vận chuyển tính toán chuẩn xác tuyệt đối!
        </p>

        {/* Golden Certificate Card */}
        <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-emerald-950/40 border-2 border-amber-400/40 rounded-2xl p-5 mb-8 text-left space-y-3 shadow-inner">
          <div className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1.5 border-b border-amber-400/20 pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>KẾT QUẢ THẨM ĐỊNH TỪ GEMINI 3.8 FLASH:</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><b>Khối lượng cước:</b> 100% khớp đúng với gói hàng shop khai báo.</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><b>Hàng hoàn:</b> 0 đơn hàng bị ngâm trễ hạn hoặc thất lạc bưu cục.</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><b>Thu hộ COD & Phí:</b> Số tiền chuyển khoản trả về cho shop đúng 100%.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              onClose();
              onReset();
            }}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Quét Thử Bảng Kê Kỳ Khác</span>
          </button>
        </div>
      </div>
    </div>
  );
}
