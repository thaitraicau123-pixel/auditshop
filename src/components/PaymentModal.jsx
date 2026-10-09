import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Check, ShieldCheck, QrCode, Clock, MessageCircle, 
  CheckCircle2, Loader2, Copy, AlertTriangle, KeyRound, ExternalLink, RefreshCw, Settings 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentModal({ isOpen, onClose, onSimulatePaymentSuccess }) {
  if (!isOpen) return null;

  const [selectedPlan, setSelectedPlan] = useState('single');
  const [orderCode] = useState(() => Math.floor(100000 + Math.random() * 900000));
  const [copiedField, setCopiedField] = useState(null);

  // Auto-Check & Countdown states
  const [isAutoChecking, setIsAutoChecking] = useState(false);
  const [countdown, setCountdown] = useState(90); // 90 seconds (~ 1.5 phút như hướng dẫn)
  const [checkStatus, setCheckStatus] = useState('idle'); // 'idle' | 'checking' | 'success' | 'not_found'
  const [checkLog, setCheckLog] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Manual PIN activation fallback
  const [showManualPin, setShowManualPin] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [pinError, setPinError] = useState('');

  // SePay Token configuration for Admin
  const [showAdminConfig, setShowAdminConfig] = useState(false);
  const [sepayToken, setSepayToken] = useState(() => localStorage.getItem('sepay_api_token') || '');

  const pollingIntervalRef = useRef(null);

  const plans = {
    single: {
      id: 'single',
      name: 'Gói Trải Nghiệm (1 File)',
      price: 9000,
      period: 'một lần',
      desc: 'Mở khóa toàn bộ mã vận đơn & xuất file Excel khiếu nại.'
    },
    bundle: {
      id: 'bundle',
      name: 'Gói Nạp Lượt (Pay-As-You-Go)',
      badge: 'Tiết kiệm',
      price: 29000,
      originalPrice: 45000,
      period: '/ 5 lượt quét',
      desc: 'Dùng như nạp thẻ game: quét lần nào trừ lần đó, không giới hạn hạn dùng.'
    },
    monthly: {
      id: 'monthly',
      name: 'Gói Tháng Shop Vừa & Nhỏ',
      badge: 'Khuyên dùng',
      price: 79000,
      originalPrice: 199000,
      period: '/ tháng',
      desc: 'Quét không giới hạn tất cả các file bảng kê trong tháng.'
    }
  };

  const currentPlan = plans[selectedPlan];
  const transferContent = `SOATDON${orderCode}`;
  const bankAccount = "0986019623";
  const bankName = "MBBANK";
  const accountHolder = "NGUYEN VAN THAI";

  // VietQR URL Quicklink generator chuẩn Napas
  const qrUrl = `https://img.vietqr.io/image/MB-${bankAccount}-compact2.png?amount=${currentPlan.price}&addInfo=${encodeURIComponent(transferContent)}`;

  const zaloLink = `https://zalo.me/0986019623?text=${encodeURIComponent(
    `Chào bạn, tôi vừa chuyển khoản gói "${currentPlan.name}" (${currentPlan.price.toLocaleString('vi-VN')} đ) vào STK MB Bank 0986019623. Nội dung chuyển: ${transferContent}. Nhờ bạn kiểm tra và duyệt mở khóa giúp tôi nhé!`
  )}`;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Quản lý đếm lùi và tự động kiểm tra giao dịch qua API
  useEffect(() => {
    let timer;
    if (isAutoChecking && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && isAutoChecking) {
      // Hết thời gian đếm lùi mà chưa thấy giao dịch
      setIsAutoChecking(false);
      setCheckStatus('not_found');
      clearInterval(pollingIntervalRef.current);
    }
    return () => clearInterval(timer);
  }, [isAutoChecking, countdown]);

  // Cập nhật dòng chữ mô phỏng trạng thái kiểm tra theo thời gian
  useEffect(() => {
    if (!isAutoChecking) return;
    const elapsed = 90 - countdown;
    if (elapsed < 15) {
      setCheckLog(`Đang kết nối cổng sao kê MB Bank ${bankAccount}...`);
    } else if (elapsed < 40) {
      setCheckLog(`Đang rà soát biến động số dư theo nội dung "${transferContent}"...`);
    } else if (elapsed < 65) {
      setCheckLog(`Đang đối soát số tiền ${currentPlan.price.toLocaleString('vi-VN')} đ trên sao kê...`);
    } else {
      setCheckLog(`Đang chờ ngân hàng cập nhật bản ghi đối soát mới nhất...`);
    }
  }, [countdown, isAutoChecking, bankAccount, transferContent, currentPlan.price]);

  // Hàm gọi API kiểm tra giao dịch thật
  const checkTransactionApi = async () => {
    try {
      const token = sepayToken || localStorage.getItem('sepay_api_token') || '';
      const response = await fetch(
        `/api/check-payment?code=${encodeURIComponent(transferContent)}&orderCode=${orderCode}&amount=${currentPlan.price}&token=${encodeURIComponent(token)}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.verified) {
          // Giao dịch thành công! Tự động cộng tiền & mở khóa ngay!
          clearInterval(pollingIntervalRef.current);
          setIsAutoChecking(false);
          setCheckStatus('success');
          triggerSuccessUnlock();
          return true;
        }
      }
    } catch (err) {
      console.log('Polling check error:', err);
    }
    return false;
  };

  // Bắt đầu quy trình "Tự check rồi tự cộng" khi bấm nút XÁC NHẬN THANH TOÁN
  const handleStartAutoCheck = async () => {
    setIsAutoChecking(true);
    setCheckStatus('checking');
    setCountdown(90); // 1.5 phút
    setRetryCount((prev) => prev + 1);

    // Kiểm tra ngay 1 lần
    const immediateSuccess = await checkTransactionApi();
    if (immediateSuccess) return;

    // Cài đặt Polling định kỳ mỗi 4 giây tự động kiểm tra 1 lần
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    pollingIntervalRef.current = setInterval(async () => {
      await checkTransactionApi();
    }, 4000);
  };

  // Kích hoạt mở khóa thành công + pháo hoa
  const triggerSuccessUnlock = () => {
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.55 }
    });
    setTimeout(() => {
      onSimulatePaymentSuccess();
      onClose();
    }, 2000);
  };

  // Xử lý kích hoạt bằng mã Admin / PIN thủ công
  const handleManualPinSubmit = (e) => {
    e.preventDefault();
    setPinError('');
    const clean = activationCode.trim().toUpperCase();
    const validCodes = ['0986019623', '8888', '9999', 'SOATDON', 'VIP', 'VIP888', String(orderCode), `SD${orderCode}`];

    if (validCodes.includes(clean)) {
      setCheckStatus('success');
      triggerSuccessUnlock();
    } else {
      setPinError('Mã kích hoạt không đúng. Vui lòng bấm "Gửi Zalo" bên dưới để nhận mã duyệt ngay!');
    }
  };

  // Lưu SePay Token cho Admin
  const handleSaveSepayToken = (e) => {
    e.preventDefault();
    localStorage.setItem('sepay_api_token', sepayToken.trim());
    setShowAdminConfig(false);
    alert('Đã lưu cấu hình SePay API Token thành công! Hệ thống sẽ tự động quét MB Bank.');
  };

  // Định dạng thời gian đếm lùi mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-[#0b0f17] border border-slate-800 rounded-2xl max-w-4xl w-full p-4 sm:p-7 shadow-2xl relative my-6 text-white font-sans">
        
        {/* Nút Đóng */}
        <button
          onClick={() => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Chọn Gói Dịch Vụ */}
        <div className="mb-6">
          <div className="text-center sm:text-left mb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Chọn Gói Đối Soát</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">Nâng Cấp Mở Khóa Dữ Liệu Bảng Kê</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {Object.values(plans).map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-white">{plan.name}</span>
                    {plan.badge && (
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-[9px] font-extrabold text-slate-950 uppercase">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-base sm:text-lg font-black text-rose-500 font-mono">
                      {plan.price.toLocaleString('vi-VN')} đ
                    </span>
                    <span className="text-[10px] text-slate-400">{plan.period}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Khung Chi Tiết Thanh Toán & QR (Thiết kế chuẩn theo mẫu tamhongame) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-black/60 border border-slate-800/80 rounded-2xl p-4 sm:p-6 mb-5">
          
          {/* CỘT TRÁI (7 PHẦN): Thông tin chuyển khoản & Hướng dẫn 5 bước */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Thông tin chuyển khoản</h3>
              
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-300">Ngân Hàng</span>
                  <span className="font-extrabold text-rose-500 text-sm sm:text-base">{bankName}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-300">Tên chủ tài khoản</span>
                  <span className="font-extrabold text-rose-500">{accountHolder}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-300">Số tài khoản</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-rose-500 text-base sm:text-lg tracking-wider">{bankAccount}</span>
                    <button
                      onClick={() => handleCopy(bankAccount, 'stk')}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedField === 'stk' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'stk' ? 'Đã chép' : 'Chép'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-300">Số tiền cần nạp</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-rose-500 text-base sm:text-lg">
                      {currentPlan.price.toLocaleString('vi-VN')} đ
                    </span>
                    <button
                      onClick={() => handleCopy(String(currentPlan.price), 'price')}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedField === 'price' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'price' ? 'Đã chép' : 'Chép'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-300">Nội dung chuyển khoản</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-rose-500 text-base sm:text-lg tracking-wider bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                      {transferContent}
                    </span>
                    <button
                      onClick={() => handleCopy(transferContent, 'content')}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedField === 'content' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'content' ? 'Đã chép' : 'Chép'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Hướng dẫn nạp tiền qua quét mã QR (Chuẩn từng chữ như ảnh người dùng gửi) */}
            <div className="pt-2">
              <h4 className="text-base sm:text-lg font-bold text-white mb-2">
                Hướng dẫn nạp tiền qua quét mã QR
              </h4>
              <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed">
                <p className="text-amber-400">
                  <span className="font-bold">1.</span> Đăng nhập ứng dụng Mobile Banking, chọn chức năng Scan QR và quét mã QR bên phải.
                </p>
                <p className="text-amber-400">
                  <span className="font-bold">2.</span> Nhập số tiền muốn nạp (<span className="text-rose-500 font-bold">{currentPlan.price.toLocaleString('vi-VN')} đ</span>), kiểm tra thông tin đơn hàng (NH, chủ TK, số TK, Nội dung CK) trùng khớp với thông tin CK bên trên.
                </p>
                <p className="text-amber-400">
                  <span className="font-bold">3.</span> Xác nhận thanh toán và chuyển tiền.
                </p>
                <p className="text-amber-400">
                  <span className="font-bold">4.</span> Sau khi đã chuyển tiền thành công bấm vào nút "Xác nhận" bên dưới (<span className="text-rose-500 font-bold">đợi 1 đến 3 phút cho nó load xong</span>) để hệ thống tự động kiểm tra và cộng quyền lợi / mở khóa cho bạn.
                </p>
                <p className="text-rose-400 font-medium">
                  <span className="font-bold text-rose-400">5. Quan trọng:</span> Trường hợp sau khi thực hiện bước 4 mà nó báo lỗi hệ thống bận hoặc không tìm thấy giao dịch thì các bạn đợi khoảng 3-5 phút sau đó nhấn lại nút Xác Nhận (Lặp lại giúp mình khoảng 3 lần như vậy nếu vẫn không được cộng tiền thì gửi tin nhắn vào Zalo <span className="font-bold underline">0986019623</span>).
                </p>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (5 PHẦN): Quét mã QR */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 sm:p-5 bg-slate-900/60 rounded-xl border border-slate-800">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center">Quét mã QR</h3>
            
            <div className="bg-white p-3 rounded-2xl shadow-2xl relative group">
              <img
                src={qrUrl}
                alt="VietQR MB Bank"
                className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-lg"
              />
            </div>
            
            <p className="text-slate-400 text-xs mt-3 text-center">
              Mở app ngân hàng bất kỳ (MB, VCB, Techcombank, VPBank...) để quét mã
            </p>
          </div>
        </div>

        {/* POPUP / BOX TIẾN TRÌNH TỰ CHECK (Khi người dùng bấm Xác Nhận Thanh Toán) */}
        {isAutoChecking && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-emerald-500/50 shadow-2xl mb-4 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                <span className="font-bold text-sm sm:text-base text-white">
                  Đang Tự Động Kiểm Tra Sao Kê MB Bank...
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(countdown)}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden mb-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 h-2.5 rounded-full transition-all duration-1000 animate-pulse"
                style={{ width: `${Math.min(100, Math.round(((90 - countdown) / 90) * 100))}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="text-emerald-300 font-mono">{checkLog}</span>
              <span>Đang quét tự động mỗi 4s</span>
            </div>
          </div>
        )}

        {/* THÔNG BÁO BƯỚC 5: KHI HẾT THỜI GIAN MÀ CHƯA THẤY GIAO DỊCH */}
        {checkStatus === 'not_found' && !isAutoChecking && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs sm:text-sm text-slate-200 mb-4 animate-fadeIn">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <div className="font-extrabold text-white text-base">
                  ⚠️ Chưa ghi nhận giao dịch "{transferContent}" trên MB Bank
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  Hệ thống ngân hàng có thể mất 1–3 phút để ghi nhận sao kê biến động số dư. Bạn vui lòng:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleStartAutoCheck}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Thử lại lần {retryCount + 1} (Kiểm tra lại)</span>
                  </button>

                  <a
                    href={zaloLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Gửi tin nhắn Zalo 0986019623 duyệt ngay</span>
                  </a>

                  <button
                    onClick={() => setShowManualPin(!showManualPin)}
                    className="px-3 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/40 border border-purple-500/40 text-purple-300 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Nhập mã kích hoạt</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* THÔNG BÁO THÀNH CÔNG */}
        {checkStatus === 'success' && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-sm mb-4 flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-base">🎉 XÁC THỰC THÀNH CÔNG! ĐÃ TỰ ĐỘNG CỘNG QUYỀN LỢI!</div>
              <div className="text-xs text-emerald-300">Đã nhận được tiền vào MB Bank. Hệ thống đang mở khóa toàn bộ bảng kê cho bạn...</div>
            </div>
          </div>
        )}

        {/* FORM NHẬP MÃ KÍCH HOẠT THỦ CÔNG NẾU CẦN */}
        {showManualPin && (
          <form onSubmit={handleManualPinSubmit} className="p-3 bg-slate-900 border border-purple-500/30 rounded-xl mb-4 flex gap-2">
            <input
              type="text"
              value={activationCode}
              onChange={(e) => {
                setActivationCode(e.target.value);
                setPinError('');
              }}
              placeholder="Nhập Mã Kích Hoạt (ví dụ: 8888 hoặc mã từ Zalo)..."
              className="flex-1 px-3 py-2 rounded-lg bg-black border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 cursor-pointer"
            >
              Kích Hoạt
            </button>
          </form>
        )}
        {pinError && <p className="text-xs text-rose-400 mb-3">{pinError}</p>}

        {/* NÚT TO XÁC NHẬN THANH TOÁN (Y hệt mẫu xanh lá cây trong ảnh) */}
        <div className="pt-2">
          <button
            onClick={handleStartAutoCheck}
            disabled={isAutoChecking}
            className="w-full py-4 px-6 rounded-xl bg-[#00a859] hover:bg-[#00924c] active:bg-[#007b40] text-white font-black text-base sm:text-lg tracking-wider uppercase shadow-xl shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isAutoChecking ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang Tự Động Kiểm Tra MB Bank ({formatTime(countdown)})...</span>
              </>
            ) : (
              <>
                <Check className="w-6 h-6 stroke-[3]" />
                <span>XÁC NHẬN THANH TOÁN</span>
              </>
            )}
          </button>
        </div>

        {/* Footer nhỏ & Nút cấu hình Admin */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Hệ thống tự động rà soát Napas 24/7 qua MB Bank</span>
          </div>

          <div className="flex items-center gap-3">
            <a href={zaloLink} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>Zalo: 0986019623</span>
            </a>

            {/* Admin SePay Config Toggle */}
            <button
              onClick={() => setShowAdminConfig(!showAdminConfig)}
              className="text-slate-600 hover:text-slate-400 p-1 rounded transition-colors"
              title="Cấu hình SePay API Token (Admin)"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MODAL CẤU HÌNH ADMIN SEPAY TOKEN */}
        {showAdminConfig && (
          <div className="mt-3 p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs space-y-2">
            <div className="font-bold text-white flex items-center justify-between">
              <span>⚙️ Cấu hình Tự Động Quét MB Bank qua SePay API (Admin):</span>
              <button onClick={() => setShowAdminConfig(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-slate-400 text-[11px]">
              Dán SePay API Token của tài khoản MB Bank 0986019623 để kích hoạt tự động quét 100% không cần can thiệp:
            </p>
            <form onSubmit={handleSaveSepayToken} className="flex gap-2">
              <input
                type="text"
                value={sepayToken}
                onChange={(e) => setSepayToken(e.target.value)}
                placeholder="Nhập SePay API Token..."
                className="flex-1 px-3 py-1.5 bg-black border border-slate-700 rounded text-white font-mono text-xs"
              />
              <button type="submit" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded text-white">
                Lưu Token
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
