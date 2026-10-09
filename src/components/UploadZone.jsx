import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, PlayCircle, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { parseExcelFile, downloadSampleExcel } from '../utils/auditEngine';
import { SAMPLE_ORDERS } from '../utils/sampleData';

export default function UploadZone({ onAuditComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const runAuditWithDelay = (orders, filename = "Du_lieu_doi_soat.xlsx") => {
    setIsScanning(true);
    setError(null);

    const steps = [
      "Đang đọc bảng kê & nhận diện cấu trúc file...",
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
          onAuditComplete(orders, filename);
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
      setScanStep("Đang phân tích file Excel đối soát...");
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
                Hỗ trợ file bảng kê gốc xuất từ GHTK, GHN, Shopee Xpress, TikTok Shop (.xlsx, .xls, .csv).
              </p>

              <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Không cần chỉnh sửa cột — Thuật toán tự động đọc và so khớp</span>
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
