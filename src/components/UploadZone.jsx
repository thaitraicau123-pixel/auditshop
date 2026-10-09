import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileSpreadsheet, PlayCircle, Download, CheckCircle, AlertCircle, Loader2, Sparkles, Key, Bot } from 'lucide-react';
import { parseExcelFile, downloadSampleExcel } from '../utils/auditEngine';
import { SAMPLE_ORDERS } from '../utils/sampleData';

export default function UploadZone({ onAuditComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [error, setError] = useState(null);
  const [useAi, setUseAi] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey);
    }
  }, [apiKey]);

  const runAuditWithDelay = (orders, filename = "Du_lieu_doi_soat.xlsx") => {
    setIsScanning(true);
    setError(null);

    const steps = [
      useAi ? "🤖 AI Gemini đang phân tích cấu trúc cột & ngữ cảnh logistics..." : "Đang đọc bảng kê & nhận diện cấu trúc file...",
      "Kiểm tra khối lượng khai báo vs khối lượng tính cước...",
      "Rà soát đơn chuyển hoàn quá hạn 72h chưa hoàn tất...",
      "Đối chiếu tiền thu hộ COD & phát hiện phụ phí ẩn...",
      "Tổng hợp danh sách các đơn bị thất thoát..."
    ];

    let currentStep = 0;
    setScanStep(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setScanStep(steps[currentStep]);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
          onAuditComplete(orders, filename, apiKey);
        }, 400);
      }
    }, 450);
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError("Vui lòng tải lên file định dạng Excel (.xlsx, .xls) hoặc .csv!");
      return;
    }

    try {
      setIsScanning(true);
      setScanStep(useAi ? "🤖 AI Gemini đang quét sâu cấu trúc bảng kê..." : "Đang phân tích file Excel đối soát...");
      const parsedOrders = await parseExcelFile(file);
      runAuditWithDelay(parsedOrders, file.name);
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
    runAuditWithDelay(SAMPLE_ORDERS, "File_Mau_Shop_Thoi_Trang_130_Don.xlsx");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-12">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Subtle decorative gradient */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* AI Mode Banner */}
        <div className="mb-6 p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${useAi ? 'bg-gradient-to-tr from-purple-500 to-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>Chế độ kiểm toán:</span>
                <span className={useAi ? "text-purple-400 font-extrabold" : "text-emerald-400"}>
                  {useAi ? "🤖 AI Gemini Thông Minh (Chính xác 99%)" : "⚡ Thuật Toán Dò Cột Tự Động"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {useAi 
                  ? "AI tự hiểu cấu trúc bảng kê mọi hãng, phân biệt thể tích quy đổi và viết văn bản khiếu nại." 
                  : "Tự động phát hiện hàng tiêu đề, lọc dữ liệu rác ở các hàng đầu file."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>{apiKey ? "Đã lưu API Key" : "Cài đặt AI Key"}</span>
            </button>
            <button
              onClick={() => {
                setUseAi(!useAi);
                if (!useAi && !apiKey) setShowKeyInput(true);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                useAi
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
              }`}
            >
              {useAi ? "Đang bật AI ✓" : "Bật AI"}
            </button>
          </div>
        </div>

        {/* API Key configuration input */}
        {showKeyInput && (
          <div className="mb-6 p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 text-xs space-y-2 animate-fadeIn">
            <div className="flex justify-between items-center">
              <span className="font-bold text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Nhập Google Gemini API Key (Hoàn toàn miễn phí):</span>
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:underline"
              >
                Lấy Key miễn phí trong 1 phút ↗
              </a>
            </div>
            <input
              type="password"
              placeholder="Dán API Key (AIzaSy...)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-purple-500/40 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
            />
            <p className="text-[10px] text-slate-400">
              *Key chỉ lưu trên trình duyệt của bạn (LocalStorage), không gửi về máy chủ bên thứ ba nào.
            </p>
          </div>
        )}

        {isScanning ? (
          <div className="py-14 text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-rose-500/20 animate-ping" />
              <div className="w-16 h-16 rounded-full border-4 border-rose-500 border-t-transparent animate-spin flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Đang quét và kiểm toán dữ liệu...</h3>
            <p className="text-sm font-medium text-amber-400 font-mono animate-pulse">{scanStep}</p>
            <div className="w-64 h-1.5 bg-slate-700 rounded-full mx-auto mt-6 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 animate-pulse w-3/4 rounded-full" />
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
                  ? 'border-rose-500 bg-rose-500/5 scale-[1.01]' 
                  : 'border-slate-600/80 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-900/70'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => handleFile(e.target.files[0])} 
                accept=".xlsx,.xls,.csv" 
                className="hidden" 
              />

              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">
                Kéo thả file Excel đối soát vào đây, hoặc <span className="text-rose-400 underline decoration-rose-400/40">chọn từ máy tính</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-4">
                Tự động nhận diện cấu trúc file của GHTK, GHN, Shopee Xpress, TikTok Shop (.xlsx, .xls, .csv).
              </p>

              <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Thuật toán mới tự động bỏ qua các hàng thông tin công ty và tìm đúng cột dữ liệu</span>
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <PlayCircle className="w-5 h-5 text-emerald-100" />
                <span>Thử ngay với dữ liệu mẫu (Shop thời trang 130 đơn)</span>
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
