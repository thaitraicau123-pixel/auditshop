import React, { useState } from 'react';
import { X, Copy, Check, FileCheck, Send, Info, ExternalLink, Sparkles, Loader2, Bot } from 'lucide-react';
import { generateDisputeTemplate } from '../utils/exportDispute';
import { aiWriteDisputeLetter } from '../utils/aiAuditor';

export default function DisputeTemplateModal({ isOpen, onClose, anomalies, apiKey }) {
  if (!isOpen) return null;

  const [carrier, setCarrier] = useState(anomalies[0]?.carrier || 'GHTK');
  const [copied, setCopied] = useState(false);
  const [customText, setCustomText] = useState(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Lọc các mã theo hãng được chọn
  const filteredAnomalies = anomalies.filter(a => a.carrier.toLowerCase().includes(carrier.toLowerCase()) || carrier === 'Tất cả');
  const totalAmount = filteredAnomalies.reduce((sum, a) => sum + a.leakAmount, 0);
  const topTrackingCodes = filteredAnomalies.slice(0, 5).map(a => a.id);

  const defaultEmail = generateDisputeTemplate({
    carrier,
    totalAmount,
    count: filteredAnomalies.length,
    topTrackingCodes
  });

  const activeText = customText || defaultEmail;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAiDraft = async () => {
    const key = apiKey || localStorage.getItem('gemini_api_key');
    if (!key) {
      alert("Vui lòng nhập Google Gemini API Key ở phần 'Cài đặt AI Key' trên trang chủ để kích hoạt AI soạn văn bản!");
      return;
    }

    try {
      setIsGeneratingAi(true);
      const letter = await aiWriteDisputeLetter(carrier, filteredAnomalies, key);
      if (letter) {
        setCustomText(letter);
      }
    } catch (err) {
      alert("Lỗi AI: " + err.message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Mẫu thư khiếu nại bồi hoàn chuẩn</h3>
              <p className="text-xs text-slate-400">Sao chép nội dung này gửi email hoặc gửi group Zalo của bưu cục/CSKH</p>
            </div>
          </div>

          <button
            onClick={handleAiDraft}
            disabled={isGeneratingAi}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isGeneratingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
            <span>{isGeneratingAi ? "AI đang viết..." : "🤖 AI Soạn Đơn Đanh Thép"}</span>
          </button>
        </div>

        {/* Carrier selection */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {['GHTK', 'GHN', 'Shopee Xpress', 'TikTok Shop', 'Viettel Post'].map((c) => (
            <button
              key={c}
              onClick={() => {
                setCarrier(c);
                setCustomText(null); // Reset to default for new carrier
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                carrier === c
                  ? 'bg-amber-400 text-slate-900 shadow'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Template textarea */}
        <div className="relative mb-4">
          <pre className="w-full h-64 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 font-mono overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
            {activeText}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Đã sao chép!' : 'Sao chép thư'}</span>
          </button>
        </div>

        {/* 3 Step Guide to Dispute */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs text-slate-300">
          <div className="font-semibold text-white flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-400" />
            <span>Mẹo gửi khiếu nại thành công 100%:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-400">
            <li>Đính kèm file Excel danh sách mã vừa tải về từ web vào email/tin nhắn.</li>
            <li>Gửi trực tiếp cho bạn Trưởng bưu cục phụ trách lấy hàng của shop (thường duyệt nhanh hơn tổng đài CSKH).</li>
            <li>Nhắc nhở hạn xử lý 48h theo đúng quy chế bồi thường của hãng.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
