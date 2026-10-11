import React, { useState } from 'react';
import { X, Copy, Check, FileCheck, Mail, Send, Info, Sparkles, Bot, Loader2, Printer } from 'lucide-react';
import { DISPUTE_TEMPLATES } from '../utils/exportDispute';
import { aiGenerateDisputeScript } from '../utils/aiAuditor';

export default function DisputeTemplateModal({ isOpen, onClose, anomalies }) {
  if (!isOpen) return null;

  const [carrier, setCarrier] = useState('GHTK');
  const [copied, setCopied] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [customText, setCustomText] = useState(null);

  const activeText = customText || DISPUTE_TEMPLATES[carrier] || DISPUTE_TEMPLATES.GHTK;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintFormalLetter = () => {
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    const today = new Date();
    const dateStr = `Ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bien_Ban_Khieu_Nai_${carrier}_${Date.now()}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: "Times New Roman", Times, serif; font-size: 13.5pt; line-height: 1.5; color: #000; margin: 0; padding: 24px; }
            .header-top { text-align: center; font-weight: bold; margin-bottom: 25px; }
            .header-top h3 { margin: 0; font-size: 13pt; text-transform: uppercase; }
            .header-top h4 { margin: 5px 0 0 0; font-size: 13.5pt; }
            .header-top hr { width: 180px; border: none; border-top: 1px solid #000; margin: 8px auto 0 auto; }
            .date-right { text-align: right; font-style: italic; margin-bottom: 25px; font-size: 12.5pt; }
            .title { text-align: center; font-size: 16pt; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; }
            .subtitle { text-align: center; font-style: italic; font-size: 12pt; margin-bottom: 25px; }
            .content { white-space: pre-wrap; font-family: "Times New Roman", Times, serif; font-size: 13pt; line-height: 1.6; text-align: justify; }
            .signatures { margin-top: 55px; display: flex; justify-content: space-between; page-break-inside: avoid; }
            .sig-block { text-align: center; width: 45%; }
            .sig-title { font-weight: bold; font-size: 12.5pt; text-transform: uppercase; }
            .sig-subtitle { font-style: italic; font-size: 11pt; margin-bottom: 75px; }
            .sig-name { font-weight: bold; font-size: 12.5pt; }
            .footer-note { margin-top: 40px; font-size: 10pt; font-style: italic; color: #555; border-top: 1px dashed #aaa; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="header-top">
            <h3>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
            <h4>Độc lập – Tự do – Hạnh phúc</h4>
            <hr />
          </div>

          <div class="date-right">..., ${dateStr}</div>

          <div class="title">ĐƠN KHIẾU NẠI & YÊU CẦU BỒI HOÀN CƯỚC VẬN CHUYỂN</div>
          <div class="subtitle">(V/v: Sai lệch nấc cân nặng / Cước phí bất thường / Đơn hoàn ngâm quá hạn quy chế)</div>

          <div class="content">${activeText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>

          <div class="signatures">
            <div class="sig-block">
              <div class="sig-title">ĐẠI DIỆN ĐƠN VỊ VẬN CHUYỂN (${carrier})</div>
              <div class="sig-subtitle">(Ký, ghi rõ họ tên và đóng dấu xác nhận)</div>
              <div class="sig-name">...................................................</div>
            </div>

            <div class="sig-block">
              <div class="sig-title">NGƯỜI LÀM ĐƠN KHIẾU NẠI</div>
              <div class="sig-subtitle">(Ký và ghi rõ họ tên)</div>
              <div class="sig-name">Đại diện Chủ Shop</div>
            </div>
          </div>

          <div class="footer-note">
            * Văn bản được trích xuất tự động từ Nền tảng SoatDon.vn – Kèm theo phụ lục danh sách chi tiết các mã vận đơn bị sai sót đối soát.
          </div>

          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleAiDraft = async () => {
    if (!anomalies || anomalies.length === 0) return;
    setIsGeneratingAi(true);
    try {
      const topAnomalies = anomalies.slice(0, 5);
      const script = await aiGenerateDisputeScript(topAnomalies, carrier);
      if (script) {
        setCustomText(script);
      }
    } catch (err) {
      alert("Lỗi AI: " + err.message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 text-slate-800">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shadow-xs">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Mẫu thư khiếu nại bồi hoàn chuẩn</h3>
              <p className="text-xs text-slate-500">Gửi email / Zalo bưu cục hoặc in biên bản nộp trực tiếp</p>
            </div>
          </div>

          <button
            onClick={handleAiDraft}
            disabled={isGeneratingAi}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all shrink-0 cursor-pointer disabled:opacity-50"
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
                setCustomText(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                carrier === c
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Template textarea */}
        <div className="relative mb-4">
          <pre className="w-full h-64 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-mono overflow-y-auto whitespace-pre-wrap leading-relaxed select-text shadow-inner">
            {activeText}
          </pre>
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              onClick={handlePrintFormalLetter}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              title="In công văn khiếu nại trang trọng hoặc xuất ra file PDF nộp bưu cục"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>In Biên Bản / PDF</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép thư'}</span>
            </button>
          </div>
        </div>

        {/* 3 Step Guide to Dispute */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-2">
          <div className="font-bold text-emerald-950 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Mẹo gửi khiếu nại thành công 100%:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-emerald-800/90 pl-1">
            <li>Đính kèm file Excel danh sách mã vừa tải về từ web vào email/tin nhắn.</li>
            <li>Gửi trực tiếp cho bạn Trưởng bưu cục phụ trách lấy hàng của shop (thường duyệt nhanh hơn tổng đài CSKH).</li>
            <li>Nhắc nhở hạn xử lý 48h theo đúng quy chế bồi thường của hãng.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
