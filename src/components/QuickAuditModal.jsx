import React, { useState, useEffect } from 'react';
import { 
  X, Search, Scale, AlertTriangle, CheckCircle2, Copy, Check, 
  HelpCircle, ShieldCheck, ArrowRight, Zap, RefreshCw, FileText 
} from 'lucide-react';

export default function QuickAuditModal({ isOpen, onClose }) {
  const [carrier, setCarrier] = useState('GHTK');
  const [trackingCode, setTrackingCode] = useState('GHTK8829104');
  const [shopWeight, setShopWeight] = useState(300);
  const [length, setLength] = useState(20);
  const [width, setWidth] = useState(15);
  const [height, setHeight] = useState(10);
  const [carrierFeeCharged, setCarrierFeeCharged] = useState(42000);
  const [codAmount, setCodAmount] = useState(320000);
  const [copied, setCopied] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  // Thoát nhanh bằng phím Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleAuditSingleOrder = () => {
    const divisor = carrier === 'VTP' ? 6000 : 5000;
    const volWeight = Math.round((Number(length) * Number(width) * Number(height)) / divisor * 1000);
    const standardWeight = Math.max(Number(shopWeight), volWeight);

    // Tính cước tiêu chuẩn dự kiến
    let standardExpectedFee = 24000; // Mặc định nấc 500g liên tỉnh
    if (standardWeight <= 500) {
      standardExpectedFee = 24000;
    } else {
      const extraSteps = Math.ceil((standardWeight - 500) / 500);
      standardExpectedFee = 24000 + extraSteps * 5000;
    }

    const overcharge = Math.max(0, Number(carrierFeeCharged) - standardExpectedFee);
    const isOvercharged = overcharge > 0;

    const explanation = isOvercharged
      ? `Bưu cục đang tính cước ${Number(carrierFeeCharged).toLocaleString('vi-VN')} đ (nấc ~1.5kg). Trong khi kiện hàng kích thước ${length}x${width}x${height} cm chỉ tương đương ${standardWeight}g (nấc cước chuẩn chỉ ${standardExpectedFee.toLocaleString('vi-VN')} đ). Chênh lệch tính lố: +${overcharge.toLocaleString('vi-VN')} đ.`
      : `Cước bưu cục tính (${Number(carrierFeeCharged).toLocaleString('vi-VN')} đ) nằm trong khung thỏa thuận tiêu chuẩn cho kiện hàng ${standardWeight}g.`;

    const disputeScript = `YÊU CẦU ĐỐI SOÁT LẠI NẤC CÂN MÃ ĐƠN: ${trackingCode}
- Hãng vận chuyển: ${carrier}
- Kích thước đo thực tế: ${length}x${width}x${height} cm (Quy đổi: ${volWeight}g)
- Cân nặng thực tế tại kho: ${shopWeight}g
=> Cân nặng tính cước chuẩn: ${standardWeight}g (Nấc ${standardWeight <= 500 ? '< 500g' : '< 1000g'})
- Cước bưu cục đang thu: ${Number(carrierFeeCharged).toLocaleString('vi-VN')} đ
- Cước đúng biểu phí: ${standardExpectedFee.toLocaleString('vi-VN')} đ
=> ĐỀ NGHỊ BƯU TÁ / KẾ TOÁN BƯU CỤC ĐIỀU CHỈNH LẠI CƯỚC, HOÀN TRẢ ${overcharge.toLocaleString('vi-VN')} Đ.`;

    setAuditResult({
      standardWeight,
      volWeight,
      standardExpectedFee,
      overcharge,
      isOvercharged,
      explanation,
      disputeScript
    });
  };

  const handleCopyScript = () => {
    if (!auditResult?.disputeScript) return;
    navigator.clipboard.writeText(auditResult.disputeScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 md:p-6 flex items-start justify-center animate-fade-in font-sans"
    >
      <div className="bg-white border border-slate-200/90 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] relative text-slate-800">
        
        {/* Header Cố Định */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-wide">
                Soi Nhanh 1 Mã Vận Đơn Bất Kỳ
              </h3>
              <p className="text-[11px] text-slate-400">
                Phân tích nấc cước tức thì để đối chất trực tiếp với bưu tá tại quầy
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 transition-colors flex items-center justify-center cursor-pointer shrink-0 shadow-xs"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung Form */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50/50">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mã vận đơn cần soi</label>
                <input 
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="VD: GHTK8829104"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hãng vận chuyển</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  <option value="GHTK">Giao Hàng Tiết Kiệm (GHTK)</option>
                  <option value="GHN">Giao Hàng Nhanh (GHN)</option>
                  <option value="VTP">Viettel Post</option>
                  <option value="SPX">Shopee Xpress (SPX)</option>
                  <option value="JT">J&amp;T Express</option>
                  <option value="TTS">TikTok Shop Logistics</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cân thực tế kho (g)</label>
                <input 
                  type="number"
                  value={shopWeight}
                  onChange={(e) => setShopWeight(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cước bưu cục tính (đ)</label>
                <input 
                  type="number"
                  value={carrierFeeCharged}
                  onChange={(e) => setCarrierFeeCharged(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiền thu hộ COD (đ)</label>
                <input 
                  type="number"
                  value={codAmount}
                  onChange={(e) => setCodAmount(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Kích thước bưu gửi (Dài x Rộng x Cao cm)</label>
              <div className="grid grid-cols-3 gap-2">
                <input 
                  type="number" 
                  value={length} 
                  onChange={(e) => setLength(Number(e.target.value))} 
                  placeholder="Dài" 
                  className="p-2 rounded-xl border border-slate-200 text-xs font-mono" 
                />
                <input 
                  type="number" 
                  value={width} 
                  onChange={(e) => setWidth(Number(e.target.value))} 
                  placeholder="Rộng" 
                  className="p-2 rounded-xl border border-slate-200 text-xs font-mono" 
                />
                <input 
                  type="number" 
                  value={height} 
                  onChange={(e) => setHeight(Number(e.target.value))} 
                  placeholder="Cao" 
                  className="p-2 rounded-xl border border-slate-200 text-xs font-mono" 
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAuditSingleOrder}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4" />
              <span>Kiểm Tra Nấc Cước Đơn Này Ngay (1 Giây)</span>
            </button>
          </div>

          {/* Kết quả sau khi phân tích */}
          {auditResult && (
            <div className={`p-5 rounded-2xl border-2 transition-all ${
              auditResult.isOvercharged 
                ? 'bg-rose-50/70 border-rose-300' 
                : 'bg-emerald-50/70 border-emerald-300'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                  auditResult.isOvercharged ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {auditResult.isOvercharged ? 'CẢNH BÁO: TÍNH THỪA CƯỚC' : 'CƯỚC HỢP LỆ'}
                </span>
                {auditResult.isOvercharged && (
                  <span className="text-sm font-black font-mono text-rose-700">
                    Bị tính lố: +{auditResult.overcharge.toLocaleString('vi-VN')} đ
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-700 leading-relaxed mb-4">
                {auditResult.explanation}
              </p>

              {auditResult.isOvercharged && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">
                      Đoạn cãi lý mẫu chìa cho shipper / bưu tá xem ngay:
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyScript}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Đã chép!' : 'Sao chép tin nhắn'}</span>
                    </button>
                  </div>

                  <pre className="p-3 bg-white border border-rose-200 rounded-xl text-[11px] font-mono text-slate-700 whitespace-pre-wrap leading-relaxed select-all">
                    {auditResult.disputeScript}
                  </pre>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Cố Định */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Áp dụng chuẩn quy chế bưu chính Việt Nam 2026</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
