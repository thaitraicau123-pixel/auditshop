import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ArrowLeftRight, FileSpreadsheet, Upload, CheckCircle2, 
  AlertTriangle, Download, RefreshCw, Zap, ShieldAlert, Scale, DollarSign, 
  PackageX, Eye, ArrowRight, Sparkles 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import { 
  parseSheetToRecords, 
  reconcileShopVsCarrier, 
  generateDemoCrossReconcileDatasets, 
  exportCrossReconcileExcel 
} from '../utils/crossReconcileEngine';

export default function CrossReconcileModal({ isOpen, onClose }) {
  const [shopFile, setShopFile] = useState(null);
  const [carrierFile, setCarrierFile] = useState(null);
  const [shopRecords, setShopRecords] = useState([]);
  const [carrierRecords, setCarrierRecords] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reconcileResults, setReconcileResults] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, MISSING_CARRIER, WEIGHT, COD, MISSING_SHOP
  const [isDemoMode, setIsDemoMode] = useState(false);

  const shopInputRef = useRef(null);
  const carrierInputRef = useRef(null);

  // Thoát nhanh bằng phím Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Xử lý đọc file Excel
  const readFileAsArray = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          resolve(json);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUploadShopFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShopFile(file);
    try {
      const sheetData = await readFileAsArray(file);
      const records = parseSheetToRecords(sheetData, 'shop');
      setShopRecords(records);
    } catch (err) {
      alert('Không thể đọc file shop: ' + err.message);
    }
  };

  const handleUploadCarrierFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCarrierFile(file);
    try {
      const sheetData = await readFileAsArray(file);
      const records = parseSheetToRecords(sheetData, 'carrier');
      setCarrierRecords(records);
    } catch (err) {
      alert('Không thể đọc file bưu cục: ' + err.message);
    }
  };

  // Nạp 2 file mẫu Demo để trải nghiệm ngay lập tức
  const handleLoadDemoFiles = () => {
    setIsDemoMode(true);
    const { shopData, carrierData } = generateDemoCrossReconcileDatasets();
    const sRecords = parseSheetToRecords(shopData, 'shop');
    const cRecords = parseSheetToRecords(carrierData, 'carrier');

    setShopFile({ name: 'Demo_KiotViet_XuatKho_T10.xlsx' });
    setCarrierFile({ name: 'Demo_GHTK_BangKe_DoiSoat.xlsx' });
    setShopRecords(sRecords);
    setCarrierRecords(cRecords);

    // Tự động phân tích luôn
    const results = reconcileShopVsCarrier(sRecords, cRecords);
    setReconcileResults(results);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Kích hoạt so khớp 2 file
  const handleStartReconciliation = () => {
    if (shopRecords.length === 0 || carrierRecords.length === 0) {
      alert('Vui lòng tải lên cả 2 file để hệ thống bắt đầu so khớp 2 chiều!');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      const results = reconcileShopVsCarrier(shopRecords, carrierRecords);
      setReconcileResults(results);
      setIsProcessing(false);

      if (results.anomalies.length > 0) {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }, 600);
  };

  const handleReset = () => {
    setShopFile(null);
    setCarrierFile(null);
    setShopRecords([]);
    setCarrierRecords([]);
    setReconcileResults(null);
    setIsDemoMode(false);
  };

  // Lọc danh sách bất thường
  const filteredAnomalies = reconcileResults?.anomalies.filter(ano => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'MISSING_CARRIER') return ano.issueType === 'MISSING_IN_CARRIER';
    if (activeFilter === 'WEIGHT') return ano.issueType === 'DISCREPANCY_WEIGHT';
    if (activeFilter === 'COD') return ano.issueType === 'DISCREPANCY_COD';
    if (activeFilter === 'MISSING_SHOP') return ano.issueType === 'MISSING_IN_SHOP';
    return true;
  }) || [];

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 md:p-6 flex items-start justify-center animate-fade-in font-sans"
    >
      <div className="bg-white border border-slate-200/90 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] relative text-slate-800">
        
        {/* Header Cố Định */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0 mr-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base md:text-lg tracking-wide truncate">
                  So Khớp 2 Chiều: File Kho Shop vs File Bưu Cục
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                  2-WAY MATCH
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate hidden sm:block">
                Tự động bắt lỗi: Bưu cục đội nấc cân so với kho, nuốt tiền COD, hoặc tính cước đơn shop lạ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 transition-colors flex items-center justify-center cursor-pointer shrink-0 shadow-xs"
            title="Đóng cửa sổ (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thân Modal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/60 space-y-6">
          
          {/* Vùng tải 2 File song song */}
          {!reconcileResults && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Cột 1: File Shop */}
                <div className={`p-5 rounded-2xl border-2 transition-all ${
                  shopRecords.length > 0 
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs' 
                    : 'bg-white border-dashed border-slate-300 hover:border-indigo-400'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-black">
                      FILE 1: KHO SHOP
                    </span>
                    {shopRecords.length > 0 && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã nạp {shopRecords.length} đơn</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-sm mb-1">
                    File Xuất Kho / Quản Lý Bán Hàng
                  </h4>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Xuất từ KiotViet, Sapo, Pancake, Haravan, PosCake hoặc Excel nội bộ shop lưu cân nặng & COD.
                  </p>

                  <input 
                    type="file" 
                    ref={shopInputRef}
                    accept=".xlsx, .xls, .csv" 
                    onChange={handleUploadShopFile} 
                    className="hidden" 
                  />

                  {shopRecords.length > 0 ? (
                    <div className="p-3 rounded-xl bg-white border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-xs text-slate-800 truncate">{shopFile?.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setShopFile(null); setShopRecords([]); }}
                        className="text-xs text-rose-600 hover:underline font-semibold shrink-0 cursor-pointer"
                      >
                        Đổi file
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => shopInputRef.current?.click()}
                      className="w-full py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 border border-indigo-200"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Chọn file xuất kho shop (.xlsx, .csv)</span>
                    </button>
                  )}
                </div>

                {/* Cột 2: File Bưu Cục */}
                <div className={`p-5 rounded-2xl border-2 transition-all ${
                  carrierRecords.length > 0 
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs' 
                    : 'bg-white border-dashed border-slate-300 hover:border-indigo-400'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-black">
                      FILE 2: BƯU CỤC
                    </span>
                    {carrierRecords.length > 0 && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã nạp {carrierRecords.length} đơn</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-sm mb-1">
                    File Bảng Kê Đối Soát Bưu Cục
                  </h4>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Tải về từ GHTK, GHN, Viettel Post, Shopee Xpress, J&T, TikTok Shop Logistics.
                  </p>

                  <input 
                    type="file" 
                    ref={carrierInputRef}
                    accept=".xlsx, .xls, .csv" 
                    onChange={handleUploadCarrierFile} 
                    className="hidden" 
                  />

                  {carrierRecords.length > 0 ? (
                    <div className="p-3 rounded-xl bg-white border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-xs text-slate-800 truncate">{carrierFile?.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setCarrierFile(null); setCarrierRecords([]); }}
                        className="text-xs text-rose-600 hover:underline font-semibold shrink-0 cursor-pointer"
                      >
                        Đổi file
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => carrierInputRef.current?.click()}
                      className="w-full py-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-800 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 border border-amber-200"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Chọn file đối soát bưu cục (.xlsx, .csv)</span>
                    </button>
                  )}
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleLoadDemoFiles}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>⚡ Nạp 2 File Mẫu Demo Thử Nghiệm Ngay</span>
                </button>

                <button
                  type="button"
                  disabled={shopRecords.length === 0 || carrierRecords.length === 0 || isProcessing}
                  onClick={handleStartReconciliation}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang Khớp Mã 2 Chiều...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Bắt Đầu So Khớp 2 Chiều ({shopRecords.length} vs {carrierRecords.length} đơn)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Kết quả sau khi So Khớp */}
          {reconcileResults && (
            <div className="space-y-6">
              
              {/* Header Kết Quả */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-black uppercase">
                      ĐỐI SOÁT HOÀN TẤT
                    </span>
                    {isDemoMode && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-900 text-[10px] font-bold">
                        Dữ Liệu Demo Mô Phỏng
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-base sm:text-lg">
                    Phát hiện thất thoát: <span className="text-rose-400 font-mono">{reconcileResults.summary.totalLoss.toLocaleString('vi-VN')} đ</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Khớp thành công {reconcileResults.matchedCount} đơn • Phát hiện {reconcileResults.anomalies.length} đơn có sai lệch chéo
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => exportCrossReconcileExcel(reconcileResults)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất File Excel Khiếu Nại (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Kiểm tra file khác
                  </button>
                </div>
              </div>

              {/* 4 Thẻ Phân Loại Tổn Thất */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div 
                  onClick={() => setActiveFilter('MISSING_CARRIER')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeFilter === 'MISSING_CARRIER' ? 'ring-2 ring-rose-500 bg-rose-50/70 border-rose-300' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Bưu cục chưa kê</span>
                    <PackageX className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <div className="text-lg font-black text-rose-700 font-mono">
                    {reconcileResults.summary.missingInCarrierCount} đơn
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    Thất thoát: {reconcileResults.summary.missingInCarrierLoss.toLocaleString('vi-VN')} đ
                  </div>
                </div>

                <div 
                  onClick={() => setActiveFilter('WEIGHT')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeFilter === 'WEIGHT' ? 'ring-2 ring-indigo-500 bg-indigo-50/70 border-indigo-300' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Bưu cục đội cân</span>
                    <Scale className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="text-lg font-black text-indigo-700 font-mono">
                    {reconcileResults.summary.weightDiscrepancyCount} đơn
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    Lố cước: +{reconcileResults.summary.weightDiscrepancyLoss.toLocaleString('vi-VN')} đ
                  </div>
                </div>

                <div 
                  onClick={() => setActiveFilter('COD')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeFilter === 'COD' ? 'ring-2 ring-amber-500 bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Thiếu tiền COD</span>
                    <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="text-lg font-black text-amber-700 font-mono">
                    {reconcileResults.summary.codDiscrepancyCount} đơn
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    Thiếu: -{reconcileResults.summary.codDiscrepancyLoss.toLocaleString('vi-VN')} đ
                  </div>
                </div>

                <div 
                  onClick={() => setActiveFilter('MISSING_SHOP')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeFilter === 'MISSING_SHOP' ? 'ring-2 ring-purple-500 bg-purple-50/70 border-purple-300' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Trừ nhầm đơn lạ</span>
                    <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <div className="text-lg font-black text-purple-700 font-mono">
                    {reconcileResults.summary.missingInShopCount} đơn
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    Cước oan bị trừ
                  </div>
                </div>
              </div>

              {/* Bảng Chi Tiết So Khớp Từng Đơn */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-3 sm:p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    <button
                      type="button"
                      onClick={() => setActiveFilter('ALL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Tất cả ({reconcileResults.anomalies.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFilter('MISSING_CARRIER')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeFilter === 'MISSING_CARRIER' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      Bưu cục chưa kê ({reconcileResults.summary.missingInCarrierCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFilter('WEIGHT')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeFilter === 'WEIGHT' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      }`}
                    >
                      Đội nấc cân ({reconcileResults.summary.weightDiscrepancyCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFilter('COD')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeFilter === 'COD' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      Lệch COD ({reconcileResults.summary.codDiscrepancyCount})
                    </button>
                  </div>

                  <span className="text-xs text-slate-400">
                    Hiển thị {filteredAnomalies.length} kết quả
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px]">
                      <tr>
                        <th className="py-3 px-3.5">Mã Vận Đơn</th>
                        <th className="py-3 px-3.5">Phân Loại Lỗi</th>
                        <th className="py-3 px-3.5">Kho Shop Cài Đặt</th>
                        <th className="py-3 px-3.5">Bưu Cục Ghi Nhận</th>
                        <th className="py-3 px-3.5">Mức Thiệt Hại</th>
                        <th className="py-3 px-3.5">Hướng Xử Lý Khiếu Nại</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAnomalies.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                            Không có đơn nào thuộc nhóm lọc này.
                          </td>
                        </tr>
                      ) : (
                        filteredAnomalies.map((ano) => (
                          <tr key={ano.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3.5 font-mono font-bold text-indigo-700">
                              {ano.trackingCode}
                            </td>
                            <td className="py-3 px-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ano.issueType === 'MISSING_IN_CARRIER' ? 'bg-rose-100 text-rose-700' :
                                ano.issueType === 'DISCREPANCY_WEIGHT' ? 'bg-indigo-100 text-indigo-700' :
                                ano.issueType === 'DISCREPANCY_COD' ? 'bg-amber-100 text-amber-800' :
                                'bg-purple-100 text-purple-700'
                              }`}>
                                {ano.issueTitle}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 font-mono text-slate-700">
                              {ano.shopData ? (
                                <div>
                                  {ano.shopData.weight > 0 && <div>Cân: <b>{ano.shopData.weight}g</b></div>}
                                  {ano.shopData.cod > 0 && <div>COD: <b>{ano.shopData.cod.toLocaleString('vi-VN')} đ</b></div>}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Không có trong kho</span>
                              )}
                            </td>
                            <td className="py-3 px-3.5 font-mono text-slate-700">
                              {ano.carrierData ? (
                                <div>
                                  {ano.carrierData.weight > 0 && <div>Cân: <b className="text-rose-600">{ano.carrierData.weight}g</b></div>}
                                  {ano.carrierData.cod !== undefined && <div>COD: <b>{ano.carrierData.cod.toLocaleString('vi-VN')} đ</b></div>}
                                </div>
                              ) : (
                                <span className="text-rose-600 font-bold italic">Chưa lên bảng kê</span>
                              )}
                            </td>
                            <td className="py-3 px-3.5 font-mono font-black text-rose-600">
                              {ano.leakAmount > 0 ? `-${ano.leakAmount.toLocaleString('vi-VN')} đ` : 'Cần truy vết'}
                            </td>
                            <td className="py-3 px-3.5 text-slate-600 max-w-xs text-[11px] leading-relaxed">
                              {ano.actionRecommendation}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Cố Định */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>Thuật toán khớp 2 chiều tự động nhận diện mã vận đơn &amp; nấc cân</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            ← Đóng Cửa Sổ (Esc)
          </button>
        </div>

      </div>
    </div>
  );
}
