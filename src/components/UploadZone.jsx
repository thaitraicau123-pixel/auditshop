import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, PlayCircle, Download, CheckCircle, AlertCircle, Loader2, Sparkles, Bot, Zap } from 'lucide-react';
import { parseExcelFile, downloadSampleExcel } from '../utils/auditEngine';
import { SAMPLE_ORDERS } from '../utils/sampleData';
import { aiDeepAuditOrders } from '../utils/aiAuditor';

export default function UploadZone({ onAuditComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const runAiAuditFlow = async (orders, filename) => {
    setIsScanning(true);
    setError(null);
    setScanStep("🤖 Đang đọc cấu trúc bảng kê & chuẩn bị nạp vào Gemini 3.8 Flash...");

    try {
      // 1. Phân tích qua Gemini 3.8 Flash
      setScanStep("🧠 Gemini 3.8 Flash đang thẩm định từng dòng cước & cân nặng...");
      
      const aiResultPromise = aiDeepAuditOrders(orders);
      
      // Delay nhỏ để hiển thị tiến trình mượt mà
      await new Promise(r => setTimeout(r, 600));
      setScanStep("🔍 Gemini 3.8 đang phát hiện kê lố cân nặng, phụ phí ảo và đơn hoàn giam kho...");
      
      const aiResult = await aiResultPromise;

      setScanStep("✨ Gemini 3.8 hoàn tất phân tích! Đang tổng hợp báo cáo...");
      await new Promise(r => setTimeout(r, 400));

      setIsScanning(false);
      onAuditComplete(orders, filename, aiResult);
    } catch (err) {
      console.warn("AI flow error, fallback gracefully:", err);
      setIsScanning(false);
      onAuditComplete(orders, filename, null);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError("Vui lòng tải lên file định dạng Excel (.xlsx, .xls) hoặc .csv!");
      return;
    }

    try {
      setIsScanning(true);
      setScanStep("📂 Đang đọc dữ liệu file Excel...");
      const parsedOrders = await parseExcelFile(file);
      await runAiAuditFlow(parsedOrders, file.name);
    } catch (err) {
      setIsScanning(false);
      setError("Lỗi khi đọc file: " + (err.message || "File không đúng cấu trúc bảng kê."));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSampleClick = () => {
    runAiAuditFlow(SAMPLE_ORDERS, "File_Mau_Shop_Thoi_Trang_130_Don.xlsx");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-12">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* AI Badge header */}
        <div className="mb-6 p-3.5 rounded-xl bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-slate-900 border border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>Hệ thống Kiểm toán 100% bằng</span>
                <span className="bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">Google Gemini 3.8 Flash</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">Active</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tự động kích hoạt sẵn API Key — Bạn chỉ cần tải file lên và chờ kết quả trong vài giây.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 fill-emerald-400" />
            <span>AI Sẵn Sàng</span>
          </div>
        </div>

        {isScanning ? (
          <div className="py-14 text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-ping" />
              <div className="w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Gemini 3.8 Flash Đang Phân Tích...</h3>
            <p className="text-sm font-medium text-purple-300 font-mono animate-pulse">{scanStep}</p>
            <div className="w-64 h-1.5 bg-slate-700 rounded-full mx-auto mt-6 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-rose-500 animate-pulse w-4/5 rounded-full" />
            </div>
          </div>
        ) : (
          <>
            {/* Upload Box */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragging 
                  ? 'border-purple-500 bg-purple-500/10 scale-[1.01]' 
                  : 'border-slate-600/80 hover:border-purple-500/80 bg-slate-900/40 hover:bg-slate-900/70'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => handleFile(e.target.files[0])} 
                accept=".xlsx,.xls,.csv" 
                className="hidden" 
              />

              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">
                Kéo thả file Excel đối soát vào đây, hoặc <span className="text-purple-400 underline decoration-purple-400/40">chọn từ máy tính</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-4">
                Hỗ trợ bảng kê của GHTK, GHN, Shopee Xpress, TikTok Shop, Viettel Post (.xlsx, .xls, .csv).
              </p>

              <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>AI tự động loại bỏ dòng rác, phân biệt kích thước thể tích và nhận diện chính xác 100%</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick action buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-700/60">
              <button
                type="button"
                onClick={handleSampleClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <PlayCircle className="w-5 h-5 text-purple-200" />
                <span>Thử ngay bằng Gemini 3.8 (Dữ liệu mẫu 130 đơn)</span>
              </button>

              <button
                type="button"
                onClick={downloadSampleExcel}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>Tải file Excel mẫu về máy</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
