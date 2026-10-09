import React, { useState, useEffect } from 'react';
import { 
  X, Check, ShieldCheck, QrCode, Clock, MessageCircle, 
  CheckCircle2, Loader2, Copy, AlertCircle, Sparkles, KeyRound, RefreshCw 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentModal({ isOpen, onClose, onSimulatePaymentSuccess, onUpdateUser }) {
  if (!isOpen) return null;

  const [selectedPlan, setSelectedPlan] = useState('single');
  // Mã đơn hàng chuẩn VietQR: Tối đa 13 ký tự (Ví dụ: SD839102)
  const [orderId] = useState(() => 'SD' + Math.floor(100000 + Math.random() * 900000));
  const [copiedField, setCopiedField] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState('');
  const [dynamicQrUrl, setDynamicQrUrl] = useState(null);

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
  const transferContent = orderId; // Chuẩn VietQR không dấu, <= 23 ký tự
  const bankAccount = "0986019623";
  const bankName = "MB Bank (Quân Đội)";
  const accountHolder = "BUI QUOC THAI";

  // URL chuẩn ảnh VietQR Napas Quicklink PNG 100% không bị lỗi ảnh
  const fallbackQrUrl = `https://img.vietqr.io/image/MB-${bankAccount}-compact2.png?amount=${currentPlan.price}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountHolder)}`;
  const qrUrl = (dynamicQrUrl && (dynamicQrUrl.startsWith('data:image') || dynamicQrUrl.includes('img.vietqr.io') || dynamicQrUrl.includes('.png'))) ? dynamicQrUrl : fallbackQrUrl;

  const zaloLink = `https://zalo.me/0986019623?text=${encodeURIComponent(
    `Chào bạn, tôi vừa chuyển khoản gói "${currentPlan.name}" (${currentPlan.price.toLocaleString('vi-VN')} đ) vào STK MB Bank 0986019623. Nội dung: ${transferContent}. Nhờ bạn hỗ trợ kiểm tra giúp tôi nhé!`
  )}`;

  // Tự động gọi API khởi tạo VietQR động khi chọn gói
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/vietqr-generate?amount=${currentPlan.price}&orderId=${orderId}&content=${transferContent}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data && data.qrUrl) {
          setDynamicQrUrl(data.qrUrl);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [currentPlan.price, orderId, transferContent]);

  // Tự động kiểm tra ngầm mỗi 3.5s: Nếu khách vừa chuyển tiền vào MB Bank xong thì tự mở khóa ngay
  useEffect(() => {
    if (!isOpen || isSuccess) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-payment?orderId=${orderId}&code=${orderId}&amount=${currentPlan.price}`);
        const data = await res.json().catch(() => ({}));
        if (data && data.verified === true) {
          clearInterval(interval);
          triggerUnlockSuccess(data.message);
        }
      } catch (e) {
        // Lỗi mạng kiểm tra ngầm thì bỏ qua
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isOpen, isSuccess, orderId, currentPlan.price]);

  const triggerUnlockSuccess = (msg) => {
    setIsVerifying(false);
    setIsSuccess(true);
    setVerifyError('');
    setPinError('');

    // Bắn pháo hoa ăn mừng
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.6 }
    });

    // Lưu trạng thái mở khóa vào máy khách
    localStorage.setItem('soatdon_unlocked', 'true');

    // Cập nhật lượt quét nếu người dùng có tài khoản
    try {
      const storedUser = JSON.parse(localStorage.getItem('soatdon_user') || 'null');
      if (storedUser) {
        if (selectedPlan === 'single') {
          storedUser.balanceScans = (storedUser.balanceScans || 0) + 1;
        } else if (selectedPlan === 'bundle') {
          storedUser.balanceScans = (storedUser.balanceScans || 0) + 5;
        } else if (selectedPlan === 'monthly') {
          storedUser.plan = 'monthly';
          storedUser.balanceScans = 9999;
        }
        localStorage.setItem('soatdon_user', JSON.stringify(storedUser));

        const accounts = JSON.parse(localStorage.getItem('soatdon_accounts') || '[]');
        const idx = accounts.findIndex(a => a.phone === storedUser.phone);
        if (idx !== -1) {
          accounts[idx] = storedUser;
          localStorage.setItem('soatdon_accounts', JSON.stringify(accounts));
        }

        if (onUpdateUser) {
          onUpdateUser(storedUser);
        }
      }
    } catch (e) {
      console.warn('Lỗi cập nhật số dư user:', e);
    }

    // Mở khóa dữ liệu sau 1.5 giây
    setTimeout(() => {
      onSimulatePaymentSuccess();
      onClose();
    }, 1500);
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // KIỂM TRA CHUYỂN KHOẢN THẬT QUA VIETQR & MB BANK (KHÔNG FAKE)
  const handleConfirmPayment = async () => {
    setIsVerifying(true);
    setVerifyError('');
    setPinError('');

    try {
      const res = await fetch(`/api/check-payment?orderId=${orderId}&code=${orderId}&amount=${currentPlan.price}`);
      const data = await res.json().catch(() => ({}));

      if (data && data.verified === true) {
        triggerUnlockSuccess(data.message);
      } else {
        // CHƯA NHẬN ĐƯỢC TIỀN -> BÁO LỖI RÕ RÀNG, KHÔNG MỞ KHÓA
        setIsVerifying(false);
        setIsSuccess(false);
        setVerifyError(
          data.message || 
          `Hệ thống chưa tìm thấy giao dịch chuyển ${currentPlan.price.toLocaleString('vi-VN')} đ với nội dung "${transferContent}" vào MB Bank 0986019623. Nếu vừa chuyển khoản, vui lòng đợi 15-30 giây để ngân hàng đồng bộ rồi bấm kiểm tra lại!`
        );
      }
    } catch (err) {
      setIsVerifying(false);
      setVerifyError(`Lỗi kết nối kiểm tra thanh toán: ${err.message}. Vui lòng thử lại!`);
    }
  };

  // Xử lý nhập mã PIN / Mã Quản Trị
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setPinError('');
    setVerifyError('');
    const clean = pinCode.trim().toUpperCase();
    if (!clean) return;

    setIsVerifying(true);
    try {
      const res = await fetch(`/api/check-payment?code=${encodeURIComponent(clean)}&orderId=${orderId}&amount=${currentPlan.price}`);
      const data = await res.json().catch(() => ({}));

      if (data && data.verified === true) {
        triggerUnlockSuccess(data.message);
      } else {
        setIsVerifying(false);
        setPinError('Mã kích hoạt không đúng hoặc chưa hợp lệ. Vui lòng liên hệ Zalo 0986019623!');
      }
    } catch (err) {
      setIsVerifying(false);
      setPinError('Lỗi kiểm tra mã: ' + err.message);
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
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">Thanh Toán VietQR MB Bank</h3>
              <p className="text-[11px] text-slate-500 font-medium">Đối soát tự động • STK 0986019623</p>
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
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    setVerifyError('');
                  }}
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
                  alt="VietQR MB Bank - BUI QUOC THAI"
                  className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-lg bg-white"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://img.vietqr.io/image/MB-${bankAccount}-qr_only.png?amount=${currentPlan.price}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountHolder)}`;
                  }}
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
              <span>Quy trình kích hoạt tự động qua VietQR:</span>
            </div>
            <p className="text-[11px] text-emerald-800/90 leading-relaxed pl-5">
              1. Quét mã QR bằng ứng dụng ngân hàng và chuyển đúng số tiền.<br />
              2. Hệ thống tự động kiểm tra mỗi 3 giây. Sau khi chuyển, bạn cũng có thể bấm <b>"XÁC NHẬN ĐÃ CHUYỂN KHOẢN"</b> để kiểm tra ngay!
            </p>
          </div>

          {/* CẢNH BÁO CHƯA NHẬN ĐƯỢC TIỀN (NẾU BẤM MÀ CHƯA CHUYỂN) */}
          {verifyError && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-extrabold text-amber-950">Chưa ghi nhận biến động số dư!</div>
                <div className="text-[11px] leading-relaxed text-amber-800">
                  {verifyError}
                </div>
              </div>
            </div>
          )}

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
                disabled={isVerifying}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-60"
              >
                Kích Hoạt
              </button>
            </form>
          )}
          {pinError && <p className="text-xs text-rose-600">{pinError}</p>}

          {/* NÚT XÁC NHẬN THANH TOÁN (KIỂM TRA THẬT) */}
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
                  <RefreshCw className="w-5 h-5 stroke-[2.5]" />
                  <span>TÔI ĐÃ CHUYỂN KHOẢN — KIỂM TRA NGAY</span>
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
