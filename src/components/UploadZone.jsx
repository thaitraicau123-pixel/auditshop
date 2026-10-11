import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, FileSpreadsheet, PlayCircle, Download, CheckCircle, AlertCircle, 
  Loader2, Sparkles, Bot, Zap, ShieldCheck, Clock, ArrowRight, CheckCircle2, 
  Flame, Award, Package, ShoppingBag, Truck, FileUp, Sparkle
} from 'lucide-react';
import { parseExcelFile, parseExcelWorkbook, downloadSampleExcel } from '../utils/auditEngine';
import { SAMPLE_ORDERS } from '../utils/sampleData';
import { aiDeepAuditOrders } from '../utils/aiAuditor';
import { generateTestDataset } from '../utils/aiSelfTester';
import { sounds } from '../utils/soundEffects';

export default function UploadZone({ onAuditComplete, lastScan, onOpenHistory, soundEnabled = true }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStageIndex, setScanStageIndex] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const SCAN_STAGES = [
    { title: "Đọc cấu trúc bảng kê & loại bỏ banner tiêu đề", icon: "📂" },
    { title: "Đối chiếu kích thước thể tích (DxRxC) & nấc cân nặng", icon: "⚖️" },
    { title: "Thẩm định cước niêm yết & phát hiện phụ phí ảo", icon: "💰" },
    { title: "Rà soát đơn hoàn ngâm > 72h & tiền thu hộ COD", icon: "📦" }
  ];

  const runAiAuditFlow = async (orders, filename) => {
    setIsScanning(true);
    setError(null);
    setScanProgress(15);
    setScanStageIndex(0);
    setScanStep("Đang nạp dữ liệu và kiểm tra cấu trúc cột...");

    try {
      await new Promise(r => setTimeout(r, 350));
      setScanProgress(40);
      setScanStageIndex(1);
      setScanStep("AI đang tính toán nấc cân nặng thực tế và thể tích quy đổi...");

      const aiResultPromise = aiDeepAuditOrders(orders);
      
      await new Promise(r => setTimeout(r, 450));
      setScanProgress(70);
      setScanStageIndex(2);
      setScanStep("Đang so sánh biểu phí thỏa thuận và phụ phí vùng xa...");

      await new Promise(r => setTimeout(r, 400));
      setScanProgress(90);
      setScanStageIndex(3);
      setScanStep("Đang kiểm toán đơn chuyển hoàn giam kho và tiền COD...");

      const aiResult = await aiResultPromise;

      setScanProgress(100);
      setScanStep("✨ Hoàn tất kiểm toán toàn diện! Đang mở bảng kết quả...");
      await new Promise(r => setTimeout(r, 350));

      if (soundEnabled) {
        if (orders && orders.some(o => o.isWeightCheat || o.isReturnStalled || o.isExcessiveFee || o.isCodDiscrepancy)) {
          sounds.playAlarm();
        } else {
          sounds.playVictory();
        }
      }

      setIsScanning(false);
      onAuditComplete(orders, filename, aiResult);
    } catch (err) {
      console.warn("AI flow error, fallback gracefully:", err);
      setIsScanning(false);
      onAuditComplete(orders, filename, null);
    }
  };

  const handleSelectSampleCarrier = async (carrierKey) => {
    try {
      if (carrierKey === 'ALL_300') {
        handleSampleClick();
        return;
      }

      if (carrierKey === 'CLEAN_100') {
        setIsScanning(true);
        setScanStep("🏆 Đang nạp bảng kê đối soát chuẩn 100% không phát sinh lỗi...");
        const dataset = generateTestDataset(50, 'CLEAN', 'GHTK');
        const parsedOrders = parseExcelWorkbook(dataset.workbook || dataset.wb);
        await runAiAuditFlow(parsedOrders, "Bang_Ke_Chuan_Doi_Soat_100_Phan_Tram.xlsx");
        return;
      }

      const carrierMap = {
        GHTK: { count: 50, name: "Bang_Ke_Doi_Soat_GHTK_50_Don.xlsx" },
        GHN: { count: 50, name: "Bang_Ke_Doi_Soat_GHN_50_Don.xlsx" },
        VTP: { count: 80, name: "Bang_Ke_Doi_Soat_Viettel_Post_80_Don.xlsx" },
        SPX: { count: 65, name: "Bang_Ke_Doi_Soat_Shopee_Xpress_65_Don.xlsx" },
        TIKTOK: { count: 60, name: "Bang_Ke_Doi_Soat_TikTok_Shop_60_Don.xlsx" }
      };

      const info = carrierMap[carrierKey] || { count: 50, name: "Bang_Ke_Doi_Soat_Mau.xlsx" };
      setIsScanning(true);
      setScanStep(`📂 Đang khởi tạo bảng kê ${carrierKey} (${info.count} đơn)...`);
      const dataset = generateTestDataset(info.count, 'MIXED', carrierKey);
      const parsedOrders = parseExcelWorkbook(dataset.workbook || dataset.wb);
      await runAiAuditFlow(parsedOrders, info.name);
    } catch (err) {
      console.warn("Lỗi load sample carrier:", err);
      runAiAuditFlow(SAMPLE_ORDERS, "Bang_Ke_Doi_Soat_Mau.xlsx");
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-14">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-9 shadow-lg relative overflow-hidden transition-all">
        
        {/* Banner lần soát đơn gần nhất */}
        {lastScan && (
          <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-amber-950">Lần soát đơn gần nhất:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[220px]">{lastScan.fileName}</span>
                </div>
                <p className="text-[11px] text-amber-900 mt-0.5">
                  Phát hiện <b className="text-rose-600 font-bold">{lastScan.anomalyCount} đơn bất thường</b> • Nguy cơ thất thoát: <b className="text-rose-600 font-mono font-black">{(lastScan.totalLeakage || 0).toLocaleString('vi-VN')} đ</b>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenHistory}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-xs transition-all cursor-pointer shrink-0 shadow-sm flex items-center gap-1.5"
            >
              <span>Xem lại kết quả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* AI System Badge Header */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-blue-50/60 to-indigo-50/90 border border-indigo-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span>Hệ thống Kiểm toán 100% bằng</span>
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent font-black">AI Đối Soát Độc Quyền</span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Tự động nhận diện cấu trúc, bóc tách lỗi nấc cân, hàng hoàn và xuất file đòi tiền trong 10 giây.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0 self-start sm:self-auto shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Mã hóa Client-Side</span>
          </div>
        </div>

        {isScanning ? (
          /* SCANNING HUD STATE */
          <div className="py-8 sm:py-12 text-center max-w-lg mx-auto animate-fadeIn">
            {/* Mascot Companion Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold uppercase tracking-wider mb-6 shadow-2xs">
              <span className="text-base animate-pet-wag">🐶</span>
              <span>Cún Soi Cước & Mèo Thần Tài</span>
              <span className="text-base animate-pet-bounce">🐱</span>
              <span className="text-slate-300 mx-1">•</span>
              <span className="font-mono text-indigo-700 font-black">{scanProgress}%</span>
            </div>

            {/* Circular Progress HUD */}
            <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/15 via-blue-500/10 to-violet-500/15 blur-2xl animate-pulse" />
              
              <svg className="w-40 h-40 -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-100"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-indigo-600 transition-all duration-300 ease-out"
                  strokeWidth="6"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * scanProgress) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-3xl mb-0.5">
                  {scanStageIndex === 0 && <span className="animate-pet-wag inline-block">🐶🔎</span>}
                  {scanStageIndex === 1 && <span className="animate-pet-bounce inline-block">🐶⚖️🐱</span>}
                  {scanStageIndex === 2 && <span className="animate-pet-nod inline-block">🐱🧮</span>}
                  {scanStageIndex >= 3 && <span className="animate-bounce inline-block">🐶✨🐱</span>}
                </div>
                <div className="font-mono text-2xl font-black text-slate-900 tracking-tight">
                  {scanProgress}%
                </div>
              </div>
            </div>

            {/* Step Message */}
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
              Đang Rà Soát Bảng Kê...
            </h3>

            <p className="text-xs sm:text-sm font-semibold text-indigo-800 bg-indigo-50/90 py-2.5 px-4 rounded-xl border border-indigo-100 max-w-md mx-auto mb-6 shadow-2xs">
              {scanStageIndex === 0 && `🐶 [Cún Soi Cước]: "Gâu gâu! Em đang đọc file và bỏ qua banner đầu trang..."`}
              {scanStageIndex === 1 && `⚖️ [AI Thẩm Định]: "Đang soi từng gam cân nặng thực tế và thể tích DxRxC..."`}
              {scanStageIndex === 2 && `🐱 [Mèo Thần Tài]: "Meo meo! Đang đếm lại tiền cước và phụ phí vùng xa..."`}
              {scanStageIndex >= 3 && `✨ [Bảo Vệ Doanh Thu]: "Rà soát đơn hoàn ngâm > 72h & tiền thu hộ COD!"`}
            </p>

            {/* 4 Steps Timeline Pills */}
            <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
              {[
                { title: "Đọc file", icon: "📂" },
                { title: "Cân nặng", icon: "⚖️" },
                { title: "Cước phí", icon: "💰" },
                { title: "Hàng hoàn", icon: "📦" }
              ].map((step, idx) => {
                const isPassed = scanStageIndex > idx;
                const isCurrent = scanStageIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      isPassed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : isCurrent
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs ring-2 ring-indigo-200'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="text-xs mb-0.5">{isPassed ? '✅' : step.icon}</div>
                    <div className="truncate text-[10px] sm:text-[11px]">{step.title}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* IDLE UPLOAD DROPZONE STATE */
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                isDragging 
                  ? 'border-indigo-600 bg-indigo-50/70 scale-[1.01] shadow-xl shadow-indigo-500/10' 
                  : 'border-slate-300 hover:border-indigo-500 bg-slate-50/40 hover:bg-slate-50/90 hover:shadow-md'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => handleFile(e.target.files[0])} 
                accept=".xlsx,.xls,.csv" 
                className="hidden" 
              />

              {/* Upload Graphic */}
              <div className="w-18 h-18 mx-auto mb-4 rounded-3xl bg-indigo-50 border border-indigo-200/90 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs relative">
                <UploadCloud className="w-9 h-9" />
                <span className="absolute -top-1.5 -right-1.5 text-lg animate-pet-wag">🐶</span>
                <span className="absolute -bottom-1.5 -left-1.5 text-lg animate-pet-bounce">🐱</span>
              </div>

              {/* Pet Assistant Helper Pills */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold inline-flex items-center gap-1.5 shadow-2xs">
                  <span>🐶</span> Cún canh nấc cân
                </span>
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-900 border border-rose-200 text-[11px] font-bold inline-flex items-center gap-1.5 shadow-2xs">
                  <span>🐱</span> Mèo đếm tiền COD
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                Kéo thả file Excel đối soát vào đây, hoặc <span className="text-indigo-600 underline decoration-indigo-300 font-black group-hover:text-indigo-700">chọn từ máy tính</span>
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
                Tương thích 100% bảng kê đối soát của GHTK, GHN, Shopee Xpress, TikTok Shop, Viettel Post (.xlsx, .xls, .csv).
              </p>

              <div className="inline-flex items-center gap-2 text-xs text-slate-700 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold">AI tự động lọc banner, nhận diện nấc cân và đối chiếu sai lệch trong 10 giây</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick 1-Click Multi-Carrier Sample Bar */}
            <div className="mt-7 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
                <div className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="text-base animate-pet-wag">🐶</span>
                  <span className="text-base animate-pet-bounce">🐱</span>
                  <span>Chưa có file sẵn? Thử ngay 7 bảng kê mẫu thực tế (1-Click AI Test):</span>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleExcel}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải file Excel mẫu chuẩn (.xlsx)</span>
                </button>
              </div>

              {/* 7 Preset Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {/* 1. GHTK */}
                <button
                  type="button"
                  onClick={() => handleSelectSampleCarrier('GHTK')}
                  className="p-3 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200/90 hover:border-emerald-300 text-emerald-950 font-bold text-xs flex flex-col items-center gap-1 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-2xs group"
                  title="Quét thử bảng kê Giao Hàng Tiết Kiệm (50 đơn)"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shadow-2xs">
                    TK
                  </span>
                  <span className="font-black tracking-tight text-slate-900">GHTK</span>
                  <span className="text-[10px] text-emerald-700 font-mono font-bold">50 đơn</span>
                </button>

                {/* 2. GHN */}
                <button
                  type="button"
                  onClick={() => handleSelectSampleCarrier('GHN')}
                  className="p-3 rounded-2xl bg-amber-50/80 hover:bg-amber-100 border border-amber-200/90 hover:border-amber-300 text-amber-950 font-bold text-xs flex flex-col items-center gap-1 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-2xs group"
                  title="Quét thử bảng kê Giao Hàng Nhanh (50 đơn)"
                >
                  <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-black shadow-2xs">
                    GH
                  </span>
                  <span className="font-black tracking-tight text-slate-900">GHN</span>
                  <span className="text-[10px] text-amber-800 font-mono font-bold">50 đơn</span>
                </button>

                {/* 3. Viettel Post */}
                <button
                  type="button"
                  onClick={() => handleSelectSampleCarrier('VTP')}
                  className="p-3 rounded-2xl bg-red-50/80 hover:bg-red-100 border border-red-200/90 hover:border-red-300 text-red-950 font-bold text-xs flex flex-col items-center gap-1 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-2xs group"
                  title="Quét thử bảng kê Viettel Post (80 đơn)"
                >
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black shadow-2xs">
                    VT
                  </span>
                  <span className="font-black tracking-tight text-slate-900">Viettel Post</span>
                  <span className="text-[10px] text-red-700 font-mono font-bold">80 đơn</span>
                </button>

                {/* 4. Shopee SPX */}
                <button
                  type="button"
                  onClick={() => handleSelectSampleCarrier('SPX')}
                  className="p-3 rounded-2xl bg-sky-50/80 hover:bg-sky-100 border border-sky-200/90 hover:border-sky-300 text-sky-950 font-bold text-xs flex flex-col items-center gap-1 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-2xs group"
                  title="Quét thử bảng kê Shopee Xpress SPX (65 đơn)"
                >
                  <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-black shadow-2xs">
                    SP
                  </span>
                  <span className="font-black tracking-tight text-slate-900">SPX Shopee</span>
                  <span className="text-[10px] text-sky-700 font-mono font-bold">65 đơn</span>
                </button>

                {/* 5. TikTok Shop */}
                <button
                  type="button"
                  onClick={() => handleSelectSampleCarrier('TIKTOK')}
                  className="p-3 rounded-2xl bg-purple-50/80 hover:bg-purple-100 border border-purple-200/90 hover:border-purple-300 text-purple-950 font-bold text-xs flex flex-col items-center gap-1 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-2xs group"
                  title="Quét thử bảng kê TikTok Shop (60 đơn)"
                >
                  <span className="w-6 h-6 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px] font-black shadow-2xs">
                    TK
                  </span>
                  <span className="font-black tracking-tight text-slate-900">TikTok Shop</span>
                  <span className="text-[10px] text-purple-700 font-mono font-bold">60 đơn</span>
                </button>

                {/* 6. Chuẩn 100% */}
                <button
                  type="button"
                  onClick={() => handleSelectSampleCarrier('CLEAN_100')}
                  className="p-3 rounded-2xl bg-teal-50/80 hover:bg-teal-100 border border-teal-200/90 hover:border-teal-300 text-teal-950 font-bold text-xs flex flex-col items-center gap-1 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-2xs group"
                  title="Quét thử bảng kê đối soát chuẩn 100% không lệch đồng nào"
                >
                  <span className="text-lg">🏆</span>
                  <span className="font-black tracking-tight text-teal-950">Chuẩn 100%</span>
                  <span className="text-[10px] text-teal-700 font-mono font-bold">0 đơn lỗi</span>
                </button>

                {/* 7. Full 300 Đơn */}
                <button
                  type="button"
                  onClick={() => handleSelectSampleCarrier('ALL_300')}
                  className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex flex-col items-center gap-1 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-md shadow-indigo-500/20 group"
                  title="Quét thử bảng kê lớn 300 đơn đa hãng thực tế"
                >
                  <span className="text-lg">⚡</span>
                  <span className="font-black tracking-tight text-white">Full 300 Đơn</span>
                  <span className="text-[10px] text-indigo-100 font-mono font-bold">Đa hãng</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
