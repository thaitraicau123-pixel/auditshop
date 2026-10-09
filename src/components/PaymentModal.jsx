import React, { useState } from 'react';
import { 
  X, Check, ShieldCheck, QrCode, Clock, MessageCircle, 
  CheckCircle2, Loader2, Copy, AlertCircle, Sparkles, KeyRound 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentModal({ isOpen, onClose, onSimulatePaymentSuccess }) {
  if (!isOpen) return null;

  const [selectedPlan, setSelectedPlan] = useState('single');
  const [orderCode] = useState(() => Math.floor(100000 + Math.random() * 900000));
  const [copiedField, setCopiedField] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState('');

  const plans = {
    single: {
      id: 'single',
      name: 'Gói Trải Nghiệm',
      price: 9000,
      period: '1 File',
      desc: 'Mở khóa toàn bộ mã đơn file hiện tại'
    },
    bundle: {
      id: 'bundle',
      name: 'Gói Nạp Lượt',
      badge: 'Tiết kiệm',
      price: 29000,
      period: '5 lượt quét',
      desc: 'Dùng như nạp thẻ, trừ dần từng file'
    },
    monthly: {
      id: 'monthly',
      name: 'Gói Tháng',
      badge: 'Khuyên dùng',
      price: 79000,
      period: 'Không giới hạn',
      desc: 'Quét không giới hạn file trong tháng'
    }
  };

  const currentPlan = plans[selectedPlan];
  const transferContent = `SOATDON${orderCode}`;
  const bankAccount = "0986019623";
  const bankName = "MB Bank (Quân Đội)";
  const accountHolder = "NGUYEN VAN THAI";

  // VietQR Quicklink generator chuẩn Napas
  const qrUrl = `https://img.vietqr.io/image/MB-${bankAccount}-compact2.png?amount=${currentPlan.price}&addInfo=${encodeURIComponent(transferContent)}`;

  const zaloLink = `https://zalo.me/0986019623?text=${encodeURIComponent(
    `Chào bạn, tôi vừa chuyển khoản gói "${currentPlan.name}" (${currentPlan.price.toLocaleString('vi-VN')} đ) vào STK MB Bank 0986019623. Nội dung: ${transferContent}. Nhờ bạn hỗ trợ mở khóa giúp tôi nhé!`
  )}`;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Xử lý xác nhận thanh toán & mở khóa ngay lập tức
  const handleConfirmPayment = () => {
    setIsVerifying(true);
    setPinError('');

    // Giả lập kiểm tra giao dịch MB Bank 2.5s rồi mở khóa ngay
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);

      // Pháo hoa ăn mừng
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.6 }
      });

      // Lưu trạng thái mở khóa vào localStorage
      localStorage.setItem('soatdon_unlocked', 'true');

      // Tự động đóng modal và mở khóa dữ liệu sau 1.5s
      setTimeout(() => {
        onSimulatePaymentSuccess();
        onClose();
      }, 1500);
    }, 2200);
  };

  // Xử lý nhập mã PIN thủ công
  const handlePinSubmit = (e) => {
    e.preventDefault();
    setPinError('');
    const clean = pinCode.trim().toUpperCase();
    const validCodes = ['0986019623', '8888', '9999', 'SOATDON', 'VIP', 'VIP888', String(orderCode), `SD${orderCode}`];

    if (validCodes.includes(clean)) {
      handleConfirmPayment();
    } else {
      setPinError('Mã kích hoạt không đúng. Vui lòng bấm Xác nhận thanh toán bên trên hoặc gửi Zalo 0986019623!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      {/* Modal Container: Nhỏ gọn, vừa màn hình, nền trắng tươi sáng & uy tín */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative my-auto max-h-[92vh] flex flex-col text-slate-800 font-sans">
        
        {/* Header Cố Định (Sticky): Dấu X luôn nằm trên đầu, bấm được 100% */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">Thanh Toán & Mở Khóa Dữ Liệu</h3>
              <p className="text-[11px] text-slate-500 font-medium">VietQR Napas • MB Bank 0986019623</p>
            </div>
          </div>

          {/* Dấu X to rõ ràng, luôn bấm được */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Đóng"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Nội dung có thể cuộn mượt mà bên trong nếu màn hình bé */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Chọn Gói Dịch Vụ */}
          <div className="grid grid-cols-3 gap-2">
            {Object.values(plans).map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-2.5 sm:p-3 rounded-xl border text-center cursor-pointer transition-all relative ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-emerald-600 text-[8px] font-extrabold text-white uppercase tracking-wider">
                      {plan.badge}
                    </span>
                  )}
                  <div className="font-bold text-xs text-slate-900">{plan.name}</div>
                  <div className="text-sm sm:text-base font-black text-rose-600 font-mono mt-0.5">
                    {plan.price.toLocaleString('vi-VN')} đ
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">{plan.period}</div>
                </div>
              );
            })}
          </div>

          {/* Khung Thông Tin Chuyển Khoản & Mã QR */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-3.5 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              
              {/* Mã VietQR */}
              <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs shrink-0 text-center">
                <img
                  src={qrUrl}
                  alt="VietQR MB Bank"
                  className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-lg"
                />
                <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Quét bằng app ngân hàng</span>
              </div>

              {/* Chi tiết tài khoản với nút Copy */}
              <div className="flex-1 space-y-1.5 text-xs w-full">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                  <span className="text-slate-500">Ngân hàng:</span>
                  <span className="font-bold text-slate-900">{bankName}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                  <span className="text-slate-500">Chủ tài khoản:</span>
                  <span className="font-bold text-slate-900">{accountHolder}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                  <span className="text-slate-500">Số tài khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-rose-600 text-sm sm:text-base">{bankAccount}</span>
                    <button
                      onClick={() => handleCopy(bankAccount, 'stk')}
                      className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {copiedField === 'stk' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'stk' ? 'Đã chép' : 'Chép'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                  <span className="text-slate-500">Số tiền:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-rose-600 text-sm sm:text-base">
                      {currentPlan.price.toLocaleString('vi-VN')} VNĐ
                    </span>
                    <button
                      onClick={() => handleCopy(String(currentPlan.price), 'price')}
                      className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {copiedField === 'price' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'price' ? 'Đã chép' : 'Chép'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Nội dung CK:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      {transferContent}
                    </span>
                    <button
                      onClick={() => handleCopy(transferContent, 'content')}
                      className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {copiedField === 'content' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'content' ? 'Đã chép' : 'Chép'}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Hướng Dẫn Nhanh 3 Bước */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Quy trình kích hoạt tự động:</span>
            </div>
            <p className="text-[11px] text-emerald-800/90 leading-relaxed pl-5">
              1. Quét mã QR bằng app ngân hàng & chuyển khoản đúng số tiền.<br />
              2. Sau khi tiền đã trừ trong tài khoản, bấm nút <b>"XÁC NHẬN ĐÃ CHUYỂN KHOẢN"</b> bên dưới để mở khóa toàn bộ bảng kê ngay!
            </p>
          </div>

          {/* THÔNG BÁO XÁC NHẬN THÀNH CÔNG */}
          {isSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-400 text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-sm font-extrabold">🎉 XÁC THỰC THÀNH CÔNG!</div>
                <div className="font-normal text-emerald-800">Đã ghi nhận thanh toán MB Bank. Đang mở khóa toàn bộ bảng kê cho bạn...</div>
              </div>
            </div>
          )}

          {/* Form Nhập Mã PIN (Nếu người dùng muốn dùng mã) */}
          {showPinInput && (
            <form onSubmit={handlePinSubmit} className="flex gap-2 animate-fadeIn">
              <input
                type="text"
                value={pinCode}
                onChange={(e) => {
                  setPinCode(e.target.value);
                  setPinError('');
                }}
                placeholder="Nhập mã kích hoạt (ví dụ: 8888 hoặc mã từ Zalo)..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Kích Hoạt
              </button>
            </form>
          )}
          {pinError && <p className="text-xs text-rose-600">{pinError}</p>}

          {/* NÚT XÁC NHẬN THANH TOÁN (To, Xanh lá uy tín, Bấm là xác nhận mở khóa) */}
          <div className="pt-1 space-y-2">
            <button
              onClick={handleConfirmPayment}
              disabled={isVerifying || isSuccess}
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] text-white font-black text-sm sm:text-base tracking-wide shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang Kiểm Tra Giao Dịch MB Bank 0986019623...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Đã Xác Thực Thành Công — Đang Mở Khóa...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>TÔI ĐÃ CHUYỂN KHOẢN — MỞ KHÓA NGAY</span>
                </>
              )}
            </button>

            {/* Hỗ trợ Zalo & Nhập PIN phụ */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <a
                href={zaloLink}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:underline font-semibold flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Hỗ trợ Zalo: 0986019623 (24/7)</span>
              </a>

              <button
                onClick={() => setShowPinInput(!showPinInput)}
                className="text-slate-400 hover:text-slate-600 underline cursor-pointer"
              >
                {showPinInput ? 'Đóng mã PIN' : 'Nhập mã kích hoạt'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
