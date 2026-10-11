import React, { useState, useMemo } from 'react';
import { 
  Lock, Unlock, Download, Mail, ExternalLink, ShieldCheck, AlertCircle, 
  Copy, Check, Search, ArrowUpDown, ChevronLeft, ChevronRight, Filter, Layers, ListFilter, Coffee
} from 'lucide-react';
import { exportDisputeExcel } from '../utils/exportDispute';

export default function DisputeTable({ anomalies, isUnlocked, onUnlockClick, onOpenTemplateModal, shopName, onOpenCoffeeModal }) {
  const [copiedId, setCopiedId] = useState(null);
  const [copiedBatch, setCopiedBatch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('LEAKAGE_DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportExcel = () => {
    exportDisputeExcel(anomalies, shopName || "Shop_Online");
    // Điểm rơi 1: Nhẹ nhàng gợi ý mời cà phê sau khi đã tải xong file khiếu nại 1.2 giây
    setTimeout(() => {
      if (onOpenCoffeeModal) {
        onOpenCoffeeModal(
          "🎉 File Excel khiếu nại đã tải về máy thành công! Chúc shop đòi lại trọn vẹn số tiền thất thoát. Nếu công cụ này giúp ích cho bạn, hãy mời dev một ly cà phê nhé!"
        );
      }
    }, 1200);
  };

  // Lấy danh sách các hãng duy nhất
  const uniqueCarriers = useMemo(() => {
    const set = new Set();
    anomalies.forEach(a => { if (a.carrier) set.add(a.carrier); });
    return Array.from(set);
  }, [anomalies]);

  // Lọc và sắp xếp
  const filteredAnomalies = useMemo(() => {
    let list = [...anomalies];

    if (carrierFilter !== 'ALL') {
      list = list.filter(a => a.carrier === carrierFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(a => 
        (a.id && a.id.toLowerCase().includes(q)) ||
        (a.customer && a.customer.toLowerCase().includes(q)) ||
        (a.issueDetail && a.issueDetail.toLowerCase().includes(q)) ||
        (a.excelCell && a.excelCell.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'LEAKAGE_DESC') {
      list.sort((a, b) => (b.leakAmount || 0) - (a.leakAmount || 0));
    } else if (sortBy === 'LEAKAGE_ASC') {
      list.sort((a, b) => (a.leakAmount || 0) - (b.leakAmount || 0));
    } else if (sortBy === 'ROW_ASC') {
      list.sort((a, b) => (a.excelRow || 0) - (b.excelRow || 0));
    }

    return list;
  }, [anomalies, carrierFilter, searchTerm, sortBy]);

  // Reset page khi filter đổi
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, carrierFilter, sortBy]);

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(filteredAnomalies.length / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAnomalies.slice(start, start + pageSize);
  }, [filteredAnomalies, currentPage, pageSize]);

  const handleBatchCopy = () => {
    if (!isUnlocked) {
      onUnlockClick();
      return;
    }
    const ids = filteredAnomalies.map(a => a.id).join('\n');
    navigator.clipboard.writeText(ids);
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 2500);
  };

  return (
    <div id="dispute-section" className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
        {/* Table header & actions bar */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Danh sách đơn hàng phát hiện bất thường</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold border border-rose-200">
                {anomalies.length} đơn
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isUnlocked 
                ? "✅ Toàn bộ mã đơn đã được mở khóa. Bạn có thể xuất file Excel khiếu nại ngay." 
                : "🔒 Chi tiết mã vận đơn và lý do thất thoát đang được bảo mật. Mở khóa gói cước để xem toàn bộ và tải file Excel khiếu nại."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {isUnlocked ? (
              <>
                <button
                  type="button"
                  onClick={handleBatchCopy}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer border border-slate-200 shadow-2xs group"
                  title="Sao chép toàn bộ mã đơn đang hiển thị vào Clipboard để gửi bưu cục"
                >
                  <span className="text-xs group-hover:animate-pet-wag">🐶</span>
                  {copiedBatch ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-indigo-600" />}
                  <span>{copiedBatch ? "Đã chép mã!" : "Chép tất cả mã"}</span>
                </button>

                <button
                  onClick={onOpenTemplateModal}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all cursor-pointer border border-slate-200 group"
                >
                  <span className="text-xs group-hover:animate-pet-bounce">🐱</span>
                  <Mail className="w-4 h-4 text-amber-600" />
                  <span>Mẫu thư khiếu nại CSKH</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenCoffeeModal?.("🎉 Cảm ơn shop đã tin dùng SoatDon! Mời dev một ly cà phê muối tiếp sức duy trì máy chủ nhé ☕")}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all cursor-pointer border border-amber-200 shadow-2xs group"
                  title="Mời đội ngũ phát triển một ly cà phê tiếp sức"
                >
                  <span className="text-xs group-hover:animate-pet-bounce">🐱☕</span>
                  <span>Mời cà phê</span>
                </button>

                <button
                  onClick={handleExportExcel}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all transform hover:scale-105 active:scale-95 cursor-pointer group"
                >
                  <span className="text-xs group-hover:animate-bounce">🐶</span>
                  <Download className="w-4 h-4" />
                  <span>Xuất file Excel (.xlsx)</span>
                </button>
              </>
            ) : (
              <button
                onClick={onUnlockClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all transform hover:scale-105 active:scale-95 cursor-pointer group"
              >
                <span className="text-base group-hover:animate-pet-wag">🐶🔑</span>
                <span>Mở khóa tất cả mã đơn & Tải file khiếu nại</span>
              </button>
            )}
          </div>
        </div>

        {/* Banner Mời cà phê nhẹ nhàng khi đã mở khóa */}
        {isUnlocked && (
          <div className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 border-b border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <span className="text-base animate-pet-wag">🐶</span>
              <span className="text-base animate-pet-bounce">🐱</span>
              <span>
                Cún & Mèo vừa giúp shop bóc tách toàn bộ đơn sai lệch. Nếu thấy web hữu ích, bạn có thể <b>mời dev 1 ly cà phê muối 25k</b> để tiếp sức duy trì máy chủ nhé!
              </span>
            </div>
            <button
              onClick={() => onOpenCoffeeModal?.("Ủng hộ duy trì máy chủ AI SoatDon.vn")}
              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shrink-0 transition-colors cursor-pointer shadow-2xs flex items-center gap-1 group"
            >
              <span className="text-xs group-hover:animate-pet-bounce">🐱☕</span>
              <span>Mời 1 ly 25k</span>
            </button>
          </div>
        )}

        {/* Toolbar: Search, Carrier Filter, Sort Controls */}
        <div className="p-3 sm:px-6 bg-white border-b border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          {/* Live Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm nhanh mã đơn, tên khách, ô Excel (vd: E14)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-800 text-xs"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter by carrier pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1 hidden lg:inline">Hãng:</span>
            <button
              onClick={() => setCarrierFilter('ALL')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                carrierFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({anomalies.length})
            </button>
            {uniqueCarriers.map(c => {
              const count = anomalies.filter(a => a.carrier === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setCarrierFilter(c)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                    carrierFilter === c
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c} ({count})
                </button>
              );
            })}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Xếp theo:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="LEAKAGE_DESC">💰 Tiền mất nhiều nhất ⬇️</option>
              <option value="LEAKAGE_ASC">💵 Tiền mất ít nhất ⬆️</option>
              <option value="ROW_ASC">📍 Thứ tự dòng Excel</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto relative">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">STT</th>
                <th className="py-3.5 px-4">Mã Vận Đơn</th>
                <th className="py-3.5 px-4">Kênh Bán / ĐVVC</th>
                <th className="py-3.5 px-4">Trọng Lượng / Khách</th>
                <th className="py-3.5 px-4">Tiền Thất Thoát</th>
                <th className="py-3.5 px-4">Lý Do / Chi Tiết Bất Thường</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                        <Search className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-700">Không tìm thấy đơn hàng nào khớp với bộ lọc</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Thử xóa từ khóa tìm kiếm hoặc chọn xem "Tất cả" hãng vận chuyển
                      </p>
                      {(searchTerm || carrierFilter !== 'ALL') && (
                        <button
                          onClick={() => { setSearchTerm(''); setCarrierFilter('ALL'); }}
                          className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-semibold text-xs hover:bg-indigo-100 transition-colors"
                        >
                          Xóa bộ lọc
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedList.map((item, index) => {
                  const itemIndex = (currentPage - 1) * pageSize + index;
                  const isItemLocked = !isUnlocked;

                  return (
                    <tr 
                      key={item.id + itemIndex}
                      className={`transition-colors ${
                        isItemLocked 
                          ? 'bg-slate-50/50 select-none' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        #{itemIndex + 1}
                      </td>

                      {/* Mã vận đơn & Tọa độ ô Excel */}
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {isItemLocked ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="blur-xs text-slate-400 filter select-none tracking-widest">
                                {item.carrier.slice(0, 3)}-99******
                              </span>
                              <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            </div>
                            {item.excelRow && (
                              <span className="text-[10px] text-slate-400 font-sans mt-0.5 inline-block">
                                📍 Dòng {item.excelRow}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-1.5 text-indigo-700">
                              <span>{item.id}</span>
                              <button 
                                onClick={() => handleCopy(item.id)}
                                className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
                                title="Sao chép mã đơn"
                              >
                                {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                            {item.excelCell && (
                              <div className="mt-1 flex items-center gap-1">
                                <span 
                                  onClick={() => handleCopy(item.excelCell)}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-mono cursor-pointer transition-colors"
                                  title="Bấm để sao chép ô Excel (Mở Excel bấm Ctrl+G để nhảy tới ô này)"
                                >
                                  📍 Ô: {item.excelCell}
                                </span>
                                <span className="text-[10px] text-slate-400 font-sans">
                                  (Dòng {item.excelRow})
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Hãng */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200">
                          {item.carrier}
                        </span>
                      </td>

                      {/* Trọng lượng / Khách hàng & Địa chỉ */}
                      <td className="py-3.5 px-4">
                        {isItemLocked ? (
                          <span className="blur-xs filter text-slate-400">•••g / •••g</span>
                        ) : (
                          <div>
                            <div className="text-xs text-slate-800 font-medium">
                              {item.customer || 'Khách lẻ'}
                            </div>
                            {item.customerAddress && item.customerAddress !== 'Toàn quốc' && (
                              <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                                <span>📍</span>
                                <span className="truncate max-w-[130px]">{item.customerAddress}</span>
                              </div>
                            )}
                            {item.hasWeightCol && (
                              <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                                <span>{item.shopWeight}g</span>
                                <span className="text-slate-400 mx-1">→</span>
                                <span className={`font-bold ${item.billedWeight > item.shopWeight ? 'text-amber-600' : 'text-slate-700'}`}>
                                  {item.billedWeight}g
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Số tiền thất thoát */}
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                        +{item.leakAmount.toLocaleString('vi-VN')} đ
                      </td>

                      {/* Lý do chi tiết & Vị trí kiểm tra */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                        {isItemLocked ? (
                          <div className="flex items-center gap-2">
                            <span className="blur-xs filter text-slate-400 select-none">
                              Phát hiện hãng kê khống nấc cước hoặc ngâm đơn hoàn không hoàn tất bồi thường...
                            </span>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs text-slate-700 leading-snug">
                              {item.issueDetail}
                            </p>
                            {item.excelCell && (
                              <p className="text-[11px] text-indigo-600 font-medium mt-1 flex items-center gap-1">
                                <span>🔍 Kiểm tra trên Excel:</span>
                                <code className="bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200 text-indigo-700 text-[10px]">
                                  {item.excelLocation || `Ô ${item.excelCell}`}
                                </code>
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Action / Lock badge */}
                      <td className="py-3.5 px-4 text-center">
                        {isItemLocked ? (
                          <button
                            onClick={onUnlockClick}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Mở khóa</span>
                          </button>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold inline-flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Đã mở</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls Bar */}
        {filteredAnomalies.length > 0 && (
          <div className="p-4 px-6 bg-slate-50 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 font-medium">
              Hiển thị <span className="font-bold text-slate-800">{(currentPage - 1) * pageSize + 1}</span> - <span className="font-bold text-slate-800">{Math.min(currentPage * pageSize, filteredAnomalies.length)}</span> trong số <span className="font-bold text-indigo-600">{filteredAnomalies.length}</span> đơn phát hiện bất thường
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Trước</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-7 h-7 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 || 
                      pageNum === currentPage + 2
                    ) {
                      return <span key={pageNum} className="text-slate-400 px-0.5">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-all"
                >
                  <span className="hidden sm:inline">Sau</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Lock overlay banner for non-unlocked state */}
        {!isUnlocked && anomalies.length > 3 && (
          <div className="p-8 bg-slate-50/90 border-t border-slate-200 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-1.5">
                Còn {anomalies.length - 3} đơn thất thoát khác đang được bảo vệ
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 mb-5">
                Mở khóa ngay để nhận danh sách đầy đủ toàn bộ mã vận đơn và tải biên bản khiếu nại định dạng Excel chuẩn để gửi bưu cục đòi bồi thường.
              </p>
              <button
                onClick={onUnlockClick}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-600/20 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                Mở khóa ngay chỉ từ 9.000 đ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
