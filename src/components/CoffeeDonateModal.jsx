import React, { useState, useEffect } from 'react';
import { 
  X, Coffee, Heart, Sparkles, Copy, Check, QrCode, 
  Flame, MessageSquare, Send, CheckCircle2, ShieldCheck, ThumbsUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CoffeeDonateModal({ isOpen, onClose, defaultContext = null }) {
  if (!isOpen) return null;

  // Mức ủng hộ mặc định
  const PRESET_AMOUNTS = [
    { amount: 15000, label: 'Cốc trà đá', icon: '🥤', desc: 'Ủng hộ thanh mát' },
    { amount: 25000, label: 'Ly cà phê muối', icon: '☕', desc: 'Tiếp năng lượng code', popular: true },
    { amount: 50000, label: 'Bữa cơm trưa', icon: '🍱', desc: 'Ấm lòng lập trình viên' },
    { amount: 100000, label: 'Tiếp sức Server AI', icon: '🚀', desc: 'Duy trì máy chủ 1 tuần' }
  ];

  const [selectedAmount, setSelectedAmount] = useState(25000);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorMessage, setDonorMessage] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [isDonatedSuccess, setIsDonatedSuccess] = useState(false);

  // Mã định danh chuyển khoản
  const [donateCode] = useState(() => 'CAFE' + Math.floor(1000 + Math.random() * 9000));

  const actualAmount = isCustom ? (Number(customAmount) || 10000) : selectedAmount;

  const bankAccount = "0986019623";
  const bankName = "MB Bank (Ngân Hàng Quân Đội)";
  const accountHolder = "BUI QUOC THAI";
  
  // Nội dung chuyển khoản chuẩn VietQR (không dấu)
  const cleanDonor = (donorName || 'SHOP').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
  const transferContent = `${donateCode} ${cleanDonor}`;

  // VietQR URL
  const qrUrl = `https://img.vietqr.io/image/MB-${bankAccount}-compact2.png?amount=${actualAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountHolder)}`;

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSimulateDonated = () => {
    setIsDonatedSuccess(true);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Danh sách các shop đã ủng hộ gần đây (Social Proof)
  const RECENT_SUPPORTERS = [
    { name: 'Shop Mẹ & Bé Hà Nội', amount: '50.000 đ', note: 'Đòi lại được 2.3 củ GHTK, cảm ơn dev!' },
    { name: 'Gia Dụng Thông Minh SG', amount: '100.000 đ', note: 'Tool quá đỉnh cao, tiếp sức server nhé!' },
    { name: 'Kho Sỉ Thời Trang Mía', amount: '25.000 đ', note: 'Mời ly cà phê muối! Buôn may bán đắt nha!' },
    { name: 'Phụ Kiện Điện Thoại Z', amount: '50.000 đ', note: 'Rà ra 18 đơn ngâm hoàn quá hạn, quá xịn!' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8 text-slate-800">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/25">
            <Coffee className="w-8 h-8" />
            <Heart className="w-4 h-4 text-rose-300 fill-rose-300 absolute -top-1 -right-1 animate-bounce" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Tiếp Sức Đội Ngũ Phát Triển</span>
          </div>

          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Mời Dev Một Ly Cà Phê ☕
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
            {defaultContext || "SoatDon.vn hoạt động nhằm bảo vệ quyền lợi các nhà bán hàng. Sự ủng hộ của bạn là nguồn động lực to lớn giúp duy trì máy chủ AI và nâng cấp tính năng mới!"}
          </p>
        </div>

        {isDonatedSuccess ? (
          /* Màn hình cảm ơn sau khi chuyển khoản */
          <div className="text-center py-6 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-slate-900 mb-1">CẢM ƠN SHOP RẤT NHIỀU! ❤️</h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xs mx-auto mb-6">
              Đội ngũ SoatDon đã ghi nhận tình cảm quý báu của shop. Chúc shop tháng này buôn may bán đắt, bão đơn và không bao giờ bị bưu cục trừ oan!
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-md"
            >
              Trở lại màn hình chính
            </button>
          </div>
        ) : (
          <>
            {/* Các mức ủng hộ */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {PRESET_AMOUNTS.map(item => (
                <button
                  key={item.amount}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(item.amount);
                    setIsCustom(false);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    !isCustom && selectedAmount === item.amount
                      ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/50 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                  }`}
                >
                  {item.popular && (
                    <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded bg-amber-500 text-white text-[9px] font-black uppercase">
                      Yêu thích
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs font-bold text-slate-900">{item.label}</span>
                  </div>
                  <div className="font-mono font-black text-sm text-amber-700">
                    {item.amount.toLocaleString('vi-VN')} đ
                  </div>
                </button>
              ))}
            </div>

            {/* Tùy chọn Tùy Tâm */}
            <div className="mb-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isCustom 
                    ? 'bg-amber-500 text-white border-amber-500 shadow-2xs' 
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
              >
                Số tiền khác
              </button>
              {isCustom && (
                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Nhập số tiền (VD: 30000)..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    min="5000"
                    step="5000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-bold">đ</span>
                </div>
              )}
            </div>

            {/* Thông tin VietQR quét mã chuyển khoản */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/90 mb-5">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Ảnh QR */}
                <div className="bg-white p-2 rounded-xl border border-amber-200/80 shadow-xs shrink-0 text-center">
                  <img 
                    src={qrUrl} 
                    alt="VietQR MB Bank" 
                    className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-lg mx-auto"
                  />
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">Quét bằng mọi App Bank</span>
                </div>

                {/* Thông tin chuyển khoản */}
                <div className="flex-1 w-full text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Ngân hàng:</span>
                    <span className="font-bold text-slate-900">{bankName}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Số tài khoản:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-extrabold text-slate-900 text-sm">{bankAccount}</span>
                      <button 
                        onClick={() => handleCopy(bankAccount, 'acc')}
                        className="p-1 hover:bg-amber-100 rounded text-amber-700 transition-colors"
                        title="Sao chép STK"
                      >
                        {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Chủ tài khoản:</span>
                    <span className="font-bold text-slate-900">{accountHolder}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Số tiền:</span>
                    <span className="font-mono font-black text-rose-600 text-sm">
                      {actualAmount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white p-1.5 px-2 rounded-lg border border-amber-200">
                    <span className="text-slate-500 text-[11px]">Nội dung:</span>
                    <div className="flex items-center gap-1 font-mono font-bold text-indigo-700 text-[11px]">
                      <span>{transferContent}</span>
                      <button 
                        onClick={() => handleCopy(transferContent, 'content')}
                        className="p-0.5 hover:bg-slate-100 rounded text-slate-500"
                        title="Sao chép nội dung"
                      >
                        {copiedField === 'content' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nút xác nhận đã gửi */}
            <div className="flex flex-col sm:flex-row items-center gap-2 mb-5">
              <button
                type="button"
                onClick={handleSimulateDonated}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Tôi đã chuyển khoản thành công 🎉</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
              >
                Để sau
              </button>
            </div>

            {/* Bảng vàng các shop đã mời cà phê gần đây */}
            <div className="pt-3 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                <span>Cộng đồng shop đã tiếp sức gần đây:</span>
              </div>
              <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                {RECENT_SUPPORTERS.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] bg-slate-50 p-1.5 px-2.5 rounded-lg border border-slate-100">
                    <div className="truncate max-w-[220px]">
                      <b className="text-slate-800">{s.name}</b>: <span className="text-slate-500 italic">"{s.note}"</span>
                    </div>
                    <span className="font-mono font-bold text-amber-600 shrink-0">{s.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
