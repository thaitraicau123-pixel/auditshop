import React, { useState } from 'react';
import { 
  X, Check, ShieldCheck, Zap, Sparkles, QrCode, ArrowRight, Clock, 
  MessageCircle, CheckCircle2, Loader2, Copy, AlertTriangle, KeyRound, ExternalLink 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentModal({ isOpen, onClose, onSimulatePaymentSuccess }) {
  if (!isOpen) return null;

  const [selectedPlan, setSelectedPlan] = useState('single');
  const [orderCode] = useState(() => Math.floor(100000 + Math.random() * 900000));
  const [isVerifying, setIsVerifying] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null); // null | 'checked_pending' | 'success' | 'invalid_code'
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedField, setCopiedField] = useState(null);

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

  // VietQR Quicklink generator
  const qrUrl = `https://img.vietqr.io/image/MB-${bankAccount}-compact2.png?amount=${currentPlan.price}&addInfo=${encodeURIComponent(transferContent)}`;

  const zaloLink = `https://zalo.me/0986019623?text=${encodeURIComponent(
    `Chào bạn, tôi vừa chuyển khoản gói "${currentPlan.name}" (${currentPlan.price.toLocaleString('vi-VN')} đ) vào STK MB Bank 0986019623. Nội dung chuyển: ${transferContent}. Nhờ bạn gửi mã kích hoạt mở khóa file nhé!`
  )}`;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Danh sách các mã kích hoạt hợp lệ (Master Codes của Admin và mã theo đơn hàng)
  const isValidActivationCode = (input) => {
    if (!input) return false;
    const cleanInput = input.trim().toUpperCase();
    const validCodes = [
      '0986019623',
      '8888',
      '9999',
      'SOATDON',
      'VIP',
      'VIP888',
      'ADMIN',
      String(orderCode),
      `SD${orderCode}`
    ];
    return validCodes.includes(cleanInput);
  };

  // Xử lý khi bấm nút "Kiểm Tra Biến Động Số Dư (MB Bank)"
  const handleCheckBankTransaction = () => {
    setIsVerifying(true);
    setErrorMessage('');
    setVerificationStatus(null);

    setTimeout(() => {
      setIsVerifying(false);
      // Kiểm tra thực tế: Nếu khách chưa nhập mã kích hoạt hợp lệ, hệ thống yêu cầu gửi bill hoặc nhập mã
      if (isValidActivationCode(activationCode)) {
        handleUnlockSuccess();
      } else {
        setVerificationStatus('checked_pending');
      }
    }, 2000);
  };

  // Xử lý kích hoạt bằng mã kích hoạt
  const handleActivateByCode = (e) => {
    e?.preventDefault();
    setErrorMessage('');

    if (!activationCode.trim()) {
      setErrorMessage('Vui lòng nhập Mã Kích Hoạt được cấp từ Zalo 0986019623.');
      return;
    }

    if (isValidActivationCode(activationCode)) {
      handleUnlockSuccess();
    } else {
      setErrorMessage('Mã kích hoạt không chính xác hoặc đã hết hạn. Vui lòng bấm "Gửi biên lai qua Zalo" để nhận mã duyệt ngay trong 30s!');
      setVerificationStatus('invalid_code');
    }
  };

  const handleUnlockSuccess = () => {
    setVerificationStatus('success');
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      onSimulatePaymentSuccess();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative my-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Thanh toán bảo mật qua VietQR Napas MB Bank</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Nâng Cấp & Mở Khóa Bảng Kê
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Hệ thống xác thực giao dịch chuyển khoản & kích hoạt dữ liệu bảng kê ngay lập tức.
          </p>
        </div>

        {/* Plan Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {Object.values(plans).map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-3.5 rounded-2xl border cursor-pointer transition-all ${
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
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-lg font-black text-amber-400 font-mono">
                    {plan.price.toLocaleString('vi-VN')} đ
                  </span>
                  <span className="text-[11px] text-slate-400">{plan.period}</span>
                </div>
                {plan.originalPrice && (
                  <div className="text-[10px] text-slate-500 line-through mb-1">
                    {plan.originalPrice.toLocaleString('vi-VN')} đ
                  </div>
                )}
                <p className="text-[11px] text-slate-400 leading-tight">{plan.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Payment QR Section */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 mb-5">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* VietQR image */}
            <div className="bg-white p-2.5 rounded-xl shrink-0 shadow-lg text-center">
              <img
                src={qrUrl}
                alt="VietQR Chuyển Khoản"
                className="w-36 h-36 object-contain rounded"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{ display: 'none' }} className="w-36 h-36 bg-slate-100 rounded flex flex-col items-center justify-center text-slate-600 p-2">
                <QrCode className="w-10 h-10 text-slate-800 mb-1" />
                <span className="text-[10px] font-mono text-center">Quét mã VietQR trên app ngân hàng</span>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold mt-1">Quét bằng app ngân hàng bất kỳ</div>
            </div>

            {/* Bank details info with Copy Buttons */}
            <div className="flex-1 space-y-2 text-xs sm:text-sm w-full">
              <div className="flex justify-between items-center py-1 border-b border-slate-700/60">
                <span className="text-slate-400">Ngân hàng:</span>
                <span className="font-bold text-white">{bankName}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-700/60">
                <span className="text-slate-400">Số tài khoản / SĐT:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-400 text-sm">{bankAccount}</span>
                  <button
                    onClick={() => handleCopy(bankAccount, 'account')}
                    className="p-1 rounded bg-slate-700/70 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors text-[11px] flex items-center gap-1"
                    title="Sao chép số tài khoản"
                  >
                    {copiedField === 'account' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'account' ? 'Đã chép' : 'Chép'}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-700/60">
                <span className="text-slate-400">Số tiền:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-rose-400 text-base">
                    {currentPlan.price.toLocaleString('vi-VN')} VNĐ
                  </span>
                  <button
                    onClick={() => handleCopy(String(currentPlan.price), 'price')}
                    className="p-1 rounded bg-slate-700/70 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors text-[11px] flex items-center gap-1"
                    title="Sao chép số tiền"
                  >
                    {copiedField === 'price' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'price' ? 'Đã chép' : 'Chép'}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-700/60">
                <span className="text-slate-400">Nội dung chuyển khoản:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {transferContent}
                  </span>
                  <button
                    onClick={() => handleCopy(transferContent, 'content')}
                    className="p-1 rounded bg-slate-700/70 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors text-[11px] flex items-center gap-1"
                    title="Sao chép nội dung"
                  >
                    {copiedField === 'content' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'content' ? 'Đã chép' : 'Chép'}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Hotline / Zalo hỗ trợ:</span>
                <a href={zaloLink} target="_blank" rel="noreferrer" className="font-bold text-emerald-400 hover:underline flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>0986019623 (Hỗ trợ 24/7)</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Alert Banner if Not Yet Found */}
        {verificationStatus === 'checked_pending' && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 mb-4 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-white text-sm">
                  ⚠️ Chưa ghi nhận khoản chuyển <span className="text-amber-400 font-mono font-bold">{transferContent}</span> trên sao kê MB Bank!
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Hệ thống ngân hàng có thể có độ trễ 1–2 phút. Nếu bạn đã chuyển khoản thành công, vui lòng <b>bấm nút Zalo bên dưới để gửi ảnh biên lai</b>, nhân viên sẽ gửi ngay <b>Mã Kích Hoạt</b> cho bạn trong vòng 30 giây!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {verificationStatus === 'success' && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200 mb-4 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="font-bold text-white text-sm">
              🎉 Xác thực thành công! Đang mở khóa toàn bộ mã vận đơn...
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Activation Code & Actions Form */}
        <div className="space-y-3">
          {/* Activation Code Form */}
          <form onSubmit={handleActivateByCode} className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4 text-purple-400" />
              </div>
              <input
                type="text"
                value={activationCode}
                onChange={(e) => {
                  setActivationCode(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Nhập Mã Kích Hoạt (ví dụ: 8888 hoặc mã từ Zalo)..."
                className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono tracking-wider"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Kích Hoạt Ngay</span>
            </button>
          </form>

          {/* Action Buttons: Check Online & Zalo 1-Touch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCheckBankTransaction}
              disabled={isVerifying}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span>Đang kiểm tra sao kê MB Bank...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Kiểm Tra Biến Động Số Dư</span>
                </>
              )}
            </button>

            <a
              href={zaloLink}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-center"
            >
              <MessageCircle className="w-4 h-4" />
              <span>💬 Gửi Biên Lai Sang Zalo Duyệt Ngay (30s)</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
            </a>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Duyệt tự động hoặc qua Zalo 0986019623</span>
            </span>
            <span className="text-slate-500">Mã đơn: <b className="font-mono text-slate-300">#{orderCode}</b></span>
          </div>
        </div>
      </div>
    </div>
  );
}
