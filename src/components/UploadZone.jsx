import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, PlayCircle, Download, CheckCircle, AlertCircle, Loader2, Sparkles, Bot, Zap, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { parseExcelFile, downloadSampleExcel } from '../utils/auditEngine';
import { SAMPLE_ORDERS } from '../utils/sampleData';
import { aiDeepAuditOrders } from '../utils/aiAuditor';

export default function UploadZone({ onAuditComplete, lastScan, onOpenHistory }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const runAiAuditFlow = async (orders, filename) => {
    setIsScanning(true);
    setError(null);
    setScanStep("🤖 Đang đọc cấu trúc bảng kê & nạp vào mô hình AI Kiểm Toán...");

    try {
      setScanStep("🧠 AI đang thẩm định đối chiếu từng dòng cước & cân nặng...");
      const aiResultPromise = aiDeepAuditOrders(orders);
      
      await new Promise(r => setTimeout(r, 600));
      setScanStep("🔍 Đang phát hiện kê lố cân nặng, phụ phí ảo và đơn hoàn giam kho...");
      
      const aiResult = await aiResultPromise;

      setScanStep("✨ AI hoàn tất phân tích! Đang tổng hợp báo cáo chi tiết...");
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

  const handleSampleClick = async () => {
    try {
      setIsScanning(true);
      setScanStep("📂 Đang tải và nạp bảng kê thực tế 300 đơn hàng đa hãng vận chuyển...");
      const res = await fetch('/Bang_Ke_Doi_Soat_Chi_Tiet_300_Don.xlsx');
      if (res.ok) {
        const blob = await res.blob();
        const file = new File([blob], "Bang_Ke_Doi_Soat_300_Don_GHTK_GHN_SPX.xlsx", { type: blob.type });
        const parsedOrders = await parseExcelFile(file);
        await runAiAuditFlow(parsedOrders, "Bang_Ke_Doi_Soat_300_Don_GHTK_GHN_SPX.xlsx");
        return;
      }
    } catch (e) {
      console.warn("Lỗi tải file 300 đơn, fallback:", e);
    }
    runAiAuditFlow(SAMPLE_ORDERS, "File_Mau_Shop_Thoi_Trang_130_Don.xlsx");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-12">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        
        {/* Banner lần quét trước */}
        {lastScan && (
          <div className="mb-5 p-3 sm:p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-extrabold text-amber-950">Lần soát đơn gần nhất:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[200px]">{lastScan.fileName}</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Phát hiện <b className="text-rose-600">{lastScan.anomalyCount} đơn lệch</b> • Nguy cơ thất thoát: <b className="text-rose-600 font-mono">{(lastScan.totalLeakage || 0).toLocaleString('vi-VN')} đ</b>
                </p>
              </div>
            </div>
            <button
              onClick={onOpenHistory}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs transition-all cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <span>Xem lại kết quả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* AI Badge header */}
        <div className="mb-6 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>Hệ thống Kiểm toán 100% bằng</span>
                <span className="text-indigo-600 font-black">AI Đối Soát Độc Quyền</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-indigo-200/60 text-indigo-800">Sẵn Sàng</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Tự động nhận diện và quét sâu — Bạn chỉ việc tải file lên và nhận kết quả phân tích trong vài giây.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Bảo mật 100%</span>
          </div>
        </div>

        {isScanning ? (
          <div className="py-14 text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-200 animate-ping" />
              <div className="w-16 h-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Hệ Thống AI Đang Phân Tích...</h3>
            <p className="text-sm font-semibold text-indigo-600 font-mono animate-pulse">{scanStep}</p>
            <div className="w-64 h-2 bg-slate-100 rounded-full mx-auto mt-6 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 animate-pulse w-4/5 rounded-full" />
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
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragging 
                  ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]' 
                  : 'border-slate-300 hover:border-indigo-500 bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => handleFile(e.target.files[0])} 
                accept=".xlsx,.xls,.csv" 
                className="hidden" 
              />

              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform shadow-xs">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5">
                Kéo thả file Excel đối soát vào đây, hoặc <span className="text-indigo-600 underline decoration-indigo-300 font-extrabold">chọn từ máy tính</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4">
                Hỗ trợ bảng kê của GHTK, GHN, Shopee Xpress, TikTok Shop, Viettel Post (.xlsx, .xls, .csv).
              </p>

              <div className="inline-flex items-center gap-2 text-xs text-slate-600 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI tự động loại bỏ dòng thừa, đọc kích thước thể tích và nhận diện chính xác 100%</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick action buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSampleClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <PlayCircle className="w-5 h-5 text-indigo-100" />
                <span>Quét thử ngay bằng AI (Bảng kê thực tế 300 đơn)</span>
              </button>

              <button
                type="button"
                onClick={downloadSampleExcel}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>Tải bảng kê mẫu 300 đơn (.xlsx)</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
