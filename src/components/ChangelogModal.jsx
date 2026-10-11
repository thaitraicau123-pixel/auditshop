import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  Rocket, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  ArrowRight,
  History
} from 'lucide-react';
import { CURRENT_SYSTEM_VERSION, CHANGELOG_HISTORY } from '../data/changelog';

export default function ChangelogModal({ isOpen, onClose, isAutoOpen = false }) {
  const [selectedVersion, setSelectedVersion] = useState(CURRENT_SYSTEM_VERSION);
  const [activeTab, setActiveTab] = useState('LATEST'); // 'LATEST' | 'HISTORY'

  if (!isOpen) return null;

  const currentUpdate = CHANGELOG_HISTORY.find(c => c.version === CURRENT_SYSTEM_VERSION) || CHANGELOG_HISTORY[0];
  const activeUpdate = CHANGELOG_HISTORY.find(c => c.version === selectedVersion) || currentUpdate;

  const handleDismiss = () => {
    localStorage.setItem('soatdon_last_seen_version', CURRENT_SYSTEM_VERSION);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-wide text-white">
                  Nhật Ký Cập Nhật Hệ Thống
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                  {CURRENT_SYSTEM_VERSION} MỚI NHẤT
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Thời gian phát hành: <strong>{currentUpdate.releaseDate}</strong></span>
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer relative z-10"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Bản mới nhất vs Toàn bộ lịch sử */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('LATEST'); setSelectedVersion(CURRENT_SYSTEM_VERSION); }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'LATEST'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              🎉 Bản Cập Nhật Hiện Tại ({CURRENT_SYSTEM_VERSION})
            </button>
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'HISTORY'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Xem Lịch Sử Các Bản Trước</span>
            </button>
          </div>

          {isAutoOpen && (
            <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 hidden sm:inline-block">
              ✨ Website vừa được cập nhật tính năng mới!
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {/* History selector if in history tab */}
          {activeTab === 'HISTORY' && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chọn phiên bản:</span>
              {CHANGELOG_HISTORY.map((c) => (
                <button
                  key={c.version}
                  onClick={() => setSelectedVersion(c.version)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedVersion === c.version
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.version} ({c.releaseDate.split(' - ')[0]})
                </button>
              ))}
            </div>
          )}

          {/* Version Header Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-blue-50/50 border border-indigo-100/80">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-mono font-black text-xs">
                  {activeUpdate.version}
                </span>
                <h4 className="font-black text-slate-900 text-base">
                  {activeUpdate.title}
                </h4>
              </div>
              <span className="text-xs text-indigo-700 font-bold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {activeUpdate.releaseDate}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {activeUpdate.summary}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              {activeUpdate.badges?.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full bg-white text-indigo-800 border border-indigo-200/80 text-[10px] font-bold shadow-2xs"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Categorized Features */}
          <div className="space-y-5">
            {activeUpdate.categories.map((cat, cIdx) => (
              <div key={cIdx} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    cat.color === 'emerald' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : cat.color === 'blue'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-purple-100 text-purple-800 border border-purple-200'
                  }`}>
                    {cat.tag}
                  </span>
                  <h5 className="font-extrabold text-sm text-slate-800">
                    {cat.name}
                  </h5>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {cat.items.map((item, iIdx) => (
                    <div 
                      key={iIdx}
                      className="p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-200/70 transition-colors flex items-start gap-3"
                    >
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <h6 className="font-bold text-xs text-slate-900">
                          {item.title}
                        </h6>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-400 hidden sm:block">
            Mọi thắc mắc & đóng góp tính năng xin liên hệ hotline/Zalo Admin: <strong className="text-slate-700">0986.019.623</strong>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleDismiss}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Đã Hiểu & Tiếp Tục Sử Dụng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
