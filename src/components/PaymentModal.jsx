import React, { useState } from 'react';
import { X, Check, ShieldCheck, Zap, Sparkles, QrCode, ArrowRight, Clock, MessageCircle, CheckCircle2, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentModal({ isOpen, onClose, onSimulatePaymentSuccess }) {
  if (!isOpen) return null;

  const [selectedPlan, setSelectedPlan] = useState('single');
  const [orderCode] = useState(() => Math.floor(100000 + Math.random() * 900000));
  const [isVerifying, setIsVerifying] = useState(false);

  const plans = {
    single: {
      id: 'single',
      name: 'Gói Trải Nghiệm (1 File)',
      price: 9000,
      period: 'một lần',
      desc: 'Mở khóa 1 file bảng kê hiện tại. Giá chỉ bằng cốc trà đá để lấy lại tiền triệu.',
      features: [
        'Mở khóa 100% mã vận đơn bị ẩn',
        'Xuất file Excel đối soát chuẩn hãng',
        'Mẫu email & tin nhắn khiếu nại CSKH'
      ]
    },
    bundle: {
      id: 'bundle',
      name: 'Gói Nạp Lượt (Pay-As-You-Go)',
      badge: 'Tiết kiệm & Linh hoạt',
      price: 29000,
      originalPrice: 45000,
      period: '/ 5 lượt quét (~500 đơn)',
      desc: 'Dùng như nạp ký tự/token: quét lần nào trừ lần đó, không giới hạn thời gian hết hạn.',
      features: [
        '5 lượt quét file đối soát bất kỳ lúc nào',
        'Chỉ tính tiền khi có file cần rà soát',
        'Hỗ trợ toàn bộ hãng: GHTK, GHN, Shopee, TikTok',
        'Xuất file khiếu nại không giới hạn'
      ]
    },
    monthly: {
      id: 'monthly',
      name: 'Gói Tháng Shop Vừa & Nhỏ',
      badge: 'Khuyên dùng cho shop',
      price: 79000,
      originalPrice: 199000,
      period: '/tháng',
      desc: 'Quét không giới hạn tất cả các file trong tháng, rẻ như gói cước 4G.',
      features: [
        'Quét file không giới hạn số lượng',
        'Hỗ trợ toàn bộ 5 hãng vận chuyển',
        'Bộ kịch bản đòi tiền bồi thường chuẩn pháp lý',
        'Hỗ trợ rà soát thủ công 1:1 qua Zalo nếu cần'
      ]
    }
  };

  const currentPlan = plans[selectedPlan];
  const transferContent = `SOATDON ${orderCode}`;
  const bankAccount = "0986019623";
  const bankName = "MB Bank (Ngân hàng Quân Đội)";

  // VietQR Quicklink generator format tự động nhận diện STK MB Bank
  const qrUrl = `https://img.vietqr.io/image/MB-${bankAccount}-compact2.png?amount=${currentPlan.price}&addInfo=${encodeURIComponent(transferContent)}`;

  const zaloLink = `https://zalo.me/0986019623?text=${encodeURIComponent(
    `Chào bạn, tôi vừa chuyển khoản gói "${currentPlan.name}" (${currentPlan.price.toLocaleString('vi-VN')} đ) vào STK MB Bank 0986019623. Nội dung chuyển: ${transferContent}. Nhờ bạn xác nhận kích hoạt nhé!`
  )}`;

  const handleConfirmPayment = () => {
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      onSimulatePaymentSuccess();
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Thanh toán an toàn qua VietQR Napas</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Nâng Cấp & Mở Khóa Bảng Kê
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Hệ thống tự động kích hoạt tài khoản ngay sau khi xác nhận chuyển khoản.
          </p>
        </div>

        {/* Plan Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {Object.values(plans).map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-purple-500/10 border-purple-500 shadow-lg shadow-purple-500/20 ring-1 ring-purple-500'
                    : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-[10px] font-extrabold text-white uppercase tracking-wider">
                    {plan.badge}
                  </span>
                )}
                <div className="font-bold text-sm text-white mb-1">{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-lg font-black text-amber-400 font-mono">
                    {plan.price.toLocaleString('vi-VN')} đ
                  </span>
                  <span className="text-[11px] text-slate-400">{plan.period}</span>
                </div>
                {plan.originalPrice && (
                  <div className="text-[11px] text-slate-500 line-through mb-2">
                    {plan.originalPrice.toLocaleString('vi-VN')} đ
                  </div>
                )}
                <p className="text-[11px] text-slate-400 leading-tight">{plan.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Payment QR Section */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* VietQR image */}
            <div className="bg-white p-3 rounded-xl shrink-0 shadow-lg text-center">
              <img
                src={qrUrl}
                alt="VietQR Chuyển Khoản"
                className="w-40 h-40 object-contain rounded"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{ display: 'none' }} className="w-40 h-40 bg-slate-100 rounded flex flex-col items-center justify-center text-slate-600 p-2">
                <QrCode className="w-12 h-12 text-slate-800 mb-1" />
                <span className="text-[10px] font-mono text-center">Quét mã VietQR trên app ngân hàng</span>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold mt-1">Quét bằng app ngân hàng bất kỳ</div>
            </div>

            {/* Bank details info */}
            <div className="flex-1 space-y-2 text-xs sm:text-sm w-full">
              <div className="flex justify-between py-1 border-b border-slate-700/60">
                <span className="text-slate-400">Ngân hàng:</span>
                <span className="font-bold text-white">{bankName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/60">
                <span className="text-slate-400">Số tài khoản / SĐT:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{bankAccount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/60">
                <span className="text-slate-400">Số tiền:</span>
                <span className="font-mono font-extrabold text-rose-400 text-base">
                  {currentPlan.price.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/60">
                <span className="text-slate-400">Nội dung chuyển khoản:</span>
                <span className="font-mono font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {transferContent}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Hỗ trợ Zalo 24/7:</span>
                <a href={zaloLink} target="_blank" rel="noreferrer" className="font-bold text-emerald-400 hover:underline flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>0986019623</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Official Confirmation Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleConfirmPayment}
            disabled={isVerifying}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang kiểm tra giao dịch tài khoản MB Bank...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Tôi Đã Chuyển Khoản Xong — Mở Khóa Dữ Liệu Ngay</span>
              </>
            )}
          </button>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Hệ thống tự động kích hoạt sau khi xác nhận chuyển khoản</span>
            </span>
            <a
              href={zaloLink}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 hover:underline"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Gửi biên lai qua Zalo 0986019623 ↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
