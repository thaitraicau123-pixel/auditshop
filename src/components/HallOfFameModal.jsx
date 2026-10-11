import React, { useState, useEffect } from 'react';
import { 
  X, Trophy, Award, Coffee, Crown, Search, Heart, Sparkles
} from 'lucide-react';
import { getHallOfFameList } from '../utils/petGameEngine';

export default function HallOfFameModal({ 
  isOpen, 
  onClose, 
  onOpenCoffeeModal 
}) {
  const [hallOfFame, setHallOfFame] = useState(() => getHallOfFameList());
  const [rankFilter, setRankFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Đồng bộ khi mở modal
  useEffect(() => {
    if (isOpen) {
      setHallOfFame(getHallOfFameList());
    }
  }, [isOpen]);

  // Thoát nhanh bằng phím Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Lọc danh sách
  const filteredHall = hallOfFame.filter(item => {
    const matchRank = rankFilter === 'ALL' || item.rank === rankFilter;
    const matchSearch = !searchTerm.trim() || 
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
      (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    return matchRank && matchSearch;
  });

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fadeIn"
    >
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-xl w-full shadow-2xl relative my-auto max-h-[92vh] flex flex-col text-slate-800 overflow-hidden">
        
        {/* Header Cố Định */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-5 sm:px-6 py-4 bg-white/95 backdrop-blur-md border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight flex items-center gap-2">
                <span>Bảng Vàng Tri Ân Shop</span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  Cộng Đồng
                </span>
              </h3>
              <p className="text-xs text-slate-500">Vinh danh các nhà bán hàng hảo tâm đồng hành cùng SoatDon.vn</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCoffeeModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCoffeeModal("🏆 Tiếp sức cà phê & Ghi danh vào Bảng Vàng Tri Ân!");
                }}
                className="hidden sm:flex text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Mời Cà Phê</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              title="Đóng (Phím Esc)"
              aria-label="Đóng"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Nội dung có thể cuộn */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Banner Giới Thiệu */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/60 to-yellow-50 border border-amber-200 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-amber-950">
                Lời Cảm Ơn Từ Đội Ngũ Phát Triển
              </div>
              <p className="text-xs text-amber-900/80 mt-0.5 leading-relaxed">
                Vinh danh và gửi lời cảm ơn sâu sắc nhất tới các chủ Shop hảo tâm đã chung tay mời ly cà phê tiếp sức duy trì máy chủ AI kiểm toán độc lập!
              </p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { key: 'ALL', label: 'Tất cả' },
                { key: 'DIAMOND', label: '💎 Kim Cương (≥100k)' },
                { key: 'GOLD', label: '🥇 Vàng (50k)' },
                { key: 'SILVER', label: '🥈 Bạc (25k)' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setRankFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    rankFilter === tab.key
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên shop..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Danh sách Nhà Tài Trợ */}
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {hallOfFame.length === 0 ? (
              <div className="text-center py-10 px-4 bg-amber-50/50 rounded-2xl border border-dashed border-amber-200">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xl mx-auto mb-2 shadow-2xs">
                  🌟
                </div>
                <div className="font-extrabold text-slate-800 text-sm mb-1">Chưa có shop nào ghi danh</div>
                <p className="text-slate-500 max-w-sm mx-auto text-[11px] leading-relaxed">
                  Hãy là shop đầu tiên gửi tặng ly cà phê muối để mở bát Bảng Vàng vinh danh nhé!
                </p>
              </div>
            ) : filteredHall.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Chưa tìm thấy shop nào phù hợp với từ khóa "{searchTerm}".
              </div>
            ) : (
              filteredHall.map((donor, idx) => {
                const isDiamond = donor.rank === 'DIAMOND';
                const isGold = donor.rank === 'GOLD';

                return (
                  <div 
                    key={donor.id || idx}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start sm:items-center justify-between gap-3 ${
                      isDiamond
                        ? 'bg-gradient-to-r from-amber-50/80 to-yellow-50/60 border-amber-300 shadow-xs'
                        : isGold
                          ? 'bg-slate-50 border-amber-200'
                          : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${
                        isDiamond
                          ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-white'
                          : isGold
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {idx < 3 ? (idx === 0 ? '🥇' : (idx === 1 ? '🥈' : '🥉')) : '👑'}
                      </div>
                      
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                            {donor.name}
                          </span>
                          {isDiamond && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[9px] font-black uppercase">
                              Kim Cương 💎
                            </span>
                          )}
                          {isGold && (
                            <span className="px-1.5 py-0.2 rounded bg-yellow-100 text-yellow-800 text-[9px] font-black uppercase">
                              Tài Trợ Vàng
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 italic mt-0.5 leading-relaxed">
                          "{donor.note}"
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-black text-amber-700 text-xs sm:text-sm">
                        {Number(donor.amount).toLocaleString('vi-VN')} đ
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(donor.timestamp).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* CTA Ghi Danh */}
          {onOpenCoffeeModal && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-left text-amber-900">
                <b className="block">Shop muốn xuất hiện trên Bảng Vàng Tri Ân?</b>
                <span className="text-[11px] text-amber-800">Chỉ cần ủng hộ từ 1 ly cà phê muối 25k, tên shop sẽ lập tức được vinh danh!</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCoffeeModal("🏆 Tiếp sức cà phê & Ghi danh vào Bảng Vàng Tri Ân!");
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                Mời Cà Phê & Ghi Danh
              </button>
            </div>
          )}

          {/* Nút Quay Lại */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>← Đóng cửa sổ (Esc)</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
