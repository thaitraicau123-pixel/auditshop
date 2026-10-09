import React from 'react';
import { Lock, Unlock, Download, Mail, ExternalLink, ShieldCheck, AlertCircle, Copy, Check } from 'lucide-react';
import { exportDisputeExcel } from '../utils/exportDispute';

export default function DisputeTable({ anomalies, isUnlocked, onUnlockClick, onOpenTemplateModal, shopName }) {
  const [copiedId, setCopiedId] = React.useState(null);

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportExcel = () => {
    exportDisputeExcel(anomalies, shopName || "Shop_Online");
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
                : "3 đơn đầu tiên hiển thị miễn phí làm bằng chứng. Các đơn còn lại đang được bảo mật."}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isUnlocked ? (
              <>
                <button
                  onClick={onOpenTemplateModal}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all cursor-pointer border border-slate-200"
                >
                  <Mail className="w-4 h-4 text-amber-600" />
                  <span>Mẫu thư khiếu nại CSKH</span>
                </button>

                <button
                  onClick={handleExportExcel}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Xuất file Excel khiếu nại (.xlsx)</span>
                </button>
              </>
            ) : (
              <button
                onClick={onUnlockClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Mở khóa tất cả mã đơn & Tải file khiếu nại</span>
              </button>
            )}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto relative">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">STT</th>
                <th className="py-3.5 px-4">Mã Vận Đơn</th>
                <th className="py-3.5 px-4">Đơn Vị VC</th>
                <th className="py-3.5 px-4">Trọng Lượng (Shop / Hãng)</th>
                <th className="py-3.5 px-4">Tiền Thất Thoát</th>
                <th className="py-3.5 px-4">Lý Do / Chi Tiết Bất Thường</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {anomalies.map((item, index) => {
                const isItemLocked = !isUnlocked && item.isLocked;

                return (
                  <tr 
                    key={item.id + index}
                    className={`transition-colors ${
                      isItemLocked 
                        ? 'bg-slate-50/50 select-none' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      #{index + 1}
                    </td>

                    {/* Mã vận đơn */}
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {isItemLocked ? (
                        <div className="flex items-center gap-2">
                          <span className="blur-xs text-slate-400 filter select-none tracking-widest">
                            {item.carrier.slice(0, 3)}-99******
                          </span>
                          <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        </div>
                      ) : (
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
                      )}
                    </td>

                    {/* Hãng */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200">
                        {item.carrier}
                      </span>
                    </td>

                    {/* Trọng lượng */}
                    <td className="py-3.5 px-4 font-mono">
                      {isItemLocked ? (
                        <span className="blur-xs filter text-slate-400">•••g / •••g</span>
                      ) : (
                        <div className="text-xs">
                          <span className="text-slate-500">{item.shopWeight}g</span>
                          <span className="text-slate-400 mx-1">→</span>
                          <span className={`font-bold ${item.billedWeight > item.shopWeight ? 'text-amber-600' : 'text-slate-700'}`}>
                            {item.billedWeight}g
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Số tiền thất thoát */}
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                      +{item.leakAmount.toLocaleString('vi-VN')} đ
                    </td>

                    {/* Lý do chi tiết */}
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      {isItemLocked ? (
                        <div className="flex items-center gap-2">
                          <span className="blur-xs filter text-slate-400 select-none">
                            Phát hiện hãng kê khống nấc cước hoặc ngâm đơn hoàn không hoàn tất bồi thường...
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-600 leading-snug">
                          {item.issueDetail}
                        </p>
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
              })}
            </tbody>
          </table>
        </div>

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
