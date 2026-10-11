import React, { useState, useEffect } from 'react';
import { 
  X, MessageSquare, Copy, Check, Scale, Clock, DollarSign, 
  PackageX, Receipt, ShieldAlert, BookOpen, Send, Sparkles, ChevronRight 
} from 'lucide-react';
import { DISPUTE_SCENARIOS } from '../data/disputePlaybook';

export default function DisputePlaybookModal({ isOpen, onClose }) {
  const [selectedScenarioId, setSelectedScenarioId] = useState(DISPUTE_SCENARIOS[0].id);
  const [copiedId, setCopiedId] = useState(null);

  // Thoát nhanh bằng phím Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const activeScenario = DISPUTE_SCENARIOS.find(s => s.id === selectedScenarioId) || DISPUTE_SCENARIOS[0];

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getScenarioIcon = (id) => {
    switch(id) {
      case 'OVERWEIGHT_MACHINE_EXCUSE': return Scale;
      case 'RETURN_EXPIRED_72H': return Clock;
      case 'COD_UNDERPAID_OR_MISSING': return DollarSign;
      case 'DAMAGED_PACKAGING_BLAME': return PackageX;
      case 'HIDDEN_REMOTE_SURCHARGES': return Receipt;
      case 'RETURN_PARCEL_SWAPPED': return ShieldAlert;
      default: return MessageSquare;
    }
  };

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
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base md:text-lg tracking-wide truncate">
                  Playbook Kịch Bản Đàm Phán Zalo &amp; Hotline Bưu Cục
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                  CHUẨN LUẬT BƯU CHÍNH
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate hidden sm:block">
                Bộ mẫu tin nhắn Zalo cứng rắn, dẫn luật chính xác để đối phó các bài thoái thác bồi thường
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 transition-colors flex items-center justify-center cursor-pointer shrink-0 shadow-xs"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thân Modal 2 Cột */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/60">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Cột Trái: Danh Sách 6 Tình Huống */}
            <div className="lg:col-span-5 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                Chọn tình huống tranh chấp:
              </span>

              {DISPUTE_SCENARIOS.map((sc, idx) => {
                const isSelected = sc.id === selectedScenarioId;
                const Icon = getScenarioIcon(sc.id);

                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setSelectedScenarioId(sc.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white hover:bg-slate-100/80 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-indigo-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs font-extrabold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {idx + 1}. {sc.title.split(':')[0]}
                        </div>
                        <div className={`text-[11px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {sc.trapSummary}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>

            {/* Cột Phải: Lập Luận Phản Biện & Template Mẫu Tin Nhắn Zalo */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
              
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black uppercase">
                  TÌNH HUỐNG CHI TIẾT
                </span>
                <h4 className="font-extrabold text-slate-900 text-base sm:text-lg mt-1 mb-2">
                  {activeScenario.title}
                </h4>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                  <b>Chiêu thoái thác của bưu cục:</b> {activeScenario.trapSummary}
                </div>
              </div>

              {/* Căn cứ pháp lý & Lập luận phản biện */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950">
                  <span className="font-bold flex items-center gap-1.5 mb-1 text-amber-900">
                    <Scale className="w-3.5 h-3.5 text-amber-700" />
                    <span>Căn cứ pháp lý:</span>
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    {activeScenario.legalCitation}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950">
                  <span className="font-bold flex items-center gap-1.5 mb-1 text-emerald-900">
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Đòn phản biện:</span>
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    {activeScenario.counterArgument}
                  </p>
                </div>
              </div>

              {/* Mẫu Tin Nhắn Zalo Chuẩn */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <Send className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Mẫu tin nhắn Zalo gửi CSKH / Trưởng bưu cục:</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(activeScenario.zaloTemplate, activeScenario.id)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedId === activeScenario.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã Sao Chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao Chép Mẫu Zalo</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  readOnly
                  rows={9}
                  value={activeScenario.zaloTemplate}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 leading-relaxed focus:outline-none select-all"
                />
              </div>

            </div>

          </div>
        </div>

        {/* Footer Cố Định */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Biên soạn dựa trên Luật Bưu chính 2010 &amp; Nghị định 47/2011/NĐ-CP</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            Đóng Cửa Sổ (Esc)
          </button>
        </div>

      </div>
    </div>
  );
}
